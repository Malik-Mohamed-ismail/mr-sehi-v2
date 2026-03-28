import { uuid, pgTable, varchar, text, boolean,
  integer, decimal, date, timestamp, } from 'drizzle-orm/pg-core'
import { users } from './users'
import { journalEntries } from './journal'

// ── Delivery Revenue (Keeta / HungerStation / Ninja) ──────────────────────
export const deliveryRevenue = pgTable('delivery_revenue', {
  id:               uuid('id').defaultRandom().primaryKey(),
  revenue_date:     date('revenue_date').notNull(),
  platform:         varchar('platform', { length: 30 })
                      .$type<'Keeta' | 'HungerStation' | 'Ninja'>()
                      .notNull(),
  gross_amount:     decimal('gross_amount',    { precision: 12, scale: 4 }).notNull(),
  commission_rate:  decimal('commission_rate', { precision: 5, scale: 4 }).notNull().default('0'),
  commission_amount:decimal('commission_amount',{ precision: 12, scale: 4 }).notNull().default('0'),
  net_amount:       decimal('net_amount',      { precision: 12, scale: 4 }).notNull(),
  payment_method:   varchar('payment_method', { length: 10 })
                      .$type<'كاش' | 'بنك' | 'آجل'>()
                      .notNull(),
  notes:            text('notes'),
  journal_entry_id: uuid('journal_entry_id').references(() => journalEntries.id),
  is_deleted:       boolean('is_deleted').default(false),
  created_by:       uuid('created_by').references(() => users.id),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ── Restaurant Revenue ─────────────────────────────────────────────────────
export const restaurantRevenue = pgTable('restaurant_revenue', {
  id:               uuid('id').defaultRandom().primaryKey(),
  revenue_date:     date('revenue_date').notNull(),
  amount:           decimal('amount',     { precision: 12, scale: 4 }).notNull(),
  payment_method:   varchar('payment_method', { length: 10 })
                      .$type<'كاش' | 'بنك' | 'آجل'>()
                      .notNull(),
  covers:           integer('covers'),  // number of guests
  notes:            text('notes'),
  journal_entry_id: uuid('journal_entry_id').references(() => journalEntries.id),
  is_deleted:       boolean('is_deleted').default(false),
  created_by:       uuid('created_by').references(() => users.id),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ── Subscription Revenue ───────────────────────────────────────────────────
export const subscriptionRevenue = pgTable('subscription_revenue', {
  id:               uuid('id').defaultRandom().primaryKey(),
  revenue_date:     date('revenue_date').notNull(),
  subscriber_id:    uuid('subscriber_id'),  // FK added after subscribers table
  amount:           decimal('amount', { precision: 12, scale: 4 }).notNull(),
  payment_method:   varchar('payment_method', { length: 10 })
                      .$type<'كاش' | 'بنك' | 'آجل'>()
                      .notNull(),
  notes:            text('notes'),
  journal_entry_id: uuid('journal_entry_id').references(() => journalEntries.id),
  is_deleted:       boolean('is_deleted').default(false),
  created_by:       uuid('created_by').references(() => users.id),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type DeliveryRevenue       = typeof deliveryRevenue.$inferSelect
export type NewDeliveryRevenue    = typeof deliveryRevenue.$inferInsert
export type RestaurantRevenue     = typeof restaurantRevenue.$inferSelect
export type NewRestaurantRevenue  = typeof restaurantRevenue.$inferInsert
export type SubscriptionRevenue   = typeof subscriptionRevenue.$inferSelect
export type NewSubscriptionRevenue= typeof subscriptionRevenue.$inferInsert
