# MediKiosk — Complete Product Requirements Document (PRD)

**Problem Statement:** 4 — Patient Case-Taking Software  
**Organization:** All India Institute of Ayurveda, Ministry of AYUSH  
**Category:** Software  
**Theme:** MedTech / Biotech / HealthTech  
**Version:** 1.0

---

## 1. Executive Summary

MediKiosk is an AI-powered patient clinical intake and case-taking platform designed to reduce the time physicians spend collecting patient history and reviewing fragmented medical documents.

The platform moves routine history collection **before the doctor consultation**. Patients interact through voice and touchscreen, in their preferred language, while the system digitizes prescriptions, laboratory reports, discharge summaries and other medical documents.

MediKiosk combines:

- Conversational clinical history-taking
- Multilingual voice interaction
- Touch-based guided interaction
- Medical document scanning and OCR
- Intelligent clinical information extraction
- Chronological medical timelines
- Red-flag detection
- Structured physician-ready summaries
- AYUSH/Ayurvedic history collection
- Consent and privacy controls
- Hospital/HIS and ABDM-oriented integration

The source problem statement identifies clinical history-taking as a major bottleneck in Indian hospitals and highlights fragmented paper records, limited consultation time, multilingual requirements, accessibility needs and the need for structured history before consultation.

---

# 2. Problem Definition

## 2.1 Current Problem

Traditional clinical history-taking requires a doctor or staff member to manually:

1. Ask the patient about symptoms.
2. Determine relevant follow-up questions.
3. Record the patient's history.
4. Review previous medical documents.
5. Interpret laboratory reports.
6. Review previous prescriptions.
7. Organize previous treatments chronologically.
8. Identify allergies, medications and comorbidities.
9. Prepare a clinical history before diagnosis and treatment.

This becomes particularly difficult in high-volume hospitals where consultation time is limited.

The source problem statement describes history-taking as a critical diagnostic activity and notes that well-conducted history-taking can yield the correct diagnosis in 70–80% of cases even before examination or investigation.

---

# 3. Problem Statement

Build a patient-facing software platform that enables patients to independently and comprehensively record their medical history through natural spoken conversation and guided touchscreen interaction, digitize their existing medical documents, and generate a structured, physician-ready clinical history summary before the patient enters the consultation room.

---

# 4. Product Vision

> **Let the patient tell their complete medical story once, and give the doctor a structured version of that story before consultation.**

MediKiosk should transform:

**Patient's unstructured story + physical documents**

into:

**Structured clinical history + chronological medical record + relevant alerts**

before physician consultation.

---

# 5. Product Goals

## Primary Goals

### G1 — Reduce physician history-taking time

Move routine history collection from the consultation room to the patient intake stage.

### G2 — Improve history completeness

Systematically capture clinically relevant information.

### G3 — Digitize paper medical records

Convert prescriptions, laboratory reports and discharge summaries into structured information.

### G4 — Support Indian languages

Allow patients to communicate naturally in their preferred language.

### G5 — Support low-literacy users

Provide an icon-driven, voice-guided interface rather than requiring extensive typing.

### G6 — Support AYUSH clinical workflows

Capture Ayurvedic history and assessment parameters in addition to standard medical history.

### G7 — Generate physician-ready summaries

Convert patient responses and documents into an organized clinical history.

### G8 — Support India's digital health ecosystem

Where technically and legally supported, connect patient information with ABHA/ABDM-compatible systems.

### G9 — Protect sensitive health information

Implement consent, authentication, encryption, access control, auditability and secure session handling.

---

# 6. Non-Goals

MediKiosk must **not** initially attempt to:

- Replace a physician.
- Independently diagnose patients.
- Prescribe medication.
- Autonomously make treatment decisions.
- Replace emergency triage staff.
- Automatically modify official medical records without authorization.
- Treat AI-generated information as medically verified fact.
- Make clinical decisions solely from OCR output.
- Provide autonomous medical advice.

The AI should be positioned as a **clinical intake and information-structuring assistant**, not an autonomous doctor.

---

# 7. Target Users

## 7.1 Patient

A patient visiting an OPD.

Potential characteristics:

- Elderly users
- First-time hospital visitors
- Low-literacy users
- Users unfamiliar with technology
- Regional-language speakers
- Patients carrying paper medical records

## 7.2 Physician

Uses the generated history to:

- Understand the patient quickly.
- Review previous medical history.
- See medications and allergies.
- Review investigations.
- Identify potential red flags.
- Correct AI-generated information.
- Continue with examination, diagnosis and counselling.

## 7.3 Triage Staff

Receives alerts when the system detects potentially urgent symptoms.

## 7.4 Hospital Administrator

Responsible for:

- User management
- Hospital configuration
- Department configuration
- Language configuration
- Integration configuration
- Audit logs
- Analytics
- System monitoring

## 7.5 Clinical Reviewer

Optional role for reviewing AI-generated clinical summaries and improving system quality.

---

# 8. Product Scope

MediKiosk consists of six major modules:

1. Patient Identity & Consent
2. Conversational Multimodal History Engine
3. Medical Document Digitization
4. Clinical History Summary Generator
5. ABHA/ABDM & Hospital Integration
6. Physician Dashboard

The source problem statement explicitly describes conversational history acquisition, document digitization, structured summary generation, and consent/privacy/ABDM integration as core parts of the solution.

---

# 9. High-Level User Journey

