# API Reference - Waste Management Platform

Base URL: `http://localhost:3000/api/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### POST /auth/register
Register a new household user.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+237670000000",
  "email": "john@example.com",
  "password": "password123",
  "address": "123 Main St, Douala",
  "quarter": "Bonamoussadi"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+237670000000",
    "role": "HOUSEHOLD"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### POST /auth/login
Login with phone and password.

**Request Body:**
```json
{
  "phone": "+237670000000",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### POST /auth/logout
Logout current user.

**Headers:** `Authorization: Bearer <token>`

### PATCH /auth/change-password
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

## Users (Admin Only)

### GET /users
List all users with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (HOUSEHOLD, AGENT, ADMIN, HYSACAM, COUNCIL)
- `isActive` (optional): Filter by active status (true/false)

**Roles Required:** ADMIN, HYSACAM, COUNCIL

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+237670000000",
      "role": "HOUSEHOLD",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### GET /users/:id
Get user by ID.

**Roles Required:** ADMIN, HYSACAM, COUNCIL

### PATCH /users/:id/status
Update user active status.

**Roles Required:** ADMIN

**Request Body:**
```json
{
  "isActive": false
}
```

---

## Households

### GET /households/me
Get my household profile.

**Roles Required:** HOUSEHOLD

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "householdSize": 4,
  "preferredPickupDays": ["Monday", "Thursday"],
  "subscriptionStatus": "ACTIVE",
  "user": { ... }
}
```

### PUT /households/me
Update my household profile.

**Roles Required:** HOUSEHOLD

**Request Body:**
```json
{
  "householdSize": 5,
  "preferredPickupDays": ["Tuesday", "Friday"]
}
```

### GET /households/me/stats
Get my household statistics.

**Roles Required:** HOUSEHOLD

**Response:** `200 OK`
```json
{
  "totalPickups": 25,
  "completedPickups": 23,
  "subscriptionStatus": "ACTIVE"
}
```

---

## Agents

### GET /agents/me
Get my agent profile.

**Roles Required:** AGENT

### PUT /agents/me
Update my agent profile.

**Roles Required:** AGENT

### GET /agents/me/stats
Get my agent statistics.

**Roles Required:** AGENT

**Response:** `200 OK`
```json
{
  "totalPickups": 150,
  "completedPickups": 145,
  "averageRating": 4.7,
  "kycStatus": "APPROVED"
}
```

### PATCH /agents/:id/kyc
Update agent KYC status.

**Roles Required:** ADMIN

**Request Body:**
```json
{
  "kycStatus": "APPROVED"
}
```

---

## Pickups

### POST /pickups
Create a pickup request.

**Roles Required:** HOUSEHOLD

**Request Body:**
```json
{
  "scheduledDate": "2024-01-15",
  "timeWindow": "08:00-10:00",
  "wasteType": "MIXED",
  "notes": "Large items included"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "householdId": "uuid",
  "status": "REQUESTED",
  "scheduledDate": "2024-01-15",
  "timeWindow": "08:00-10:00",
  "wasteType": "MIXED",
  "notes": "Large items included",
  "createdAt": "2024-01-10T10:00:00Z"
}
```

### GET /pickups
List pickups (filtered by role).

**Query Parameters:**
- `scope` (optional): "mine" to see only my pickups

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "status": "ASSIGNED",
    "scheduledDate": "2024-01-15",
    "household": { ... },
    "agent": { ... }
  }
]
```

### GET /pickups/available
Get available pickups for agents.

**Roles Required:** AGENT

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "status": "REQUESTED",
    "scheduledDate": "2024-01-15",
    "timeWindow": "08:00-10:00",
    "household": {
      "user": {
        "name": "John Doe",
        "address": "123 Main St",
        "quarter": "Bonamoussadi"
      }
    }
  }
]
```

### GET /pickups/:id
Get pickup details.

### PATCH /pickups/:id/accept
Accept a pickup request.

**Roles Required:** AGENT

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "ASSIGNED",
  "agentId": "uuid"
}
```

