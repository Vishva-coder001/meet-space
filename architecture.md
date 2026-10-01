# MeetSpace Architecture

**Version:** 1.0  
**Status:** Frozen Baseline  
**Product:** Office Meeting Room Booking System  
**Architecture Rule:** This architecture remains unchanged throughout implementation.

---

## 1. Architecture Contract

MeetSpace is a full-stack application with:

- Next.js frontend
- Java Spring Boot backend
- JDBC/JdbcTemplate database access
- Neon PostgreSQL
- HashSet and HashMap application indexes
- Spring WebSocket realtime communication
- Gmail SMTP transactional email
- Three.js + React Three Fiber 3D office visualization

No ORM is used.

No direct frontend-to-database access is used for core application operations.

---

## 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │          NEXT.JS            │
                    │          FRONTEND           │
                    │                             │
                    │ React / TypeScript          │
                    │ Tailwind / shadcn/ui        │
                    │ TanStack Query              │
                    │ Zustand                     │
                    │ Three.js / React Three      │
                    └──────────────┬──────────────┘
                                   │
                         HTTPS REST / WebSocket
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       SPRING BOOT           │
                    │          BACKEND            │
                    │                             │
                    │ Controllers                 │
                    │ Services                    │
                    │ Repositories                │
                    │ Security                    │
                    │ Booking Engine              │
                    │ Realtime                    │
                    │ Notifications               │
                    │ HashSet / HashMap           │
                    └──────────────┬──────────────┘
                                   │
                                  JDBC
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       NEON POSTGRESQL       │
                    │                             │
                    │ Persistent Source of Truth  │
                    └─────────────────────────────┘
                                   │
                         ┌─────────┴─────────┐
                         ▼                   ▼
                  Gmail SMTP          Persistent History
```

---

## 3. Monorepo Structure

```text
meetspace/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/meetspace/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── model/
│   │   │   │   ├── dto/
│   │   │   │   ├── security/
│   │   │   │   ├── config/
│   │   │   │   ├── exception/
│   │   │   │   ├── realtime/
│   │   │   │   ├── notification/
│   │   │   │   ├── cache/
│   │   │   │   └── util/
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/
│   │   │           └── migration/
│   │   └── test/
│   └── pom.xml
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── queries/
│
├── docs/
│   ├── SSD.md
│   ├── architecture.md
│   ├── API.md
│   ├── database.md
│   ├── authentication.md
│   └── deployment.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 4. Frontend Architecture

```text
Next.js App Router
        │
        ├── Pages / Routes
        │
        ├── Components
        │
        ├── Features
        │
        ├── Hooks
        │
        ├── Zustand
        │
        ├── TanStack Query
        │
        ├── API Client
        │
        ├── WebSocket Client
        │
        └── Three.js / React Three Fiber
```

### Responsibilities

Next.js handles:

- Rendering
- Navigation
- Forms
- UI state
- Server state
- Authentication UI
- Booking UI
- Room visualization
- Realtime UI updates

It does not directly manage the PostgreSQL database.

---

## 5. Backend Architecture

```text
HTTP Request
     ↓
Controller
     ↓
DTO Validation
     ↓
Service
     ↓
Business Rules
     ↓
Repository
     ↓
JdbcTemplate
     ↓
Neon PostgreSQL
```

### Controller

Responsible for:

- HTTP routes
- Request parsing
- Response formatting

### Service

Responsible for:

- Business logic
- Authorization decisions
- Booking rules
- Conflict detection
- Transaction orchestration

### Repository

Responsible for:

- SQL
- JdbcTemplate
- Database reads/writes

### DTO

Responsible for:

- API request contracts
- API response contracts
- Validation boundaries

---

## 6. Database Architecture

Neon PostgreSQL is the persistent source of truth.

```text
users
 │
 └── employees
       │
       └── bookings ───── rooms
                            │
                            └── room_facilities
```

Additional tables:

```text
notifications
email_verifications
password_resets
audit_logs
```

---

## 7. JDBC Architecture

```text
Spring Service
      ↓
Repository
      ↓
JdbcTemplate
      ↓
PostgreSQL JDBC Driver
      ↓
Neon PostgreSQL
```

All SQL uses parameterized queries.

Example:

```java
jdbcTemplate.query(
    "SELECT * FROM employees WHERE employee_id = ?",
    employeeRowMapper,
    employeeId
);
```

