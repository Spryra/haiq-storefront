-- Migration 007: Password reset tokens
-- Run: node -e "require('./src/db/migrate.js')" or apply manually

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_reset UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token);