### PATCH /pickups/:id/start
Start a pickup.

**Roles Required:** AGENT

### PATCH /pickups/:id/complete
Complete a pickup.

**Roles Required:** AGENT

**Request Body:**
```json
{
  "photoProofUrl": "https://...",
  "binId": "uuid",
  "notes": "Completed successfully"
}
```

### PATCH /pickups/:id/cancel
Cancel a pickup.

**Roles Required:** HOUSEHOLD

### POST /pickups/:id/rating
Rate a completed pickup.

**Roles Required:** HOUSEHOLD

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent service!"
}
```

---

## Alerts

### POST /alerts
Create an alert.

**Roles Required:** HOUSEHOLD, AGENT

**Request Body:**
```json
{
  "type": "FULL_BIN",
  "binId": "uuid",
  "description": "Bin is overflowing",
  "photoUrl": "https://...",
  "gpsLat": 4.0511,
  "gpsLng": 9.7679
}
```

**Alert Types:**
- `FULL_BIN`
- `ILLEGAL_DUMPING`
- `MISSED_PICKUP`
- `OTHER`

### GET /alerts
List alerts.

**Query Parameters:**
- `status` (optional): OPEN, IN_PROGRESS, RESOLVED
- `type` (optional): Alert type

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "type": "FULL_BIN",
    "status": "OPEN",
    "description": "Bin is overflowing",
    "photoUrl": "https://...",
    "gpsLat": 4.0511,
    "gpsLng": 9.7679,
    "createdBy": { ... },
    "bin": { ... },
    "createdAt": "2024-01-10T10:00:00Z"
  }
]
```

### GET /alerts/:id
Get alert details.

### PATCH /alerts/:id
Update alert status.

**Roles Required:** ADMIN, HYSACAM, COUNCIL

**Request Body:**
```json
{
  "status": "RESOLVED",
  "resolutionNotes": "Bin emptied and cleaned"
}
```

---

## Community Bins

### POST /bins
Create a bin.

**Roles Required:** ADMIN

**Request Body:**
```json
{
  "locationName": "Market Square",
  "gpsLat": 4.0511,
  "gpsLng": 9.7679,
  "capacityLevel": "LOW"
}
```

**Capacity Levels:** LOW, MEDIUM, HIGH, FULL

### GET /bins
List all bins (public endpoint).

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "locationName": "Market Square",
    "gpsLat": 4.0511,
    "gpsLng": 9.7679,
    "capacityLevel": "MEDIUM",
    "lastEmptiedAt": "2024-01-10T08:00:00Z"
  }
]
```

### GET /bins/:id
Get bin details.

### PATCH /bins/:id
Update bin.

**Roles Required:** ADMIN, HYSACAM

**Request Body:**
```json
{
  "capacityLevel": "FULL",
  "lastEmptiedAt": "2024-01-15T10:00:00Z"
}
```

---

## Subscriptions

### GET /subscriptions
Get subscriptions.

**Roles Required:** ADMIN, HOUSEHOLD

**Query Parameters:**
- `householdId` (optional): Filter by household

### POST /subscriptions
Create subscription.

**Roles Required:** ADMIN

**Request Body:**
```json
{
  "householdId": "uuid",
  "planType": "MONTHLY",
  "startDate": "2024-01-01",
  "endDate": "2024-02-01",
  "status": "ACTIVE"
}
```

---

## Educational Content

### GET /education
List educational content (public).

**Query Parameters:**
- `audience` (optional): HOUSEHOLD, AGENT, SCHOOL, GENERAL
- `language` (optional): EN, FR

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Proper Waste Segregation",
    "contentType": "ARTICLE",
    "body": "...",
    "language": "EN",
    "targetAudience": "HOUSEHOLD",
    "isPublished": true
  }
]
```

### GET /education/:id
Get content details.

### POST /education
Create educational content.

