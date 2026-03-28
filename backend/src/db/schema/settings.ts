import { uuid, pgTable, varchar, jsonb, timestamp, integer } from 'drizzle-orm/pg-core'
import { users } from './users'

export const settings = pgTable('settings', {
  id:           uuid('id').defaultRandom().primaryKey(),
  key:          varchar('key', { length: 100 }).unique().notNull(), // e.g. SYSTEM_PROFILE
  value:        jsonb('value').notNull(),
  updated_by:   uuid('updated_by').references(() => users.id),
  updated_at:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Setting = typeof settings.$inferSelect
export type NewSetting = typeof settings.$inferInsert
