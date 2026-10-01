# MeetSpace — Software Specification Document (SSD)

**Version:** 1.0  
**Status:** Baseline / Frozen Architecture  
**Product:** MeetSpace — Office Meeting Room Booking System  
**Document Type:** Software Specification Document  
**Backend:** Java + Spring Boot + JDBC  
**Frontend:** Next.js + TypeScript  
**Database:** Neon PostgreSQL  
**3D:** Three.js + React Three Fiber  
**Realtime:** Spring WebSocket  
**Email:** Gmail SMTP  
**Build:** Maven + npm  
**Architecture Rule:** The stack, core architecture, database responsibility, and development phases defined in this document are frozen for the entire project.

---

# 1. Document Purpose

This document defines the complete functional, technical, architectural, database, API, security, UI, realtime, email, testing, and deployment requirements for MeetSpace.

The original problem statement is:

> Develop an Office Meeting Room Booking System with employee registration, room availability, booking, cancellation and booking history. Use HashSet and HashMap.

MeetSpace expands that problem statement into a complete end-to-end product while preserving every original requirement.

The system must be implemented as one consistent product from the first phase through final deployment.

---

# 2. Project Stability Contract

The following rules are frozen.

## 2.1 Fixed technology stack

The project will use:

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
- SQL
- JDBC

### Email
- Gmail SMTP

### Realtime
- Spring WebSocket

### Deployment
- Next.js frontend on Vercel
- Spring Boot backend on a Java-compatible cloud host
- Neon PostgreSQL for production database

## 2.2 No ORM

The backend will not use Hibernate/JPA as the database access layer.

All persistent database operations will use JDBC/JdbcTemplate.

## 2.3 Database source of truth

Neon PostgreSQL is the persistent source of truth.

HashSet and HashMap are application-level data structures/indexes and must never be treated as permanent storage.

## 2.4 No stack replacement midway

The project will not switch:

- Next.js to another frontend framework
- Java to another backend language
- JDBC to an ORM
- Neon to another database
- Three.js to another 3D engine
- WebSocket to another realtime mechanism
- Gmail SMTP to another email provider

If a technical problem occurs, the implementation will be fixed within the selected architecture.

## 2.5 Requirement preservation

No later phase may remove an earlier requirement.

---

# 3. Product Overview

MeetSpace is a real-time office meeting room booking platform.

Employees can:

1. Register
2. Verify their email
3. Login
4. View rooms
5. Check availability
6. Book rooms
7. Cancel their bookings
8. View booking history
9. Receive email notifications
10. Receive realtime availability updates
11. Explore the office using a 3D visualization

Administrators can additionally:

1. Manage employees
2. Create rooms
3. Update rooms
4. Disable rooms
5. Manage facilities
6. View all bookings
7. Cancel bookings when authorized
8. View room utilization
9. View system activity

---

# 4. Original Problem Statement Mapping

| Original Requirement | MeetSpace Implementation |
|---|---|
| Employee registration | Real account registration + employee profile |
| Room availability | Date/time based availability engine |
| Booking | Transactional room booking |
| Cancellation | Authorized booking cancellation |
| Booking history | Persistent active/past/cancelled history |
| HashSet | Employee/room/active identifier membership indexes |
| HashMap | Room booking and employee booking indexes |
| End-to-end product | Next.js + Spring Boot + Neon |
| Realtime | Spring WebSocket |
| Email | Gmail SMTP |
| 3D | Three.js office visualization |

---

# 5. Goals

## 5.1 Primary goals

- Build a complete production-style booking system.
- Make booking conflict detection reliable.
- Provide real authentication.
- Provide persistent booking history.
- Provide realtime room availability.
- Use JDBC explicitly.
- Use HashSet and HashMap meaningfully.
- Provide a 3D office experience using Three.js.
- Provide real email notifications.
- Maintain a single architecture throughout development.

## 5.2 Non-goals

The first release will not include:

- Public room marketplace
- External company integrations
- Paid subscriptions
- Mobile native applications
- AI room recommendations
- Calendar provider synchronization
- Multi-company SaaS tenancy

These may be future products, not MVP requirements.

---

# 6. User Roles

## 6.1 Employee

Permissions:

- Register
- Login
- Logout
- Verify email
- Manage own profile
- View rooms
- Search rooms
- Check availability
- Create booking
- View own bookings
- Cancel own eligible bookings
- View own booking history
- Receive notifications

## 6.2 Admin

Permissions include all employee permissions plus:

