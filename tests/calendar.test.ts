import { describe, expect, it } from 'vitest'
import { calendarEventsForMonth } from '../src/calendar'
import type { Asset, Liability } from '../src/types'

const asset = (overrides: Partial<Asset>): Asset => ({ id: 1, name: 'Вклад', category: 'deposit', institution: '', quantity: 1, unit_price: 1000, currency: 'BYN', expected_return: 5, source: 'manual', notes: '', icon: 'bank', crypto_id: '', payout_date: '', interest_start_date: '', capitalization: 0, updated_at: '', value: 1000, bynValue: 1000, ...overrides })
const liability = (overrides: Partial<Liability>): Liability => ({ id: 1, name: 'Кредит', institution: '', principal: 1000, balance: 1000, interest_rate: 0, monthly_payment: 300, next_payment_date: '2026-11-15', end_date: '', interest_start_date: '', notes: '', ...overrides })
const allEvents = (assets: Asset[]) => [0, 1, 2, 3].flatMap(month => calendarEventsForMonth(assets, [], 2026, month))

describe('calendar events', () => {
  it('includes deposit and investment maturities only in their month', () => {
    const assets = [asset({ payout_date: '2026-11-20' }), asset({ id: 2, name: 'Облигации', category: 'investment', icon: 'chart', payout_date: '2026-11-25' }), asset({ id: 3, payout_date: '2026-12-01' })]
    const events = calendarEventsForMonth(assets, [], 2026, 10)
    expect(events.map(event => event.title)).toEqual(['Вклад', 'Облигации'])
    expect(events.map(event => event.kind)).toEqual(['deposit', 'investment'])
  })

  it('pays monthly interest without capitalization and returns principal at maturity', () => {
    const events = allEvents([asset({ bynValue: 10000, expected_return: 12, interest_start_date: '2026-01-01', payout_date: '2026-04-01' })])
    expect(events).toHaveLength(3)
    expect(events[0]).toMatchObject({ date: '2026-02-01', kind: 'depositInterest' })
    expect(events[0].amount).toBeCloseTo(10000 * 0.12 * 31 / 365, 2)
    expect(events[1].amount).toBeCloseTo(10000 * 0.12 * 28 / 365, 2)
    expect(events[2]).toMatchObject({ date: '2026-04-01', kind: 'deposit' })
    expect(events[2].amount).toBeCloseTo(10000 + 10000 * 0.12 * 31 / 365, 2)
  })

  it('capitalizes monthly interest into the maturity amount', () => {
    const events = allEvents([asset({ bynValue: 10000, expected_return: 12, interest_start_date: '2026-01-01', payout_date: '2026-04-01', capitalization: 1 })])
    expect(events).toHaveLength(1)
    expect(events[0].kind).toBe('deposit')
    expect(events[0].amount).toBeCloseTo(10000 * (1 + 0.12 * 31 / 365) * (1 + 0.12 * 28 / 365) * (1 + 0.12 * 31 / 365), 2)
  })

  it('uses the real liability schedule', () => {
    const events = calendarEventsForMonth([], [liability({})], 2026, 10)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ date: '2026-11-15', amount: 300, kind: 'liability' })
    expect(calendarEventsForMonth([], [liability({})], 2027, 1)).toHaveLength(1)
  })

  it('ignores assets without a maturity and repaid liabilities', () => {
    expect(calendarEventsForMonth([asset({})], [liability({ balance: 0 })], 2026, 10)).toEqual([])
  })
})
