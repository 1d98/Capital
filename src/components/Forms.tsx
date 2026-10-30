import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Save, Trash2 } from 'lucide-react'
import type { Asset, AssetCategory, AssetInput, Liability, LiabilityInput } from '../types'
import { usePortfolio } from '../usePortfolio'
import { Modal } from './UI'

const categoryIcons: Record<AssetCategory, AssetInput['icon']> = { property: 'home', deposit: 'bank', investment: 'chart', cash: 'cash', vehicle: 'car', crypto: 'crypto', other: 'cash' }
const categories: AssetCategory[] = ['property', 'deposit', 'investment', 'cash', 'vehicle', 'crypto', 'other']
const coins = [{ id: 'bitcoin', name: 'Bitcoin · BTC' }, { id: 'ethereum', name: 'Ethereum · ETH' }, { id: 'tether', name: 'Tether · USDT' }, { id: 'usd-coin', name: 'USD Coin · USDC' }, { id: 'solana', name: 'Solana · SOL' }, { id: 'the-open-network', name: 'Toncoin · TON' }]

export function NumberField({ id, value, onChange, min, max, required, autoFocus }: { id: string; value: number; onChange: (value: number) => void; min?: number; max?: number; required?: boolean; autoFocus?: boolean }) {
  const [text, setText] = useState(String(value))
  const update = (raw: string) => {
    if (!/^-?\d*([.,]\d*)?$/.test(raw)) return
    setText(raw)
    if (raw === '' || raw === '-' || raw === '.' || raw === ',') return
    const parsed = Number(raw.replace(',', '.'))
    if (Number.isFinite(parsed)) onChange(parsed)
  }
  const normalize = () => {
    const parsed = text === '' || text === '-' ? 0 : Number(text.replace(',', '.'))
    const safe = Number.isFinite(parsed) ? parsed : 0
    const clamped = Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, safe))
    setText(String(clamped))
    onChange(clamped)
  }
  return <input id={id} type="text" inputMode="decimal" value={text} onChange={event => update(event.target.value)} onBlur={normalize} min={min} max={max} required={required} autoFocus={autoFocus} autoComplete="off" />
}

