import os
import sys
import time
import json
import random
import string
from datetime import datetime, timedelta

import requests

# ========================
# CONFIG
# ========================

BASE_URL = os.getenv("BASE_URL", "http://localhost:3000").rstrip("/")

ADMIN_PHONE = os.getenv("ADMIN_PHONE")       # e.g. "+2376xxxxxxx"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

AGENT_PHONE = os.getenv("AGENT_PHONE")       # e.g. "+2376yyyyyyy"
AGENT_PASSWORD = os.getenv("AGENT_PASSWORD")

API_PREFIX = "/api/v1"

# ========================
# TEST RUNNER
# ========================

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests = []
        self.context = {}

    def log(self, msg):
        print(msg)

    def run(self, name, func):
        self.log(f"\n=== {name} ===")
        try:
            func(self)
            self.passed += 1
            self.tests.append((name, True, ""))
            self.log(f"[PASS] {name}")
        except AssertionError as e:
            self.failed += 1
            msg = str(e) or "Assertion failed"
            self.tests.append((name, False, msg))
            self.log(f"[FAIL] {name}: {msg}")
        except Exception as e:
            self.failed += 1
            msg = f"Unexpected error: {e}"
            self.tests.append((name, False, msg))
            self.log(f"[ERROR] {name}: {msg}")

    def summary(self):
        print("\n========== TEST SUMMARY ==========")
        for name, ok, msg in self.tests:
            status = "PASS" if ok else "FAIL"
            print(f"{status:4} - {name}" + ("" if ok or not msg else f" -> {msg}"))
        print("==================================")
        print(f"Total: {len(self.tests)}, Passed: {self.passed}, Failed: {self.failed}")
        if self.failed > 0:
            sys.exit(1)


# ========================
# HELPERS
# ========================

def random_phone():
    # Cameroon-style +2376XXXXXXXX
    return "+2376" + "".join(random.choice(string.digits) for _ in range(7))

def random_email():
    return "test_" + "".join(random.choice(string.ascii_lowercase) for _ in range(8)) + "@example.com"

def assert_status(resp, expected, name=""):
    if resp.status_code != expected:
        try:
            body = resp.json()
        except Exception:
            body = resp.text
        raise AssertionError(f"{name} expected {expected}, got {resp.status_code}, body={body}")

def extract_tokens_and_user(data):
    """
    Tries to be flexible with token/user field names.
    """
    if not isinstance(data, dict):
        raise AssertionError("Login response is not a JSON object")

    access = data.get("accessToken") or data.get("access_token") or data.get("token")
    refresh = data.get("refreshToken") or data.get("refresh_token")
    user = data.get("user") or data.get("profile") or {}

    if not access:
        raise AssertionError(f"Could not find access token in response: {data}")
    if not refresh:
        # Some implementations may not send refresh token on login; we allow None
        refresh = None

    user_id = user.get("id") or user.get("userId") or user.get("user_id")
    return access, refresh, user_id, user

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"} if token else {}


# ========================
# INDIVIDUAL TESTS
# ========================

def test_health(r: TestRunner):
    url = f"{BASE_URL}{API_PREFIX}/health"
    resp = requests.get(url, timeout=10)
    assert resp.status_code in (200, 503), f"Unexpected health status: {resp.status_code}"
    print("Health response:", resp.status_code, resp.text[:200])