```text
Patient arrives
      ↓
Identify / Register
      ↓
Select Language
      ↓
Consent
      ↓
Start Clinical Interview
      ↓
AI asks adaptive questions
      ↓
Patient speaks OR taps
      ↓
Red-flag detection
      ↓
Upload / Scan documents
      ↓
OCR + AI extraction
      ↓
Medical timeline generation
      ↓
AI combines interview + documents
      ↓
Structured clinical summary
      ↓
Patient confirms information
      ↓
Doctor receives summary
      ↓
Doctor reviews / edits / confirms
      ↓
Consultation
      ↓
Record routed to authorized HIS/ABDM systems
```

---

# 10. Functional Requirements

## FR-01 — Patient Identification

The system shall allow a patient to:

- Log in using an existing account.
- Register as a new patient.
- Identify using ABHA ID where supported.
- Enter or scan permitted identity information.
- Associate the session with a hospital visit/OPD registration.
- Continue as a temporary patient session where institutional policy permits.

### Input

```text
ABHA ID / permitted identifier
Name
Age / DOB
Gender
Mobile number
Hospital/OPD information
Language preference
```

### Output

A unique intake session.

---

# 11. FR-02 — Patient Registration

For new patients:

```text
Register
   ↓
Basic demographic details
   ↓
Language
   ↓
Consent
   ↓
Clinical intake
```

The number of mandatory fields should be minimized.

### Design Principle

> Do not make patients type information that can be obtained safely through voice, selection or existing hospital data.

---

# 12. FR-03 — Language Selection

The patient shall select a preferred language.

Example:

```text
Choose your language

हिन्दी
English
বাংলা
मराठी
தமிழ்
తెలుగు
ગુજરાતી
ಕನ್ನಡ
മലയാളം
ਪੰਜਾਬੀ
ଓଡ଼ିଆ
```

The source specifically requires multilingual and multi-accent voice capture across Hindi, English and major regional languages.

Language support must affect:

- Speech recognition
- Question generation
- Text-to-speech
- UI labels
- Patient confirmation
- Error messages

---

# 13. FR-04 — Consent Management

Before collecting sensitive health information, the system must explain:

- What information will be collected.
- Why it is being collected.
- Where it may be stored.
- Who may access it.
- How it will be used.
- What sharing the patient is consenting to.
- How consent can be revoked where applicable.

### Consent Types

```text
Clinical history collection
        ↓
Document processing
        ↓
Hospital record sharing
        ↓
ABHA/ABDM sharing
        ↓
Optional secondary use
```

Consent must be granular rather than a single blanket checkbox.

The source specifically requires consent-first design and compliance with the Digital Personal Data Protection Act 2023 and ABDM consent framework.

---

# 14. FR-05 — Conversational Clinical Interview

This is the core feature.

The AI conducts a structured clinical interview using:

### Voice

The patient speaks naturally.

### Touch

The patient can select:

- Yes
- No
- Sometimes
- Don't know
- Skip

### Example

**AI:**

> What problem brought you to the hospital today?

Patient:

> I've been having chest pain since yesterday.

AI:

> Where exactly do you feel the pain?

Patient:

> In the middle of my chest.

AI:

> Did the pain begin suddenly or gradually?

The next question should depend on previous responses.

---

# 15. Adaptive Questioning Engine

The system must not ask every patient the same long questionnaire.

Instead:

```text
Chief Complaint
       ↓
Clinical Question Tree
       ↓
Relevant Follow-up
       ↓
Patient Response
       ↓
Next Question
```

Example:

```text
Chest pain
 ├── Onset
 ├── Location
 ├── Duration
 ├── Character
 ├── Radiation
 ├── Severity
 ├── Aggravating factors
 ├── Relieving factors
 ├── Associated symptoms
 │    ├── Breathlessness
 │    ├── Sweating
 │    ├── Nausea
 │    └── Dizziness
 └── Relevant history
```

The source specifically specifies adaptive questioning based on chief complaint and previous answers and references the SOCRATES framework where appropriate.

---

# 16. Structured Clinical History

The AI should transform the conversation into:

```text
Chief Complaint
↓
History of Present Illness
↓
Past Medical History
↓
Past Surgical History
↓
Drug History
↓
Allergy History
↓
Family History
↓
Personal History
↓
Review of Systems
↓
Previous Investigations
```

The source explicitly identifies this standardized clinical format.

---

# 17. FR-06 — Red-Flag Detection

During the interview, the AI must detect potentially urgent symptoms.

Examples identified in the source include:

- Acute chest pain with dyspnoea
- Stroke symptoms

When detected:

```text
Patient response
      ↓
Red-flag classifier
      ↓
Potential emergency
      ↓
Immediate priority alert
      ↓
Triage staff
```

The system should not tell the patient that it has independently diagnosed an emergency.

Example:

> Some of your symptoms may require immediate medical attention. Please wait here while hospital staff assist you.

The source requires red-flag detection and priority alerts to triage staff.

---

# 18. FR-07 — Medical Document Upload

Patients can upload/scan:

- Prescriptions
- Lab reports
- Discharge summaries
- Imaging reports
- Medical certificates
- Previous consultation documents

The source specifically identifies prescriptions, laboratory reports and discharge summaries as target documents.

---

# 19. FR-08 — Document Scanning

The kiosk/device should support:

```text
Camera
 ↓
Document detection
 ↓
Capture
 ↓
Image enhancement
 ↓
OCR
 ↓
Document classification
 ↓
Medical information extraction
```

