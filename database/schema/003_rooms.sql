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