def test_household_auth_flow(r: TestRunner):
    # 1. Register
    phone = random_phone()
    password = "Passw0rd!"  # >= 6 chars
    email = random_email()
    url = f"{BASE_URL}{API_PREFIX}/auth/register"
    payload = {
        "name": "Test Household User",
        "phone": phone,
        "password": password,
        "email": email,
        "address": "Ndokoti, Douala",
        "quarter": "Ndokoti"
    }
    resp = requests.post(url, json=payload, timeout=10)
    # Either 201 (first time) or 409 (already exists) is acceptable logic.
    if resp.status_code == 409:
        print("User already exists (unexpected for random phone, but continuing).")
    else:
        assert_status(resp, 201, "register")

    # 2. Login
    url = f"{BASE_URL}{API_PREFIX}/auth/login"
    resp = requests.post(url, json={"phone": phone, "password": password}, timeout=10)
    assert_status(resp, 200, "login")
    data = resp.json()
    access, refresh, user_id, user = extract_tokens_and_user(data)

    r.context["household_phone"] = phone
    r.context["household_password"] = password
    r.context["household_access"] = access
    r.context["household_refresh"] = refresh
    r.context["household_id"] = user_id

    print("Household user id:", user_id)

    # 3. Refresh token (if available)
    if refresh:
        url = f"{BASE_URL}{API_PREFIX}/auth/refresh"
        resp = requests.post(url, json={"refreshToken": refresh}, timeout=10)
        assert_status(resp, 200, "refresh")
        data = resp.json()
        new_access, new_refresh, _, _ = extract_tokens_and_user(data)
        r.context["household_access"] = new_access
        r.context["household_refresh"] = new_refresh or refresh
        print("Refreshed tokens OK.")

    # 4. Change password
    url = f"{BASE_URL}{API_PREFIX}/auth/change-password"
    new_password = "NewPassw0rd!"
    resp = requests.patch(
        url,
        json={"currentPassword": password, "newPassword": new_password},
        headers=auth_headers(r.context["household_access"]),
        timeout=10
    )
    if resp.status_code == 400:
        print("Change password failed with 400 (maybe currentPassword mismatch) -> skipping re-login test.")
        return
    assert_status(resp, 200, "change-password")

    # 5. Re-login with new password
    url = f"{BASE_URL}{API_PREFIX}/auth/login"
    resp = requests.post(url, json={"phone": phone, "password": new_password}, timeout=10)
    assert_status(resp, 200, "re-login")
    data = resp.json()
    access, refresh, user_id, _ = extract_tokens_and_user(data)
    r.context["household_access"] = access
    r.context["household_refresh"] = refresh
    r.context["household_password"] = new_password
    print("Re-login with new password OK.")


def test_household_profile_and_stats(r: TestRunner):
    token = r.context.get("household_access")
    assert token, "No household_access token in context"

    # GET /households/me
    url = f"{BASE_URL}{API_PREFIX}/households/me"
    resp = requests.get(url, headers=auth_headers(token), timeout=10)
    assert_status(resp, 200, "households/me")
    profile = resp.json()
    print("Household profile:", profile)

    # IMPORTANT: store the HOUSEHOLD PROFILE ID (not user id)
    household_profile_id = profile.get("id") or profile.get("householdId") or profile.get("household_id")
    if not household_profile_id:
        raise AssertionError(f"Could not find household profile ID in /households/me response: {profile}")
    r.context["household_profile_id"] = household_profile_id

    # PUT /households/me
    url = f"{BASE_URL}{API_PREFIX}/households/me"
    payload = {
        "householdSize": 4,
        "preferredPickupDays": ["MONDAY", "THURSDAY"],
        "address": "Updated Address Ndokoti"
    }
    resp = requests.put(url, json=payload, headers=auth_headers(token), timeout=10)
    # Even if server ignores some fields, we just expect 200
    assert_status(resp, 200, "update household profile")
    print("Updated household profile")

    # GET /households/me/stats
    url = f"{BASE_URL}{API_PREFIX}/households/me/stats"
    resp = requests.get(url, headers=auth_headers(token), timeout=10)
    assert_status(resp, 200, "households/me/stats")
    print("Household stats:", resp.json())

def test_subscription_me_household(r: TestRunner):
    token = r.context.get("household_access")
    household_profile_id = r.context.get("household_profile_id")

    assert token, "household_access missing"
    assert household_profile_id, "household_profile_id missing"

    # GET /subscriptions/me
    url = f"{BASE_URL}{API_PREFIX}/subscriptions/me"
    resp = requests.get(url, headers=auth_headers(token), timeout=10)
    assert_status(resp, 200, "subscriptions/me")

    data = resp.json()
    print("Household subscriptions (self):", data)

    # If at least one subscription exists, verify its household association
    if isinstance(data, list) and data:
        for sub in data:
            hid = sub.get("householdId")
            # Depending on your schema, this may be an object or ID
            if isinstance(hid, dict):
                hid = hid.get("id")
            assert hid == household_profile_id, "Subscription does not belong to logged-in household"