- Manage employees
- Create rooms
- Edit rooms
- Disable rooms
- Manage room facilities
- View all bookings
- Cancel bookings when authorized
- View analytics
- View audit activity

---

# 7. Functional Requirements

## FR-01 Employee Registration

The system shall allow an employee to register with:

- Employee ID
- Full name
- Company email
- Department
- Password

Validation:

- Employee ID must be unique.
- Email must be unique.
- Password must meet security rules.
- Required fields cannot be empty.
- Email verification is required before normal product access.

---

## FR-02 Authentication

The system shall support:

- Registration
- Login
- Logout
- Email verification
- Password reset
- Session/token validation
- Role-based authorization

Backend authorization is mandatory.

---

## FR-03 Room Management

Each room shall contain:

- Room code
- Name
- Building
- Floor
- Capacity
- Description
- Status
- Facilities

Room status:

- ACTIVE
- DISABLED
- MAINTENANCE

Disabled rooms cannot receive new bookings.

---

## FR-04 Room Availability

Users shall be able to provide:

- Date
- Start time
- End time

The system shall return rooms that are available during the complete requested interval.

Availability must account for:

- Existing confirmed bookings
- Cancelled bookings
- Room status
- Maintenance/disabled state
- Time overlap

---

## FR-05 Booking

A booking shall contain:

- Booking ID
- Employee
- Room
- Date
- Start time
- End time
- Purpose
- Status
- Creation timestamp
- Last update timestamp

Booking validation:

- Employee must exist.
- Employee must be authorized.
- Room must exist.
- Room must be active.
- Date/time must be valid.
- Start time must be before end time.
- Requested interval must not conflict with an existing active booking.

---

## FR-06 Double Booking Prevention

The system shall prevent overlapping active bookings for the same room.

Overlap condition:

`newStart < existingEnd AND newEnd > existingStart`

Application-level checking will be performed by the Java booking service.

Database-level transactional protection will also be used so simultaneous requests cannot create inconsistent bookings.

---

## FR-07 Cancellation

Employees can cancel their own eligible bookings.

Admins can cancel bookings according to administrative permissions.

Cancellation changes booking status to:

`CANCELLED`

The original booking record remains available for history and auditing.

---

## FR-08 Booking History

Employees shall be able to view:

- Upcoming bookings
- Completed bookings
- Cancelled bookings

History must be persistent.

---

## FR-09 Realtime Availability

When a booking or cancellation occurs:

1. Backend updates the database.
2. Backend publishes a realtime event.
3. Connected clients receive the event.
4. Frontend updates affected room availability.

A manual page refresh should not be required.

---

## FR-10 Email

Gmail SMTP shall be used for transactional email.

Required emails:

- Email verification
- Booking confirmation
- Booking cancellation
- Password reset
- Upcoming meeting reminder

---

## FR-11 3D Office

The frontend shall provide a Three.js-based office visualization.

Users can:

- Rotate the scene
- Zoom
- Pan
- Select rooms
- View room information
- See availability state
- Start booking from a selected room

Three.js is a functional feature, not a decorative animation.

---

## FR-12 Admin Dashboard

Admin dashboard shall provide:

- Employee count
- Room count
- Today's booking count
- Active booking count
- Room utilization information
- Recent booking activity
- Room management
- Employee management
- Booking management

---

# 8. Non-Functional Requirements

## NFR-01 Security

The application shall:

- Hash passwords.
- Never store plaintext passwords.
- Protect private API endpoints.
- Enforce roles server-side.
- Validate all incoming requests.
- Use parameterized JDBC queries.
- Protect against SQL injection.
- Keep secrets in environment variables.
- Use secure production transport.
- Validate booking ownership.

## NFR-02 Reliability

Booking creation must be transactional.

A booking must not be reported as successful if the database transaction fails.

## NFR-03 Performance

Common lookup operations should use:

- Database indexes
- HashSet membership checks
- HashMap application indexes
- Pagination for large lists

## NFR-04 Maintainability

Backend responsibilities must be separated into:

- Controller
- Service
- Repository
- DTO
- Model
- Security
- Configuration

## NFR-05 Responsive UI

The frontend shall work on:

- Desktop
- Laptop
- Tablet
- Mobile

## NFR-06 Accessibility

UI should support:

- Keyboard navigation
- Semantic controls
- Clear focus states
- Appropriate contrast
- Form labels
- Useful error messages

---

# 9. System Architecture

