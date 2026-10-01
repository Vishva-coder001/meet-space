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