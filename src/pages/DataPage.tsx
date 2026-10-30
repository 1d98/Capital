import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDownToLine, ArrowUpFromLine, Bitcoin, CheckCircle2, ChevronRight, CircleDollarSign, Database, Landmark, LockKeyhole, RefreshCw, Unplug, WalletCards } from 'lucide-react'
import { SectionTitle } from '../components/UI'
import { usePortfolio } from '../usePortfolio'

export default function DataPage() {
  const { t, i18n } = useTranslation()
  const { state, refreshRates, exportJson, importJson, backup, reset } = usePortfolio()
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  if (!state) return null
  const action = async (name: string, operation: () => Promise<{ canceled: boolean } | unknown>, success: string) => {
    setBusy(name); setMessage('')
    try {
      const result = await operation()
      if (typeof result === 'object' && result !== null && 'canceled' in result && result.canceled) return
      const rateResult = result as { rateStatus?: string; rateError?: string } | null
      if (rateResult?.rateStatus === 'offline') {
        setMessage(rateResult.rateError ? `${t('fields.offline')} ${rateResult.rateError}` : t('fields.offline'))
        return
      }
      setMessage(success)
    }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : String(reason)) }
    finally { setBusy('') }
  }
  const clear = () => { if (window.confirm(t('data.clearConfirm'))) reset(false) }
  const restoreDemo = () => { if (window.confirm(t('settings.reset'))) reset(true) }
  return <>
    <header className="page-header"><div><div className="eyebrow">{t('data.eyebrow')}</div><h1>{t('data.title')}</h1><p>{t('data.subtitle')}</p></div><span className="outline-badge"><LockKeyhole size={14} />{t('data.local')}</span></header>
    {message && <div className="action-message" role="status">{message}</div>}
    <SectionTitle title={t('data.sources')} subtitle={t('data.sourcesHint')} />
    <section className="sources-grid">
      <article className="panel source-card connected"><div className="source-card-top"><div className="source-logo nbrb">НБ</div><span className="connection-status"><i />{!state.externalRequests ? t('settings.requestsDisabled') : state.rateStatus === 'offline' ? t('fields.offline') : t('data.connected')}</span></div><h3>{t('data.nbrb')}</h3><p>{t('data.nbrbText')}</p><div className="source-meta"><span>{state.lastSync ? new Date(state.lastSync).toLocaleString(i18n.language) : t('fields.offline')}</span><strong>{state.rates.length - 1}</strong></div><button className="secondary-button full-width" disabled={Boolean(busy) || !state.externalRequests} onClick={() => action('rates', refreshRates, t('fields.online'))}><RefreshCw size={15} className={busy === 'rates' ? 'rotated' : ''} />{t('data.refresh')}</button></article>
      <article className="panel source-card connected"><div className="source-card-top"><div className="source-logo"><Bitcoin size={23} /></div><span className="connection-status"><i />{!state.externalRequests ? t('settings.requestsDisabled') : state.lastCryptoSync ? t('data.connected') : t('fields.offline')}</span></div><h3>CoinGecko</h3><p>{t('data.cryptoText')}</p><div className="source-meta"><span>{state.lastCryptoSync ? new Date(state.lastCryptoSync).toLocaleString(i18n.language) : t('fields.offline')}</span><strong>USD</strong></div><button className="secondary-button full-width" disabled={Boolean(busy) || !state.externalRequests} onClick={() => action('rates', refreshRates, t('fields.online'))}><RefreshCw size={15} />{t('data.refresh')}</button></article>
      <article className="panel source-card"><div className="source-card-top"><div className="source-logo"><Landmark size={23} /></div><span className="connection-status manual">{t('data.manual')}</span></div><h3>{t('data.banks')}</h3><p>{t('data.banksText')}</p><div className="source-meta"><span>{t('data.openApi')}</span><strong>{t('data.notNeeded')}</strong></div><button className="secondary-button full-width" onClick={() => setMessage(t('fields.guideText'))}>{t('data.how')} <ChevronRight size={15} /></button></article>
      <article className="panel source-card"><div className="source-card-top"><div className="source-logo"><CircleDollarSign size={23} /></div><span className="connection-status manual">{t('data.manual')}</span></div><h3>{t('data.securities')}</h3><p>{t('data.securitiesText')}</p><div className="source-meta"><span>{t('data.priceSource')}</span><strong>{t('data.manualPrice')}</strong></div><button className="secondary-button full-width" onClick={() => setMessage(t('fields.guideText'))}>{t('data.how')} <ChevronRight size={15} /></button></article>
    </section>
    <section className="data-management-grid">
      <article className="panel"><SectionTitle title={t('data.backup')} subtitle={t('data.backupHint')} /><div className="data-action"><div className="data-action-icon"><ArrowDownToLine size={20} /></div><div><strong>{t('data.export')}</strong><p>{t('data.exportText')}</p></div><button className="secondary-button" disabled={Boolean(busy)} onClick={() => action('export', exportJson, t('fields.exported'))}>{t('data.exportShort')} <ChevronRight size={15} /></button></div><div className="data-action"><div className="data-action-icon"><ArrowUpFromLine size={20} /></div><div><strong>{t('data.import')}</strong><p>{t('data.importText')}</p></div><button className="secondary-button" disabled={Boolean(busy)} onClick={() => action('import', importJson, t('fields.imported'))}>{t('data.importShort')} <ChevronRight size={15} /></button></div><div className="data-action"><div className="data-action-icon"><Database size={20} /></div><div><strong>SQLite backup</strong><p>capital.db</p></div><button className="secondary-button" disabled={Boolean(busy)} onClick={() => action('backup', backup, t('fields.exported'))}>{t('data.exportShort')} <ChevronRight size={15} /></button></div></article>
      <article className="panel"><SectionTitle title={t('data.storage')} subtitle={t('data.storageHint')} /><div className="storage-visual"><div className="database-icon"><Database size={26} /></div><div><strong>SQLite database</strong><span>capital.db</span></div><span className="connection-status"><i />{t('data.connected')}</span></div><div className="storage-details"><div><span><WalletCards size={15} />{t('data.assets')}</span><strong>{state.assets.length}</strong></div><div><span><Unplug size={15} />{t('settings.externalRequests')}</span><strong className={state.externalRequests ? undefined : 'green-text'}>{state.externalRequests ? t('settings.requestsEnabled') : t('settings.requestsDisabled')}</strong></div></div><div className="safe-note"><CheckCircle2 size={16} />{t('data.safe')}</div></article>
    </section>
    <section className="demo-zone"><div><span className="eyebrow">{t('data.demoMode')}</span><h3>{t('data.clean')}</h3></div><div className="header-actions"><button className="secondary-button" onClick={restoreDemo}>{t('data.demoMode')}</button><button className="danger-button" onClick={clear}>{t('data.clear')}</button></div></section>
  </>
}
