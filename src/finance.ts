export function project(initial: number, years: number, contribution: number, annualReturn: number) {
  const months = years * 12
  const monthly = annualReturn / 100 / 12
  if (months === 0) return initial
  if (monthly === 0) return initial + contribution * months
  return initial * Math.pow(1 + monthly, months) + contribution * ((Math.pow(1 + monthly, months) - 1) / monthly)
}

export function historyForPeriod<T extends { date: string }>(history: T[], months: number) {
  if (!history.length) return history
  const end = new Date(`${history[history.length - 1].date}T12:00:00Z`)
  if (Number.isNaN(end.getTime())) return history
  const cutoff = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months + 1, 0, 12))
  cutoff.setUTCDate(Math.min(end.getUTCDate(), cutoff.getUTCDate()))
  return history.filter(item => {
    const timestamp = new Date(`${item.date}T12:00:00Z`).getTime()
    return timestamp >= cutoff.getTime() && timestamp <= end.getTime()
  })
}
