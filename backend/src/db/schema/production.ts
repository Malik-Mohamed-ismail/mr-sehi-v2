import { uuid, pgTable, varchar, text, boolean,
  integer, decimal, date, timestamp, } from 'drizzle-orm/pg-core'
import { users } from './users'

export const production = pgTable('production', {
  id:               uuid('id').defaultRandom().primaryKey(),
  production_date:  date('production_date').notNull(),
  product_name:     varchar('product_name', { length: 150 }).notNull(),
  produced_kg:      decimal('produced_kg',  { precision: 10, scale: 3 }).notNull(),
  waste_grams:      decimal('waste_grams',  { precision: 10, scale: 3 }).notNull().default('0'),
  waste_value:      decimal('waste_value',  { precision: 12, scale: 4 }).notNull().default('0'),
  unit_cost:        decimal('unit_cost',    { precision: 12, scale: 4 }),
  notes:            text('notes'),
  is_deleted:       boolean('is_deleted').default(false),
  created_by:       uuid('created_by').references(() => users.id),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Production    = typeof production.$inferSelect
export type NewProduction = typeof production.$inferInsert
