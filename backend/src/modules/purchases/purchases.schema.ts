import { z } from 'zod'

const BasePurchaseSchema = z.object({
  invoice_number: z.string().min(1).max(50),
  invoice_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'يجب أن يكون التاريخ بصيغة YYYY-MM-DD'),
  supplier_id:    z.string().min(1, 'يجب اختيار مورد'),
  category:       z.string().min(1, 'يجب اختيار التصنيف'),
  item_name:      z.string().min(1).max(200),
  quantity:       z.number().positive('الكمية يجب أن تكون أكبر من صفر').default(1),
  unit_price:     z.number().positive('السعر يجب أن يكون أكبر من صفر'),
  discount:       z.number().min(0).default(0),
  subtotal:       z.number().positive(),
  vat_amount:     z.number().min(0).default(0),
  total_amount:   z.number().positive(),
  payment_method: z.string().min(1, 'يجب اختيار طريقة الدفع'),
  is_asset:       z.boolean().default(false),
  notes:          z.string().max(500).optional(),
})

export const CreatePurchaseSchema = BasePurchaseSchema.refine(d => {
  const expected = parseFloat((d.quantity * d.unit_price - d.discount).toFixed(4))
  return Math.abs(expected - d.subtotal) < 0.01
}, { message: 'المجموع قبل الضريبة لا يتطابق مع الحساب', path: ['subtotal'] })

export const UpdatePurchaseSchema = BasePurchaseSchema.partial()

export const PurchaseQuerySchema = z.object({
  from:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to:             z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  supplier_id:    z.string().optional(),
  category:       z.string().optional(),
  payment_method: z.string().optional(),
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().min(1).max(100).default(25),
}).refine(d => {
  if (d.from && d.to) return new Date(d.from) <= new Date(d.to)
  return true
}, { message: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية' })

export type CreatePurchaseDto = z.infer<typeof CreatePurchaseSchema>
export type UpdatePurchaseDto = z.infer<typeof UpdatePurchaseSchema>
export type PurchaseQuery     = z.infer<typeof PurchaseQuerySchema>
