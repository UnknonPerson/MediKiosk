# MediKiosk — Backend Product Requirements Document (Backend PRD)

**Project:** MediKiosk — AI-Powered Digital Clinical Intake & Patient Case-Taking Platform  
**Problem Statement:** 4 — Patient Case-Taking Software  
**Organization:** All India Institute of Ayurveda, Ministry of AYUSH  
**Category:** Software  
**Theme:** MedTech / Biotech / HealthTech  
**Document:** Backend Product Requirements Document  
**Version:** 1.0

---

# 1. Purpose

This document defines the backend requirements for MediKiosk.

The backend is responsible for:

- Patient identity and session management
- Clinical intake orchestration
- Conversational question flow
- Voice/ASR processing orchestration
- Medical document processing
- OCR and clinical entity extraction orchestration
- Clinical history structuring
- Red-flag detection
- Medical timeline generation
- AI summary generation
- Patient confirmation
- Physician review and verification
- Consent management
- Role-based access control
- Audit logging
- Notifications and triage alerts
- Hospital/HIS integration
- ABDM-oriented interoperability
- Data storage and retrieval
- Security and privacy controls

The backend must treat AI output as assistive information that requires validation where clinically relevant. It must not turn an LLM into an autonomous diagnostic or treatment engine.

---

# 2. Backend Goals

## BG-01 — Reliable Clinical Intake

Provide APIs that allow the patient application to conduct a structured clinical history interview.

## BG-02 — Structured Data

Store clinical information in structured, auditable schemas rather than relying on raw LLM responses.

## BG-03 — Multimodal Processing

Support:

- Text
- Voice
- Touch responses
- Scanned documents

## BG-04 — AI Orchestration

Coordinate ASR, OCR, extraction, clinical dialogue and summary generation.

## BG-05 — Clinical Safety

Provide deterministic validation and red-flag rules around AI-generated information.

## BG-06 — Physician Control

Allow doctors to review, edit, verify and reject AI-generated information.

## BG-07 — Privacy

Protect sensitive patient information through authentication, authorization, encryption, consent and auditability.

## BG-08 — Interoperability

Provide an abstraction layer for hospital systems and ABDM/FHIR-oriented integrations.

---

# 3. Backend Non-Goals

The backend must not:

- Independently diagnose a patient.
- Independently prescribe medication.
- Automatically make treatment decisions.
- Replace physician judgment.
- Automatically mark uncertain AI information as verified.
- Treat OCR output as unquestionably correct.
- Expose patient data across unrelated encounters without authorization.

---

# 4. High-Level Backend Architecture

```text
                         CLIENTS
                           │
            ┌──────────────┼──────────────┐
            │              │              │
       Patient App     Doctor App    Admin/Triage
            │              │              │
            └──────────────┼──────────────┘
                           │
                    API Gateway
                           │
                 Authentication Layer
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
 Patient Service     Intake Service     Clinical Service
        │                  │                  │
        ├──────────────┐   │          ┌───────┴────────┐
        │              │   │          │                │
 Consent Service   Visit Service     Summary       Timeline
        │              │              │
        └──────────────┼──────────────┘
                       │
                 AI Orchestration
                       │
        ┌──────────────┼──────────────┐
        │              │              │
       ASR            OCR            LLM
        │              │              │
        └──────────────┼──────────────┘
                       │
                Safety / Rules Engine
                       │
              ┌────────┴────────┐
              │                 │
           PostgreSQL       Object Storage
              │
        ┌─────┴─────────┐
        │               │
     Audit          Integration
      Logs          Adapter Layer
                        │
                 ┌──────┴──────┐
                 │             │
                HIS          ABDM
```

---

# 5. Recommended Backend Stack

This is a proposed implementation stack, not a technology requirement stated by the source problem statement.

## Runtime

- Node.js
- TypeScript

## Framework

Recommended:

- NestJS

Alternative:

- Express.js

NestJS is preferred for this project because the backend naturally divides into modules and services.

## Database

- PostgreSQL

## Cache / Temporary State

- Redis

## File Storage

- S3-compatible object storage

## Realtime

- WebSocket / Socket.IO

## Background Jobs

- BullMQ + Redis

## API Documentation

- OpenAPI / Swagger

## Authentication

- JWT-based session architecture
- OAuth-compatible integration where required

## Containerization

- Docker

---

# 6. Backend Modules

Recommended module structure:

```text
src/
├── auth/
├── users/
├── patients/
├── visits/
├── intake/
├── questions/
├── responses/
├── clinical-history/
├── documents/
├── ocr/
├── extraction/
├── ai/
├── safety/
├── summaries/
├── timelines/
├── medications/
├── allergies/
├── investigations/
├── ayush/
├── consent/
├── triage/
├── notifications/
├── physicians/
├── admin/
├── integrations/
├── abdm/
├── audit/
├── analytics/
├── storage/
└── common/
```

---

# 7. Core Backend Entities

The backend should maintain separate entities for identity, encounters, intake, documents and clinical information.

Core entities:

```text
User
Patient
Doctor
TriageStaff
Hospital
Department
OPD
Visit
Encounter
IntakeSession
Question
Response
ClinicalHistory
ClinicalFact
Document
DocumentExtraction
Investigation
Medication
Allergy
TimelineEvent
ClinicalSummary
TriageAlert
Consent
AuditLog
IntegrationEvent
```

---

# 8. Entity Relationships

