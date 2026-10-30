import { describe, expect, it } from 'vitest'
import { buildPaymentSchedule } from '../src/schedule'

describe('loan payment schedule', () => {
  it('stops at full repayment and adjusts the final payment', () => {
    const rows = buildPaymentSchedule({ balance: 1000, interest_rate: 12, monthly_payment: 300, next_payment_date: '2026-11-15', end_date: '' })
    expect(rows).toHaveLength(4)
    expect(rows.at(-1)?.balance).toBe(0)
    expect(rows.at(-1)?.payment).toBeLessThan(300)
    expect(rows.reduce((sum, row) => sum + row.principal, 0)).toBeCloseTo(1000)
    expect(rows[0].payment).toBe(300)
    expect(rows[0].interest).toBeCloseTo(10.19, 2)
  })

  it('calculates the first partial period by actual days', () => {
    const rows = buildPaymentSchedule({ balance: 7193.35, interest_rate: 1, monthly_payment: 1442.27, next_payment_date: '2026-11-23', end_date: '', interest_start_date: '2026-11-15' })
    expect(rows[0].interest).toBeCloseTo(1.58, 2)
    expect(rows[0].principal).toBeCloseTo(1440.69, 2)
    expect(rows[0].balance).toBeCloseTo(5752.66, 2)
  })

  it('does not produce zero-balance rows', () => {
    const rows = buildPaymentSchedule({ balance: 7194, interest_rate: 1, monthly_payment: 1442, next_payment_date: '2026-11-01', end_date: '' })
    expect(rows).toHaveLength(6)
    expect(rows.at(-1)?.balance).toBe(0)
    expect(rows.at(-1)?.payment).toBeLessThan(1442)
    expect(rows.every(row => row.payment > 0)).toBe(true)
  })

  it('merges a sub-ruble remainder into the previous payment', () => {
    const rows = buildPaymentSchedule({ balance: 7194, interest_rate: 1, monthly_payment: 1442.27, next_payment_date: '2026-10-23', end_date: '' })
    expect(rows).toHaveLength(5)
    expect(rows.at(-1)?.balance).toBe(0)
    expect(rows.at(-1)?.payment).toBeCloseTo(1442.95, 2)
    expect(rows.every(row => row.payment > 0)).toBe(true)
  })

  it('handles month-end dates and invalid payments', () => {
    const rows = buildPaymentSchedule({ balance: 500, interest_rate: 0, monthly_payment: 100, next_payment_date: '2027-01-31', end_date: '' })
    expect(rows[1].date.getUTCMonth()).toBe(1)
    expect(rows[1].date.getUTCDate()).toBe(28)
    expect(buildPaymentSchedule({ balance: 100, interest_rate: 0, monthly_payment: 0, next_payment_date: '2027-01-31', end_date: '' })).toEqual([])
  })
})
