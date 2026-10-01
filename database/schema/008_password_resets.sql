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

