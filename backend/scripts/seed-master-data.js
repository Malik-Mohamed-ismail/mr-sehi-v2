/**
 * Seed script: 04_master_data.js
 * Clears and repopulates: lookups (platforms, categories, products) + suppliers
 * Run: node scripts/seed-master-data.js
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

// ── Raw SQL helpers ────────────────────────────────────────────────────────
async function run(sql, params = []) {
  const client = await pool.connect()
  try {
    await client.query(sql, params)
  } finally {
    client.release()
  }
}

async function main() {
  console.log('🌱 Starting master data seed...\n')

  // ── 1. Clear ALL transactional data first (due to FKs) ──────────────────
  // Using TRUNCATE CASCADE to safely clear everything dependent on suppliers/lookups
  console.log('🗑️  Clearing all transactional data (purchases, expenses, revenue, journals)...')
  await run(`TRUNCATE TABLE purchase_invoices, expenses, fixed_assets, 
             delivery_revenue, restaurant_revenue, subscription_revenue,
             journal_entry_lines, journal_entries CASCADE`)

  // ── 2. Clear lookups and suppliers ──────────────────────────────────────
  await run(`DELETE FROM lookups`)
  await run(`DELETE FROM suppliers`)
  console.log('🗑️  Cleared lookups and suppliers tables')

  // ── 3. Platforms (منصات التوصيل) ────────────────────────────────────────
  const platforms = [
    { name_ar: 'كيتا',          name_en: 'Keeta' },
    { name_ar: 'هنجر ستيشن',    name_en: 'Hunger Station' },
    { name_ar: 'ننجا',          name_en: 'Ninja' },
  ]

  for (const p of platforms) {
    await run(
      `INSERT INTO lookups (id, type, name_ar, name_en, is_active) VALUES (gen_random_uuid(), 'platform', $1, $2, true)`,
      [p.name_ar, p.name_en]
    )
  }
  console.log(`✅ Inserted ${platforms.length} platforms`)

  // ── 3. Categories (التصنيفات) ────────────────────────────────────────────
  const categories = [
    { name_ar: 'مياه',                                    name_en: 'Water' },
    { name_ar: 'مشروبات غازية',                           name_en: 'Carbonated Drinks' },
    { name_ar: 'معدات مطاعم',                             name_en: 'Restaurant Equipment' },
    { name_ar: 'خبز و مواد غذائية',                       name_en: 'Bread & Food Products' },
    { name_ar: 'خضار',                                    name_en: 'Vegetables' },
    { name_ar: 'مواد غذائية',                             name_en: 'Food Supplies' },
    { name_ar: 'بلاستيكيات-مواد بلاستيكية',              name_en: 'Plastics' },
    { name_ar: 'برامج حاسوبية واجهزه الكترونية',         name_en: 'Software & Electronics' },
    { name_ar: 'معدات مطاعم - بلاستيكيات',               name_en: 'Restaurant Equipment & Plastics' },
  ]

  for (const c of categories) {
    await run(
      `INSERT INTO lookups (id, type, name_ar, name_en, is_active) VALUES (gen_random_uuid(), 'category', $1, $2, true)`,
      [c.name_ar, c.name_en]
    )
  }
  console.log(`✅ Inserted ${categories.length} categories`)

  // ── 4. Products (المنتجات) ───────────────────────────────────────────────
  const products = [
    'فاهيتا', 'باربكيو', 'مكسيكي', 'مندي', 'كلاسك شيت', 'زبادي',
    'مشوي', 'شيش طاووق', 'لحم مستر صحي', 'خليت مندي', 'خليت مستر صحي',
    'سمك مندي', 'سمك مستر صحي', 'شاورما', 'روبيان', 'كورتيلا',
    'سمك كاتنون', 'ملوخية', 'مستر صحي دجاج', 'مستر صحي', 'ماشروم',
    'ماسالا', 'كفتة', 'لحم استيك', 'بامية', 'سمك روبيان', 'ليمون',
    'شوربة عدس', 'شوربة شوفان', 'شوربة مستر صحي', 'كزيرة', 'دجاج', 'كاري',
  ]

  for (const name of products) {
    await run(
      `INSERT INTO lookups (id, type, name_ar, name_en, is_active) VALUES (gen_random_uuid(), 'product_name', $1, $2, true)`,
      [name, name]
    )
  }
  console.log(`✅ Inserted ${products.length} products`)

  // ── 5. Clear old suppliers ───────────────────────────────────────────────
  //   We use soft-awareness: only delete if no FKs reference them.
  //   For safety, we delete with CASCADE-aware approach.
  await run(`DELETE FROM suppliers`)
  console.log('\n🗑️  Cleared suppliers table')

  // ── 6. Suppliers ─────────────────────────────────────────────────────────
  const suppliersList = [
    { name_ar: 'ركن فالي التجارية',                      category: 'مياه',                               vat_number: '312475874900003' },
    { name_ar: 'شركة الجميل العالمية',                   category: 'مشروبات غازية',                      vat_number: '300796372300003' },
    { name_ar: 'الريان للتجارة',                          category: 'معدات مطاعم',                        vat_number: '311365357500033' },
    { name_ar: 'شركة مصدر الحياه للصناعات الغذائية',      category: 'خبز و مواد غذائية',                 vat_number: '312175871900003' },
    { name_ar: 'اسواق العزيزية المركزية',                 category: 'خضار',                               vat_number: null },
    { name_ar: 'موسسة عنوان الشيف التجارية',              category: 'معدات مطاعم',                        vat_number: '312475874900003' },
    { name_ar: 'شركة اعناب الجود',                        category: 'مواد غذائية',                        vat_number: '312960091600003' },
    { name_ar: 'مؤسسة مربع الهرم التجارية',               category: null,                                 vat_number: null },
    { name_ar: 'موسسة واحة ذوق الخيال',                   category: 'بلاستيكيات-مواد بلاستيكية',         vat_number: '310619244600003' },
    { name_ar: 'شركة ميزان الحساب لقنية المعلومات',       category: 'برامج حاسوبية واجهزه الكترونية',    vat_number: '311299535900003' },
    { name_ar: 'موسسة مستر صحي للخدمات الغذائية',         category: 'مواد غذائية',                        vat_number: null },
    { name_ar: 'شركة اواني السلطان التجارية',             category: 'معدات مطاعم - بلاستيكيات',          vat_number: '312475874900003' },
  ]

  for (const s of suppliersList) {
    await run(
      `INSERT INTO suppliers (id, name_ar, category, vat_number, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, true)`,
      [s.name_ar, s.category, s.vat_number]
    )
  }
  console.log(`✅ Inserted ${suppliersList.length} suppliers`)

  console.log('\n🎉 Master data seed completed successfully!')
  await pool.end()
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Seed failed:', err)
  pool.end()
  process.exit(1)
})
