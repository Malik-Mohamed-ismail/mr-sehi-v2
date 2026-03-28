// ─── 02_suppliers.ts ────────────────────────────────────────────────────
import { db } from '../../config/database.js'
import { suppliers } from '../schema/suppliers.js'
import { users } from '../schema/users.js'
import bcrypt from 'bcrypt'

export async function seedSuppliers() {
  const data = [
    { name_ar: 'شركة الأغذية الوطنية', name_en: 'National Food Co.',    vat_number: '310123456700003', category: 'مواد غذائية', phone: '0112345678' },
    { name_ar: 'مصنع العبدالله للمياه', name_en: 'Al-Abdullah Water',   vat_number: '310987654300001', category: 'مياه',        phone: '0113456789' },
    { name_ar: 'مورد المشروبات السعودي',name_en: 'Saudi Beverages',      vat_number: '310456789000002', category: 'مشروبات',    phone: '0114567890' },
    { name_ar: 'العزيزية للخضار',       name_en: 'Al-Azizia Vegetables', vat_number: null,              category: 'خضار',        phone: '0555123456' },
    { name_ar: 'مخبز الفرن الذهبي',    name_en: 'Golden Oven Bakery',   vat_number: '310654321000004', category: 'خبز',         phone: '0556234567' },
    { name_ar: 'شركة التغليف الحديث',  name_en: 'Modern Packaging Co.', vat_number: '310321654000005', category: 'بلاستيكيات', phone: '0557345678' },
    { name_ar: 'معدات المطابخ المتطورة',name_en: 'Advanced Kitchen Eq.', vat_number: '310789012000006', category: 'معدات مطبخ', phone: '0558456789' },
  ]
  for (const row of data) {
    await db.insert(suppliers).values(row as any).onConflictDoNothing()
  }
  console.log(`✅ Seeded ${data.length} suppliers`)
}

export async function seedAdminUser() {
  const hash = await bcrypt.hash('Admin@123456', 12)
  await db.insert(users).values({
    username:      'admin',
    email:         'admin@mrsehi.sa',
    password_hash: hash,
    full_name:     'مدير النظام',
    role:          'admin',
    is_active:     true,
  } as any).onConflictDoNothing()
  console.log('✅ Default admin user seeded (admin@mrsehi.sa / Admin@123456)')
}
