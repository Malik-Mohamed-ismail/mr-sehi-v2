import { sql } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { getRevenueSummary } from '../revenue/revenue.service.js'
import { calculateBreakEven } from '../../utils/accounting.js'

// ── Income Statement ───────────────────────────────────────────────────────
export async function getIncomeStatement(from: string, to: string) {
  const [revenue, expenseRows, purchaseRows] = await Promise.all([
    getRevenueSummary(from, to),
    db.execute(sql.raw(`
      SELECT account_code, SUM(amount) AS total
      FROM expenses
      WHERE is_deleted = false AND expense_date >= '${from}' AND expense_date <= '${to}'
      GROUP BY account_code
    `)),
    db.execute(sql.raw(`
      SELECT SUM(subtotal) AS cogs FROM purchase_invoices
      WHERE is_deleted = false AND invoice_date >= '${from}' AND invoice_date <= '${to}'
        AND is_asset = false
    `))
  ])

  const totalRevenue  = revenue.grand_total
  const totalCOGS     = Number((purchaseRows.rows[0] as any)?.cogs ?? 0)
  const grossProfit   = totalRevenue - totalCOGS
  const totalExpenses = (expenseRows.rows as any[]).reduce((s: number, r: any) => s + Number(r.total), 0)
  const netProfit     = grossProfit - totalExpenses

  return {
    period: { from, to },
    revenue: {
      delivery:      revenue.delivery_total,
      restaurant:    revenue.restaurant_total,
      subscriptions: revenue.subscriptions_total,
      total:         totalRevenue,
    },
    cogs:           totalCOGS,
    gross_profit:   grossProfit,
    gross_margin:   totalRevenue > 0 ? grossProfit / totalRevenue : 0,
    expenses:       expenseRows.rows,
    total_expenses: totalExpenses,
    net_profit:     netProfit,
    net_margin:     totalRevenue > 0 ? netProfit / totalRevenue : 0,
  }
}