```text
USER
 │
 ├── PATIENT
 │      │
 │      └── VISIT
 │            │
 │            └── INTAKE SESSION
 │                   │
 │                   ├── QUESTIONS
 │                   ├── RESPONSES
 │                   ├── DOCUMENTS
 │                   └── CLINICAL HISTORY
 │
 ├── DOCTOR
 │
 └── TRIAGE STAFF

PATIENT
 │
 ├── CONSENTS
 ├── DOCUMENTS
 ├── MEDICATIONS
 ├── ALLERGIES
 ├── INVESTIGATIONS
 └── TIMELINE EVENTS
```

---

# 9. Patient Data Model

Example:

```json
{
  "id": "PAT-10001",
  "name": "Synthetic Patient",
  "dateOfBirth": "1972-01-01",
  "gender": "male",
  "mobile": "masked",
  "language": "hi",
  "abha": {
    "linked": false
  },
  "createdAt": "2026-09-05T00:00:00Z",
  "updatedAt": "2026-09-05T00:00:00Z"
}
```

For the SIH prototype, use synthetic patient data.

---

# 10. Visit Model

A patient can have multiple hospital visits.

```json
{
  "id": "VIS-10091",
  "patientId": "PAT-10001",
  "hospitalId": "HOSP-001",
  "departmentId": "DEPT-GEN",
  "opdId": "OPD-12",
  "status": "waiting",
  "createdAt": "2026-09-05T09:00:00Z"
}
```

---

# 11. Intake Session

The intake session represents one patient interaction with MediKiosk.

```json
{
  "id": "SES-10091",
  "patientId": "PAT-10001",
  "visitId": "VIS-10091",
  "language": "hi",
  "inputModes": [
    "voice",
    "touch"
  ],
  "status": "in_progress",
  "consentId": "CON-001",
  "startedAt": "2026-09-05T09:10:00Z"
}
```

Statuses:

```text
created
in_progress
paused
processing
awaiting_confirmation
completed
cancelled
expired
```

---

# 12. Session State Machine

```text
CREATED
   ↓
CONSENT_PENDING
   ↓
ACTIVE
   ↓
PROCESSING
   ↓
PATIENT_REVIEW
   ↓
COMPLETED
```

Alternative exits:

```text
ACTIVE → PAUSED
ACTIVE → CANCELLED
ACTIVE → EXPIRED
PROCESSING → FAILED
```

---

# 13. Question Engine

The backend should not hard-code one giant questionnaire.

Instead, questions should be represented as structured nodes.

Example:

```json
{
  "id": "Q-CHEST-001",
  "category": "chief_complaint",
  "text": "Where exactly do you feel the pain?",
  "inputTypes": [
    "voice",
    "touch"
  ],
  "next": {
    "default": "Q-CHEST-002"
  }
}
```

Conditional branching:

```json
{
  "id": "Q-CHEST-003",
  "condition": {
    "field": "radiation",
    "equals": true
  },
  "next": "Q-CHEST-004"
}
```

---

# 14. Question Flow Architecture

```text
Chief Complaint
      ↓
Intent / Symptom Extraction
      ↓
Clinical Question Selector
      ↓
Question
      ↓
Patient Response
      ↓
Structured Response
      ↓
Rules + AI Interpretation
      ↓
Next Relevant Question
```

The backend should maintain the question-flow state.

---

# 15. Clinical History Schema

The backend should store a structured clinical history:

```json
{
  "chiefComplaint": [],
  "historyOfPresentIllness": {},
  "pastMedicalHistory": [],
  "pastSurgicalHistory": [],
  "drugHistory": [],
  "allergies": [],
  "familyHistory": [],
  "personalHistory": {},
  "reviewOfSystems": {},
  "previousInvestigations": [],
  "ayushHistory": {}
}
```

---

# 16. Clinical Fact Model

Every important extracted fact should ideally include provenance.

```json
{
  "id": "FACT-1001",
  "field": "medication.name",
  "value": "Metformin",
  "sourceType": "document",
  "sourceId": "DOC-1002",
  "confidence": 0.96,
  "verificationStatus": "pending",
  "createdAt": "2026-09-05T09:30:00Z"
}
```

Supported source types:

```text
patient_voice
patient_touch
patient_text
document
physician
system
```

Verification statuses:

```text
pending
verified
rejected
corrected
unknown
```

---

# 17. Critical Rule: Unknown vs Negative

The backend must preserve the difference between:

```text
Unknown
```

and:

```text
No
```

Example:

```json
{
  "allergyStatus": "unknown"
}
```

must not become:

```json
{
  "allergyStatus": "none"
}
```

unless the patient or authorized clinician explicitly confirms it.

---

# 18. AI Orchestration Service

The AI service should act as an orchestration layer rather than storing the source of truth.

```text
AI Orchestrator
      │
      ├── ASR
      ├── LLM
      ├── OCR
      ├── Medical Entity Extraction
      ├── Question Selection
      └── Summary Generation
```

---

# 19. ASR Processing

Flow:

```text
Audio
 ↓
Audio validation
 ↓
Language detection / selected language
 ↓
ASR
 ↓
Transcript
 ↓
Transcript confidence
 ↓
Clinical extraction
```

Example result:

```json
{
  "language": "hi",
  "transcript": "Mujhe do din se seene mein dard hai",
  "confidence": 0.94
}
```

The backend should retain the transcript and associate it with the response where policy permits.

---

# 20. ASR Error Handling

If confidence is low:

```text
ASR confidence < threshold
        ↓
Ask patient to repeat
        ↓
Or provide touch options
```

The backend should never silently save low-confidence speech as verified clinical information.

---

# 21. Document Processing

Document workflow:

```text
Upload
 ↓
File validation
 ↓
Security scan
 ↓
Object storage
 ↓
Create processing job
 ↓
OCR
 ↓
Document classification
 ↓
Entity extraction
 ↓
Clinical normalization
 ↓
Confidence scoring
 ↓
Save extraction
 ↓
Update timeline
```

