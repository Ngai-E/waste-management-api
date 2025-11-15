# KYC Document Management System

## Overview
Complete KYC document upload, review, and approval workflow for agents.

## Database Changes Required

Run this SQL migration to add the new columns:

```sql
ALTER TABLE pickup_agent_profiles 
ADD COLUMN driver_license_url VARCHAR(500),
ADD COLUMN vehicle_registration_url VARCHAR(500),
ADD COLUMN kyc_rejection_reason TEXT;
```

## Backend API Endpoints

### Agent Endpoints (Authenticated as AGENT)

#### 1. Upload KYC Documents
```
POST /api/v1/agents/me/kyc-documents
Authorization: Bearer {agent_token}

Body:
{
  "idDocumentUrl": "https://storage.example.com/id.jpg",
  "driverLicenseUrl": "https://storage.example.com/license.jpg",
  "vehicleRegistrationUrl": "https://storage.example.com/registration.jpg"
}
```

**Behavior:**
- Agent can upload one or all documents
- If KYC status is REJECTED, uploading new documents resets status to PENDING
- Rejection reason is cleared when new documents are uploaded

#### 2. Get My Profile (includes KYC info)
```
GET /api/v1/agents/me
Authorization: Bearer {agent_token}

Response:
{
  "id": "agent-id",
  "kycStatus": "REJECTED",
  "kycRejectionReason": "ID document is not clear",
  "idDocumentUrl": "https://...",
  "driverLicenseUrl": "https://...",
  "vehicleRegistrationUrl": "https://...",
  ...
}
```

### Admin Endpoints (Authenticated as ADMIN)

#### 1. Get All Agents (with KYC documents)
```
GET /api/v1/agents
Authorization: Bearer {admin_token}

Response:
[
  {
    "id": "agent-id",
    "kycStatus": "PENDING",
    "kycRejectionReason": null,
    "idDocumentUrl": "https://...",
    "driverLicenseUrl": "https://...",
    "vehicleRegistrationUrl": "https://...",
    "user": {
      "name": "Agent Name",
      "phone": "+237600000099"
    }
  }
]
```

#### 2. Update KYC Status (with rejection reason)
```
PATCH /api/v1/agents/{agentId}/kyc
Authorization: Bearer {admin_token}

Body (Approve):
{
  "kycStatus": "APPROVED"
}

Body (Reject):
{
  "kycStatus": "REJECTED",
  "rejectionReason": "ID document is not clear. Please upload a better quality image."
}
```

**Behavior:**
- When APPROVED: rejection reason is cleared
- When REJECTED: rejection reason is required (defaults to "No reason provided")
- When PENDING: rejection reason is cleared

#### 3. Upload Documents for Agent (Admin)
```
POST /api/v1/agents/{agentId}/kyc-documents
Authorization: Bearer {admin_token}

Body:
{
  "idDocumentUrl": "https://storage.example.com/id.jpg",
  "driverLicenseUrl": "https://storage.example.com/license.jpg",
  "vehicleRegistrationUrl": "https://storage.example.com/registration.jpg"
}
```

## KYC Workflow

### Agent Self-Service Flow:
1. Agent registers (KYC status: PENDING)
2. Agent uploads KYC documents via mobile app
3. Admin reviews documents
4. Admin approves or rejects with reason
5. If rejected, agent sees reason and can re-upload
6. When agent re-uploads, status resets to PENDING

### Admin-Managed Flow:
1. Admin creates agent (can set KYC status to APPROVED immediately)
2. Admin can upload documents on behalf of agent
3. Admin can update KYC status anytime

## Document Types

1. **ID Document** (`idDocumentUrl`)
   - National ID card
   - Passport
   - Driver's license

2. **Driver License** (`driverLicenseUrl`)
   - Valid driver's license
   - Required for vehicle operation

3. **Vehicle Registration** (`vehicleRegistrationUrl`)
   - Vehicle registration certificate
   - Proof of vehicle ownership

## KYC Status States

- **PENDING**: Documents submitted, awaiting review
- **APPROVED**: Documents verified, agent can accept pickups
- **REJECTED**: Documents rejected, agent cannot accept pickups until re-submission

## Rejection Reasons

Stored in `kycRejectionReason` field. Examples:
- "ID document is not clear. Please upload a better quality image."
- "Driver license has expired. Please provide a valid license."
- "Vehicle registration does not match the vehicle type specified."
- "Documents are incomplete. Please upload all required documents."

## Next Steps

### Admin Panel:
1. Update agents list to show document thumbnails
2. Create KYC review modal with:
   - Document viewer (image preview)
   - Approve/Reject buttons
   - Rejection reason textarea
3. Add document upload interface for admin

### Flutter App:
1. Create KYC status screen showing:
   - Current KYC status
   - Rejection reason (if rejected)
   - Document upload buttons
   - Document preview
2. Add file picker for document upload
3. Show KYC status on agent home screen
4. Block pickup acceptance if KYC not approved

## File Upload Flow

Since you already have `/api/v1/files/upload` endpoint:

1. User selects file (mobile/web)
2. Upload file to `/api/v1/files/upload`
3. Get back URL
4. Submit URL to KYC documents endpoint
