-- ============================================================
-- Migration 005b: Fix existing tables + product_reviews
-- Run AFTER 005_loyalty_newsletter_specialdays.sql
-- Command:
--   psql -U haiq_user -d haiq_db -f 005b_addendum.sql
-- ============================================================

-- ── Fix newsletter_subscribers (already existed with fewer columns) ─────────
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS name         VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS is_active    BOOLEAN DEFAULT true;

-- Back-fill subscribed_at from created_at if it exists
UPDATE newsletter_subscribers
SET subscribed_at = created_at
WHERE subscribed_at IS NULL;

-- ── Product reviews (not in any prior migration) ─────────────────────────────
CREATE TABLE IF NOT EXISTS product_reviews (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name              VARCHAR(200) NOT NULL,
  rating            INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment           TEXT        NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  verified_purchase BOOLEAN     NOT NULL DEFAULT false,
  tracking_token    VARCHAR(64),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status  ON product_reviews(status);
