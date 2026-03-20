-- 004_reviews.sql

CREATE TABLE IF NOT EXISTS product_reviews (
  id               SERIAL PRIMARY KEY,
  product_id       INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name             VARCHAR(100) NOT NULL,
  rating           SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT        NOT NULL,
  verified_purchase BOOLEAN    NOT NULL DEFAULT false,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product   ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status    ON product_reviews(status);
