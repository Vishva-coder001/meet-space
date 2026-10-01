-- Development-only room seed. This file is never executed by Spring Boot.
-- Apply explicitly against a local/development Neon database after the ordered schema.
-- It creates two active rooms and one inactive room, without creating users or credentials.

INSERT INTO rooms (id, room_code, name, floor, capacity, description, is_active)
VALUES
  (gen_random_uuid(), 'DEV-A-01', 'Focus Room A', '1', 4, 'Small private room for focused team meetings.', true),
  (gen_random_uuid(), 'DEV-B-01', 'Collaboration Room B', '1', 8, 'Flexible collaboration room with video conferencing.', true),
  (gen_random_uuid(), 'DEV-C-01', 'Conference Room C', '2', 12, 'Large conference room reserved for inactive-room protection testing.', false)
ON CONFLICT (room_code) DO UPDATE
SET name = EXCLUDED.name,
    floor = EXCLUDED.floor,
    capacity = EXCLUDED.capacity,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

DELETE FROM room_facilities
WHERE room_id IN (SELECT id FROM rooms WHERE room_code IN ('DEV-A-01', 'DEV-B-01', 'DEV-C-01'));

INSERT INTO room_facilities (id, room_id, facility_name)
SELECT gen_random_uuid(), rooms.id, facilities.name
FROM rooms
JOIN (VALUES
  ('DEV-A-01', 'Display'),
  ('DEV-A-01', 'Whiteboard'),
  ('DEV-B-01', 'Video conferencing'),
  ('DEV-B-01', 'Whiteboard'),
  ('DEV-B-01', 'HDMI display'),
  ('DEV-C-01', 'Video conferencing'),
  ('DEV-C-01', 'Conference phone'),
  ('DEV-C-01', 'Presentation display')
) AS facilities(room_code, name) ON facilities.room_code = rooms.room_code
ON CONFLICT (room_id, facility_name) DO NOTHING;
