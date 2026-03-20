-- ============================================================
-- Migration 006: Direct messages, order cancellation, newsletter campaigns
-- Run: psql -U haiq_user -d haiq_db -f 006_updates.sql
-- ============================================================

-- ── Direct messages (not order-linked, user-to-admin conversations) ──────────
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subject    VARCHAR(200),
  ADD COLUMN IF NOT EXISTS is_direct  BOOLEAN DEFAULT false;

-- Allow 'contact_form' as sender_type
ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS sender_type_check;

ALTER TABLE messages
  ADD CONSTRAINT sender_type_check
  CHECK (sender_type IN ('customer','admin','system','contact_form'));

CREATE INDEX IF NOT EXISTS idx_messages_user_id   ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_direct ON messages(is_direct);

-- ── Order cancellation reason ─────────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by        VARCHAR(20) CHECK (cancelled_by IN ('customer','admin'));

-- ── Newsletter campaigns ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      VARCHAR(300) NOT NULL,
  body_html    TEXT         NOT NULL,
  sent_at      TIMESTAMPTZ,
  sent_by      UUID         REFERENCES admin_users(id) ON DELETE SET NULL,
  recipient_count INT       DEFAULT 0,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Loyalty card: add phone field ─────────────────────────────────────────────
ALTER TABLE loyalty_cards
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(30);
