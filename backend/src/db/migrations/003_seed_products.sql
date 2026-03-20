-- =============================================================
-- HAIQ Bakery -- Seed Data
-- Pure SQL only: no DO blocks, no dollar-quoting, no variables
-- =============================================================

-- Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Cakes',      'cakes',      'Layer cakes and celebration cakes',          1),
  ('Pastries',   'pastries',   'Croissants, danishes, and artisan pastries', 2),
  ('Bread',      'bread',      'Freshly baked artisan breads',               3),
  ('Cookies',    'cookies',    'Handcrafted premium cookies',                4),
  ('Gift Boxes', 'gift-boxes', 'Curated gift collections',                   5)
ON CONFLICT (slug) DO NOTHING;

-- PRODUCT 1: The Kampala Classic
INSERT INTO products (slug, name, subtitle, description, tasting_notes, category_id, base_price, is_featured, sort_order)
SELECT 'the-kampala-classic','The Kampala Classic','(Triple Chocolate)','Our most celebrated creation. Three days in the making, this triple-layer chocolate cake is HAIQ in a single bite. Dense, moist, unapologetically rich.','Belgian dark chocolate ganache. Locally sourced cocoa batter. Espresso-soaked layers. Finished with hand-tempered chocolate shards and 24K edible gold dust.',id,185000,true,1
FROM categories WHERE slug='cakes' ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, label, price, stock_qty, is_default)
SELECT p.id,v.label,v.price,v.qty,v.is_def FROM products p
CROSS JOIN (VALUES ('6-inch',185000::numeric,10,true),('8-inch',265000::numeric,8,false),('10-inch',360000::numeric,5,false)) AS v(label,price,qty,is_def)
WHERE p.slug='the-kampala-classic';

INSERT INTO product_images (product_id, url, alt_text, sort_order)
SELECT id,'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80','The Kampala Classic Triple Chocolate Cake',0
FROM products WHERE slug='the-kampala-classic';

INSERT INTO product_items (product_id, label, sort_order)
SELECT p.id,v.label,v.ord FROM products p
CROSS JOIN (VALUES ('3 layers of Belgian chocolate sponge',1),('Dark chocolate ganache between every layer',2),('Hand-tempered chocolate shards topping',3),('24K edible gold dust finish',4)) AS v(label,ord)
WHERE p.slug='the-kampala-classic';

-- PRODUCT 2: Garden City Dream
INSERT INTO products (slug, name, subtitle, description, tasting_notes, category_id, base_price, is_featured, sort_order)
SELECT 'garden-city-dream','Garden City Dream','(Passion Fruit Cheesecake)','Ugandan passion fruit at its most indulgent. A butter-biscuit base topped with the smoothest cream cheese filling we could engineer.','Ugandan passion fruit curd, bright and acidic. Full-fat cream cheese whipped to cloud consistency. Brown butter biscuit base.',id,145000,true,2
FROM categories WHERE slug='cakes' ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, label, price, stock_qty, is_default)
SELECT p.id,v.label,v.price,v.qty,v.is_def FROM products p
CROSS JOIN (VALUES ('6-inch',145000::numeric,8,true),('8-inch',210000::numeric,6,false)) AS v(label,price,qty,is_def)
WHERE p.slug='garden-city-dream';

INSERT INTO product_images (product_id, url, alt_text, sort_order)
SELECT id,'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80','Garden City Dream Passion Fruit Cheesecake',0
FROM products WHERE slug='garden-city-dream';

INSERT INTO product_items (product_id, label, sort_order)
SELECT p.id,v.label,v.ord FROM products p
CROSS JOIN (VALUES ('Ugandan passion fruit curd topping',1),('New York-style cream cheese filling',2),('Brown butter biscuit crust',3)) AS v(label,ord)
WHERE p.slug='garden-city-dream';

-- PRODUCT 3: The Entebbe Fold
INSERT INTO products (slug, name, subtitle, description, tasting_notes, category_id, base_price, is_featured, sort_order)
SELECT 'the-entebbe-fold','The Entebbe Fold','(Laminated Butter Croissant)','Seventy-two hours of lamination. One hundred and forty four layers. This is what a croissant is supposed to taste like before the world got lazy.','European-style butter kept cold until the last second. Honey from Murchison Falls in the dough. Shatters on first bite. Pillowy on the inside.',id,18000,false,3
FROM categories WHERE slug='pastries' ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, label, price, stock_qty, is_default)
SELECT p.id,v.label,v.price,v.qty,v.is_def FROM products p
CROSS JOIN (VALUES ('Single',18000::numeric,30,true),('Box of 4',65000::numeric,15,false),('Box of 8',120000::numeric,10,false)) AS v(label,price,qty,is_def)
WHERE p.slug='the-entebbe-fold';

