/**
 * Format a number as SAR currency — always English digits (en-US locale).
 * → "22,747.78 ر.س"
 */
export function formatSAR(amount: number): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`
}

/**
 * Format date as DD/MM/YYYY — always English digits.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB')
}

/**
 * Format a ratio as percentage string — always English digits.
 */
export function formatPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`
}