```text
                         ┌─────────────────────┐
                         │       USER          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      NEXT.JS        │
                         │      FRONTEND       │
                         │                     │
                         │ React + TypeScript  │
                         │ Tailwind + shadcn   │
                         │ TanStack Query      │
                         │ Zustand             │
                         │ Three.js/R3F        │
                         └──────────┬──────────┘
                                    │
                         REST / WebSocket
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    SPRING BOOT      │
                         │      BACKEND        │
                         │                     │
                         │ Controllers         │
                         │ Services            │
                         │ Security            │
                         │ Booking Engine      │
                         │ WebSocket            │
                         │ Email Service       │
                         │ HashSet / HashMap   │
                         └──────────┬──────────┘
                                    │
                                  JDBC
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   NEON POSTGRESQL   │
                         │                     │
                         │ Persistent Source   │
                         │       of Truth      │
                         └─────────────────────┘
                                    │
                    ┌───────────────┴──────────────┐
                    ▼                              ▼
             Gmail SMTP                    Audit/History
```

---

# 10. Backend Architecture

```text
backend/
└── src/main/java/com/meetspace/
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

## Controller

Receives HTTP requests and returns API responses.

## Service

Contains business rules.

## Repository

Contains JDBC database access.

## Model

Represents domain objects.

## DTO

Represents API request/response structures.

## Cache/Index

Contains HashSet/HashMap application indexes.

---

# 11. JDBC Architecture

```text
REST Request
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
JdbcTemplate
    ↓
PostgreSQL Driver
    ↓
Neon PostgreSQL
```

No JPA/Hibernate is used.

All queries must use parameters.

Example:

```sql
SELECT *
FROM employees
WHERE employee_id = ?
```

---

# 12. HashSet and HashMap Design

## HashSet

The backend shall use HashSet for fast membership checks.

Examples:

```java
Set<String> employeeIdIndex;
Set<String> roomIdIndex;
Set<String> activeBookingIdIndex;
```

The exact active entries are synchronized with the database lifecycle.

## HashMap

The backend shall use HashMap for application-level indexes.

```java
Map<String, List<Booking>> roomBookingIndex;

Map<String, List<Booking>> employeeBookingIndex;
```

Conceptually:

```text
roomBookingIndex

R101 → [B001, B005, B011]
R102 → [B002, B008]
```

and:

```text
employeeBookingIndex

E101 → [B001, B009]
E102 → [B002, B003]
```

These indexes support availability and history workflows.

Database remains authoritative.

---

# 13. Database Design

## users

```text
id
email
password_hash
role
email_verified
created_at
updated_at
```

## employees

```text
id
user_id
employee_id
name
department
created_at
updated_at
```

## rooms

```text
id
room_code
name
building
floor
capacity
description
status
created_at
updated_at
```

## room_facilities

```text
id
room_id
facility_name
```

## bookings

```text
id
booking_id
employee_id
room_id
booking_date
start_time
end_time
purpose
status
created_at
updated_at
```

## notifications

```text
id
user_id
type
title
message
is_read
created_at
```

## email_verifications

```text
id
user_id
token_hash
expires_at
used_at
created_at
```

## password_resets

```text
id
user_id
token_hash
expires_at
used_at
created_at
```

## audit_logs

```text
id
user_id
action
entity_type
entity_id
metadata
created_at
```

---

# 14. Database Relationships

```text
users
  │
  └── 1 : 1 ── employees

employees
  │
  └── 1 : N ── bookings

rooms
  │
  ├── 1 : N ── room_facilities
  │
  └── 1 : N ── bookings

users
  │
  ├── 1 : N ── notifications
  ├── 1 : N ── audit_logs
  ├── 1 : N ── email_verifications
  └── 1 : N ── password_resets
```

---

# 15. Booking Lifecycle

```text
PENDING
   │
   ▼
CONFIRMED
   │
   ├──────────────► CANCELLED
   │
   ▼
COMPLETED
```

Cancelled bookings are retained for history.

---

# 16. API Specification

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

## Employees

```http
GET /api/employees/me
PUT /api/employees/me
GET /api/admin/employees
```

## Rooms

```http
GET    /api/rooms
GET    /api/rooms/{roomId}
POST   /api/admin/rooms
PUT    /api/admin/rooms/{roomId}
DELETE /api/admin/rooms/{roomId}
```

## Availability

```http
GET /api/rooms/availability
```

Parameters:

```text
date
startTime
endTime
capacity
floor
facility
```

## Bookings

```http
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/{bookingId}
POST   /api/bookings/{bookingId}/cancel
GET    /api/bookings/history
```

## Admin bookings

```http
GET  /api/admin/bookings
POST /api/admin/bookings/{bookingId}/cancel
```

---

# 17. Realtime Events

WebSocket endpoint:

```text
/ws
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

