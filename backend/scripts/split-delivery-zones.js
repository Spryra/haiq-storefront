#!/usr/bin/env node
/**
 * Migration: Split grouped delivery zones into individual entries
 *
 * Run: node scripts/split-delivery-zones.js
 */

const { query } = require('../src/config/db');
const crypto = require('crypto');

const generateUUID = () => crypto.randomUUID();

async function splitDeliveryZones() {
  try {
    console.log('🔄 Splitting grouped delivery zones into individual entries...\n');

    // Get all active zones
    const { rows: zones } = await query(
      'SELECT id, name, price, sort_order FROM delivery_zones WHERE is_active = true ORDER BY sort_order'
    );

    console.log(`📋 Found ${zones.length} active zones:\n`);
    zones.forEach(z => console.log(`   ${z.name} — UGX ${z.price}`));

    // Define which zones have grouped names that need splitting
    const zonesWithGrouping = [
      {
        original: 'Muyenga / Bukasa / Kabalagala',
        individuals: ['Muyenga', 'Bukasa', 'Kabalagala'],
        price: 3000,
      },
      {
        original: 'Cgaba / Buziga / Munyonyo',
        individuals: ['Cgaba', 'Buziga', 'Munyonyo'],
        price: 4000,
      },
      {
        original: 'Makindye / Kibuve / Kansanga',
        individuals: ['Makindye', 'Kibuve', 'Kansanga'],
        price: 4000,
      },
      {
        original: 'Kampala CBD / City Centre',
        individuals: ['Kampala CBD', 'City Centre'],
        price: 5000,
      },
      {
        original: 'Kololo / Naguru / Ntinda',
        individuals: ['Kololo', 'Naguru', 'Ntinda'],
        price: 5000,
      },
      {
        original: 'Nakawa / Bugoobi / Luzira',
        individuals: ['Nakawa', 'Bugoobi', 'Luzira'],
        price: 5000,
      },
      {
        original: 'Naalya / Kyaliwajjala / Kira',
        individuals: ['Naalya', 'Kyaliwajjala', 'Kira'],
        price: 8000,
      },
      {
        original: 'Namugongo / Kiwatule / Kireka',
        individuals: ['Namugongo', 'Kiwatule', 'Kireka'],
        price: 8000,
      },
      {
        original: 'Wakiso / Gayaza / Matugga',
        individuals: ['Wakiso', 'Gayaza', 'Matugga'],
        price: 10000,
      },
      {
        original: 'Entebbe / Entebbe Road',
        individuals: ['Entebbe', 'Entebbe Road'],
        price: 12000,
      },
      {
        original: 'Outside Kampala (flat rate)',
        individuals: ['Outside Kampala'],
        price: 15000,
      },
    ];

    let sortOrder = 1;
    let createdCount = 0;
    let deactivatedCount = 0;

    // For each grouped zone mapping
    for (const grouping of zonesWithGrouping) {
      // Find the original grouped zone
      const original = zones.find(z => z.name === grouping.original);

      if (original) {
        console.log(`\n📍 Processing: "${original.name}" (price: UGX ${original.price})`);

        // Create individual entries
        for (const individualName of grouping.individuals) {
          // Check if already exists
          const { rows: existing } = await query(
            'SELECT id FROM delivery_zones WHERE LOWER(name) = LOWER($1)',
            [individualName]
          );

          if (existing.length === 0) {
            // Create new individual zone
            const id = generateUUID();
            await query(`
              INSERT INTO delivery_zones (id, name, price, sort_order, is_active, created_at)
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              id,
              individualName,
              original.price,
              sortOrder++,
              true,
              new Date().toISOString(),
            ]);
            console.log(`   ✅ Created: "${individualName}" (UGX ${original.price})`);
            createdCount++;
          } else {
            console.log(`   ℹ️  Already exists: "${individualName}"`);
          }
        }

        // Deactivate the original grouped zone
        await query(
          'UPDATE delivery_zones SET is_active = false WHERE id = $1',
          [original.id]
        );
        console.log(`   🔴 Deactivated grouped zone: "${original.name}"`);
        deactivatedCount++;
      } else {
        console.log(`\n⚠️  Zone not found: "${grouping.original}"`);
      }
    }

    console.log(`\n✨ Split complete!`);
    console.log(`   Created: ${createdCount} new individual zones`);
    console.log(`   Deactivated: ${deactivatedCount} grouped zones\n`);

    // Show final state
    const { rows: finalZones } = await query(
      'SELECT name, price, is_active FROM delivery_zones ORDER BY sort_order'
    );
    console.log('📋 Final delivery zones (active only):');
    finalZones
      .filter(z => z.is_active)
      .forEach(z => console.log(`   ✓ ${z.name} — UGX ${z.price}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Split failed:', err.message);
    process.exit(1);
  }
}

splitDeliveryZones();
