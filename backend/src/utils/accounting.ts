/**
 * Validates that journal entry lines are balanced (debit = credit ±0.001 SAR).
 */
export function validateJournalBalance(
  lines: Array<{ debit_amount: number | string; credit_amount: number | string }>
): { isBalanced: boolean; totalDebit: number; totalCredit: number; diff: number } {
  const totalDebit  = lines.reduce((s, l) => s + Number(l.debit_amount),  0)
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit_amount), 0)
  const diff        = Math.abs(totalDebit - totalCredit)
  return { isBalanced: diff <= 0.001, totalDebit, totalCredit, diff }
}

/**
 * Break-even analysis formula:
 * breakEvenSales = fixedCosts / grossMarginPct
 */
export function calculateBreakEven(
  totalRevenue: number,
  totalCOGS:    number,
  fixedCosts:   number
) {
  const grossProfit    = totalRevenue - totalCOGS
  const grossMarginPct = totalRevenue > 0 ? grossProfit / totalRevenue : 0
  const breakEvenSales = grossMarginPct > 0 ? fixedCosts / grossMarginPct : Infinity
  const safetyMarginSAR= totalRevenue - breakEvenSales
  const safetyMarginPct= totalRevenue > 0 ? safetyMarginSAR / totalRevenue : 0

  return {
    fixedCosts:        parseFloat(fixedCosts.toFixed(4)),
    grossMarginPct:    parseFloat(grossMarginPct.toFixed(4)),
    breakEvenSales:    isFinite(breakEvenSales) ? parseFloat(breakEvenSales.toFixed(4)) : null,
    currentRevenue:    totalRevenue,
    safetyMarginSAR:   parseFloat(safetyMarginSAR.toFixed(4)),
    safetyMarginPct:   parseFloat(safetyMarginPct.toFixed(4)),
    isBeyondBreakEven: totalRevenue > breakEvenSales,
  }
}

/**
 * Petty cash reconciliation:
 * closing = opening + replenishment − cashPurchases − cardPurchases
 */
export function reconcilePettyCash(t: {
  opening_balance:       number | string
  cashier_replenishment: number | string
  cash_purchases:        number | string
  card_purchases:        number | string
  closing_balance:       number | string
}) {
  const expected = Number(t.opening_balance)
                 + Number(t.cashier_replenishment)
                 - Number(t.cash_purchases)
                 - Number(t.card_purchases)

  const actual   = Number(t.closing_balance)
  const variance = parseFloat((actual - expected).toFixed(4))

  return {
    expected:   parseFloat(expected.toFixed(4)),
    actual,
    variance,
    isBalanced: Math.abs(variance) < 0.01,
  }
}
