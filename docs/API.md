# API â€” Phase 04
All responses use `{ success, code, message, data, errors }`. Requests and responses are JSON.

| Endpoint | Auth | Purpose |
|---|---|---|
| POST `/api/auth/register` | Public + CSRF | Validates employee ID, full name, department, email, 12+ character password; creates an unverified account. 409 for duplicate email. |
| POST `/api/auth/login` | Public + CSRF | Validates credentials and establishes server session; rejects inactive/unverified accounts. |
| POST `/api/auth/logout` | Session + CSRF | Invalidates the server session. |
| POST `/api/auth/verify-email` | Public + CSRF | Consumes an unexpired verification token. |
| POST `/api/auth/forgot-password` | Public + CSRF | Creates reset state without disclosing account existence. |
| POST `/api/auth/reset-password` | Public + CSRF | Consumes an unexpired reset token and replaces the BCrypt password hash. |
| GET `/api/auth/me` | Session | Returns safe user profile: id, email, role, emailVerified. |
| GET `/api/auth/csrf` | Public | Establishes CSRF cookie for credentialed writes. |

Errors include `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `ACCOUNT_INACTIVE`, `AUTH_REQUIRED`, and `INVALID_OR_EXPIRED_TOKEN`.

## Employee and room APIs — Phases 05–06
GET/PUT /api/employees/me requires authentication and exposes only permitted profile fields. GET /api/rooms and GET /api/rooms/{id} return active room metadata/facilities, never availability. POST/PUT/DELETE /api/admin/rooms require ROLE_ADMIN; DELETE is soft deactivation.


## Phase 08
POST /api/bookings creates an authenticated employee booking. GET /api/bookings returns that employee's bookings. GET /api/rooms/availability returns real availability for roomId/date/startTime/endTime. Conflicts return ROOM_UNAVAILABLE.

## Phase 09
POST /api/bookings/{bookingId}/cancel requires authentication and booking ownership. It changes only PENDING or CONFIRMED records to CANCELLED; records remain in GET /api/bookings history.

## Phase 10 WebSocket
STOMP endpoint /ws uses the existing authenticated HTTP session. Authenticated clients subscribe to shared /topic/rooms/availability (minimal ROOM_AVAILABILITY_CHANGED payload) and private /user/queue/bookings (BOOKING_CREATED/BOOKING_CANCELLED). Events publish after commit; clients invalidate targeted React Query data and REST/PostgreSQL remains authoritative.
