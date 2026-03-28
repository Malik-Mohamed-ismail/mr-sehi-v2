import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { fixedAssets } from '../../db/schema/fixedAssets.js'
import { journalEntries, journalEntryLines } from '../../db/schema/journal.js'
import { generateEntryNumber } from '../../utils/entryNumberGenerator.js'
import { validateJournalBalance } from '../../utils/accounting.js'
import { calculateVAT } from '../../utils/vat.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import { AppError } from '../../utils/AppError.js'

// Account map: asset type → debit account code
const ASSET_ACCOUNTS: Record<string, string> = {
  equipment:  '1501',
  furniture:  '1502',
  vehicles:   '1503',
  technology: '1504',
  other:      '1509',
}

// Payment method → credit account code
const PAYMENT_ACCOUNTS: Record<string, string> = {
  'كاش': '1101',
  'بنك': '1104',
  'آجل': '2101',
}

// ── Journal helper ───────────────────────────────────────────────────────────
async function createAssetJournalEntry(tx: any, asset: any, userId: string) {
  const lines: any[] = [
    { account_code: asset.account_code, debit_amount: Number(asset.cost), credit_amount: 0 },
  ]
  if (Number(asset.vat_amount) > 0) {
    lines.push({ account_code: '1110', debit_amount: Number(asset.vat_amount), credit_amount: 0 })
  }
  const creditCode = PAYMENT_ACCOUNTS[asset.payment_method]
  if (!creditCode) throw new AppError('VALIDATION_ERROR', 422)
  lines.push({ account_code: creditCode, debit_amount: 0, credit_amount: Number(asset.total_cost) })

  const { isBalanced } = validateJournalBalance(lines)
  if (!isBalanced) throw new AppError('JOURNAL_UNBALANCED', 422)

  const entryNumber = await generateEntryNumber(tx, 'FA')
  const [entry] = await tx.insert(journalEntries).values({
    entry_number: entryNumber,
    entry_date:   asset.asset_date,
    description:  `أصل ثابت — ${asset.asset_name}`,
    source_type:  'manual',
    source_id:    asset.id,
    is_balanced:  true,
    created_by:   userId,
  } as any).returning()

  await tx.insert(journalEntryLines).values(
    lines.map((l: any) => ({ ...l, entry_id: entry.id }))
  )
  return entry
}

// ── Service functions ────────────────────────────────────────────────────────
export async function createAsset(dto: any, userId: string) {
  return db.transaction(async (tx) => {
    // If has_vat is true, dto.cost is the TOTAL amount.
    // Calculate backwards: base = total / 1.15, vat = total - base.
    const rawTotal = Number(dto.cost)
    const baseAmount = dto.has_vat ? rawTotal / 1.15 : rawTotal
    const vatAmount  = dto.has_vat ? rawTotal - baseAmount : 0
    const total      = dto.has_vat ? rawTotal : rawTotal

    // Resolve account_code from asset_type if not explicitly supplied
    const account_code = dto.account_code || ASSET_ACCOUNTS[dto.asset_type] || '1509'

    const [row] = await tx.insert(fixedAssets).values({
      ...dto,
      account_code,
      cost: String(parseFloat(baseAmount.toFixed(4))),
      vat_amount: String(parseFloat(vatAmount.toFixed(4))),
      total_cost: String(parseFloat(total.toFixed(4))),
      created_by: userId,
    } as any).returning()

    const entry = await createAssetJournalEntry(tx, row, userId)
    await tx.update(fixedAssets)
      .set({ journal_entry_id: entry.id } as any)
      .where(eq(fixedAssets.id, row.id))

    await writeAuditLog(tx, {
      userId, action: 'CREATE', tableName: 'fixed_assets', recordId: row.id, newValues: row,
    })
    return { ...row, journal_entry_id: entry.id }
  })
}

export async function listAssets(query: any) {
  const conditions: any[] = [eq(fixedAssets.is_deleted, false)]
  if (query.asset_type) conditions.push(eq(fixedAssets.asset_type as any, query.asset_type))

  const page  = Number(query.page  ?? 1)
  const limit = Number(query.limit ?? 50)
  const offset = (page - 1) * limit

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(fixedAssets)
      .where(and(...conditions))
      .orderBy(desc(fixedAssets.asset_date))
      .limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(fixedAssets)
      .where(and(...conditions)),
  ])
  return { data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) }
}