---

# 22. Document Entity

Example:

```json
{
  "id": "DOC-1002",
  "patientId": "PAT-10001",
  "visitId": "VIS-10091",
  "type": "lab_report",
  "storageKey": "patients/PAT-10001/DOC-1002",
  "status": "processing",
  "uploadedAt": "2026-09-05T09:35:00Z"
}
```

Document types:

```text
prescription
lab_report
discharge_summary
imaging_report
consultation_note
medical_certificate
other
unknown
```

---

# 23. OCR Job

Use asynchronous processing.

```text
POST /documents
       ↓
201 Created
       ↓
OCR Job Queued
       ↓
Worker
       ↓
OCR Provider
       ↓
Extraction
       ↓
Database
```

Do not block the API request until long-running OCR processing completes.

---

# 24. Document Extraction Model

Example:

```json
{
  "documentId": "DOC-1002",
  "diagnoses": [
    {
      "value": "Type 2 Diabetes",
      "confidence": 0.94
    }
  ],
  "medications": [
    {
      "name": "Metformin",
      "dose": "500 mg",
      "frequency": "twice daily",
      "confidence": 0.91
    }
  ],
  "investigations": [
    {
      "name": "HbA1c",
      "value": "9.2",
      "unit": "%",
      "confidence": 0.97
    }
  ]
}
```

---

# 25. Medical Timeline Service

The timeline service combines events from:

- Patient history
- Previous visits
- Documents
- Investigations
- Medications
- Procedures
- Physician-confirmed events

Example:

```json
{
  "patientId": "PAT-10001",
  "events": [
    {
      "date": "2024-04-01",
      "type": "diagnosis",
      "title": "Diabetes",
      "source": "document"
    },
    {
      "date": "2025-07-20",
      "type": "investigation",
      "title": "HbA1c",
      "value": "8.7%",
      "source": "lab_report"
    }
  ]
}
```

If a medical date cannot be reliably established:

```text
dateStatus = unknown
```

The backend must not fabricate dates.

---

# 26. Red-Flag Service

Use a hybrid architecture:

```text
Patient Response
       ↓
Clinical Entity Extraction
       ↓
Deterministic Rules
       ↓
Optional AI Risk Assistance
       ↓
Risk Classification
       ↓
Triage Alert
```

The deterministic rules layer is important for safety-critical patterns.

---

# 27. Red-Flag Model

```json
{
  "id": "ALERT-1001",
  "patientId": "PAT-10001",
  "visitId": "VIS-10091",
  "severity": "high",
  "category": "possible_emergency",
  "trigger": {
    "symptoms": [
      "chest_pain",
      "dyspnoea"
    ]
  },
  "status": "active",
  "createdAt": "2026-09-05T09:42:00Z"
}
```

Statuses:

```text
active
acknowledged
resolved
dismissed
```

---

# 28. Triage Notification Flow

```text
Potential red flag
       ↓
Create TriageAlert
       ↓
Persist alert
       ↓
Push realtime notification
       ↓
Triage Dashboard
       ↓
Staff acknowledges
       ↓
Patient receives appropriate staff instruction
```

The system should not make an autonomous diagnosis.

---

# 29. Clinical Summary Service

The summary generator receives structured inputs:

```text
Clinical History
+
Document Extractions
+
Timeline
+
Relevant Alerts
+
Verified Patient Data
```

Then produces a structured summary.

The LLM output must be validated against a predefined schema before storage.

---

# 30. Summary Generation Pipeline

```text
Collect structured facts
        ↓
Remove unauthorized/incomplete data
        ↓
Build clinical context
        ↓
LLM structured generation
        ↓
JSON schema validation
        ↓
Clinical consistency checks
        ↓
Attach source metadata
        ↓
Save draft summary
        ↓
Physician review
```

---

# 31. Summary Model

```json
{
  "id": "SUM-1001",
  "patientId": "PAT-10001",
  "visitId": "VIS-10091",
  "status": "draft",
  "chiefComplaint": {},
  "historyOfPresentIllness": {},
  "pastMedicalHistory": [],
  "pastSurgicalHistory": [],
  "medications": [],
  "allergies": [],
  "familyHistory": [],
  "personalHistory": {},
  "reviewOfSystems": {},
  "investigations": [],
  "alerts": [],
  "ayushHistory": {},
  "generatedBy": "ai",
  "createdAt": "2026-09-05T09:50:00Z"
}
```

---

# 32. Summary Verification

Summary states:

```text
draft
↓
patient_confirmed
↓
physician_review
↓
physician_verified
```

Possible rejection path:

```text
draft → rejected
draft → corrected
physician_review → changes_requested
```

---

# 33. Physician Editing

Physician APIs must support:

```text
Edit field
Add field
Delete incorrect field
Mark verified
Reject AI information
Add clinical note
```

Example:

```http
PATCH /api/summaries/SUM-1001
```

Only authorized users can perform these actions.

---

# 34. Consent Service

The consent service should manage:

```text
Consent purpose
Patient
Scope
Status
Timestamp
Version
Grant method
Revocation status
```

Example:

```json
{
  "id": "CON-001",
  "patientId": "PAT-10001",
  "purpose": "clinical_history_collection",
  "status": "granted",
  "version": "1.0",
  "grantedAt": "2026-09-05T09:05:00Z"
}
```

---

# 35. Consent Rules

The backend must verify required consent before:

- Collecting clinical information.
- Processing documents.
- Sharing information with authorized systems.
- Performing applicable external integrations.

The exact consent requirements must be configured according to the deployment environment and applicable legal/institutional policies.

---

# 36. Authentication

Endpoints should be divided into:

### Public

```text
Health check
Login
Registration initiation
```

### Authenticated