**Roles Required:** ADMIN

**Request Body:**
```json
{
  "title": "Recycling Guide",
  "contentType": "VIDEO",
  "contentUrl": "https://...",
  "language": "FR",
  "targetAudience": "GENERAL",
  "isPublished": true
}
```

**Content Types:** ARTICLE, VIDEO, IMAGE, PDF

### PUT /education/:id
Update content.

**Roles Required:** ADMIN

### DELETE /education/:id
Delete content.

**Roles Required:** ADMIN

---

## Surveys

### GET /surveys
List surveys (public).

**Query Parameters:**
- `targetGroup` (optional): Filter by target group
- `active` (optional): Filter by active status

### POST /surveys
Create survey.

**Roles Required:** ADMIN

**Request Body:**
```json
{
  "title": "Service Satisfaction Survey",
  "targetGroup": "HOUSEHOLDS",
  "questions": [
    {
      "id": 1,
      "question": "How satisfied are you?",
      "type": "rating",
      "options": [1, 2, 3, 4, 5]
    }
  ],
  "isActive": true
}
```

### POST /surveys/:id/responses
Submit survey response.

**Request Body:**
```json
{
  "answers": {
    "1": 5,
    "2": "Very satisfied"
  }
}
```

### GET /surveys/:id/responses
Get survey responses.

**Roles Required:** ADMIN, HYSACAM, COUNCIL

---

## Statistics

### GET /stats/overview
Get platform overview.

**Roles Required:** ADMIN, HYSACAM, COUNCIL

**Response:** `200 OK`
```json
{
  "totalPickups": 1250,
  "completedPickups": 1180,
  "totalAlerts": 45,
  "totalUsers": 850,
  "totalAgents": 25
}
```

### GET /stats/pickups
Get pickup statistics.

**Roles Required:** ADMIN, HYSACAM, COUNCIL

**Query Parameters:**
- `from` (optional): Start date (ISO format)
- `to` (optional): End date (ISO format)

**Response:** `200 OK`
```json
{
  "total": 150,
  "byStatus": {
    "REQUESTED": 10,
    "ASSIGNED": 15,
    "ON_GOING": 5,
    "COMPLETED": 115,
    "CANCELED": 5
  }
}
```

### GET /stats/agents/performance
Get top performing agents.

**Roles Required:** ADMIN, HYSACAM, COUNCIL

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Agent Name",
    "averageRating": 4.8,
    "totalCompletedPickups": 250
  }
]
```

---

## Files

### POST /files/upload
Upload a file.

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <token>`

**Form Data:**
- `file`: File to upload

**Response:** `201 Created`
```json
{
  "url": "/uploads/1234567890-filename.jpg"
}
```

---

## Health

### GET /health
Health check endpoint (public).

**Response:** `200 OK`
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["phone must be a valid phone number"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: ADMIN"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User with ID abc123 not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this phone already exists"
}
```

---

## Role-Based Access Summary

| Endpoint | HOUSEHOLD | AGENT | ADMIN | HYSACAM | COUNCIL |
|----------|-----------|-------|-------|---------|---------|
| POST /pickups | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /pickups/available | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /pickups/:id/accept | ❌ | ✅ | ❌ | ❌ | ❌ |
| POST /alerts | ✅ | ✅ | ❌ | ❌ | ❌ |
| PATCH /alerts/:id | ❌ | ❌ | ✅ | ✅ | ✅ |
| POST /bins | ❌ | ❌ | ✅ | ❌ | ❌ |
| PATCH /bins/:id | ❌ | ❌ | ✅ | ✅ | ❌ |
| GET /stats/* | ❌ | ❌ | ✅ | ✅ | ✅ |
| POST /education | ❌ | ❌ | ✅ | ❌ | ❌ |
| GET /users | ❌ | ❌ | ✅ | ✅ | ✅ |

---

**For complete interactive documentation, visit: http://localhost:3000/api/docs**
