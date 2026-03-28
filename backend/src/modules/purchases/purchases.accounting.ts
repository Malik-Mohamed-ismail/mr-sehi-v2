import { eq } from 'drizzle-orm'
import { generateEntryNumber } from '../../utils/entryNumberGenerator.js'
import { validateJournalBalance } from '../../utils/accounting.js'
import { AppError } from '../../utils/AppError.js'
import { journalEntries, journalEntryLines } from '../../db/schema/journal.js'

const INVENTORY_ACCOUNTS: Record<string, string> = {
  'مواد غذائية': '510101',
  'بلاستيكيات':  '510102',
  'مشروبات':     '510103',
  'خضار':        '510104',
  'خبز':         '510105',
  'مياه':        '510103',
}

const ASSET_ACCOUNTS: Record<string, string> = {
  'معدات مطبخ': '1201',
  'أثاث':       '1202',
  'نقطة بيع':   '1203',
}

const PAYMENT_ACCOUNTS: Record<string, string> = {
  'كاش': '1101',
  'بنك': '1104',
  'آجل': '2101',
}

export async function createPurchaseJournalEntry(
  tx: any,
  invoice: any,
  supplier: any,
  userId: string
) {
  const lines: Array<{ account_code: string; debit_amount: number; credit_amount: number; description?: string }> = []

  const debitAccountCode = invoice.is_asset
    ? (ASSET_ACCOUNTS[invoice.category] ?? '1299')
    : (INVENTORY_ACCOUNTS[invoice.category] ?? '510199')

  lines.push({ account_code: debitAccountCode, debit_amount: Number(invoice.subtotal), credit_amount: 0 })

  if (Number(invoice.vat_amount) > 0) {
    lines.push({ account_code: '1110', debit_amount: Number(invoice.vat_amount), credit_amount: 0 })
  }

  const creditCode = PAYMENT_ACCOUNTS[invoice.payment_method]
  if (!creditCode) throw new AppError('VALIDATION_ERROR', 400, 'طريقة الدفع غير معروفة')
  lines.push({ account_code: creditCode, debit_amount: 0, credit_amount: Number(invoice.total_amount) })

  const { isBalanced } = validateJournalBalance(lines)
  if (!isBalanced) throw new AppError('JOURNAL_UNBALANCED', 422)

  const entryNumber = await generateEntryNumber(tx, 'P')
  const [entry] = await tx.insert(journalEntries).values({
    entry_number: entryNumber,
    entry_date:   invoice.invoice_date,
    description:  `شراء ${invoice.item_name} — ${supplier.name_ar}`,
    reference:    invoice.invoice_number,
    source_type:  'purchase',
    source_id:    invoice.id,
    is_balanced:  true,
    created_by:   userId,
  } as any).returning()

  await tx.insert(journalEntryLines).values(
    lines.map(l => ({ ...l, entry_id: entry.id }))
  )

  return entry
}