def test_agent_auth_and_stats(r: TestRunner):
    if not (AGENT_PHONE and AGENT_PASSWORD):
        raise AssertionError("AGENT_PHONE or AGENT_PASSWORD not set; cannot run agent tests")

    # Login as agent
    url = f"{BASE_URL}{API_PREFIX}/auth/login"
    resp = requests.post(url, json={"phone": AGENT_PHONE, "password": AGENT_PASSWORD}, timeout=10)
    assert_status(resp, 200, "agent login")
    data = resp.json()
    access, refresh, user_id, _ = extract_tokens_and_user(data)
    r.context["agent_access"] = access
    r.context["agent_refresh"] = refresh
    r.context["agent_user_id"] = user_id
    print("Agent logged in:", user_id)

    # GET /agents/me
    url = f"{BASE_URL}{API_PREFIX}/agents/me"
    resp = requests.get(url, headers=auth_headers(access), timeout=10)
    assert_status(resp, 200, "agents/me")
    print("Agent profile:", resp.json())

    # GET /agents/me/stats
    url = f"{BASE_URL}{API_PREFIX}/agents/me/stats"
    resp = requests.get(url, headers=auth_headers(access), timeout=10)
    assert_status(resp, 200, "agents/me/stats")
    print("Agent stats:", resp.json())


def test_pickup_flow_household_agent(r: TestRunner):
    """
    Household: create pickup
    Agent: get available -> accept -> start -> complete
    Household: rate pickup
    """
    household_token = r.context.get("household_access")
    agent_token = r.context.get("agent_access")
    assert household_token, "No household_access token"
    assert agent_token, "No agent_access token"

    # Household creates pickup
    url = f"{BASE_URL}{API_PREFIX}/pickups"
    tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
    payload = {
        "scheduledDate": tomorrow,
        "timeWindow": "08:00-10:00",
        "notes": "Test pickup from script",
        "wasteType": "MIXED"
    }
    resp = requests.post(url, json=payload, headers=auth_headers(household_token), timeout=10)
    assert_status(resp, 201, "create pickup")
    pickup = resp.json()
    pickup_id = pickup.get("id") or pickup.get("pickupId")
    if not pickup_id:
        raise AssertionError(f"Could not find pickup id in response: {pickup}")
    r.context["pickup_id"] = pickup_id
    print("Created pickup:", pickup_id)

    # Agent: get available
    url = f"{BASE_URL}{API_PREFIX}/pickups/available"
    resp = requests.get(url, headers=auth_headers(agent_token), timeout=10)
    assert_status(resp, 200, "pickups/available")
    available = resp.json()
    print("Available pickups:", available)

    # Try to find our pickup in available list
    # Depending on implementation, might include or not; we try to accept directly anyway.
    url = f"{BASE_URL}{API_PREFIX}/pickups/{pickup_id}/accept"
    resp = requests.patch(url, headers=auth_headers(agent_token), timeout=10)
    assert_status(resp, 200, "accept pickup")

    # Start pickup
    url = f"{BASE_URL}{API_PREFIX}/pickups/{pickup_id}/start"
    resp = requests.patch(url, headers=auth_headers(agent_token), timeout=10)
    assert_status(resp, 200, "start pickup")

    # Complete pickup (minimal body; adjust if backend expects more)
    url = f"{BASE_URL}{API_PREFIX}/pickups/{pickup_id}/complete"
    payload = {
        "photoProofUrl": "https://example.com/photo.jpg",
        "binId": None,  # replace with a real binId if required
        "notes": "Completed by test script"
    }
    resp = requests.patch(url, json=payload, headers=auth_headers(agent_token), timeout=10)
    if resp.status_code not in (200, 201):
        print("Complete pickup may require specific DTO, response:", resp.status_code, resp.text)
        raise AssertionError("complete pickup failed")
    print("Completed pickup:", resp.json())

    # Household rates pickup
    url = f"{BASE_URL}{API_PREFIX}/pickups/{pickup_id}/rating"
    payload = {
        "rating": 5,
        "comment": "Excellent service from automated test."
    }
    resp = requests.post(url, json=payload, headers=auth_headers(household_token), timeout=10)
    assert_status(resp, 201, "rate pickup")
    print("Rated pickup:", resp.json())


