// products.sql.js – query functions for products
const { pool } = require('../config/db');

const getAllProducts = async (filters = {}) => {
  const { category, limit = 12, offset = 0 } = filters;
  let query = 
    SELECT p.*, json_agg(DISTINCT jsonb_build_object('id', v.id, 'label', v.label, 'price', v.price)) as variants,
           json_agg(DISTINCT jsonb_build_object('url', i.url, 'alt_text', i.alt_text, 'sort_order', i.sort_order)) as images
    FROM products p
    LEFT JOIN product_variants v ON p.id = v.product_id
    LEFT JOIN product_images i ON p.id = i.product_id
    WHERE p.is_active = true
  ;
  const params = [];
  if (category) {
    params.push(category);
    query +=  AND p.category_id = cls{params.length};
  }
  query +=  GROUP BY p.id ORDER BY p.sort_order ASC LIMIT cls{params.length+1} OFFSET cls{params.length+2};
  params.push(limit, offset);
  const result = await pool.query(query, params);
  return result.rows;
};

const getProductBySlug = async (slug) => {
  const query = 
    SELECT p.*,
           json_agg(DISTINCT jsonb_build_object('id', v.id, 'label', v.label, 'price', v.price, 'sku', v.sku)) as variants,
           json_agg(DISTINCT jsonb_build_object('url', i.url, 'alt_text', i.alt_text, 'sort_order', i.sort_order) ORDER BY i.sort_order) as images,
           json_agg(DISTINCT jsonb_build_object('label', it.label, 'sort_order', it.sort_order) ORDER BY it.sort_order) as items
    FROM products p
    LEFT JOIN product_variants v ON p.id = v.product_id
    LEFT JOIN product_images i ON p.id = i.product_id
    LEFT JOIN product_items it ON p.id = it.product_id
    WHERE p.slug =  AND p.is_active = true
    GROUP BY p.id
  ;
  const result = await pool.query(query, [slug]);
  return result.rows[0];
};

module.exports = { getAllProducts, getProductBySlug };
