-- special_days_migration.sql
-- Add the missing range columns used by the public price switch.
ALTER TABLE special_days
  ADD COLUMN IF NOT EXISTS date_from DATE,
  ADD COLUMN IF NOT EXISTS date_to DATE;

-- Backfill legacy one-day records if they only use the old single date column.
UPDATE special_days
SET date_from = COALESCE(date_from, date),
    date_to   = COALESCE(date_to, date)
WHERE date_from IS NULL OR date_to IS NULL;
