CREATE TABLE room_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    facility_name VARCHAR(100) NOT NULL,
    CONSTRAINT room_facilities_room_id_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT room_facilities_unique UNIQUE (room_id, facility_name),
    CONSTRAINT room_facilities_name_not_blank CHECK (length(btrim(facility_name)) > 0)
);

