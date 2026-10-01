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