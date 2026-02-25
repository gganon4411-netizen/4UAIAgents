import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, DollarSign, MessageSquare, ArrowUp, Filter, ChevronDown, X,
  Users, Circle, SlidersHorizontal, Sparkles
} from 'lucide-react'
import { useRequests, getRelativeTime, isRecent, getAgeFade } from '../../hooks/useRequests'
import api from '../../lib/api'

const BUDGET_RANGES = [
  { label: 'Any', min: 0, max: Infinity },
  { label: '< 1,000', min: 0, max: 1000 },
  { label: '1K – 3K', min: 1000, max: 3000 },
  { label: '3K – 5K', min: 3000, max: 5000 },
  { label: '5K – 10K', min: 5000, max: 10000 },
  { label: '10K+', min: 10000, max: Infinity },
]

const RECENCY_OPTIONS = [
  { label: 'All time', value: Infinity },
  { label: 'Last hour', value: 60 * 60 * 1000 },
  { label: 'Last 24h', value: 24 * 60 * 60 * 1000 },
  { label: 'Last 7d', value: 7 * 24 * 60 * 60 * 1000 },
]

const STATUS_COLORS = {
  Open: 'bg-acid/10 text-acid border-acid/20',
  'In Progress': 'bg-violet/10 text-violet-light border-violet/20',
  Completed: 'bg-base-600/30 text-base-200 border-base-500/30',
}

const CATEGORY_COLORS = {
  SaaS: 'bg-blue-500/10 text-blue-400',
  Mobile: 'bg-pink-500/10 text-pink-400',
  'AI App': 'bg-purple-500/10 text-purple-400',
  'E-commerce': 'bg-orange-500/10 text-orange-400',
  DeFi: 'bg-cyan-500/10 text-cyan-400',
  NFT: 'bg-yellow-500/10 text-yellow-400',
  DAO: 'bg-emerald-500/10 text-emerald-400',
  Analytics: 'bg-indigo-500/10 text-indigo-400',
  Social: 'bg-rose-500/10 text-rose-400',
  Gaming: 'bg-red-500/10 text-red-400',
  Payments: 'bg-green-500/10 text-green-400',
  DevTools: 'bg-teal-500/10 text-teal-400',
}

const PAGE_SIZE = 6

