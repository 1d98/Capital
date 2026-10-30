import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BellRing, Check, CheckCircle2, Globe2, Languages, Moon, RotateCcw, Save, SlidersHorizontal, Sun, UserRound } from 'lucide-react'
import { useSettings } from '../useSettings'
import { usePortfolio } from '../usePortfolio'
import { SectionTitle } from '../components/UI'
import { LegalSection } from '../components/LegalSection'
import type { Currency } from '../types'

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`settings-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}><span /></button>
}

function SettingRow({ children, title, description, control }: { children?: ReactNode; title: string; description: string; control: ReactNode }) {
  return <div className="setting-row"><div className="setting-row-copy">{children}<div><strong>{title}</strong><p>{description}</p></div></div>{control}</div>
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const settings = useSettings()
  const { state, setExternalRequests } = usePortfolio()
  const [draftName, setDraftName] = useState(settings.name)
  const [saved, setSaved] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const languages = [{ code: 'ru', label: 'Русский', short: 'RU' }, { code: 'en', label: 'English', short: 'EN' }, { code: 'be', label: 'Беларуская', short: 'BE' }]
  const saveProfile = (event: FormEvent) => {
    event.preventDefault()
    if (!draftName.trim()) return
    settings.setName(draftName.trim())
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }
  const reset = () => {
    settings.resetSettings()
    setDraftName('Алексей')
    setResetDone(true)
    window.setTimeout(() => setResetDone(false), 2500)
  }

  return <>
    <header className="page-header"><div><div className="eyebrow">{t('settings.eyebrow')}</div><h1>{t('settings.title')}</h1><p>{t('settings.subtitle')}</p></div><span className="outline-badge"><CheckCircle2 size={15} />{t('settings.localNote')}</span></header>
    <div className="settings-layout">
      <section className="panel settings-card">
        <SectionTitle title={t('settings.language')} subtitle={t('settings.languageHint')} action={<div className="settings-section-icon"><Languages size={20} /></div>} />
        <div className="language-options">{languages.map(language => <button key={language.code} className={i18n.language === language.code ? 'selected' : ''} onClick={() => i18n.changeLanguage(language.code)}><span>{language.short}</span><strong>{language.label}</strong>{i18n.language === language.code && <Check size={16} />}</button>)}</div>
        <div className="base-currency-field"><label htmlFor="base-currency">{t('settings.baseCurrency')}</label><select id="base-currency" value={settings.baseCurrency} onChange={event => settings.setBaseCurrency(event.target.value as Currency)}>{['BYN','USD','EUR','RUB','CNY','PLN'].map(item => <option key={item}>{item}</option>)}</select><p>{t('settings.baseCurrencyHint')}</p></div>
      </section>

      <section className="panel settings-card">
        <SectionTitle title={t('settings.appearance')} subtitle={t('settings.appearanceHint')} action={<div className="settings-section-icon"><Sun size={20} /></div>} />
        <div className="theme-options">
          <button className={settings.theme === 'light' ? 'selected' : ''} onClick={() => settings.setTheme('light')}><div className="theme-preview light-preview"><i /><span /><span /></div><div><Sun size={16} /><span><strong>{t('settings.light')}</strong><small>{t('settings.lightHint')}</small></span>{settings.theme === 'light' && <Check size={16} />}</div></button>
          <button className={settings.theme === 'dark' ? 'selected' : ''} onClick={() => settings.setTheme('dark')}><div className="theme-preview dark-preview"><i /><span /><span /></div><div><Moon size={16} /><span><strong>{t('settings.dark')}</strong><small>{t('settings.darkHint')}</small></span>{settings.theme === 'dark' && <Check size={16} />}</div></button>
        </div>
      </section>

      <section className="panel settings-card">
        <SectionTitle title={t('settings.profile')} subtitle={t('settings.profileHint')} action={<div className="settings-section-icon"><UserRound size={20} /></div>} />
        <form className="profile-form" onSubmit={saveProfile}><label htmlFor="display-name">{t('settings.displayName')}</label><div><input id="display-name" value={draftName} onChange={event => setDraftName(event.target.value)} placeholder={t('settings.namePlaceholder')} maxLength={30} required /><button className="primary-button" type="submit">{saved ? <Check size={16} /> : <Save size={16} />}{saved ? t('common.saved') : t('common.save')}</button></div></form>
      </section>

      <section className="panel settings-card">
        <SectionTitle title={t('settings.interface')} subtitle={t('settings.interfaceHint')} action={<div className="settings-section-icon"><SlidersHorizontal size={20} /></div>} />
        <SettingRow title={t('settings.hideBalances')} description={t('settings.hideBalancesHint')} control={<Toggle checked={settings.hiddenBalances} onChange={settings.toggleBalances} label={t('settings.hideBalances')} />} />
        <SettingRow title={t('settings.compact')} description={t('settings.compactHint')} control={<Toggle checked={settings.compact} onChange={settings.setCompact} label={t('settings.compact')} />} />
        <SettingRow title={t('settings.paymentNotifications')} description={t('settings.paymentNotificationsHint')} control={<Toggle checked={settings.paymentNotifications} onChange={settings.setPaymentNotifications} label={t('settings.paymentNotifications')} />}><BellRing size={18} /></SettingRow>
        <SettingRow title={t('settings.rateNotifications')} description={t('settings.rateNotificationsHint')} control={<Toggle checked={settings.rateNotifications} onChange={settings.setRateNotifications} label={t('settings.rateNotifications')} />} />
        <SettingRow title={t('settings.externalRequests')} description={t('settings.externalRequestsHint')} control={<Toggle checked={state?.externalRequests ?? true} onChange={value => { void setExternalRequests(value).catch(() => undefined) }} label={t('settings.externalRequests')} />}><Globe2 size={18} /></SettingRow>
      </section>
    </div>
    <LegalSection />
    <section className="settings-reset"><div><strong>{t('settings.reset')}</strong><p>{resetDone ? t('settings.resetDone') : t('settings.localNote')}</p></div><button className="secondary-button" onClick={reset}><RotateCcw size={15} />{t('settings.reset')}</button></section>
  </>
}