```text
Patient data
Clinical intake
Documents
Doctor dashboard
```

### Highly privileged

```text
Admin
Audit logs
System configuration
Integration management
```

---

# 37. Authorization

Use RBAC plus resource-level authorization.

Example:

```text
Patient
 → Can access own data

Doctor
 → Can access assigned/authorized patient encounters

Triage staff
 → Can access relevant triage information

Admin
 → System-level access based on institutional role
```

Do not rely only on frontend route protection.

Every backend request must be authorized.

---

# 38. Authentication Token Architecture

Recommended:

```text
Access Token
+
Refresh Token
```

Access tokens should be short-lived.

Refresh tokens should be securely stored and revocable.

For kiosk sessions, use an appropriate temporary-session mechanism rather than leaving a persistent patient account logged in on the device.

---

# 39. API Design Principles

All APIs should:

- Use versioning.
- Validate inputs.
- Return predictable response structures.
- Return appropriate HTTP status codes.
- Use correlation/request IDs.
- Avoid leaking sensitive information in errors.
- Enforce authorization.
- Log security-relevant events.

Recommended base path:

```text
/api/v1
```

---

# 40. Authentication APIs

```http
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/verify
```

---

# 41. Patient APIs

```http
GET    /api/v1/patients/me
PATCH  /api/v1/patients/me

GET    /api/v1/patients/:patientId
PATCH  /api/v1/patients/:patientId
```

Resource-level authorization is mandatory.

---

# 42. Visit APIs

```http
POST /api/v1/visits
GET  /api/v1/visits/:visitId
GET  /api/v1/patients/:patientId/visits
PATCH /api/v1/visits/:visitId
```

---

# 43. Intake APIs

```http
POST /api/v1/intake/sessions
GET  /api/v1/intake/sessions/:sessionId
POST /api/v1/intake/sessions/:sessionId/start
POST /api/v1/intake/sessions/:sessionId/respond
POST /api/v1/intake/sessions/:sessionId/pause
POST /api/v1/intake/sessions/:sessionId/resume
POST /api/v1/intake/sessions/:sessionId/complete
```

---

# 44. Question APIs

```http
GET /api/v1/intake/sessions/:sessionId/question
POST /api/v1/intake/sessions/:sessionId/question/next
```

The backend should determine the next question based on the session state.

---

# 45. Voice APIs

```http
POST /api/v1/intake/sessions/:sessionId/audio
POST /api/v1/asr/transcribe
```

For production, audio processing should preferably be asynchronous where processing time is significant.

---

# 46. Document APIs

```http
POST /api/v1/documents
GET  /api/v1/documents/:documentId
POST /api/v1/documents/:documentId/process
GET  /api/v1/documents/:documentId/status
GET  /api/v1/patients/:patientId/documents
```

---

# 47. Summary APIs

```http
POST /api/v1/summaries/generate
GET  /api/v1/summaries/:summaryId
PATCH /api/v1/summaries/:summaryId
POST /api/v1/summaries/:summaryId/patient-confirm
POST /api/v1/summaries/:summaryId/verify
POST /api/v1/summaries/:summaryId/reject
```

---

# 48. Timeline APIs

```http
GET /api/v1/patients/:patientId/timeline
GET /api/v1/visits/:visitId/timeline
```

---

# 49. Triage APIs

```http
GET  /api/v1/triage/alerts
GET  /api/v1/triage/alerts/:alertId
POST /api/v1/triage/alerts/:alertId/acknowledge
POST /api/v1/triage/alerts/:alertId/resolve
```

---

# 50. Consent APIs

```http
GET  /api/v1/consents
POST /api/v1/consents
GET  /api/v1/consents/:consentId
POST /api/v1/consents/:consentId/revoke
```

---

# 51. Physician APIs

```http
GET /api/v1/doctor/queue
GET /api/v1/doctor/visits/:visitId
GET /api/v1/doctor/patients/:patientId
GET /api/v1/doctor/patients/:patientId/summary
PATCH /api/v1/doctor/summaries/:summaryId
```

---

# 52. Admin APIs

```http
GET /api/v1/admin/users
GET /api/v1/admin/hospitals
GET /api/v1/admin/departments
GET /api/v1/admin/opds
GET /api/v1/admin/kiosks
GET /api/v1/admin/analytics
GET /api/v1/admin/audit-logs
```

---

# 53. Database Tables

Recommended initial PostgreSQL schema:

```text
users
roles
permissions
user_roles

patients
patient_identifiers

hospitals
departments
opds
kiosks

visits
encounters

intake_sessions
questions
question_options
responses

clinical_histories
clinical_facts

documents
document_versions
document_extractions

medications
allergies
investigations
procedures

timeline_events

clinical_summaries
summary_versions

triage_alerts

consents
consent_versions

notifications

audit_logs

integration_events
integration_logs

ai_jobs
ai_outputs
```

---

# 54. Database Design Rules

## Rule 1

Use UUIDs or secure non-sequential identifiers for externally exposed resources.

## Rule 2

Keep internal database IDs separate from public IDs where appropriate.

## Rule 3

Use foreign keys for relational integrity.

## Rule 4

Use timestamps consistently.

## Rule 5

Never store raw passwords.

## Rule 6

Do not store unnecessary patient information.

## Rule 7

Use soft deletion only where it is appropriate and legally/institutionally required; clinical records may require immutable/auditable handling instead.

---

# 55. Document Storage Architecture

Do not store medical files directly inside PostgreSQL.

Use:

```text
PostgreSQL
    ↓
Document metadata

Object Storage
    ↓
Actual document
```

Example:

```text
patients/
  PAT-10001/
    visits/
      VIS-10091/
        documents/
          DOC-1002/
            original.pdf
            processed.png
```

