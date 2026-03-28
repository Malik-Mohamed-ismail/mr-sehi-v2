const fs = require('fs');
const path = require('path');

function patchFile(filepath, patches) {
  let content = fs.readFileSync(filepath, 'utf8');
  for (const { from, to } of patches) {
    if (content.includes(from)) {
      content = content.replace(from, to);
    } else {
      console.log('Could not find in ' + filepath + ':\n' + from.slice(0, 100).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));
    }
  }
  fs.writeFileSync(filepath, content, 'utf8');
}

// 1. service.ts
const d_from = `export async function listDeliveryRevenue`;
const d_to = `export async function updateDeliveryRevenue(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(deliveryRevenue).where(eq(deliveryRevenue.id, id))
    if (!row) throw new AppError('NOT_FOUND', 404)
    
    const net = parseFloat((Number(dto.gross_amount) - Number(dto.commission_amount ?? 0)).toFixed(4))
    const [updated] = await tx.update(deliveryRevenue).set({
      ...dto, net_amount: String(net), updated_at: new Date()
    } as any).where(eq(deliveryRevenue.id, id)).returning()
    
    if (row.journal_entry_id) {
      await tx.update(journalEntries).set({
        expense_date: dto.revenue_date,
        description: \`إيراد توصيل — \${dto.platform}\`
      } as any).where(eq(journalEntries.id, row.journal_entry_id))
      
      await tx.delete(journalEntryLines).where(eq(journalEntryLines.entry_id, row.journal_entry_id))
      
      const REVENUE_ACCOUNT   = '410101'
      const PAYMENT_ACCOUNTS = { 'كاش': '1101', 'بنك': '1104', 'آجل': '1201' }
      const creditAccount    = PAYMENT_ACCOUNTS[dto.payment_method] ?? '1104'
      
      await tx.insert(journalEntryLines).values([
        { entry_id: row.journal_entry_id, account_code: creditAccount,    debit_amount: net, credit_amount: 0 },
        { entry_id: row.journal_entry_id, account_code: REVENUE_ACCOUNT,  debit_amount: 0, credit_amount: net },
      ])
    }
    
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'delivery_revenue', recordId: id, oldValues: row, newValues: updated })
    return updated
  })
}

export async function listDeliveryRevenue`;

const r_from = `export async function listRestaurantRevenue`;
const r_to = `export async function updateRestaurantRevenue(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(restaurantRevenue).where(eq(restaurantRevenue.id, id))
    if (!row) throw new AppError('NOT_FOUND', 404)
    
    const [updated] = await tx.update(restaurantRevenue).set({
      ...dto, updated_at: new Date()
    } as any).where(eq(restaurantRevenue.id, id)).returning()
    
    if (row.journal_entry_id) {
      await tx.update(journalEntries).set({
        expense_date: dto.revenue_date,
        description: 'إيراد مطعم'
      } as any).where(eq(journalEntries.id, row.journal_entry_id))
      
      await tx.delete(journalEntryLines).where(eq(journalEntryLines.entry_id, row.journal_entry_id))
      
      const REVENUE_ACCOUNT   = '410101'
      const PAYMENT_ACCOUNTS = { 'كاش': '1101', 'بنك': '1104', 'آجل': '1201' }
      const creditAccount    = PAYMENT_ACCOUNTS[dto.payment_method] ?? '1104'
      const amount = Number(dto.amount)
      
      await tx.insert(journalEntryLines).values([
        { entry_id: row.journal_entry_id, account_code: creditAccount,    debit_amount: amount, credit_amount: 0 },
        { entry_id: row.journal_entry_id, account_code: REVENUE_ACCOUNT,  debit_amount: 0, credit_amount: amount },
      ])
    }
    
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'restaurant_revenue', recordId: id, oldValues: row, newValues: updated })
    return updated
  })
}

export async function listRestaurantRevenue`;

const s_from = `export async function listSubscriptionRevenue`;
const s_to = `export async function updateSubscriptionRevenue(id: string, dto: any, userId: string) {
  return db.transaction(async (tx) => {
    const [row] = await tx.select().from(subscriptionRevenue).where(eq(subscriptionRevenue.id, id))
    if (!row) throw new AppError('NOT_FOUND', 404)
    
    const [updated] = await tx.update(subscriptionRevenue).set({
      ...dto, updated_at: new Date()
    } as any).where(eq(subscriptionRevenue.id, id)).returning()
    
    if (row.journal_entry_id) {
      await tx.update(journalEntries).set({
        expense_date: dto.revenue_date,
        description: 'إيراد اشتراكات'
      } as any).where(eq(journalEntries.id, row.journal_entry_id))
      
      await tx.delete(journalEntryLines).where(eq(journalEntryLines.entry_id, row.journal_entry_id))
      
      const REVENUE_ACCOUNT   = '410101'
      const PAYMENT_ACCOUNTS = { 'كاش': '1101', 'بنك': '1104', 'آجل': '1201' }
      const creditAccount    = PAYMENT_ACCOUNTS[dto.payment_method] ?? '1104'
      const amount = Number(dto.amount)
      
      await tx.insert(journalEntryLines).values([
        { entry_id: row.journal_entry_id, account_code: creditAccount,    debit_amount: amount, credit_amount: 0 },
        { entry_id: row.journal_entry_id, account_code: REVENUE_ACCOUNT,  debit_amount: 0, credit_amount: amount },
      ])
    }
    
    await writeAuditLog(tx, { userId, action: 'UPDATE', tableName: 'subscription_revenue', recordId: id, oldValues: row, newValues: updated })
    return updated
  })
}

export async function listSubscriptionRevenue`;

