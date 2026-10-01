# MeetSpace — Complete Project Documentation

**Version:** 1.0  
**Status:** Frozen Baseline  
**Product:** MeetSpace — Office Meeting Room Booking System

## 1. Project Overview

MeetSpace is a complete end-to-end office meeting room booking platform based on the original problem statement:

> Develop an Office Meeting Room Booking System with employee registration, room availability, booking, cancellation and booking history. Use HashSet and HashMap.

The product expands the PS into a real full-stack system while preserving every original requirement.

Core capabilities:
- Real employee registration and authentication
- Email verification and password reset
- Employee profiles
- Meeting-room management
- Real-time room availability
- Booking and double-booking prevention
- Booking cancellation
- Booking history
- Realtime notifications
- Gmail email notifications
- 3D office visualization
- Admin dashboard
- Audit logging
- Production-oriented security

## 2. Fixed Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- TanStack Query
- Zustand
- Zod
- Three.js
- React Three Fiber
- @react-three/drei

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Web
- Spring WebSocket
- Spring JDBC / JdbcTemplate
- Bean Validation
- Maven

### Database
- Neon PostgreSQL
- PostgreSQL JDBC Driver
- SQL

### Realtime
- Spring WebSocket

### Email
- Gmail SMTP

### Deployment
- Vercel for Next.js
- Java-compatible cloud hosting for Spring Boot
- Neon PostgreSQL

## 3. Frozen Architecture

```text
                    USER
                      |
                      v
              +---------------+
              |    Next.js    |
              |   Frontend    |
              +-------+-------+
                      |
             REST / WebSocket
                      |
                      v
              +---------------+
              |  Spring Boot  |
              |    Backend    |
              +-------+-------+
                      |
                    JDBC
                      |
                      v
              +---------------+
              |     Neon      |
              |  PostgreSQL   |
              +---------------+
```

Additional backend capabilities: Spring Security, booking engine, HashSet, HashMap, WebSocket and Gmail SMTP. Three.js runs inside the Next.js frontend.

## 4. Architecture Rules

1. Next.js remains the frontend.
2. Java Spring Boot remains the backend.
3. JDBC remains the database access mechanism.
4. Neon PostgreSQL remains the database.
5. HashSet remains part of the backend.
6. HashMap remains part of the backend.
7. Three.js remains the 3D engine.
8. React Three Fiber remains the Three.js React integration.
9. Spring WebSocket remains the realtime mechanism.
10. Gmail SMTP remains the email mechanism.
11. PostgreSQL remains the persistent source of truth.
12. Core booking logic remains in Java.
13. The frontend never performs core database operations directly.
14. Normal cancellation does not delete booking records.
15. Every later phase remains compatible with earlier phases.

No technology is replaced during normal implementation.

## 5. Original PS Coverage

| Requirement | Implementation |
|---|---|
| Employee registration | Real registration + authentication |
| Room availability | Date/time availability engine |
| Booking | Transactional booking |
| Cancellation | Authorized cancellation |
| Booking history | Persistent booking history |
| HashSet | Java membership/index structures |
| HashMap | Java booking indexes |
| Frontend | Next.js |
| Backend | Java Spring Boot |
| JDBC | Spring JDBC / JdbcTemplate |
| Database | Neon PostgreSQL |
| Realtime | Spring WebSocket |
| Email | Gmail SMTP |
| 3D | Three.js + React Three Fiber |

## 6. Roles

### Employee
Register, verify email, login/logout, manage profile, view/search rooms, check availability, book rooms, view bookings, cancel eligible bookings, view history, receive realtime/email notifications.

### Admin
All employee capabilities plus employee management, room CRUD/status management, facility management, all-booking visibility, authorized cancellation, utilization information and audit logs.

## 7. Authentication

Supports:
- Registration
- Login
- Logout
- Email verification
- Forgot password
- Password reset
- Authenticated sessions
- Role-based authorization

Passwords are hashed and never stored in plaintext.

Registration flow:

```text
Register -> Validate -> Hash Password -> Create User -> Create Employee
         -> Send Verification Email -> Verify Email -> Activate Account
```

## 8. Rooms

Room fields:
- Room ID
- Room code
- Name
- Building
- Floor
- Capacity
- Description
- Status
- Facilities

Statuses:
`ACTIVE`, `DISABLED`, `MAINTENANCE`

Only active rooms can receive new bookings.

## 9. Availability

Users select date, start time and end time, with optional capacity/floor/building/facility filters. The backend returns rooms available for the complete interval.

## 10. Booking

Booking fields:
- Booking ID
- Employee ID
- Room ID
- Date
- Start time
- End time
- Purpose
- Status
- Created timestamp
- Updated timestamp

