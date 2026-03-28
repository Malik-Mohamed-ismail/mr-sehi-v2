import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { deliveryRevenue, restaurantRevenue, subscriptionRevenue } from '../../db/schema/revenue.js'
import { subscribers } from '../../db/schema/subscribers.js'
import { journalEntries, journalEntryLines } from '../../db/schema/journal.js'
import { generateEntryNumber } from '../../utils/entryNumberGenerator.js'
import { validateJournalBalance } from '../../utils/accounting.js'
import { writeAuditLog } from '../../utils/auditLogger.js'
import { AppError } from '../../utils/AppError.js'

// ── Delivery ─────────────────────────────────────────────────────────────
async function createRevenueJournalEntry(tx: any, amount: number, description: string, date: string, paymentMethod: string, userId: string) {
  const REVENUE_ACCOUNT   = '410101'
  const PAYMENT_ACCOUNTS: Record<string, string> = { 'كاش': '1101', 'بنك': '1104', 'آجل': '1201' }
  const creditAccount     = PAYMENT_ACCOUNTS[paymentMethod] ?? '1104'
  const lines             = [
    { account_code: creditAccount,    debit_amount: amount, credit_amount: 0 },
    { account_code: REVENUE_ACCOUNT,  debit_amount: 0, credit_amount: amount },
  ]
  const { isBalanced } = validateJournalBalance(lines)
  if (!isBalanced) throw new AppError('JOURNAL_UNBALANCED', 422)

  const entryNumber = await generateEntryNumber(tx, 'R')
  const [entry] = await tx.insert(journalEntries).values({
    entry_number: entryNumber, entry_date: date,
    description, source_type: 'revenue', is_balanced: true, created_by: userId,
  } as any).returning()
  await tx.insert(journalEntryLines).values(lines.map((l: any) => ({ ...l, entry_id: entry.id })))
  return entry
}

async function reverseRevenueJournal(tx: any, entryId: string, userId: string, sourceDesc: string) {
  const [originalEntry] = await tx.select().from(journalEntries).where(eq(journalEntries.id, entryId))
  if (!originalEntry || originalEntry.is_reversed) return

  const originalLines = await tx.select().from(journalEntryLines).where(eq(journalEntryLines.entry_id, originalEntry.id))
  const reversalNumber = await generateEntryNumber(tx, 'REV')

  const [reversal] = await tx.insert(journalEntries).values({
    entry_number: reversalNumber,
    entry_date: new Date().toISOString().split('T')[0],
    description: `عكس قيد: ${originalEntry.entry_number} — ${sourceDesc}`,
    reference: originalEntry.entry_number,
    source_type: 'reversal',
    source_id: originalEntry.id,
    is_balanced: true,
    created_by: userId,
  } as any).returning()

  await tx.insert(journalEntryLines).values(originalLines.map((l: any) => ({
    entry_id: reversal.id,
    account_code: l.account_code,
    debit_amount: l.credit_amount,
    credit_amount: l.debit_amount,
    description: `عكس: ${l.description ?? ''}`,
  })))

  await tx.update(journalEntries)
    .set({ is_reversed: true, reversed_by: reversal.id } as any)
    .where(eq(journalEntries.id, originalEntry.id))
}

// ── Delivery ─────────────────────────────────────────────────────────────
export async function createDeliveryRevenue(dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const net = parseFloat((Number(dto.gross_amount) - Number(dto.commission_amount ?? 0)).toFixed(4))
    const [row] = await tx.insert(deliveryRevenue).values({
      ...dto, net_amount: String(net), created_by: userId,
    } as any).returning()
    const entry = await createRevenueJournalEntry(tx, net, `إيراد توصيل — ${dto.platform}`, dto.revenue_date, dto.payment_method, userId)
    await tx.update(deliveryRevenue).set({ journal_entry_id: entry.id } as any).where(eq(deliveryRevenue.id, row.id))
    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'delivery_revenue', recordId: row.id, newValues: row })
    return row
  })
}

