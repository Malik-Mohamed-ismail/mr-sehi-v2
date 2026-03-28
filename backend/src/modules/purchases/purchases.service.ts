import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { purchaseInvoices } from '../../db/schema/purchases.js'
import { suppliers } from '../../db/schema/suppliers.js'
import { journalEntries } from '../../db/schema/journal.js'
import { calculateVAT, supplierHasVAT, validateVATMatch } from '../../utils/vat.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import { AppError } from '../../utils/AppError.js'
import { createPurchaseJournalEntry } from './purchases.accounting.js'
import { generateEntryNumber } from '../../utils/entryNumberGenerator.js'
import { journalEntryLines } from '../../db/schema/journal.js'
import type { CreatePurchaseDto, PurchaseQuery } from './purchases.schema.js'

export async function createPurchaseInvoice(dto: CreatePurchaseDto, userId: string) {
  return db.transaction(async (tx) => {
    // 1. Resolve supplier + VAT status
    const [supplier] = await tx.select().from(suppliers).where(eq(suppliers.id, dto.supplier_id))
    if (!supplier) throw new AppError('NOT_FOUND', 404, 'المورد غير موجود')

    const vat = calculateVAT(dto.subtotal, supplierHasVAT(supplier.vat_number))

    // 2. Validate submitted amounts match server-computed values
    if (!validateVATMatch(vat.vatAmount, dto.vat_amount)) {
      throw new AppError('VALIDATION_ERROR', 400, 'مبلغ الضريبة لا يتطابق مع الحساب')
    }

    // 3. Insert invoice with pre-computed amounts (no GENERATED columns)
    const [invoice] = await tx.insert(purchaseInvoices).values({
      invoice_number: dto.invoice_number,
      invoice_date:   dto.invoice_date,
      supplier_id:    dto.supplier_id,
      category:       dto.category,
      item_name:      dto.item_name,
      quantity:       String(dto.quantity),
      unit_price:     String(dto.unit_price),
      discount:       String(dto.discount),
      subtotal:       String(vat.subtotal),
      vat_amount:     String(vat.vatAmount),
      total_amount:   String(vat.total),
      payment_method: dto.payment_method,
      is_asset:       dto.is_asset,
      notes:          dto.notes,
      created_by:     userId,
    } as any).returning()

    // 4. Auto-generate balanced journal entry
    const entry = await createPurchaseJournalEntry(tx, invoice, supplier, userId)

    // 5. Link journal entry back to invoice
    await tx.update(purchaseInvoices)
      .set({ journal_entry_id: entry.id } as any)
      .where(eq(purchaseInvoices.id, invoice.id))

    // 6. Audit trail
    await writeAuditLog(tx, {
      userId, action: 'CREATE', tableName: 'purchase_invoices',
      recordId: invoice.id, newValues: invoice,
    })

    return { ...invoice, journal_entry_id: entry.id }
  })
}

export async function listPurchases(query: PurchaseQuery) {
  const conditions: any[] = [eq(purchaseInvoices.is_deleted, false)]
  if (query.from)           conditions.push(sql`${purchaseInvoices.invoice_date} >= ${query.from}`)
  if (query.to)             conditions.push(sql`${purchaseInvoices.invoice_date} <= ${query.to}`)
  if (query.supplier_id)    conditions.push(eq(purchaseInvoices.supplier_id, query.supplier_id))
  if (query.category)       conditions.push(eq(purchaseInvoices.category as any, query.category))
  if (query.payment_method) conditions.push(eq(purchaseInvoices.payment_method as any, query.payment_method))

  const offset = (query.page - 1) * query.limit
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(purchaseInvoices)
      .where(and(...conditions))
      .orderBy(desc(purchaseInvoices.invoice_date))
      .limit(query.limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(purchaseInvoices).where(and(...conditions)),
  ])
  return { data: rows, total: count, page: query.page, limit: query.limit, totalPages: Math.ceil(count / query.limit) }
}

