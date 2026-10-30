import { createContext } from 'react'
import type { Currency } from './types'

export interface SettingsValue {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  hiddenBalances: boolean
  toggleBalances: () => void
  baseCurrency: Currency
  setBaseCurrency: (currency: Currency) => void
  name: string
  setName: (name: string) => void
  compact: boolean
  setCompact: (value: boolean) => void
  paymentNotifications: boolean
  setPaymentNotifications: (value: boolean) => void
  rateNotifications: boolean
  setRateNotifications: (value: boolean) => void
  resetSettings: () => void
}

export const SettingsContext = createContext<SettingsValue | null>(null)
