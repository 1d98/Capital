import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { calendarEventsForMonth, type CalendarEvent } from '../calendar'
import { usePortfolio } from '../usePortfolio'
import { currency, money } from '../utils'
import type { Page } from '../types'

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export default function CalendarPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { t, i18n } = useTranslation()
  const { state } = usePortfolio()
  const [visibleMonth, setVisibleMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
  const [today] = useState(() => dateKey(new Date()))
  const [selectedDate, setSelectedDate] = useState(today)
  const events = useMemo(() => state ? calendarEventsForMonth(state.assets, state.liabilities, visibleMonth.getFullYear(), visibleMonth.getMonth()) : [], [state, visibleMonth])
  if (!state) return null

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const days = Array.from({ length: 42 }, (_, index) => new Date(year, month, index - firstWeekday + 1))
  const selectedEvents = events.filter(event => event.date === selectedDate)
  const monthTitle = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(visibleMonth)
  const selectedTitle = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${selectedDate}T12:00:00`))
  const changeMonth = (count: number) => {
    const next = new Date(year, month + count, 1)
    setVisibleMonth(next)
    setSelectedDate(dateKey(next))
  }
  const showToday = () => {
    const now = new Date()
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(dateKey(now))
  }
  const openEvent = (event: CalendarEvent) => onNavigate(event.kind === 'liability' ? 'liabilities' : 'assets')

  return <>
    <header className="page-header"><div><div className="eyebrow">{t('calendar.eyebrow')}</div><h1>{t('calendar.title')}</h1><p>{t('calendar.subtitle')}</p></div><button className="secondary-button" onClick={showToday}><CalendarDays size={16} />{t('calendar.today')}</button></header>
    <div className="calendar-layout">
      <section className="panel calendar-panel">
        <div className="calendar-toolbar"><button className="icon-button bordered" onClick={() => changeMonth(-1)} aria-label={t('calendar.previousMonth')}><ChevronLeft size={19} /></button><h2>{monthTitle}</h2><button className="icon-button bordered" onClick={() => changeMonth(1)} aria-label={t('calendar.nextMonth')}><ChevronRight size={19} /></button></div>
        <div className="calendar-weekdays">{Array.from({ length: 7 }, (_, index) => <span key={index}>{new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(new Date(2024, 0, index + 1))}</span>)}</div>
        <div className="calendar-grid">{days.map(day => {
          const key = dateKey(day)
          const dayEvents = events.filter(event => event.date === key)
          return <button key={key} className={`calendar-day ${day.getMonth() !== month ? 'outside' : ''} ${key === today ? 'today' : ''} ${key === selectedDate ? 'selected' : ''}`} onClick={() => setSelectedDate(key)} aria-label={new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }).format(day)}>
            <span className="calendar-day-number">{day.getDate()}</span>
            <span className="calendar-day-events">{dayEvents.slice(0, 2).map(event => <span className={`calendar-event-chip ${event.kind}`} key={event.id}><i />{event.title}</span>)}{dayEvents.length > 2 && <span className="calendar-more">{t('calendar.more', { count: dayEvents.length - 2 })}</span>}</span>
          </button>
        })}</div>
        <div className="calendar-legend">{(['liability', 'deposit', 'investment'] as const).map(kind => <span key={kind}><i className={kind} />{t(`calendar.${kind}`)}</span>)}</div>
      </section>
      <aside className="panel calendar-events-panel"><div className="eyebrow">{t('calendar.events')}</div><h2>{selectedTitle}</h2><div className="calendar-event-list">{selectedEvents.map(event => <button className={`calendar-event ${event.kind}`} key={event.id} onClick={() => openEvent(event)}><div><span>{t(`calendar.${event.kind}`)}</span><strong>{event.title}</strong></div><div><strong>{money(event.amount, 2)} {currency()}</strong><ArrowRight size={15} /></div></button>)}{!selectedEvents.length && <div className="empty-state"><CalendarDays size={24} /><p>{t('calendar.noEvents')}</p></div>}</div></aside>
    </div>
  </>
}
