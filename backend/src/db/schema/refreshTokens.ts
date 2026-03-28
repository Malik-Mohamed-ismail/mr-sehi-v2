import { uuid, pgTable, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const refreshTokens = pgTable('refresh_tokens', {
  id:         uuid('id').defaultRandom().primaryKey(),
  user_id:    uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token_hash: varchar('token_hash', { length: 200 }).notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked:    boolean('revoked').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    hashIdx:   index('idx_refresh_tokens_hash').on(table.token_hash),
    expiryIdx: index('idx_refresh_tokens_expiry').on(table.expires_at),
  }
})

export type RefreshToken    = typeof refreshTokens.$inferSelect
export type NewRefreshToken = typeof refreshTokens.$inferInsert
