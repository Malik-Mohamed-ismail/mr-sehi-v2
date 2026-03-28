import { uuid, pgTable, varchar, text, boolean,
  integer, decimal, date, timestamp, } from 'drizzle-orm/pg-core'
import { users } from './users'

export const subscribers = pgTable('subscribers', {
  id:               uuid('id').defaultRandom().primaryKey(),
  name:             varchar('name', { length: 150 }).notNull(),
  phone:            varchar('phone', { length: 20 }),
  plan_name:        varchar('plan_name', { length: 100 }),
  plan_amount:      decimal('plan_amount', { precision: 12, scale: 4 }).notNull(),
  start_date:       date('start_date').notNull(),
  end_date:         date('end_date').notNull(),
  status:           varchar('status', { length: 20 })
                      .$type<'active' | 'expired' | 'cancelled'>()
                      .notNull()
                      .default('active'),
  payment_method:   varchar('payment_method', { length: 10 })
                      .$type<'كاش' | 'بنك' | 'آجل'>(),
  notes:            text('notes'),
  is_deleted:       boolean('is_deleted').default(false),
  created_by:       uuid('created_by').references(() => users.id),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Subscriber    = typeof subscribers.$inferSelect
export type NewSubscriber = typeof subscribers.$inferInsert
