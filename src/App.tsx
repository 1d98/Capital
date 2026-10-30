import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Bell, CalendarDays, ChartNoAxesCombined, ChevronDown, CircleHelp, Database, LayoutDashboard, Menu, Moon, Search, Settings, Sun, TrendingUp, WalletCards, X } from 'lucide-react'
import { Modal } from './components/UI'
import { AssetForm } from './components/Forms'
import { useSettings } from './useSettings'
import { usePortfolio } from './usePortfolio'
import type { Page } from './types'
import { money, currency } from './utils'
import './App.css'
import './themes.css'
import './settings.css'
import './calendar.css'
import './production.css'

const loadDashboard = () => import('./pages/Dashboard')
const loadPortfolio = () => import('./pages/Portfolio')
const loadCalendarPage = () => import('./pages/CalendarPage')
const loadForecast = () => import('./pages/Forecast')
const loadDataPage = () => import('./pages/DataPage')
const loadSettingsPage = () => import('./pages/SettingsPage')
const Dashboard = lazy(loadDashboard)
const AssetsPage = lazy(() => loadPortfolio().then(module => ({ default: module.AssetsPage })))
const LiabilitiesPage = lazy(() => loadPortfolio().then(module => ({ default: module.LiabilitiesPage })))
const CalendarPage = lazy(loadCalendarPage)
const Forecast = lazy(loadForecast)
const DataPage = lazy(loadDataPage)
const SettingsPage = lazy(loadSettingsPage)

const navigation = [
  { id: 'overview' as Page, label: 'nav.overview', icon: LayoutDashboard },
  { id: 'assets' as Page, label: 'nav.assets', icon: WalletCards },
  { id: 'liabilities' as Page, label: 'nav.liabilities', icon: ChartNoAxesCombined },
  { id: 'calendar' as Page, label: 'nav.calendar', icon: CalendarDays },
  { id: 'forecast' as Page, label: 'nav.forecast', icon: TrendingUp },
]

function Logo() {
  const { t } = useTranslation()
  return <div className="brand"><svg width="33" height="33" viewBox="205 205 614 614" fill="none" aria-hidden="true"><rect x="205" y="205" width="614" height="614" rx="145" fill="#2487ed"/><path d="M350 648V508M512 648V342M674 648V437" stroke="#fff" strokeWidth="72" strokeLinecap="round"/></svg><div><strong>{t('brand.name')}</strong><span>{t('brand.tagline')}</span></div></div>
}