INSERT INTO product_images (product_id, url, alt_text, sort_order)
SELECT id,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80','The Entebbe Fold Butter Croissant',0
FROM products WHERE slug='the-entebbe-fold';

-- PRODUCT 4: Pearl of Africa Box
INSERT INTO products (slug, name, subtitle, description, tasting_notes, category_id, base_price, is_featured, is_limited, sort_order)
SELECT 'the-pearl-of-africa-box','The Pearl of Africa Box','(Signature Gift Collection)','The ultimate HAIQ experience in a matte black box. A hand-curated selection of our most obsessed-over creations, individually wrapped in tissue and sealed with a wax stamp.','Kampala Classic mini. Garden City Dream slice. 4 Entebbe Fold croissants. 6 Signature cookies. Hand-written card. HAIQ branded tissue and wax seal.',id,350000,true,true,4
FROM categories WHERE slug='gift-boxes' ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, label, price, stock_qty, is_default)
SELECT p.id,v.label,v.price,v.qty,v.is_def FROM products p
CROSS JOIN (VALUES ('Standard Gift Box',350000::numeric,5,true),('Premium Gift Box',520000::numeric,3,false)) AS v(label,price,qty,is_def)
WHERE p.slug='the-pearl-of-africa-box';

INSERT INTO product_images (product_id, url, alt_text, sort_order)
SELECT id,'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80','The Pearl of Africa Gift Box',0
FROM products WHERE slug='the-pearl-of-africa-box';

INSERT INTO product_items (product_id, label, sort_order)
SELECT p.id,v.label,v.ord FROM products p
CROSS JOIN (VALUES ('Mini Kampala Classic (triple chocolate)',1),('Garden City Dream slice',2),('4 Entebbe Fold croissants',3),('6 Signature cookies',4),('Hand-written greeting card',5),('HAIQ wax-sealed tissue wrapping',6)) AS v(label,ord)
WHERE p.slug='the-pearl-of-africa-box';

-- PRODUCT 5: Lake Victoria Crunch
INSERT INTO products (slug, name, subtitle, description, tasting_notes, category_id, base_price, sort_order)
SELECT 'lake-victoria-crunch','Lake Victoria Crunch','(Salted Caramel and Macadamia)','The cookie that silenced every argument about what a cookie should be. Ugandan macadamia nuts, toasted until golden, buried in salted caramel and thick white chocolate.','Ugandan macadamia nuts dry-toasted in-house. Caramel made with Nile salt. Extra-thick white chocolate chunks. Caramelized butter base. Maldon sea salt finish.',id,15000,5
FROM categories WHERE slug='cookies' ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, label, price, stock_qty, is_default)
SELECT p.id,v.label,v.price,v.qty,v.is_def FROM products p
CROSS JOIN (VALUES ('Single Cookie',15000::numeric,50,true),('Box of 6',80000::numeric,20,false),('Box of 12',150000::numeric,15,false)) AS v(label,price,qty,is_def)
WHERE p.slug='lake-victoria-crunch';

INSERT INTO product_images (product_id, url, alt_text, sort_order)
SELECT id,'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80','Lake Victoria Crunch Salted Caramel Cookie',0
FROM products WHERE slug='lake-victoria-crunch';

-- PRODUCT 6: Mt. Elgon Sourdough
INSERT INTO products (slug, name, subtitle, description, tasting_notes, category_id, base_price, sort_order)
SELECT 'mt-elgon-sourdough','Mt. Elgon Sourdough','(Ancient Grain Sourdough)','Three-day cold fermentation. A starter we have been feeding since 2019. Ancient grains sourced from the slopes of Mt. Elgon. This is bread that remembers what bread is supposed to be.','Open crumb with irregular air pockets. Crust that shatters. Mild tang from 72-hour fermentation. Wheat and sorghum blend from eastern Uganda. No additives. No shortcuts.',id,35000,6
FROM categories WHERE slug='bread' ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, label, price, stock_qty, is_default)
SELECT p.id,v.label,v.price,v.qty,v.is_def FROM products p
CROSS JOIN (VALUES ('Small Loaf (500g)',35000::numeric,15,true),('Large Loaf (1kg)',60000::numeric,10,false)) AS v(label,price,qty,is_def)
WHERE p.slug='mt-elgon-sourdough';

INSERT INTO product_images (product_id, url, alt_text, sort_order)
SELECT id,'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&q=80','Mt. Elgon Sourdough Ancient Grain Bread',0
FROM products WHERE slug='mt-elgon-sourdough';
