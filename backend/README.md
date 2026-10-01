# MeetSpace Backend

Spring Boot 3 / Java 17 backend using Spring JDBC and PostgreSQL JDBC Driver. It intentionally uses no ORM.

Set `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` from `backend/.env.example` before running `mvn spring-boot:run`. Apply the ordered scripts in `../database/schema` to Neon before starting the service.

