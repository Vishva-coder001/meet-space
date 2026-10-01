# Database Architecture

MeetSpace uses Neon PostgreSQL as its persistent source of truth. The backend connects with the PostgreSQL JDBC driver through Spring `JdbcTemplate`.

## Configuration

Provide these environment variables to the backend:

```env
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=
```

`DATABASE_URL` must be a PostgreSQL JDBC URL accepted by the PostgreSQL driver. Credentials are never stored in this repository.

## Applying the schema

Apply the files in `database/schema` in numerical order. `001_users.sql` enables `pgcrypto` and establishes the shared `set_updated_at()` trigger function. The remaining scripts follow their foreign-key dependencies.

All tables use PostgreSQL UUID primary keys generated with `gen_random_uuid()`. Unique constraints provide indexes for `users.email`, `employees.employee_code`, and `rooms.room_code`; focused indexes serve booking and lookup paths.

## Tables

| Script | Table | Purpose |
| --- | --- | --- |
| 001 | users | User identity and activation state |
| 002 | employees | Employee profile foundation |
| 003 | rooms | Meeting room catalogue foundation |
| 004 | room_facilities | Facilities assigned to rooms |
| 005 | bookings | Future room booking records |
| 006 | notifications | Future user notifications |
| 007 | email_verifications | Future email verification tokens |
| 008 | password_resets | Future password reset tokens |
| 009 | audit_logs | Future audit trail |`n| 010 | phase04_authentication | Adds `users.email_verified` and upgrades authentication token storage to hashes for Phase 04 |

Booking conflict enforcement and all application workflows intentionally belong to later phases.