---

# 20. FR-09 — OCR

OCR should support:

- Printed text
- Handwritten text
- Multiple languages

The source explicitly requires OCR for handwritten and printed prescriptions, laboratory reports and discharge summaries in multiple languages.

---

# 21. FR-10 — Intelligent Medical Extraction

The system should extract:

### Diagnosis

```text
Type 2 Diabetes
Hypertension
```

### Medication

```text
Medicine
Dose
Frequency
Duration
Route
```

### Investigation

```text
Test
Value
Unit
Reference range
Date
```

### Procedures

```text
Procedure
Date
Hospital
```

### Surgery

```text
Surgery
Date
```

---

# 22. FR-11 — Laboratory Abnormality Detection

Example:

```text
HbA1c
Result: 9.2%
Reference: < 5.7%
Status: Potentially elevated
```

The system should flag the value for physician attention, not independently diagnose the patient.

The source explicitly requires abnormal-value highlighting and flags out-of-range laboratory values for physician attention.

---

# 23. FR-12 — Medication Interaction Flagging

The document pipeline may identify potential medication interactions.

Example:

```text
Potential medication interaction detected

Drug A ↔ Drug B

Review recommended.
```

This is an assistive alert and requires clinical verification.

---

# 24. FR-13 — Medical Timeline

The system shall organize extracted records chronologically.

Example:

```text
2022
│
├── Diabetes diagnosed
│
2023
│
├── Lab investigation
│
2024
│
├── Hospital admission
│
├── Surgery
│
2025
│
├── New medication
│
2026
│
└── Current consultation
```

The source explicitly requires automatic dating and chronological organization of medical documents.

---

# 25. FR-14 — Clinical Summary Generator

The AI combines:

```text
Patient interview
+
Document extraction
+
Medical timeline
+
Previous history
```

into one structured summary.

Example:

```text
PATIENT CLINICAL SUMMARY

Chief Complaint:
Chest discomfort for 2 days.

History of Present Illness:
...

Past Medical History:
...

Medications:
...

Allergies:
...

Previous Investigations:
...

Family History:
...

Review of Systems:
...

Relevant Documents:
...

Potential Alerts:
...

Information requiring physician confirmation:
...
```

---

# 26. FR-15 — Explainability & Verification

Every AI-derived piece of information should have a traceable source where feasible.

Example:

```text
Hypertension

Source:
Previous prescription — 12 Aug 2025
```

Patient information:

```text
Patient reports:
"Chest pain for two days"

Source:
Patient interview — 09:42 AM
```

The source explicitly requires an editable and verifiable summary where the physician retains control and can accept, amend or reject the information.

---

# 27. FR-16 — Patient Confirmation

Before final submission:

```text
AI-generated summary
       ↓
Patient confirmation
       ↓
"Is this information correct?"
       ↓
Confirm / Edit
```

For low-literacy users, confirmation should be voice-guided.

---

# 28. FR-17 — Physician Dashboard

The physician dashboard should show:

### Patient Header

```text
Patient
Age
Gender
OPD
Visit ID
ABHA status
```

### Clinical Snapshot

```text
Chief complaint
Duration
Severity
Important history
```

### Alerts

```text
⚠ Potential red flag
⚠ Abnormal lab
⚠ Allergy
⚠ Medication issue
```

### History

```text
HPI
PMH
PSH
Drug history
Allergies
Family history
Personal history
ROS
```

### Documents

```text
Prescription
Lab reports
Discharge summary
Imaging
```

### Timeline

Chronological patient history.

---

# 29. FR-18 — Physician Editing

Physicians must be able to:

- Edit AI-generated information.
- Correct transcription.
- Add missing history.
- Remove incorrect information.
- Mark information as verified.
- Reject AI suggestions.

AI must never overwrite physician-confirmed data without explicit authorization.

---

# 30. FR-19 — AYUSH Mode

The system should support an AYUSH-specific clinical workflow.

The source requires assessment of:

- Prakriti
- Vikriti
- Sara
- Samhanana
- Pramana
- Satmya
- Sattva
- Ahara Shakti
- Vyayama Shakti
- Avara/Madhyama/Uttama Ahara-Vihara
- Relevant Ayurvedic history

Example:

```text
Clinical Mode

○ Modern Medicine
○ Ayurveda
○ Integrated
```

When Ayurveda is selected:

```text
Standard History
        +
Ayurvedic History
```

---

# 31. FR-20 — Bilingual Output

### Patient-facing

Local-language audio confirmation.

### Physician-facing

English/Hindi structured summary.

The source explicitly specifies patient-facing audio confirmation in local language and physician-facing summary in English/Hindi.

---

# 32. FR-21 — Patient Dashboard

The source describes a personal login/password dashboard for patients to enter data and store medical records.

Dashboard:

```text
My Profile
My Medical History
My Documents
My Visits
My Reports
My Consents
My ABHA Connection
```

---

# 33. FR-22 — Accessibility

The system must support:

### Low-literacy mode

Large icons + audio.

### Elderly mode

Large buttons + high contrast.

### Visually impaired mode

Audio-guided interaction.

### Touch mode

Large selectable answers.

### Voice mode

Hands-free interaction.

### Stretch Goal

Sign-language video assistance.

The source specifically proposes audio-guided, large-text/high-contrast and multilingual UI, with sign-language video as a stretch goal.