Access should use short-lived signed URLs where appropriate.

---

# 56. Background Job Architecture

Long-running operations should use a queue.

```text
API
 ↓
Create Job
 ↓
Redis Queue
 ↓
Worker
 ↓
AI/OCR/Integration
 ↓
Persist Result
 ↓
Notify Client
```

Job types:

```text
ASR_PROCESSING
OCR_PROCESSING
DOCUMENT_EXTRACTION
SUMMARY_GENERATION
TIMELINE_UPDATE
ABDM_SYNC
HIS_SYNC
NOTIFICATION
```

---

# 57. AI Job Model

```json
{
  "id": "JOB-1001",
  "type": "SUMMARY_GENERATION",
  "status": "processing",
  "entityId": "VIS-10091",
  "attempts": 1,
  "createdAt": "2026-09-05T09:50:00Z"
}
```

Statuses:

```text
queued
processing
completed
failed
retrying
cancelled
```

---

# 58. AI Provider Abstraction

Do not tightly couple the application to one AI vendor.

Use interfaces:

```typescript
interface SpeechProvider {
  transcribe(input: AudioInput): Promise<Transcript>;
}

interface OCRProvider {
  extract(document: DocumentInput): Promise<OcrResult>;
}

interface ClinicalLLMProvider {
  generateStructuredHistory(
    input: ClinicalContext
  ): Promise<ClinicalHistory>;
}
```

This makes the system replaceable and easier to test.

---

# 59. AI Output Validation

LLM output must pass:

```text
LLM
 ↓
JSON Schema Validation
 ↓
Required field validation
 ↓
Type validation
 ↓
Clinical consistency checks
 ↓
Source/provenance attachment
 ↓
Database
```

Invalid output should never be written directly into verified clinical fields.

---

# 60. AI Prompt Architecture

Prompts should be versioned.

Example:

```text
Prompt:
clinical-summary-v1.2

Model:
configured model

Temperature:
configured value

Schema:
clinical-summary-schema-v1
```

Store metadata for reproducibility:

```json
{
  "promptVersion": "clinical-summary-v1.2",
  "modelVersion": "configured-model",
  "schemaVersion": "summary-v1"
}
```

---

# 61. AI Auditability

For AI-generated data, store:

```text
AI job ID
Model/provider
Prompt version
Input references
Output
Confidence
Timestamp
Verification status
```

Avoid storing unnecessary sensitive raw prompts or audio beyond the applicable retention policy.

---

# 62. AYUSH Backend Support

The backend must support an optional AYUSH history object.

Example:

```json
{
  "prakriti": {},
  "vikriti": {},
  "sara": {},
  "samhanana": {},
  "pramana": {},
  "satmya": {},
  "sattva": {},
  "aharaShakti": {},
  "vyayamaShakti": {},
  "aharaVihara": {}
}
```

The source problem statement explicitly identifies these Ayurvedic assessment areas.

The exact clinical definitions and scoring logic should be provided/validated by qualified domain experts rather than invented by the software team.

---

# 63. Realtime Communication

Use WebSockets/Socket.IO for:

- Triage alerts
- Doctor queue updates
- Document processing status
- AI processing status
- Patient-session state updates

Example:

```text
server → triage.alert.created
server → document.processing.updated
server → summary.ready
server → intake.next_question
```

---

# 64. Notification Service

Notification channels may include:

```text
WebSocket
In-app notification
Email
SMS
```

For the MVP, realtime web notifications are sufficient for internal triage/doctor workflows.

Do not send sensitive clinical information through insecure notification channels.

---

# 65. Error Handling

Use standardized error responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_PROCESSING_FAILED",
    "message": "The document could not be processed.",
    "requestId": "REQ-10001"
  }
}
```

Do not expose:

- Stack traces
- Internal service names
- Database errors
- AI provider credentials
- Sensitive patient data

to clients.

---

# 66. Idempotency

Important operations should support idempotency.

Examples:

```text
Document upload
Consent creation
Summary confirmation
ABDM sync
HIS sync
```

This prevents duplicate operations when network retries occur.

---

# 67. Concurrency Control

Prevent two users from overwriting the same physician summary.

Recommended:

```text
version number
+
updatedAt
+
optimistic locking
```

Example:

```json
{
  "version": 4
}
```

Update succeeds only if the client is editing the current version.

---

# 68. Security Requirements

## Authentication

- Strong password policy where passwords are used.
- Secure token handling.
- Session expiration.
- Refresh-token rotation/revocation as appropriate.

## Authorization

- RBAC.
- Resource-level authorization.
- Least privilege.

## Data

- TLS in transit.
- Encryption at rest.
- Secure secrets management.
- No credentials in source code.

## Application

- Input validation.
- Rate limiting.
- CSRF protection where applicable.
- Secure headers.
- File-type validation.
- File size limits.
- Malware/security scanning.

---

# 69. File Upload Security

For every uploaded file:

```text
Validate extension
 ↓
Validate MIME type
 ↓
Validate file size
 ↓
Security scan
 ↓
Store outside web root
 ↓