export async function updatePurchaseInvoice(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const invoice = await getPurchase(id)

    // 1. Resolve supplier + VAT status (supplier might have changed)
    const [supplier] = await tx.select().from(suppliers).where(eq(suppliers.id, dto.supplier_id))
    if (!supplier) throw new AppError('NOT_FOUND', 404, 'المورد غير موجود')

    const vat = calculateVAT(dto.subtotal, supplierHasVAT(supplier.vat_number))

    // 2. Validate submitted amounts
    if (!validateVATMatch(vat.vatAmount, dto.vat_amount)) {
      throw new AppError('VALIDATION_ERROR', 400, 'مبلغ الضريبة لا يتطابق مع الحساب')
    }

    // 3. Update invoice
    const [updated] = await tx.update(purchaseInvoices).set({
      invoice_number: dto.invoice_number,
      invoice_date:   dto.invoice_date,
      supplier_id:    dto.supplier_id,
      category:       dto.category,
      item_name:      dto.item_name,
      quantity:       String(dto.quantity),
      unit_price:     String(dto.unit_price),
      discount:       String(dto.discount),
      subtotal:       String(vat.subtotal),
      vat_amount:     String(vat.vatAmount),
      total_amount:   String(vat.total),
      payment_method: dto.payment_method,
      is_asset:       dto.is_asset,
      notes:          dto.notes,
      updated_at:     new Date(),
    } as any).where(eq(purchaseInvoices.id, id)).returning()

    // 4. Sync Journal Entry
    if (invoice.journal_entry_id) {
      // Re-create the journal entry lines using the existing helper function logic
      // We need to re-import or redefine the journal lines array format here
      await tx.update(journalEntries).set({
        expense_date: dto.invoice_date,
        description: `شراء من مورد: ${supplier.name_ar} — ${dto.item_name}`,
      } as any).where(eq(journalEntries.id, invoice.journal_entry_id))

      await tx.delete(journalEntryLines).where(eq(journalEntryLines.entry_id, invoice.journal_entry_id))

      // Re-insert lines
      const assetCode = dto.is_asset ? '1201' : '5101' // Assets or Cost of Goods
      const lines: any[] = [
        { entry_id: invoice.journal_entry_id, account_code: assetCode, debit_amount: vat.subtotal, credit_amount: 0 }
      ]
      if (vat.vatAmount > 0) {
        lines.push({ entry_id: invoice.journal_entry_id, account_code: '1110', debit_amount: vat.vatAmount, credit_amount: 0 })
      }
      const PAYMENT_ACCOUNTS: Record<string, string> = { 'كاش': '1101', 'بنك': '1104', 'آجل': '2101' }
      const creditCode = PAYMENT_ACCOUNTS[dto.payment_method] || '1101'
      
      if (dto.payment_method === 'آجل') {
        lines.push({ entry_id: invoice.journal_entry_id, account_code: creditCode, debit_amount: 0, credit_amount: vat.total, entity_id: supplier.id, entity_type: 'supplier' })
      } else {
        lines.push({ entry_id: invoice.journal_entry_id, account_code: creditCode, debit_amount: 0, credit_amount: vat.total })
      }

      await tx.insert(journalEntryLines).values(lines)
    }

    await writeAuditLog(tx, {
      userId, action: 'UPDATE', tableName: 'purchase_invoices',
      recordId: id, oldValues: invoice, newValues: updated,
    })

    return updated
  })
}

export async function getPurchase(id: string) {
  const [row] = await db.select().from(purchaseInvoices)
    .where(and(eq(purchaseInvoices.id, id), eq(purchaseInvoices.is_deleted, false)))
  if (!row) throw new AppError('NOT_FOUND', 404)
  return row
}

export async function deletePurchase(id: string, userId: string) {
  const invoice = await getPurchase(id)

  await db.transaction(async (tx) => {
    // Soft delete
    await tx.update(purchaseInvoices)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where(eq(purchaseInvoices.id, id))

    // Create journal reversal if entry exists
    if (invoice.journal_entry_id) {
      const [originalEntry] = await tx.select().from(journalEntries)
        .where(eq(journalEntries.id, invoice.journal_entry_id))

      if (originalEntry && !originalEntry.is_reversed) {
        const originalLines = await tx.select().from(journalEntryLines)
          .where(eq(journalEntryLines.entry_id, originalEntry.id))

        const reversalNumber = await generateEntryNumber(tx, 'REV')
        const [reversal] = await tx.insert(journalEntries).values({
          entry_number: reversalNumber,
          entry_date:   new Date().toISOString().split('T')[0],
          description:  `عكس قيد: ${originalEntry.entry_number} — حذف فاتورة شراء`,
          reference:    originalEntry.entry_number,
          source_type:  'reversal',
          source_id:    originalEntry.id,
          is_balanced:  true,
          created_by:   userId,
        } as any).returning()

        // Swap debit ↔ credit
        await tx.insert(journalEntryLines).values(
          originalLines.map(l => ({
            entry_id:     reversal.id,
            account_code: l.account_code,
            debit_amount: l.credit_amount,
            credit_amount:l.debit_amount,
            description:  `عكس: ${l.description ?? ''}`,
          }))
        )

        // Mark original as reversed
        await tx.update(journalEntries)
          .set({ is_reversed: true, reversed_by: reversal.id } as any)
          .where(eq(journalEntries.id, originalEntry.id))
      }
    }

    await writeAuditLog(tx, {
      userId, action: 'DELETE', tableName: 'purchase_invoices',
      recordId: id, oldValues: invoice,
    })
  })
}

export async function getVATReport(from?: string, to?: string) {
  const conditions: any[] = [eq(purchaseInvoices.is_deleted, false)]
  if (from) conditions.push(sql`${purchaseInvoices.invoice_date} >= ${from}`)
  if (to)   conditions.push(sql`${purchaseInvoices.invoice_date} <= ${to}`)

  const rows = await db.select({
    supplier_id:   purchaseInvoices.supplier_id,
    supplier_name: suppliers.name_ar,
    total_subtotal:  sql<number>`sum(${purchaseInvoices.subtotal})::numeric`,
    total_vat:       sql<number>`sum(${purchaseInvoices.vat_amount})::numeric`,
    total_amount:    sql<number>`sum(${purchaseInvoices.total_amount})::numeric`,
    invoice_count:   sql<number>`count(*)::int`,
  })
  .from(purchaseInvoices)
  .leftJoin(suppliers, eq(purchaseInvoices.supplier_id, suppliers.id))
  .where(and(...conditions))
  .groupBy(purchaseInvoices.supplier_id, suppliers.name_ar)
  .orderBy(desc(sql`sum(${purchaseInvoices.total_amount})`))

  return rows
}
