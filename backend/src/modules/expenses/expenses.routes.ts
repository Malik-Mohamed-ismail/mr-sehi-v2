import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { expenses } from '../../db/schema/expenses.js'
import { journalEntries, journalEntryLines } from '../../db/schema/journal.js'
import { generateEntryNumber } from '../../utils/entryNumberGenerator.js'
import { validateJournalBalance } from '../../utils/accounting.js'
import { calculateVAT } from '../../utils/vat.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import { AppError } from '../../utils/AppError.js'

async function createExpenseJournalEntry(tx: any, invoice: any, userId: string) {
  const lines: any[] = [
    { account_code: invoice.account_code, debit_amount: Number(invoice.amount), credit_amount: 0 },
  ]
  if (Number(invoice.vat_amount) > 0) {
    lines.push({ account_code: '1110', debit_amount: Number(invoice.vat_amount), credit_amount: 0 })
  }
  const PAYMENT_ACCOUNTS: Record<string, string> = { 'كاش': '1101', 'بنك': '1104', 'آجل': '2101' }
  const creditCode = PAYMENT_ACCOUNTS[invoice.payment_method]
  lines.push({ account_code: creditCode, debit_amount: 0, credit_amount: Number(invoice.total_amount) })

  const { isBalanced } = validateJournalBalance(lines)
  if (!isBalanced) throw new AppError('JOURNAL_UNBALANCED', 422)

  const entryNumber = await generateEntryNumber(tx, 'E')
  const [entry] = await tx.insert(journalEntries).values({
    entry_number: entryNumber, entry_date: invoice.expense_date,
    description: `مصروف — ${invoice.description}`, source_type: 'expense',
    source_id: invoice.id, is_balanced: true, created_by: userId,
  } as any).returning()
  await tx.insert(journalEntryLines).values(lines.map((l: any) => ({ ...l, entry_id: entry.id })))
  return entry
}

export async function createExpense(dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const vat = calculateVAT(Number(dto.amount), !!dto.has_vat)
    const [row] = await tx.insert(expenses).values({
      ...dto,
      vat_amount:   String(vat.vatAmount),
      total_amount: String(vat.total),
      created_by:   userId,
    } as any).returning()
    const entry = await createExpenseJournalEntry(tx, row, userId)
    await tx.update(expenses).set({ journal_entry_id: entry.id } as any).where(eq(expenses.id, row.id))
    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'expenses', recordId: row.id, newValues: row })
    return row
  })
}

export async function listExpenses(query: any) {
  const conditions: any[] = [eq(expenses.is_deleted, false)]
  if (query.from)         conditions.push(sql`${expenses.expense_date} >= ${query.from}`)
  if (query.to)           conditions.push(sql`${expenses.expense_date} <= ${query.to}`)
  if (query.category)     conditions.push(eq(expenses.category as any, query.category))
  if (query.expense_type) conditions.push(eq(expenses.expense_type as any, query.expense_type))
  const page  = Number(query.page  ?? 1)
  const limit = Number(query.limit ?? 25)
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(expenses).where(and(...conditions))
      .orderBy(desc(expenses.expense_date)).limit(limit).offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(expenses).where(and(...conditions)),
  ])
  return { data: rows, total: count, page, limit }
}

export async function getExpense(id: string) {
  const [row] = await db.select().from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.is_deleted, false)))
  if (!row) throw new AppError('NOT_FOUND', 404)
  return row
}