---

# 34. FR-23 — Session Management

A patient intake session should have:

```text
Session ID
Patient ID
Visit ID
Start time
End time
Consent state
Completion state
```

Temporary sensitive data should be removed according to the institution's retention policy after submission.

The source explicitly requires temporary session data to be cleared immediately after submission.

---

# 35. FR-24 — Audit Logs

The system should record:

```text
Who accessed data
When
What was viewed
What was changed
What was exported
What consent was granted/revoked
```

Audit records should be protected from unauthorized modification.

---

# 36. FR-25 — Admin Dashboard

Admin capabilities:

### Hospital Configuration

- Departments
- OPDs
- Doctors
- Triage staff
- Kiosks

### System Management

- User management
- Roles
- Permissions
- Languages
- AI configuration
- Integration configuration

### Analytics

- Patients processed
- Average intake time
- Completion rate
- Document processing volume
- Red-flag alerts
- AI correction rate

---

# 37. Role-Based Access Control

| Feature | Patient | Doctor | Triage | Admin |
|---|---:|---:|---:|---:|
| Own profile | ✅ | ❌ | ❌ | Controlled |
| Clinical intake | ✅ | ❌ | Assist | ❌ |
| Documents | Own | Assigned patient | Limited | Controlled |
| Clinical summary | Own | Assigned patient | Limited | Controlled |
| Edit summary | ❌ | ✅ | ❌ | Controlled |
| Red flags | ❌ | ✅ | ✅ | Analytics |
| Patient management | ❌ | Assigned | Assigned | ✅ |
| Audit logs | ❌ | Limited | Limited | ✅ |
| System settings | ❌ | ❌ | ❌ | ✅ |

---

# 38. AI Architecture

## 38.1 AI Pipeline

```text
                 ┌──────────────┐
                 │    Patient   │
                 └──────┬───────┘
                        │
                Voice / Touch
                        │
                        ▼
             ┌────────────────────┐
             │ Speech Recognition  │
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ Clinical Dialogue  │
             │       Engine        │
             └─────────┬──────────┘
                       │
                       ▼
              Structured History
                       │
                       │
Documents ──► OCR ──► NLP/Extraction
                       │
                       ▼
                Medical Timeline
                       │
                       ▼
             ┌────────────────────┐
             │ Clinical Summary   │
             │     Generator      │
             └─────────┬──────────┘
                       │
                       ▼
                Physician Review
```

---

# 39. Recommended Technology Architecture

This section is a proposed implementation architecture rather than a technology stack mandated by the source problem statement.

## Frontend

### Patient/Kiosk

- React
- Next.js or Vite
- Tailwind CSS
- PWA capability
- Web/native speech integration as appropriate

### Physician Dashboard

- React
- TypeScript
- Tailwind CSS
- Component library
- Responsive desktop/tablet UI

---

# 40. Backend

Recommended:

```text
Node.js
+
TypeScript
+
NestJS / Express
```

Suggested services:

```text
Auth Service
Patient Service
Clinical Intake Service
Document Service
AI Orchestration Service
Consent Service
Integration Service
Notification Service
Audit Service
```

---

# 41. Database

### PostgreSQL

Recommended for structured clinical data.

Example tables:

```text
users
patients
visits
encounters
clinical_histories
symptoms
medications
allergies
investigations
documents
document_extractions
clinical_summaries
consents
audit_logs
triage_alerts
```

---

# 42. Document Storage

Use S3-compatible object storage for:

- Scanned prescriptions
- Lab reports
- Discharge summaries
- Images

Sensitive documents should not be stored directly in application-server directories.

---

# 43. Search / Medical Timeline

Potential architecture:

```text
PostgreSQL
+
OpenSearch / Elasticsearch
```

for searching large document collections.

Vector search can be introduced later for semantic retrieval, but it should not become the source of truth for clinical facts.

---

# 44. AI Layer

Potential components:

### ASR

Indian-language speech recognition.

### LLM

Clinical dialogue and structured extraction.

### OCR

Printed + handwritten medical documents.

### NLP

Medical entity extraction.

### Rules Engine

High-confidence safety and red-flag rules.

### TTS

Local-language voice prompts.

---

# 45. Critical AI Design Principle

Do not let the LLM control the entire clinical workflow.

### Bad Architecture

```text
Patient → LLM → Database
```

### Better Architecture

```text
Patient
 ↓
ASR
 ↓
Structured clinical extraction
 ↓
Validated schema
 ↓
Database
 ↓
LLM summary
 ↓
Physician
```

The database should contain structured, auditable information.

---

# 46. Clinical Data Schema

Simplified encounter structure:

```json
{
  "patient": {},
  "chiefComplaint": [],
  "historyOfPresentIllness": {},
  "pastMedicalHistory": [],
  "pastSurgicalHistory": [],
  "medications": [],
  "allergies": [],
  "familyHistory": [],
  "personalHistory": {},
  "reviewOfSystems": {},
  "investigations": [],
  "documents": [],
  "timeline": [],
  "redFlags": [],
  "ayushHistory": {},
  "aiConfidence": {},
  "physicianVerification": {}
}
```

---

# 47. AI Confidence Model

Every extracted clinical fact should ideally carry:

```text
Value
Source
Confidence
Verification status
Timestamp
```

Example:

```text
Medication: Metformin 500 mg
Source: Prescription
Confidence: 0.96
Verified: No
```

