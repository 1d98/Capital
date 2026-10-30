import i18n from './i18n'

let balancesHidden = false
let baseCurrency = 'BYN'
let exchangeRates: Record<string, number> = { BYN: 1 }
export const setBalanceVisibility = (hidden: boolean) => { balancesHidden = hidden }
export const configureDisplayCurrency = (currency: string, rates: { code: string; rate: number; scale: number }[]) => {
  baseCurrency = currency
  exchangeRates = { BYN: 1, ...Object.fromEntries(rates.map(rate => [rate.code, rate.rate / rate.scale])) }
}
export const currency = () => baseCurrency
export const fromByn = (value: number) => value / (exchangeRates[baseCurrency] || 1)
export const toByn = (value: number) => value * (exchangeRates[baseCurrency] || 1)
export const numberValue = (value: number, digits = 0) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)
export const displayAmount = (value: number, digits = 2) => balancesHidden ? '••••••' : numberValue(value, digits)
export const money = (value: number, digits = 2) => balancesHidden ? '••••••' : numberValue(fromByn(value), digits)
