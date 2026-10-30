import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
const require = createRequire(import.meta.url)
const { PortfolioDatabase } = require('../electron/database.cjs')

let db: InstanceType<typeof PortfolioDatabase>
let directory: string
beforeEach(() => {
  directory = path.join('.tmp', `test-${Date.now()}-${Math.random()}`)
  fs.mkdirSync(directory, { recursive: true })
  db = new PortfolioDatabase(path.join(directory, 'capital.db'))
})
afterEach(() => { vi.restoreAllMocks(); db.close(); fs.rmSync(directory, { recursive: true, force: true }) })

describe('portfolio database', () => {
  it('seeds and calculates BYN metrics', () => {
    const state = db.getState()
    expect(state.assets).toHaveLength(6)
    expect(state.liabilities).toHaveLength(2)
    expect(state.metrics.assets).toBeCloseTo(450227.5)
    expect(state.metrics.netWorth).toBeCloseTo(375027.5)
  })

  it('creates, updates and deletes assets with history', () => {
    const asset = { name: 'Test deposit', category: 'deposit', institution: 'Bank', quantity: 100, unitPrice: 2, currency: 'USD', expectedReturn: 5, source: 'manual', notes: '', icon: 'bank', payoutDate: '2027-01-15', interestStartDate: '2026-10-15', capitalization: true }
    const created = db.saveAsset(asset)
    const id = created.assets.find((item: { name: string }) => item.name === asset.name).id
    expect(created.assets.find((item: { id: number }) => item.id === id).bynValue).toBeCloseTo(583.4)
    expect(created.assets.find((item: { id: number }) => item.id === id).payout_date).toBe('2027-01-15')
    expect(created.assets.find((item: { id: number }) => item.id === id).interest_start_date).toBe('2026-10-15')
    expect(created.assets.find((item: { id: number }) => item.id === id).capitalization).toBe(1)
    const updated = db.saveAsset({ ...asset, id, unitPrice: 3 })
    expect(updated.assets.find((item: { id: number }) => item.id === id).bynValue).toBeCloseTo(875.1)
    const deleted = db.deleteAsset(id)
    expect(deleted.assets.some((item: { id: number }) => item.id === id)).toBe(false)
    expect(deleted.history.at(-1).net_worth).toBeCloseTo(deleted.metrics.netWorth)
  })

  it('applies loan payments to interest and principal and advances dates', () => {
    db.reset(false)
    const created = db.saveLiability({ name: 'Test loan', institution: '', principal: 1000, balance: 1000, interestRate: 12, monthlyPayment: 400, nextPaymentDate: '2026-11-15', endDate: '', interestStartDate: '2026-10-15', notes: '' })
    const before = created.liabilities[0]
    const interest = 1000 * 0.12 * 31 / 365
    const after = db.payLiability(before.id, { amount: 400 })
    const paid = after.liabilities.find((item: { id: number }) => item.id === before.id)
    expect(paid.balance).toBeCloseTo(1000 - (400 - interest))
    expect(paid.next_payment_date).toBe('2026-12-15')
    expect(paid.interest_start_date).toBe('2026-11-15')
    expect(() => db.payLiability(before.id, { amount: 999999 })).toThrow()
  })

  it('allows the final payment including interest and clears upcoming dates', () => {
    db.reset(false)
    const created = db.saveLiability({ name: 'Final loan', institution: '', principal: 100, balance: 100, interestRate: 12, monthlyPayment: 100, nextPaymentDate: '2026-11-15', endDate: '', interestStartDate: '2026-10-15', notes: '' })
    const before = created.liabilities[0]
    const total = 100 + 100 * 0.12 * 31 / 365
    const after = db.payLiability(before.id, { amount: total })
    expect(after.liabilities[0].balance).toBe(0)
    expect(after.liabilities[0].next_payment_date).toBe('')
    expect(after.liabilities[0].interest_start_date).toBe('')
  })

  it('persists the external request preference and blocks network access', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network should not be called'))
    expect(db.getState().externalRequests).toBe(true)
    expect(db.setExternalRequests(false).externalRequests).toBe(false)
    const state = await db.refreshRates()
    expect(state.rateStatus).toBe('offline')
    expect(state.rateError).toContain('отключены')
    expect(await db.refreshCryptoRates()).toContain('отключены')
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(db.reset(false).externalRequests).toBe(false)
  })

  it('exports and imports a complete backup into a fresh database', () => {
    db.db.prepare('INSERT INTO rates VALUES (?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET rate=excluded.rate,scale=excluded.scale,rate_date=excluded.rate_date,fetched_at=excluded.fetched_at').run('USD', 9.8765, 1, '2026-10-27', '2026-10-27T10:00:00Z')
    const backup = db.exportData()
    const restoredDb = new PortfolioDatabase(path.join(directory, 'restored.db'))
    try {
      const restored = restoredDb.importData(backup)
      expect(restored.assets).toHaveLength(6)
      expect(restored.liabilities).toHaveLength(2)
      expect(restored.rates.find((rate: { code: string }) => rate.code === 'USD').rate).toBe(9.8765)
      expect(restored.assets.find((asset: { name: string }) => asset.name === 'Валютный вклад').bynValue).toBeCloseTo(172838.75)
      expect(restored.metrics.netWorth).toBeCloseTo(496818.75)
    } finally { restoredDb.close() }
  })

  it('rejects invalid imports and assets', () => {
    expect(() => db.importData({ format: 'other' })).toThrow()
    expect(() => db.saveAsset({ name: '', category: 'deposit' })).toThrow()
    expect(() => db.saveAsset({ name: 'Bad', category: 'unknown', quantity: 1, unitPrice: 1, currency: 'BYN' })).toThrow()
  })
})
