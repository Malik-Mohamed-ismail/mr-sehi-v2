/**
 * Returns the start and end of a given month.
 */
export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1)
  const end   = new Date(year, month, 0)
  return {
    from: start.toISOString().split('T')[0],
    to:   end.toISOString().split('T')[0],
  }
}

/**
 * Returns the start and end of the current month.
 */
export function getCurrentMonthRange() {
  const now = new Date()
  return getMonthRange(now.getFullYear(), now.getMonth() + 1)
}

/**
 * Returns the start and end of the current year.
 */
export function getCurrentYearRange() {
  const year = new Date().getFullYear()
  return {
    from: `${year}-01-01`,
    to:   `${year}-12-31`,
  }
}

/**
 * Parse a YYYY-MM-DD date string as a Date (at midnight UTC).
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00.000Z')
}

/**
 * Format a Date to YYYY-MM-DD string.
 */
export function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Returns today's date as YYYY-MM-DD in Saudi time (Asia/Riyadh).
 */
export function todaySaudi(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' })
}
