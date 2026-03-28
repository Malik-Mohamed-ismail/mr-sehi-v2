import { uuid, pgTable, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:            uuid('id').defaultRandom().primaryKey(),
  username:      varchar('username', { length: 50 }).unique().notNull(),
  email:         varchar('email', { length: 150 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 200 }).notNull(),
  full_name:     varchar('full_name', { length: 100 }).notNull(),
  role:          varchar('role', { length: 20 })
                   .$type<'admin' | 'accountant' | 'cashier'>()
                   .notNull()
                   .default('cashier'),
  is_active:     boolean('is_active').default(true),
  last_login:    timestamp('last_login', { withTimezone: true }),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type User        = typeof users.$inferSelect
export type NewUser     = typeof users.$inferInsert
export type UserRole    = 'admin' | 'accountant' | 'cashier'