After physician confirmation:

```text
Verified: Yes
```

---

# 48. AI Hallucination Prevention

The system must follow:

### Rule 1

Never invent missing patient information.

### Rule 2

Unknown ≠ No.

For example:

```text
Allergy: Unknown
```

must not become:

```text
No known allergies
```

unless explicitly confirmed.

### Rule 3

Patient statements and extracted document facts must remain distinguishable.

### Rule 4

AI inference must never silently become a confirmed medical fact.

### Rule 5

Physician-confirmed information has higher authority than AI-generated information.

---

# 49. Red-Flag Architecture

Use a hybrid approach:

```text
Patient response
      ↓
Clinical NLP
      ↓
Rule-based safety engine
      ↓
Risk classification
      ↓
Triage alert
```

Do not rely exclusively on an LLM for emergency detection.

---

# 50. Example Red-Flag Flow

```text
Patient:
"I suddenly have severe chest pain and difficulty breathing."

        ↓

Symptom extraction

        ↓

Chest pain = TRUE
Dyspnoea = TRUE
Acute onset = TRUE

        ↓

Safety rules

        ↓

HIGH PRIORITY

        ↓

Triage dashboard:
"Priority assessment required"

        ↓

Staff intervention
```

---

# 51. Document AI Pipeline

```text
Upload
 ↓
Virus/security scan
 ↓
Image preprocessing
 ↓
OCR
 ↓
Document classification
 ↓
Entity extraction
 ↓
Medical normalization
 ↓
Confidence scoring
 ↓
Human/AI validation
 ↓
Structured record
```

---

# 52. Medical Timeline Algorithm

Documents should be ordered using:

```text
Explicit document date
        ↓
Encounter date
        ↓
Investigation date
        ↓
Prescription date
        ↓
Upload date
```

If the actual medical date cannot be determined:

```text
Date = Unknown
```

rather than fabricating a date.

---

# 53. Physician Dashboard UX

Recommended layout:

```text
┌───────────────────────────────────────────────┐
│ Patient: XXXXX      Age: 54    Visit: OPD-102 │
├───────────────────────────────────────────────┤
│ ⚠ Important Alerts                            │
│                                               │
│ Chief Complaint                               │
│ Chest pain × 2 days                           │
├───────────────────┬───────────────────────────┤
│ Clinical History  │ Timeline                  │
│                   │                           │
│ HPI               │ 2024 ─ Diagnosis          │
│ PMH               │ 2025 ─ Lab                │
│ Medications       │ 2025 ─ Prescription       │
│ Allergies         │ 2026 ─ Current visit      │
│ Family History    │                           │
├───────────────────┴───────────────────────────┤
│ Documents                                     │
│ [Prescription] [Lab Report] [Discharge]       │
├───────────────────────────────────────────────┤
│ [Edit] [Confirm] [Reject AI Summary]          │
└───────────────────────────────────────────────┘
```

---

# 54. Patient Kiosk UX

The interface should be extremely simple.

### Home

```text
Welcome

[Start / Continue]

Choose Language
🎤 Voice Mode
👆 Touch Mode
```

### Interview

```text
        🎤

"What problem are you having?"

[Speak]

or

[Tap an answer]
```

### Progress

```text
History
████████░░ 80%
```

### Document Scan

```text
Place prescription inside the frame

[ Scan ]
```

### Confirmation

```text
We recorded:

Chest pain for 2 days

Is this correct?

[YES] [EDIT]
```

---

# 55. Offline / Poor Connectivity Strategy

This is important for public-hospital environments.

The system should support graceful degradation.

If connectivity is temporarily unavailable:

- Cache UI assets.
- Store encrypted temporary intake data.
- Queue synchronization.
- Continue non-cloud-dependent operations where technically possible.

Clinical AI functionality should not be silently presented as available when the required backend is unreachable.

The source identifies connectivity and digital comfort as challenges for some patient groups, particularly elderly, rural and first-visit populations.

---

# 56. Security Requirements

## Authentication

Use secure authentication mechanisms appropriate to each role.

## Authorization

Use RBAC plus patient/encounter-level access controls.

## Encryption

```text
Data in transit → TLS
Data at rest → Encryption
Sensitive secrets → Secret manager
```

## Session Security

- Short-lived sessions.
- Automatic timeout.
- Device reset after patient session.
- Secure deletion of temporary session data.

## Auditability

Sensitive access should be logged.

---

# 57. Privacy Requirements

The system should implement:

- Consent-first collection.
- Purpose limitation.
- Minimum necessary data.
- Access control.
- Revocation mechanisms where applicable.
- Data retention policies.
- Secure deletion.
- Audit trails.

The uploaded problem statement specifically identifies the Digital Personal Data Protection Act 2023 and ABDM consent framework as compliance requirements.

**Important:** Production implementation should involve legal and privacy review. This PRD is not a legal compliance certification.

---

# 58. ABDM Integration

Proposed architecture:

```text
MediKiosk
    ↓
ABDM-compatible integration layer
    ↓
Consent management
    ↓
ABHA/PHR ecosystem
```

Potential capabilities:

- ABHA identification
- Consent management
- Health record linkage
- Health Information Exchange
- FHIR-based data exchange

The source explicitly calls for linking structured history to the patient's ABHA record and integrating with hospital information systems.

---

# 59. FHIR-Oriented Data Model

Potential mapping:

