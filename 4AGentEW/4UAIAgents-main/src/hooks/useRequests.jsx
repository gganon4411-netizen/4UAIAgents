import React, { createContext, useContext, useState, useCallback } from 'react'

const CATEGORIES = [
  'SaaS', 'Mobile', 'AI App', 'E-commerce', 'DeFi', 'NFT', 'DAO',
  'Analytics', 'Social', 'Gaming', 'Payments', 'DevTools',
]

const TIMELINES = ['24hrs', '3 days', '1 week', '2 weeks', 'Custom']

const STATUSES = ['Open', 'In Progress', 'Completed']

// Timestamps relative to now for freshness
const now = Date.now()
const min = (m) => now - m * 60 * 1000
const hr = (h) => now - h * 60 * 60 * 1000
const day = (d) => now - d * 24 * 60 * 60 * 1000

const SEED_REQUESTS = [
  {
    id: 'req_001',
    title: 'AI-powered customer support chatbot with RAG pipeline',
    description: 'Need a full chatbot SaaS that ingests docs, builds vector embeddings, and answers customer queries in real-time. Must include admin dashboard with analytics.',
    categories: ['AI App', 'SaaS'],
    budget: 4500,
    timeline: '2 weeks',
    status: 'Open',
    pitches: 12,
    author: 'alice_dev',
    createdAt: min(8),
    attachment: null,
  },
  {
    id: 'req_002',
    title: 'Cross-platform fitness tracker with Apple Health sync',
    description: 'React Native app that tracks workouts, syncs with Apple Health and Google Fit, and provides AI-generated training plans.',
    categories: ['Mobile', 'AI App'],
    budget: 6000,
    timeline: '2 weeks',
    status: 'Open',
    pitches: 9,
    author: 'fit_coder',
    createdAt: min(22),
    attachment: null,
  },
  {
    id: 'req_003',
    title: 'NFT marketplace with royalty enforcement',
    description: 'Solana-based NFT marketplace supporting royalty enforcement, collection offers, and rarity ranking. Needs clean UI similar to Tensor.',
    categories: ['NFT', 'E-commerce'],
    budget: 8000,
    timeline: '2 weeks',
    status: 'In Progress',
    pitches: 18,
    author: 'nft_whale',
    createdAt: min(45),
    attachment: null,
  },
  {
    id: 'req_004',
    title: 'Real-time analytics dashboard for Shopify stores',
    description: 'Dashboard that connects to Shopify API and displays live revenue, conversion rates, top products, and customer cohort analysis with exportable charts.',
    categories: ['Analytics', 'E-commerce'],
    budget: 3200,
    timeline: '1 week',
    status: 'Open',
    pitches: 7,
    author: 'shopify_max',
    createdAt: hr(1.5),
    attachment: null,
  },
  {
    id: 'req_005',
    title: 'DAO treasury management tool with multi-sig',
    description: 'Web app for DAOs to manage treasury, create payment proposals, and execute multi-sig transactions on Solana. Needs Squads integration.',
    categories: ['DAO', 'DeFi'],
    budget: 5500,
    timeline: '2 weeks',
    status: 'Open',
    pitches: 6,
    author: 'dao_builder',
    createdAt: hr(2),
    attachment: null,
  },
  {
    id: 'req_006',
    title: 'AI resume builder with ATS optimization',
    description: 'SaaS app where users paste job descriptions and get AI-optimized resumes. Needs template editor, PDF export, and subscription billing.',
    categories: ['AI App', 'SaaS'],
    budget: 2800,
    timeline: '1 week',
    status: 'Open',
    pitches: 14,
    author: 'career_ai',
    createdAt: hr(3),
    attachment: null,
  },
  {
    id: 'req_007',
    title: 'Jupiter swap aggregator UI with limit orders',
    description: 'Custom swap interface that integrates Jupiter V6 API, supports limit orders, DCA, and displays real-time charts with TradingView.',
    categories: ['DeFi', 'DevTools'],
    budget: 4000,
    timeline: '1 week',
    status: 'In Progress',
    pitches: 22,
    author: 'defi_anon',
    createdAt: hr(5),
    attachment: null,
  },
  {
    id: 'req_008',
    title: 'Social media scheduling tool with AI captions',
    description: 'Web app to schedule posts across Twitter, Instagram, LinkedIn. AI generates captions and suggests optimal posting times based on engagement data.',
    categories: ['Social', 'AI App', 'SaaS'],
    budget: 3500,
    timeline: '2 weeks',
    status: 'Open',
    pitches: 11,
    author: 'social_guru',
    createdAt: hr(8),
    attachment: null,
  },
  {
    id: 'req_009',
    title: 'On-chain game leaderboard with token rewards',
    description: 'Gaming leaderboard that tracks scores on-chain, distributes SPL token rewards to top players, and has a clean arcade-style UI.',
    categories: ['Gaming', 'DeFi'],
    budget: 2500,
    timeline: '3 days',
    status: 'Open',
    pitches: 5,
    author: 'gamer_sol',
    createdAt: hr(12),
    attachment: null,
  },
  {
    id: 'req_010',
    title: 'Stripe-integrated subscription billing portal',
    description: 'White-label billing portal with Stripe integration. Needs plan management, usage metering, invoices, customer portal, and webhook handling.',
    categories: ['Payments', 'SaaS'],
    budget: 3800,
    timeline: '1 week',
    status: 'Completed',
    pitches: 16,
    author: 'stripe_dev',
    createdAt: day(1),
    attachment: null,
  },
  {
    id: 'req_011',
    title: 'AI code review bot for GitHub PRs',
    description: 'GitHub App that automatically reviews pull requests using Claude, suggests improvements, checks for security issues, and posts inline comments.',
    categories: ['AI App', 'DevTools'],
    budget: 5000,
    timeline: '2 weeks',
    status: 'Open',
    pitches: 8,
    author: 'code_review',
    createdAt: day(1.5),
    attachment: null,
  },
  {
    id: 'req_012',
    title: 'Mobile wallet app with fiat on-ramp',
    description: 'React Native Solana wallet with biometric auth, fiat on-ramp via MoonPay, token swaps, NFT gallery, and transaction history.',
    categories: ['Mobile', 'DeFi', 'Payments'],
    budget: 9500,
    timeline: '2 weeks',
    status: 'In Progress',
    pitches: 25,
    author: 'wallet_king',
    createdAt: day(2),
    attachment: null,
  },
  {
    id: 'req_013',
    title: 'E-commerce storefront with headless CMS',
    description: 'Next.js storefront connected to Sanity CMS. Product pages, cart, Stripe checkout, order tracking, and admin panel for inventory.',
    categories: ['E-commerce', 'SaaS'],
    budget: 4200,
    timeline: '1 week',
    status: 'Completed',
    pitches: 13,
    author: 'ecom_builder',
    createdAt: day(3),
    attachment: null,
  },
  {
    id: 'req_014',
    title: 'Real-time multiplayer trivia game',
    description: 'WebSocket-based trivia game supporting 100+ concurrent players. Needs lobby system, timed rounds, scoring, and animated UI.',
    categories: ['Gaming', 'Social'],
    budget: 3000,
    timeline: '1 week',
    status: 'Open',
    pitches: 4,
    author: 'trivia_dev',
    createdAt: day(4),
    attachment: null,
  },
  {
    id: 'req_015',
    title: 'Personal finance tracker with bank API integration',
    description: 'Web app that connects to bank accounts via Plaid, categorizes transactions with AI, and provides spending insights with interactive charts.',
    categories: ['Analytics', 'AI App'],
    budget: 5200,
    timeline: '2 weeks',
    status: 'Open',
    pitches: 10,
    author: 'finance_ai',
    createdAt: day(5),
    attachment: null,
  },
]

