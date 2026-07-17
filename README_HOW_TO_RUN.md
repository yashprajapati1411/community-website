# Complete Developer Handover & Setup Guide (`README_HOW_TO_RUN.md`)

Welcome to the **Shri Surati Dasha-Porwad Mandala Community Website & Portal** repository! This document serves as the authoritative, end-to-end handover guide for new developers, maintainers, and DevOps engineers joining the project. It provides comprehensive architectural details, setup instructions, verification commands, and development workflows.

---

## 1. Project Overview and Purpose

The **Shri Surati Dasha-Porwad Mandala Community Website & Portal** (`sspvmandala.org`) is a full-stack web application designed to serve the members, committee, and administrators of the community. It bridges public-facing informational pages (about history, committee members, events, and gallery) with a secure, feature-rich **Member Portal** and an administrative **Admin Dashboard**.

### Core Objectives
- **Digital Community Hub**: Provide a modern, responsive interface for community announcements, annual reports, events, and venue bookings.
- **Member Self-Service & Directory**: Allow verified community members to manage their family profiles, search the digital member directory, view exclusive announcements, and register for community events.
- **Strict Role-Based Governance**: Enforce a multi-tier registration workflow where new registrations must undergo formal review and approval by administrators before gaining access to member-only sections.

---

## 2. Current Project Status & Completed Features

The application has reached complete full-stack integration across frontend UI components and backend REST API endpoints. All major functional modules have been verified and tested against 28 automated integration tests (`pytest`) and complete frontend builds (`Vite / TypeScript`).

### Completed Workflows & Features

1. **Authentication & Member Registration (`/api/v1/auth/*`, `/api/v1/admin/registrations/*`)**
   - Secure JWT-based authentication supporting login via Email or Mobile number.
   - Registration request submission workflow where prospective members submit personal, contact, and address details.
   - Automatic routing of registrations to a pending approval queue.

2. **Admin Approval Workflow (`/api/v1/admin/registrations/*`)**
   - Dedicated administrative dashboard queues for pending, approved, and rejected registrations.
   - One-click approval that automatically provisions the primary `User` record (with `MEMBER` role), generates initial `MemberProfile` data, and assigns a unique `mandala_code`.
   - Rejection workflow supporting administrative remarks and reason logging.

3. **Member Portal & Profile Management (`/api/v1/members/me`, `/api/v1/members/dashboard`)**
   - Personal profile dashboard displaying current membership status, mandala code, and contact information.
   - Profile editing support for extended fields including marital status, occupation, education, blood group, native village, current address, and biography.

4. **Family Members & Digital Directory (`/api/v1/members/me/family`, `/api/v1/members/directory`)**
   - Full CRUD capabilities for adding, updating, and removing family relationships (`Spouse`, `Child`, `Parent`, `Sibling`, etc.) linked to the primary member profile.
   - **Digital Directory**: Searchable, paginated directory allowing verified members to find other community members by name, blood group, native village, or occupation.

5. **Booking Module (`/api/v1/public/booking/*`)**
   - Real-time venue/hall availability checking across date ranges.
   - Public booking inquiry submission interface for weddings, social gatherings, and community events.

6. **Public Website APIs (`/api/v1/public/*`)**
   - Public read-only endpoints providing dynamic content for:
     - **Committee**: Executive and working committee member rosters.
     - **Events**: Upcoming public gatherings, festivals, and schedules.
     - **Gallery**: Photo albums and historical archive images.
     - **History & Notices**: Community heritage documentation and public bulletin notices.

7. **Admin Dashboard (`/api/v1/admin/*`)**
   - Executive metrics summary providing instant counts of active members, pending registrations, published events, and active reports.
   - Role-Based Access Control (RBAC) ensuring only `ADMIN` users can access administrative endpoints.

8. **Events & Event Registration (`/api/v1/admin/events/*`, `/api/v1/public/events/*`)**
   - Admin event creation, scheduling, update, and deletion workflows.
   - Event registration tracking allowing members to RSVP/register for specific events and administrators to view complete attendee rosters.

9. **Gallery & Local Image Upload (`/api/v1/admin/upload/images`)**
   - Secure multi-format image upload utility supporting `JPEG`, `PNG`, `WEBP`, and `GIF` formats.
   - Automatic MIME-type verification, filename sanitization, and local filesystem storage within `backend/uploads/` (with web-accessible URL return).

