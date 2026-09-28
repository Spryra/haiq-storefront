-- Event photo gallery (a few images per event, shown on its detail page)
CREATE TABLE IF NOT EXISTS event_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  public_id   VARCHAR(300),
  alt_text    VARCHAR(300),
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_images_event ON event_images (event_id, sort_order);

-- Bookings — name, phone, email; instantly confirmed by email, no approval step
CREATE TABLE IF NOT EXISTS event_bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  phone       VARCHAR(40)  NOT NULL,
  email       VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_bookings_event ON event_bookings (event_id, created_at DESC);
