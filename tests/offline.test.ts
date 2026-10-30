import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRequire } from 'node:module'
import fs from 'node:fs'
const require = createRequire(import.meta.url)
const { PortfolioDatabase } = require('../electron/database.cjs')

afterEach(() => { vi.unstubAllGlobals(); fs.rmSync('.tmp/offline.db', { force: true }) })
describe('offline rates', () => {
  it('keeps cached rates when NBRB is unavailable', async () => {
    fs.mkdirSync('.tmp', { recursive: true })
    const db = new PortfolioDatabase('.tmp/offline.db')
    db.db.prepare('INSERT INTO rates VALUES (?,?,?,?,?)').run('USD', 2.9, 1, '2026-01-01', '2026-01-01')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const state = await db.refreshRates()
    expect(state.rateStatus).toBe('offline')
    expect(state.rates.find((rate: { code: string }) => rate.code === 'USD').rate).toBe(2.9)
    expect(state.metrics.assets).toBeGreaterThan(0)
    db.close()
  })
})
