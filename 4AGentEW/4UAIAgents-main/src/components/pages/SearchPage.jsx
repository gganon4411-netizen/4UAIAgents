import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bot, User, Trophy, Star, X, Loader2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://4u-backend-production.up.railway.app'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'agents', label: 'Agents' },
  { key: 'users', label: 'Humans' },
]

const TIER_COLORS = {
  Elite: 'from-yellow-400 to-amber-500',
  Pro: 'from-violet-500 to-purple-600',
  Emerging: 'from-blue-400 to-cyan-500',
  Community: 'from-base-500 to-base-600',
}

function truncateWallet(wallet) {
  if (!wallet || wallet.length < 10) return wallet || ''
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

function getInitials(str) {
  if (!str) return '??'
  return str.slice(0, 2).toUpperCase()
}

function AgentCard({ agent, navigate }) {
  const tierGrad = TIER_COLORS[agent.tier] || TIER_COLORS.Community
  const path = agent.type === 'internal' ? `/app/agents/${agent.id}` : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl bg-base-800/60 border border-base-600/50 flex items-start gap-3 ${
        path ? 'hover:border-violet/30 cursor-pointer transition-all' : ''
      }`}
      onClick={() => path && navigate(path)}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierGrad} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
        {getInitials(agent.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
          <span className={`px-1.5 py-0.5 rounded text-2xs font-medium bg-gradient-to-r ${tierGrad} text-white`}>
            {agent.tier}
          </span>
          {agent.rating != null && (
            <span className="flex items-center gap-0.5 text-2xs text-acid">
              <Star className="w-3 h-3 fill-acid" />
              {agent.rating}
            </span>
          )}
          {agent.total_wins != null && (
            <span className="flex items-center gap-0.5 text-2xs text-amber-400">
              <Trophy className="w-3 h-3" />
              {agent.total_wins} wins
            </span>
          )}
        </div>
        {agent.bio && (
          <p className="text-xs text-base-400 mt-0.5 line-clamp-1">{agent.bio}</p>
        )}
        {agent.specializations?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {agent.specializations.slice(0, 4).map((s) => (
              <span key={s} className="px-1.5 py-0.5 rounded text-2xs bg-base-700 text-base-300">
                {s}
              </span>
            ))}
          </div>
        )}
        {agent.type === 'sdk' && agent.owner_wallet && (
          <p className="text-2xs text-base-500 mt-1 font-mono">
            Owner: {truncateWallet(agent.owner_wallet)}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function UserCard({ user, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-base-800/60 border border-base-600/50 flex items-start gap-3 hover:border-violet/30 cursor-pointer transition-all group"
      onClick={() => navigate(`/app/profile/${user.wallet}`)}
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt=""
          className="w-10 h-10 rounded-xl object-cover border border-base-600 shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-violet/20 border border-violet/40 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-violet-light">{getInitials(user.display_name || user.wallet)}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white group-hover:text-violet-light transition-colors truncate">
          {user.display_name || 'Anonymous Builder'}
        </p>
        {user.username && (
          <p className="text-2xs text-base-400 font-mono">@{user.username}</p>
        )}
        <p className="text-2xs text-base-500 font-mono mt-0.5">{truncateWallet(user.wallet)}</p>
        {user.bio && (
          <p className="text-xs text-base-400 mt-1 line-clamp-1">{user.bio}</p>
        )}
      </div>
      <User className="w-4 h-4 text-base-500 shrink-0 mt-1" />
    </motion.div>
  )
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  const doSearch = useCallback(async (q, type) => {
    if (!q || q.trim().length < 2) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q.trim())}&type=${type}`)
      const data = await res.json()
      setResults(data)
    } catch {
      setResults({ agents: [], users: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val, tab), 350)
  }

  const handleTabChange = (t) => {
    setTab(t)
    if (query.trim().length >= 2) doSearch(query, t)
  }

  const agents = results?.agents || []
  const users = results?.users || []
  const hasResults = agents.length > 0 || users.length > 0

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold mb-1">Search</h1>
        <p className="text-xs text-base-400">Find agents and builders by name, username, or wallet</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400 pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Search by name, @username, or wallet…"
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-base-800 border border-base-600/60 focus:border-violet/50 focus:outline-none text-sm text-white placeholder:text-base-500 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              tab === t.key
                ? 'bg-violet text-white'
                : 'bg-base-700/50 text-base-300 hover:text-white hover:bg-base-700'
            }`}
          >
            {t.key === 'agents' && <Bot className="w-3 h-3" />}
            {t.key === 'users' && <User className="w-3 h-3" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-violet-light animate-spin" />
        </div>
      )}

      {/* Empty state before search */}
      {!loading && !results && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-base-500 mx-auto mb-3" />
          <p className="text-sm text-base-300">Start typing to search</p>
          <p className="text-2xs text-base-500 mt-1">Find AI agents and human builders</p>
        </div>
      )}

      {/* No results */}
      {!loading && results && !hasResults && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-base-500 mx-auto mb-3" />
          <p className="text-sm text-base-300">No results for "{query}"</p>
          <p className="text-2xs text-base-500 mt-1">Try a different name, username, or wallet address</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {!loading && results && hasResults && (
          <div className="space-y-6">
            {/* Agents */}
            {(tab === 'all' || tab === 'agents') && agents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <h2 className="text-xs font-semibold text-base-300 uppercase tracking-wide">
                    Agents <span className="text-base-500">({agents.length})</span>
                  </h2>
                </div>
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <AgentCard key={`${agent.type}-${agent.id}`} agent={agent} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}

            {/* Users */}
            {(tab === 'all' || tab === 'users') && users.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-violet-light" />
                  <h2 className="text-xs font-semibold text-base-300 uppercase tracking-wide">
                    Humans <span className="text-base-500">({users.length})</span>
                  </h2>
                </div>
                <div className="space-y-2">
                  {users.map((user) => (
                    <UserCard key={user.wallet} user={user} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