Lifecycle:

```text
PENDING -> CONFIRMED -> COMPLETED
              |
              +-> CANCELLED
```

### Double-booking rule

```text
newStart < existingEnd
AND
newEnd > existingStart
```

Application-level conflict detection is combined with database transaction protection for concurrent requests.

### Booking transaction

```text
BEGIN
 -> validate employee
 -> validate room
 -> validate time
 -> check room status
 -> check conflicts
 -> insert booking
 -> COMMIT
 -> publish realtime event
 -> send email
```

Failure causes rollback.

## 11. Cancellation and History

Employees may cancel their own eligible bookings; admins may cancel according to permissions. Cancellation changes `CONFIRMED` to `CANCELLED`; the row is retained for history and auditing.

History provides upcoming, completed/past and cancelled bookings.

## 12. HashSet and HashMap

HashSet is a genuine Java backend requirement:

```java
Set<String> employeeIdIndex;
Set<String> roomIdIndex;
Set<String> activeBookingIdIndex;
```

HashMap is a genuine Java backend requirement:

```java
Map<String, List<Booking>> roomBookingIndex;
Map<String, List<Booking>> employeeBookingIndex;
```

The database remains authoritative. The collections are application-level indexes and can be rebuilt from Neon after restart.

## 13. Database

Neon PostgreSQL is the persistent source of truth.

Core tables:

```text
users
employees
rooms
room_facilities
bookings
notifications
email_verifications
password_resets
audit_logs
```

### users
`id, email, password_hash, role, email_verified, created_at, updated_at`

### employees
`id, user_id, employee_id, name, department, created_at, updated_at`

### rooms
`id, room_code, name, building, floor, capacity, description, status, created_at, updated_at`

### bookings
`id, booking_id, employee_id, room_id, booking_date, start_time, end_time, purpose, status, created_at, updated_at`

### notifications
`id, user_id, type, title, message, is_read, created_at`

### email_verifications
`id, user_id, token_hash, expires_at, used_at, created_at`

### password_resets
`id, user_id, token_hash, expires_at, used_at, created_at`

### audit_logs
`id, user_id, action, entity_type, entity_id, metadata, created_at`

## 14. JDBC Architecture

```text
Next.js -> REST -> Controller -> Service -> Repository -> JdbcTemplate
                                                        -> PostgreSQL Driver
                                                        -> Neon
```

No JPA/Hibernate is used. All SQL is parameterized.

## 15. Backend Structure

```text
backend/src/main/java/com/meetspace/
├── controller/
├── service/
├── repository/
├── model/
├── dto/
├── security/
├── config/
├── exception/
├── realtime/
├── notification/
├── cache/
└── util/
```

Responsibilities: controllers handle HTTP, services contain business rules, repositories contain JDBC/SQL, DTOs define API contracts, security handles authentication/authorization, realtime handles WebSocket, notification handles email/in-app notifications, and cache contains HashSet/HashMap indexes.

## 16. API Contract

### Auth
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Employees
```http
GET /api/employees/me
PUT /api/employees/me
GET /api/admin/employees
```

### Rooms
```http
GET    /api/rooms
GET    /api/rooms/{roomId}
GET    /api/rooms/availability
POST   /api/admin/rooms
PUT    /api/admin/rooms/{roomId}
DELETE /api/admin/rooms/{roomId}
```

### Bookings
```http
POST /api/bookings
GET  /api/bookings
GET  /api/bookings/{bookingId}
POST /api/bookings/{bookingId}/cancel
GET  /api/bookings/history
```

## 17. Realtime

Technology: Spring WebSocket. Endpoint: `/ws`.

Events:

```text
ROOM_BOOKED
ROOM_CANCELLED
ROOM_STATUS_CHANGED
BOOKING_CREATED
BOOKING_CANCELLED
NOTIFICATION_CREATED
```

Flow:

```text
Booking Service -> Database Commit -> WebSocket Event -> Connected Clients
```

## 18. Gmail

Gmail SMTP is used for transactional email:
- Verification
- Booking confirmation
- Booking cancellation
- Password reset
- Meeting reminder

Environment variables:

```text
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_FROM
```

Credentials are never committed.

## 19. Three.js

Three.js + React Three Fiber + `@react-three/drei` provide an interactive 3D office.

Features:
- Rotate
- Zoom
- Pan
- Select rooms
- View room details
- Show availability
- Start booking

Data flow:

```text
Room API -> Next.js -> React Three Fiber -> Three.js
```

Three.js never accesses the database directly.

## 20. Frontend Pages

### Public
```text
/
/login
/register
/verify-email
/forgot-password
/reset-password
```