export function AssetForm({ asset, onClose }: { asset?: Asset; onClose: () => void }) {
  const { t } = useTranslation()
  const { saveAsset, deleteAsset } = usePortfolio()
  const [form, setForm] = useState<AssetInput>({ name: asset?.name || '', category: asset?.category || 'deposit', institution: asset?.institution || '', quantity: asset?.quantity || 1, unitPrice: asset?.unit_price || 0, currency: asset?.currency || 'BYN', expectedReturn: asset?.expected_return || 0, source: asset?.source || 'manual', notes: asset?.notes || '', icon: asset?.icon || 'bank', cryptoId: asset?.crypto_id || 'bitcoin', payoutDate: asset?.payout_date || '', interestStartDate: asset?.interest_start_date || '', capitalization: Boolean(asset?.capitalization) })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof AssetInput>(key: K, value: AssetInput[K]) => setForm(current => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await saveAsset({ ...form, id: asset?.id, icon: categoryIcons[form.category] })
      if (result.rateStatus === 'offline' && result.rateError) {
        setError(`${t('fields.cryptoSavedOffline')} ${result.rateError}`)
        return
      }
      onClose()
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
    finally { setBusy(false) }
  }
  const remove = async () => {
    if (!asset || !window.confirm(t('fields.deleteAssetConfirm'))) return
    setBusy(true)
    try { await deleteAsset(asset.id); onClose() } finally { setBusy(false) }
  }
  return <Modal title={asset ? t('fields.editAsset') : t('form.title')} subtitle={t('form.subtitle')} onClose={onClose}><form onSubmit={submit}>
    <div className="form-row"><div className="form-field"><label htmlFor="asset-category">{t('assets.category')}</label><select id="asset-category" value={form.category} onChange={e => { const category = e.target.value as AssetCategory; setForm(current => ({ ...current, category, source: category === 'crypto' ? 'coingecko' : 'manual', currency: category === 'crypto' ? 'USD' : current.currency })) }}>{categories.map(item => <option key={item} value={item}>{t(`categories.${item}`)}</option>)}</select></div><div className="form-field"><label htmlFor="asset-currency">{t('form.currency')}</label><select id="asset-currency" value={form.currency} onChange={e => set('currency', e.target.value as AssetInput['currency'])}>{['BYN','USD','EUR','RUB','CNY','PLN'].map(item => <option key={item}>{item}</option>)}</select></div></div>
    <div className="form-field"><label htmlFor="asset-name">{t('form.name')}</label><input id="asset-name" required maxLength={120} value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('form.namePlaceholder')} autoFocus /></div>
    {form.category === 'crypto' && <div className="form-field"><label htmlFor="asset-coin">{t('fields.coin')}</label><select id="asset-coin" value={form.cryptoId} onChange={e => set('cryptoId', e.target.value)}>{coins.map(coin => <option key={coin.id} value={coin.id}>{coin.name}</option>)}</select></div>}
    <div className="form-field"><label htmlFor="asset-institution">{t('fields.institution')}</label><input id="asset-institution" maxLength={160} value={form.institution} onChange={e => set('institution', e.target.value)} placeholder={t('fields.institutionPlaceholder')} /></div>
    <div className="form-row"><div className="form-field"><label htmlFor="asset-quantity">{t('fields.quantity')}</label><NumberField id="asset-quantity" required min={0.000001} value={form.quantity} onChange={value => set('quantity', value)} /></div><div className="form-field"><label htmlFor="asset-price">{t('fields.unitPrice')}</label><NumberField id="asset-price" required min={0} value={form.unitPrice} onChange={value => set('unitPrice', value)} /></div></div>
    <div className="form-row"><div className="form-field"><label htmlFor="asset-return">{t('fields.expectedReturn')}</label><NumberField id="asset-return" value={form.expectedReturn} onChange={value => set('expectedReturn', value)} /></div><div className="form-field"><label htmlFor="asset-source">{t('form.source')}</label><select id="asset-source" value={form.source} onChange={e => set('source', e.target.value)}><option value="manual">{t('form.manual')}</option><option value="nbrb">{t('form.nbrb')}</option>{form.category === 'crypto' && <option value="coingecko">CoinGecko · USD</option>}</select></div></div>
    {(form.category === 'deposit' || form.category === 'investment') && <div className="form-field"><label htmlFor="asset-payout-date">{t('fields.maturityDate')}</label><input id="asset-payout-date" type="date" value={form.payoutDate} onChange={e => set('payoutDate', e.target.value)} /><small className="field-hint">{t('fields.maturityDateHint')}</small></div>}
    {form.category === 'deposit' && <div className="form-row"><div className="form-field"><label htmlFor="asset-interest-start">{t('fields.interestStartDate')}</label><input id="asset-interest-start" type="date" value={form.interestStartDate} onChange={e => set('interestStartDate', e.target.value)} /><small className="field-hint">{t('fields.assetInterestStartHint')}</small></div><div className="form-field"><label htmlFor="asset-capitalization">{t('fields.capitalization')}</label><select id="asset-capitalization" value={form.capitalization ? 'yes' : 'no'} onChange={e => set('capitalization', e.target.value === 'yes')}><option value="no">{t('fields.withoutCapitalization')}</option><option value="yes">{t('fields.withCapitalization')}</option></select></div></div>}
    <div className="form-field"><label htmlFor="asset-notes">{t('fields.notes')}</label><textarea id="asset-notes" value={form.notes} onChange={e => set('notes', e.target.value)} maxLength={2000} rows={2} /></div>
    {error && <div className="form-error">{error}</div>}
    <div className="modal-actions">{asset && <button type="button" className="danger-button" onClick={remove} disabled={busy}><Trash2 size={15} />{t('fields.delete')}</button>}<span className="modal-spacer" /><button type="button" className="secondary-button" onClick={onClose}>{t('common.cancel')}</button><button type="submit" className="primary-button" disabled={busy}>{asset ? <Save size={16} /> : <Plus size={16} />}{t('common.save')}</button></div>
  </form></Modal>
}

