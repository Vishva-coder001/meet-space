# Authentication (Phase 04)
MeetSpace uses Spring Security with a backend-controlled HTTP session cookie (`HttpOnly`, environment-configured Secure and SameSite settings). The frontend uses credentialed requests; it never stores authentication tokens in browser storage. CSRF uses a readable `XSRF-TOKEN` cookie paired with the `X-XSRF-TOKEN` request header.

Registration validates employee identity data, hashes passwords with BCrypt, creates the linked employee record, and stores a SHA-256 hash of an unpredictable email-verification token. Login rejects invalid credentials, inactive users, and unverified accounts. Password reset requests are enumeration-safe and use single-use, expiring hashed tokens. Roles are server-derived (`EMPLOYEE`, `ADMIN`).

Email token delivery uses the Phase 11 Gmail SMTP integration. Verification and reset messages are emitted after their transaction commits; Phase 04 retains the secure verification/reset data flow.
## Phase 11 email delivery
Gmail SMTP uses backend-only MAIL_* environment variables (use a Gmail App Password where required). Verification/reset raw tokens exist only for an after-commit email URL; PostgreSQL stores SHA-256 hashes. SMTP failure is logged safely and does not roll back committed authentication state.

Gmail requires an App Password where the account requires it. Never set or commit a normal Gmail password, token, or SMTP secret in application configuration.
