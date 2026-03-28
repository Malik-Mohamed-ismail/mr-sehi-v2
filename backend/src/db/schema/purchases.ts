import { uuid, pgTable, varchar, text, boolean,
  integer, decimal, date, timestamp, } from 'drizzle-orm/pg-core'
import { users } from './users'
import { suppliers } from './suppliers'
import { journalEntries } from './journal'

export const purchaseInvoices = pgTable('purchase_invoices', {
  id:               uuid('id').defaultRandom().primaryKey(),
  invoice_number:   varchar('invoice_number', { length: 50 }).notNull(),
  invoice_date:     date('invoice_date').notNull(),
  supplier_id:      uuid('supplier_id').references(() => suppliers.id).notNull(),
  category:         varchar('category', { length: 100 })
                      .notNull(),
  item_name:        varchar('item_name', { length: 200 }).notNull(),
  quantity:         decimal('quantity',   { precision: 10, scale: 3 }).notNull().default('1'),
  unit_price:       decimal('unit_price', { precision: 12, scale: 4 }).notNull(),
  discount:         decimal('discount',   { precision: 12, scale: 4 }).notNull().default('0'),
  // Application-layer computed (no GENERATED columns — see fix in blueprint)
  subtotal:         decimal('subtotal',     { precision: 12, scale: 4 }).notNull(),
  vat_amount:       decimal('vat_amount',   { precision: 12, scale: 4 }).notNull().default('0'),
  total_amount:     decimal('total_amount', { precision: 12, scale: 4 }).notNull(),
  payment_method:   varchar('payment_method', { length: 100 })
                      .notNull(),
  is_asset:         boolean('is_asset').default(false),
  notes:            text('notes'),
  journal_entry_id: uuid('journal_entry_id').references(() => journalEntries.id),
  is_deleted:       boolean('is_deleted').default(false),  // ZATCA: never hard delete
  created_by:       uuid('created_by').references(() => users.id),
  created_at:       timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type PurchaseInvoice    = typeof purchaseInvoices.$inferSelect
export type NewPurchaseInvoice = typeof purchaseInvoices.$inferInsert
