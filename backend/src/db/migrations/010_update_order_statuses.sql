-- Migration 010: Update existing order statuses from 7-value to 4-value schema
-- This migration converts old status values to their new equivalents:
-- - pending → pending (unchanged)
-- - freshly_kneaded → en_route (in-progress alternative)
-- - ovenbound → en_route (in-progress alternative)
-- - on_the_cart → pending (reset to pending for retry)
-- - en_route → en_route (unchanged)
-- - delivered → delivered (unchanged)
-- - cancelled → cancelled (unchanged)

-- Update freshly_kneaded orders to en_route
UPDATE orders 
SET status = 'en_route' 
WHERE status = 'freshly_kneaded';

-- Update ovenbound orders to en_route
UPDATE orders 
SET status = 'en_route' 
WHERE status = 'ovenbound';

-- Update on_the_cart orders to pending (reset for retry)
UPDATE orders 
SET status = 'pending' 
WHERE status = 'on_the_cart';

-- Verify all statuses are now in the valid set
-- This will show any status values that are not in the new 4-value schema:
-- SELECT DISTINCT status FROM orders WHERE status NOT IN ('pending', 'en_route', 'delivered', 'cancelled');
