// Run: node rename-product.js
// Renames "The Unboxing" to "Box Office" in the database
const { query, pool } = require('./src/config/db')

;(async () => {
  try {
    const { rowCount } = await query(
      `UPDATE products
       SET name     = 'Box Office',
           subtitle = 'Build Your Box',
           slug     = 'box-office'
       WHERE slug IN ('the-unboxing', 'box-office')`,
    )
    console.log(`Updated ${rowCount} product(s).`)

    // Verify
    const { rows } = await query("SELECT name, slug, subtitle FROM products WHERE slug = 'box-office'")
    console.log('Result:', rows[0])
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await pool.end()
  }
})()
