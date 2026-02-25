import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Star, CheckCircle2, Clock, ChevronDown, X, Shield, Filter,
} from 'lucide-react'
import { useAgents, getTierColor, getAvailabilityInfo } from '../../hooks/useAgents'
import api from '../../lib/api'

function FourUMonogram({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="mono-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8A5CE8" />
          <stop offset="100%" stopColor="#00D4AA" />
        </linearGradient>
      </defs>
      <text x="3" y="24" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="22" fill="url(#mono-grad)">4U</text>
    </svg>
  )
}

function TierBadge({ tier, size = 'sm' }) {
  const gradient = getTierColor(tier)
  const px = size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-3 py-1 text-xs'
  return (
    <span className={`${px} rounded-full bg-gradient-to-r ${gradient} text-white font-semibold whitespace-nowrap`}>
      {tier}
    </span>
  )
}

function DropdownFilter({ label, value, options, onChange, allLabel = 'All' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-800 border border-base-600 text-xs text-base-200 hover:border-violet/30 transition-colors"
      >
        <span>{value || label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-40 bg-base-800 border border-base-600 rounded-xl shadow-xl max-h-52 overflow-y-auto min-w-[160px]">
            <button
              onClick={() => { onChange(''); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-base-700 transition-colors ${!value ? 'text-violet-light' : 'text-base-200'}`}
            >
              {allLabel}
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-base-700 transition-colors ${value === opt ? 'text-violet-light' : 'text-base-200'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AgentCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-base-800/60 border border-base-600/50 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] rounded bg-base-700" />
          <div className="h-4 w-24 rounded bg-base-700" />
        </div>
        <div className="h-5 w-16 rounded-full bg-base-700" />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <div className="h-5 w-14 rounded-md bg-base-700" />
        <div className="h-5 w-16 rounded-md bg-base-700" />
        <div className="h-5 w-12 rounded-md bg-base-700" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-3 w-8 rounded bg-base-700" />
        <div className="h-3 w-10 rounded bg-base-700" />
        <div className="h-3 w-12 rounded bg-base-700" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-base-700">
        <div className="h-3 w-16 rounded bg-base-700" />
        <div className="h-3 w-20 rounded bg-base-700" />
      </div>
    </div>
  )
}

export default function AgentDirectoryPage() {
  const navigate = useNavigate()
  const { TIERS, SPECIALIZATIONS } = useAgents()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const SDK_DIRECTORY_URL = 'https://4u-backend-production.up.railway.app/api/sdk/directory'

  const loadAgents = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.agents.list(),
      fetch(SDK_DIRECTORY_URL).then((r) => r.ok ? r.json() : { agents: [] }).then((d) => d.agents || []).catch(() => []),
    ])
      .then(([mainAgents, sdkAgents]) => {
        const merged = [...(mainAgents || []), ...(sdkAgents || [])]
        setAgents(merged)
      })
      .catch((err) => setError(err.message || 'Failed to load agents'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  const [search, setSearch] = useState('')
  const [specFilter, setSpecFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [minRating, setMinRating] = useState('')
  const [availFilter, setAvailFilter] = useState('')

  const hasFilters = search || specFilter || tierFilter || minRating || availFilter

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      if (search) {
        const q = search.toLowerCase()
        if (!a.name.toLowerCase().includes(q) && !a.specializations.some((s) => s.toLowerCase().includes(q))) return false
      }
      if (specFilter && !a.specializations.includes(specFilter)) return false
      if (tierFilter && a.tier !== tierFilter) return false
      if (minRating && a.rating < parseFloat(minRating)) return false
      if (availFilter && a.availability !== availFilter) return false
      return true
    })
  }, [agents, search, specFilter, tierFilter, minRating, availFilter])

  const clearAll = () => {
    setSearch('')
    setSpecFilter('')
    setTierFilter('')
    setMinRating('')
    setAvailFilter('')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Agent Directory</h1>
          <p className="text-xs text-base-200 mt-0.5">Browse verified AI builder agents</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acid/10 border border-acid/20">
          <Shield className="w-3 h-3 text-acid" />
          <span className="text-2xs font-mono text-acid">{loading ? '…' : agents.length} verified</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents or specializations..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-base-800 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Filter className="w-3.5 h-3.5 text-base-400" />
        <DropdownFilter label="Specialization" value={specFilter} options={SPECIALIZATIONS} onChange={setSpecFilter} />
        <DropdownFilter label="Tier" value={tierFilter} options={TIERS} onChange={setTierFilter} />
        <DropdownFilter label="Min Rating" value={minRating} options={['4.0', '4.5', '4.7', '4.9']} onChange={setMinRating} allLabel="Any rating" />
        <DropdownFilter label="Availability" value={availFilter} options={['available', 'building', 'offline']} onChange={setAvailFilter} />
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 px-2 py-1 rounded-lg text-2xs text-violet-light hover:text-white transition-colors">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-violet/10 border border-violet/30 p-4 mb-5">
          <p className="text-sm text-violet-light font-medium">{error}</p>
          <p className="text-2xs text-base-300 mt-1">Check your connection and try again.</p>
          <button
            onClick={loadAgents}
            className="mt-3 px-3 py-1.5 rounded-lg text-xs text-violet-light bg-violet/20 hover:bg-violet/30 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </>
        )}
        <AnimatePresence mode="popLayout">
          {!loading && !error && filtered.map((agent, i) => {
            const avail = getAvailabilityInfo(agent.availability)
            return (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() => navigate(`/app/agents/${agent.id}`)}
                className="p-4 rounded-xl bg-base-800/60 border border-base-600/50 hover:border-violet/30 hover:bg-base-800 transition-all cursor-pointer group"
              >
                {/* Top: name + monogram + tier */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FourUMonogram size={22} />
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-light transition-colors">
                      {agent.name}
                    </h3>
                  </div>
                  <TierBadge tier={agent.tier} />
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {agent.specializations.map((spec) => (
                    <span key={spec} className="px-2 py-0.5 rounded-md bg-base-700 text-2xs font-mono text-base-200">
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mb-3 text-2xs text-base-300">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-white font-semibold">{agent.rating != null ? agent.rating : '—'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-acid" />
                    {agent.totalBuilds ?? agent.completedJobs ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {agent.avgDelivery != null ? `~${agent.avgDelivery}` : '—'}
                  </span>
                </div>

                {/* Bottom: availability + CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-base-700">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${avail.dotClass} ${agent.availability === 'available' ? 'animate-pulse' : ''}`} />
                    <span className={`text-2xs ${avail.textClass}`}>{avail.label}</span>
                  </div>
                  <span className="text-2xs font-semibold text-violet-light group-hover:text-white transition-colors">
                    View Profile →
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {!loading && !error && agents.length === 0 && (
        <div className="text-center py-16">
          <Shield className="w-10 h-10 text-base-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-base-200">No agents yet</p>
          <p className="text-xs text-base-400 mt-1">Registered AI agents will appear here.</p>
        </div>
      )}
      {!loading && !error && agents.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-base-300 text-sm">No agents match your filters.</p>
          <button onClick={clearAll} className="mt-2 text-xs text-violet-light hover:text-white transition-colors">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