| MediKiosk Data | FHIR Concept |
|---|---|
| Patient | Patient |
| Visit | Encounter |
| Chief complaint | Condition / Observation |
| Medication | MedicationStatement / MedicationRequest depending on workflow |
| Allergy | AllergyIntolerance |
| Investigation | Observation / DiagnosticReport |
| Document | DocumentReference |
| Clinical summary | Composition / Document |
| Consent | Consent |

Exact resource/profile mapping should be validated against the hospital's ABDM implementation requirements before production.

---

# 60. API Architecture

## Authentication

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
```

## Patient

```http
GET /api/patients/:id
PATCH /api/patients/:id
```

## Intake

```http
POST /api/intake/session
POST /api/intake/session/:id/response
GET /api/intake/session/:id
POST /api/intake/session/:id/complete
```

## Documents

```http
POST /api/documents
POST /api/documents/:id/process
GET /api/documents/:id
```

## Summary

```http
POST /api/summaries/generate
GET /api/summaries/:id
PATCH /api/summaries/:id
POST /api/summaries/:id/confirm
```

## Physician

```http
GET /api/doctor/queue
GET /api/doctor/patients/:id
PATCH /api/doctor/summaries/:id
```

## Triage

```http
GET /api/triage/alerts
POST /api/triage/alerts/:id/acknowledge
```

---

# 61. Example AI Question API

```json
{
  "sessionId": "SES-10291",
  "question": {
    "text": "Where exactly do you feel the pain?",
    "audioUrl": "...",
    "type": "clinical_followup"
  },
  "expectedResponse": {
    "inputModes": [
      "voice",
      "touch"
    ]
  }
}
```

---

# 62. Example Clinical Summary API

```json
{
  "chiefComplaint": {
    "text": "Chest pain",
    "duration": "2 days",
    "source": "patient"
  },
  "historyOfPresentIllness": {
    "onset": "sudden",
    "location": "central chest",
    "severity": 7,
    "associatedSymptoms": [
      "dyspnoea"
    ]
  },
  "allergies": {
    "status": "unknown"
  },
  "verification": {
    "status": "pending"
  }
}
```

---

# 63. Non-Functional Requirements

## Performance

Proposed engineering targets:

- Kiosk UI response: < 1 second for normal local interactions.
- API response: < 2 seconds for normal transactional operations.
- AI question generation: target < 5 seconds where infrastructure permits.
- Document processing: asynchronous when processing takes longer.

These are proposed engineering targets, not requirements stated in the source.

---

# 64. Availability

Proposed production target:

**99.5%+**, excluding scheduled maintenance.

Critical services:

- Authentication
- Patient intake
- Physician dashboard
- Triage alerts

should have appropriate redundancy.

---

# 65. Scalability

The system should support:

```text
1 Hospital
   ↓
Multiple OPDs
   ↓
Multiple Kiosks
   ↓
