# Backend Development Roadmap

This checklist tracks progress through the Phase 2 backend implementation for the SSPV Mandala Community Website.

---

## 🏁 Milestone 1: FastAPI Project Setup
- [ ] Create `backend/` project directory structure.
- [ ] Configure virtual environment (`.venv`) and install base requirements.
- [ ] Setup `app/config/settings.py` using Pydantic `BaseSettings`.
- [ ] Configure logging in `app/logs/logger.py`.
- [ ] Write `middleware/request_id.py` trace id injector.
- [ ] Write `middleware/logging.py` request/response logger.
- [ ] Setup containerized PostgreSQL database using `docker-compose.yml`.
- [ ] Configure base `Dockerfile` for the FastAPI backend container.
- [ ] Write `.env` and `.env.example` configurations.
- [ ] Write `app/main.py` entry point and configure CORS.
- [ ] Verify project runs successfully and returns basic health status.

---

## 🗄️ Milestone 2: Database & Alembic
- [ ] Configure `app/core/database.py` with async engines.
- [ ] Define declarative SQLAlchemy models in `app/models/`:
  - [ ] `User` & `RefreshToken`
  - [ ] `MemberProfile` & `FamilyMember`
  - [ ] `Booking`
  - [ ] `CommitteeMember`, `Event`, `Notice`, `GalleryAlbum`, `GalleryImage`, `SurnameHistory`
- [ ] Wire model relationships and foreign keys.
- [ ] Setup timestamp mixins (`created_at`, `updated_at`) and soft delete properties.
- [ ] Initialize Alembic with `alembic init alembic`.
- [ ] Write `alembic/env.py` mapping to import async engines and declarative models.
- [ ] Generate the initial schema migration script.
- [ ] Run Alembic migrations against local PostgreSQL database to verify table structures.

---

## 🔑 Milestone 3: Authentication
- [ ] Setup password hashing utility using `passlib` / `bcrypt` in `app/core/security.py`.
- [ ] Implement JWT token encoding and decoding utilities.
- [ ] Write token session verification dependency guards in `app/api/deps.py`.
- [ ] Create `repositories/repo_user.py` for database CRUD user helpers.
- [ ] Create `services/auth_service.py` to handle credentials verification.
- [ ] Write `/api/v1/auth/login` endpoint that issues access tokens and sets refresh cookies.
- [ ] Write `/api/v1/auth/refresh` endpoint to handle HttpOnly refresh handshakes.
- [ ] Write `/api/v1/auth/logout` endpoint that revokes token records in the database.
- [ ] Write `/api/v1/auth/change-password` endpoint with auth guards.
- [ ] Configure Role-Based Access Control (RBAC) validations for `member` and `admin` roles.

---

## 👥 Milestone 4: Member Portal APIs
- [ ] Create custom exception models in `exceptions/member.py` and `exceptions/booking.py`.
- [ ] Implement `repositories/repo_member.py` for database query encapsulations.
- [ ] Implement `repositories/repo_booking.py` for booking records lookup.
- [ ] Create `services/member_service.py` for profile operations.
- [ ] Write `/api/v1/members/profile` routes (GET/PUT) to fetch and update head profile.
- [ ] Write `/api/v1/members/family` CRUD routes (GET/POST/PUT/DELETE) for family listings.
- [ ] Write `/api/v1/members/bookings` route (GET) to query personal booking history.
- [ ] Write `/api/v1/members/notices` route (GET) to retrieve member-specific notices.
- [ ] Write `/api/v1/members/events` route (GET) to list registered community events.

---

## 🌐 Milestone 5: Public APIs
- [ ] Write Pydantic read-only schemas for public-facing data.
- [ ] Implement `public/committee.py` endpoint for active committee profiles.
- [ ] Implement `public/gallery.py` endpoint for active gallery albums & images.
- [ ] Implement `public/events.py` endpoint for upcoming public events.
- [ ] Implement `public/notices.py` endpoint for homepage notice boards.
- [ ] Implement `public/history.py` endpoint for native region history directories.
- [ ] Implement `public/booking.py` availability query handlers (`/availability`).

---

## 🛡️ Milestone 6: Admin APIs
- [ ] Build split admin routers inside `api/v1/endpoints/admin/`:
  - [ ] `admin_auth.py` -> Secure login paths.
  - [ ] `admin_members.py` -> Member verification triggers and listings.
  - [ ] `admin_gallery.py` -> Album and image governance.
  - [ ] `admin_events.py` -> Event creation & management.
  - [ ] `admin_notices.py` -> Pinned and homepage notice management.
  - [ ] `admin_committee.py` -> Committee profile adjustments.
  - [ ] `admin_bookings.py` -> Booking audits and approve/reject actions.
  - [ ] `admin_history.py` -> History logs CRUD.
- [ ] Write `admin_service.py` to calculate dashboard summary aggregates:
  - [ ] Total Members count.
  - [ ] Verified Members count.
  - [ ] Pending Bookings count.
  - [ ] Upcoming Events count.
  - [ ] Active Notices count.
  - [ ] Gallery Images count.
  - [ ] Committee Members count.

---

## 💾 Milestone 7: Image Upload
- [ ] Define abstract class interface `BaseStorageProvider` in `app/utils/file_upload.py`.
- [ ] Implement `LocalStorageProvider` to write files to disk under designated target paths:
  - [ ] `uploads/gallery/`
  - [ ] `uploads/committee/`
  - [ ] `uploads/events/`
  - [ ] `uploads/members/`
- [ ] Write image upload endpoints with size and mimetype validations.
- [ ] Configure FastAPI `StaticFiles` middleware to host uploads directory.

---

## 🧪 Milestone 8: Testing
- [ ] Configure `pytest.ini` and write setup fixtures in `tests/conftest.py`.
- [ ] Implement async SQLite/PostgreSQL in-memory engine wrapper for running tests.
- [ ] Write test cases for authentication logic (JWT, cookies, RBAC restrictions).
- [ ] Write test cases for Member Portal CRUD and validations.
- [ ] Write test cases for Admin actions and dashboard outputs.
- [ ] Verify code coverage and error handling middleware behaviors.

---

## 📖 Milestone 9: API Documentation
- [ ] Refine FastAPI app configuration metadata (title, terms, contact).
- [ ] Assign explicit tagging structure to grouping routes cleanly (Auth, Members, Public, Admin).
- [ ] Define detailed response models, descriptions, and error states for all routers.
- [ ] Start application and verify OpenAPI specs in `/docs` (Swagger) and `/redoc` interfaces.
