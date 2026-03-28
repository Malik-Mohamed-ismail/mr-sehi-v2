import pg from 'pg';
import { config } from 'dotenv';

config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  
  const lookups = [
    // Platforms (إدارة منصات التوصيل)
    { type: 'platform', name_en: 'HungerStation', name_ar: 'هنقرستيشن' },
    { type: 'platform', name_en: 'Jahez', name_ar: 'جاهز' },
    { type: 'platform', name_en: 'Ninja', name_ar: 'نينجا' },
    { type: 'platform', name_en: 'ToYou', name_ar: 'تويو' },
    { type: 'platform', name_en: 'The Chefz', name_ar: 'ذا شفز' },
    { type: 'platform', name_en: 'Mrsool', name_ar: 'مرسول' },
    
    // Payment Methods (إدارة طرق الدفع)
    { type: 'payment_method', name_en: 'Cash', name_ar: 'كاش' },
    { type: 'payment_method', name_en: 'Mada', name_ar: 'مدى' },
    { type: 'payment_method', name_en: 'Visa', name_ar: 'فيزا' },
    { type: 'payment_method', name_en: 'MasterCard', name_ar: 'ماستركارد' },
    { type: 'payment_method', name_en: 'Apple Pay', name_ar: 'أبل باي' },
    { type: 'payment_method', name_en: 'STC Pay', name_ar: 'اس تي سي باي' },
    
    // Categories (إدارة التصنيفات)
    { type: 'category', name_en: 'Main Courses', name_ar: 'أطباق رئيسية' },
    { type: 'category', name_en: 'Appetizers', name_ar: 'مقبلات' },
    { type: 'category', name_en: 'Desserts', name_ar: 'حلويات' },
    { type: 'category', name_en: 'Beverages', name_ar: 'مشروبات' },
    { type: 'category', name_en: 'Healthy Meals', name_ar: 'وجبات صحية' },
    
    // Products (إدارة المنتجات)
    { type: 'product_name', name_en: 'Healthy Chicken Breast', name_ar: 'صدر دجاج صحي' },
    { type: 'product_name', name_en: 'Grilled Salmon', name_ar: 'سلمون مشوي' },
    { type: 'product_name', name_en: 'Quinoa Salad', name_ar: 'سلطة كينوا' },
    { type: 'product_name', name_en: 'Fresh Orange Juice', name_ar: 'عصير برتقال طازج' },
    { type: 'product_name', name_en: 'Protein Diet Plate', name_ar: 'صحن دايت بروتين' }
  ];

  for(const l of lookups) {
     await client.query("INSERT INTO lookups (type, name_en, name_ar) VALUES ($1, $2, $3)", [l.type, l.name_en, l.name_ar]);
  }

  console.log("✅ Dummy data inserted successfully into 'lookups' table!");
  await client.end();
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