Thousands of patients/day
```

The source problem specifically discusses environments handling thousands of OPD patients daily.

---

# 66. Reliability

The system should prevent:

- Lost patient sessions.
- Duplicate records.
- Duplicate document uploads.
- Partial clinical summaries.
- Incorrect patient-document associations.

Every session should have an immutable internal ID.

---

# 67. Observability

Monitor:

```text
API latency
AI latency
ASR errors
OCR errors
Failed uploads
Failed integrations
Session abandonment
Red-flag alerts
AI correction rates
```

---

# 68. Analytics

## Patient Analytics

- Intake completion rate
- Average intake time
- Abandonment rate
- Language distribution
- Voice vs touch usage

## Clinical Workflow

- Average doctor review time
- Average summary correction time
- Number of missing fields
- Number of red-flag alerts

## AI Quality

- ASR accuracy
- OCR accuracy
- Entity extraction accuracy
- Physician correction rate
- False positive/negative safety alerts

---

# 69. Success Metrics

## Primary KPIs

### 1. History completion rate

```text
Completed sessions / started sessions
```

Proposed pilot target: **≥80%**

### 2. Physician time saved

```text
Traditional history-taking time
-
MediKiosk workflow time
```

### 3. Summary correction rate

```text
AI fields corrected / AI fields generated
```

Lower is generally better, but accuracy must be prioritized over minimizing corrections.

### 4. Document extraction accuracy

Measure:

- Diagnosis extraction
- Medication extraction
- Lab value extraction
- Date extraction

### 5. Red-flag sensitivity

For safety-critical alerts, prioritize minimizing dangerous misses.

### 6. Patient usability

Measure completion without staff intervention.

---

# 70. MVP Scope

For an SIH prototype, do not attempt to build the entire production ABDM ecosystem.

The MVP should contain:

## Patient

- Registration
- Language selection
- Consent
- Voice/text interview
- Touch answers
- Adaptive questions
- Basic red-flag detection
- Document upload
- OCR
- Structured history
- Summary confirmation

## Doctor

- Login
- Patient queue
- Clinical summary
- Timeline
- Documents
- Alerts
- Edit/confirm

## Admin

- Basic dashboard
- Patient/session analytics

---

# 71. MVP Demo Scenario

The strongest demo should show:

### Step 1

Patient arrives.

### Step 2

Selects Hindi.

### Step 3

Grants consent.

### Step 4

AI asks:

> Aapko kis wajah se hospital aana pada?

Patient answers naturally.

### Step 5

AI identifies chief complaint.

### Step 6

AI asks adaptive follow-up questions.

### Step 7

Patient scans:

- Old prescription
- Lab report
- Discharge summary

### Step 8

OCR extracts:

```text
Diabetes
Medication
HbA1c
Previous hospitalization
```

### Step 9

System creates timeline.

### Step 10

AI generates:

```text
Chief Complaint
HPI
Past History
Medication
Allergy
Investigations
Timeline
Alerts
```

### Step 11

Doctor opens dashboard.

### Step 12

Doctor reviews the information.

### Step 13

Doctor edits an incorrect field.

### Step 14

Doctor confirms the summary.

This demonstrates the complete product value proposition.

---

# 72. V2 Features

After MVP:

- More Indian languages.
- Better handwriting OCR.
- Advanced document classification.
- More sophisticated medical timeline.
- FHIR interoperability.
- Hospital HIS integration.
- ABHA integration.
- Advanced AYUSH workflow.
- Patient medical-record dashboard.
- Appointment integration.
- Multi-hospital support.

---

# 73. V3 Features

Potential advanced capabilities:

## Multimodal clinical intake

```text
Voice
+
Touch
+
Documents
+
Images
```

## Longitudinal patient history

Build a continuously updated patient timeline.

## Clinical knowledge assistance

Allow physicians to search patient history conversationally.

Example:

> Show the patient's diabetes-related reports from the last two years.

## Population analytics

Only using appropriately governed and authorized aggregated/de-identified data.

---

# 74. Features to Avoid

Avoid feature creep such as:

- Online pharmacy.
- Generic chatbot.
- Fitness tracker.
- Appointment marketplace.
- E-commerce.
- Insurance marketplace.
- Social network.
- Generic AI health assistant.

These dilute the core product.

The core product is:

> **AI-powered clinical intake + medical document digitization + structured physician summary.**

---

# 75. Key Product Risks

## Risk 1 — AI hallucination

### Mitigation

Source-backed extraction + confidence + verification.

## Risk 2 — Incorrect red-flag detection

### Mitigation

Hybrid AI + deterministic clinical rules + human triage.

## Risk 3 — Poor speech recognition

Challenges include:

- Accents
- Background noise
- Elderly speech
- Regional languages

### Mitigation

Noise handling + confirmation + touch fallback.

## Risk 4 — Bad handwriting OCR

### Mitigation

Confidence scores + original document viewer + physician verification.

## Risk 5 — Low patient adoption

### Mitigation

Extremely simple UX and staff-assisted onboarding.

## Risk 6 — Privacy breach

### Mitigation

Encryption + RBAC + consent + audit logs + secure sessions.

## Risk 7 — Integration complexity

ABDM/HIS integration can become a project by itself.

### Mitigation

Build an integration abstraction layer and use mock APIs for MVP.

---

# 76. Data Lineage

Every clinical field should ideally have:

```text
Field
Value
Source
Timestamp
Confidence
Verification
```

Example:

| Field | Value | Source | Confidence | Verified |
|---|---|---|---:|---|
| Chief complaint | Chest pain | Patient voice | 98% | Yes |
| HbA1c | 9.2% | Lab report | 96% | No |
| Medication | Metformin | Prescription | 91% | Yes |
| Allergy | Unknown | Not provided | — | No |

This provides a clear distinction between patient-reported, document-derived and physician-verified information.

---

# 77. Product Architecture

```text
                         MEDIKIOSK
                             │
              ┌──────────────┴──────────────┐
              │                             │
        PATIENT PLATFORM              CLINICIAN PLATFORM
              │                             │
       ┌──────┼───────┐              ┌──────┼──────┐
       │      │       │              │      │      │
     Voice  Touch  Documents       Summary Timeline Alerts
       │      │       │              │      │      │
       └──────┼───────┘              └──────┼──────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                      AI ORCHESTRATION
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
         ASR                OCR                LLM
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    CLINICAL DATA LAYER
                             │
                    ┌────────┴────────┐
                    │                 │
               PostgreSQL        Object Storage
                    │                 │
                    └────────┬────────┘
                             │
                     INTEGRATION LAYER
                             │
                  ┌──────────┴──────────┐
                  │                     │
                 HIS                  ABDM
```

---

# 78. Database ERD — High Level

```text
USER
 │
 └── PATIENT
       │
       ├── VISIT
       │     │
       │     ├── INTAKE_SESSION
       │     │       ├── QUESTIONS
       │     │       └── RESPONSES
       │     │
       │     ├── CLINICAL_HISTORY
       │     ├── CLINICAL_SUMMARY
       │     ├── DOCUMENT
       │     │     └── DOCUMENT_EXTRACTION
       │     │
       │     ├── INVESTIGATION
       │     ├── MEDICATION
       │     ├── ALLERGY
       │     └── TRIAGE_ALERT
       │
       └── CONSENT
