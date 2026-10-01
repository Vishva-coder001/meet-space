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

