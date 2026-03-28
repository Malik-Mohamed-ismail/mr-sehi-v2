import { uuid, pgTable, varchar, text, boolean,
  integer, decimal, date, timestamp, } from 'drizzle-orm/pg-core'
import { users } from './users'
import { journalEntries } from './journal'

export const expenses = pgTable('expenses', {
  id:               uuid('id').defaultRandom().primaryKey(),
  expense_date:     date('expense_date').notNull(),
  account_code:     varchar('account_code', { length: 20 }).notNull(),
  expense_type:     varchar('expense_type', { length: 20 })
                      .$type<'ثابت' | 'متغير' | 'تشغيلي' | 'طارئ'>()
                      .notNull(),
  description:      varchar('description', { length: 300 }).notNull(),
  amount:           decimal('amount',     { precision: 12, scale: 4 }).notNull(),
  vat_amount:       decimal('vat_amount', { precision: 12, scale: 4 }).notNull().default('0'),
  total_amount:     decimal('total_amount',{ precision: 12, scale: 4 }).notNull(),
  payment_method:   varchar('payment_method', { length: 10 })
                      .$type<'كاش' | 'بنك' | 'آجل'>()
                      .notNull(),
  category:         varchar('category', { length: 100 }),
  notes:            text('notes'),
  journal_entry_id: uuid('journal_entry_id').references(() => journalEntries.id),
  is_deleted:       boolean('is_deleted').default(false),
  created_by:       uuid('created_by').references(() => users.id),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Expense    = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert
