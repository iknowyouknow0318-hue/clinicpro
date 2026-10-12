# SMARTCARE — Secure Outpatient Queue & Digital Prescription Platform

> **"Secure patient flow. Clearer care."**
> A production-style, compliant outpatient workflow platform for hospitals and clinics. Bilingual (English & தமிழ்) ready.

---

## 1. Product Overview

**SmartCare** is an end-to-end outpatient healthcare platform engineered to optimize the patient journey from online booking to physical clinic arrival, real-time queueing, physician consultation, structured digital prescription issuance, and pharmacy verification.

### Core Principles
- **Assists, Never Replaces, Clinical Judgment**: Does **not** perform autonomous AI diagnosis or auto-prescribe medications. All diagnoses and prescriptions require authorized physician review and digital signature.
- **Privacy by Design**: Cryptographic single-use QR passes contain **no protected health information (PHI)**. Public displays show only token numbers, consulting rooms, and doctor availability—never patient names or medical conditions.
- **Granular Consent Capture**: Captures separate, revocable consents for appointment communication, live queue alerts, messaging channels, digital prescription delivery, and pharmacy sharing.
- **Bilingual Interface**: Native support for **English** and **தமிழ் (Tamil)** across all patient, clinical, and waiting hall screens.

---

## 2. Portals & User Roles

| Role | Portal Route | Primary Capabilities |
| :--- | :--- | :--- |
| **Patient** | `/patient-portal` | OTP login, consent preferences, appointment booking, digital token & secure QR pass, live queue tracker with timeline, "You are next" alert, 2FA-verified prescription viewer & PDF download. |
| **Doctor** | `/doctor` | Active daily schedule & queue, doctor availability controls (Available / Delayed / Paused), atomic "Call Next" with 3-minute timer, patient ID confirmation, clinical notes, pharmacovigilance safety warnings, digital signature stamp. |
| **Receptionist** | `/reception` | Patient search & registration, 2FA arrival check-in (OTP / DOB / last 4 digits of phone), live queue monitor, skip patient, approve rejoin, manual priority override with mandatory reason, token slip print fallback. |
| **Triage Nurse** | `/reception` (Triage Tab) | Clinical urgency assessment, emergency & high-priority queue overrides with mandatory clinical rationale, recalculates active queue order instantly. |
| **Pharmacist** | `/pharmacy` | Scan / enter prescription reference, automated validity checks (physician signature, expiration, consent), view prescribed items (read-only), record partial or full dispensing. |
| **Administrator** | `/intelligence` | Operational analytics (wait-time SLA, no-show rate, doctor throughput, peak arrival windows), clinic & doctor configuration, queue rule management, and system reset. |
| **Auditor / Security** | `/audit-logs` | Tamper-evident audit trail of all staff logins, check-ins, queue calls, priority overrides, prescription signing, security incidents (replay attacks, rate limit warnings), and CSV export. |
| **Waiting Hall TV** | `/public-display` | Full-screen, privacy-safe display for waiting lounges showing current serving token, doctor room, upcoming tokens, and synthesized Web Audio chime bell. |

---

## 3. Demo Credentials

### Hospital Staff Accounts (Available via 1-Click login buttons or manual sign-in):
- **Administrator**: `admin@smartcare.demo` / `Admin@123`
- **Doctor (General Medicine)**: `doctor.arun@smartcare.demo` / `Doctor@123`
- **Receptionist (Front Desk)**: `reception@smartcare.demo` / `Reception@123`
- **Triage Nurse (Urgent Care)**: `triage@smartcare.demo` / `Triage@123`
- **Pharmacist (Dispensary)**: `pharmacy@smartcare.demo` / `Pharmacy@123`

### Patient Portal Access:
- **Mobile OTP Simulation**:
  - Enter mobile number: `9840123450` (or any 10-digit number)
  - Simulated Development OTP: **`123456`**

---

## 4. End-to-End Workflow

```
Patient Mobile OTP Verification
              │
              ▼
Granular Consent Capture (5 Checkboxes)
              │
              ▼
Appointment Booking (Doctor, Date, Slot)
              │
              ▼
Token Number + Secure Short-Lived QR Pass
              │
              ▼
Physical Arrival at Reception / Kiosk
              │
              ▼
2FA Check-In (QR Token + OTP/DOB/Phone Last 4)
              │
              ▼
Live Digital Queue (WAITING Status)
              │
              ▼
Doctor Calls Next Patient (WAITING ➔ CALLED)
  • Queue Mutex Locked
  • 3-Minute Response Countdown
  • Multi-Channel Notification Dispatched
  • Audio Chime on Waiting TV Display
              │
              ▼
Doctor Starts Consultation (IN_CONSULTATION)
  • Verify Patient Identity Card & Allergy Badges
  • Record Chief Complaint, Diagnosis, Clinical Notes
  • Structured Medication Builder (Dose, Frequency, Duration, Route)
  • Drug Allergy & Duplicate Safety Engine
  • Mandatory Reason for Safety Overrides
              │
              ▼
Digital Signature & Immutability Stamp
  • Doctor Medical Registration: TN-MC-48291
  • SHA-256 Signature Verification Stamp
              │
              ▼
Prescription Delivered to Patient Portal
  • 2FA Verification (Last 4 digits / DOB) before viewing
  • Printable / Downloadable PDF Clinical Slip
              │
              ▼
Optional Pharmacy Validation & Dispensing
  • Pharmacist validates signature, expiration, consent
  • Marks PARTIALLY_DISPENSED or FULLY_DISPENSED
              │
              ▼
Audit Logs & Administrative Analytics Recorded
```

