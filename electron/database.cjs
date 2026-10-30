const Database = require('better-sqlite3')
const fs = require('node:fs')
const path = require('node:path')

const categories = ['property', 'deposit', 'investment', 'cash', 'vehicle', 'crypto', 'other']
const currencies = ['BYN', 'USD', 'EUR', 'RUB', 'CNY', 'PLN']
const now = () => new Date().toISOString()
const today = () => now().slice(0, 10)
const cleanText = (value, max = 300) => String(value ?? '').trim().slice(0, max)
const positive = (value, fallback = 0) => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : fallback
const addMonths = (value, count) => {
  const date = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + count
  const day = date.getUTCDate()
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(Date.UTC(year, month, Math.min(day, lastDay), 12)).toISOString().slice(0, 10)
}
const daysBetween = (from, to) => Math.max(0, Math.round((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86400000))

class PortfolioDatabase {
  constructor(filename) {
    fs.mkdirSync(path.dirname(filename), { recursive: true })
    this.db = new Database(filename)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this.migrate()
    if (this.db.prepare('SELECT value FROM meta WHERE key = ?').get('initialized') === undefined) this.reset(true)
  }

  migrate() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS assets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, institution TEXT NOT NULL DEFAULT '', quantity REAL NOT NULL, unit_price REAL NOT NULL, currency TEXT NOT NULL, expected_return REAL NOT NULL DEFAULT 0, source TEXT NOT NULL DEFAULT 'manual', notes TEXT NOT NULL DEFAULT '', icon TEXT NOT NULL DEFAULT 'cash', updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS liabilities (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, institution TEXT NOT NULL DEFAULT '', principal REAL NOT NULL, balance REAL NOT NULL, interest_rate REAL NOT NULL DEFAULT 0, monthly_payment REAL NOT NULL DEFAULT 0, next_payment_date TEXT NOT NULL DEFAULT '', end_date TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '');
      CREATE TABLE IF NOT EXISTS snapshots (date TEXT PRIMARY KEY, assets REAL NOT NULL, liabilities REAL NOT NULL, net_worth REAL NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS rates (code TEXT PRIMARY KEY, rate REAL NOT NULL, scale INTEGER NOT NULL, rate_date TEXT NOT NULL, fetched_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS crypto_rates (id TEXT PRIMARY KEY, price_usd REAL NOT NULL, updated_at TEXT NOT NULL);`)
    if (!this.db.prepare("SELECT name FROM pragma_table_info('assets') WHERE name='crypto_id'").get()) this.db.exec("ALTER TABLE assets ADD COLUMN crypto_id TEXT NOT NULL DEFAULT ''")
    if (!this.db.prepare("SELECT name FROM pragma_table_info('assets') WHERE name='payout_date'").get()) this.db.exec("ALTER TABLE assets ADD COLUMN payout_date TEXT NOT NULL DEFAULT ''")
    if (!this.db.prepare("SELECT name FROM pragma_table_info('assets') WHERE name='interest_start_date'").get()) this.db.exec("ALTER TABLE assets ADD COLUMN interest_start_date TEXT NOT NULL DEFAULT ''")
    if (!this.db.prepare("SELECT name FROM pragma_table_info('assets') WHERE name='capitalization'").get()) this.db.exec("ALTER TABLE assets ADD COLUMN capitalization INTEGER NOT NULL DEFAULT 0")
    if (!this.db.prepare("SELECT name FROM pragma_table_info('liabilities') WHERE name='interest_start_date'").get()) this.db.exec("ALTER TABLE liabilities ADD COLUMN interest_start_date TEXT NOT NULL DEFAULT ''")
    this.db.prepare("INSERT INTO meta (key,value) VALUES ('schema_version','3') ON CONFLICT(key) DO UPDATE SET value='3'").run()
  }

  seed() {
    const assets = [
      ['Квартира в Минске', 'property', 'ул. Кальварийская, 54 м²', 1, 264500, 'BYN', 3.2, 'home'],
      ['Валютный вклад', 'deposit', 'Беларусбанк · до 12.2027', 17500, 1, 'USD', 4.8, 'bank'],
      ['Сберегательный вклад', 'deposit', 'Белинвестбанк · 13,5% годовых', 1, 32800, 'BYN', 13.5, 'bank'],
      ['Облигации РБ', 'investment', '12 выпусков · доходность 12,1%', 1, 24760, 'BYN', 12.1, 'chart'],
      ['Автомобиль', 'vehicle', 'Volkswagen Tiguan · 2021', 1, 58400, 'BYN', -2.4, 'car'],
      ['Наличные и счета', 'cash', 'BYN, USD и EUR', 1, 18720, 'BYN', 0.4, 'cash'],
    ]
    const insert = this.db.prepare('INSERT INTO assets (name,category,institution,quantity,unit_price,currency,expected_return,source,notes,icon,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    for (const asset of assets) insert.run(...asset.slice(0, 7), 'manual', '', asset[7], now())
    const loan = this.db.prepare('INSERT INTO liabilities (name,institution,principal,balance,interest_rate,monthly_payment,next_payment_date,end_date,notes) VALUES (?,?,?,?,?,?,?,?,?)')
    loan.run('Ипотека', 'Беларусбанк', 132000, 68400, 9.5, 1240, '2026-10-28', '2032-06-01', '')
    loan.run('Кредитная карта', 'Белинвестбанк', 10000, 6800, 14.9, 850, '2026-10-30', '2027-08-01', '')
    const history = [302100,308400,312900,316200,323800,329500,337100,341800,348600,356900,365300]
    history.forEach((value, index) => this.db.prepare('INSERT INTO snapshots VALUES (?,?,?,?,?)').run(new Date(Date.UTC(2025, 10 + index, 1)).toISOString().slice(0, 10), value + 70000, 70000, value, now()))
    this.db.prepare("UPDATE meta SET value='true' WHERE key='demo_mode'").run()
  }

  reset(demo = false) {
    const externalRequests = this.externalRequestsEnabled()
    this.db.transaction(() => {
      for (const table of ['assets', 'liabilities', 'snapshots', 'meta']) this.db.prepare(`DELETE FROM ${table}`).run()
      this.db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('assets','liabilities')").run()
      this.db.prepare('INSERT INTO meta VALUES (?,?)').run('schema_version', '3')
      this.db.prepare('INSERT INTO meta VALUES (?,?)').run('initialized', 'true')
      this.db.prepare('INSERT INTO meta VALUES (?,?)').run('demo_mode', 'false')
      this.db.prepare('INSERT INTO meta VALUES (?,?)').run('external_requests', String(externalRequests))
      if (demo) this.seed()
      this.recordSnapshot()
    })()
    return this.getState()
  }

  externalRequestsEnabled() {
    return this.db.prepare("SELECT value FROM meta WHERE key='external_requests'").get()?.value !== 'false'
  }

  setExternalRequests(enabled) {
    this.db.prepare("INSERT INTO meta (key,value) VALUES ('external_requests',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(String(Boolean(enabled)))
    return this.getState()
  }

  rates() {
    const stored = Object.fromEntries(this.db.prepare('SELECT * FROM rates').all().map(row => [row.code, row]))
    return Object.fromEntries(['BYN', ...currencies.filter(c => c !== 'BYN')].map(code => [code, stored[code] || { code, rate: code === 'BYN' ? 1 : ({ USD: 2.917, EUR: 3.4012, RUB: 3.6115, CNY: .4097, PLN: .798 })[code], scale: code === 'RUB' ? 100 : 1, rate_date: '', fetched_at: '' }]))
  }

  convert(amount, currency) {
    const rate = this.rates()[currency]
    return rate ? amount * rate.rate / rate.scale : amount
  }

  metrics() {
    const assets = this.db.prepare('SELECT * FROM assets').all()
    const assetsTotal = assets.reduce((sum, asset) => sum + this.convert(asset.quantity * asset.unit_price, asset.currency), 0)
    const debt = this.db.prepare('SELECT COALESCE(SUM(balance),0) value FROM liabilities').get().value
    const liquid = assets.filter(a => ['deposit','investment','cash'].includes(a.category)).reduce((sum, a) => sum + this.convert(a.quantity * a.unit_price, a.currency), 0)
    const foreign = assets.filter(a => a.currency !== 'BYN').reduce((sum, a) => sum + this.convert(a.quantity * a.unit_price, a.currency), 0)
    return { assets: assetsTotal, liabilities: debt, netWorth: assetsTotal - debt, liquid, foreignShare: assetsTotal ? foreign / assetsTotal * 100 : 0, debtShare: assetsTotal ? debt / assetsTotal * 100 : 0 }
  }

  recordSnapshot() {
    const metrics = this.metrics()
    this.db.prepare('INSERT OR REPLACE INTO snapshots VALUES (?,?,?,?,?)').run(today(), metrics.assets, metrics.liabilities, metrics.netWorth, now())
  }

  getState() {
    const assets = this.db.prepare('SELECT * FROM assets ORDER BY updated_at DESC, id DESC').all().map(asset => ({ ...asset, value: asset.quantity * asset.unit_price, bynValue: this.convert(asset.quantity * asset.unit_price, asset.currency) }))
    const liabilities = this.db.prepare('SELECT * FROM liabilities ORDER BY balance DESC').all()
    return {
      assets, liabilities,
      history: this.db.prepare('SELECT * FROM snapshots ORDER BY date').all(),
      rates: Object.values(this.rates()),
      cryptoRates: this.db.prepare('SELECT * FROM crypto_rates').all(),
      metrics: this.metrics(),
      demoMode: this.db.prepare("SELECT value FROM meta WHERE key='demo_mode'").get()?.value === 'true',
      externalRequests: this.externalRequestsEnabled(),
      lastSync: this.db.prepare('SELECT MAX(fetched_at) value FROM rates').get().value || null,
      lastCryptoSync: this.db.prepare('SELECT MAX(updated_at) value FROM crypto_rates').get().value || null,
    }
  }

  validateAsset(input) {
    const asset = {
      name: cleanText(input.name, 120), category: cleanText(input.category, 30), institution: cleanText(input.institution, 160),
      quantity: positive(input.quantity, NaN), unit_price: positive(input.unitPrice ?? input.unit_price, NaN), currency: cleanText(input.currency, 3).toUpperCase(),
      expected_return: Number(input.expectedReturn ?? input.expected_return ?? 0), source: cleanText(input.source || 'manual', 40), notes: cleanText(input.notes, 2000), icon: cleanText(input.icon || 'cash', 20), crypto_id: cleanText(input.cryptoId ?? input.crypto_id, 60), payout_date: cleanText(input.payoutDate ?? input.payout_date, 10), interest_start_date: cleanText(input.interestStartDate ?? input.interest_start_date, 10), capitalization: input.capitalization ? 1 : 0,
    }
    if (asset.category === 'crypto' && !asset.crypto_id) throw new Error('Выберите криптовалюту')
    if (!asset.name) throw new Error('Укажите название актива')
    if (!categories.includes(asset.category)) throw new Error('Неизвестная категория')
    if (!currencies.includes(asset.currency)) throw new Error('Неизвестная валюта')
    if (!Number.isFinite(asset.quantity) || !Number.isFinite(asset.unit_price) || asset.quantity <= 0) throw new Error('Количество и цена должны быть больше нуля')
    if (!Number.isFinite(asset.expected_return) || Math.abs(asset.expected_return) > 1000) throw new Error('Некорректная доходность')
    if (asset.payout_date && !addMonths(asset.payout_date, 0)) throw new Error('Некорректная дата погашения')
    if (asset.interest_start_date && !addMonths(asset.interest_start_date, 0)) throw new Error('Некорректная дата начисления процентов')
    return asset
  }

  saveAsset(input) {
    const asset = this.validateAsset(input)
    if (input.id) {
      const result = this.db.prepare('UPDATE assets SET name=?,category=?,institution=?,quantity=?,unit_price=?,currency=?,expected_return=?,source=?,notes=?,icon=?,crypto_id=?,payout_date=?,interest_start_date=?,capitalization=?,updated_at=? WHERE id=?').run(...Object.values(asset), now(), input.id)
      if (!result.changes) throw new Error('Актив не найден')
    } else this.db.prepare('INSERT INTO assets (name,category,institution,quantity,unit_price,currency,expected_return,source,notes,icon,crypto_id,payout_date,interest_start_date,capitalization,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(...Object.values(asset), now())
    this.db.prepare("INSERT INTO meta (key,value) VALUES ('demo_mode','false') ON CONFLICT(key) DO UPDATE SET value='false'").run()
    this.recordSnapshot()
    return this.getState()
  }

  deleteAsset(id) {
    this.db.prepare('DELETE FROM assets WHERE id=?').run(id)
    this.recordSnapshot()
    return this.getState()
  }

  validateLiability(input) {
    const item = { name: cleanText(input.name, 120), institution: cleanText(input.institution, 160), principal: positive(input.principal, NaN), balance: positive(input.balance, NaN), interest_rate: positive(input.interestRate ?? input.interest_rate, NaN), monthly_payment: positive(input.monthlyPayment ?? input.monthly_payment, NaN), next_payment_date: cleanText(input.nextPaymentDate ?? input.next_payment_date, 10), end_date: cleanText(input.endDate ?? input.end_date, 10), interest_start_date: cleanText(input.interestStartDate ?? input.interest_start_date, 10), notes: cleanText(input.notes, 2000) }
    if (!item.name || !Number.isFinite(item.principal) || !Number.isFinite(item.balance) || item.principal <= 0 || item.balance > item.principal) throw new Error('Проверьте название и суммы кредита')
    if (![item.interest_rate,item.monthly_payment].every(Number.isFinite) || item.interest_rate > 1000) throw new Error('Проверьте ставку и платёж')
    return item
  }

  saveLiability(input) {
    const item = this.validateLiability(input)
    if (input.id) {
      const result = this.db.prepare('UPDATE liabilities SET name=?,institution=?,principal=?,balance=?,interest_rate=?,monthly_payment=?,next_payment_date=?,end_date=?,interest_start_date=?,notes=? WHERE id=?').run(...Object.values(item), input.id)
      if (!result.changes) throw new Error('Обязательство не найдено')
    } else this.db.prepare('INSERT INTO liabilities (name,institution,principal,balance,interest_rate,monthly_payment,next_payment_date,end_date,interest_start_date,notes) VALUES (?,?,?,?,?,?,?,?,?,?)').run(...Object.values(item))
    this.recordSnapshot()
    return this.getState()
  }

  deleteLiability(id) {
    this.db.prepare('DELETE FROM liabilities WHERE id=?').run(id)
    this.recordSnapshot()
    return this.getState()
  }

  payLiability(id, input) {
    const amount = positive(input.amount, NaN)
    const loan = this.db.prepare('SELECT * FROM liabilities WHERE id=?').get(id)
    if (!loan || !Number.isFinite(amount) || amount <= 0) throw new Error('Некорректная сумма платежа')
    const paymentDate = loan.next_payment_date || today()
    if (!addMonths(paymentDate, 0)) throw new Error('Некорректная дата платежа')
    const interestStartDate = loan.interest_start_date && addMonths(loan.interest_start_date, 0) ? loan.interest_start_date : addMonths(paymentDate, -1)
    const interest = loan.balance * loan.interest_rate / 100 * daysBetween(interestStartDate, paymentDate) / 365
    if (amount > loan.balance + interest) throw new Error('Платёж превышает остаток долга и проценты')
    const principal = amount - interest
    if (principal <= 0) throw new Error('Платёж должен покрывать начисленные проценты')
    const balance = Math.max(0, loan.balance - principal)
    const nextPaymentDate = balance > 0.005 ? addMonths(paymentDate, 1) : ''
    this.db.transaction(() => {
      this.db.prepare('UPDATE liabilities SET balance=?,next_payment_date=?,interest_start_date=? WHERE id=?').run(nextPaymentDate ? balance : 0, nextPaymentDate, nextPaymentDate ? paymentDate : '', id)
      this.recordSnapshot()
    })()
    return this.getState()
  }

  async refreshCryptoRates() {
    if (!this.externalRequestsEnabled()) return 'Внешние запросы отключены в настройках'
    const ids = ['bitcoin', 'ethereum', 'tether', 'usd-coin', 'solana', 'the-open-network']
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`, { signal: controller.signal, headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error(`CoinGecko: HTTP ${response.status}`)
      const data = await response.json()
      const timestamp = now()
      this.db.transaction(() => {
        for (const id of ids) {
          const price = Number(data[id]?.usd)
          if (!Number.isFinite(price) || price <= 0) continue
          this.db.prepare('INSERT INTO crypto_rates VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET price_usd=excluded.price_usd,updated_at=excluded.updated_at').run(id, price, timestamp)
          this.db.prepare("UPDATE assets SET unit_price=?,updated_at=? WHERE category='crypto' AND source='coingecko' AND crypto_id=? AND currency='USD'").run(price, timestamp, id)
        }
      })()
      this.recordSnapshot()
      return null
    } catch (error) { return error instanceof Error ? error.message : String(error) }
    finally { clearTimeout(timer) }
  }

  async refreshRates() {
    if (!this.externalRequestsEnabled()) return { ...this.getState(), rateStatus: 'offline', rateError: 'Внешние запросы отключены в настройках' }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch('https://api.nbrb.by/exrates/rates?periodicity=0', { signal: controller.signal, headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error(`НБРБ: HTTP ${response.status}`)
      const data = await response.json()
      const wanted = data.filter(item => currencies.includes(item.Cur_Abbreviation))
      if (!wanted.length) throw new Error('НБРБ вернул пустой ответ')
      const update = this.db.prepare('INSERT INTO rates (code,rate,scale,rate_date,fetched_at) VALUES (?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET rate=excluded.rate,scale=excluded.scale,rate_date=excluded.rate_date,fetched_at=excluded.fetched_at')
      this.db.transaction(() => wanted.forEach(item => update.run(item.Cur_Abbreviation, item.Cur_OfficialRate, item.Cur_Scale, item.Date, now())))()
      const cryptoError = await this.refreshCryptoRates()
      this.recordSnapshot()
      return { ...this.getState(), rateStatus: cryptoError ? 'offline' : 'online', rateError: cryptoError || undefined }
    } catch (error) {
      return { ...this.getState(), rateStatus: 'offline', rateError: error instanceof Error ? error.message : String(error) }
    } finally { clearTimeout(timer) }
  }

  exportData() {
    return { format: 'capital-backup', version: 1, exportedAt: now(), assets: this.db.prepare('SELECT * FROM assets').all(), liabilities: this.db.prepare('SELECT * FROM liabilities').all(), snapshots: this.db.prepare('SELECT * FROM snapshots').all(), rates: this.db.prepare('SELECT * FROM rates').all(), cryptoRates: this.db.prepare('SELECT * FROM crypto_rates').all() }
  }

  importData(data) {
    if (data?.format !== 'capital-backup' || data.version !== 1 || !Array.isArray(data.assets) || !Array.isArray(data.liabilities)) throw new Error('Некорректный файл резервной копии')
    if (data.assets.length > 10000 || data.liabilities.length > 10000) throw new Error('Слишком много записей')
    const assets = data.assets.map(item => this.validateAsset(item))
    const liabilities = data.liabilities.map(item => this.validateLiability(item))
    this.db.transaction(() => {
      this.db.prepare('DELETE FROM assets').run(); this.db.prepare('DELETE FROM liabilities').run(); this.db.prepare('DELETE FROM snapshots').run()
      const asset = this.db.prepare('INSERT INTO assets (name,category,institution,quantity,unit_price,currency,expected_return,source,notes,icon,crypto_id,payout_date,interest_start_date,capitalization,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      assets.forEach(item => asset.run(...Object.values(item), now()))
      this.db.prepare('DELETE FROM rates').run()
      const rate = this.db.prepare('INSERT INTO rates VALUES (?,?,?,?,?)')
      if (Array.isArray(data.rates)) data.rates.slice(0, currencies.length).forEach(item => {
        if (currencies.includes(item.code) && Number.isFinite(item.rate) && item.rate > 0 && Number.isInteger(item.scale) && item.scale > 0) rate.run(item.code, item.rate, item.scale, cleanText(item.rate_date, 40), cleanText(item.fetched_at, 40))
      })
      this.db.prepare('DELETE FROM crypto_rates').run()
      const cryptoRate = this.db.prepare('INSERT INTO crypto_rates VALUES (?,?,?)')
      if (Array.isArray(data.cryptoRates)) data.cryptoRates.slice(0, 100).forEach(item => { if (typeof item.id === 'string' && Number.isFinite(item.price_usd) && item.price_usd > 0) cryptoRate.run(item.id, item.price_usd, item.updated_at || now()) })
      const liability = this.db.prepare('INSERT INTO liabilities (name,institution,principal,balance,interest_rate,monthly_payment,next_payment_date,end_date,interest_start_date,notes) VALUES (?,?,?,?,?,?,?,?,?,?)')
      liabilities.forEach(item => liability.run(...Object.values(item)))
      const snapshots = Array.isArray(data.snapshots) ? data.snapshots.slice(0, 5000) : []
      const snapshot = this.db.prepare('INSERT INTO snapshots VALUES (?,?,?,?,?)')
      snapshots.forEach(item => { if (/^\d{4}-\d{2}-\d{2}$/.test(item.date) && [item.assets,item.liabilities,item.net_worth].every(Number.isFinite)) snapshot.run(item.date,item.assets,item.liabilities,item.net_worth,now()) })
      this.db.prepare("INSERT INTO meta (key,value) VALUES ('demo_mode','false') ON CONFLICT(key) DO UPDATE SET value='false'").run()
      this.recordSnapshot()
    })()
    return this.getState()
  }

  close() { this.db.close() }
}

module.exports = { PortfolioDatabase, currencies, categories }
