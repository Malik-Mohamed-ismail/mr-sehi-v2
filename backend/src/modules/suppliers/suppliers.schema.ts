// ═══════════════════════════════════════════════
// suppliers.schema.ts
// ═══════════════════════════════════════════════
import { z } from 'zod'

export const CreateSupplierSchema = z.object({
  name_ar:    z.string().min(1).max(150),
  name_en:    z.string().max(150).optional(),
  vat_number: z.string().max(30).optional().nullable(),
  phone:      z.string().max(20).optional(),
  email:      z.string().email().optional().nullable(),
  category:   z.string().max(50).optional(),
  notes:      z.string().max(500).optional(),
})

export const UpdateSupplierSchema = CreateSupplierSchema.partial()

export const SupplierQuerySchema = z.object({
  search:    z.string().optional(),
  category:  z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(25),
})

export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>
export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>
export type SupplierQuery     = z.infer<typeof SupplierQuerySchema>