def test_alerts_flow(r: TestRunner):
    household_token = r.context.get("household_access")
    assert household_token, "No household_access token"

    # Create alert as household
    url = f"{BASE_URL}{API_PREFIX}/alerts"
    payload = {
        "type": "ILLEGAL_DUMPING",
        "description": "Test alert from script",
        "photoUrl": "https://example.com/alert_photo.jpg",
        "gpsLat": 4.05,
        "gpsLng": 9.70
    }
    resp = requests.post(url, json=payload, headers=auth_headers(household_token), timeout=10)
    assert_status(resp, 201, "create alert")
    alert = resp.json()
    alert_id = alert.get("id")
    if not alert_id:
        raise AssertionError(f"Could not find alert id in response: {alert}")
    r.context["alert_id"] = alert_id
    print("Created alert:", alert_id)

    # List alerts (as same household; depending on implementation might show all or subset)
    url = f"{BASE_URL}{API_PREFIX}/alerts"
    resp = requests.get(url, headers=auth_headers(household_token), timeout=10)
    assert_status(resp, 200, "alerts list")
    print("Alerts list length:", len(resp.json()) if isinstance(resp.json(), list) else "unknown")

    # Get by id
    url = f"{BASE_URL}{API_PREFIX}/alerts/{alert_id}"
    resp = requests.get(url, headers=auth_headers(household_token), timeout=10)
    assert_status(resp, 200, "get alert")
    print("Alert detail:", resp.json())


def test_alerts_admin_update_status(r: TestRunner):
    if not (ADMIN_PHONE and ADMIN_PASSWORD):
        raise AssertionError("ADMIN_PHONE or ADMIN_PASSWORD not set; cannot test admin alert updates")
    alert_id = r.context.get("alert_id")
    if not alert_id:
        raise AssertionError("No alert_id in context; run test_alerts_flow first")

    # Login as admin
    url = f"{BASE_URL}{API_PREFIX}/auth/login"
    resp = requests.post(url, json={"phone": ADMIN_PHONE, "password": ADMIN_PASSWORD}, timeout=10)
    assert_status(resp, 200, "admin login")
    data = resp.json()
    admin_token, _, admin_user_id, _ = extract_tokens_and_user(data)
    r.context["admin_access"] = admin_token
    r.context["admin_user_id"] = admin_user_id
    print("Admin logged in:", admin_user_id)

    # Update alert status
    url = f"{BASE_URL}{API_PREFIX}/alerts/{alert_id}"
    payload = {
        "status": "RESOLVED",
        "resolutionNotes": "Resolved by admin test script."
    }
    resp = requests.patch(url, json=payload, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "update alert status")
    print("Updated alert status:", resp.json())


def test_bins_admin(r: TestRunner):
    admin_token = r.context.get("admin_access")
    if not admin_token:
        raise AssertionError("No admin_access in context; run admin login test first")

    # Create bin
    url = f"{BASE_URL}{API_PREFIX}/bins"
    payload = {
        "locationName": "Test Bin Location",
        "gpsLat": 4.05,
        "gpsLng": 9.70,
        "capacityLevel": "LOW"
    }
    resp = requests.post(url, json=payload, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 201, "create bin")
    bin_data = resp.json()
    bin_id = bin_data.get("id")
    if not bin_id:
        raise AssertionError(f"Could not find bin id: {bin_data}")
    r.context["bin_id"] = bin_id
    print("Created bin:", bin_id)

    # List bins
    url = f"{BASE_URL}{API_PREFIX}/bins"
    resp = requests.get(url, timeout=10)
    assert_status(resp, 200, "list bins")
    print("Bins list:", resp.json())

    # Get bin by id
    url = f"{BASE_URL}{API_PREFIX}/bins/{bin_id}"
    resp = requests.get(url, timeout=10)
    assert_status(resp, 200, "get bin")
    print("Single bin detail:", resp.json())

    # Update bin
    url = f"{BASE_URL}{API_PREFIX}/bins/{bin_id}"
    payload = {"capacityLevel": "FULL"}
    resp = requests.patch(url, json=payload, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "update bin")
    print("Updated bin:", resp.json())


