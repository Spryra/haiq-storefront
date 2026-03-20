-- ============================================================
-- Migration 005: Newsletter, Special Days, Loyalty Cards
-- Run: psql -U haiq_user -d haiq_db -f 005_loyalty_newsletter_specialdays.sql
-- ============================================================

-- ── Newsletter subscribers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255),
  subscribed_at TIMESTAMPTZ  DEFAULT NOW(),
  is_active     BOOLEAN      DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email    ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active   ON newsletter_subscribers(is_active);

-- ── Special days (admin-defined; controls Unboxing box price) ─────────────────
CREATE TABLE IF NOT EXISTS special_days (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label       VARCHAR(255) NOT NULL,
  date_from   DATE         NOT NULL,
  date_to     DATE         NOT NULL,
  is_active   BOOLEAN      DEFAULT true,
  created_by  UUID         REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  CONSTRAINT special_days_dates_check CHECK (date_to >= date_from)
);

CREATE INDEX IF NOT EXISTS idx_special_days_active ON special_days(is_active, date_from, date_to);

-- ── Loyalty cards ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','dispatched','delivered')),
  delivery_address TEXT        NOT NULL,
  card_number      VARCHAR(30),
  points           INTEGER     NOT NULL DEFAULT 0,
  tier             VARCHAR(20) NOT NULL DEFAULT 'Classic'
                   CHECK (tier IN ('Classic','Reserve','Crown')),
  applied_at       TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      UUID        REFERENCES admin_users(id) ON DELETE SET NULL,
  dispatched_at    TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  admin_notes      TEXT
);

CREATE INDEX IF NOT EXISTS idx_loyalty_user   ON loyalty_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_status ON loyalty_cards(status);

-- ── Points ledger ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_points_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points     INTEGER     NOT NULL,
  source     VARCHAR(50) NOT NULL CHECK (source IN ('order','admin_grant','signup_bonus')),
  order_id   UUID        REFERENCES orders(id) ON DELETE SET NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_log_user ON loyalty_points_log(user_id);

-- ── Extend users table ────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name      VARCHAR(255),
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_tier   VARCHAR(20) DEFAULT 'Classic',
  ADD COLUMN IF NOT EXISTS loyalty_status VARCHAR(30) DEFAULT NULL;

-- Back-fill full_name from first_name + last_name if those columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    UPDATE users
    SET full_name = TRIM(COALESCE(first_name,'') || ' ' || COALESCE(last_name,''))
    WHERE full_name IS NULL;
  END IF;
END $$;

-- ── Extend products table for box pricing ─────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_box_item    BOOLEAN        DEFAULT false,
  ADD COLUMN IF NOT EXISTS off_peak_price NUMERIC(10,2)  DEFAULT NULL;

-- ── Mark The Unboxing as a box item if it already exists ──────────────────────
UPDATE products
SET
  is_box_item    = true,
  off_peak_price = 80000
WHERE slug = 'the-unboxing'
  AND is_box_item = false;
