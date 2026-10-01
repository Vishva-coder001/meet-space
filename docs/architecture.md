# Architecture

## Implemented through Phase 04

```text
Next.js / React
  -> centralized API client (credentialed HTTP + CSRF)
  -> Spring MVC controller
  -> service (business rules, transactions)
  -> JdbcTemplate repository
  -> PostgreSQL JDBC driver / Neon PostgreSQL
```

Spring Security protects all routes except the public authentication flow. Controller, service, repository, model, DTO, configuration/security, exception, realtime, notification, cache, and util boundaries are retained under `com.meetspace`. WebSocket, notifications, cache/indexes, room, employee-management, and booking behavior remain unimplemented phase boundaries.

Phase 04 uses BCrypt passwords, server-side sessions, CORS restricted to the configured frontend origin, CSRF cookies, centralized JSON error responses, and parameterized JDBC SQL. Verification and reset tokens are random values stored only as SHA-256 hashes.

Phase 05 adds EmployeeController ? EmployeeService ? EmployeeRepository. Phase 06 adds RoomController ? RoomService ? RoomRepository, with transactions for room/facility changes. Admin mutations require ROLE_ADMIN; room deletion deactivates rather than removes records.


Phase 07: PostgreSQL remains authoritative. EmployeeIndex and RoomIndex use private HashSet UUID membership sets plus HashMap metadata lookups. IndexManager rebuilds both from JDBC at startup; services use database fallback on index misses and synchronize only after successful mutations.

Phase 08 adds BookingController ? BookingService ? BookingRepository ? JdbcTemplate/PostgreSQL. A PostgreSQL exclusion constraint protects active room intervals; Room/Employee indexes remain optimization only.

Phase 10: after PostgreSQL commit, Spring STOMP publishes minimal availability signals to /topic/rooms/availability and owner-private booking events via /user/queue/bookings. The realtime provider reconnects and invalidates targeted TanStack Query data for REST refresh.

Phase 11 sends Gmail SMTP notifications through after-commit EmailNotification listeners; booking commit/cancellation remains authoritative even when mail delivery fails.

Phase 12 adds a client-side React Three Fiber office route. It reads rooms through the existing room API and TanStack Query; the room directory remains the accessible alternative to canvas interaction.

Phase 11 Gmail SMTP is configured with MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, and FRONTEND_BASE_URL. Email events are delivered only after a successful transaction commit; template and SMTP failures do not alter persisted authentication or booking state.

The Phase 12 office route supplies a date and time window to the existing availability API. Its query keys include room and time scope, allowing the existing room-specific STOMP invalidation to refetch PostgreSQL-authoritative availability after commit.

Phase 13 adds server-authorized administrative read APIs under `/api/admin/**`. Spring Security enforces ROLE_ADMIN before controller, service, and JdbcTemplate read-model access; the `/admin` UI uses TanStack Query and never treats client-side visibility as authorization.

The Phase 13 dashboard reuses the existing protected room create, update, facility replacement, and soft-deactivation endpoints. Mutations invalidate room and dashboard queries; RoomService continues to synchronize the existing RoomIndex after database mutations.

Phase 14 keeps the same architecture while moving application and JDBC logging to safe production defaults and making session and Hikari limits environment-configurable.
