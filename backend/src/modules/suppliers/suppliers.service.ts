import { eq, ilike, and, desc, sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { suppliers } from '../../db/schema/suppliers.js'
import { purchaseInvoices } from '../../db/schema/purchases.js'
import { AppError } from '../../utils/AppError.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import type { CreateSupplierDto, UpdateSupplierDto, SupplierQuery } from './suppliers.schema.js'

export async function listSuppliers(query: SupplierQuery) {
  const conditions: any[] = []
  if (query.search)    conditions.push(ilike(suppliers.name_ar, `%${query.search}%`))
  if (query.category)  conditions.push(eq(suppliers.category, query.category))
  if (query.is_active !== undefined) conditions.push(eq(suppliers.is_active, query.is_active))

  const offset = (query.page - 1) * query.limit
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(suppliers)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(suppliers.created_at))
      .limit(query.limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(suppliers)
      .where(conditions.length ? and(...conditions) : undefined),
  ])
  return { data: rows, total: count, page: query.page, limit: query.limit }
}

export async function getSupplier(id: string) {
  const [row] = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (!row) throw new AppError('NOT_FOUND', 404)
  return row
}

export async function createSupplier(dto: CreateSupplierDto, userId: string) {
  const [row] = await db.transaction(async (tx) => {
    const [supplier] = await tx.insert(suppliers).values({
      ...dto, created_by: userId,
    }).returning()
    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'suppliers', recordId: supplier.id, newValues: supplier })
    return [supplier]
  })
  return row
}

export async function updateSupplier(id: string, dto: UpdateSupplierDto, userId: string) {
  const old = await getSupplier(id)
  const [row] = await db.transaction(async (tx) => {
    const [updated] = await tx.update(suppliers)
      .set({ ...dto, updated_at: new Date() } as any)
      .where(eq(suppliers.id, id))
      .returning()
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'suppliers', recordId: id, oldValues: old, newValues: updated })
    return [updated]
  })
  return row
}

export async function deactivateSupplier(id: string, userId: string) {
  const old = await getSupplier(id)
  const [row] = await db.transaction(async (tx) => {
    const [updated] = await tx.update(suppliers)
      .set({ is_active: false, updated_at: new Date() } as any)
      .where(eq(suppliers.id, id))
      .returning()
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'suppliers', recordId: id, oldValues: old, newValues: updated })
    return [updated]
  })
  return row
}

export async function deleteSupplier(id: string, userId: string) {
  const old = await getSupplier(id)

  const [activeInvoice] = await db.select().from(purchaseInvoices)
    .where(and(eq(purchaseInvoices.supplier_id, id), eq(purchaseInvoices.is_deleted, false)))
    .limit(1)
    
  if (activeInvoice) {
    throw new AppError('VALIDATION_ERROR', 400, 'لا يمكن حذف مورد لديه فواتير مرتبطة. يمكنك تعطيله بدلاً من ذلك.')
  }

  const [row] = await db.transaction(async (tx) => {
    // Purge soft-deleted invoices to satisfy the foreign key constraint
    await tx.delete(purchaseInvoices).where(eq(purchaseInvoices.supplier_id, id))
    
    const [deleted] = await tx.delete(suppliers)
      .where(eq(suppliers.id, id)).returning()
    await writeAuditLog(tx, { userId, action: 'DELETE', tableName: 'suppliers', recordId: id, oldValues: old })
    return [deleted]
  })
  return row
}

export async function getSupplierLedger(id: string, from?: string, to?: string) {
  await getSupplier(id) // 404 check
  const conditions: any[] = [eq(purchaseInvoices.supplier_id, id), eq(purchaseInvoices.is_deleted, false)]
  if (from) conditions.push(sql`${purchaseInvoices.invoice_date} >= ${from}`)
  if (to)   conditions.push(sql`${purchaseInvoices.invoice_date} <= ${to}`)

  const invoices = await db.select().from(purchaseInvoices)
    .where(and(...conditions))
    .orderBy(desc(purchaseInvoices.invoice_date))

  const totals = invoices.reduce(
    (acc, inv) => ({
      subtotal:     acc.subtotal     + Number(inv.subtotal),
      vat_amount:   acc.vat_amount   + Number(inv.vat_amount),
      total_amount: acc.total_amount + Number(inv.total_amount),
    }),
    { subtotal: 0, vat_amount: 0, total_amount: 0 }
  )

  const outstanding = invoices
    .filter(i => i.payment_method === 'آجل')
    .reduce((s, i) => s + Number(i.total_amount), 0)

  return { invoices, totals, outstanding_balance: outstanding }
}