patchFile('./src/modules/revenue/revenue.service.ts', [
  { from: d_from, to: d_to },
  { from: r_from, to: r_to },
  { from: s_from, to: s_to }
]);

// 2. controller.ts
patchFile('./src/modules/revenue/revenue.controller.ts', [
  {
    from: `export async function listDelivery(req: Request, res: Response, next: NextFunction) {`,
    to: `export async function updateDelivery(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateDeliveryRevenue(req.params.id, req.body, req.user.id) }) } catch(e) { next(e) }
}
export async function listDelivery(req: Request, res: Response, next: NextFunction) {`
  },
  {
    from: `export async function listRestaurant(req: Request, res: Response, next: NextFunction) {`,
    to: `export async function updateRestaurant(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateRestaurantRevenue(req.params.id, req.body, req.user.id) }) } catch(e) { next(e) }
}
export async function listRestaurant(req: Request, res: Response, next: NextFunction) {`
  },
  {
    from: `export async function listSubscriptions(req: Request, res: Response, next: NextFunction) {`,
    to: `export async function updateSubscription(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateSubscriptionRevenue(req.params.id, req.body, req.user.id) }) } catch(e) { next(e) }
}
export async function listSubscriptions(req: Request, res: Response, next: NextFunction) {`
  }
]);

// 3. routes.ts
patchFile('./src/modules/revenue/revenue.routes.ts', [
  {
    from: `router.post('/delivery',    authorize(...ALL_ROLES),       ctrl.createDelivery)\nrouter.delete('/delivery/:id', authorize(...ADMIN_ONLY),   ctrl.removeDelivery)`,
    to: `router.post('/delivery',    authorize(...ALL_ROLES),       ctrl.createDelivery)\nrouter.put('/delivery/:id', authorize(...ALL_ROLES),       ctrl.updateDelivery)\nrouter.delete('/delivery/:id', authorize(...ADMIN_ONLY),   ctrl.removeDelivery)`
  },
  {
    from: `router.post('/delivery',    authorize(...ALL_ROLES),       ctrl.createDelivery)\r\nrouter.delete('/delivery/:id', authorize(...ADMIN_ONLY),   ctrl.removeDelivery)`,
    to: `router.post('/delivery',    authorize(...ALL_ROLES),       ctrl.createDelivery)\r\nrouter.put('/delivery/:id', authorize(...ALL_ROLES),       ctrl.updateDelivery)\r\nrouter.delete('/delivery/:id', authorize(...ADMIN_ONLY),   ctrl.removeDelivery)`
  },
  {
    from: `router.post('/restaurant',  authorize(...ALL_ROLES),       ctrl.createRestaurant)\nrouter.delete('/restaurant/:id', authorize(...ADMIN_ONLY), ctrl.removeRestaurant)`,
    to: `router.post('/restaurant',  authorize(...ALL_ROLES),       ctrl.createRestaurant)\nrouter.put('/restaurant/:id',  authorize(...ALL_ROLES),       ctrl.updateRestaurant)\nrouter.delete('/restaurant/:id', authorize(...ADMIN_ONLY), ctrl.removeRestaurant)`
  },
  {
    from: `router.post('/restaurant',  authorize(...ALL_ROLES),       ctrl.createRestaurant)\r\nrouter.delete('/restaurant/:id', authorize(...ADMIN_ONLY), ctrl.removeRestaurant)`,
    to: `router.post('/restaurant',  authorize(...ALL_ROLES),       ctrl.createRestaurant)\r\nrouter.put('/restaurant/:id',  authorize(...ALL_ROLES),       ctrl.updateRestaurant)\r\nrouter.delete('/restaurant/:id', authorize(...ADMIN_ONLY), ctrl.removeRestaurant)`
  },
  {
    from: `router.post('/subscriptions', authorize(...ALL_ROLES),     ctrl.createSubscription)\nrouter.delete('/subscriptions/:id', authorize(...ADMIN_ONLY), ctrl.removeSubscription)`,
    to: `router.post('/subscriptions', authorize(...ALL_ROLES),     ctrl.createSubscription)\nrouter.put('/subscriptions/:id', authorize(...ALL_ROLES),     ctrl.updateSubscription)\nrouter.delete('/subscriptions/:id', authorize(...ADMIN_ONLY), ctrl.removeSubscription)`
  },
  {
    from: `router.post('/subscriptions', authorize(...ALL_ROLES),     ctrl.createSubscription)\r\nrouter.delete('/subscriptions/:id', authorize(...ADMIN_ONLY), ctrl.removeSubscription)`,
    to: `router.post('/subscriptions', authorize(...ALL_ROLES),     ctrl.createSubscription)\r\nrouter.put('/subscriptions/:id', authorize(...ALL_ROLES),     ctrl.updateSubscription)\r\nrouter.delete('/subscriptions/:id', authorize(...ADMIN_ONLY), ctrl.removeSubscription)`
  }
]);

console.log('revenue backend patched');