Generate internal document ID
```

Never trust the filename supplied by the client.

---

# 70. Audit Logging

Audit events should include:

```text
actorId
actorRole
action
resourceType
resourceId
timestamp
requestId
result
```

Example:

```json
{
  "actorId": "DOC-001",
  "actorRole": "doctor",
  "action": "SUMMARY_UPDATED",
  "resourceType": "clinical_summary",
  "resourceId": "SUM-1001",
  "timestamp": "2026-09-05T10:05:00Z"
}
```

---

# 71. Audit Events

Minimum events:

```text
LOGIN_SUCCESS
LOGIN_FAILED
PATIENT_CREATED
PATIENT_VIEWED
PATIENT_UPDATED
CONSENT_GRANTED
CONSENT_REVOKED
INTAKE_STARTED
INTAKE_COMPLETED
DOCUMENT_UPLOADED
DOCUMENT_VIEWED
DOCUMENT_PROCESSED
SUMMARY_GENERATED
SUMMARY_EDITED
SUMMARY_VERIFIED
SUMMARY_REJECTED
TRIAGE_ALERT_CREATED
TRIAGE_ALERT_ACKNOWLEDGED
DATA_EXPORTED
INTEGRATION_REQUESTED
INTEGRATION_COMPLETED
```

---

# 72. Data Retention

Retention must be configurable according to the deployment institution and applicable requirements.

The backend should distinguish:

```text
Temporary session data
Clinical records
Original documents
AI intermediate artifacts
Audit logs
Integration logs
```

Temporary session data should be cleared after submission according to the source requirement and deployment policy.

Do not delete clinical records simply because an AI job has completed.

---

# 73. ABDM Integration Layer

Do not put ABDM-specific logic directly inside patient or clinical services.

Use:

```text
Clinical Service
      ↓
Integration Service
      ↓
ABDM Adapter
```

This makes external integration replaceable.

---

# 74. HIS Integration Layer

Similarly:

```text
MediKiosk
   ↓
Integration Adapter
   ↓
Hospital HIS
```

The adapter should handle:

- Authentication
- Patient lookup
- Visit lookup
- Record submission
- Status synchronization
- Error handling
- Retry logic

---

# 75. FHIR Mapping Layer

Internal models should remain independent from external FHIR representation.

```text
Internal Clinical Model
        ↓
FHIR Mapper
        ↓
FHIR Resource
        ↓
External System
```

Potential mappings include:

```text
Patient → Patient
Visit → Encounter
Investigation → Observation / DiagnosticReport
Allergy → AllergyIntolerance
Medication → appropriate medication resource
Document → DocumentReference
Consent → Consent
Clinical summary → Composition / appropriate clinical document
```

Exact profiles should be validated against the target ABDM/HIS implementation.

---

# 76. Integration Event Model

```json
{
  "id": "INT-1001",
  "type": "HIS_SUMMARY_SYNC",
  "patientId": "PAT-10001",
  "visitId": "VIS-10091",
  "status": "queued",
  "attempts": 0
}
```

---

# 77. Integration Retry Strategy

For temporary failures:

```text
Attempt 1
 ↓
Wait
 ↓
Attempt 2
 ↓
Wait
 ↓
Attempt 3
 ↓
Dead-letter / manual review
```

Use exponential backoff.

Never endlessly retry a failed integration.

---

# 78. API Rate Limiting

Apply rate limits to:

- Login
- Registration
- OTP/verification endpoints
- File uploads
- AI endpoints
- Public endpoints

Higher limits can be applied to authenticated internal services.

---

# 79. Caching

Redis may be used for:

- Session state
- Rate limiting
- Question-flow state
- Short-lived AI processing status
- Realtime presence

Do not use Redis as the permanent source of truth for clinical records.

---

# 80. Observability

The backend should expose:

```text
Health check
Readiness check
Liveness check
Metrics
Structured logs
Distributed tracing
```

Example endpoints:

```http
GET /health
GET /health/ready
GET /metrics
```

---

# 81. Metrics

Track:

## API

- Request count
- Error rate
- Latency
- Throughput

## AI

- ASR latency
- OCR latency
- LLM latency
- AI failure rate
- Low-confidence rate

## Clinical workflow

- Intake completion rate
- Average intake duration
- Summary generation time
- Physician correction rate

## Documents

- Upload failures
- OCR failures
- Extraction confidence

## Safety

- Red-flag alerts
- Alert acknowledgement time

---

# 82. Logging

Use structured JSON logs.

Example:

```json
{
  "timestamp": "2026-09-05T10:00:00Z",
  "level": "info",
  "service": "intake-service",
  "requestId": "REQ-1001",
  "event": "INTAKE_RESPONSE_SAVED"
}
```

Do not log raw:

- Patient medical histories
- Full voice transcripts
- Medical documents
- Authentication tokens
- Passwords

unless explicitly required and appropriately protected.

---

# 83. Testing Strategy

## Unit Tests

Test:

- Clinical rules
- Question branching
- Validation
- Authorization
- Timeline ordering
- Consent logic

## Integration Tests

Test:

- API + database
- Document pipeline
- AI provider adapters
- Queue workers
- WebSocket notifications
- Integration adapters

## End-to-End Tests

Test:

```text
Patient registration
→ consent
→ interview
→ document upload
→ OCR
→ summary
→ physician review
→ triage alert
```

---

# 84. AI Evaluation

Create a synthetic evaluation dataset.

Each case should have:

```text
Patient narrative
Expected clinical fields
Expected red flags
Synthetic documents
Expected extracted entities
Expected timeline
Expected summary
```

Measure:

- Field extraction accuracy
- OCR accuracy
- ASR accuracy
- Summary factuality
- Red-flag sensitivity
- False-positive rate
- Physician correction rate

---

# 85. Synthetic Dataset

Because the source problem statement provides no dataset link, the prototype should use synthetic data.

Example case:

```text
Patient:
54-year-old male

Chief complaint:
Chest pain for 2 days

History:
Sudden onset
Central chest
Associated breathlessness

Previous document:
Diabetes prescription

Lab:
HbA1c 9.2%

