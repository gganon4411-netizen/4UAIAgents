import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, Clock, Trophy, Percent, Zap,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { getTierColor, getAvailabilityInfo } from '../../hooks/useAgents'
import { getRelativeTime } from '../../hooks/useRequests'
import api from '../../lib/api'

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
  'AI/ML': 'bg-purple-500/10 text-purple-400',
  'UI/UX': 'bg-pink-500/10 text-pink-400',
  Backend: 'bg-teal-500/10 text-teal-400',
  Infrastructure: 'bg-slate-500/10 text-slate-400',
}

function StarBar({ stars, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-2xs">
      <span className="w-3 text-base-300 text-right">{stars}</span>
      <Star className="w-2.5 h-2.5 text-acid fill-acid" />
      <div className="flex-1 h-1.5 rounded-full bg-base-700 overflow-hidden">
        <div className="h-full rounded-full bg-acid transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-base-400 font-mono">{count}</span>
    </div>
  )
}

function AgentProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
      <div className="h-4 w-16 rounded bg-base-700 mb-5" />
      <div className="p-5 rounded-2xl bg-base-800/60 border border-base-600/50 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-base-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-32 rounded bg-base-700" />
            <div className="h-4 w-full rounded bg-base-700" />
            <div className="flex gap-1.5 mt-3">
              <div className="h-5 w-14 rounded-md bg-base-700" />
              <div className="h-5 w-16 rounded-md bg-base-700" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-base-600/30">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded bg-base-700" />
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl bg-base-800/40 border border-base-600/30 mb-5">
        <div className="h-4 w-28 rounded bg-base-700 mb-3" />
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 rounded bg-base-700/50" />
          ))}
        </div>
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-4 w-24 rounded bg-base-700" />
        <div className="h-20 rounded-xl bg-base-800/50 border border-base-600/30" />
        <div className="h-20 rounded-xl bg-base-800/50 border border-base-600/30" />
      </div>
    </div>
  )
}

export default function AgentProfilePage() {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showAllPortfolio, setShowAllPortfolio] = useState(false)

  useEffect(() => {
    if (!agentId) return
    setLoading(true)
    setError(null)
    api.agents.get(agentId)
      .then(setAgent)
      .catch((err) => setError(err.message || 'Failed to load agent'))
      .finally(() => setLoading(false))
  }, [agentId])

  if (loading) {
    return <AgentProfileSkeleton />
  }

  if (error || !agent) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-sm text-violet-light font-medium">{error || 'Agent not found.'}</p>
        <p className="text-2xs text-base-400 mt-1">The agent may have been removed or the link is invalid.</p>
        <button
          onClick={() => navigate('/app/agents')}
          className="mt-4 px-4 py-2 rounded-xl text-xs text-violet-light bg-violet/10 hover:bg-violet/20 transition-all"
        >
          Back to Agents
        </button>
      </div>
    )
  }

  const tierGradient = getTierColor(agent.tier)
  const avail = getAvailabilityInfo(agent.availability)
  const reviews = agent.reviews || []
  const portfolio = agent.portfolio || []
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3)
  const visiblePortfolio = showAllPortfolio ? portfolio : portfolio.slice(0, 3)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-base-300 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* Agent header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-5 rounded-2xl bg-base-800/60 border border-base-600/50 mb-5"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tierGradient} flex items-center justify-center text-xl font-bold text-white shrink-0`}>
            {agent.name.slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold">{agent.name}</h1>
              <span className={`px-2 py-0.5 rounded-md text-2xs font-medium bg-gradient-to-r ${tierGradient} text-white`}>
                {agent.tier}
              </span>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${avail.dotClass}`} />
                <span className={`text-2xs ${avail.textClass}`}>{avail.label}</span>
              </div>
            </div>

            <p className="text-xs text-base-200 mt-2 leading-relaxed">{agent.bio}</p>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(agent.specializations || []).map((s) => (
                <span
                  key={s}
                  className={`px-2 py-0.5 rounded-md text-2xs font-medium ${CATEGORY_COLORS[s] || 'bg-base-700 text-base-200'}`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-base-600/30">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-acid">
              <Star className="w-3.5 h-3.5 fill-acid" />
              <span className="text-base font-bold font-mono">{agent.rating}</span>
            </div>
            <p className="text-2xs text-base-400 mt-0.5">{agent.totalReviews} reviews</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-violet-light">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-base font-bold font-mono">{agent.totalBuilds}</span>
            </div>
            <p className="text-2xs text-base-400 mt-0.5">builds</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-white">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-base font-bold font-mono">{agent.avgDelivery}</span>
            </div>
            <p className="text-2xs text-base-400 mt-0.5">avg delivery</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-acid">
              <Percent className="w-3.5 h-3.5" />
              <span className="text-base font-bold font-mono">{agent.pitchWinRate}%</span>
            </div>
            <p className="text-2xs text-base-400 mt-0.5">win rate</p>
          </div>
        </div>
      </motion.div>

      {/* Rating breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="p-4 rounded-xl bg-base-800/40 border border-base-600/30 mb-5"
      >
        <h2 className="text-sm font-bold mb-3">Rating Breakdown</h2>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((s) => (
            <StarBar key={s} stars={s} count={agent.starBreakdown?.[s] ?? 0} total={agent.totalReviews} />
          ))}
        </div>
      </motion.div>

      {/* Portfolio */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mb-5"
      >
        <h2 className="text-sm font-bold mb-3">Portfolio ({portfolio.length})</h2>
        <div className="space-y-2">
          {visiblePortfolio.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-base-800/50 border border-base-600/30 hover:border-violet/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-2xs font-medium ${CATEGORY_COLORS[p.category] || 'bg-base-700 text-base-200'}`}>
                    {p.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-acid fill-acid" />
                  <span className="text-2xs font-mono text-acid">{p.rating}</span>
                </div>
              </div>
              <p className="text-2xs text-base-300 mt-1.5 leading-relaxed">{p.description}</p>
              <span className="text-2xs text-base-400 mt-1 block">{getRelativeTime(p.date)}</span>
            </div>
          ))}
        </div>
        {portfolio.length > 3 && (
          <button
            onClick={() => setShowAllPortfolio(!showAllPortfolio)}
            className="flex items-center gap-1 mt-2 text-2xs text-violet-light hover:text-white transition-colors"
          >
            {showAllPortfolio ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {portfolio.length}</>}
          </button>
        )}
      </motion.div>

      {/* Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-sm font-bold mb-3">Reviews ({reviews.length})</h2>
        <div className="space-y-2">
          {visibleReviews.map((r) => (
            <div key={r.id} className="p-3 rounded-xl bg-base-800/50 border border-base-600/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-base-200">{r.author}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-acid fill-acid' : 'text-base-600'}`} />
                  ))}
                </div>
              </div>
              <p className="text-2xs text-base-300 mt-1.5 leading-relaxed">{r.text}</p>
              <span className="text-2xs text-base-400 mt-1 block">{getRelativeTime(r.date)}</span>
            </div>
          ))}
        </div>
        {reviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="flex items-center gap-1 mt-2 text-2xs text-violet-light hover:text-white transition-colors"
          >
            {showAllReviews ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {reviews.length}</>}
          </button>
        )}
      </motion.div>
    </div>
  )
}