export async function getAsset(id: string) {
  const [row] = await db.select().from(fixedAssets)
    .where(and(eq(fixedAssets.id, id), eq(fixedAssets.is_deleted, false)))
  if (!row) throw new AppError('NOT_FOUND', 404)
  return row
}

export async function deleteAsset(id: string, userId: string) {
  const asset = await getAsset(id)

  await db.transaction(async (tx) => {
    // Soft delete
    await tx.update(fixedAssets)
      .set({ is_deleted: true, updated_at: new Date() } as any)
      .where(eq(fixedAssets.id, id))

    // Auto-reverse the journal entry
    if (asset.journal_entry_id) {
      const [originalEntry] = await tx.select().from(journalEntries)
        .where(eq(journalEntries.id, asset.journal_entry_id))

      if (originalEntry && !originalEntry.is_reversed) {
        const originalLines = await tx.select().from(journalEntryLines)
          .where(eq(journalEntryLines.entry_id, originalEntry.id))

        const reversalNumber = await generateEntryNumber(tx, 'REV')
        const [reversal] = await tx.insert(journalEntries).values({
          entry_number: reversalNumber,
          entry_date:   new Date().toISOString().split('T')[0],
          description:  `عكس قيد: ${originalEntry.entry_number} — حذف أصل ثابت`,
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
            description: `عكس: ${l.description ?? ''}`,
          }))
        )

        // Mark original as reversed
        await tx.update(journalEntries)
          .set({ is_reversed: true, reversed_by: reversal.id } as any)
          .where(eq(journalEntries.id, originalEntry.id))
      }
    }

    await writeAuditLog(tx, {
      userId, action: 'DELETE', tableName: 'fixed_assets', recordId: id, oldValues: asset,
    })
  })
}

export async function updateAsset(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const asset = await getAsset(id)

    // Recompute amounts (same logic as createAsset)
    const rawTotal   = Number(dto.cost)
    const baseAmount = dto.has_vat ? rawTotal / 1.15 : rawTotal
    const vatAmount  = dto.has_vat ? rawTotal - baseAmount : 0
    const totalCost  = rawTotal
    const account_code = dto.account_code || ASSET_ACCOUNTS[dto.asset_type] || '1509'

    const [updated] = await tx.update(fixedAssets)
      .set({
        ...dto,
        account_code,
        cost:       String(parseFloat(baseAmount.toFixed(4))),
        vat_amount: String(parseFloat(vatAmount.toFixed(4))),
        total_cost: String(parseFloat(totalCost.toFixed(4))),
        updated_at: new Date(),
      } as any)
      .where(eq(fixedAssets.id, id))
      .returning()

    // Re-sync linked Journal Entry
    if (asset.journal_entry_id) {
      await tx.update(journalEntries)
        .set({ description: `أصل ثابت — ${dto.asset_name ?? asset.asset_name}` } as any)
        .where(eq(journalEntries.id, asset.journal_entry_id))

      await tx.delete(journalEntryLines)
        .where(eq(journalEntryLines.entry_id, asset.journal_entry_id))

      const lines: any[] = [
        { entry_id: asset.journal_entry_id, account_code, debit_amount: parseFloat(baseAmount.toFixed(4)), credit_amount: 0 },
      ]
      if (vatAmount > 0) {
        lines.push({ entry_id: asset.journal_entry_id, account_code: '1110', debit_amount: parseFloat(vatAmount.toFixed(4)), credit_amount: 0 })
      }
      const creditCode = PAYMENT_ACCOUNTS[dto.payment_method]
      if (!creditCode) throw new AppError('VALIDATION_ERROR', 422)
      lines.push({ entry_id: asset.journal_entry_id, account_code: creditCode, debit_amount: 0, credit_amount: parseFloat(totalCost.toFixed(4)) })

      await tx.insert(journalEntryLines).values(lines)
    }

    await writeAuditLog(tx, {
      userId, action: 'UPDATE', tableName: 'fixed_assets', recordId: id, oldValues: asset, newValues: updated,
    })
    return updated
  })
}

