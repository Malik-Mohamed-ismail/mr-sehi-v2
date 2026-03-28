import { eq, and, desc, sql, like } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { journalEntries, journalEntryLines } from '../../db/schema/journal.js'
import { accounts } from '../../db/schema/accounts.js'
import { validateJournalBalance } from '../../utils/accounting.js'
import { generateEntryNumber } from '../../utils/entryNumberGenerator.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import { AppError } from '../../utils/AppError.js'

export async function createManualEntry(dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const { isBalanced } = validateJournalBalance(dto.lines)
    if (!isBalanced) throw new AppError('JOURNAL_UNBALANCED', 422)

    const entryNumber = await generateEntryNumber(tx, 'M')
    const [entry] = await tx.insert(journalEntries).values({
      entry_number: entryNumber,
      entry_date:   dto.entry_date,
      description:  dto.description,
      reference:    dto.reference,
      source_type:  'manual',
      is_balanced:  true,
      created_by:   userId,
    } as any).returning()

    await tx.insert(journalEntryLines).values(
      dto.lines.map((l: any) => ({ ...l, entry_id: entry.id }))
    )

    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'journal_entries', recordId: entry.id, newValues: entry })
    return entry
  })
}

export async function reverseEntry(entryId: string, reason: string, userId: string) {
  return db.transaction(async (tx) => {
    const [original] = await tx.select().from(journalEntries)
      .where(eq(journalEntries.id, entryId))
    if (!original)            throw new AppError('NOT_FOUND',    404)
    if (original.is_reversed) throw new AppError('ENTRY_LOCKED', 423)

    const originalLines = await tx.select().from(journalEntryLines)
      .where(eq(journalEntryLines.entry_id, entryId))

    const reversalNumber = await generateEntryNumber(tx, 'REV')
    const [reversal] = await tx.insert(journalEntries).values({
      entry_number: reversalNumber,
      entry_date:   new Date().toISOString().split('T')[0],
      description:  `عكس قيد: ${original.entry_number} — ${reason}`,
      reference:    original.entry_number,
      source_type:  'reversal',
      source_id:    original.id,
      is_balanced:  true,
      created_by:   userId,
    } as any).returning()

    // Swap debit ↔ credit on every line
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
      .where(eq(journalEntries.id, entryId))

    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'journal_entries', recordId: entryId, oldValues: original })
    return reversal
  })
}

export async function listEntries(query: any) {
  const conditions: any[] = []
  if (query.from)        conditions.push(sql`${journalEntries.entry_date} >= ${query.from}`)
  if (query.to)          conditions.push(sql`${journalEntries.entry_date} <= ${query.to}`)
  if (query.source_type) conditions.push(eq(journalEntries.source_type as any, query.source_type))
  if (query.is_balanced !== undefined) conditions.push(eq(journalEntries.is_balanced, query.is_balanced === 'true'))

  const page  = Number(query.page  ?? 1)
  const limit = Number(query.limit ?? 25)
  const offset= (page - 1) * limit

  const [rows, [{ count }]] = await Promise.all([
    db.select({
      id: journalEntries.id,
      entry_number: journalEntries.entry_number,
      entry_date: journalEntries.entry_date,
      description: journalEntries.description,
      reference: journalEntries.reference,
      source_type: journalEntries.source_type,
      source_id: journalEntries.source_id,
      is_balanced: journalEntries.is_balanced,
      is_reversed: journalEntries.is_reversed,
      reversed_by: journalEntries.reversed_by,
      created_by: journalEntries.created_by,
      created_at: journalEntries.created_at,
      updated_at: journalEntries.updated_at,
      amount: sql<number>`(SELECT COALESCE(SUM(debit_amount), 0) FROM journal_entry_lines WHERE entry_id = journal_entries.id)::numeric`
    }).from(journalEntries)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(journalEntries.entry_date))
      .limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` })
      .from(journalEntries)
      .where(conditions.length ? and(...conditions) : undefined),
  ])
  return { data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) }
}

export async function getEntry(id: string) {
  const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id))
  if (!entry) throw new AppError('NOT_FOUND', 404)
  const lines = await db.select().from(journalEntryLines).where(eq(journalEntryLines.entry_id, id))
  return { ...entry, lines }
}

export async function getTrialBalance(date?: string) {
  const cutoff = date ?? new Date().toISOString().split('T')[0]
  const rows = await db.execute(sql`
    SELECT
      jel.account_code,
      a.name_ar,
      a.type,
      SUM(jel.debit_amount)  AS total_debit,
      SUM(jel.credit_amount) AS total_credit,
      SUM(jel.debit_amount) - SUM(jel.credit_amount) AS balance
    FROM journal_entry_lines jel
    JOIN journal_entries je ON je.id = jel.entry_id
    LEFT JOIN accounts a ON a.code = jel.account_code
    WHERE je.entry_date <= ${cutoff}
      AND je.is_balanced = true
    GROUP BY jel.account_code, a.name_ar, a.type
    ORDER BY jel.account_code
  `)
  return rows.rows
}

export async function getLedger(accountCode?: string, from?: string, to?: string) {
  const conditions: string[] = ['je.is_balanced = true']
  const params: any[]        = []
  let   idx = 1

  if (accountCode) { conditions.push(`jel.account_code = $${idx++}`); params.push(accountCode) }
  if (from)        { conditions.push(`je.entry_date >= $${idx++}`);    params.push(from) }
  if (to)          { conditions.push(`je.entry_date <= $${idx++}`);    params.push(to) }

  const where = conditions.join(' AND ')
  const result = await db.execute(sql.raw(`
    SELECT
      je.entry_date,
      je.entry_number,
      je.description,
      jel.account_code,
      a.name_ar AS account_name,
      jel.debit_amount,
      jel.credit_amount,
      SUM(jel.debit_amount - jel.credit_amount) OVER (
        PARTITION BY jel.account_code
        ORDER BY je.entry_date, je.id
        ROWS UNBOUNDED PRECEDING
      ) AS running_balance
    FROM journal_entry_lines jel
    JOIN journal_entries je ON je.id = jel.entry_id
    LEFT JOIN accounts a ON a.code = jel.account_code
    WHERE ${where}
    ORDER BY jel.account_code, je.entry_date, je.id
  `))
  return result.rows
}
