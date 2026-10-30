import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
const require = createRequire(import.meta.url)
const { PortfolioDatabase } = require('../electron/database.cjs')

let db: InstanceType<typeof PortfolioDatabase>
let directory: string
beforeEach(() => {
  directory = path.join('.tmp', `crypto-${Date.now()}-${Math.random()}`)
  fs.mkdirSync(directory, { recursive: true })
  db = new PortfolioDatabase(path.join(directory, 'capital.db'))
  db.reset(false)
  db.saveAsset({ name: 'Bitcoin', category: 'crypto', institution: '', quantity: 0.5, unitPrice: 1, currency: 'USD', expectedReturn: 0, source: 'coingecko', notes: '', icon: 'crypto', cryptoId: 'bitcoin' })
})
afterEach(() => { vi.unstubAllGlobals(); db.close(); fs.rmSync(directory, { recursive: true, force: true }) })

describe('cryptocurrency rates', () => {
  it('applies CoinGecko price and converts it through NBRB', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      const body = url.includes('coingecko')
        ? { bitcoin: { usd: 60000 }, ethereum: { usd: 2500 }, tether: { usd: 1 }, 'usd-coin': { usd: 1 }, solana: { usd: 100 }, 'the-open-network': { usd: 2 } }
        : [{ Cur_Abbreviation: 'USD', Cur_OfficialRate: 3, Cur_Scale: 1, Date: '2026-01-01' }]
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
    }))
    const state = await db.refreshRates()
    const bitcoin = state.assets.find((asset: { category: string }) => asset.category === 'crypto')
    expect(bitcoin.unit_price).toBe(60000)
    expect(bitcoin.bynValue).toBe(90000)
    expect(state.cryptoRates.find((rate: { id: string }) => rate.id === 'bitcoin').price_usd).toBe(60000)
  })

  it('keeps last cached price when CoinGecko is offline', async () => {
    db.db.prepare('INSERT INTO crypto_rates VALUES (?,?,?)').run('bitcoin', 55000, '2026-01-01')
    db.db.prepare("UPDATE assets SET unit_price=55000 WHERE category='crypto'").run()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await db.refreshCryptoRates()).toContain('offline')
    expect(db.getState().assets[0].unit_price).toBe(55000)
  })

  it('uses schema v3 with crypto_id and crypto_rates', () => {
    expect(db.db.prepare("SELECT value FROM meta WHERE key='schema_version'").get().value).toBe('3')
    expect(db.db.prepare("SELECT name FROM pragma_table_info('assets') WHERE name='crypto_id'").get()).toBeDefined()
    expect(db.db.prepare('SELECT * FROM crypto_rates').all()).toEqual([])
  })
})