---

## 5. Security & Privacy Architecture

1. **Short-Lived Signed QR Passes**:
   - QR tokens contain a cryptographically generated reference token string (`sc_signed_...`) with an expiration window (15 minutes).
   - QR payloads never encode patient names, mobile numbers, Aadhaar, or diagnostic data.
   - Replay protection rejects and audits duplicate check-in attempts.

2. **Second-Factor Arrival Validation**:
   - Prevents unauthorized check-in by validating scanned tokens against secondary verification: Mobile OTP (`123456`), Patient DOB, or the last 4 digits of the verified mobile phone.

3. **Public Waiting Screen Privacy**:
   - The Public Waiting Hall Display (`/public-display`) displays only token numbers (e.g. `A-101`), room numbers (`Room 101`), and physician names.
   - Patient identities, ages, and medical complaints are strictly hidden.

4. **Digital Prescription Integrity**:
   - Once signed by the physician, prescriptions become immutable with a unique SHA-256 digital signature stamp and medical registration number.
   - Patients must pass identity verification before accessing their consultation document.

5. **Pharmacovigilance Safeguards**:
   - Automatic cross-referencing between prescribed medicines and the patient's documented drug allergies (e.g., Penicillin, Sulfa, NSAIDs).
   - Duplicate drug detection.
   - Mandatory authorized clinical reason required to override any safety warning.

6. **Tamper-Evident Audit Logging**:
   - Records every security-sensitive action: logins, token calls, triage priority overrides, prescription signing, and dispensing events.

---

## 6. Project Architecture

```
clinicmwt/
├── frontend/                     # React 19 + TypeScript + Vite Single-Page Application
│   ├── src/
│   │   ├── api/
│   │   │   ├── smartcareStore.ts # Reactive State Engine & Pre-seeded Sample Data
│   │   │   ├── services.ts       # Unified API Services with Resilient Fallback
│   │   │   └── client.ts         # Axios HTTP Client
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # SmartCare Brand, Facility Pill, Language Switcher, TV Link
│   │   │   ├── Sidebar.tsx       # Role-Based Navigation (Doctor, Patient, Reception, Admin)
│   │   │   └── shadcn/           # Design System & UI Components
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # Staff & Patient Authentication Provider
│   │   │   └── LanguageContext.tsx # Bilingual Translation Provider (English & தமிழ்)
│   │   ├── pages/
│   │   │   ├── Login.tsx         # OTP & 1-Click Role Login
│   │   │   ├── PatientPortal.tsx # Live Queue Tracker, Token, 2FA Prescription Viewer
│   │   │   ├── DoctorDashboard.tsx # Doctor Station, Consultation & Prescription Builder
│   │   │   ├── ReceptionDashboard.tsx # 2FA Check-In, Queue Monitor, Print Fallback Slip
│   │   │   ├── IntelligenceDashboard.tsx # Admin Flow Analytics & Queue Rules
│   │   │   ├── AuditLogsPage.tsx # Tamper-Evident Audit Logs & Incident Monitor
│   │   │   ├── PharmacyDashboard.tsx # Prescription Verification & Dispensing Desk
│   │   │   ├── PublicDisplay.tsx # Waiting Hall TV Display with Synthesized Audio Chime
│   │   │   └── PatientRegistration.tsx # Patient Profile & Granular Consent Capture
│   │   └── index.css             # Healthcare Design System (Teal & Navy Palette)
│   └── vite.config.ts
├── backend/                      # Spring Boot 3.4 Java Backend (Optional Server)
│   └── src/main/java/com/clinicflow/
└── README.md
```

---

## 7. Running the Application

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Backend (Spring Boot — Optional)
```bash
cd backend
mvn spring-boot:run
```
Backend API will listen on `http://localhost:8080`.

> **Note**: The frontend incorporates an intelligent in-memory reactive store with localStorage persistence (`smartcareStore.ts`). All roles, live queue movements, 2FA verifications, and digital prescription downloads work completely standalone without external database setup.

---

## 8. Sample Pre-Seeded Data

- **Primary Facility**: SmartCare Medical Centre, Kovilpatti
- **Departments**: General Medicine, Dermatology, Paediatrics, Dental Surgery, Orthopaedics
- **Doctors**:
  1. **Dr. Arun Kumar** — General Medicine (MBBS, MD • Reg: TN-MC-48291 • Room 101)
  2. **Dr. Meera Raj** — Dermatology (MBBS, MD, DVL • Reg: TN-MC-59302 • Room 104)
  3. **Dr. Priya Nandakumar** — Paediatrics (MBBS, DCH, DNB • Reg: TN-MC-38194 • Room 102)
  4. **Dr. Karthik Selvan** — Dental Surgery (BDS, MDS • Reg: TN-DC-12948 • Room 105)
- **20+ Seeded Patients** with diverse demographic profiles, allergies, and appointments.
- **Active Queue States**: Emergency priority case (`E-001`), in-consultation (`A-101`), called with response countdown (`A-102`), waiting list (`A-103` through `A-106`), skipped case (`A-100`), and booked appointments.

---

## 9. Future Roadmap & Production Scaling

- **ABDM (Ayushman Bharat Digital Mission) Milestone 1–3 Integration**: FHIR-compliant Health Information User (HIU) and Health Information Provider (HIP) exchange.
- **Hardware POS Integration**: Direct ESC/POS thermal printing for token slips.
- **SMS & WhatsApp Gateway Integration**: Twilio / Gupshup webhooks for automated delivery receipts.
- **Biometric Kiosk Verification**: Fingerprint / Face Match for seamless hospital check-in.
