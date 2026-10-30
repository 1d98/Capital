import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDownRight, ArrowUpRight, Bitcoin, Building2, CarFront, ChartNoAxesCombined, Coins, Home, Landmark, X } from 'lucide-react'
import type { Asset } from '../types'
import { money } from '../utils'

export function AssetIcon({ type, size = 20 }: { type: Asset['icon']; size?: number }) {
  const Icon = { home: Home, bank: Landmark, chart: ChartNoAxesCombined, cash: Coins, car: CarFront, crypto: Bitcoin }[type]
  return <Icon size={size} strokeWidth={1.7} />
}

export function Change({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const { i18n } = useTranslation()
  return <span className={`change ${value >= 0 ? 'positive' : 'negative'}`}>{value >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(value).toLocaleString(i18n.language)}{suffix}</span>
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}

export function Modal({ children, onClose, title, subtitle }: { children: ReactNode; onClose: () => void; title: string; subtitle: string }) {
  const { t } = useTranslation()
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="icon-button modal-close" onClick={onClose} aria-label={t('common.close')}><X size={20} /></button>
      <div className="modal-heading"><div className="modal-symbol"><Building2 size={22} /></div><div><h2 id="modal-title">{title}</h2><p>{subtitle}</p></div></div>
      {children}
    </div>
  </div>
}

export function DonutLegend({ items }: { items: { label: string; color: string; value: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  return <div className="donut-legend">{items.map(item => <div className="legend-row" key={item.label}><span className="legend-name"><i style={{ background: item.color }} />{item.label}</span><strong>{Math.round(item.value / total * 100)}%</strong><span>{money(item.value)}</span></div>)}</div>
}