export async function updateDeliveryRevenue(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(deliveryRevenue).where(eq(deliveryRevenue.id, id))
    if (!row) throw new AppError('NOT_FOUND', 404)
    
    const net = parseFloat((Number(dto.gross_amount) - Number(dto.commission_amount ?? 0)).toFixed(4))
    const [updated] = await tx.update(deliveryRevenue).set({
      ...dto, net_amount: String(net), updated_at: new Date()
    } as any).where(eq(deliveryRevenue.id, id)).returning()
    
    if (row.journal_entry_id) {
      await tx.update(journalEntries).set({
        expense_date: dto.revenue_date,
        description: `إيراد توصيل — ${dto.platform}`
      } as any).where(eq(journalEntries.id, row.journal_entry_id))
      
      await tx.delete(journalEntryLines).where(eq(journalEntryLines.entry_id, row.journal_entry_id))
      
      const REVENUE_ACCOUNT   = '410101'
      const PAYMENT_ACCOUNTS = { 'كاش': '1101', 'بنك': '1104', 'آجل': '1201' }
      const creditAccount    = PAYMENT_ACCOUNTS[dto.payment_method] ?? '1104'
      
      await tx.insert(journalEntryLines).values([
        { entry_id: row.journal_entry_id, account_code: creditAccount,    debit_amount: net, credit_amount: 0 },
        { entry_id: row.journal_entry_id, account_code: REVENUE_ACCOUNT,  debit_amount: 0, credit_amount: net },
      ])
    }
    
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'delivery_revenue', recordId: id, oldValues: row, newValues: updated })
    return updated
  })
}

export async function listDeliveryRevenue(query: any) {
  const conditions: any[] = [eq(deliveryRevenue.is_deleted, false)]
  if (query.from)     conditions.push(sql`${deliveryRevenue.revenue_date} >= ${query.from}`)
  if (query.to)       conditions.push(sql`${deliveryRevenue.revenue_date} <= ${query.to}`)
  if (query.platform) conditions.push(eq(deliveryRevenue.platform as any, query.platform))
  const rows = await db.select().from(deliveryRevenue)
    .where(and(...conditions)).orderBy(desc(deliveryRevenue.revenue_date))
  return rows
}

export async function deleteDeliveryRevenue(id: string, userId: string) {
  const [row] = await db.select().from(deliveryRevenue).where(eq(deliveryRevenue.id, id))
  if (!row) throw new AppError('NOT_FOUND', 404)
  await db.transaction(async (tx) => {
    await tx.update(deliveryRevenue).set({ is_deleted: true, updated_at: new Date() } as any).where(eq(deliveryRevenue.id, id))
    if (row.journal_entry_id) {
      await reverseRevenueJournal(tx, row.journal_entry_id, userId, 'حذف إيراد توصيل')
    }
    await writeAuditLog(tx, { userId, action: 'DELETE', tableName: 'delivery_revenue', recordId: id, oldValues: row })
  })
}

// ── Restaurant ────────────────────────────────────────────────────────────
export async function createRestaurantRevenue(dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(restaurantRevenue).values({ ...dto, created_by: userId } as any).returning()
    const entry = await createRevenueJournalEntry(tx, Number(dto.amount), 'إيراد مطعم', dto.revenue_date, dto.payment_method, userId)
    await tx.update(restaurantRevenue).set({ journal_entry_id: entry.id } as any).where(eq(restaurantRevenue.id, row.id))
    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'restaurant_revenue', recordId: row.id, newValues: row })
    return row
  })
}

export async function updateRestaurantRevenue(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(restaurantRevenue).where(eq(restaurantRevenue.id, id))
    if (!row) throw new AppError('NOT_FOUND', 404)
    
    const [updated] = await tx.update(restaurantRevenue).set({
      ...dto, updated_at: new Date()
    } as any).where(eq(restaurantRevenue.id, id)).returning()
    
    if (row.journal_entry_id) {
      await tx.update(journalEntries).set({
        expense_date: dto.revenue_date,
        description: 'إيراد مطعم'
      } as any).where(eq(journalEntries.id, row.journal_entry_id))
      
      await tx.delete(journalEntryLines).where(eq(journalEntryLines.entry_id, row.journal_entry_id))
      
      const REVENUE_ACCOUNT   = '410101'
      const PAYMENT_ACCOUNTS = { 'كاش': '1101', 'بنك': '1104', 'آجل': '1201' }
      const creditAccount    = PAYMENT_ACCOUNTS[dto.payment_method] ?? '1104'
      const amount = Number(dto.amount)
      
      await tx.insert(journalEntryLines).values([
        { entry_id: row.journal_entry_id, account_code: creditAccount,    debit_amount: amount, credit_amount: 0 },
        { entry_id: row.journal_entry_id, account_code: REVENUE_ACCOUNT,  debit_amount: 0, credit_amount: amount },
      ])
    }
    
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'restaurant_revenue', recordId: id, oldValues: row, newValues: updated })
    return updated
  })
}