10. **Annual Reports (`/api/v1/admin/reports/*`, `/api/v1/public/reports/*`)**
    - Publication system for annual financial and activity reports (`PDF` and document link distribution).
    - Public vs. member-only visibility toggles.

11. **Member-Only Announcements (`/api/v1/admin/announcements/*`, `/api/v1/members/announcements`)**
    - Secure bulletin system visible strictly to authenticated community members inside the Member Portal.
    - Priority levels (`NORMAL`, `URGENT`) with administrative scheduling.

12. **Forgot Password / OTP Integration (`/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`)**
    - 6-digit OTP generation and delivery verification for secure password recovery.
    - Rate-limited and expiration-bound OTP tokens stored and verified against the database.

---

## 3. Technology Stack

### Frontend Architecture
- **Framework / Core**: React 18 with TypeScript (`.tsx`).
- **Build Tool**: Vite (configured for rapid HMR and optimized production bundling).
- **Styling**: Vanilla CSS (`src/index.css` and scoped component CSS files) for maximum design flexibility without heavy framework lock-in.
- **Icons**: `lucide-react` modern vector icon library.
- **HTTP Client / API Integration**: Custom typed API client (`src/config/api.ts`) using standard `fetch` with automatic JWT bearer token injection and error handling.

### Backend Architecture
- **Framework**: Python 3.10+ / FastAPI (high-performance asynchronous REST API).
- **ORM / Database Layer**: SQLAlchemy 2.0 (using asynchronous `AsyncSession` and `declarative_base`) + Alembic for schema migrations.
- **Data Validation & Serialization**: Pydantic v2 schemas (`backend/app/schemas/`).
- **Authentication & Security**: `passlib[bcrypt]` for secure password hashing, `python-jose[cryptography]` for JWT creation and verification.
- **Database Engine**: SQLite (`asyncpg`/PostgreSQL-ready via SQLAlchemy engine abstraction).

---

## 4. Complete Project Folder Structure Overview

