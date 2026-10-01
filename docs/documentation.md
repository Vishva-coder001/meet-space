# MeetSpace Documentation

## Implemented phases

### Phase 01 √¢‚Ç¨‚Äù Foundation & Repository Setup

- Monorepo directories for frontend, backend, database, and documentation
- Next.js App Router with TypeScript and Tailwind CSS
- Professional responsive product home screen and accessibility foundations
- Spring Boot Maven application with Java 17
- Environment templates and Git ignore rules

### Phase 02 √¢‚Ç¨‚Äù Neon PostgreSQL + JDBC

- Spring JDBC and PostgreSQL JDBC Driver configuration
- Environment-driven Neon datasource properties
- Ordered, PostgreSQL-compatible schema scripts using UUID primary keys
- `JdbcTemplate` repository boundary

No later-phase application behavior is implemented.


### Phase 03 ‚Äî Backend Architecture

- Controller/service/repository/DTO/model/security/configuration/exception boundaries
- Consistent API responses and centralized exception handling

### Phase 04 ‚Äî Authentication & Security

- JDBC-backed registration, linked employee foundation, BCrypt passwords, session login/logout, roles, verification and reset-token data flows
- Spring Security, explicit credentialed CORS, CSRF protection, and restrained authentication screens
- Gmail delivery intentionally remains Phase 11
### Phase 05 ó Employee Management
- Authenticated employee profile retrieval and permitted profile updates via JdbcTemplate.

### Phase 06 ó Meeting Room Management
- Active room directory/detail APIs and admin-only create, update, and soft-deactivation with transactional facility replacement.


### Phase 07 ó HashSet + HashMap
- Derived employee and room HashSet/HashMap indexes initialized and rebuildable from PostgreSQL; no booking indexes implemented.


### Phase 08 ó Booking Engine
- Authenticated, transactional PostgreSQL bookings with strict overlap detection and database-level exclusion protection; basic availability and own-booking APIs.


- Phase 08 frontend now provides availability checks, booking confirmation, and an authenticated booking list; cancellation is not implemented.

### Phase 09 ó Cancellation + History
- Owner-only transactional cancellation marks eligible bookings CANCELLED without deleting them. Bookings UI separates upcoming entries from persistent history.


### Phase 10 ó Real-Time WebSocket
- Authenticated STOMP /ws, after-commit shared availability and private owner booking events, centralized client subscription/reconnect, and REST-authoritative query invalidation.


### Phase 11 ó Gmail SMTP
- Environment-configured Gmail SMTP after-commit verification and reset email notifications; delivery failures do not change PostgreSQL state.


- Booking confirmation and cancellation notifications are published as after-commit EmailNotification events using persisted owner/room data; SMTP failure cannot alter booking state.


- Phase 11 now renders the four classpath HTML templates as multipart Gmail SMTP messages with a plain-text fallback; SMTP errors are contained after commit.
