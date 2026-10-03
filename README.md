# Mini Placement Portal

A centralized college placement management portal connecting students, TPO staff, companies, and recruitment drives in a single system.

---

## Project Overview

Mini Placement Portal is a full-stack web application designed to streamline the college placement process. It provides a structured workflow where students can register, build and submit their academic profiles for TPO verification, browse eligible recruitment drives, apply for specific job roles, upload resumes, and track their application status.

TPO (Training and Placement Officer) users manage the entire placement pipeline — from adding companies and creating multi-role recruitment drives with eligibility criteria, to reviewing student profiles, managing applications, scheduling interviews, and exporting placement records.

---

## Key Features

| Module | Features |
|---|---|
| **Authentication** | Student registration and login (email + password), TPO login with OTP verification, forgot password / OTP-based reset, JWT-protected routes |
| **Student Profile** | Complete academic profile (10th, 12th, CGPA, backlogs, D2D details), profile photo via Cloudinary, profile lock and submission for TPO review |
| **Profile Verification** | TPO can verify or reject student profiles; students can only apply after profile is `VERIFIED` |
| **Companies** | TPO can create, view, update, and delete companies; company logo uploaded via Cloudinary; deletion blocked if active drives exist |
| **Recruitment Drives** | One drive per company containing multiple job roles; CTC range, openings, job location, drive date, application deadline, drive status |
| **Multi-Role Drives** | A single drive can have multiple `DriveRole` entries (e.g. Software Engineer, Data Analyst); each role has its own CTC and openings |
| **Eligibility** | Drive-level eligibility criteria (CGPA, 10th%, 12th%, D2D CGPA, active backlogs, allowed departments, allowed student types); optional per-role custom eligibility override |
| **Applications** | Student can apply to one role per drive; resume uploaded per application (Cloudinary); application status tracked (APPLIED -> SHORTLISTED -> INTERVIEW -> SELECTED / REJECTED) |
| **Resume** | Resume is attached per application (not shared globally); students also have a profile-level resume; TPO can view application resumes |
| **Interviews** | TPO can schedule and update interview rounds (date, time, mode, meeting link, location, instructions) per application |
| **TPO Applications** | View all applications with filters; update status; view resume; export to CSV |
| **History** | TPO placement history view of completed/selected applications |
| **TPO Users** | TPO can manage other TPO user accounts and their own profile |
| **Search** | Debounced search (min 3 characters, 500ms delay) on Students, Companies, Drives, Applications, and History pages |
| **Export** | TPO can export applications to CSV |

---

## System Overview

```mermaid
flowchart LR
    subgraph S["Student Flow"]
        direction TB
        S1[Register / Login] --> S2[Complete Profile]
        S2 --> S3[TPO Verification]
        S3 --> S4[Browse Drives]
        S4 --> S5[Select Role]
        S5 --> S6[Eligibility Check]
        S6 --> S7[Apply + Upload Resume]
        S7 --> S8[Track Application]
    end

    subgraph T["TPO Flow"]
        direction TB
        T1[Login + OTP] --> T2[Dashboard]
        T2 --> T3[Manage Students]
        T2 --> T4[Manage Companies]
        T2 --> T5[Create Drives + Roles]
        T5 --> T6[Configure Eligibility]
        T2 --> T7[Manage Applications]
        T7 --> T8[Interview / Status]
    end

    S8 -->|Application| API[(Backend API)]
    T8 -->|Manage| API
    API --> DB[(PostgreSQL)]
```

Mini Placement Portal connects students and TPO users through a centralized placement workflow. Students discover eligible recruitment roles and submit applications, while TPO users manage students, companies, recruitment drives, eligibility, applications and interview-related activities.

---

## User Roles

The system has exactly two roles, defined in `prisma/schema.prisma`:

| Role | Description |
|---|---|
| `STUDENT` | Self-registers; fills academic profile; applies to drives after profile is verified |
| `TPO` | Manages companies, drives, students, and applications; created by existing TPO user |

**Middleware enforcement:**
- All protected routes require a valid JWT (`auth.middleware.ts`).
- Role-specific routes use `requireRole()` middleware (`role.middleware.ts`).
- Student routes require `Role.STUDENT`; TPO routes require `Role.TPO`.

> There is no Admin or Recruiter role in the current implementation.

---

## Technology Stack

### Frontend

| Technology | Usage |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool and dev server |
| TypeScript | Static typing |
| Tailwind CSS v4 | Styling |
| shadcn/ui | UI component library |
| Redux Toolkit + React Redux | Global state management |
| React Router DOM v7 | Client-side routing |
| Axios | HTTP client |
| React Hook Form | Form management |
| Sonner | Toast notifications |
| Lucide React | Icons |

### Backend

| Technology | Usage |
|---|---|
| Node.js + Express | HTTP server and API framework |
| TypeScript | Static typing |
| Prisma ORM | Database access layer |
| PostgreSQL (Supabase) | Primary relational database |
| JSON Web Token (JWT) | Authentication tokens |
| bcryptjs | Password hashing |
| Cloudinary | Image and resume file storage |
| Multer | File upload handling |
| Nodemailer | SMTP email for OTP |

---

## Project Architecture

```mermaid
flowchart TD
    subgraph Client["Browser"]
        FE["React Frontend (Vite)"]
        RX["Redux Store"]
        AX["Axios HTTP Client"]
        FE <--> RX
        FE --> AX
    end

    subgraph Backend["Express Backend (TypeScript)"]
        MW["Auth + Role Middleware"]
        CT["Controllers"]
        SV["Services"]
        PO["Prisma ORM"]
        AX -->|API Request| MW
        MW --> CT
        CT --> SV
        SV --> PO
    end

    subgraph Storage["External Storage"]
        DB[("PostgreSQL (Supabase)")]
        CL["Cloudinary"]
        ML["Gmail SMTP"]
    end

    PO --> DB
    SV -->|"Company Logos\nProfile Photos\nApplication Resumes"| CL
    SV -->|OTP Emails| ML
```

The frontend communicates with the Express backend through API requests. Backend services handle authentication, business logic and authorization before accessing PostgreSQL through Prisma. Cloudinary is used for application file and image storage where implemented.

---

## Folder Structure

```
Mini-Placement-Portal/
├── run.bat                          # Windows launcher (starts backend + frontend)
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma            # Database models
│   ├── src/
│   │   ├── app.ts                   # Express app setup, route mounting
│   │   ├── server.ts                # HTTP server entry point
│   │   ├── config/
│   │   │   ├── cloudinary.ts        # Cloudinary upload/delete helpers
│   │   │   └── env.ts               # Environment variable configuration
│   │   ├── constants/               # Shared constants
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── student.controller.ts
│   │   │   ├── company.controller.ts
│   │   │   ├── recruitment-drive.controller.ts
│   │   │   ├── application.controller.ts
│   │   │   ├── eligibility.controller.ts
│   │   │   ├── tpo-student.controller.ts
│   │   │   └── tpo-user.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── student.service.ts
│   │   │   ├── company.service.ts
│   │   │   ├── recruitment-drive.service.ts
│   │   │   ├── application.service.ts
│   │   │   ├── eligibility.service.ts
│   │   │   └── tpo-student.service.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   ├── company.routes.ts
│   │   │   ├── recruitment-drive.routes.ts
│   │   │   ├── application.routes.ts
│   │   │   ├── eligibility.routes.ts
│   │   │   ├── tpo-student.routes.ts
│   │   │   └── tpo-user.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   └── role.middleware.ts   # Role enforcement
│   │   ├── lib/
│   │   ├── scripts/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── router.tsx           # React Router configuration
│   │   │   └── store.ts             # Redux store
│   │   ├── components/
│   │   │   ├── auth/                # ProtectedRoute, RoleRoute
│   │   │   ├── common/              # Shared UI components
│   │   │   ├── layout/              # AppLayout, sidebar
│   │   │   ├── student/             # Student-specific components
│   │   │   ├── tpo/                 # TPO-specific components
│   │   │   └── ui/                  # shadcn/ui base components
│   │   ├── pages/
│   │   │   ├── public/              # LandingPage
│   │   │   ├── auth/                # Login, Register, ForgotPassword, VerifyOtp, ResetPassword
│   │   │   ├── student/             # Dashboard, Profile, Drives, DriveDetails, Applications
│   │   │   ├── tpo/                 # Dashboard, Students, Companies, Drives, Applications, History, TPOUsers, TPOProfile
│   │   │   └── errors/              # NotFound, Unauthorized
│   │   ├── features/
│   │   │   ├── auth/                # authSlice
│   │   │   ├── student/             # studentSlice
│   │   │   └── application/         # applicationSlice
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance
│   │   │   ├── auth.service.ts
│   │   │   ├── student.service.ts
│   │   │   ├── company.service.ts
│   │   │   ├── drive.service.ts
│   │   │   ├── application.service.ts
│   │   │   └── tpo-user.service.ts
│   │   ├── hooks/
│   │   │   ├── useAppDispatch.ts
│   │   │   ├── useAppSelector.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useDebouncedSearch.ts
│   │   ├── types/
│   │   └── constants/
│   ├── package.json
│   └── vercel.json
│
└── README.md
```