def test_education_admin_and_public(r: TestRunner):
    admin_token = r.context.get("admin_access")
    if not admin_token:
        raise AssertionError("No admin_access in context")

    # Create educational content
    url = f"{BASE_URL}{API_PREFIX}/education"
    payload = {
        "title": "Safe Waste Disposal Basics",
        "contentType": "ARTICLE",
        "body": "Always keep your waste in closed bags and avoid illegal dumping.",
        "language": "EN",
        "targetAudience": "HOUSEHOLD"
    }
    resp = requests.post(url, json=payload, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 201, "create education")
    edu = resp.json()
    edu_id = edu.get("id")
    if not edu_id:
        raise AssertionError(f"Could not find education id: {edu}")
    r.context["education_id"] = edu_id
    print("Created educational content:", edu_id)

    # List educational content (public)
    url = f"{BASE_URL}{API_PREFIX}/education"
    params = {"audience": "HOUSEHOLD", "language": "EN"}
    resp = requests.get(url, params=params, timeout=10)
    assert_status(resp, 200, "list education")
    print("Education list:", resp.json())

    # Get by id
    url = f"{BASE_URL}{API_PREFIX}/education/{edu_id}"
    resp = requests.get(url, timeout=10)
    assert_status(resp, 200, "get education")
    print("Education detail:", resp.json())

    # Update
    url = f"{BASE_URL}{API_PREFIX}/education/{edu_id}"
    payload = {"title": "Updated Safe Waste Disposal", "language": "EN", "targetAudience": "HOUSEHOLD"}
    resp = requests.put(url, json=payload, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "update education")
    print("Updated education:", resp.json())


def test_surveys_flow(r: TestRunner):
    admin_token = r.context.get("admin_access")
    household_token = r.context.get("household_access")
    if not admin_token:
        raise AssertionError("No admin_access in context")
    if not household_token:
        raise AssertionError("No household_access in context")

    # Create survey
    url = f"{BASE_URL}{API_PREFIX}/surveys"
    payload = {
        "title": "Household Feedback Survey",
        "targetGroup": "HOUSEHOLDS",
        "questions": [
            {"id": "q1", "text": "How satisfied are you with the pickup service?", "type": "rating"},
            {"id": "q2", "text": "Any suggestions for improvement?", "type": "text"}
        ],
        "isActive": True
    }
    resp = requests.post(url, json=payload, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 201, "create survey")
    survey = resp.json()
    survey_id = survey.get("id")
    if not survey_id:
        raise AssertionError(f"Could not find survey id: {survey}")
    r.context["survey_id"] = survey_id
    print("Created survey:", survey_id)

    # GET survey by ID (new endpoint)
    url = f"{BASE_URL}{API_PREFIX}/surveys/{survey_id}"
    resp = requests.get(url, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "get single survey")
    print("Single survey detail:", resp.json())


    # List surveys
    url = f"{BASE_URL}{API_PREFIX}/surveys"
    params = {"targetGroup": "HOUSEHOLDS", "active": True}
    resp = requests.get(url, params=params, timeout=10)
    assert_status(resp, 200, "list surveys")
    print("Surveys list:", resp.json())

    # Submit survey response as household
    url = f"{BASE_URL}{API_PREFIX}/surveys/{survey_id}/responses"
    payload = {
        "answers": {
            "q1": 5,
            "q2": "Everything works well so far."
        }
    }
    resp = requests.post(url, json=payload, headers=auth_headers(household_token), timeout=10)
    assert_status(resp, 201, "submit survey response")
    print("Submitted survey response:", resp.json())

    # Get survey responses as admin
    url = f"{BASE_URL}{API_PREFIX}/surveys/{survey_id}/responses"
    resp = requests.get(url, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "get survey responses")
    print("Survey responses:", resp.json())


