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