```text
gemini_cli/                         # Repository Root
├── README.md                       # General repository quick summary
├── README_HOW_TO_RUN.md            # Complete Developer Handover Guide (this file)
├── package.json                    # Frontend Node.js dependencies & scripts
├── package-lock.json               # Locked frontend dependency versions
├── tsconfig.json                   # TypeScript base compiler configuration
├── vite.config.ts                  # Vite build and dev server settings
├── index.html                      # Single-Page Application (SPA) entry point
├── .env.example                    # Frontend environment variable template
├── .gitignore                      # Git exclusion rules for secrets, DBs & build files
├── src/                            # Frontend Application Source Code
│   ├── App.tsx                     # Main application routing and layout wrapper
│   ├── main.tsx                    # React root DOM mount
│   ├── index.css                   # Global design system, colors & utility classes
│   ├── config/
│   │   └── api.ts                  # Base API client with JWT interception
│   ├── components/                 # Reusable UI Components
│   │   ├── Navbar.tsx              # Responsive top navigation & portal links
│   │   └── Marquee.tsx             # Dynamic announcement scrolling ticker
│   ├── pages/                      # Application Page Views
│   │   ├── MemberPortal.tsx        # Member dashboard, directory & profile editor
│   │   ├── AdminDashboard.tsx      # Admin approval queue & content management UI
│   │   ├── Booking.tsx             # Venue booking inquiry module
│   │   ├── Events.tsx              # Public event listing & RSVP view
│   │   ├── Gallery.tsx             # Photo albums & community gallery
│   │   ├── Committee.tsx           # Executive & working committee rosters
│   │   └── History.tsx             # Community heritage & historical notices
│   └── services/                   # Frontend API Service Wrappers
│       ├── authService.ts          # Login, registration, OTP & token handling
│       ├── memberService.ts        # Profile, family CRUD & directory search
│       ├── adminService.ts         # Admin metrics, approvals & content management
│       ├── bookingService.ts       # Booking availability & submission
│       └── publicService.ts        # Public committee, gallery & report fetches
│
└── backend/                        # Backend FastAPI Application Root
    ├── requirements.txt            # Python dependencies
    ├── pytest.ini                  # Pytest test discovery & execution settings
    ├── .env.example                # Backend environment variable template
    ├── alembic.ini                 # Alembic migration runner settings
    ├── alembic/                    # Database Schema Migrations
    │   ├── env.py                  # Alembic environment context & metadata binding
    │   └── versions/               # Sequential migration history scripts (`*.py`)
    ├── app/                        # Application Core Package
    │   ├── main.py                 # FastAPI app initialization, CORS & router mount
    │   ├── config/
    │   │   └── settings.py         # Pydantic environment configuration class
    │   ├── models/                 # SQLAlchemy Database Models
    │   │   ├── user.py             # User authentication & RBAC models
    │   │   ├── member.py           # MemberProfile, FamilyMember & RegistrationRequest
    │   │   └── content.py          # Events, Announcements, Reports & Gallery albums
    │   ├── schemas/                # Pydantic Request/Response Schemas
    │   │   ├── auth.py             # Login, Token, ForgotPassword schemas
    │   │   ├── member.py           # Profile, Directory & Family schemas
    │   │   ├── admin.py            # Admin metrics & approval action schemas
    │   │   └── content.py          # Event, Notice & Report schemas
    │   ├── repositories/           # Database Access Layer (CRUD queries)
    │   │   ├── repo_member.py      # Member profile & directory database operations
    │   │   ├── repo_content.py     # Content CRUD database operations
    │   │   ├── repo_registration.py# Registration request queue operations
    │   │   └── repo_otp.py         # Password recovery OTP database operations
    │   ├── services/               # Business Logic Layer
    │   │   ├── auth_service.py     # JWT token generation & authentication checks
    │   │   ├── member_service.py   # Profile updates & family relationship handling
    │   │   ├── admin_service.py    # Approval workflow & metric aggregations
    │   │   ├── content_service.py  # Content publication & management logic
    │   │   ├── registration_service.py # Registration intake & validation logic
    │   │   └── sms_service.py      # MSG91 SMS gateway integration & simulation
    │   ├── api/v1/endpoints/       # REST API Router Definitions
    │   │   ├── auth.py             # `/api/v1/auth/*` endpoints
    │   │   ├── members.py          # `/api/v1/members/*` endpoints
    │   │   ├── admin/              # `/api/v1/admin/*` management endpoints
    │   │   └── public/             # `/api/v1/public/*` public data endpoints
    │   ├── utils/
    │   │   └── file_upload.py      # Secure image verification & storage helper
    │   └── exceptions/             # Custom domain exception classes
    ├── uploads/                    # Local image & file upload storage directory
    └── tests/                      # Automated Integration Test Suite (`pytest`)
        ├── conftest.py             # Test database fixtures & async client setup
        ├── test_auth.py            # Authentication, RBAC & OTP tests
        ├── test_member.py          # Profile, Family & Directory tests
        └── test_admin.py           # Dashboard summary, approvals & upload tests
```

---

## 5. Prerequisites & Required Software

Ensure your local development station has the following tools installed before beginning setup:
- **Git**: Version 2.30+ (`git --version`)
- **Node.js**: Version 18.x LTS or 20.x LTS (`node --version`)
- **npm**: Version 9.x+ (bundled with Node.js, check `npm --version`)
- **Python**: Version 3.10, 3.11, or 3.12 (`python --version` or `python3 --version`)
- **SQLite3**: Standard CLI or GUI viewer (e.g., DB Browser for SQLite) for local database inspection.

---

## 6. Step-by-Step Local Setup Instructions

### 1. Clone the Repository
Open your terminal/command prompt and clone the project:
```bash
git clone https://github.com/yashprajapati1411/community-website.git
cd community-website
```

### 2. Verify Working Branch
Switch to or verify you are on the `frontend-integration` development branch:
```bash
git checkout frontend-integration
git status
```

---

## 7. Backend Virtual Environment & Dependency Setup

### 1. Navigate to the Backend Directory
```bash
cd backend
```

### 2. Create Python Virtual Environment
- **On Windows (PowerShell / Command Prompt)**:
  ```powershell
  python -m venv .venv
  ```
- **On macOS / Linux**:
  ```bash
  python3 -m venv .venv
  ```

### 3. Activate Virtual Environment
- **On Windows (PowerShell)**:
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
  *(Note: If you encounter an execution policy error on PowerShell, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*
- **On Windows (Command Prompt)**:
  ```cmd
  .\.venv\Scripts\activate.bat
  ```
- **On macOS / Linux**:
  ```bash
  source .venv/bin/activate
  ```

### 4. Install Backend Dependencies
Upgrade `pip` and install required packages:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 8. Environment Variable Setup (`.env.example`)

### Backend Environment Configuration
While inside the `backend/` directory, copy the example template to create your local `.env` file:
- **On Windows (PowerShell/CMD)**:
  ```powershell
  copy .env.example .env
  ```
- **On macOS / Linux**:
  ```bash
  cp .env.example .env
  ```

#### Inspect `backend/.env.example`
Ensure your `backend/.env` contains secure local settings. Never commit your `.env` file or expose sensitive production keys:
```ini
ENVIRONMENT=development
SECRET_KEY=a3f8c9b0e1d2a3f4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=987654
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sspv_mandala
POSTGRES_PORT=5432
SQL_ECHO=false
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000

# SMS / OTP Provider Configuration (MSG91)
# Leave blank for local development/testing (system will simulate SMS delivery locally and log to console)
MSG91_AUTH_KEY=your_msg91_auth_key_here
MSG91_TEMPLATE_ID=your_msg91_template_id_here
```

### Frontend Environment Configuration
Navigate back to the project root directory (`cd ..`) and create the frontend `.env` file:
- **On Windows (PowerShell/CMD)**:
  ```powershell
  copy .env.example .env
  ```
- **On macOS / Linux**:
  ```bash
  cp .env.example .env
  ```

#### Inspect Root `.env.example`
```ini
# Frontend Environment Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
# For production deployment, change VITE_API_BASE_URL to your live API origin, e.g.:
# VITE_API_BASE_URL=https://api.sspvmandala.org/api/v1
```

---

## 9. SQLite Database & Alembic Migration Commands

By default during local development, the application uses an asynchronous SQLite database (`backend/sspv_mandala.db`). Ensure all schema migrations are applied cleanly before launching the server.

### Run Database Migrations
Make sure your Python virtual environment is activated and you are inside `backend/`:
```bash
cd backend
alembic upgrade head
```
*Expected Output*: Alembic will sequentially apply all migration scripts in `backend/alembic/versions/` (`01_initial_schema`, `02f568092e61_add_registration_requests_table`, `b5e1f3d56f1e_add_member_portal_fields_and...`, etc.) up to `head`.

### Create New Migrations (For Future Model Changes)
If you modify any SQLAlchemy models in `backend/app/models/`, generate a new migration revision:
```bash
alembic revision --autogenerate -m "description_of_model_changes"
alembic upgrade head
```

---

## 10. Backend Startup Commands

To start the asynchronous FastAPI development server with hot-reload enabled:
```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*Output confirmation*: You will see `Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)`.

---

## 11. Frontend Dependency Installation & Startup Commands

Open a second terminal window, navigate to the project root directory, and install frontend packages:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Frontend Development Server
```bash
npm run dev
```
*Output confirmation*: Vite will start up instantly and bind to `http://localhost:5173`.

---

## 12. Automated Testing Commands (`pytest` & Frontend Build)

Always execute full verification runs before pushing code changes.

### Run Backend Integration Tests (`pytest`)
From the `backend/` directory with your virtual environment activated:
```bash
cd backend
pytest tests -v
```
Or from the project root directory specifying the Python path:
```bash
backend/.venv/Scripts/pytest.exe tests -v -o pythonpath=backend
```
*Expected Result*: All **28 integration tests** must pass without errors (`28 passed`).

### Verify Frontend TypeScript Build
From the project root directory:
```bash
npm run build
```
*Expected Result*: TypeScript compilation (`tsc -b`) and Vite production bundling will execute cleanly, outputting production assets into `dist/`.

---

## 13. Default Local URLs

When both frontend and backend development servers are running, access the platform via:

| Service / Interface | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend Web Application** | `http://localhost:5173` | React/Vite single-page application |
| **Backend REST API Base** | `http://127.0.0.1:8000/api/v1` | Root endpoint prefix for all REST routes |
| **Interactive API Docs (Swagger)** | `http://127.0.0.1:8000/docs` | Interactive Swagger UI for testing API calls |
| **API Documentation (ReDoc)** | `http://127.0.0.1:8000/redoc` | Alternative structured ReDoc API specifications |

### Default Admin Credentials (For Local Dev)
When the application runs, if no superuser exists, the startup event (`app/main.py`) automatically provisions the initial administrator using settings from `.env`:
- **Admin Email**: `admin@example.com`
- **Admin Password**: `987654`

---

## 14. Important Development Notes & Configuration Requirements

### 1. SMS / OTP Gateway Setup (MSG91)
The application integrates with the **MSG91** API (`https://api.msg91.com/api/v5/otp`) for mobile verification and OTP delivery (`backend/app/services/sms_service.py`).
- **Local Development / Simulation Mode**: If `MSG91_AUTH_KEY` is omitted or left as placeholder in `.env`, the `MSG91SMSProvider` automatically falls back to **Simulation Mode**. In simulation mode, SMS requests are intercepted locally, returning a success status while logging the transaction safely without consuming API credits.
- **Production Setup**: To enable live SMS delivery, populate `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID` with valid credentials from your MSG91 dashboard.

### 2. File Upload Specifications
Image uploads (`/api/v1/admin/upload/images`) are managed via `backend/app/utils/file_upload.py`:
- **Allowed Formats**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- **File Size Limit**: Enforced at 5MB per upload.
- **Storage Location**: Files are saved to `backend/uploads/` and exposed statically via the `/uploads/` URL mount. Ensure `backend/uploads/` has write permissions on the deployment host.

### 3. CORS & Security
If accessing the API from external devices across your local area network, update `BACKEND_CORS_ORIGINS` in `backend/.env` to include your local machine's IP address (e.g., `http://192.168.1.100:5173`).

---

## 15. Git Branch & Workflow Information

### Branching Architecture
- `main`: Production-ready branch reserved strictly for stable releases that have received formal senior/stakeholder sign-off. **Never push directly to `main`.**
- `frontend-integration`: Active feature and integration branch where ongoing frontend-backend pairing, UI Polish, and API alignments take place.

### Contribution Rules
1. Always pull latest changes from `origin/frontend-integration` before starting work.
2. Run `pytest` and `npm run build` prior to staging changes.
3. Ensure **NO** `.env` files, `.db-shm/.db-wal` runtime database files, `scratch/` test logs, or intermediate markdown reports are staged.
4. Push all commits directly to `origin/frontend-integration` and submit a Pull Request for senior review before merging into `main`.

---

## 16. Implementation Status & Recommended Next Steps

### Current Status
The project is fully developed, tested, and feature-complete on the `frontend-integration` branch. Both frontend components and backend services operate in full synchronization with robust error handling, RBAC protection, and clean UI presentations.

### Recommended Next Steps for Production & Deployment

1. **Senior Architecture Review & Sign-Off**
   - Conduct peer review of the `frontend-integration` branch against production security standards.
   - Verify all role-based endpoint restrictions and registration approval workflows with stakeholder testing.

2. **PostgreSQL Database Migration (`asyncpg`)**
   - While SQLite is utilized for local development and senior review (`backend/sspv_mandala.db`), production deployments should utilize PostgreSQL for high concurrency.
   - To transition to PostgreSQL:
     1. Provision a PostgreSQL instance (v14+).
     2. Update `DATABASE_URL` in `backend/.env` using the `asyncpg` driver:
        `DATABASE_URL=postgresql+asyncpg://db_user:db_password@db_host:5432/sspv_mandala`
     3. Run `alembic upgrade head` against the PostgreSQL database to construct all tables and indexes.

3. **Production Environment Hardening**
   - Replace the default `SECRET_KEY` with a cryptographically secure 64-character random string (`openssl rand -hex 32`).
   - Configure live `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID` credentials.
   - Set `ENVIRONMENT=production` and `SQL_ECHO=false` in `backend/.env`.

4. **Production Server Deployment (Docker / Gunicorn / Nginx)**
   - **Backend**: Serve FastAPI using Gunicorn with Uvicorn workers (`gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`).
   - **Frontend**: Build production static files (`npm run build`) and serve `dist/` via Nginx with reverse-proxy routing for `/api/v1/` to the backend service.
   - Configure SSL/TLS certificates via Let's Encrypt / Certbot.

---
*Handover documentation prepared and verified for the Shri Surati Dasha-Porwad Mandala Community Platform.*