def test_subscriptions_admin(r: TestRunner):
    admin_token = r.context.get("admin_access")
    # This is the HOUSEHOLD PROFILE ID we stored earlier
    household_profile_id = r.context.get("household_profile_id")

    if not admin_token:
        raise AssertionError("No admin_access in context")
    if not household_profile_id:
        raise AssertionError("No household_profile_id in context; make sure test_household_profile_and_stats ran successfully")

    # Create subscription
    url = f"{BASE_URL}{API_PREFIX}/subscriptions"
    start = datetime.utcnow().strftime("%Y-%m-%d")
    end = (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d")
    payload = {
        "householdId": household_profile_id,   # <-- use profile ID here
        "planType": "MONTHLY",
        "startDate": start,
        "endDate": end,
        "status": "ACTIVE"
    }
    resp = requests.post(url, json=payload, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 201, "create subscription")
    sub = resp.json()
    print("Created subscription:", sub)

    # Get subscriptions for that household
    url = f"{BASE_URL}{API_PREFIX}/subscriptions"
    params = {"householdId": household_profile_id}
    resp = requests.get(url, params=params, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "list subscriptions by household")
    print("Subscriptions for household:", resp.json())


def test_stats_admin(r: TestRunner):
    admin_token = r.context.get("admin_access")
    if not admin_token:
        raise AssertionError("No admin_access in context")

    # Overview
    url = f"{BASE_URL}{API_PREFIX}/stats/overview"
    resp = requests.get(url, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "stats overview")
    print("Overview stats:", resp.json())

    # Pickup stats
    today = datetime.utcnow().date()
    start = (today - timedelta(days=7)).isoformat()
    end = today.isoformat()
    url = f"{BASE_URL}{API_PREFIX}/stats/pickups"
    params = {"from": start, "to": end}
    resp = requests.get(url, params=params, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "pickup stats")
    print("Pickup stats:", resp.json())

    # Agent performance
    url = f"{BASE_URL}{API_PREFIX}/stats/agents/performance"
    resp = requests.get(url, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "agent performance stats")
    print("Agent performance stats:", resp.json())

def test_admin_update_user(r: TestRunner):
    admin_token = r.context.get("admin_access")
    household_user_id = r.context.get("household_id")

    assert admin_token, "No admin_access token"
    assert household_user_id, "household_id missing"

    # PATCH /users/:id
    url = f"{BASE_URL}{API_PREFIX}/users/{household_user_id}"
    payload = {
        "name": "Updated Household User",
        "isActive": True
    }
    resp = requests.patch(url, json=payload, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "PATCH /users/:id")
    print("Updated user (admin):", resp.json())

    # GET to confirm
    url = f"{BASE_URL}{API_PREFIX}/users/{household_user_id}"
    resp = requests.get(url, headers=auth_headers(admin_token), timeout=10)
    assert_status(resp, 200, "GET updated user")
    data = resp.json()

    assert data.get("name") == "Updated Household User", "User name was not updated"
    print("User update confirmed:", data)


def test_file_upload(r: TestRunner):
    admin_token = r.context.get("admin_access") or r.context.get("household_access")
    if not admin_token:
        raise AssertionError("Need at least one authenticated user for file upload")

    url = f"{BASE_URL}{API_PREFIX}/files/upload"
    files = {
        "file": ("test.txt", b"Hello from automated test", "text/plain")
    }
    resp = requests.post(url, files=files, headers=auth_headers(admin_token), timeout=10)
    if resp.status_code not in (200, 201):
        raise AssertionError(f"File upload failed: {resp.status_code} {resp.text}")
    print("File upload response:", resp.json())


# ========================
# MAIN
# ========================

if __name__ == "__main__":
    runner = TestRunner()

    print(f"Using BASE_URL = {BASE_URL}")
    if not BASE_URL.startswith("http"):
        print("WARNING: BASE_URL should include http:// or https://")

    # Basic health + household flows
    runner.run("Health check", test_health)
    runner.run("Household auth flow", test_household_auth_flow)
    runner.run("Household profile & stats", test_household_profile_and_stats)

    # Agent flows (if credentials provided)
    if AGENT_PHONE and AGENT_PASSWORD:
        runner.run("Agent auth & stats", test_agent_auth_and_stats)
        runner.run("Pickup flow household→agent", test_pickup_flow_household_agent)
    else:
        print("\n[SKIP] Agent tests (AGENT_PHONE / AGENT_PASSWORD not set)")

    # Alerts basic
    runner.run("Alerts basic flow (household)", test_alerts_flow)

    # Admin-dependent tests
    if ADMIN_PHONE and ADMIN_PASSWORD:
        runner.run("Admin updates alert status", test_alerts_admin_update_status)
        runner.run("Admin bins management", test_bins_admin)
        runner.run("Education admin & public", test_education_admin_and_public)
        runner.run("Surveys flow", test_surveys_flow)
        runner.run("Subscriptions admin", test_subscriptions_admin)
        runner.run("Subscriptions /me (household)", test_subscription_me_household)
        runner.run("Admin update user", test_admin_update_user)
        runner.run("Stats admin", test_stats_admin)
        runner.run("File upload", test_file_upload)
    else:
        print("\n[SKIP] Admin tests (ADMIN_PHONE / ADMIN_PASSWORD not set)")

    runner.summary()
