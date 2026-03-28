import { db } from '../../config/database.js'
import { accounts } from '../schema/accounts.js'

export async function seedAccounts() {
  const data = [
    // ── ASSETS (1xxx) ──────────────────────────────────────────────────
    { code: '1000', name_ar: 'الأصول',               name_en: 'Assets',             type: 'asset',    level: 1, is_system: true  },
    { code: '1100', name_ar: 'الأصول المتداولة',     name_en: 'Current Assets',     type: 'asset',    level: 2, parent_code: '1000' },
    { code: '1101', name_ar: 'الصندوق — كاش',        name_en: 'Petty Cash',         type: 'asset',    level: 3, parent_code: '1100', is_system: true },
    { code: '1102', name_ar: 'صندوق المطعم',          name_en: 'Restaurant Cash',    type: 'asset',    level: 3, parent_code: '1100' },
    { code: '1103', name_ar: 'حساب مدخرات',           name_en: 'Savings Account',   type: 'asset',    level: 3, parent_code: '1100' },
    { code: '1104', name_ar: 'البنك',                 name_en: 'Bank',               type: 'asset',    level: 3, parent_code: '1100', is_system: true },
    { code: '1105', name_ar: 'ذمم مدينة — توصيل',    name_en: 'Delivery Receivable',type: 'asset',    level: 3, parent_code: '1100' },
    { code: '1106', name_ar: 'مخزون',                 name_en: 'Inventory',          type: 'asset',    level: 3, parent_code: '1100' },
    { code: '1110', name_ar: 'ضريبة قيمة مضافة مدخلات', name_en: 'VAT Input',      type: 'asset',    level: 3, parent_code: '1100', is_system: true },
    { code: '1200', name_ar: 'الأصول الثابتة',        name_en: 'Fixed Assets',       type: 'asset',    level: 2, parent_code: '1000' },
    { code: '1201', name_ar: 'معدات مطبخ',            name_en: 'Kitchen Equipment',  type: 'asset',    level: 3, parent_code: '1200' },
    { code: '1202', name_ar: 'أثاث',                  name_en: 'Furniture',          type: 'asset',    level: 3, parent_code: '1200' },
    { code: '1203', name_ar: 'نقطة بيع',              name_en: 'POS System',         type: 'asset',    level: 3, parent_code: '1200' },
    // ── LIABILITIES (2xxx) ─────────────────────────────────────────────
    { code: '2000', name_ar: 'الالتزامات',            name_en: 'Liabilities',        type: 'liability',level: 1, is_system: true },
    { code: '2100', name_ar: 'الالتزامات المتداولة',  name_en: 'Current Liabilities',type: 'liability',level: 2, parent_code: '2000' },
    { code: '2101', name_ar: 'ذمم دائنة — موردون',   name_en: 'Accounts Payable',   type: 'liability',level: 3, parent_code: '2100', is_system: true },
    { code: '2102', name_ar: 'ضريبة قيمة مضافة مخرجات',name_en: 'VAT Output',      type: 'liability',level: 3, parent_code: '2100', is_system: true },
    { code: '2103', name_ar: 'رواتب مستحقة',          name_en: 'Accrued Salaries',  type: 'liability',level: 3, parent_code: '2100' },
    { code: '2104', name_ar: 'إيجار مستحق',           name_en: 'Accrued Rent',       type: 'liability',level: 3, parent_code: '2100' },
    // ── EQUITY (3xxx) ──────────────────────────────────────────────────
    { code: '3000', name_ar: 'حقوق الملكية',          name_en: 'Equity',             type: 'equity',   level: 1, is_system: true },
    { code: '3101', name_ar: 'رأس المال',              name_en: 'Capital',            type: 'equity',   level: 2, parent_code: '3000' },
    { code: '3201', name_ar: 'الأرباح المحتجزة',      name_en: 'Retained Earnings',  type: 'equity',   level: 2, parent_code: '3000' },
    // ── REVENUE (4xxx) ─────────────────────────────────────────────────
    { code: '4000', name_ar: 'الإيرادات',             name_en: 'Revenue',            type: 'revenue',  level: 1, is_system: true },
    { code: '4100', name_ar: 'إيرادات التشغيل',       name_en: 'Operating Revenue',  type: 'revenue',  level: 2, parent_code: '4000' },
    { code: '410101',name_ar:'إيرادات التوصيل',       name_en: 'Delivery Revenue',   type: 'revenue',  level: 3, parent_code: '4100', is_system: true },
    { code: '410102',name_ar:'إيرادات المطعم',        name_en: 'Restaurant Revenue', type: 'revenue',  level: 3, parent_code: '4100', is_system: true },
    { code: '410103',name_ar:'إيرادات الاشتراكات',    name_en: 'Subscription Revenue',type:'revenue',  level: 3, parent_code: '4100', is_system: true },
    // ── EXPENSES (5xxx) ────────────────────────────────────────────────
    { code: '5000', name_ar: 'المصروفات',             name_en: 'Expenses',           type: 'expense',  level: 1, is_system: true },
    { code: '5100', name_ar: 'تكلفة البضاعة المباعة', name_en: 'COGS',               type: 'expense',  level: 2, parent_code: '5000' },
    { code: '510101',name_ar:'مشتريات مواد غذائية',   name_en: 'Food Purchases',     type: 'expense',  level: 3, parent_code: '5100', is_system: true },
    { code: '510102',name_ar:'مشتريات بلاستيكيات',    name_en: 'Plastic Purchases',  type: 'expense',  level: 3, parent_code: '5100', is_system: true },
    { code: '510103',name_ar:'مشتريات مشروبات',       name_en: 'Beverage Purchases', type: 'expense',  level: 3, parent_code: '5100', is_system: true },
    { code: '510104',name_ar:'مشتريات خضار',          name_en: 'Vegetable Purchases',type: 'expense',  level: 3, parent_code: '5100', is_system: true },
    { code: '510105',name_ar:'مشتريات خبز',           name_en: 'Bread Purchases',    type: 'expense',  level: 3, parent_code: '5100', is_system: true },
    { code: '5200', name_ar: 'مصاريف التشغيل',        name_en: 'Operating Expenses', type: 'expense',  level: 2, parent_code: '5000' },
    { code: '5201', name_ar: 'رواتب وأجور',           name_en: 'Salaries & Wages',   type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5202', name_ar: 'إيجار',                  name_en: 'Rent',               type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5203', name_ar: 'كهرباء وماء',           name_en: 'Utilities',          type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5204', name_ar: 'صيانة',                 name_en: 'Maintenance',        type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5205', name_ar: 'تسويق وإعلان',          name_en: 'Marketing',          type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5206', name_ar: 'نقل ومواصلات',          name_en: 'Transportation',     type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5207', name_ar: 'اتصالات وانترنت',       name_en: 'Communications',     type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5208', name_ar: 'مصاريف إدارية',         name_en: 'Admin Expenses',     type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5209', name_ar: 'مصاريف متنوعة',         name_en: 'Miscellaneous',      type: 'expense',  level: 3, parent_code: '5200' },
    { code: '5210', name_ar: 'تالف وهدر',             name_en: 'Waste & Spoilage',   type: 'expense',  level: 3, parent_code: '5200' },
  ] as any[]

  // Upsert — skip if already exists (idempotent seed)
  for (const row of data) {
    await db.insert(accounts).values(row).onConflictDoNothing()
  }
  console.log(`✅ Seeded ${data.length} accounts`)
}
