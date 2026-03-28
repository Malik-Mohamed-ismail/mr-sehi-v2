import { uuid, pgTable, varchar, text, boolean,
  integer, decimal, date, timestamp, } from 'drizzle-orm/pg-core'
import { users } from './users'

export const journalEntries = pgTable('journal_entries', {
  id:           uuid('id').defaultRandom().primaryKey(),
  entry_number: varchar('entry_number', { length: 20 }).unique().notNull(), // P-2026-0042
  entry_date:   date('entry_date').notNull(),
  description:  text('description').notNull(),
  reference:    varchar('reference', { length: 100 }),
  source_type:  varchar('source_type', { length: 30 })
                  .$type<'purchase' | 'revenue' | 'expense' | 'reversal' | 'manual'>()
                  .notNull(),
  source_id:    uuid('source_id'),
  is_balanced:  boolean('is_balanced').default(false),
  is_reversed:  boolean('is_reversed').default(false),
  reversed_by:  uuid('reversed_by'),  // FK to self (reversal entry id)
  created_by:   uuid('created_by').references(() => users.id),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const journalEntryLines = pgTable('journal_entry_lines', {
  id:             uuid('id').defaultRandom().primaryKey(),
  entry_id:       uuid('entry_id').references(() => journalEntries.id, { onDelete: 'cascade' }).notNull(),
  account_code:   varchar('account_code', { length: 20 }).notNull(),
  debit_amount:   decimal('debit_amount',  { precision: 12, scale: 4 }).notNull().default('0'),
  credit_amount:  decimal('credit_amount', { precision: 12, scale: 4 }).notNull().default('0'),
  description:    text('description'),
  created_at:     timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type JournalEntry        = typeof journalEntries.$inferSelect
export type NewJournalEntry     = typeof journalEntries.$inferInsert
export type JournalEntryLine    = typeof journalEntryLines.$inferSelect
export type NewJournalEntryLine = typeof journalEntryLines.$inferInsert