---

## Database Architecture

```mermaid
erDiagram
    User {
        String id PK
        String email
        String password
        Role role
        String name
    }
    Student {
        String id PK
        String userId FK
        String fullName
        Float currentCgpa
        Float tenthPercentage
        Float twelfthPercentage
        Float d2dCgpa
        Int activeBacklogs
        String resumeUrl
        VerificationStatus verificationStatus
        Boolean isProfileLocked
    }
    Company {
        String id PK
        String name
        String imageUrl
        String website
    }
    RecruitmentDrive {
        String id PK
        String companyId FK
        DriveStatus status
        Float minCgpa
        Float minTenthPercentage
        Float minTwelfthPercentage
        Float minD2dCgpa
        Int maxActiveBacklogs
        DateTime driveDate
        DateTime deadline
    }
    DriveRole {
        String id PK
        String driveId FK
        String title
        Float minCTC
        Float maxCTC
        Int openings
        Boolean useCommonEligibility
    }
    Application {
        String id PK
        String studentId FK
        String driveId FK
        String driveRoleId FK
        ApplicationStatus status
        String resumeUrl
        Boolean isCurrentPlacement
    }
    Interview {
        String id PK
        String applicationId FK
        DateTime interviewDate
        String round
        String mode
        String meetingLink
    }

    User ||--o| Student : "has profile"
    User ||--o{ RecruitmentDrive : "creates"
    User ||--o{ Company : "creates"
    Company ||--o{ RecruitmentDrive : "has"
    RecruitmentDrive ||--o{ DriveRole : "contains"
    RecruitmentDrive ||--o{ Application : "receives"
    DriveRole ||--o{ Application : "receives"
    Student ||--o{ Application : "submits"
    Application ||--o{ Interview : "has"
```

The database separates company recruitment drives from their individual roles. Applications reference the selected role, allowing the system to maintain role-specific application information.

---

## Main API Modules

### Authentication — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new student account |
| `POST` | `/api/auth/login` | Student login (email + password) |
| `POST` | `/api/auth/forgot-password` | Send OTP to email for password reset |
| `POST` | `/api/auth/verify-otp` | Verify OTP for password reset |
| `POST` | `/api/auth/reset-password` | Reset password using verified OTP |
| `POST` | `/api/auth/tpo/login` | TPO login (sends OTP to email) |
| `POST` | `/api/auth/tpo/verify-otp` | TPO OTP verification (returns JWT) |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Student Profile — `/api/students`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students/me` | Get authenticated student profile |
| `PUT` | `/api/students/me` | Update student profile |
| `POST` | `/api/students/me/submit` | Submit and lock profile for TPO review |
| `POST` | `/api/students/me/resume` | Upload profile-level resume |
| `GET` | `/api/students/me/resume` | Get profile resume |
| `DELETE` | `/api/students/me/resume` | Delete profile resume |

### Companies — `/api/tpo/companies`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tpo/companies` | Create company (with optional logo upload) |
| `GET` | `/api/tpo/companies` | List all companies |
| `GET` | `/api/tpo/companies/:id` | Get company details |
| `PATCH` | `/api/tpo/companies/:id` | Update company |
| `DELETE` | `/api/tpo/companies/:id` | Delete company |

