import { useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Calculator, Check, Info, Lightbulb, TrendingUp } from 'lucide-react'
import { SectionTitle } from '../components/UI'
import { money, currency, fromByn, toByn, displayAmount, numberValue } from '../utils'
import { project } from '../finance'
import { usePortfolio } from '../usePortfolio'
import { useSettings } from '../useSettings'

export default function Forecast() {
  const { t } = useTranslation()
  const { state } = usePortfolio()
  const { hiddenBalances } = useSettings()
  const [years, setYears] = useState(10)
  const [contribution, setContribution] = useState(1500)
  const [annualReturn, setAnnualReturn] = useState(10)
  const [inflation, setInflation] = useState(7)
  const [scenario, setScenario] = useState<'base' | 'optimistic' | 'conservative'>('base')
  const initial = state?.metrics.netWorth || 0
  const [currentYear] = useState(() => new Date().getFullYear())
  const selectedReturn = annualReturn + (scenario === 'optimistic' ? 2 : scenario === 'conservative' ? -3 : 0)
  const contributionByn = toByn(contribution)
  const result = project(initial, years, contributionByn, selectedReturn)
  const invested = initial + contributionByn * years * 12
  const chartPoints = Math.min(years, 100)
  const chart = Array.from({ length: chartPoints + 1 }, (_, index) => {
    const year = Math.round(index * years / chartPoints)
    return { year: String(currentYear + year), base: project(initial, year, contributionByn, annualReturn) / 1000, optimistic: project(initial, year, contributionByn, annualReturn + 2) / 1000, conservative: project(initial, year, contributionByn, annualReturn - 3) / 1000 }
  })

  return <>
    <header className="page-header"><div><div className="eyebrow">{t('forecast.eyebrow')}</div><h1>{t('forecast.title')}</h1><p>{t('forecast.subtitle')}</p></div><span className="outline-badge"><Calculator size={15} />{t('forecast.calculation')}</span></header>
    <section className="forecast-grid">
      <article className="panel forecast-settings"><SectionTitle title={t('forecast.settings')} subtitle={t('forecast.settingsHint')} />
        <div className="range-field"><div><label htmlFor="years-input">{t('forecast.horizon')}</label><div className="forecast-value-input"><input id="years-input" type="number" min="1" step="1" value={years} onChange={e => { const value = Number(e.target.value); if (e.target.value && Number.isFinite(value)) setYears(Math.max(1, Math.round(value))) }} /></div></div><input id="years" type="range" min="1" max="20" value={Math.min(20, years)} onChange={e => setYears(Number(e.target.value))} style={{ '--range': `${Math.min(100, (years - 1) / 19 * 100)}%` } as CSSProperties} /><div className="range-labels"><span>{t('forecast.year1')}</span><span>{t('forecast.years20')}</span></div></div>
        <div className="range-field"><div><label htmlFor="contribution-input">{t('forecast.contribution')}</label><div className="forecast-value-input"><input id="contribution-input" type="number" min="0" step="50" value={contribution} onChange={e => { const value = Number(e.target.value); if (e.target.value && Number.isFinite(value)) setContribution(Math.max(0, value)) }} /><span>{currency()}</span></div></div><input id="contribution" type="range" min="0" max="5000" step="100" value={Math.min(5000, contribution)} onChange={e => setContribution(Number(e.target.value))} style={{ '--range': `${Math.min(100, contribution / 50)}%` } as CSSProperties} /><div className="range-labels"><span>0 {currency()}</span><span>5 000 {currency()}</span></div></div>
        <div className="range-field"><div><label htmlFor="return-input">{t('forecast.return')}</label><div className="forecast-value-input"><input id="return-input" type="number" min="0" step="0.5" value={annualReturn} onChange={e => { const value = Number(e.target.value); if (e.target.value && Number.isFinite(value)) setAnnualReturn(Math.max(0, value)) }} /><span>%</span></div></div><input id="return" type="range" min="0" max="20" step="0.5" value={Math.min(20, annualReturn)} onChange={e => setAnnualReturn(Number(e.target.value))} style={{ '--range': `${Math.min(100, annualReturn * 5)}%` } as CSSProperties} /><div className="range-labels"><span>0%</span><span>20%</span></div></div>
        <div className="range-field"><div><label htmlFor="inflation-input">{t('forecast.inflation')}</label><div className="forecast-value-input"><input id="inflation-input" type="number" min="0" step="0.5" value={inflation} onChange={e => { const value = Number(e.target.value); if (e.target.value && Number.isFinite(value)) setInflation(Math.max(0, value)) }} /><span>%</span></div></div><input id="inflation" type="range" min="0" max="15" step="0.5" value={Math.min(15, inflation)} onChange={e => setInflation(Number(e.target.value))} style={{ '--range': `${Math.min(100, inflation / 15 * 100)}%` } as CSSProperties} /><div className="range-labels"><span>0%</span><span>15%</span></div></div>
        <div className="forecast-hint"><Lightbulb size={18} /><p>{t('forecast.hint')}</p></div>
      </article>
      <article className="panel forecast-result"><div className="forecast-result-head"><div><span>{t('forecast.capitalBy', { year: currentYear + years })}</span><strong>{money(result)} <small>{currency()}</small></strong></div><div className="forecast-result-icon"><TrendingUp size={23} /></div></div><div className="scenario-tabs">{(['conservative', 'base', 'optimistic'] as const).map(item => <button key={item} onClick={() => setScenario(item)} className={scenario === item ? 'active' : ''}>{t(`forecast.${item}`)}{scenario === item && <Check size={13} />}</button>)}</div><div className="result-breakdown"><div><span>{t('forecast.currentCapital')}</span><strong>{money(initial)} {currency()}</strong></div><div><span>{t('forecast.invested')}</span><strong>{money(invested)} {currency()}</strong></div><div><span>{t('forecast.growth')}</span><strong className="green-text">+{money(result - invested)} {currency()}</strong></div><div><span>{t('forecast.real')}</span><strong>{money(result / Math.pow(1 + inflation / 100, years))} {currency()}</strong></div></div><p className="result-note"><Info size={13} />{t('forecast.todayMoney', { rate: inflation })}</p></article>
    </section>
    <section className="panel forecast-chart-panel"><SectionTitle title={t('forecast.scenarios')} subtitle={t('forecast.scenariosHint')} action={<div className="chart-legend"><span><i className="optimistic" />{t('forecast.optimistic')}</span><span><i />{t('forecast.base')}</span><span><i className="conservative" />{t('forecast.conservative')}</span></div>} /><div className="forecast-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ top: 15, right: 12, left: 0, bottom: 0 }}><defs><linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity={0.2} /><stop offset="1" stopColor="var(--accent)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} tickFormatter={v => hiddenBalances ? '••••' : `${numberValue(fromByn(v))}k`} width={68} /><Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="chart-tooltip forecast-tooltip"><span>{label}</span>{payload.slice().reverse().map(p => <div key={String(p.dataKey)}><i style={{ background: p.color }} />{t(`forecast.${String(p.dataKey)}`)}<strong>{money(Number(p.value) * 1000)} {currency()}</strong></div>)}</div> : null} /><Area type="monotone" dataKey="optimistic" stroke="#a8b7c6" strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" /><Area type="monotone" dataKey="base" stroke="var(--accent)" strokeWidth={2.5} fill="url(#forecastFill)" /><Area type="monotone" dataKey="conservative" stroke="#d69a7d" strokeWidth={1.5} strokeDasharray="5 4" fill="transparent" /></AreaChart></ResponsiveContainer></div></section>
    <div className="forecast-bottom"><div><span className="eyebrow">{t('forecast.nextStep')}</span><h3>{t('forecast.stepTitle')}</h3><p>{t('forecast.stepText', { years, step: displayAmount(300), amount: money(project(initial, years, contributionByn + toByn(300), selectedReturn) - result), currency: currency() })}</p></div><button className="secondary-button" disabled={contribution >= 5000} onClick={() => setContribution(current => Math.min(5000, current + 300))}>{t('forecast.apply')} <ArrowRight size={15} /></button></div>
    <p className="disclaimer">{t('forecast.disclaimer')}</p>
  </>
}
