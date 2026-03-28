import { uuid, pgTable, date, decimal, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const vatPeriods = pgTable('vat_periods', {
  id:               uuid('id').defaultRandom().primaryKey(),
  period_start:     date('period_start').notNull(),
  period_end:       date('period_end').notNull(),
  total_vat_input:  decimal('total_vat_input',  { precision: 12, scale: 4 }),
  total_vat_output: decimal('total_vat_output', { precision: 12, scale: 4 }),
  net_vat_payable:  decimal('net_vat_payable',  { precision: 12, scale: 4 }),
  status:           varchar('status', { length: 20 })
                      .$type<'draft' | 'filed' | 'paid'>()
                      .default('draft'),
  filed_at:         timestamp('filed_at', { withTimezone: true }),
  notes:            text('notes'),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type VatPeriod    = typeof vatPeriods.$inferSelect
export type NewVatPeriod = typeof vatPeriods.$inferInsert
