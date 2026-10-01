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