export async function listRestaurantRevenue(query: any) {
  const conditions: any[] = [eq(restaurantRevenue.is_deleted, false)]
  if (query.from) conditions.push(sql`${restaurantRevenue.revenue_date} >= ${query.from}`)
  if (query.to)   conditions.push(sql`${restaurantRevenue.revenue_date} <= ${query.to}`)
  return db.select().from(restaurantRevenue).where(and(...conditions)).orderBy(desc(restaurantRevenue.revenue_date))
}

export async function deleteRestaurantRevenue(id: string, userId: string) {
  const [row] = await db.select().from(restaurantRevenue).where(eq(restaurantRevenue.id, id))
  if (!row) throw new AppError('NOT_FOUND', 404)
  await db.transaction(async (tx) => {
    await tx.update(restaurantRevenue).set({ is_deleted: true, updated_at: new Date() } as any).where(eq(restaurantRevenue.id, id))
    if (row.journal_entry_id) {
      await reverseRevenueJournal(tx, row.journal_entry_id, userId, 'حذف إيراد مطعم')
    }
    await writeAuditLog(tx, { userId, action: 'DELETE', tableName: 'restaurant_revenue', recordId: id, oldValues: row })
  })
}

// ── Subscriptions ─────────────────────────────────────────────────────────
export async function createSubscriptionRevenue(dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(subscriptionRevenue).values({ ...dto, created_by: userId } as any).returning()
    const entry = await createRevenueJournalEntry(tx, Number(dto.amount), 'إيراد اشتراكات', dto.revenue_date, dto.payment_method, userId)
    await tx.update(subscriptionRevenue).set({ journal_entry_id: entry.id } as any).where(eq(subscriptionRevenue.id, row.id))
    await writeAuditLog(tx, { userId, action: 'CREATE', tableName: 'subscription_revenue', recordId: row.id, newValues: row })
    return row
  })
}

export async function updateSubscriptionRevenue(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(subscriptionRevenue).where(eq(subscriptionRevenue.id, id))
    if (!row) throw new AppError('NOT_FOUND', 404)
    
    const [updated] = await tx.update(subscriptionRevenue).set({
      ...dto, updated_at: new Date()
    } as any).where(eq(subscriptionRevenue.id, id)).returning()
    
    if (row.journal_entry_id) {
      await tx.update(journalEntries).set({
        expense_date: dto.revenue_date,
        description: 'إيراد اشتراكات'
      } as any).where(eq(journalEntries.id, row.journal_entry_id))
      
      await tx.delete(journalEntryLines).where(eq(journalEntryLines.entry_id, row.journal_entry_id))
      
      const REVENUE_ACCOUNT   = '410101'
      const PAYMENT_ACCOUNTS = { 'كاش': '1101', 'بنك': '1104', 'آجل': '1201' }
      const creditAccount    = PAYMENT_ACCOUNTS[dto.payment_method] ?? '1104'
      const amount = Number(dto.amount)
      
      await tx.insert(journalEntryLines).values([
        { entry_id: row.journal_entry_id, account_code: creditAccount,    debit_amount: amount, credit_amount: 0 },
        { entry_id: row.journal_entry_id, account_code: REVENUE_ACCOUNT,  debit_amount: 0, credit_amount: amount },
      ])
    }
    
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'subscription_revenue', recordId: id, oldValues: row, newValues: updated })
    return updated
  })
}

export async function listSubscriptionRevenue(query: any) {
  const conditions: any[] = [eq(subscriptionRevenue.is_deleted, false)]
  if (query.from) conditions.push(sql`${subscriptionRevenue.revenue_date} >= ${query.from}`)
  if (query.to)   conditions.push(sql`${subscriptionRevenue.revenue_date} <= ${query.to}`)
  return db.select().from(subscriptionRevenue).where(and(...conditions)).orderBy(desc(subscriptionRevenue.revenue_date))
}