Expected red flag:
Priority clinical assessment
```

All prototype documents should clearly be synthetic/demo material.

---

# 86. Performance Targets

These are proposed engineering targets:

| Operation | Target |
|---|---:|
| Normal API response | < 2 sec |
| Kiosk local interaction | < 1 sec |
| Question selection | < 1 sec |
| AI question generation | < 5 sec target |
| Summary generation | < 10 sec target |
| Document upload acknowledgement | < 2 sec |
| Realtime alert delivery | < 2 sec target |

Long-running processing should be asynchronous.

---

# 87. Scalability

The backend should be capable of scaling:

```text
1 Hospital
    ↓
Multiple Departments
    ↓
Multiple OPDs
    ↓
Multiple Kiosks
    ↓
Thousands of patient sessions/day
```

Recommended scaling approach:

```text
Load Balancer
      ↓
Multiple API instances
      ↓
PostgreSQL
      ↓
Redis
      ↓
Worker cluster
```

---

# 88. Deployment Architecture

```text
                    Internet / Hospital Network
                              │
                         Load Balancer
                              │
                         API Gateway
                              │
              ┌───────────────┼───────────────┐
              │               │               │
          API Server      API Server      API Server
              │               │               │
              └───────────────┼───────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
             Postgres       Redis       Object Storage
                              │
                         Job Workers
                              │
                  ┌───────────┼───────────┐
                  │           │           │
                 OCR         ASR          LLM
```

For a prototype, this can be simplified to fewer services while retaining clean module boundaries.

---

# 89. Recommended Monolith Strategy for MVP

Do **not** start with 15 microservices.

For the SIH prototype, build a modular monolith:

```text
NestJS Application
│
├── Auth Module
├── Patient Module
├── Visit Module
├── Intake Module
├── Document Module
├── AI Module
├── Summary Module
├── Triage Module
├── Consent Module
├── Doctor Module
├── Admin Module
└── Integration Module
```

Use background workers for OCR/AI jobs.

This gives the team faster development while keeping the architecture ready for later extraction into services.

---

# 90. MVP Backend Scope

Build these first:

## Authentication

- Patient
- Doctor
- Triage
- Admin

## Patient

- Registration
- Profile
- Visit

## Intake

- Session
- Questions
- Responses
- Adaptive branching

## AI

- ASR integration
- Structured extraction
- Basic clinical summary

## Documents

- Upload
- OCR
- Extraction

## Safety

- Basic deterministic red-flag rules

## Doctor

- Patient queue
- Summary
- Timeline
- Document access
- Edit/verify

## Admin

- Basic users
- Departments
- Analytics

## Security

- RBAC
- Consent
- Audit logs

---

# 91. MVP Backend API Flow

```text
POST /auth/login
       ↓
POST /visits
       ↓
POST /intake/sessions
       ↓
POST /intake/sessions/:id/start
       ↓
GET /intake/sessions/:id/question
       ↓
POST /intake/sessions/:id/respond
       ↓
POST /documents
       ↓
OCR Worker
       ↓
Document Extraction
       ↓
POST /summaries/generate
       ↓
Patient Confirmation
       ↓
Doctor Queue
       ↓
Doctor Review
       ↓
POST /summaries/:id/verify
```

---

# 92. Example Backend Request

## Patient Response

```http
POST /api/v1/intake/sessions/SES-10091/respond
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "questionId": "Q-CHEST-001",
  "inputType": "voice",
  "transcript": "I have chest pain since yesterday",
  "confidence": 0.95
}
```

Response:

```json
{
  "success": true,
  "data": {
    "responseId": "RESP-1001",
    "nextQuestionId": "Q-CHEST-002",
    "redFlagDetected": false
  }
}
```

---

# 93. Example Document Workflow

```http
POST /api/v1/documents
```

Response:

```json
{
  "success": true,
  "data": {
    "documentId": "DOC-1002",
    "status": "queued"
  }
}
```

Client then receives processing updates.

```text
queued
 ↓
processing
 ↓
OCR complete
 ↓
extraction complete
 ↓
