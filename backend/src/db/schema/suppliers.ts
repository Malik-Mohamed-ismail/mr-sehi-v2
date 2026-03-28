import { uuid, pgTable, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const suppliers = pgTable('suppliers', {
  id:           uuid('id').defaultRandom().primaryKey(),
  name_ar:      varchar('name_ar', { length: 150 }).notNull(),
  name_en:      varchar('name_en', { length: 150 }),
  vat_number:   varchar('vat_number', { length: 30 }),   // null = VAT exempt
  phone:        varchar('phone', { length: 20 }),
  email:        varchar('email', { length: 150 }),
  category:     varchar('category', { length: 50 }),     // مواد غذائية | خضار | ...
  is_active:    boolean('is_active').default(true),
  notes:        varchar('notes', { length: 500 }),
  created_by:   uuid('created_by').references(() => users.id),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Supplier    = typeof suppliers.$inferSelect
export type NewSupplier = typeof suppliers.$inferInsert
