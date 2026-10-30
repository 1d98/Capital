export type AssetCategory = 'Недвижимость' | 'Вклады' | 'Инвестиции' | 'Наличные'
export type Page = 'overview' | 'assets' | 'liabilities' | 'forecast' | 'data' | 'settings'

export interface Asset {
  id: number
  name: string
  subtitle: string
  category: AssetCategory
  value: number
  currency: string
  originalValue: string
  change: number
  color: string
  icon: 'home' | 'bank' | 'chart' | 'cash' | 'car'
  date: string
}

export const assets: Asset[] = [
  { id: 1, name: 'Квартира в Минске', subtitle: 'ул. Кальварийская, 54 м²', category: 'Недвижимость', value: 264500, currency: 'BYN', originalValue: '264 500 BYN', change: 3.2, color: '#2487ed', icon: 'home', date: '20 окт. 2026' },
  { id: 2, name: 'Валютный вклад', subtitle: 'Беларусбанк · до 12.2027', category: 'Вклады', value: 51045, currency: 'USD', originalValue: '17 500 USD', change: 1.8, color: '#77b6f2', icon: 'bank', date: '24 окт. 2026' },
  { id: 3, name: 'Сберегательный вклад', subtitle: 'Белинвестбанк · 13,5% годовых', category: 'Вклады', value: 32800, currency: 'BYN', originalValue: '32 800 BYN', change: 11.4, color: '#d3a85f', icon: 'bank', date: '24 окт. 2026' },
  { id: 4, name: 'Облигации РБ', subtitle: '12 выпусков · доходность 12,1%', category: 'Инвестиции', value: 24760, currency: 'BYN', originalValue: '24 760 BYN', change: 9.6, color: '#bd806a', icon: 'chart', date: '23 окт. 2026' },
  { id: 5, name: 'Автомобиль', subtitle: 'Volkswagen Tiguan · 2021', category: 'Недвижимость', value: 58400, currency: 'BYN', originalValue: '58 400 BYN', change: -2.4, color: '#9ca3b2', icon: 'car', date: '15 окт. 2026' },
  { id: 6, name: 'Наличные и счета', subtitle: 'BYN, USD и EUR', category: 'Наличные', value: 18720, currency: 'BYN', originalValue: '18 720 BYN', change: 0.4, color: '#d4879a', icon: 'cash', date: '25 окт. 2026' },
]

export const history = [
  { month: 'Ноя', value: 302100, assets: 375200, liabilities: 73100 },
  { month: 'Дек', value: 308400, assets: 379700, liabilities: 71300 },
  { month: 'Янв', value: 312900, assets: 383100, liabilities: 70200 },
  { month: 'Фев', value: 316200, assets: 385600, liabilities: 69400 },
  { month: 'Мар', value: 323800, assets: 392100, liabilities: 68300 },
  { month: 'Апр', value: 329500, assets: 396800, liabilities: 67300 },
  { month: 'Май', value: 337100, assets: 403300, liabilities: 66200 },
  { month: 'Июн', value: 341800, assets: 406900, liabilities: 65100 },
  { month: 'Июл', value: 348600, assets: 412700, liabilities: 64100 },
  { month: 'Авг', value: 356900, assets: 420000, liabilities: 63100 },
  { month: 'Сен', value: 365300, assets: 427300, liabilities: 62000 },
  { month: 'Окт', value: 375025, assets: 450225, liabilities: 75200 },
]

export const rates = [
  { code: 'USD', name: 'Доллар США', rate: '2,9170', change: 0.32, symbol: '$' },
  { code: 'EUR', name: 'Евро', rate: '3,4012', change: -0.14, symbol: '€' },
  { code: 'RUB', name: '100 рос. рублей', rate: '3,6115', change: 0.21, symbol: '₽' },
  { code: 'CNY', name: 'Китайский юань', rate: '0,4097', change: 0.08, symbol: '¥' },
]

export const forecast = [
  { year: '2026', base: 375, optimistic: 375, conservative: 375 },
  { year: '2027', base: 443, optimistic: 459, conservative: 426 },
  { year: '2028', base: 518, optimistic: 555, conservative: 482 },
  { year: '2029', base: 601, optimistic: 665, conservative: 544 },
  { year: '2030', base: 694, optimistic: 791, conservative: 613 },
  { year: '2031', base: 797, optimistic: 936, conservative: 688 },
  { year: '2032', base: 912, optimistic: 1103, conservative: 772 },
  { year: '2033', base: 1040, optimistic: 1295, conservative: 865 },
  { year: '2034', base: 1182, optimistic: 1515, conservative: 968 },
  { year: '2035', base: 1340, optimistic: 1768, conservative: 1082 },
  { year: '2036', base: 1516, optimistic: 2057, conservative: 1209 },
]

export const liabilities = [
  { id: 1, name: 'Ипотека', bank: 'Беларусбанк', left: 68400, initial: 132000, rate: 9.5, payment: 1240, until: 'июнь 2032', color: '#2487ed' },
  { id: 2, name: 'Кредитная карта', bank: 'Белинвестбанк', left: 6800, initial: 10000, rate: 14.9, payment: 850, until: 'август 2027', color: '#c0886d' },
]
