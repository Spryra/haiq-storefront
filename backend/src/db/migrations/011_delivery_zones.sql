CREATE TABLE IF NOT EXISTS delivery_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150) NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add delivery_zone_id to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_zone_id UUID
    REFERENCES delivery_zones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivery_zone_name VARCHAR(150);

-- Seed initial Kampala zones (based on Muyenga base location)
INSERT INTO delivery_zones (name, price, sort_order) VALUES
  ('Muyenga / Bukasa / Kabalagala',       3000,  1),
  ('Ggaba / Buziga / Munyonyo',           4000,  2),
  ('Makindye / Kibuye / Kansanga',        4000,  3),
  ('Kampala CBD / City Centre',           5000,  4),
  ('Kololo / Naguru / Ntinda',            5000,  5),
  ('Nakawa / Bugolobi / Luzira',          5000,  6),
  ('Naalya / Kyaliwajjala / Kira',        8000,  7),
  ('Namugongo / Kiwatule / Kireka',       8000,  8),
  ('Wakiso / Gayaza / Matugga',          10000,  9),
  ('Entebbe / Entebbe Road',            12000, 10),
  ('Outside Kampala (flat rate)',        15000, 11)
ON CONFLICT DO NOTHING;
