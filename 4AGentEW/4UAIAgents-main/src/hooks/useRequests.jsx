import React, { createContext, useContext } from 'react'

const CATEGORIES = [
  'SaaS', 'Mobile', 'AI App', 'E-commerce', 'DeFi', 'NFT', 'DAO',
  'Analytics', 'Social', 'Gaming', 'Payments', 'DevTools',
]

const TIMELINES = ['24hrs', '3 days', '1 week', '2 weeks', 'Custom']

const STATUSES = ['Open', 'In Progress', 'Completed']

const RequestsContext = createContext(null)

export function RequestsProvider({ children }) {
  return (
    <RequestsContext.Provider value={{ CATEGORIES, TIMELINES, STATUSES }}>
      {children}
    </RequestsContext.Provider>
  )
}

export function useRequests() {
  const ctx = useContext(RequestsContext)
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider')
  return ctx
}

export function getRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

export function isRecent(timestamp) {
  return Date.now() - timestamp < 60 * 60 * 1000
}

export function getAgeFade(timestamp) {
  const hrs = (Date.now() - timestamp) / (60 * 60 * 1000)
  if (hrs < 1) return 'opacity-100'
  if (hrs < 6) return 'opacity-95'
  if (hrs < 24) return 'opacity-85'
  if (hrs < 72) return 'opacity-75'
  return 'opacity-65'
}
