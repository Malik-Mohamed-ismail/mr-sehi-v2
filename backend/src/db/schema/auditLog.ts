import { uuid, pgTable, integer, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const auditLog = pgTable('audit_log', {
  id:         uuid('id').defaultRandom().primaryKey(),
  user_id:    uuid('user_id').references(() => users.id),
  action:     varchar('action', { length: 20 })
                .$type<'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT'>()
                .notNull(),
  table_name: varchar('table_name', { length: 50 }).notNull(),
  record_id:  uuid('record_id'),
  old_values: jsonb('old_values'),
  new_values: jsonb('new_values'),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type AuditLogEntry    = typeof auditLog.$inferSelect
export type NewAuditLogEntry = typeof auditLog.$inferInsert