export async function runDepreciation(userId: string) {
  return db.transaction(async (tx) => {
    const today = new Date()
    const allAssets = await tx.select().from(fixedAssets).where(eq(fixedAssets.is_deleted, false))
    
    let totalDepreciation = 0
    const lines: any[] = []
    const updates: Promise<any>[] = []

    for (const asset of allAssets) {
      const cost   = Number(asset.cost)
      const accum  = Number(asset.accumulated_depreciation)
      if (accum >= cost) continue // Fully depreciated

      const startDate = asset.last_depreciation_date ? new Date(asset.last_depreciation_date) : new Date(asset.asset_date)
      const days = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (days <= 0) continue

      let depAmount = (cost / (asset.useful_life_years ?? 5)) * (days / 365.25)
      
      // Ensure we don't depreciate below 0 book value
      if (accum + depAmount > cost) {
        depAmount = cost - accum
      }

      if (depAmount > 0) {
        totalDepreciation += depAmount
        const nextAccum = accum + depAmount

        updates.push(
          tx.update(fixedAssets)
            .set({ 
              accumulated_depreciation: String(parseFloat(nextAccum.toFixed(4))), 
              last_depreciation_date: today.toISOString().split('T')[0] 
            } as any)
            .where(eq(fixedAssets.id, asset.id))
        )
      }
    }

    if (totalDepreciation > 0) {
      // Create journal entry for total depreciation run
      const entryNumber = await generateEntryNumber(tx, 'FA')
      const [entry] = await tx.insert(journalEntries).values({
        entry_number: entryNumber,
        entry_date:   today.toISOString().split('T')[0],
        description:  `إهلاك الأصول الثابتة الآلي حتى تاريخ اليوم`,
        source_type:  'manual',
        is_balanced:  true,
        created_by:   userId,
      } as any).returning()

      lines.push(
        { entry_id: entry.id, account_code: '5105', debit_amount: parseFloat(totalDepreciation.toFixed(4)), credit_amount: 0, description: 'مصروف الإهلاك' },
        { entry_id: entry.id, account_code: '1510', debit_amount: 0, credit_amount: parseFloat(totalDepreciation.toFixed(4)), description: 'مجمع الإهلاك' }
      )
      await tx.insert(journalEntryLines).values(lines)
      await Promise.all(updates)

      await writeAuditLog(tx, {
        userId, action: 'UPDATE', tableName: 'fixed_assets', recordId: entry.id, newValues: { action: 'Automated Depreciation Run', amount: totalDepreciation }
      })
      
      return { success: true, amount: totalDepreciation, count: updates.length, entry }
    }
    return { success: true, amount: 0, count: 0 }
  })
}

// ── Controller + Routes ──────────────────────────────────────────────────────
import { Request, Response, NextFunction, Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { authorize, ADMIN_ONLY, ACCOUNTANT_PLUS } from '../../middleware/authorize.js'

async function listCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, ...(await listAssets(req.query)) }) } catch (e) { next(e) }
}
async function getCtrl(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await getAsset(req.params.id) }) } catch (e) { next(e) }
}
async function createCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({
      success: true,
      data: await createAsset(req.body, req.user.id),
      message: 'تم حفظ الأصل وإنشاء القيد المحاسبي تلقائياً',
    })
  } catch (e) { next(e) }
}
async function removeCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteAsset(req.params.id, req.user.id)
    res.json({ success: true, message: 'تم حذف الأصل وعكس القيد المحاسبي' })
  } catch (e) { next(e) }
}
async function depreciateCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await runDepreciation(req.user.id)
    res.json({ success: true, data: result, message: result.count > 0 ? `تم احتساب الإهلاك لـ ${result.count} أصول` : 'لا توجد أصول تتطلب إهلاك اليوم' })
  } catch (e) { next(e) }
}

async function updateCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({
      success: true,
      data: await updateAsset(req.params.id, req.body, req.user.id),
      message: 'تم تعديل الأصل وتحديث القيد المحاسبي',
    })
  } catch (e) { next(e) }
}

const router = Router()
router.use(authenticate)
router.get ('/',             authorize(...ACCOUNTANT_PLUS), listCtrl)
router.get ('/:id',          authorize(...ACCOUNTANT_PLUS), getCtrl)
router.post('/',             authorize(...ACCOUNTANT_PLUS), createCtrl)
router.post('/depreciate',   authorize(...ACCOUNTANT_PLUS), depreciateCtrl)
router.put ('/:id',          authorize(...ACCOUNTANT_PLUS), updateCtrl)
router.delete('/:id',        authorize(...ADMIN_ONLY),      removeCtrl)

export default router
