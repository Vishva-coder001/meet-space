CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_email_not_blank CHECK (length(btrim(email)) > 0),
    CONSTRAINT users_role_valid CHECK (role IN ('ADMIN', 'EMPLOYEE'))
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employees_user_id_unique UNIQUE (user_id),
    CONSTRAINT employees_employee_code_unique UNIQUE (employee_code),
    CONSTRAINT employees_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT employees_code_not_blank CHECK (length(btrim(employee_code)) > 0),
    CONSTRAINT employees_first_name_not_blank CHECK (length(btrim(first_name)) > 0),
    CONSTRAINT employees_last_name_not_blank CHECK (length(btrim(last_name)) > 0),
    CONSTRAINT employees_department_not_blank CHECK (length(btrim(department)) > 0)
);

CREATE TRIGGER trg_employees_set_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rooms_room_code_unique UNIQUE (room_code),
    CONSTRAINT rooms_room_code_not_blank CHECK (length(btrim(room_code)) > 0),
    CONSTRAINT rooms_name_not_blank CHECK (length(btrim(name)) > 0),
    CONSTRAINT rooms_floor_not_blank CHECK (length(btrim(floor)) > 0),
    CONSTRAINT rooms_capacity_positive CHECK (capacity > 0)
);

CREATE TRIGGER trg_rooms_set_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TABLE room_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    facility_name VARCHAR(100) NOT NULL,
    CONSTRAINT room_facilities_room_id_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT room_facilities_unique UNIQUE (room_id, facility_name),
    CONSTRAINT room_facilities_name_not_blank CHECK (length(btrim(facility_name)) > 0)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    room_id UUID NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bookings_employee_id_fk FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE RESTRICT,
    CONSTRAINT bookings_room_id_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE RESTRICT,
    CONSTRAINT bookings_time_range_valid CHECK (end_time > start_time),
    CONSTRAINT bookings_purpose_not_blank CHECK (length(btrim(purpose)) > 0),
    CONSTRAINT bookings_status_valid CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
);

CREATE INDEX idx_bookings_employee_id ON bookings (employee_id);
CREATE INDEX idx_bookings_room_id ON bookings (room_id);
CREATE INDEX idx_bookings_booking_date ON bookings (booking_date);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_room_date_time ON bookings (room_id, booking_date, start_time, end_time);

CREATE TRIGGER trg_bookings_set_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT notifications_type_not_blank CHECK (length(btrim(type)) > 0),
    CONSTRAINT notifications_title_not_blank CHECK (length(btrim(title)) > 0),
    CONSTRAINT notifications_message_not_blank CHECK (length(btrim(message)) > 0)
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);

CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_verifications_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT email_verifications_token_hash_unique UNIQUE (token_hash),
    CONSTRAINT email_verifications_token_hash_not_blank CHECK (length(btrim(token_hash)) > 0),
    CONSTRAINT email_verifications_expiry_valid CHECK (expires_at > created_at)
);

CREATE INDEX idx_email_verifications_user_id ON email_verifications (user_id);

CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT password_resets_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT password_resets_token_hash_unique UNIQUE (token_hash),
    CONSTRAINT password_resets_token_hash_not_blank CHECK (length(btrim(token_hash)) > 0),
    CONSTRAINT password_resets_expiry_valid CHECK (expires_at > created_at)
);

CREATE INDEX idx_password_resets_user_id ON password_resets (user_id);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT audit_logs_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT audit_logs_action_not_blank CHECK (length(btrim(action)) > 0),
    CONSTRAINT audit_logs_entity_type_not_blank CHECK (length(btrim(entity_type)) > 0)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
DO $$
BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='email_verifications' AND column_name='token') THEN
  ALTER TABLE email_verifications DROP CONSTRAINT IF EXISTS email_verifications_token_unique;
  ALTER TABLE email_verifications DROP CONSTRAINT IF EXISTS email_verifications_token_not_blank;
  ALTER TABLE email_verifications RENAME COLUMN token TO token_hash;
  UPDATE email_verifications SET token_hash='invalidated-' || id::text;
  ALTER TABLE email_verifications ADD CONSTRAINT email_verifications_token_hash_unique UNIQUE (token_hash);
 END IF;
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='email_verifications' AND column_name='verified_at') THEN ALTER TABLE email_verifications RENAME COLUMN verified_at TO used_at; END IF;
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='password_resets' AND column_name='token') THEN
  ALTER TABLE password_resets DROP CONSTRAINT IF EXISTS password_resets_token_unique;
  ALTER TABLE password_resets DROP CONSTRAINT IF EXISTS password_resets_token_not_blank;
  ALTER TABLE password_resets RENAME COLUMN token TO token_hash;
  UPDATE password_resets SET token_hash='invalidated-' || id::text;
  ALTER TABLE password_resets ADD CONSTRAINT password_resets_token_hash_unique UNIQUE (token_hash);
 END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
ADD CONSTRAINT bookings_no_active_overlap
EXCLUDE USING gist (
    room_id WITH =,
    tsrange(
        booking_date + start_time,
        booking_date + end_time,
        '[)'
    ) WITH &&
)
WHERE (status IN ('PENDING', 'CONFIRMED'));
