import { db } from './src/config/database.js';
import { lookups } from './src/db/schema/lookups.js';

const products = [
  { name_ar: 'فاهيتا', name_en: 'Fajita' },
  { name_ar: 'باربكيو', name_en: 'BBQ' },
  { name_ar: 'مكسيكي', name_en: 'Mexican' },
  { name_ar: 'مندي', name_en: 'Mandi' },
  { name_ar: 'كلاسك شيت', name_en: 'Classic Cheat' },
  { name_ar: 'زبادي', name_en: 'Yogurt' },
  { name_ar: 'مشوي', name_en: 'Grilled' },
  { name_ar: 'شيش طاووق', name_en: 'Shish Tawook' },
  { name_ar: 'لحم مستر صحي', name_en: 'Mr. Healthy Meat' },
  { name_ar: 'سمك مندي', name_en: 'Mandi Fish' },
  { name_ar: 'سمك مستر صحي', name_en: 'Mr. Healthy Fish' },
  { name_ar: 'شاورما', name_en: 'Shawarma' },
  { name_ar: 'روبيان', name_en: 'Shrimp' },
  { name_ar: 'كورتيلا', name_en: 'Cortilla' },
  { name_ar: 'سمك كاتنون', name_en: 'Canton Fish' },
  { name_ar: 'ملوخية', name_en: 'Molokhia' },
  { name_ar: 'مستر صحي', name_en: 'Mr. Healthy' },
  { name_ar: 'ماشروم', name_en: 'Mushroom' },
  { name_ar: 'ماسالا', name_en: 'Masala' },
  { name_ar: 'كفتة', name_en: 'Kofta' },
  { name_ar: 'لحم استيك', name_en: 'Beef Steak' },
  { name_ar: 'بامية', name_en: 'Okra' },
  { name_ar: 'سمك روبيان', name_en: 'Fish & Shrimp' },
  { name_ar: 'ليمون', name_en: 'Lemon' },
  { name_ar: 'شوربة عدس', name_en: 'Lentil Soup' },
  { name_ar: 'شوربة شوفان', name_en: 'Oat Soup' },
  { name_ar: 'شوربة مستر صحي', name_en: 'Mr. Healthy Soup' },
  { name_ar: 'كزبرة', name_en: 'Coriander' },
  { name_ar: 'دجاج', name_en: 'Chicken' },
  { name_ar: 'كاري', name_en: 'Curry' },
];

async function main() {
  console.log('Inserting products...');
  for (const p of products) {
    try {
      await db.insert(lookups).values({
        type: 'product_name',
        name_ar: p.name_ar,
        name_en: p.name_en,
      });
    } catch (err: any) {
      if (err.code === '23505') {
        console.log(`Skipping duplicate: ${p.name_ar}`);
      } else {
        console.error(`Error inserting ${p.name_ar}:`, err);
      }
    }
  }
  console.log('Finished inserting products!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