export default function App() {
  const { t } = useTranslation()
  const settings = useSettings()
  const { state, loading, error, clearError, rateNotice, clearRateNotice, reload } = usePortfolio()
  const [page, setPage] = useState<Page>('overview')
  const [assetForm, setAssetForm] = useState(false)
  const [help, setHelp] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [query, setQuery] = useState('')
  const [assetFilter, setAssetFilter] = useState('all')
  const [assetQuery, setAssetQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = (next: Page) => { setPage(next); setMobileMenu(false); setSearchOpen(false); setQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); setSearchOpen(true) }
      if (event.key === 'Escape') { setSearchOpen(false); setNotifications(false); clearRateNotice(); setAssetForm(false); setHelp(false) }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [clearRateNotice])
  useEffect(() => {
    if (loading) return
    const timer = window.setTimeout(() => {
      void loadPortfolio()
      void loadForecast()
      void loadDataPage()
      void loadSettingsPage()
    }, 100)
    return () => window.clearTimeout(timer)
  }, [loading])
  const initials = settings.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
  const searchItems: { name: string; page: Page; filter?: string; assetQuery?: string }[] = [
    ...navigation.map(item => ({ name: t(item.label), page: item.id })),
    { name: t('nav.data'), page: 'data' }, { name: t('nav.settings'), page: 'settings' },
    ...['property', 'deposit', 'investment', 'cash', 'vehicle', 'crypto', 'other'].map(category => ({ name: t(`categories.${category}`), page: 'assets' as Page, filter: category, assetQuery: '' })),
    ...(state?.assets.map(asset => ({ name: asset.name, page: 'assets' as Page, filter: 'all', assetQuery: asset.name })) || []),
  ]
  const filteredSearchItems = searchItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
  const chooseSearchResult = (item: typeof searchItems[number]) => {
    if (item.filter) setAssetFilter(item.filter)
    if (item.assetQuery !== undefined) setAssetQuery(item.assetQuery)
    navigate(item.page)
  }

  if (loading) return <div className="app-loading"><Logo /><div className="loading-spinner" /></div>
  if (error && !state) return <div className="app-loading"><Logo /><p>{error}</p><button className="primary-button" onClick={reload}>{t('data.refresh')}</button></div>

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
      <div className="sidebar-top"><Logo /><button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label={t('common.close')}><X size={20} /></button></div>
      <nav className="main-nav"><span className="nav-caption">{t('nav.capital')}</span>{navigation.map(item => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><item.icon size={19} strokeWidth={1.7} /><span>{t(item.label)}</span>{(item.id === 'assets' || item.id === 'liabilities') && <small>{item.id === 'assets' ? state?.assets.length || 0 : state?.liabilities.length || 0}</small>}</button>)}<span className="nav-caption second">{t('nav.system')}</span><button className={page === 'data' ? 'active' : ''} onClick={() => navigate('data')}><Database size={19} strokeWidth={1.7} /><span>{t('nav.data')}</span></button><button className={page === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><Settings size={19} strokeWidth={1.7} /><span>{t('nav.settings')}</span></button></nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-help"><div className="help-icon"><CircleHelp size={20} /></div><strong>{t('nav.help')}</strong><p>{t('nav.helpText')}</p><button onClick={() => setHelp(true)}>{t('nav.guide')} <span>↗</span></button></div>
      <button className="sidebar-profile" onClick={() => navigate('settings')}><div className="avatar">{initials}</div><div><strong>{settings.name}</strong><span>{t('nav.personal')}</span></div><ChevronDown size={15} /></button>
      <div className="sidebar-version">Capital · v1.0</div>
    </aside>
    {mobileMenu && <div className="sidebar-overlay" onClick={() => setMobileMenu(false)} />}
    <main className="main-content">
      <div className="mobile-header"><button className="icon-button" onClick={() => setMobileMenu(true)} aria-label={t('common.openMenu')}><Menu size={21} /></button><span>{t(`nav.${page}`)}</span><button className="icon-button" onClick={settings.toggleTheme} aria-label={t(settings.theme === 'light' ? 'common.enableDark' : 'common.enableLight')}>{settings.theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}</button></div>
      <div className="desktop-topbar"><label className="global-search"><Search size={16} /><input ref={searchRef} value={query} onFocus={() => setSearchOpen(true)} onChange={event => { setQuery(event.target.value); setSearchOpen(true) }} placeholder={t('common.search')} /><kbd>⌘ K</kbd>{searchOpen && <div className="search-results">{filteredSearchItems.slice(0, 7).map(item => <button key={`${item.page}-${item.name}-${item.filter || ''}`} onClick={() => chooseSearchResult(item)}>{item.name}<span>{t(`nav.${item.page}`)}</span></button>)}{!filteredSearchItems.length && <p>{t('fields.noResults')}</p>}<button className="search-close" onClick={() => setSearchOpen(false)}>{t('common.close')}</button></div>}</label><div><button className="theme-toggle" onClick={settings.toggleTheme}>{settings.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}<span>{t(settings.theme === 'light' ? 'common.dark' : 'common.light')}</span></button><button className="icon-button" onClick={() => setHelp(true)} aria-label={t('common.help')}><CircleHelp size={18} /></button><button className="icon-button notification" onClick={() => setNotifications(!notifications)} aria-label={t('common.notifications')}><Bell size={18} />{settings.paymentNotifications && <i />}</button></div></div>
      {notifications && <div className="notifications-panel panel"><h3>{t('fields.nextPayments')}</h3>{state?.liabilities.filter(item => item.balance > 0).map(item => <button key={item.id} onClick={() => { navigate('liabilities'); setNotifications(false) }}><strong>{item.name}</strong><span>{item.next_payment_date} · {money(item.monthly_payment)} {currency()}</span></button>)}{!state?.liabilities.some(item => item.balance > 0) && <p>{t('fields.noPayments')}</p>}</div>}
      {settings.rateNotifications && rateNotice && <div className="error-banner action-message" role="status">{t('data.refreshed')}<button onClick={clearRateNotice} aria-label={t('common.close')}>×</button></div>}
      {error && <div className="error-banner">{error}<button onClick={clearError} aria-label={t('common.close')}>×</button></div>}
      <AnimatePresence mode="wait"><motion.div key={page} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.18 }} className="page-content">
        <Suspense fallback={<div className="empty-state panel"><div className="loading-spinner" /></div>}>
          {page === 'overview' && <Dashboard onNavigate={navigate} onAdd={() => setAssetForm(true)} />}
          {page === 'assets' && <AssetsPage filter={assetFilter} query={assetQuery} onFilterChange={setAssetFilter} onQueryChange={setAssetQuery} />}
          {page === 'liabilities' && <LiabilitiesPage />}
          {page === 'calendar' && <CalendarPage onNavigate={navigate} />}
          {page === 'forecast' && <Forecast />}
          {page === 'data' && <DataPage />}
          {page === 'settings' && <SettingsPage />}
        </Suspense>
      </motion.div></AnimatePresence>
      <footer className="app-footer"><span>{t('footer.motto')}</span><span>{currency()}</span></footer>
    </main>
    <AnimatePresence>{assetForm && <AssetForm onClose={() => setAssetForm(false)} />}</AnimatePresence>
    <AnimatePresence>{help && <Modal title={t('fields.guideTitle')} subtitle={t('brand.tagline')} onClose={() => setHelp(false)}><p className="guide-text">{t('fields.guideText')}</p><button className="primary-button full-width" onClick={() => setHelp(false)}>{t('common.close')}</button></Modal>}</AnimatePresence>
  </div>
}