No JPA repository exists in the project.

---

## 8. HashSet Architecture

HashSet is used for application-level membership indexes.

```java
Set<String> employeeIdIndex;
Set<String> roomIdIndex;
Set<String> activeBookingIdIndex;
```

Use cases:

```text
Is employee ID already known?
Is room ID known?
Is booking currently indexed?
```

The indexes can be initialized/synchronized from the database.

Database remains authoritative.

---

## 9. HashMap Architecture

HashMap is used for application-level relationship indexes.

```java
Map<String, List<Booking>> roomBookingIndex;

Map<String, List<Booking>> employeeBookingIndex;
```

### Room index

```text
R101 → B001, B005, B011
R102 → B002, B008
```

### Employee index

```text
E101 → B001, B009
E102 → B002, B003
```

The booking service uses these indexes to reduce unnecessary searches.

---

## 10. Booking Engine

```text
Create Booking
      ↓
Validate User
      ↓
Validate Room
      ↓
Validate Date/Time
      ↓
Check Room Status
      ↓
Find Existing Active Bookings
      ↓
Check Time Overlap
      ↓
Database Transaction
      ↓
Insert Booking
      ↓
Update HashMap Index
      ↓
Commit
      ↓
Publish WebSocket Event
      ↓
Send Email
```

Overlap:

```text
newStart < existingEnd
AND
newEnd > existingStart
```

If true:

```text
ROOM_UNAVAILABLE
```

---

## 11. Transaction Boundary

Booking creation is transactional.

```text
BEGIN
  |
  ├── Validate
  ├── Check conflict
  ├── Insert booking
  ├── Update required persistent state
  |
COMMIT
```

On failure:

```text
ROLLBACK
```

Realtime events and email should occur after successful persistence.

---

## 12. Cancellation Architecture

```text
Cancel Request
      ↓
Authentication
      ↓
Authorization
      ↓
Find Booking
      ↓
Check Owner/Admin
      ↓
Update Status
      ↓
COMMIT
      ↓
Update Index
      ↓
WebSocket Event
      ↓
Email
```

Booking is not physically deleted.

Status becomes:

```text
CANCELLED
```

This preserves history.

---

## 13. Realtime Architecture

```text
Booking Service
      │
      ├── Database
      │
      └── Event Publisher
              │
              ▼
        Spring WebSocket
              │
       ┌──────┴──────┐
       ▼             ▼
   Client A       Client B
       │             │
       ▼             ▼
   UI update      UI update
```

Events:

```text
ROOM_BOOKED
ROOM_CANCELLED
ROOM_STATUS_CHANGED
BOOKING_CREATED
BOOKING_CANCELLED
NOTIFICATION_CREATED
```

---

## 14. Email Architecture

```text
Spring Boot
     │
     ▼
Notification Service
     │
     ▼
Gmail SMTP
     │
     ▼
Employee Inbox
```

Emails:

```text
EMAIL_VERIFICATION
BOOKING_CONFIRMATION
BOOKING_CANCELLATION
PASSWORD_RESET
MEETING_REMINDER
```

Credentials are environment variables.

---

## 15. Three.js Architecture

```text
Backend Room API
       ↓
Next.js
       ↓
React Three Fiber
       ↓
Three.js Scene
       ↓
Room Meshes
       ↓
Availability State
       ↓
User Interaction
```

Three.js reads room state from frontend application state.

It does not access the database.

Room click:

```text
3D Room
   ↓
Room ID
   ↓
Room Details
   ↓
Availability
   ↓
Book Room
```

---

## 16. Authentication Architecture

```text
Register
   ↓
Validate
   ↓
Hash Password
   ↓
Store User
   ↓
Send Verification Email
   ↓
Verify Email
   ↓
Login
   ↓
Authenticated Session
   ↓
Spring Security
```

Authorization:

```text
Authenticated Employee
        │
        ├── Own profile
        ├── Own bookings
        └── Own history

Admin
        │
        ├── Employees
        ├── Rooms
        ├── Bookings
        └── Analytics
```

---

## 17. API Layer

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Rooms

```text
GET    /api/rooms
GET    /api/rooms/{roomId}
GET    /api/rooms/availability
POST   /api/admin/rooms
PUT    /api/admin/rooms/{roomId}
DELETE /api/admin/rooms/{roomId}
```

