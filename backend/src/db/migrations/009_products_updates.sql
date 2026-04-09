-- Migration 009: Product updates - remove The Unboxing, configure Box Office properly
-- Soft-delete The Unboxing product (keep in DB for data integrity)
UPDATE products 
  SET is_active = false, updated_at = NOW() 
  WHERE slug = 'the-unboxing';

-- Ensure Box Office is configured as a box item with correct pricing
-- base_price is used on special days (40000), off_peak_price on regular days (80000)
UPDATE products 
  SET is_box_item = true, 
      base_price = 40000,         -- special day price
      off_peak_price = 80000,     -- regular day price
      updated_at = NOW()
  WHERE slug = 'box-office';
