-- Migration 005: Newsletter, Loyalty Cards, Special Days, Product updates
-- Run: psql -U haiq_user -d haiq_db -f 005_loyalty_newsletter_specialdays.sql

-- ── Newsletter subscribers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active   BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- ── Special days (admin-defined; box price drops on these days) ───────────────
CREATE TABLE IF NOT EXISTS special_days (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       VARCHAR(255) NOT NULL,            -- e.g. "Valentine's Day 2026"
  date_from   DATE NOT NULL,
  date_to     DATE NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_by  UUID REFERENCES admin_users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_special_days_dates ON special_days(date_from, date_to);

-- ── Loyalty cards ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','dispatched','delivered')),
  delivery_address TEXT NOT NULL,
  card_number      VARCHAR(20),                -- assigned by admin on approval
  points           INTEGER NOT NULL DEFAULT 0,
  tier             VARCHAR(20) NOT NULL DEFAULT 'Classic'
                   CHECK (tier IN ('Classic','Reserve','Crown')),
  applied_at       TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      UUID REFERENCES admin_users(id),
  dispatched_at    TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  notes            TEXT                        -- admin internal notes
);

CREATE INDEX IF NOT EXISTS idx_loyalty_user    ON loyalty_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_status  ON loyalty_cards(status);

-- ── Points ledger (one row per earning event) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_points_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points      INTEGER NOT NULL,               -- positive = earn, negative = redeem
  source      VARCHAR(50) NOT NULL,           -- 'order', 'admin', 'signup_bonus'
  order_id    UUID REFERENCES orders(id),
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add loyalty fields to users table ────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS loyalty_points  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_status  VARCHAR(30) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS loyalty_tier    VARCHAR(20) DEFAULT 'Classic';

-- ── Add is_box_item flag + off_peak_price to products ─────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_box_item     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS off_peak_price  NUMERIC(10,2) DEFAULT NULL;
-- When is_box_item = true AND today is NOT a special day, price = off_peak_price

-- ── Add full_name to users (replace first/last approach for quick signup) ─────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
