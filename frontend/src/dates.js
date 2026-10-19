// Dates travel as local "YYYY-MM-DD" strings. Never use toISOString() here:
// it converts to UTC, so just after midnight in Paris it gives yesterday.
const pad = (n) => String(n).padStart(2, '0')

/** month is 0-11, like Date. */
export const iso = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`

export function todayIso() {
  const t = new Date()
  return iso(t.getFullYear(), t.getMonth(), t.getDate())
}

export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
export const weekday = (year, month, day) => new Date(year, month, day).getDay()
export const dayLetter = (year, month, day) => DAY_LETTERS[weekday(year, month, day)]
