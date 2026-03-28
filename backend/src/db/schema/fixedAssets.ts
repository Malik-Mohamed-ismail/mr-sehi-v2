import { uuid, pgTable, varchar, text, boolean,
  integer, decimal, date, timestamp, } from 'drizzle-orm/pg-core'
import { users } from './users'
import { journalEntries } from './journal'

export const fixedAssets = pgTable('fixed_assets', {
  id:                uuid('id').defaultRandom().primaryKey(),
  asset_date:        date('asset_date').notNull(),
  asset_name:        varchar('asset_name', { length: 200 }).notNull(),
  asset_type:        varchar('asset_type', { length: 20 })
                       .$type<'equipment' | 'furniture' | 'vehicles' | 'technology' | 'other'>()
                       .notNull(),
  account_code:      varchar('account_code', { length: 20 }).notNull(),
  cost:              decimal('cost',        { precision: 12, scale: 4 }).notNull(),
  vat_amount:        decimal('vat_amount',  { precision: 12, scale: 4 }).notNull().default('0'),
  total_cost:        decimal('total_cost',  { precision: 12, scale: 4 }).notNull(),
  payment_method:    varchar('payment_method', { length: 10 })
                       .$type<'كاش' | 'بنك' | 'آجل'>()
                       .notNull(),
  useful_life_years: integer('useful_life_years').default(5),
  accumulated_depreciation: decimal('accumulated_depreciation', { precision: 12, scale: 4 }).default('0'),
  last_depreciation_date: date('last_depreciation_date'),
  description:       varchar('description', { length: 300 }).notNull(),
  notes:             text('notes'),
  journal_entry_id:  uuid('journal_entry_id').references(() => journalEntries.id),
  is_deleted:        boolean('is_deleted').default(false),
  created_by:        uuid('created_by').references(() => users.id),
  created_at:        timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:        timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type FixedAsset    = typeof fixedAssets.$inferSelect
export type NewFixedAsset = typeof fixedAssets.$inferInsert