const RequestsContext = createContext(null)

export function RequestsProvider({ children }) {
  const [requests, setRequests] = useState(SEED_REQUESTS)

  const addRequest = useCallback((newReq) => {
    const request = {
      ...newReq,
      id: 'req_' + Date.now(),
      pitches: 0,
      author: 'you',
      createdAt: Date.now(),
      status: 'Open',
    }
    setRequests((prev) => [request, ...prev])
    return request
  }, [])

  return (
    <RequestsContext.Provider value={{ requests, addRequest, CATEGORIES, TIMELINES, STATUSES }}>
      {children}
    </RequestsContext.Provider>
  )
}

export function useRequests() {
  const ctx = useContext(RequestsContext)
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider')
  return ctx
}

// Helper to get human-readable relative time
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

// Check if posted within last hour
export function isRecent(timestamp) {
  return Date.now() - timestamp < 60 * 60 * 1000
}

// Get opacity class based on age
export function getAgeFade(timestamp) {
  const hrs = (Date.now() - timestamp) / (60 * 60 * 1000)
  if (hrs < 1) return 'opacity-100'
  if (hrs < 6) return 'opacity-95'
  if (hrs < 24) return 'opacity-85'
  if (hrs < 72) return 'opacity-75'
  return 'opacity-65'
}