### Recruitment Drives

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tpo/drives` | Create recruitment drive with roles |
| `GET` | `/api/tpo/drives` | List all drives (TPO) |
| `GET` | `/api/student/drives` | List drives (Student) |
| `GET` | `/api/tpo/drives/:id` | Get drive details (TPO) |
| `GET` | `/api/student/drives/:id` | Get drive details (Student) |
| `PATCH` | `/api/tpo/drives/:id` | Update drive |
| `DELETE` | `/api/tpo/drives/:id` | Delete drive |

### Eligibility

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tpo/drives/:id/eligible-students` | List eligible students for a drive |
| `GET` | `/api/student/drives/:id/eligibility` | Check if student is eligible for a drive |

### Applications

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/student/drives/:id/apply` | Apply to a drive (with resume upload) |
| `GET` | `/api/student/applications` | Get student own applications |
| `GET` | `/api/student/applications/placement-status` | Get student placement status |
| `GET` | `/api/student/applications/:id` | Get single application |
| `GET` | `/api/student/applications/:id/resume` | Get resume for an application |
| `GET` | `/api/tpo/applications` | List all applications (TPO) |
| `GET` | `/api/tpo/applications/export` | Export applications as CSV |
| `GET` | `/api/tpo/applications/:id` | Get single application (TPO) |
| `GET` | `/api/tpo/applications/:id/resume` | View resume (TPO) |
| `PATCH` | `/api/tpo/applications/:id/status` | Update application status |
| `POST` | `/api/tpo/applications/:id/interview` | Schedule interview |
| `PATCH` | `/api/tpo/applications/:id/interview/:interviewId` | Update interview |

### TPO Student Management — `/api/tpo/students`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tpo/students` | List all students |
| `GET` | `/api/tpo/students/:id` | Get single student details |
| `PATCH` | `/api/tpo/students/:id` | Update student profile (TPO override) |
| `PATCH` | `/api/tpo/students/:id/verify` | Verify or reject student profile |

### TPO User Management — `/api/tpo`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tpo/users` | List all TPO users |
| `POST` | `/api/tpo/users` | Create a new TPO user |
| `PUT` | `/api/tpo/users/:id` | Update a TPO user |
| `DELETE` | `/api/tpo/users/:id` | Delete a TPO user |
| `GET` | `/api/tpo/profile` | Get TPO own profile |
| `PUT` | `/api/tpo/profile` | Update TPO own profile |

---

## Student Workflow

```mermaid
flowchart TD
    A([Start]) --> B[Register / Login]
    B --> C[Fill Academic Profile]
    C --> D[Submit and Lock Profile]
    D --> E{TPO Review}
    E -- Rejected --> C
    E -- Verified --> F[Browse Recruitment Drives]
    F --> G[Open Drive Details]
    G --> H[View Available Roles]
    H --> I{Eligible for Role?}
    I -- No --> J([Not Eligible])
    I -- Yes --> K[Select Role]
    K --> L[Upload Resume]
    L --> M[Submit Application]
    M --> N[Track Application Status]
    N --> O([SHORTLISTED / INTERVIEW / SELECTED / REJECTED])
```

Students complete their placement profile, browse available recruitment drives, select a role, and are checked against the role's eligibility criteria before submitting an application. The submitted resume is associated with the application and the student can track its status.

---

## TPO Workflow

```mermaid
flowchart TD
    A([Start]) --> B[Login with Email + Password]
    B --> C[OTP Verification via Email]
    C --> D[TPO Dashboard]

    D --> E[Manage Students]
    E --> E1{Verify or Reject Profile}

    D --> F[Manage Companies]
    F --> F1[Create / Edit / Delete Company]

    D --> G[Manage Recruitment Drives]
    G --> G1[Create Drive]
    G1 --> G2[Add Multiple Roles per Drive]
    G2 --> G3[Configure Eligibility]
    G3 --> G4[Save Drive]
    G4 --> G5[View Eligible Students]

    D --> H[Manage Applications]
    H --> H1[Filter and Search Applications]
    H1 --> H2[View Student + Role + Resume]
    H2 --> H3[Update Application Status]
    H2 --> H4[Schedule / Update Interview]
    H2 --> H5[Export CSV]

    D --> I[Placement History]
    D --> J[Manage TPO Users]
```