export function LiabilityForm({ liability, onClose }: { liability?: Liability; onClose: () => void }) {
  const { t } = useTranslation()
  const { saveLiability, deleteLiability } = usePortfolio()
  const [form, setForm] = useState<LiabilityInput>({ name: liability?.name || '', institution: liability?.institution || '', principal: liability?.principal || 0, balance: liability?.balance || 0, interestRate: liability?.interest_rate || 0, monthlyPayment: liability?.monthly_payment || 0, nextPaymentDate: liability?.next_payment_date || '', endDate: liability?.end_date || '', interestStartDate: liability?.interest_start_date || '', notes: liability?.notes || '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof LiabilityInput>(key: K, value: LiabilityInput[K]) => setForm(current => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try { await saveLiability({ ...form, id: liability?.id }); onClose() }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
    finally { setBusy(false) }
  }
  const remove = async () => {
    if (!liability || !window.confirm(t('fields.deleteLoanConfirm'))) return
    setBusy(true)
    try { await deleteLiability(liability.id); onClose() } finally { setBusy(false) }
  }
  return <Modal title={liability ? t('fields.editLoan') : t('liabilities.add')} subtitle={t('fields.loanSubtitle')} onClose={onClose}><form onSubmit={submit}>
    <div className="form-field"><label htmlFor="loan-name">{t('form.name')}</label><input id="loan-name" required value={form.name} onChange={e => set('name', e.target.value)} autoFocus /></div>
    <div className="form-field"><label htmlFor="loan-institution">{t('fields.institution')}</label><input id="loan-institution" value={form.institution} onChange={e => set('institution', e.target.value)} /></div>
    <div className="form-row"><div className="form-field"><label htmlFor="loan-principal">{t('fields.principal')}</label><NumberField id="loan-principal" required min={0.01} value={form.principal} onChange={value => set('principal', value)} /></div><div className="form-field"><label htmlFor="loan-balance">{t('liabilities.debt')}</label><NumberField id="loan-balance" required min={0} value={form.balance} onChange={value => set('balance', value)} /></div></div>
    <div className="form-row"><div className="form-field"><label htmlFor="loan-rate">{t('liabilities.rate')}</label><NumberField id="loan-rate" min={0} value={form.interestRate} onChange={value => set('interestRate', value)} /></div><div className="form-field"><label htmlFor="loan-payment">{t('liabilities.monthly')}</label><NumberField id="loan-payment" min={0} value={form.monthlyPayment} onChange={value => set('monthlyPayment', value)} /></div></div>
    <div className="form-row"><div className="form-field"><label htmlFor="loan-next">{t('liabilities.next')}</label><input id="loan-next" type="date" value={form.nextPaymentDate} onChange={e => set('nextPaymentDate', e.target.value)} /></div><div className="form-field"><label htmlFor="loan-end">{t('liabilities.repayment')}</label><input id="loan-end" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div></div>
    <div className="form-field"><label htmlFor="loan-interest-start">{t('fields.interestStartDate')}</label><input id="loan-interest-start" type="date" value={form.interestStartDate} onChange={e => set('interestStartDate', e.target.value)} /><small className="field-hint">{t('fields.interestStartHint')}</small></div>
    <div className="form-field"><label htmlFor="loan-notes">{t('fields.notes')}</label><textarea id="loan-notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} /></div>
    {error && <div className="form-error">{error}</div>}
    <div className="modal-actions">{liability && <button type="button" className="danger-button" onClick={remove} disabled={busy}><Trash2 size={15} />{t('fields.delete')}</button>}<span className="modal-spacer" /><button type="button" className="secondary-button" onClick={onClose}>{t('common.cancel')}</button><button type="submit" className="primary-button" disabled={busy}><Save size={16} />{t('common.save')}</button></div>
  </form></Modal>
}
