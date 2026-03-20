-- ─────────────────────────────────────────────────────────────
-- HAIQ Bakery — Indexes
-- Migration: 002_indexes.sql
-- ─────────────────────────────────────────────────────────────

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_guest_token ON users(guest_token) WHERE guest_token IS NOT NULL;

-- Products
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sort       ON products(sort_order);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_tracking     ON orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_orders_user         ON orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email        ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created      ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_order        ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_internal_ref ON payments(internal_ref);
CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_status       ON payments(status);

-- Order events
CREATE INDEX IF NOT EXISTS idx_order_events_order   ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created ON order_events(created_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_order  ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = false;

-- Request logs
CREATE INDEX IF NOT EXISTS idx_logs_created ON request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_status  ON request_logs(status_code);

-- Revoked tokens
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires ON revoked_tokens(expires_at);