### Employee
```text
/dashboard
/rooms
/rooms/[id]
/office
/bookings
/bookings/[id]
/history
/calendar
/notifications
/profile
```

### Admin
```text
/admin
/admin/employees
/admin/rooms
/admin/bookings
/admin/analytics
/admin/audit-logs
```

## 21. Error Handling

Standard API response:

```json
{
  "success": false,
  "code": "ROOM_UNAVAILABLE",
  "message": "The selected room is already booked for this time."
}
```

Important codes:
`AUTH_REQUIRED`, `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `EMPLOYEE_NOT_FOUND`, `ROOM_NOT_FOUND`, `ROOM_UNAVAILABLE`, `BOOKING_NOT_FOUND`, `BOOKING_NOT_OWNED`, `INVALID_TIME_RANGE`, `ROOM_DISABLED`, `VALIDATION_ERROR`, `INTERNAL_ERROR`.

## 22. Security

Required:
- Password hashing
- Server-side authorization
- Role checks
- Input validation
- Parameterized JDBC queries
- SQL injection protection
- CORS
- Rate limiting
- Environment variables
- Booking ownership checks
- Admin authorization
- Audit logging

## 23. Repository Structure

```text
meetspace/
├── frontend/
├── backend/
├── database/
├── docs/
├── README.md
├── .gitignore
└── docker-compose.yml
```

Documentation:

```text
docs/
├── documentation.md
├── SSD.md
├── architecture.md
├── API.md
├── database.md
├── authentication.md
└── deployment.md
```

## 24. Frozen Development Phases

1. **Foundation** — repository, Next.js, Spring Boot, Maven, npm, environment, Git.
2. **Neon + JDBC** — database, driver, JdbcTemplate, schema, indexes, seed data.
3. **Backend Architecture** — models, DTOs, repositories, services, controllers, exceptions.
4. **Authentication** — registration, hashing, login/logout, verification, reset, Spring Security, roles.
5. **Employee** — profile, APIs, UI.
6. **Rooms** — CRUD, facilities, status, search, UI.
7. **HashSet + HashMap** — employee/room/booking indexes and database synchronization.
8. **Booking** — availability, conflicts, transactions, UI.
9. **Cancellation + History** — cancellation, ownership, status lifecycle, history, filters.
10. **Realtime** — WebSocket, booking/room events, live UI updates.
11. **Gmail** — SMTP, verification, booking confirmation, cancellation, reset, reminders.
12. **Three.js** — 3D office, room models, interaction, availability, booking integration.
13. **Admin** — dashboard, employees, rooms, bookings, analytics, audit logs.
14. **Production Hardening** — security, validation, rate limiting, logging, performance, accessibility, responsive design.
15. **Testing** — unit, integration, API, frontend and end-to-end tests.
16. **Deployment** — backend, frontend, Neon, Gmail, environment variables and production verification.

This sequence is frozen.

## 25. Testing

### Unit tests
Employee registration, duplicate detection, room lookup, availability, time overlap, booking, double booking, cancellation and history.

### Integration tests
JDBC repositories, authentication, room APIs, booking APIs and cancellation APIs.

### End-to-end flow

```text
Register -> Verify -> Login -> Find Room -> Book -> Email
-> View Booking -> Cancel -> View History
```

## 26. Deployment

```text
Internet
  |
  +--> Vercel --> Next.js
  |
  +--> Java Cloud Host --> Spring Boot --> JDBC --> Neon PostgreSQL
                                                   |
                                                   +--> Gmail SMTP
```

## 27. Environment Variables

### Frontend
```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_WS_URL
```

### Backend
```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
AUTH_SECRET
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_FROM
CORS_ALLOWED_ORIGINS
```

No secrets are stored in source code.

## 28. Definition of Done

The project is complete only when employee registration, email verification, login/logout, password reset, employee profile, room management, availability, booking, double-booking prevention, cancellation, history, HashSet, HashMap, JDBC, Neon persistence, WebSocket realtime, Gmail email, Three.js office, admin dashboard, security, testing and deployment all work.

## 29. Project Stability Rule

The project must remain the same from Phase 01 through Phase 16. Do not replace Next.js, Java, Spring Boot, JDBC, Neon, PostgreSQL, Three.js, React Three Fiber, Spring WebSocket, Gmail SMTP, HashSet or HashMap.

Implementation problems must be solved inside the frozen architecture.

## 30. Documentation Authority

The project specification consists of:

1. `documentation.md` — complete product documentation
2. `SSD.md` — software specification
3. `architecture.md` — architectural source of truth

Any genuine architecture change requires a documented reason, a new architecture version, explicit approval, updated documentation, and verification that previous requirements remain satisfied.

---

**MeetSpace v1.0 — Documentation Baseline**