export async function deleteSubscriptionRevenue(id: string, userId: string) {
  const [row] = await db.select().from(subscriptionRevenue).where(eq(subscriptionRevenue.id, id))
  if (!row) throw new AppError('NOT_FOUND', 404)
  await db.transaction(async (tx) => {
    await tx.update(subscriptionRevenue).set({ is_deleted: true, updated_at: new Date() } as any).where(eq(subscriptionRevenue.id, id))
    if (row.journal_entry_id) {
      await reverseRevenueJournal(tx, row.journal_entry_id, userId, 'حذف إيراد اشتراكات')
    }
    await writeAuditLog(tx, { userId, action: 'DELETE', tableName: 'subscription_revenue', recordId: id, oldValues: row })
  })
}

// ── Summary + Daily Series ─────────────────────────────────────────────────
export async function getRevenueSummary(from?: string, to?: string) {
  const buildCond = (table: any, dateCol: any) => {
    const c: any[] = [eq(table.is_deleted, false)]
    if (from) c.push(sql`${dateCol} >= ${from}`)
    if (to)   c.push(sql`${dateCol} <= ${to}`)
    return c
  }
  const [delivTotals, restTotals, subsTotals] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(net_amount), 0)::numeric` })
      .from(deliveryRevenue).where(and(...buildCond(deliveryRevenue, deliveryRevenue.revenue_date))),
    db.select({ total: sql<number>`coalesce(sum(amount), 0)::numeric` })
      .from(restaurantRevenue).where(and(...buildCond(restaurantRevenue, restaurantRevenue.revenue_date))),
    db.select({ total: sql<number>`coalesce(sum(amount), 0)::numeric` })
      .from(subscriptionRevenue).where(and(...buildCond(subscriptionRevenue, subscriptionRevenue.revenue_date))),
  ])
  const delivery     = Number(delivTotals[0].total)
  const restaurant   = Number(restTotals[0].total)
  const subscription = Number(subsTotals[0].total)
  const grandTotal   = delivery + restaurant + subscription
  return {
    delivery_total:      delivery,
    restaurant_total:    restaurant,
    subscriptions_total: subscription,
    grand_total:         grandTotal,
    channel_pct: {
      delivery:     grandTotal > 0 ? delivery     / grandTotal : 0,
      restaurant:   grandTotal > 0 ? restaurant   / grandTotal : 0,
      subscriptions:grandTotal > 0 ? subscription / grandTotal : 0,
    },
  }
}

export async function getDailySeries(from?: string, to?: string) {
  const result = await db.execute(sql`
    WITH dates AS (
      SELECT generate_series(
        CAST(${from ? sql`${from}` : sql`(now() - interval '30 days')`} AS date),
        CAST(${to   ? sql`${to}`   : sql`now()`} AS date),
        '1 day'::interval
      )::date AS d
    ),
    delivery_daily AS (
      SELECT revenue_date, SUM(net_amount) AS amount FROM delivery_revenue
      WHERE is_deleted = false ${from ? sql`AND revenue_date >= ${from}` : sql``} ${to ? sql`AND revenue_date <= ${to}` : sql``}
      GROUP BY revenue_date
    ),
    restaurant_daily AS (
      SELECT revenue_date, SUM(amount) AS amount FROM restaurant_revenue
      WHERE is_deleted = false ${from ? sql`AND revenue_date >= ${from}` : sql``} ${to ? sql`AND revenue_date <= ${to}` : sql``}
      GROUP BY revenue_date
    ),
    subscription_daily AS (
      SELECT revenue_date, SUM(amount) AS amount FROM subscription_revenue
      WHERE is_deleted = false ${from ? sql`AND revenue_date >= ${from}` : sql``} ${to ? sql`AND revenue_date <= ${to}` : sql``}
      GROUP BY revenue_date
    )
    SELECT
      dates.d AS date,
      COALESCE(dd.amount, 0) AS delivery,
      COALESCE(rd.amount, 0) AS restaurant,
      COALESCE(sd.amount, 0) AS subscriptions,
      COALESCE(dd.amount, 0) + COALESCE(rd.amount, 0) + COALESCE(sd.amount, 0) AS total
    FROM dates
    LEFT JOIN delivery_daily     dd ON dd.revenue_date = dates.d
    LEFT JOIN restaurant_daily   rd ON rd.revenue_date = dates.d
    LEFT JOIN subscription_daily sd ON sd.revenue_date = dates.d
    ORDER BY dates.d
  `)
  return result.rows
}