Example event:

```json
{
  "type": "ROOM_BOOKED",
  "roomId": "R101",
  "date": "2026-09-30",
  "startTime": "10:00",
  "endTime": "11:00"
}
```

---

# 18. Email Specification

Gmail SMTP configuration is environment-based.

Required environment variables:

```text
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_FROM
```

The project must never commit credentials.

Templates:

```text
verification-email
booking-confirmation
booking-cancellation
password-reset
meeting-reminder
```

---

# 19. Frontend Screens

## Public

- Landing page
- Login
- Register
- Email verification
- Forgot password
- Reset password

## Employee

- Dashboard
- Rooms
- Room details
- 3D office
- Booking
- My bookings
- Booking history
- Calendar
- Notifications
- Profile

## Admin

- Admin dashboard
- Employees
- Rooms
- Bookings
- Analytics
- Audit logs

---

# 20. UI Design Direction

Visual style:

- Modern enterprise SaaS
- Clean layout
- Strong typography
- Minimal unnecessary decoration
- Responsive cards
- Clear status indicators
- Accessible forms
- Smooth but restrained animations
- 3D visualization used where useful

Status colors should consistently communicate:

- Available
- Booked
- Cancelled
- Maintenance
- Disabled

---

# 21. 3D Office Architecture

```text
3D Office
    │
    ├── Building
    │
    ├── Floor
    │
    ├── Rooms
    │    ├── Conference A
    │    ├── Conference B
    │    └── Meeting C
    │
    └── Room interaction
          ↓
      Room details
          ↓
       Booking
```

Room state must be driven by backend data.

Three.js must not maintain an independent source of truth.

---

# 22. Error Handling

Standard API response:

```json
{
  "success": false,
  "code": "ROOM_UNAVAILABLE",
  "message": "The selected room is already booked for this time."
}
```

Important error codes:

```text
AUTH_REQUIRED
INVALID_CREDENTIALS
EMAIL_NOT_VERIFIED
EMPLOYEE_NOT_FOUND
ROOM_NOT_FOUND
ROOM_UNAVAILABLE
BOOKING_NOT_FOUND
BOOKING_NOT_OWNED
INVALID_TIME_RANGE
ROOM_DISABLED
VALIDATION_ERROR
INTERNAL_ERROR
```

---

# 23. Security Model

Authentication:

```text
User
 ↓
Login
 ↓
Secure authenticated session
 ↓
Spring Security
 ↓
Authorization
```

Authorization:

```text
Employee
 ├── Own profile
 ├── Own bookings
 └── Own history

Admin
 └── Administrative resources
```

Every sensitive operation is validated server-side.

---

# 24. Booking Transaction

Booking creation must follow:

```text
BEGIN TRANSACTION
       ↓
Validate employee
       ↓
Validate room
       ↓
Validate date/time
       ↓
Check active conflicting booking
       ↓
Insert booking
       ↓
Update required indexes
       ↓
Commit
       ↓
Publish realtime event
       ↓
Send email
```

If the transaction fails:

```text
ROLLBACK
```

The frontend receives failure.

---

# 25. Cancellation Transaction

```text
BEGIN TRANSACTION
       ↓
Find booking
       ↓
Validate ownership/role
       ↓
Validate cancellation eligibility
       ↓
Update status = CANCELLED
       ↓
Commit
       ↓
Update indexes
       ↓
Publish realtime event
       ↓
Send cancellation email
```

---

# 26. Testing Strategy

## Backend unit tests

- Employee registration
- Duplicate employee
- Room lookup
- Availability calculation
- Time overlap
- Booking creation
- Double booking prevention
- Cancellation
- History

## Repository tests

- Insert employee
- Read employee
- Insert room
- Insert booking
- Update cancellation
- Queries

## API integration tests

- Authentication
- Room APIs
- Booking APIs
- Admin APIs

## Frontend tests

- Forms
- Availability UI
- Booking flow
- Cancellation flow
- Error states

## End-to-end tests

Critical path:

```text
Register
 → Verify
 → Login
 → Find room
 → Book
 → Receive confirmation
 → View booking
 → Cancel
 → View history
```

---

# 27. Observability

Backend logging should cover:

- Authentication events
- Booking creation
- Booking cancellation
- Admin actions
- Email failures
- Realtime failures
- Database failures

