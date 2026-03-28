import { uuid, pgTable, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'

export const lookups = pgTable('lookups', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // 'platform' | 'payment_method' | 'category' | 'product_name'
  name_en: varchar('name_en', { length: 150 }).notNull(),
  name_ar: varchar('name_ar', { length: 150 }).notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type Lookup    = typeof lookups.$inferSelect
export type NewLookup = typeof lookups.$inferInsert
