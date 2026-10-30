import { createContext } from 'react'
import type { AssetInput, FileResult, LiabilityInput, PortfolioState } from './types'

export interface PortfolioContextValue {
  hiddenBalances: boolean
  state: PortfolioState | null
  loading: boolean
  error: string
  clearError: () => void
  rateNotice: boolean
  clearRateNotice: () => void
  reload: () => Promise<void>
  saveAsset: (asset: AssetInput) => Promise<PortfolioState>
  deleteAsset: (id: number) => Promise<PortfolioState>
  saveLiability: (liability: LiabilityInput) => Promise<PortfolioState>
  deleteLiability: (id: number) => Promise<PortfolioState>
  payLiability: (id: number, amount: number) => Promise<PortfolioState>
  refreshRates: () => Promise<PortfolioState>
  setExternalRequests: (enabled: boolean) => Promise<PortfolioState>
  exportJson: () => Promise<FileResult>
  importJson: () => Promise<FileResult>
  exportCsv: () => Promise<FileResult>
  backup: () => Promise<FileResult>
  reset: (demo: boolean) => Promise<PortfolioState>
}

export const PortfolioContext = createContext<PortfolioContextValue | null>(null)
