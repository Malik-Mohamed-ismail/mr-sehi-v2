import { desc, like } from 'drizzle-orm'
import { journalEntries } from '../db/schema/journal.js'

export type EntryPrefix = 'P' | 'R' | 'E' | 'M' | 'REV' | 'FA'

/**
 * Generates sequential entry numbers in format: {PREFIX}-{YEAR}-{SEQ:04d}
 * Examples: P-2026-0042 / R-2026-0015 / E-2026-0007 / REV-2026-0003
 *
 * Must be called inside a transaction to prevent race conditions.
 */
export async function generateEntryNumber(
  tx: any,
  prefix: EntryPrefix
): Promise<string> {
  const year    = new Date().getFullYear()
  const pattern = `${prefix}-${year}-%`

  const [last] = await tx
    .select({ n: journalEntries.entry_number })
    .from(journalEntries)
    .where(like(journalEntries.entry_number, pattern))
    .orderBy(desc(journalEntries.entry_number))
    .limit(1)

  const seq = last ? parseInt(last.n.split('-')[2]) + 1 : 1
  return `${prefix}-${year}-${String(seq).padStart(4, '0')}`
}

/**
 * Entry prefix key:
 * P   = Purchase invoice
 * R   = Revenue entry
 * E   = Expense entry
 * M   = Manual journal entry
 * REV = Reversal entry
 */