export async function deleteExpense(id: string, userId: string) {
  const expense = await getExpense(id)

  await db.transaction(async (tx) => {
    // Soft delete
    await tx.update(expenses)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where(eq(expenses.id, id))

    // Create journal reversal
    if (expense.journal_entry_id) {
      const [originalEntry] = await tx.select().from(journalEntries)
        .where(eq(journalEntries.id, expense.journal_entry_id))

      if (originalEntry && !originalEntry.is_reversed) {
        const originalLines = await tx.select().from(journalEntryLines)
          .where(eq(journalEntryLines.entry_id, originalEntry.id))

        const reversalNumber = await generateEntryNumber(tx, 'REV')
        const [reversal] = await tx.insert(journalEntries).values({
          entry_number: reversalNumber,
          entry_date:   new Date().toISOString().split('T')[0],
          description:  `عكس قيد: ${originalEntry.entry_number} — حذف مصروف`,
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
      userId, action: 'DELETE', tableName: 'expenses',
      recordId: id, oldValues: expense,
    })
  })
}

export async function getSummaryByAccount(from?: string, to?: string) {
  const conditions = ['is_deleted = false']
  if (from) conditions.push(`expense_date >= '${from}'`)
  if (to)   conditions.push(`expense_date <= '${to}'`)
  const result = await db.execute(sql.raw(`
    SELECT account_code, expense_type,
      SUM(amount) AS total_amount, SUM(vat_amount) AS total_vat,
      SUM(total_amount) AS grand_total, COUNT(*) AS count
    FROM expenses
    WHERE ${conditions.join(' AND ')}
    GROUP BY account_code, expense_type
    ORDER BY total_amount DESC
  `))
  return result.rows
}

export async function updateExpense(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const expense = await getExpense(id)

    // Recompute VAT and Total
    const vat = calculateVAT(Number(dto.amount), !!dto.has_vat)
    const newTotal = vat.total
    const newVat = vat.vatAmount

    // Update expense record
    const [updated] = await tx.update(expenses)
      .set({
        ...dto,
        vat_amount:   String(newVat),
        total_amount: String(newTotal),
        updated_at:   new Date(),
      } as any)
      .where(eq(expenses.id, id))
      .returning()

    // Sync the Journal Entry
    if (expense.journal_entry_id) {
      // 1. Update the Journal Entry header
      await tx.update(journalEntries)
        .set({
          expense_date: dto.expense_date,
          description:  `مصروف — ${dto.description}`,
        } as any)
        .where(eq(journalEntries.id, expense.journal_entry_id))

      // 2. Delete old lines
      await tx.delete(journalEntryLines)
        .where(eq(journalEntryLines.entry_id, expense.journal_entry_id))

      // 3. Insert new balanced lines
      const lines: any[] = [
        { entry_id: expense.journal_entry_id, account_code: dto.account_code, debit_amount: Number(dto.amount), credit_amount: 0 },
      ]
      if (newVat > 0) {
        lines.push({ entry_id: expense.journal_entry_id, account_code: '1110', debit_amount: newVat, credit_amount: 0 })
      }
      const PAYMENT_ACCOUNTS: Record<string, string> = { 'كاش': '1101', 'بنك': '1104', 'آجل': '2101' }
      const creditCode = PAYMENT_ACCOUNTS[dto.payment_method] || '1101'
      lines.push({ entry_id: expense.journal_entry_id, account_code: creditCode, debit_amount: 0, credit_amount: newTotal })

      await tx.insert(journalEntryLines).values(lines)
    }

    await writeAuditLog(tx, {
      userId, action: 'UPDATE', tableName: 'expenses',
      recordId: id, oldValues: expense, newValues: updated,
    })

    return updated
  })
}

// ── Controller + Routes ───────────────────────────────────────────────────
import { Request, Response, NextFunction, Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS } from '../../middleware/authorize.js'

async function listCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, ...(await listExpenses(req.query)) }) } catch (e) { next(e) }
}
async function getCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await getExpense(req.params.id) }) } catch (e) { next(e) }
}
async function createCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await createExpense(req.body, req.user.id), message: 'تم حفظ المصروف' }) } catch (e) { next(e) }
}
async function updateCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await updateExpense(req.params.id, req.body, req.user.id), message: 'تم تعديل المصروف بنجاح' }) } catch (e) { next(e) }
}
async function removeCtrl(req: Request, res: Response, next: NextFunction) {
  try { await deleteExpense(req.params.id, req.user.id); res.json({ success: true, message: 'تم الحذف بنجاح' }) } catch (e) { next(e) }
}
async function summaryCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await getSummaryByAccount(req.query.from as any, req.query.to as any) }) } catch (e) { next(e) }
}

const router = Router()
router.use(authenticate)
router.get ('/',        authorize(...ACCOUNTANT_PLUS), listCtrl)
router.get ('/summary', authorize(...ACCOUNTANT_PLUS), summaryCtrl)
router.get ('/:id',     authorize(...ACCOUNTANT_PLUS), getCtrl)
router.post('/',        authorize(...ACCOUNTANT_PLUS), createCtrl)
router.put ('/:id',     authorize(...ACCOUNTANT_PLUS), updateCtrl)
router.delete('/:id',   authorize(...ADMIN_ONLY),      removeCtrl)

export default router
