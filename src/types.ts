export type Page = 'overview' | 'assets' | 'liabilities' | 'calendar' | 'forecast' | 'data' | 'settings'
export type AssetCategory = 'property' | 'deposit' | 'investment' | 'cash' | 'vehicle' | 'crypto' | 'other'
export type Currency = 'BYN' | 'USD' | 'EUR' | 'RUB' | 'CNY' | 'PLN'

export interface AssetInput {
  id?: number
  name: string
  category: AssetCategory
  institution: string
  quantity: number
  unitPrice: number
  currency: Currency
  expectedReturn: number
  source: string
  notes: string
  icon: 'home' | 'bank' | 'chart' | 'cash' | 'car' | 'crypto'
  cryptoId: string
  payoutDate: string
  interestStartDate: string
  capitalization: boolean
}

export interface Asset extends Omit<AssetInput, 'id' | 'unitPrice' | 'expectedReturn' | 'cryptoId' | 'payoutDate' | 'interestStartDate' | 'capitalization'> {
  id: number
  crypto_id: string
  unit_price: number
  expected_return: number
  payout_date: string
  interest_start_date: string
  capitalization: number
  updated_at: string
  value: number
  bynValue: number
}

export interface LiabilityInput {
  id?: number
  name: string
  institution: string
  principal: number
  balance: number
  interestRate: number
  monthlyPayment: number
  nextPaymentDate: string
  endDate: string
  interestStartDate: string
  notes: string
}

export interface Liability extends Omit<LiabilityInput, 'id' | 'interestRate' | 'monthlyPayment' | 'nextPaymentDate' | 'endDate' | 'interestStartDate'> {
  id: number
  interest_rate: number
  monthly_payment: number
  next_payment_date: string
  end_date: string
  interest_start_date: string
}

export interface Rate { code: Currency; rate: number; scale: number; rate_date: string; fetched_at: string }
export interface CryptoRate { id: string; price_usd: number; updated_at: string }
export interface Snapshot { date: string; assets: number; liabilities: number; net_worth: number; created_at: string }
export interface Metrics { assets: number; liabilities: number; netWorth: number; liquid: number; foreignShare: number; debtShare: number }
export interface PortfolioState {
  assets: Asset[]
  liabilities: Liability[]
  history: Snapshot[]
  rates: Rate[]
  cryptoRates: CryptoRate[]
  metrics: Metrics
  demoMode: boolean
  externalRequests: boolean
  lastSync: string | null
  lastCryptoSync: string | null
  rateStatus?: 'online' | 'offline'
  rateError?: string
}

export interface FileResult { canceled: boolean; path?: string; backup?: string; state?: PortfolioState }
export interface CapitalApi {
  getState(): Promise<PortfolioState>
  saveAsset(asset: AssetInput): Promise<PortfolioState>
  deleteAsset(id: number): Promise<PortfolioState>
  saveLiability(liability: LiabilityInput): Promise<PortfolioState>
  deleteLiability(id: number): Promise<PortfolioState>
  payLiability(id: number, payment: { amount: number }): Promise<PortfolioState>
  refreshRates(): Promise<PortfolioState>
  setExternalRequests(enabled: boolean): Promise<PortfolioState>
  exportJson(): Promise<FileResult>
  importJson(): Promise<FileResult>
  exportCsv(): Promise<FileResult>
  backup(): Promise<FileResult>
  reset(demo: boolean): Promise<PortfolioState>
  onUpdated(callback: (state: PortfolioState) => void): () => void
}

declare global {
  interface Window { capital: CapitalApi }
}
