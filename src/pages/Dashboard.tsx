import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, ChevronRight, Eye, EyeOff, Info, MoreHorizontal, Plus, ShieldCheck, Sparkles, WalletCards } from 'lucide-react'
import { AssetIcon, Change, DonutLegend, SectionTitle } from '../components/UI'
import { money, numberValue, currency, fromByn, displayAmount } from '../utils'
import { useSettings } from '../useSettings'
import { usePortfolio } from '../usePortfolio'
import { historyForPeriod } from '../finance'
import type { Page } from '../types'

const symbols: Record<string, string> = { USD: '$', EUR: '€', RUB: '₽', CNY: '¥', PLN: 'zł' }
const colors = ['#2487ed', '#77b6f2', '#c3d5e5', '#e3ad61', '#d4879a', '#9ca3b2']

export default function Dashboard({ onNavigate, onAdd }: { onNavigate: (page: Page) => void; onAdd: () => void }) {
  const { t, i18n } = useTranslation()
  const { name, hiddenBalances, toggleBalances } = useSettings()
  const { state } = usePortfolio()
  const [period, setPeriod] = useState('1 год')
  const [today] = useState(() => new Date())
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  if (!state) return null
  const { metrics } = state
  const history = historyForPeriod(state.history, period === '6 мес.' ? 6 : period === '3 мес.' ? 3 : 12)
  const chartHistory = history.map(item => {
    const date = new Date(`${item.date}T12:00:00`)
    return {
      ...item,
      label: new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' }).format(date),
      fullDate: new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }).format(date),
      value: item.net_worth,
    }
  })
  const grouped = state.assets.reduce<Record<string, number>>((result, asset) => { result[asset.category] = (result[asset.category] || 0) + asset.bynValue; return result }, {})
  const allocation = Object.entries(grouped).map(([category, value], index) => ({ label: t(`categories.${category}`), value, color: colors[index % colors.length] })).sort((a, b) => b.value - a.value)
  const selectedSegment = activeSegment === null ? null : allocation[activeSegment]
  const sortedAssets = [...state.assets].sort((a, b) => b.bynValue - a.bynValue)
  const previous = history.length > 1 ? history[0].net_worth : metrics.netWorth
  const difference = metrics.netWorth - previous
  const growth = previous ? difference / Math.abs(previous) * 100 : 0
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }).format(today)
  const health = Math.max(0, Math.min(100, Math.round(100 - metrics.debtShare * 1.5 + Math.min(15, metrics.liquid / Math.max(metrics.assets, 1) * 20))))
  const nextPayments = state.liabilities.filter(item => item.balance > 0).reduce((sum, item) => sum + item.monthly_payment, 0)

  return <>
    <header className="page-header"><div><div className="eyebrow"><span className="status-dot" />{t('overview.eyebrow')}</div><h1>{t('overview.greeting', { name })}</h1><p>{t('overview.subtitle')}</p></div><div className="header-actions"><button type="button" className="date-button" onClick={() => onNavigate('calendar')}><CalendarDays size={16} />{date}</button><button className="primary-button" onClick={onAdd}><Plus size={16} />{t('common.addAsset')}</button></div></header>
    {state.demoMode && <div className="demo-notice"><Info size={14} /><span>{t('overview.demoNotice')}</span></div>}
    <section className="summary-grid">
      <article className="net-worth-card"><div className="card-top"><span>{t('overview.netWorth')}</span><button className="dark-icon-button" onClick={toggleBalances} aria-label={t('settings.hideBalances')}>{hiddenBalances ? <Eye size={18} /> : <EyeOff size={18} />}</button></div><div className="net-worth-value">{money(metrics.netWorth)} <small>{currency()}</small></div><div className="net-worth-bottom"><span className={`gain-pill ${growth >= 0 ? 'positive' : 'negative'}`}>{growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{numberValue(Math.abs(growth), 1)}%</span><span className={difference >= 0 ? 'positive' : 'negative'}>{difference >= 0 ? '+' : '−'}{money(Math.abs(difference))} {currency()}</span></div><div className="worth-decoration"><svg viewBox="0 0 180 68"><path d="M0 60 C18 55 19 43 37 47 S61 52 72 37 S91 43 105 27 S131 33 142 19 S162 16 180 4" /></svg></div></article>
      <article className="summary-card"><div className="card-top"><span>{t('overview.assets')}</span><div className="metric-icon green"><WalletCards size={19} /></div></div><div className="summary-value">{money(metrics.assets)} <small>{currency()}</small></div><div className="summary-bottom"><span>{state.assets.length} · {money(metrics.liquid)} {currency()} {t('assets.liquid').toLowerCase()}</span></div><div className="micro-progress"><i style={{ width: `${Math.min(100, metrics.assets ? metrics.liquid / metrics.assets * 100 : 0)}%` }} /></div></article>
      <article className="summary-card"><div className="card-top"><span>{t('overview.liabilities')}</span><div className="metric-icon sand"><ShieldCheck size={19} /></div></div><div className="summary-value">{money(metrics.liabilities)} <small>{currency()}</small></div><div className="summary-bottom"><span>{money(nextPayments)} {currency()} / {t('liabilities.payments').toLowerCase()}</span></div><div className="micro-progress warm"><i style={{ width: `${Math.min(100, metrics.debtShare)}%` }} /></div></article>
    </section>
    <section className="dashboard-main-grid">
      <article className="panel chart-panel"><SectionTitle title={t('overview.dynamics')} subtitle={t('overview.dynamicsHint')} action={<div className="segmented small">{['3 мес.', '6 мес.', '1 год'].map((item, index) => <button key={item} className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{t(['overview.periods.m3', 'overview.periods.m6', 'overview.periods.y1'][index])}</button>)}</div>} /><div className="chart-value-row"><strong>{money(metrics.netWorth)} {currency()}</strong><span><i />{t('overview.netWorth')}</span></div><div className="wealth-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartHistory} margin={{ top: 10, right: 4, left: -14, bottom: 0 }}><defs><linearGradient id="wealthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.23} /><stop offset="95%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12, fontFamily: 'Onest' }} dy={10} minTickGap={24} /><YAxis domain={['dataMin - 1000', 'dataMax + 1000']} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={v => hiddenBalances ? '••••' : `${Math.round(fromByn(v) / 1000)}k`} tickCount={4} /><Tooltip content={({ active, payload }) => active && payload?.length ? <div className="chart-tooltip"><span>{payload[0].payload.fullDate}</span><strong>{money(Number(payload[0].value))} {currency()}</strong></div> : null} /><Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.4} fill="url(#wealthFill)" activeDot={{ r: 5, fill: 'var(--paper)', stroke: 'var(--accent)', strokeWidth: 3 }} /></AreaChart></ResponsiveContainer></div></article>
      <article className="panel allocation-panel"><SectionTitle title={t('overview.allocation')} action={<button className="icon-button" onClick={() => onNavigate('assets')} aria-label={t('common.allAssets')}><MoreHorizontal size={19} /></button>} /><div className="donut-wrap" onMouseLeave={() => setActiveSegment(null)}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocation} dataKey="value" innerRadius={61} outerRadius={82} paddingAngle={3} cornerRadius={5} stroke="none" onMouseEnter={(_, index) => setActiveSegment(index)}>{allocation.map(item => <Cell key={item.label} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(selectedSegment?.value ?? metrics.assets)}</strong><span>{selectedSegment ? `${selectedSegment.label} · ${currency()}` : currency()}</span></div></div><DonutLegend items={allocation} /><button className="text-link allocation-link" onClick={() => onNavigate('assets')}>{t('common.allAssets')} <ArrowRight size={15} /></button></article>
    </section>
    <section className="panel currency-panel"><div className="currency-heading"><div><span className="nbrb-mark">НБ</span><div><h3>{t('overview.rates')}</h3><p>{state.lastSync ? new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(state.lastSync)) : t('fields.offline')}</p></div></div>{state.demoMode && <span className="demo-badge">{t('common.demo')}</span>}</div><div className="rates-list">{state.rates.filter(rate => ['USD','EUR','RUB','CNY'].includes(rate.code)).map(rate => <div className="rate-item" key={rate.code}><span className="currency-symbol">{symbols[rate.code]}</span><div><span className="rate-name">{rate.code} <i>/ BYN</i></span><small>{t(`currencies.${rate.code.toLowerCase()}`)}</small></div><div className="rate-number"><strong>{(rate.rate / rate.scale).toLocaleString(i18n.language, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</strong></div></div>)}</div></section>
    <section className="bottom-grid">
      <article className="panel assets-preview"><SectionTitle title={t('overview.largest')} subtitle={t('overview.largestHint')} action={<button className="text-link" onClick={() => onNavigate('assets')}>{t('common.all')} <ChevronRight size={15} /></button>} /><div className="asset-list">{sortedAssets.slice(0, 4).map(asset => <div className="asset-row" key={asset.id}><div className="asset-icon"><AssetIcon type={asset.icon} /></div><div className="asset-description"><strong>{asset.name}</strong><span>{asset.institution}</span></div><div className="asset-value"><strong>{money(asset.bynValue)} {currency()}</strong><span>{displayAmount(asset.value)} {asset.currency}</span></div><Change value={asset.expected_return} /></div>)}</div>{!state.assets.length && <div className="empty-state">{t('fields.emptyText')}</div>}</article>
      <article className="panel insight-card"><div className="insight-icon"><Sparkles size={20} /></div><span className="eyebrow">{t('overview.pulse')}</span><h3>{t('overview.pulseTitle')}</h3><p>{t('assets.liquid')}: {money(metrics.liquid)} {currency()} · {t('assets.foreign')}: {numberValue(metrics.foreignShare, 1)}%</p><div className="health-row"><span>{t('overview.health')}</span><strong>{health} / 100</strong></div><div className="health-bar"><i style={{ width: `${health}%` }} /></div><button className="text-link" onClick={() => onNavigate('forecast')}>{t('overview.viewForecast')} <ArrowRight size={15} /></button></article>
    </section>
  </>
}