ready
```

---

# 94. Example Triage Event

```json
{
  "event": "triage.alert.created",
  "data": {
    "alertId": "ALERT-1001",
    "visitId": "VIS-10091",
    "severity": "high"
  }
}
```

The event should not expose more patient information than necessary.

---

# 95. Data Consistency Rules

The backend should enforce:

1. Every response belongs to an intake session.
2. Every intake session belongs to a visit.
3. Every visit belongs to a patient.
4. Every document must be associated with an authorized patient/visit.
5. A physician summary must reference its visit.
6. Physician verification must create an audit event.
7. Consent must be linked to a defined purpose and version.
8. Red-flag alerts must reference their triggering evidence.

---

# 96. Disaster Recovery

Production should include:

- Automated database backups.
- Point-in-time recovery where appropriate.
- Object-storage versioning/backups.
- Recovery procedures.
- Restore testing.

The exact RPO/RTO should be determined during deployment planning.

---

# 97. Backend Security Checklist

- [ ] HTTPS/TLS
- [ ] Password hashing
- [ ] JWT/session security
- [ ] Refresh-token protection
- [ ] RBAC
- [ ] Resource-level authorization
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection protection
- [ ] Secure file upload
- [ ] Malware scanning
- [ ] Encryption at rest
- [ ] Secrets manager
- [ ] Audit logs
- [ ] Security headers
- [ ] CORS configuration
- [ ] Error sanitization
- [ ] Dependency scanning
- [ ] Container scanning

---

# 98. Backend Acceptance Criteria

## Authentication

- [ ] Users can authenticate.
- [ ] Roles are enforced server-side.
- [ ] Unauthorized resources return appropriate errors.
- [ ] Sessions expire correctly.

## Patient Intake

- [ ] Session can be created.
- [ ] Questions can branch.
- [ ] Voice and touch responses are stored.
- [ ] Sessions can pause/resume.
- [ ] Session completion is recorded.

## Document AI

- [ ] Documents can be uploaded securely.
- [ ] Processing is asynchronous.
- [ ] OCR result is stored.
- [ ] Extracted entities are structured.
- [ ] Source/provenance is preserved.

## Safety

- [ ] Red-flag rules run on relevant responses.
- [ ] Alerts are persisted.
- [ ] Triage users receive alerts.
- [ ] Alerts can be acknowledged/resolved.

## Summary

- [ ] AI summary follows a schema.
- [ ] Invalid AI output is rejected.
- [ ] Summary has provenance.
- [ ] Patient can confirm.
- [ ] Physician can edit.
- [ ] Physician verification is auditable.

## Privacy

- [ ] Consent is recorded.
- [ ] Consent is checked before applicable processing/sharing.
- [ ] Sensitive data is access-controlled.
- [ ] Audit events are recorded.

---

# 99. Development Order

Recommended implementation sequence:

## Phase 1

```text
Project setup
Database
Auth
RBAC
```

## Phase 2

```text
Patient
Visit
Intake Session
Questions
Responses
```

## Phase 3

```text
ASR
LLM
Clinical extraction
Adaptive question engine
```

## Phase 4

```text
Documents
Object storage
OCR
Document extraction
```

## Phase 5

```text
Timeline
Clinical summary
Patient confirmation
```

## Phase 6

```text
Doctor dashboard APIs
Triage
Realtime notifications
```

## Phase 7

```text
Consent
Audit
Security hardening
```

## Phase 8

```text
FHIR/ABDM/HIS integration adapters
Analytics
Deployment
```

---

# 100. Recommended Repository Structure

```text
medikiosk-backend/
│
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── patients/
│   │   ├── visits/
│   │   ├── intake/
│   │   ├── questions/
│   │   ├── documents/
│   │   ├── ai/
│   │   ├── clinical/
│   │   ├── summaries/
│   │   ├── timeline/
│   │   ├── triage/
│   │   ├── consent/
│   │   ├── doctors/
│   │   ├── admin/
│   │   └── integrations/
│   │
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   │
│   ├── config/
│   └── main.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── test/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

# 101. Recommended MVP Infrastructure

```text
Frontend
      ↓
Nginx
      ↓
NestJS API
      │
      ├── PostgreSQL
      ├── Redis
      ├── S3 Storage
      └── Worker
             │
             ├── OCR
             ├── ASR
             └── LLM
```

For an SIH prototype, this is sufficient. Avoid premature Kubernetes/microservice complexity unless the team already has the expertise and the deployment requires it.

---

# 102. Critical Backend Design Decisions

## Decision 1 — Modular Monolith First

Use NestJS modules rather than immediately creating microservices.

## Decision 2 — PostgreSQL as Source of Truth

Clinical structured data belongs in PostgreSQL.

## Decision 3 — Object Storage for Documents

Medical files belong in object storage with controlled access.

## Decision 4 — Queue AI Processing

OCR, ASR and summary generation should be asynchronous when processing is not instantaneous.

## Decision 5 — Hybrid Safety Engine

Use deterministic clinical rules alongside AI.

## Decision 6 — Provenance Everywhere

Every important AI-derived fact should be traceable.

## Decision 7 — Physician Verification

AI-generated information remains draft/unverified until appropriately reviewed.

## Decision 8 — Integration Adapters

Keep ABDM/HIS-specific logic behind integration interfaces.

---

# 103. Final Backend Architecture

```text
                    ┌──────────────────────┐
                    │   Patient Web/Kiosk  │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      API Gateway     │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   Auth Module           Intake Module          Patient Module
        │                      │                      │
        │                      ▼                      │
        │               Question Engine               │
        │                      │                      │
        │                AI Orchestrator              │
        │               ┌──────┼──────┐              │
        │               ▼      ▼      ▼              │
        │              ASR     OCR    LLM             │
        │               │      │      │              │
        │               └──────┼──────┘              │
        │                      ▼                      │
        │                Clinical Facts               │
        │                      │                      │
        │              ┌───────┴────────┐             │
        │              ▼                ▼             │
        │        Safety Engine      Timeline          │
        │              │                │             │
        │              ▼                │             │
        │          Triage Alert         │             │
        │                               ▼             │
        │                         Summary Engine       │
        │                               │             │
        └───────────────────────────────┼─────────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   PostgreSQL      │
                              └─────────┬─────────┘
                                        │
                    ┌───────────────────┼──────────────────┐
                    │                   │                  │
                    ▼                   ▼                  ▼
              Object Storage          Redis          Audit Logs
                    │
                    ▼
               Documents
                    │
                    ▼
              Integration Layer
                    │
             ┌──────┴──────┐
             ▼             ▼
            HIS           ABDM
```

---

# 104. Final Backend Principle

The backend should be built around one core rule:

> **AI generates suggestions and structured interpretations; the backend stores facts with provenance; safety rules handle critical alerts; and authorized clinicians retain final control over clinical information.**

For the SIH prototype, the highest-value backend flow is:

```text
Patient
 ↓
Secure Session
 ↓
Consent
 ↓
Voice / Touch
 ↓
Adaptive Clinical Interview
 ↓
Structured Clinical Facts
 ↓
Red-Flag Rules
 ↓
Document Upload
 ↓
OCR + Extraction
 ↓
Medical Timeline
 ↓
AI Clinical Summary
 ↓
Patient Confirmation
 ↓
Physician Review
 ↓
Physician Verification
 ↓
HIS / ABDM Integration
```

This backend directly supports the problem statement's intended workflow of patient identification, conversational history collection, document scanning, structured summarization/routing, and physician consultation.