function FilterDropdown({ label, icon: Icon, value, options, onChange, open, onToggle }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onToggle(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onToggle])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => onToggle(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
          value !== options[0]?.label && value !== options[0]?.value
            ? 'bg-violet/10 text-violet-light border-violet/30'
            : 'bg-base-800 text-base-200 border-base-600/50 hover:border-base-500'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="whitespace-nowrap">{label}: {typeof value === 'string' ? value : options.find(o => o.value === value)?.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 min-w-[160px] bg-base-800 border border-base-600/50 rounded-xl shadow-xl shadow-black/40 z-50 overflow-hidden"
          >
            {options.map((opt) => {
              const optValue = opt.value !== undefined ? opt.value : opt.label
              const optLabel = opt.label
              const isActive = value === optValue || value === optLabel
              return (
                <button
                  key={optLabel}
                  onClick={() => { onChange(optValue !== undefined ? optValue : optLabel); onToggle(false) }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    isActive ? 'bg-violet/10 text-violet-light' : 'text-base-200 hover:bg-base-700/50 hover:text-white'
                  }`}
                >
                  {optLabel}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RequestCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-base-800/50 border border-base-600/50 animate-pulse">
      <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
        <div className="w-6 h-6 rounded-md bg-base-700" />
        <div className="w-4 h-3 rounded bg-base-700 mt-1" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 rounded bg-base-700 w-3/4" />
        <div className="h-3 rounded bg-base-700 w-full" />
        <div className="h-3 rounded bg-base-700 w-5/6" />
        <div className="flex gap-1.5 mt-2">
          <div className="h-5 w-14 rounded-md bg-base-700" />
          <div className="h-5 w-16 rounded-md bg-base-700" />
          <div className="h-5 w-12 rounded-md bg-base-700" />
        </div>
        <div className="flex gap-3 mt-2.5">
          <div className="h-3 w-20 rounded bg-base-700" />
          <div className="h-3 w-16 rounded bg-base-700" />
          <div className="h-3 w-14 rounded bg-base-700" />
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { CATEGORIES, STATUSES } = useRequests()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Refetch feed whenever the user navigates to the feed so new requests always show up fresh
  useEffect(() => {
    setLoading(true)
    setError(null)
    api.requests.list()
      .then(setRequests)
      .catch((err) => setError(err.message || 'Failed to load requests'))
      .finally(() => setLoading(false))
  }, [location.pathname])

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [budgetFilter, setBudgetFilter] = useState('Any')
  const [recencyFilter, setRecencyFilter] = useState(Infinity)
  const [statusFilter, setStatusFilter] = useState('All')

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null)

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef(null)

  // Votes
  const [votedItems, setVotedItems] = useState(new Set())
  const [votes, setVotes] = useState({})

  const toggleVote = (id) => {
    setVotedItems((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Filtered requests
  const filtered = useMemo(() => {
    return requests.filter((req) => {
      // Category
      if (categoryFilter !== 'All' && !req.categories.includes(categoryFilter)) return false

      // Budget
      const budgetRange = BUDGET_RANGES.find((b) => b.label === budgetFilter)
      if (budgetRange && (req.budget < budgetRange.min || req.budget > budgetRange.max)) return false

      // Recency
      if (recencyFilter !== Infinity && Date.now() - req.createdAt > recencyFilter) return false

      // Status
      if (statusFilter !== 'All' && req.status !== statusFilter) return false

      return true
    })
  }, [requests, categoryFilter, budgetFilter, recencyFilter, statusFilter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, filtered.length])

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [categoryFilter, budgetFilter, recencyFilter, statusFilter])

  const activeFilterCount = [
    categoryFilter !== 'All',
    budgetFilter !== 'Any',
    recencyFilter !== Infinity,
    statusFilter !== 'All',
  ].filter(Boolean).length

  const clearFilters = () => {
    setCategoryFilter('All')
    setBudgetFilter('Any')
    setRecencyFilter(Infinity)
    setStatusFilter('All')
  }

  const categoryOptions = [{ label: 'All' }, ...CATEGORIES.map((c) => ({ label: c }))]
  const budgetOptions = BUDGET_RANGES.map((b) => ({ label: b.label }))
  const recencyOptions = RECENCY_OPTIONS.map((r) => ({ label: r.label, value: r.value }))
  const statusOptions = [{ label: 'All' }, ...STATUSES.map((s) => ({ label: s }))]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-lg font-bold">Request Feed</h1>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-acid/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-acid" />
            </span>
            <span className="text-2xs font-mono text-acid">{loading ? '…' : filtered.length} live</span>
          </div>
        </div>
        <p className="text-xs text-base-200">Browse open requests from builders worldwide</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 px-2 py-2 text-base-300">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>

        <FilterDropdown
          label="Category"
          icon={Sparkles}
          value={categoryFilter}
          options={categoryOptions}
          onChange={setCategoryFilter}
          open={openDropdown === 'category'}
          onToggle={(v) => setOpenDropdown(v ? 'category' : null)}
        />
        <FilterDropdown
          label="Budget"
          icon={DollarSign}
          value={budgetFilter}
          options={budgetOptions}
          onChange={setBudgetFilter}
          open={openDropdown === 'budget'}
          onToggle={(v) => setOpenDropdown(v ? 'budget' : null)}
        />
        <FilterDropdown
          label="Recency"
          icon={Clock}
          value={recencyFilter}
          options={recencyOptions}
          onChange={setRecencyFilter}
          open={openDropdown === 'recency'}
          onToggle={(v) => setOpenDropdown(v ? 'recency' : null)}
        />
        <FilterDropdown
          label="Status"
          icon={Circle}
          value={statusFilter}
          options={statusOptions}
          onChange={setStatusFilter}
          open={openDropdown === 'status'}
          onToggle={(v) => setOpenDropdown(v ? 'status' : null)}
        />

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-400/10 transition-all whitespace-nowrap"
          >
            <X className="w-3 h-3" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-violet/10 border border-violet/30 p-4 mb-5">
          <p className="text-sm text-violet-light font-medium">{error}</p>
          <p className="text-2xs text-base-300 mt-1">Check your connection and try again.</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              api.requests.list().then(setRequests).catch((e) => setError(e.message)).finally(() => setLoading(false))
            }}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs text-violet-light bg-violet/20 hover:bg-violet/30 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-2.5">
        {loading && (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </>
        )}
        <AnimatePresence mode="popLayout">
          {!loading && !error && visible.map((req, i) => {
            const recent = isRecent(req.createdAt)
            const fadeCls = getAgeFade(req.createdAt)
            const voteCount = (votes[req.id] || req.pitches) + (votedItems.has(req.id) ? 1 : 0)

            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.25, delay: i < PAGE_SIZE ? i * 0.04 : 0 }}
                className={`flex gap-3 p-4 rounded-xl bg-base-800/50 border border-base-600/50 hover:border-violet/20 transition-all group cursor-pointer ${fadeCls}`}
              >
                {/* Vote column */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                  <button
                    onClick={() => toggleVote(req.id)}
                    className={`p-1 rounded-md transition-all ${
                      votedItems.has(req.id)
                        ? 'text-violet-light bg-violet/10'
                        : 'text-base-400 hover:text-white'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className={`text-xs font-mono ${votedItems.has(req.id) ? 'text-violet-light' : 'text-base-300'}`}>
                    {voteCount}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0" onClick={() => navigate(`/app/requests/${req.id}`)}>
                  {/* Title row */}
                  <div className="flex items-start gap-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-light transition-colors leading-snug flex-1">
                      {req.title}
                    </h3>
                    {recent && (
                      <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-acid" />
                      </span>
                    )}
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-base-300 mt-1 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {req.categories.map((cat) => (
                      <span
                        key={cat}
                        className={`px-2 py-0.5 rounded-md text-2xs font-medium ${
                          CATEGORY_COLORS[cat] || 'bg-base-700 text-base-200'
                        }`}
                      >
                        {cat}
                      </span>
                    ))}
                    <span className={`px-2 py-0.5 rounded-md text-2xs font-medium border ${STATUS_COLORS[req.status]}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-2.5 text-2xs text-base-300">
                    <span className="text-base-400">
                      by{' '}
                      {req.author_wallet ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/app/profile/${req.author_wallet}`) }}
                          className="text-base-200 hover:text-violet-light transition-colors hover:underline underline-offset-2"
                        >
                          {req.author}
                        </button>
                      ) : (
                        <span className="text-base-200">{req.author}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-acid font-medium">
                      <DollarSign className="w-3 h-3" />
                      {req.budget != null ? req.budget.toLocaleString() : '—'} USDC
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {req.timeline || '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-violet-light" />
                      {req.pitches} pitches
                    </span>
                    <span className="flex items-center gap-1 ml-auto text-base-400">
                      {getRelativeTime(req.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty state: no requests at all */}
        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-base-500 mx-auto mb-4" />
            <p className="text-sm font-medium text-base-200">No requests yet</p>
            <p className="text-xs text-base-400 mt-1">Be the first to post a build request.</p>
            <button
              onClick={() => navigate('/app/post')}
              className="mt-4 px-4 py-2.5 rounded-xl text-xs font-medium text-white bg-violet hover:bg-violet-light transition-all"
            >
              Post a Request
            </button>
          </div>
        )}
        {/* Empty state: filters match nothing */}
        {!loading && !error && requests.length > 0 && visible.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-8 h-8 text-base-400 mx-auto mb-3" />
            <p className="text-sm text-base-200 font-medium">No requests match your filters</p>
            <p className="text-xs text-base-400 mt-1">Try adjusting your filter criteria</p>
            <button
              onClick={clearFilters}
              className="mt-3 px-4 py-2 rounded-xl text-xs text-violet-light bg-violet/10 hover:bg-violet/20 transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {/* End of feed */}
        {!hasMore && visible.length > 0 && (
          <p className="text-center text-2xs text-base-400 py-4">You've reached the end</p>
        )}
      </div>
    </div>
  )
}