### Bookings

```text
POST /api/bookings
GET  /api/bookings
GET  /api/bookings/{bookingId}
POST /api/bookings/{bookingId}/cancel
GET  /api/bookings/history
```

### Employees

```text
GET /api/employees/me
PUT /api/employees/me
GET /api/admin/employees
```

---

## 18. Security Architecture

```text
Browser
  ↓ HTTPS
Next.js
  ↓
Spring Security
  ↓
Authentication
  ↓
Authorization
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
JDBC
```

Security rules:

- Never trust frontend authorization.
- Never construct SQL by string concatenation.
- Never store plaintext passwords.
- Never expose secrets to the frontend.
- Verify booking ownership server-side.
- Protect admin endpoints.
- Validate all input.

---

## 19. Deployment Architecture

```text
                         INTERNET
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
              Vercel              Java Host
                 │                     │
              Next.js              Spring Boot
                 │                     │
                 │                JDBC/HTTPS
                 │                     │
                 └──────────┬──────────┘
                            ▼
                      Neon PostgreSQL
                            │
                            ▼
                       Gmail SMTP
```

---

## 20. Environment Variables

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

No secrets are committed to Git.

---

## 21. Architecture Invariants

These must remain true throughout development:

1. Next.js remains the frontend.
2. Java Spring Boot remains the backend.
3. JDBC remains the database access mechanism.
4. Neon PostgreSQL remains the database.
5. HashSet remains part of the backend collection/index layer.
6. HashMap remains part of the backend collection/index layer.
7. Three.js remains the 3D engine.
8. React Three Fiber remains the React integration.
9. Spring WebSocket remains the realtime mechanism.
10. Gmail SMTP remains the email mechanism.
11. PostgreSQL remains the persistent source of truth.
12. Core booking logic remains in the Java backend.
13. Frontend never directly performs core database operations.
14. Booking records are not deleted for normal cancellation.
15. Every completed phase must remain compatible with previous phases.

---

## 22. Frozen Development Sequence

```text
01 Foundation
      ↓
02 Neon + JDBC
      ↓
03 Backend Architecture
      ↓
04 Authentication
      ↓
05 Employee
      ↓
06 Rooms
      ↓
07 HashSet + HashMap
      ↓
08 Booking Engine
      ↓
09 Cancellation + History
      ↓
10 WebSocket Realtime
      ↓
11 Gmail
      ↓
12 Three.js
      ↓
13 Admin
      ↓
14 Production Hardening
      ↓
15 Testing
      ↓
16 Deployment
```

No phase may replace a technology from the frozen stack.

---

## 23. Final Architecture

```text
                         MEETSPACE
                            │
             ┌──────────────┴──────────────┐
             │                             │
          FRONTEND                      BACKEND
             │                             │
         Next.js                      Spring Boot
         TypeScript                         │
         React                              │
         Tailwind                           │
         shadcn/ui                          │
         TanStack Query                     │
         Zustand                             │
         Three.js                            │
             │                               │
             │ REST / WebSocket              │
             └───────────────┬───────────────┘
                             │
                          Business
                           Logic
                             │
                    ┌────────┴────────┐
                    │                 │
                 HashSet           HashMap
                    │                 │
                    └────────┬────────┘
                             │
                           JDBC
                             │
                             ▼
                     Neon PostgreSQL
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
               Gmail SMTP        Audit/History
```

---

## 24. Architecture Completion Criteria

Architecture is considered correctly implemented when:

- All frontend requests go through the defined backend API.
- Core database operations use JDBC.
- Neon contains persistent data.
- HashSet indexes are used in real backend logic.
- HashMap indexes are used in real backend logic.
- Booking conflicts are prevented transactionally.
- Realtime events are published after successful changes.
- Emails are sent by the backend notification layer.
- Three.js reflects backend room state.
- Authentication is enforced by Spring Security.
- Admin authorization is enforced server-side.
- The final deployment matches this architecture.

---

## 25. Architecture Freeze

**This file is the architectural source of truth for MeetSpace.**

If implementation difficulties occur, the solution must first be sought within this architecture.

Do not replace the stack or redesign the system during a normal implementation phase.

Any genuine architecture change requires an explicit new version of this document and explicit approval before implementation continues.