// ── Balance Sheet ─────────────────────────────────────────────────────────
export async function getBalanceSheet(date: string) {
  const result = await db.execute(sql.raw(`
    SELECT
      a.code, a.name_ar, a.type,
      SUM(jel.debit_amount) - SUM(jel.credit_amount) AS balance
    FROM journal_entry_lines jel
    JOIN journal_entries je ON je.id = jel.entry_id
    JOIN accounts a ON a.code = jel.account_code
    WHERE je.entry_date <= '${date}' AND je.is_balanced = true
    GROUP BY a.code, a.name_ar, a.type
    HAVING SUM(jel.debit_amount) - SUM(jel.credit_amount) <> 0
    ORDER BY a.type, a.code
  `))

  const rows     = result.rows as any[]
  const assets      = rows.filter(r => r.type === 'asset')
  const liabilities = rows.filter(r => r.type === 'liability')
  const equity      = rows.filter(r => r.type === 'equity')

  // Calculate dynamic Net Income (Revenue - Expenses) to date, because closing entries might not exist
  const netIncomeRes = await db.execute(sql.raw(`
    SELECT COALESCE(SUM(jel.credit_amount) - SUM(jel.debit_amount), 0) AS net_income
    FROM journal_entry_lines jel
    JOIN journal_entries je ON je.id = jel.entry_id
    JOIN accounts a ON a.code = jel.account_code
    WHERE je.entry_date <= '${date}' AND je.is_balanced = true
      AND (a.type = 'revenue' OR a.type = 'expense')
  `))
  
  const currentYearEarnings = Number((netIncomeRes.rows as any[])?.[0]?.net_income ?? 0)
  if (currentYearEarnings !== 0) {
    equity.push({
      code: '3102', // Virtual or real Retained Earnings code
      name_ar: 'أرباح مبقاة (أرباح الفترة المتراكمة)',
      type: 'equity',
      balance: currentYearEarnings
    })
  }

  const totalAssets      = assets.reduce((s, r) => s + Number(r.balance), 0)
  const totalLiabilities = liabilities.reduce((s, r) => s + Number(r.balance), 0)
  const totalEquity      = equity.reduce((s, r) => s + Number(r.balance), 0)

  return {
    date,
    assets,      total_assets:      totalAssets,
    liabilities, total_liabilities: totalLiabilities,
    equity,      total_equity:      totalEquity,
    is_balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export async function getDashboard(from?: string, to?: string) {
  const now    = new Date()
  const f      = from ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const t      = to   ?? now.toISOString().split('T')[0]
  const [income, subStats] = await Promise.all([
    getIncomeStatement(f, t),
    db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active' AND is_deleted = false) AS active_subscribers,
        COUNT(*) FILTER (WHERE status = 'expired' AND is_deleted = false) AS expired_subscribers
      FROM subscribers
    `)
  ])

  return {
    period: { from: f, to: t },
    revenue:            income.revenue,
    gross_profit:       income.gross_profit,
    gross_margin:       income.gross_margin,
    net_profit:         income.net_profit,
    net_margin:         income.net_margin,
    total_expenses:     income.total_expenses,
    subscribers:        (subStats as any).rows[0],
  }
}

// ── Break-Even ────────────────────────────────────────────────────────────
export async function getBreakevenAnalysis(from: string, to: string) {
  const [income, fixedExpenses, trends] = await Promise.all([
    getIncomeStatement(from, to),
    db.execute(sql.raw(`
      SELECT account_code, expense_date, category, payment_method, amount, notes, vat_amount
      FROM expenses
      WHERE is_deleted = false AND expense_date >= '${from}' AND expense_date <= '${to}'
        AND expense_type = 'ثابت'
    `)),
    getPerformanceTrends(from, to)
  ])
  const fixedCostsList = fixedExpenses.rows as any[]
  const fixedCosts = fixedCostsList.reduce((s, r) => s + Number(r.amount), 0)
  const breakeven  = calculateBreakEven(income.revenue.total, income.cogs, fixedCosts)

  // Add cumulative revenue for target curve
  let cumulative = 0
  const series = trends.map(t => {
    cumulative += Number(t.revenue)
    return {
      date: t.date,
      revenue: t.revenue,
      cumulative,
      target: breakeven.breakEvenSales
    }
  })

  return { period: { from, to }, income_statement: income, ...breakeven, fixedCostsList, series }
}

// ── VAT Summary ───────────────────────────────────────────────────────────
export async function getVATSummary(from: string, to: string) {
  const [purchases, totalRevenue] = await Promise.all([
    db.execute(sql.raw(`
      SELECT COALESCE(SUM(vat_amount), 0) AS total_vat_input
      FROM purchase_invoices
      WHERE is_deleted = false AND invoice_date >= '${from}' AND invoice_date <= '${to}'
    `)),
    getRevenueSummary(from, to)
  ])
  const totalVATOutput = totalRevenue.grand_total * 0.15  // 15% on all revenue

  return {
    period:           { from, to },
    vat_input:        Number((purchases as any).rows?.[0]?.total_vat_input ?? 0),
    vat_output:       parseFloat(totalVATOutput.toFixed(4)),
    net_vat_payable:  parseFloat((totalVATOutput - Number((purchases as any).rows?.[0]?.total_vat_input ?? 0)).toFixed(4)),
  }
}

// ── Performance Trends ────────────────────────────────────────────────────
export async function getPerformanceTrends(from: string, to: string) {
  const [expenseRows, purchaseRows, revenueRows] = await Promise.all([
    db.execute(sql.raw(`
      SELECT TO_CHAR(expense_date, 'YYYY-MM-DD') as date, SUM(amount) as amount
      FROM expenses
      WHERE is_deleted = false AND expense_date >= '${from}' AND expense_date <= '${to}'
      GROUP BY TO_CHAR(expense_date, 'YYYY-MM-DD')
    `)),
    db.execute(sql.raw(`
      SELECT TO_CHAR(invoice_date, 'YYYY-MM-DD') as date, SUM(subtotal) as amount
      FROM purchase_invoices
      WHERE is_deleted = false AND invoice_date >= '${from}' AND invoice_date <= '${to}' AND is_asset = false
      GROUP BY TO_CHAR(invoice_date, 'YYYY-MM-DD')
    `)),
    db.execute(sql.raw(`
      SELECT TO_CHAR(je.entry_date, 'YYYY-MM-DD') as date, SUM(jel.credit_amount) - SUM(jel.debit_amount) as amount
      FROM journal_entry_lines jel
      JOIN journal_entries je ON je.id = jel.entry_id
      JOIN accounts a ON a.code = jel.account_code
      WHERE a.type = 'revenue' AND je.entry_date >= '${from}' AND je.entry_date <= '${to}' AND je.is_balanced = true
      GROUP BY TO_CHAR(je.entry_date, 'YYYY-MM-DD')
    `))
  ])

  const datesMap = new Map<string, { date: string, revenue: number, expenses: number, profit: number }>()

  const addData = (rows: any[], type: 'revenue' | 'expenses') => {
    for (const row of rows) {
      if (!row.date) continue
      if (!datesMap.has(row.date)) datesMap.set(row.date, { date: row.date, revenue: 0, expenses: 0, profit: 0 })
      const obj = datesMap.get(row.date)!
      obj[type] += Number(row.amount ?? 0)
      obj.profit = obj.revenue - obj.expenses
    }
  }

  addData(revenueRows.rows, 'revenue')
  addData(expenseRows.rows, 'expenses')
  addData(purchaseRows.rows, 'expenses')

  return Array.from(datesMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// ── Channel Analysis ──────────────────────────────────────────────────────
export async function getChannelAnalysis(from: string, to: string) {
  const delRows = await db.execute(sql.raw(`
    SELECT platform as channel, SUM(net_amount) as total, COUNT(*) as count
    FROM delivery_revenue WHERE is_deleted = false AND revenue_date >= '${from}' AND revenue_date <= '${to}' GROUP BY platform
  `))
  
  const restRow = await db.execute(sql.raw(`
    SELECT SUM(amount) as total, COUNT(*) as count
    FROM restaurant_revenue WHERE is_deleted = false AND revenue_date >= '${from}' AND revenue_date <= '${to}'
  `))
  
  const subRow = await db.execute(sql.raw(`
    SELECT SUM(amount) as total, COUNT(*) as count
    FROM subscription_revenue WHERE is_deleted = false AND revenue_date >= '${from}' AND revenue_date <= '${to}'
  `))

  const channels: any[] = []
  let totalRevenue = 0
  
  const add = (name: string, row: any) => {
    const t = Number(row?.total ?? 0); const c = Number(row?.count ?? 0)
    if (t > 0 || c > 0) {
      channels.push({ channel: name, total: t, count: c })
      totalRevenue += t
    }
  }

  const days = Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000))

  for (const r of delRows.rows as any[]) add(`توصيل - ${r.channel}`, r)
  add('مطعم محلي', (restRow.rows as any[])[0])
  add('اشتراكات', (subRow.rows as any[])[0])

  channels.forEach(ch => {
    ch.pct = totalRevenue > 0 ? (ch.total / totalRevenue) * 100 : 0
    ch.avg_per_day = ch.total / days
  })

  // Sort chunks by total descending
  channels.sort((a, b) => b.total - a.total)

  return { period: { from, to }, channels, totalRevenue }
}

// ── Waste Analysis ────────────────────────────────────────────────────────
export async function getWasteAnalysis(from: string, to: string) {
  const rows = await db.execute(sql.raw(`
    SELECT 
      product_name,
      SUM(produced_kg) as total_kg,
      SUM(waste_grams) as waste_g,
      SUM(waste_value) as waste_value
    FROM production
    WHERE is_deleted = false AND production_date >= '${from}' AND production_date <= '${to}'
    GROUP BY product_name
    ORDER BY SUM(waste_value) DESC
  `))

  const income = await getIncomeStatement(from, to)

  const items = (rows.rows as any[]).map(r => {
    const kg = Number(r.total_kg)
    const g = Number(r.waste_g)
    const totalGramsBuilt = (kg * 1000) + g
    const pct = totalGramsBuilt > 0 ? (g / totalGramsBuilt) * 100 : 0
    return {
      ...r, waste_pct: pct
    }
  })

  const totalWasteValue = items.reduce((s, r) => s + Number(r.waste_value), 0)
  const wastePctOfRevenue = income.revenue.total > 0 ? (totalWasteValue / income.revenue.total) * 100 : 0

  return {
    period: { from, to },
    items,
    totalWasteValue,
    wastePctOfRevenue,
    topWasteProduct: items.length > 0 ? items[0].product_name : null
  }
}

// ── Cash Flow ─────────────────────────────────────────────────────────────
export async function getCashFlow(from: string, to: string) {
  const income = await getIncomeStatement(from, to)
  
  const assetPurchases = await db.execute(sql.raw(`
    SELECT COALESCE(SUM(total_amount), 0) as total FROM purchase_invoices WHERE is_deleted = false AND is_asset = true AND invoice_date >= '${from}' AND invoice_date <= '${to}'
  `))
  
  const invTotal = -Number((assetPurchases.rows as any[])[0]?.total ?? 0)
  const opTotal = income.net_profit
  const finTotal = 0

  const trends = await getPerformanceTrends(from, to)
  const dailySeries = trends.map((t: any) => ({
    date: t.date,
    inflow: Math.max(0, t.revenue),
    outflow: Math.max(0, t.expenses)
  }))

  const operatingDetails: any[] = []
  
  if (income.revenue.restaurant > 0) operatingDetails.push({ description: 'إيرادات مطعم محلي', amount: income.revenue.restaurant })
  if (income.revenue.delivery > 0) operatingDetails.push({ description: 'إيرادات تطبيقات التوصيل', amount: income.revenue.delivery })
  if (income.revenue.subscriptions > 0) operatingDetails.push({ description: 'إيرادات الاشتراكات', amount: income.revenue.subscriptions })
  
  if (income.cogs > 0) operatingDetails.push({ description: 'تكلفة البضاعة المباعة (مشتريات مواد)', amount: -income.cogs })
  
  income.expenses.forEach((e: any) => {
    if (Number(e.total) > 0) {
      operatingDetails.push({ description: `مصروفات تشغيلية (${e.account_code})`, amount: -Number(e.total) })
    }
  })

  return {
    period: { from, to },
    operatingActivities: opTotal,
    investingActivities: invTotal,
    financingActivities: finTotal,
    operating: { details: operatingDetails },
    investing: {
      details: invTotal !== 0
        ? [{ description: 'شراء أصول ثابتة (معدات تقنية ومطابخ)', amount: invTotal }]
        : []
    },
    financing: { details: [] },
    dailySeries
  }
}
