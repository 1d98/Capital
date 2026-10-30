export interface PaymentScheduleInput {
  balance: number
  interest_rate: number
  monthly_payment: number
  next_payment_date: string
  end_date: string
  interest_start_date?: string
}

export interface SchedulePayment {
  date: Date
  payment: number
  interest: number
  principal: number
  balance: number
}

export function addMonths(date: Date, count: number) {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + count
  const day = date.getUTCDate()
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(Date.UTC(year, month, Math.min(day, lastDay), 12))
}

const daysBetween = (from: Date, to: Date) => Math.max(0, Math.round((to.getTime() - from.getTime()) / 86400000))

export function buildPaymentSchedule(input: PaymentScheduleInput, limit = 360): SchedulePayment[] {
  const result: SchedulePayment[] = []
  const start = input.next_payment_date || input.end_date
  if (!start || input.monthly_payment <= 0 || input.balance <= 0) return result
  const firstDate = new Date(`${start}T12:00:00Z`)
  if (Number.isNaN(firstDate.getTime())) return result
  let previousDate = input.interest_start_date ? new Date(`${input.interest_start_date}T12:00:00Z`) : addMonths(firstDate, -1)
  if (Number.isNaN(previousDate.getTime())) previousDate = addMonths(firstDate, -1)
  let balance = input.balance
  for (let index = 0; index < limit && balance > 0.005; index += 1) {
    const date = addMonths(firstDate, index)
    const days = daysBetween(previousDate, date)
    const interest = balance * input.interest_rate / 100 * days / 365
    let payment = Math.min(input.monthly_payment, balance + interest)
    let principal = payment - interest
    if (principal <= 0) break
    balance = Math.max(0, balance - principal)
    const remainingInterest = balance * input.interest_rate / 100 * daysBetween(date, addMonths(date, 1)) / 365
    if (balance > 0 && balance + remainingInterest < 1) {
      payment += balance + remainingInterest
      principal = payment - interest
      balance = 0
    }
    result.push({ date, payment, interest, principal, balance })
    previousDate = date
  }
  return result
}
