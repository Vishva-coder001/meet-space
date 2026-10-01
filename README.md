# MeetSpace

MeetSpace is a production-oriented office meeting room booking system. This repository is currently limited to **Phase 01 + Phase 02**: foundational project setup and a Neon PostgreSQL JDBC data layer.

## Architecture

```text
Next.js (React + TypeScript)
        | HTTP
Spring Boot (Java)
        |
Service -> Repository -> JdbcTemplate -> PostgreSQL JDBC Driver -> Neon PostgreSQL
```

The architecture is frozen. Database access uses Spring JDBC and `JdbcTemplate`; no ORM, JPA, Hibernate, or alternate database is included.

## Technology stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui foundation, Lucide, TanStack Query, Zustand, Zod, Three.js / React Three Fiber dependencies
- Backend: Java 17, Spring Boot, Spring Web, Spring JDBC, Bean Validation, PostgreSQL JDBC Driver, Maven
- Database: Neon PostgreSQL with SQL schema scripts

## Repository structure

```text
frontend/     Next.js application
backend/      Spring Boot Maven application
database/     Ordered PostgreSQL schema and seed scripts
docs/         Phase 01–02 documentation
```

## Development setup

1. Copy `.env.example` values into local environment files or your shell. Never commit credentials.
2. Create a Neon PostgreSQL database and provide `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`.
3. Run the scripts in `database/schema` in numeric order against Neon.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The product shell is available at `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` to the backend URL when it becomes available.

### Backend

```powershell
cd backend
mvn clean test
mvn spring-boot:run
```

The backend requires valid Neon environment variables. It intentionally fails at startup if they are absent rather than claiming a database connection.

## Current implementation

**Phase 01 + Phase 02**

Implemented: repository foundation, frontend shell and API client boundary, Spring Boot/JDBC configuration, UUID PostgreSQL schema, constraints, indexes, and supporting documentation.

Not implemented: authentication, employee/room management, booking workflows, WebSocket, email, 3D office, admin dashboard, or later roadmap phases.

## Future phases

The frozen roadmap continues with Phase 03: Backend Architecture, followed by Authentication & Security, employee and room management, booking workflows, realtime, email, 3D office, administration, hardening, testing, and deployment.

