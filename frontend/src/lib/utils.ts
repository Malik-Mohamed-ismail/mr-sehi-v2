/**
 * Format SAR amount — ALWAYS English digits (en-US locale).
 * → "22,747.78"
 */
export function formatSAR(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0)
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format date as DD/MM/YYYY — always English digits.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB')  // → "01/03/2026"
}

/**
 * Format percentage — always English digits.
 */
export function formatPct(n: number, decimals = 1): string {
  return `${(n * 100).toFixed(decimals)}%`
}

/**
 * Clamp number to a range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generate a CSS class string from conditional object.
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
