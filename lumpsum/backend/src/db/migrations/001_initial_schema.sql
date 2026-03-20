-- ─────────────────────────────────────────────────────────────
-- HAIQ Bakery — Initial Schema
-- Migration: 001_initial_schema.sql
-- Timezone: Africa/Kampala (EAT UTC+3)
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(320) UNIQUE NOT NULL,
  phone           VARCHAR(20),
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  password_hash   VARCHAR(255),
  is_guest        BOOLEAN NOT NULL DEFAULT false,
  guest_token     VARCHAR(64) UNIQUE,
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  consent_given   BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Admin Users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(320) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(200),
  role            VARCHAR(50) NOT NULL DEFAULT 'staff',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_role_check CHECK (role IN ('staff','superadmin'))
);

-- ─── Revoked Tokens ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti        VARCHAR(255) PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

-- ─── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           VARCHAR(200) UNIQUE NOT NULL,
  name           VARCHAR(200) NOT NULL,
  subtitle       VARCHAR(200),
  description    TEXT,
  tasting_notes  TEXT,
  category_id    INT REFERENCES categories(id) ON DELETE SET NULL,
  base_price     NUMERIC(12,2) NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  is_limited     BOOLEAN NOT NULL DEFAULT false,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Product Variants ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL,
  price       NUMERIC(12,2) NOT NULL,
  stock_qty   INT NOT NULL DEFAULT 0,
  sku         VARCHAR(100) UNIQUE,
  is_default  BOOLEAN NOT NULL DEFAULT false
);

-- ─── Product Images ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  public_id   VARCHAR(300),
  alt_text    VARCHAR(300),
  sort_order  INT NOT NULL DEFAULT 0
);

-- ─── Product Box Items ("What's in the box") ─────────────────
CREATE TABLE IF NOT EXISTS product_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       VARCHAR(300) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0
);

-- ─── Orders ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      VARCHAR(30) UNIQUE NOT NULL,
  tracking_token    VARCHAR(64) UNIQUE NOT NULL,
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  email             VARCHAR(320) NOT NULL,
  phone             VARCHAR(20) NOT NULL,
  delivery_address  TEXT NOT NULL,
  delivery_note     TEXT,
  gift_note         TEXT,
  subtotal          NUMERIC(12,2) NOT NULL,
  delivery_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL,
  status            VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method    VARCHAR(50),
  payment_status    VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  consent_given     BOOLEAN NOT NULL DEFAULT false,
  estimated_delivery TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT order_status_check CHECK (
    status IN ('pending','freshly_kneaded','ovenbound','on_the_cart','en_route','delivered','cancelled')
  ),
  CONSTRAINT payment_status_check CHECK (
    payment_status IN ('unpaid','pending','paid','failed','refunded')
  )
);

-- ─── Order Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id      UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name    VARCHAR(200) NOT NULL,
  variant_label   VARCHAR(100),
  unit_price      NUMERIC(12,2) NOT NULL,
  quantity        INT NOT NULL CHECK (quantity > 0),
  line_total      NUMERIC(12,2) NOT NULL
);

-- ─── Payments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method   VARCHAR(50) NOT NULL,
  provider_ref     VARCHAR(255),
  internal_ref     VARCHAR(100) UNIQUE NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  currency         VARCHAR(10) NOT NULL DEFAULT 'UGX',
  status           VARCHAR(50) NOT NULL DEFAULT 'initiated',
  webhook_payload  JSONB,
  signature_valid  BOOLEAN,
  payer_phone      VARCHAR(20),
  bank_proof_url   TEXT,
  bank_proof_public_id VARCHAR(300),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payment_status_check CHECK (
    status IN ('initiated','pending','successful','failed','cancelled','refunded')
  )
);

-- ─── Order Events (Audit Log) ────────────────────────────────
CREATE TABLE IF NOT EXISTS order_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type  VARCHAR(100) NOT NULL,
  old_value   VARCHAR(200),
  new_value   VARCHAR(200),
  actor_type  VARCHAR(50),
  actor_id    UUID,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Messages ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID REFERENCES orders(id) ON DELETE SET NULL,
  sender_type  VARCHAR(50) NOT NULL,
  sender_id    UUID,
  body         TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sender_type_check CHECK (sender_type IN ('customer','admin','system'))
);

-- ─── Newsletter Subscribers ───────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(320) UNIQUE NOT NULL,
  subscribed  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Request Logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS request_logs (
  id           BIGSERIAL PRIMARY KEY,
  method       VARCHAR(10),
  path         VARCHAR(500),
  status_code  INT,
  duration_ms  INT,
  ip           VARCHAR(50),
  user_agent   VARCHAR(500),
  user_id      UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Idempotency Keys ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key         VARCHAR(255) PRIMARY KEY,
  response    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Revoked Tokens Cleanup Function ─────────────────────────
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM revoked_tokens WHERE expires_at < NOW();
  DELETE FROM idempotency_keys WHERE created_at < NOW() - INTERVAL '24 hours';
  DELETE FROM request_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ─── Auto-update updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