TPO users manage the core placement operations, including student records, companies, recruitment drives, role-specific requirements, applications and interview-related information.

---

## Recruitment Drive — Multiple Role Structure

A single recruitment drive belongs to one company and can contain multiple job roles. Each role is an independent `DriveRole` record with its own CTC range and openings.

```mermaid
flowchart TD
    CO[Company] --> RD[Recruitment Drive]

    RD --> R1[Role 1\nSoftware Engineer\nCTC: 6-8 LPA | Openings: 10]
    RD --> R2[Role 2\nData Analyst\nCTC: 5-7 LPA | Openings: 5]
    RD --> R3[Role 3\nGraduate Engineer\nCTC: 4-6 LPA | Openings: 15]

    RD --> EL[Drive-Level Eligibility\nCGPA / 10th% / 12th% / Backlogs\nDepartments / Student Types]

    R1 --> UC1{useCommonEligibility}
    R2 --> UC2{useCommonEligibility}
    R3 --> UC3{useCommonEligibility}

    UC1 -- true --> EL
    UC2 -- true --> EL
    UC3 -- true --> EL
    UC1 -- false --> CE1[Custom Role Eligibility]
    UC2 -- false --> CE2[Custom Role Eligibility]
    UC3 -- false --> CE3[Custom Role Eligibility]
```

A recruitment drive represents one company's hiring event and can contain multiple job roles. Each role has its own title, CTC range and openings. Eligibility is normally shared across all roles, while role-specific eligibility can be configured when required.

> A student can apply to **only one role per drive**, enforced by a unique constraint on `[studentId, driveId]` in the `Application` model.

---

## Eligibility Workflow

```mermaid
flowchart TD
    A[Student selects a Role] --> B[System reads Drive + DriveRole]
    B --> C{useCommonEligibility?}
    C -- Yes --> D[Apply Drive-Level Criteria\nCGPA / 10th% / 12th% / Backlogs\nDepartments / Student Type]
    C -- No --> E[Apply Role-Specific Criteria\nCustom per-role overrides]
    D --> F[Compare against Student Profile]
    E --> F
    F --> G{Eligible?}
    G -- Yes --> H([Student can Apply])
    G -- No --> I([Not Eligible — Apply blocked])
```

Eligibility is evaluated for the selected role. Roles normally use the recruitment drive's common criteria, but a role can use its own criteria when role-specific eligibility is enabled.

---

## Application and Resume Workflow

Each application is linked to one specific `DriveRole`. The resume is uploaded at the time of application and is stored against that application record, not the student globally.

```mermaid
flowchart TD
    A[Student] --> B[Select Recruitment Drive]
    B --> C[Select Specific Role]
    C --> D{Eligibility Check}
    D -- Not Eligible --> E([Blocked])
    D -- Eligible --> F[Upload Resume PDF]
    F --> G[Submit Application]

    G --> H[Application Record Created]
    H --> H1[studentId]
    H --> H2[driveId]
    H --> H3[driveRoleId]
    H --> H4[status: APPLIED]
    H --> H5[resumeUrl stored on Cloudinary]

    H5 --> I[TPO views resume via Application]
```

Each application references the specific role selected by the student. The resume is stored for that application, allowing different applications to use different resumes.

```
Student A
├── TCS Drive -> Software Engineer    -> resume_v1.pdf
└── Infosys Drive -> Data Analyst     -> resume_v2.pdf
```

- Students also maintain a **profile-level resume** (`Student.resumeUrl`) separate from application resumes.
- The unique constraint `[studentId, driveId]` prevents applying to the same drive more than once.

---

## TPO Application Management

```mermaid
flowchart TD
    A[TPO] --> B[Open Applications]
    B --> C[Filter / Search Applications]
    C --> D[Select Application]
    D --> E[View Student Details]
    D --> F[View Selected Role]
    D --> G[View Uploaded Resume]
    D --> H[Update Application Status]
    H --> H1([APPLIED])
    H --> H2([SHORTLISTED])
    H --> H3([INTERVIEW])
    H --> H4([SELECTED])
    H --> H5([REJECTED])
    D --> I[Schedule / Update Interview]
    B --> J[Export All Applications as CSV]
```

