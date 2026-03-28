import { env } from '../config/env.js'

export const VAT_RATE = env.VAT_RATE  // 0.15 — ZATCA Saudi VAT

/**
 * Returns true when a supplier's VAT number is valid and non-empty.
 * Suppliers without a VAT number (e.g. العزيزية vegetable market) are exempt.
 */
export function supplierHasVAT(vatNumber: string | null | undefined): boolean {
  if (!vatNumber) return false
  const trimmed = vatNumber.trim()
  return trimmed.length > 0 && trimmed !== '0'
}

export interface VATResult {
  subtotal:   number
  vatAmount:  number
  total:      number
  hasVAT:     boolean
  vatRate:    number
}

/**
 * Calculate VAT on a subtotal amount.
 * Always returns 4-decimal precision to match decimal(12,4) column.
 */
export function calculateVAT(subtotal: number, hasVAT: boolean): VATResult {
  if (!hasVAT) {
    return {
      subtotal,
      vatAmount: 0,
      total:     subtotal,
      hasVAT:    false,
      vatRate:   0,
    }
  }
  const vatAmount = parseFloat((subtotal * VAT_RATE).toFixed(4))
  const total     = parseFloat((subtotal + vatAmount).toFixed(4))
  return { subtotal, vatAmount, total, hasVAT: true, vatRate: VAT_RATE }
}

/**
 * Validate that submitted VAT amount matches server-computed amount (±0.01 tolerance).
 */
export function validateVATMatch(
  computedVat: number,
  submittedVat: number,
  tolerance = 0.01
): boolean {
  return Math.abs(computedVat - submittedVat) <= tolerance
}
