-- ============================================================
-- Clean old products — keep only the 6 HAIQ cookies
-- Run: psql -U haiq_user -d haiq_db -f clean-old-products.sql
-- ============================================================

-- Remove old product images for non-cookie products
DELETE FROM product_images
WHERE product_id IN (
  SELECT id FROM products
  WHERE slug NOT IN ('venom','coconut','crimson-sin','campfire-after-dark','blackout','the-unboxing')
);

-- Remove old product items for non-cookie products
DELETE FROM product_items
WHERE product_id IN (
  SELECT id FROM products
  WHERE slug NOT IN ('venom','coconut','crimson-sin','campfire-after-dark','blackout','the-unboxing')
);

-- Remove old product variants for non-cookie products
DELETE FROM product_variants
WHERE product_id IN (
  SELECT id FROM products
  WHERE slug NOT IN ('venom','coconut','crimson-sin','campfire-after-dark','blackout','the-unboxing')
);

-- Remove the old products themselves
DELETE FROM products
WHERE slug NOT IN ('venom','coconut','crimson-sin','campfire-after-dark','blackout','the-unboxing');

-- Remove old non-cookie categories (keep 'cookies' only)
DELETE FROM categories
WHERE slug NOT IN ('cookies');

-- Confirm what's left
SELECT name, slug, base_price, is_active FROM products ORDER BY base_price;
