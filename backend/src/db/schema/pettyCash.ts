import { uuid, pgTable, varchar, text, boolean,
  integer, decimal, date, timestamp, } from 'drizzle-orm/pg-core'
import { users } from './users'

export const pettyCash = pgTable('petty_cash', {
  id:                    uuid('id').defaultRandom().primaryKey(),
  transaction_date:      date('transaction_date').notNull(),
  opening_balance:       decimal('opening_balance',       { precision: 12, scale: 4 }).notNull().default('0'),
  cashier_replenishment: decimal('cashier_replenishment', { precision: 12, scale: 4 }).notNull().default('0'),
  cash_purchases:        decimal('cash_purchases',        { precision: 12, scale: 4 }).notNull().default('0'),
  card_purchases:        decimal('card_purchases',        { precision: 12, scale: 4 }).notNull().default('0'),
  closing_balance:       decimal('closing_balance',       { precision: 12, scale: 4 }).notNull(),
  // رصيد آخر المدة = رصيد أول المدة + عهدة الكاشير - مشتريات كاش - مشتريات بطاقة
  variance:              decimal('variance',              { precision: 12, scale: 4 }).notNull().default('0'),
  is_balanced:           boolean('is_balanced').default(false),
  notes:                 text('notes'),
  created_by:            uuid('created_by').references(() => users.id),
  created_at:            timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:            timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type PettyCash    = typeof pettyCash.$inferSelect
export type NewPettyCash = typeof pettyCash.$inferInsert
