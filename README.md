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

## System Workflow

```mermaid
flowchart TD
    subgraph Student
        A[Register] --> B[Login]
        B --> C[Complete Academic Profile]
        C --> D[Submit and Lock Profile]
        D --> E{TPO Verifies?}
        E -- Verified --> F[Browse Recruitment Drives]
        E -- Rejected --> C
        F --> G[Check Eligibility]
        G --> H[Select Job Role]
        H --> I[Apply and Upload Resume]
        I --> J[Track Application Status]
    end

    subgraph TPO
        P[Login + OTP] --> Q[Dashboard]
        Q --> R[Manage Students / Verify Profiles]
        Q --> S[Manage Companies]
        Q --> T[Create Recruitment Drive]
        T --> U[Add Multiple Job Roles]
        U --> V[Configure Eligibility per Drive or Role]
        V --> W[Publish Drive]
        W --> X[View Eligible Students]
        X --> Y[Manage Applications]
        Y --> Z[Schedule Interviews]
        Y --> AA[Update Application Status]
        Y --> AB[Export CSV]
    end
```

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
graph TD
    Browser -->|HTTP/HTTPS| React[React Frontend - Vite]
    React -->|Redux Slices| Store[Redux Store]
    React -->|Axios calls| Backend[Express Backend - Node.js]
    Backend --> Middleware[Auth + Role Middleware]
    Middleware --> Controllers[Controllers]
    Controllers --> Services[Services]
    Services --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL - Supabase)]
    Services -->|Images and Resumes| Cloudinary[Cloudinary Storage]
    Services -->|OTP Emails| SMTP[Gmail SMTP - Nodemailer]
```

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
        String phone
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
        Float minCgpa
        Float minTenthPercentage
    }

    Application {
        String id PK
        String studentId FK
        String driveId FK
        String driveRoleId FK
        ApplicationStatus status
        String resumeUrl
        String remarks
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

    User ||--o| Student : "has"
    User ||--o{ RecruitmentDrive : "creates"
    User ||--o{ Company : "creates"
    Company ||--o{ RecruitmentDrive : "has"
    RecruitmentDrive ||--o{ DriveRole : "contains"
    RecruitmentDrive ||--o{ Application : "receives"
    DriveRole ||--o{ Application : "receives"
    Student ||--o{ Application : "submits"
    Application ||--o{ Interview : "has"
```

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
    A[Visit Landing Page] --> B[Register with email and password]
    B --> C[Login]
    C --> D[Fill Academic Profile]
    D --> E[Submit and Lock Profile]
    E --> F{TPO Reviews}
    F -- Rejected --> G[Edit Profile and Resubmit]
    G --> E
    F -- Verified --> H[Browse Recruitment Drives]
    H --> I[Open Drive Details]
    I --> J[Check Eligibility]
    J -- Not Eligible --> K[Cannot Apply]
    J -- Eligible --> L[Select Job Role]
    L --> M[Upload Resume and Apply]
    M --> N[Application Created - Status APPLIED]
    N --> O[Track Status in My Applications]
    O --> P[SHORTLISTED - INTERVIEW - SELECTED or REJECTED]
```

---

## TPO Workflow

```mermaid
flowchart TD
    A[TPO Login - email and password] --> B[Receive OTP via Email]
    B --> C[Verify OTP - Receive JWT]
    C --> D[TPO Dashboard]
    D --> E[Manage Students]
    E --> F[Review Submitted Profiles]
    F --> G[Verify or Reject Student]
    D --> H[Manage Companies]
    H --> I[Create / Edit / Delete Company]
    D --> J[Manage Recruitment Drives]
    J --> K[Create Drive - Select Company]
    K --> L[Add Multiple Job Roles per Drive]
    L --> M[Set Common or Per-Role Eligibility]
    M --> N[Drive Published]
    N --> O[View Eligible Students per Drive]
    D --> P[Manage Applications]
    P --> Q[View and Filter All Applications]
    Q --> R[View Application Resume]
    Q --> S[Update Application Status]
    Q --> T[Schedule Interview]
    Q --> U[Export CSV]
    D --> V[History - Placement Records]
    D --> W[Manage TPO Users]
    D --> X[Update My Profile]
```

---

## Recruitment Drive Workflow

A single recruitment drive belongs to one company and contains one or more `DriveRole` entries.

```mermaid
graph TD
    Company --> Drive[Recruitment Drive]
    Drive --> Role1[DriveRole: Software Engineer - CTC 6-8 LPA - 10 Openings]
    Drive --> Role2[DriveRole: Data Analyst - CTC 5-7 LPA - 5 Openings]
    Drive --> Role3[DriveRole: Graduate Engineer - CTC 4-6 LPA - 15 Openings]
    Drive --> Eligibility[Common Eligibility - CGPA, 10th, 12th, Backlogs, Departments, Student Types]
    Role1 --> Check1{useCommonEligibility}
    Check1 -- true --> Eligibility
    Check1 -- false --> RoleElig1[Role-Specific Eligibility Overrides Drive-Level]
```

**Eligibility Modes:**
- **Common (default):** All roles in the drive share the drive-level eligibility criteria.
- **Custom:** TPO configures distinct eligibility criteria per role independently.

A student can apply to **only one role per drive** (enforced by unique constraint on `[studentId, driveId]` in the `Application` model).

---

## Application and Resume Workflow

Resume is attached **per application**, not globally to the student. Each application carries its own resume file stored on Cloudinary.

```mermaid
flowchart TD
    S[Student] --> D[Select Recruitment Drive]
    D --> R[Select Specific Job Role]
    R --> E[Eligibility Check]
    E -- Not Eligible --> X[Blocked from Applying]
    E -- Eligible --> U[Upload Resume PDF]
    U --> A[Application Created]
    A --> C[Application references DriveRole]
    C --> F[resumeUrl stored on Application record]
    F --> G[TPO views resume via Application]
```

- Students also maintain a **profile-level resume** (`Student.resumeUrl`) separate from application resumes.
- Application resumes are uploaded at apply time via `multipart/form-data`.
- The unique constraint `[studentId, driveId]` prevents applying to the same drive more than once.

**Example:**

```
Student A
├── TCS Drive -> Software Engineer
│       └── resume_v1.pdf (stored on this application)
│
└── Infosys Drive -> Data Analyst
        └── resume_v2.pdf (stored on this application)
```

---

## Search Workflow

Search is implemented using the `useDebouncedSearch` hook that delays API requests until the input is stable.

**Rules:**
- No API request is fired for 1 or 2 characters.
- API request fires when input is **empty** (reset) or has **3 or more characters**.
- Delay: **500ms** after the user stops typing.

```mermaid
flowchart TD
    A[User types in search box] --> B[searchTerm state updated]
    B --> C{Length is 0 OR Length >= 3?}
    C -- No --> D[Wait - no API request sent]
    C -- Yes --> E[Start 500ms debounce timer]
    E --> F[Timer expires without new input?]
    F -- No --> E
    F -- Yes --> G[debouncedTerm updated]
    G --> H[useEffect fires API request]
    H --> I[Backend searches database]
    I --> J[Results rendered in table]
```

**Pages using debounced search:**
- TPO Students list
- TPO Companies list
- TPO Drives list
- TPO Applications list
- TPO History list

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