TPO users can review applications with the associated student, company role, resume and application status, along with interview information where implemented.

---

## Search Workflow

Search uses the `useDebouncedSearch` hook. Requests are delayed and only sent once the input is stable and meets the minimum length.

```mermaid
flowchart TD
    A[User types in search box] --> B{Input length?}
    B -- "0 characters (cleared)" --> C[Fire API request\nReset to default results]
    B -- "1 or 2 characters" --> D[Wait — no request sent]
    B -- "3 or more characters" --> E[Start 500ms debounce timer]
    E --> F{User still typing?}
    F -- Yes --> E
    F -- No --> G[Fire API request with search term]
    G --> H[Backend queries database]
    H --> I[Results rendered in table]
```

Search requests are debounced by 500ms and are triggered only after the minimum search length is reached. Clearing the search restores the default results.

**Pages with debounced search:** Students · Companies · Drives · Applications · History

---

## End-to-End Flow

```mermaid
flowchart TD
    subgraph TPO_SETUP ["TPO — Setup Phase"]
        T1[Add Company] --> T2[Create Recruitment Drive]
        T2 --> T3[Add Multiple Roles]
        T3 --> T4[Configure Eligibility]
        T4 --> T5[Save Drive]
    end

    subgraph STUDENT_FLOW ["Student — Application Phase"]
        S1[Browse Drives] --> S2[Select Role]
        S2 --> S3{Eligible?}
        S3 -- No --> S4([Cannot Apply])
        S3 -- Yes --> S5[Upload Resume + Apply]
        S5 --> S6[Application Created]
    end

    subgraph TPO_REVIEW ["TPO — Review Phase"]
        R1[View Applications] --> R2[Review Student + Resume]
        R2 --> R3[Update Status]
        R3 --> R4[Schedule Interview]
        R4 --> R5([Placement Outcome])
    end

    T5 --> S1
    S6 --> R1
```

This diagram shows the complete placement lifecycle — from TPO setup through student application to final placement outcome.

---

## Setup and Installation

### Prerequisites

- Node.js v18+
- npm
- PostgreSQL database (Supabase recommended)
- Cloudinary account (for image and resume storage)
- Gmail account with App Password (for OTP emails)

### Clone

```bash
git clone https://github.com/paldhaduk7-png/Mini-Placement-Portal.git
cd Mini-Placement-Portal
```

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_db

JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-google-app-password
MAIL_FROM=your-email@gmail.com
```

> See `backend/.env.example` for reference.

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> See `frontend/.env.example` for reference.

---

## Running the Project

### Option 1 — Windows Launcher (Recommended)

Double-click `run.bat` in the project root. It starts both backend and frontend in separate terminal windows.

> `npm install` must have been run in both `backend/` and `frontend/` before using `run.bat`.

### Option 2 — Manual

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend** (in a separate terminal):

```bash
cd frontend
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

---

## Database Setup

> Ensure `DATABASE_URL` is set in `backend/.env` before running any Prisma commands.

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables in the database)
npx prisma migrate dev
```

Using the npm scripts defined in `backend/package.json`:

```bash
npm run prisma:generate
npm run prisma:migrate
```

---

## Git / Development Notes

- `.env` files are not committed (listed in `.gitignore`).
- `node_modules/` directories are not committed.
- `dist/` build output is not committed.
- Run `npx tsc --noEmit` in `frontend/` or `backend/` to verify TypeScript before pushing.
- Commit backend and frontend changes in separate logical commits.

---

## Project Status

The current implementation includes:

- Student registration, profile management, academic data entry, and TPO verification workflow.
- TPO login with OTP-based two-step authentication via Gmail SMTP.
- Company management with Cloudinary image storage.
- Recruitment drive management with support for multiple job roles per drive.
- Drive-level and per-role eligibility configuration (CGPA, percentages, backlogs, departments, student types).
- Student application workflow with resume upload per application stored on Cloudinary.
- Application status lifecycle: APPLIED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED.
- Interview scheduling and updates by TPO.
- CSV export of all applications.
- Debounced search (min 3 chars, 500ms) across all list views.
- TPO user account management.
- Placement history view.
