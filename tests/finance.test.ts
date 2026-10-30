import { describe, expect, it } from 'vitest'
import { historyForPeriod, project } from '../src/finance'

describe('forecast', () => {
  it('returns initial capital at zero horizon', () => expect(project(1000, 0, 100, 10)).toBe(1000))
  it('handles zero interest', () => expect(project(1000, 1, 100, 0)).toBe(2200))
  it('compounds capital and monthly contributions', () => {
    const result = project(1000, 1, 100, 12)
    expect(result).toBeCloseTo(2395.08, 2)
  })
})

describe('capital history', () => {
  const history = [
    { date: '2026-04-30', value: 100 },
    { date: '2026-07-28', value: 200 },
    { date: '2026-10-26', value: 300 },
    { date: '2026-10-27', value: 400 },
    { date: '2026-10-28', value: 500 },
  ]

  it('includes every snapshot within the selected months', () => {
    expect(historyForPeriod(history, 3)).toEqual(history.slice(1))
    expect(historyForPeriod(history, 6)).toEqual(history)
  })

  it('does not reduce a period to a fixed number of points', () => {
    expect(historyForPeriod(history.slice(1), 3)).toHaveLength(4)
  })

  it('handles calendar month boundaries', () => {
    expect(historyForPeriod(history, 7)[0].date).toBe('2026-04-30')
  })

  it('returns an empty history unchanged', () => {
    expect(historyForPeriod([], 12)).toEqual([])
  })
})