Sensitive information must not be logged.

---

# 28. Deployment

## Frontend

```text
Next.js → Vercel
```

## Backend

```text
Spring Boot → Java-compatible cloud host
```

## Database

```text
Neon PostgreSQL
```

## Email

```text
Gmail SMTP
```

Environment variables are configured separately for development and production.

---

# 29. Environment Configuration

Frontend:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_WS_URL
```

Backend:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD

JWT_SECRET

MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_FROM

CORS_ALLOWED_ORIGINS
```

Secrets must never be committed.

---

# 30. Development Phases — Frozen

The project will follow this exact sequence.

## Phase 01 — Repository and Foundation

- Create monorepo
- Create Next.js application
- Create Spring Boot application
- Configure Maven
- Configure frontend
- Configure environment files
- Configure Git

## Phase 02 — Neon and JDBC

- Create Neon database
- Configure PostgreSQL driver
- Configure JdbcTemplate
- Create schema
- Create indexes
- Create seed data

## Phase 03 — Backend Architecture

- Models
- DTOs
- Repositories
- Services
- Controllers
- Exception handling

## Phase 04 — Authentication

- Registration
- Password hashing
- Login
- Logout
- Email verification
- Password reset
- Spring Security
- Roles

## Phase 05 — Employee

- Profile
- Employee APIs
- Employee frontend
- Validation

## Phase 06 — Rooms

- Room CRUD
- Facilities
- Room status
- Room search
- Room UI

## Phase 07 — HashSet and HashMap

- Employee ID index
- Room ID index
- Room booking index
- Employee booking index
- Synchronization with database

## Phase 08 — Booking Engine

- Availability
- Conflict detection
- Transactional booking
- Booking UI
- Booking confirmation

## Phase 09 — Cancellation and History

- Cancellation
- Authorization
- Status lifecycle
- History UI
- Filters

## Phase 10 — Realtime

- Spring WebSocket
- Room events
- Booking events
- Frontend subscriptions
- Live UI updates

## Phase 11 — Gmail

- SMTP
- Verification email
- Booking confirmation
- Cancellation
- Password reset
- Reminder

## Phase 12 — Three.js

- 3D office
- Rooms
- Interaction
- Live availability
- Booking integration

## Phase 13 — Admin

- Dashboard
- Employees
- Rooms
- Bookings
- Analytics
- Audit logs

## Phase 14 — Production Hardening

- Security
- Validation
- Rate limiting
- Error handling
- Logging
- Performance
- Accessibility
- Responsive design

## Phase 15 — Testing

- Unit tests
- Integration tests
- API tests
- Frontend tests
- End-to-end tests

## Phase 16 — Deployment

- Deploy backend
- Deploy frontend
- Connect Neon
- Configure Gmail
- Configure environment variables
- Production testing

---

# 31. Definition of Done

The project is complete only when:

- Employee registration works.
- Real authentication works.
- Email verification works.
- Login/logout works.
- Rooms can be managed.
- Room availability works.
- Booking works.
- Double booking is prevented.
- Cancellation works.
- Booking history works.
- HashSet is genuinely used.
- HashMap is genuinely used.
- JDBC is genuinely used.
- Neon PostgreSQL stores persistent data.
- Realtime updates work.
- Gmail notifications work.
- Three.js office visualization works.
- Admin functionality works.
- Security checks work.
- Tests pass.
- Frontend and backend are deployed.
- Production configuration is documented.

---

# 32. Final Architecture Principle

The product has one source of truth and one fixed architecture:

```text
NEXT.JS
   │
   │ REST / WebSocket
   ▼
SPRING BOOT
   │
   ├── Business Logic
   ├── Spring Security
   ├── HashSet
   ├── HashMap
   ├── WebSocket
   └── Gmail SMTP
   │
   │ JDBC
   ▼
NEON POSTGRESQL
```

Three.js belongs inside the Next.js frontend and consumes backend room/availability data.

No technology change is permitted during implementation unless the user explicitly creates a new project version and approves an architecture revision.

---

# 33. Project Success Statement

MeetSpace will transform the original Java collections problem into a complete real-world office product while preserving the educational requirements.

The final project demonstrates:

- Full-stack engineering
- Java
- Spring Boot
- JDBC
- SQL
- PostgreSQL
- Neon
- HashSet
- HashMap
- REST APIs
- Authentication
- Authorization
- WebSockets
- Email
- Next.js
- TypeScript
- React
- Three.js
- Database transactions
- Testing
- Deployment
- Production-oriented architecture
