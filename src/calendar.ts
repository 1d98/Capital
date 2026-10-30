import { addMonths, buildPaymentSchedule } from './schedule'
import type { Asset, Liability } from './types'

export type CalendarEventKind = 'liability' | 'deposit' | 'depositInterest' | 'investment'
export interface CalendarEvent {
  id: string
  date: string
  title: string
  kind: CalendarEventKind
  amount: number
}

const parseDate = (value: string) => {
  if (!value) return null
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}
const isoDate = (date: Date) => date.toISOString().slice(0, 10)
const daysBetween = (from: Date, to: Date) => Math.max(0, Math.round((to.getTime() - from.getTime()) / 86400000))

function depositEvents(asset: Asset): CalendarEvent[] {
  const maturity = parseDate(asset.payout_date)
  if (!maturity) return []
  const principal = asset.bynValue
  const maturityEvent = (amount: number): CalendarEvent => ({ id: `deposit-${asset.id}-${asset.payout_date}`, date: asset.payout_date, title: asset.name, kind: 'deposit', amount })
  const start = parseDate(asset.interest_start_date)
  const rate = Math.max(0, asset.expected_return)
  if (!start || start >= maturity || rate === 0) return [maturityEvent(principal)]

  const events: CalendarEvent[] = []
  const capitalization = Boolean(asset.capitalization)
  let capital = principal
  let periodStart = start
  for (let index = 1; index <= 1200 && periodStart < maturity; index += 1) {
    const scheduled = addMonths(start, index)
    const periodEnd = scheduled < maturity ? scheduled : maturity
    const interest = (capitalization ? capital : principal) * rate / 100 * daysBetween(periodStart, periodEnd) / 365
    const isMaturity = periodEnd.getTime() === maturity.getTime()
    if (capitalization) capital += interest
    if (isMaturity) {
      events.push(maturityEvent(capitalization ? capital : principal + interest))
      return events
    }
    if (!capitalization) events.push({ id: `deposit-interest-${asset.id}-${isoDate(periodEnd)}`, date: isoDate(periodEnd), title: asset.name, kind: 'depositInterest', amount: interest })
    periodStart = periodEnd
  }
  return [maturityEvent(capitalization ? capital : principal)]
}

export function calendarEventsForMonth(assets: Asset[], liabilities: Liability[], year: number, month: number) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const assetEvents = assets.flatMap(asset => {
    if (asset.category === 'deposit') return depositEvents(asset)
    if (asset.category === 'investment' && asset.payout_date) return [{ id: `investment-${asset.id}-${asset.payout_date}`, date: asset.payout_date, title: asset.name, kind: 'investment' as const, amount: asset.bynValue }]
    return []
  }).filter(event => event.date.startsWith(prefix))
  const liabilityEvents = liabilities.flatMap(liability => buildPaymentSchedule(liability).filter(payment => isoDate(payment.date).startsWith(prefix)).map(payment => {
    const date = isoDate(payment.date)
    return { id: `liability-${liability.id}-${date}`, date, title: liability.name, kind: 'liability' as const, amount: payment.payment }
  }))
  return [...assetEvents, ...liabilityEvents].sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind))
}
