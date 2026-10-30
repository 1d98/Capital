import { useContext } from 'react'
import { PortfolioContext } from './portfolio-context'

export function usePortfolio() {
  const value = useContext(PortfolioContext)
  if (!value) throw new Error('usePortfolio must be used inside PortfolioProvider')
  return value
}
