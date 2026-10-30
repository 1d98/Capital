import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SettingsContext } from './settings-context'
import { setBalanceVisibility } from './utils'
import type { Currency } from './types'

const read = (key: string, fallback: boolean) => localStorage.getItem(key) === null ? fallback : localStorage.getItem(key) === 'true'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('capital-theme') === 'dark' ? 'dark' : 'light')
  const [name, setName] = useState(() => localStorage.getItem('capital-name') || 'Алексей')
  const [compact, setCompact] = useState(() => read('capital-compact', false))
  const [paymentNotifications, setPaymentNotifications] = useState(() => read('capital-payments', true))
  const [rateNotifications, setRateNotifications] = useState(() => read('capital-rates', true))
  const [hiddenBalances, setHiddenBalances] = useState(() => read('capital-hide-balances', false))
  const [baseCurrency, setBaseCurrency] = useState<Currency>(() => (localStorage.getItem('capital-currency') as Currency) || 'BYN')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111217' : '#f5f6fa')
    localStorage.setItem('capital-theme', theme)
  }, [theme])
  useEffect(() => { document.documentElement.classList.toggle('compact', compact); localStorage.setItem('capital-compact', String(compact)) }, [compact])
  useEffect(() => {
    document.documentElement.lang = i18n.language
    document.title = i18n.t('brand.windowTitle')
    localStorage.setItem('capital-language', i18n.language)
  }, [i18n, i18n.language])
  useEffect(() => { localStorage.setItem('capital-name', name) }, [name])
  useEffect(() => { localStorage.setItem('capital-payments', String(paymentNotifications)) }, [paymentNotifications])
  useEffect(() => { localStorage.setItem('capital-rates', String(rateNotifications)) }, [rateNotifications])
  useEffect(() => { setBalanceVisibility(hiddenBalances); localStorage.setItem('capital-hide-balances', String(hiddenBalances)) }, [hiddenBalances])
  useEffect(() => { localStorage.setItem('capital-currency', baseCurrency) }, [baseCurrency])

  const toggleBalances = () => setHiddenBalances(current => {
    const next = !current
    setBalanceVisibility(next)
    return next
  })
  const resetSettings = () => {
    setTheme('light'); setName('Алексей'); setCompact(false); setPaymentNotifications(true); setRateNotifications(true); setHiddenBalances(false); setBaseCurrency('BYN')
    i18n.changeLanguage('ru')
  }

  return <SettingsContext.Provider value={{ theme, setTheme, toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'), hiddenBalances, toggleBalances, baseCurrency, setBaseCurrency, name, setName, compact, setCompact, paymentNotifications, setPaymentNotifications, rateNotifications, setRateNotifications, resetSettings }}>{children}</SettingsContext.Provider>
}
