import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { PortfolioContext } from './portfolio-context'
import type { AssetInput, LiabilityInput, PortfolioState } from './types'
import { useSettings } from './useSettings'
import { configureDisplayCurrency } from './utils'

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { hiddenBalances, baseCurrency, rateNotifications } = useSettings()
  const [state, setState] = useState<PortfolioState | null>(null)
  configureDisplayCurrency(baseCurrency, state?.rates || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rateNotice, setRateNotice] = useState(false)

  const reload = useCallback(async () => {
    setError('')
    try {
      if (!window.capital) throw new Error('Для работы с базой запустите приложение через npm run dev')
      setState(await window.capital.getState())
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(reload, 0)
    return () => window.clearTimeout(timer)
  }, [reload])
  useEffect(() => window.capital?.onUpdated(next => {
    setState(next)
    if (rateNotifications && next.rateStatus === 'online' && next.lastSync) setRateNotice(true)
  }), [rateNotifications])

  const run = async <T,>(operation: () => Promise<T>): Promise<T> => {
    setError('')
    try { return await operation() }
    catch (reason) { const message = reason instanceof Error ? reason.message : String(reason); setError(message); throw reason }
  }
  const update = (operation: () => Promise<PortfolioState>) => run(async () => {
    const next = await operation()
    setState(next)
    return next
  })

  return <PortfolioContext.Provider value={{
    hiddenBalances, state, loading, error, clearError: () => setError(''), rateNotice, clearRateNotice: () => setRateNotice(false), reload,
    saveAsset: (asset: AssetInput) => update(() => window.capital.saveAsset(asset)),
    deleteAsset: id => update(() => window.capital.deleteAsset(id)),
    saveLiability: (item: LiabilityInput) => update(() => window.capital.saveLiability(item)),
    deleteLiability: id => update(() => window.capital.deleteLiability(id)),
    payLiability: (id, amount) => update(() => window.capital.payLiability(id, { amount })),
    refreshRates: () => { setRateNotice(false); return update(() => window.capital.refreshRates()) },
    setExternalRequests: enabled => update(() => window.capital.setExternalRequests(enabled)),
    exportJson: () => run(() => window.capital.exportJson()),
    importJson: () => run(async () => { const result = await window.capital.importJson(); if (result.state) setState(result.state); return result }),
    exportCsv: () => run(() => window.capital.exportCsv()),
    backup: () => run(() => window.capital.backup()),
    reset: demo => update(() => window.capital.reset(demo)),
  }}>{children}</PortfolioContext.Provider>
}