```

---

# 79. Acceptance Criteria

## Patient Intake

- [ ] Patient can start a session.
- [ ] Patient can choose language.
- [ ] Patient can provide answers through voice.
- [ ] Patient can answer through touch.
- [ ] AI can ask follow-up questions.
- [ ] Session can be resumed.
- [ ] Patient can review information.

## Document AI

- [ ] Patient can upload a document.
- [ ] OCR processes document.
- [ ] System extracts medical entities.
- [ ] Extracted data has confidence/source metadata.
- [ ] Original document remains accessible.

## Clinical Summary

- [ ] Summary follows structured clinical format.
- [ ] Patient history is separated from extracted document information.
- [ ] Physician can edit summary.
- [ ] Physician can confirm/reject AI-generated information.

## Safety

- [ ] Red flags are detected.
- [ ] Triage receives alerts.
- [ ] System does not autonomously diagnose.
- [ ] AI uncertainty is visible.

## Security

- [ ] Authentication works.
- [ ] RBAC works.
- [ ] Consent is recorded.
- [ ] Audit events are generated.
- [ ] Temporary session data is securely handled.

---

# 80. Definition of Done

A feature is complete only when:

1. Frontend is implemented.
2. Backend API is implemented.
3. Database schema is implemented.
4. Authentication/authorization is applied.
5. Validation is implemented.
6. Error handling is implemented.
7. Audit requirements are addressed.
8. Unit tests are added.
9. Integration tests are added where appropriate.
10. UI is tested on target kiosk/tablet devices.
11. Accessibility is reviewed.
12. Security is reviewed.
13. Clinical safety is reviewed where relevant.
14. Documentation is updated.

---

# 81. Development Roadmap

## Phase 1 — Foundation

**Week 1**

- Requirements
- UI architecture
- Database
- Authentication
- Patient/doctor roles
- Design system

## Phase 2 — Patient Intake

**Week 2**

- Patient registration
- Language selection
- Consent
- Voice interface
- Touch interface
- Session management

## Phase 3 — AI Interview

**Week 3**

- Adaptive questioning
- Clinical schema
- HPI generation
- Red-flag engine

## Phase 4 — Document AI

**Week 4**

- Upload
- OCR
- Extraction
- Timeline
- Lab highlighting

## Phase 5 — Physician Dashboard

**Week 5**

- Patient queue
- Clinical summary
- Documents
- Timeline
- Alerts
- Editing

## Phase 6 — Integration & Security

**Week 6**

- Audit logs
- Encryption
- Consent
- FHIR mapping
- Mock ABDM/HIS integration

## Phase 7 — Testing

**Week 7**

- Functional testing
- AI evaluation
- Accessibility
- Security
- Performance

## Phase 8 — Demo/Pilot

**Week 8**

- End-to-end testing
- Hospital workflow simulation
- Metrics collection
- SIH presentation/demo

---

# 82. Team Structure

For a 5–6 person development team:

### Developer 1 — Frontend

Patient/kiosk interface.

### Developer 2 — Frontend

Physician/admin dashboard.

### Developer 3 — Backend

APIs, database and authentication.

### Developer 4 — AI/ML

ASR, OCR, LLM orchestration and extraction.

### Developer 5 — Integration/Security

ABDM/FHIR, consent, audit and security.

### Developer 6 — Product/QA

Testing, clinical workflows, documentation and demo.

---

# 83. Recommended MVP Stack

```text
Frontend
React + TypeScript + Tailwind

Backend
Node.js + TypeScript + NestJS

Database
PostgreSQL

Cache
Redis

Storage
S3-compatible object storage

Realtime
WebSocket / Socket.IO

AI
LLM + structured output

Speech
Indian-language ASR

OCR
Medical OCR pipeline

Authentication
JWT/OAuth-compatible architecture

Deployment
Docker

Reverse Proxy
Nginx

Monitoring
OpenTelemetry + centralized logs
```

---

# 84. Final Product Positioning

## One-Line Pitch

> **MediKiosk is an AI-powered clinical intake platform that lets patients tell their medical story in their own language, digitizes their previous medical records, and gives physicians a structured, verifiable clinical history before consultation.**

## Core Loop

```text
LISTEN
   ↓
UNDERSTAND
   ↓
STRUCTURE
   ↓
DIGITIZE
   ↓
VERIFY
   ↓
SUMMARIZE
   ↓
ASSIST THE DOCTOR
```

---

# 85. SIH Prototype Priorities

For an SIH prototype, prioritize these seven capabilities:

1. **Voice-based multilingual patient interview**
2. **Adaptive clinical questioning**
3. **Red-flag detection**
4. **Prescription/lab-report OCR**
5. **Automatic medical timeline**
6. **Physician-ready structured summary**
7. **Doctor dashboard with edit/verify functionality**

The source problem statement centers on the chain:

**conversational history → document digitization → structured summary → consent/integration → physician consultation.**

The source also states that there is **no dataset link or demo video provided**. For a prototype, use a controlled synthetic dataset of dummy patient cases and medical documents rather than real patient data.

---

# 86. Recommended Demo Architecture

```text
Patient Kiosk
     │
     ├── Voice
     ├── Touch
     └── Document Scanner
              │
              ▼
        AI Intake Engine
              │
       ┌──────┼───────┐
       ▼      ▼       ▼
      ASR     OCR    Red Flags
       │      │       │
       └──────┼───────┘
              ▼
       Clinical JSON
              │
              ▼
      Summary Generator
              │
              ▼
       Physician Dashboard
              │
       ┌──────┴──────┐
       ▼             ▼
    Edit/Verify   Timeline
       │
       ▼
   HIS / ABDM
```

---

# 87. Final Product Principle

MediKiosk should not be positioned as another generic healthcare chatbot.

Its purpose is much narrower and more valuable:

> **Capture the patient's story before consultation, digitize the patient's existing records, organize the information, identify items requiring attention, and present a verifiable clinical history to the physician.**

That focus should guide the MVP, architecture, UI, AI design and SIH presentation.
