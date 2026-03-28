import { uuid, pgTable, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const accounts = pgTable('accounts', {
  id:           uuid('id').defaultRandom().primaryKey(),
  code:         varchar('code', { length: 20 }).unique().notNull(),
  name_ar:      varchar('name_ar', { length: 150 }).notNull(),
  name_en:      varchar('name_en', { length: 150 }),
  type:         varchar('type', { length: 20 })
                  .$type<'asset' | 'liability' | 'equity' | 'revenue' | 'expense'>()
                  .notNull(),
  parent_code:  varchar('parent_code', { length: 20 }),
  level:        integer('level').default(1),
  is_active:    boolean('is_active').default(true),
  is_system:    boolean('is_system').default(false),  // system accounts cannot be deleted
  created_by:   uuid('created_by').references(() => users.id),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Account    = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
