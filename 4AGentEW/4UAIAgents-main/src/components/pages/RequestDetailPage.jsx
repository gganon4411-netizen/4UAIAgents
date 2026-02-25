import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, DollarSign, Users, Star, ChevronDown, ChevronUp,
  MessageSquare, X, CheckCircle2, Ban, ExternalLink
} from 'lucide-react'
import { getRelativeTime } from '../../hooks/useRequests'
import { getTierColor } from '../../hooks/useAgents'
import { useWallet } from '../../hooks/useWallet'
import api from '../../lib/api'

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

function PitchCard({ pitch, index, navigate, isAuthor, hasBuild, onHire }) {
  const [expanded, setExpanded] = useState(false)
  const tierGradient = getTierColor(pitch.agentTier)
  const showHireButton = isAuthor && !hasBuild && onHire

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      className="p-4 rounded-xl bg-base-800/60 border border-base-600/50 hover:border-violet/20 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Agent avatar */}
        <div
          className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white shrink-0 cursor-pointer"
          style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
          onClick={() => navigate(`/app/agents/${pitch.agentId}`)}
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierGradient} flex items-center justify-center text-sm font-bold text-white`}>
            {pitch.agentName.slice(0, 2)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Agent info row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-semibold text-white hover:text-violet-light transition-colors cursor-pointer"
              onClick={() => navigate(`/app/agents/${pitch.agentId}`)}
            >
              {pitch.agentName}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-2xs font-medium bg-gradient-to-r ${tierGradient} text-white`}>
              {pitch.agentTier}
            </span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-acid fill-acid" />
              <span className="text-2xs text-acid font-mono">{pitch.agentRating}</span>
            </div>
          </div>

          {/* Price and time */}
          <div className="flex items-center gap-3 mt-1.5 text-2xs text-base-300">
            <span className="flex items-center gap-1 font-mono text-acid font-medium text-xs">
              <DollarSign className="w-3 h-3" />
              {(pitch.price != null ? pitch.price : 0).toLocaleString()} USDC
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {pitch.estimatedTime}
            </span>
            <span className="text-base-400">
              {getRelativeTime(pitch.createdAt)}
            </span>
          </div>

          {/* Message */}
          <p className={`text-xs text-base-200 mt-2 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {pitch.message}
          </p>

          {(pitch.message?.length || 0) > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-2xs text-violet-light hover:text-white transition-colors mt-1 flex items-center gap-0.5"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
            </button>
          )}

          {/* Portfolio preview */}
          {pitch.portfolioPreview?.length > 0 && (
            <div className="flex gap-2 mt-2.5">
              {pitch.portfolioPreview.map((p) => (
                <div key={p.id} className="px-2 py-1 rounded-lg bg-base-700/50 border border-base-600/30 text-2xs text-base-200">
                  {p.name}
                  <span className="text-base-400 ml-1">• {p.category}</span>
                </div>
              ))}
            </div>
          )}

          {showHireButton && (
            <button
              onClick={() => onHire(pitch)}
              className="mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet text-white hover:bg-violet-light transition-all"
            >
              Hire This Agent
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function RequestDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
      <div className="h-4 w-16 rounded bg-base-700 mb-5" />
      <div className="p-5 rounded-2xl bg-base-800/60 border border-base-600/50 mb-5 space-y-3">
        <div className="h-6 w-4/5 rounded bg-base-700" />
        <div className="h-4 w-full rounded bg-base-700" />
        <div className="h-4 w-full rounded bg-base-700" />
        <div className="flex gap-1.5 mt-4">
          <div className="h-6 w-14 rounded-md bg-base-700" />
          <div className="h-6 w-16 rounded-md bg-base-700" />
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t border-base-600/30">
          <div className="h-3 w-24 rounded bg-base-700" />
          <div className="h-3 w-20 rounded bg-base-700" />
          <div className="h-3 w-16 rounded bg-base-700" />
        </div>
      </div>
      <div className="mb-4">
        <div className="h-4 w-28 rounded bg-base-700 mb-3" />
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-base-800/60 border border-base-600/50 h-24 bg-base-700/50" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RequestDetailPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { session, address } = useWallet()
  const [request, setRequest] = useState(null)
  const [pitches, setPitches] = useState([])
  const [build, setBuild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hireModalPitch, setHireModalPitch] = useState(null)
  const [hireSubmitting, setHireSubmitting] = useState(false)
  const [hireError, setHireError] = useState(null)
  const [buildActionSubmitting, setBuildActionSubmitting] = useState(false)

  const isAuthor =
    request?.author_wallet &&
    !!address &&
    String(request.author_wallet) === String(address)
  const hasBuild = build && build.status !== 'cancelled'

  useEffect(() => {
    if (!requestId) return
    setLoading(true)
    setError(null)
    Promise.all([
      api.requests.get(requestId),
      api.pitches.list(requestId),
    ])
      .then(([req, pitchList]) => {
        setRequest(req)
        setPitches(pitchList || [])
      })
      .catch((err) => setError(err.status === 404 ? 'Request not found.' : (err.message || 'Failed to load request')))
      .finally(() => setLoading(false))
  }, [requestId])

  useEffect(() => {
    if (!requestId) return
    api.hire
      .getBuild(requestId)
      .then(setBuild)
      .catch(() => setBuild(null))
  }, [requestId])

  // Poll build status every 10s while hired or building; stop when delivered or accepted
  useEffect(() => {
    if (!requestId || !build?.id) return
    const status = build.status
    if (status !== 'hired' && status !== 'building') return
    const interval = setInterval(() => {
      api.hire
        .getBuild(requestId)
        .then((updated) => {
          setBuild(updated)
        })
        .catch(() => {})
    }, 10_000)
    return () => clearInterval(interval)
  }, [requestId, build?.id, build?.status])

  const handleHireConfirm = async () => {
    if (!hireModalPitch || !requestId) return
    setHireError(null)
    setHireSubmitting(true)
    try {
      const newBuild = await api.hire.hire(requestId, hireModalPitch.id)
      setBuild(newBuild)
      setHireModalPitch(null)
    } catch (err) {
      setHireError(err.message || 'Failed to hire')
    } finally {
      setHireSubmitting(false)
    }
  }

  const handleAcceptDelivery = async () => {
    if (!build?.id) return
    setBuildActionSubmitting(true)
    try {
      const updated = await api.hire.accept(build.id)
      setBuild(updated)
      if (request) setRequest({ ...request, status: 'Completed' })
    } finally {
      setBuildActionSubmitting(false)
    }
  }

  const handleCancelBuild = async () => {
    if (!build?.id) return
    setBuildActionSubmitting(true)
    try {
      await api.hire.cancel(build.id)
      setBuild(null)
      if (request) setRequest({ ...request, status: 'Open', hired_agent_id: null })
    } finally {
      setBuildActionSubmitting(false)
    }
  }

  const hiredAgentName =
    build && pitches.find((p) => p.agentId === build.agent_id)?.agentName

  if (loading) {
    return <RequestDetailSkeleton />
  }

  if (error || !request) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-sm text-violet-light font-medium">{error || 'Request not found.'}</p>
        <p className="text-2xs text-base-400 mt-1">The request may have been removed or the link is invalid.</p>
        <button
          onClick={() => navigate('/app/feed')}
          className="mt-4 px-4 py-2 rounded-xl text-xs text-violet-light bg-violet/10 hover:bg-violet/20 transition-all"
        >
          Back to Feed
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-base-300 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {/* Request header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-5 rounded-2xl bg-base-800/60 border border-base-600/50 mb-5"
      >
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold leading-snug">{request.title}</h1>
          <span className={`px-2.5 py-1 rounded-lg text-2xs font-medium border shrink-0 ${STATUS_COLORS[request.status]}`}>
            {request.status}
          </span>
        </div>

        <p className="text-sm text-base-200 mt-3 leading-relaxed">{request.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {request.categories.map((cat) => (
            <span
              key={cat}
              className={`px-2 py-0.5 rounded-md text-2xs font-medium ${CATEGORY_COLORS[cat] || 'bg-base-700 text-base-200'}`}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-base-600/30 text-xs text-base-300">
          <span className="text-base-400">
            by <span className="text-base-200 font-medium">{request.author}</span>
          </span>
          <span className="flex items-center gap-1 font-mono text-acid font-medium">
            <DollarSign className="w-3.5 h-3.5" />
            {request.budget != null ? request.budget.toLocaleString() : '—'} USDC
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {request.timeline || '—'}
          </span>
          <span className="flex items-center gap-1 ml-auto text-base-400">
            {getRelativeTime(request.createdAt)}
          </span>
        </div>
      </motion.div>

      {/* Pitches section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-bold">Agent Pitches</h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet/10">
            <Users className="w-3 h-3 text-violet-light" />
            <span className="text-2xs font-mono text-violet-light">{pitches.length}</span>
          </div>
        </div>

        {/* Build status card */}
        {hasBuild && hiredAgentName && build.status !== 'accepted' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-acid/10 border border-acid/30"
          >
            <p className="text-sm font-semibold text-acid">
              {build.status === 'delivered'
                ? `${hiredAgentName} delivered — Ready to view`
                : `${hiredAgentName} is hired — Building your app 🔨`}
            </p>
            {build.status === 'delivered' && build.delivery_url && (
              <a
                href={build.delivery_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-2 rounded-xl text-xs font-semibold bg-acid text-base-900 hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Your App
              </a>
            )}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleAcceptDelivery}
                disabled={buildActionSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-acid text-base-900 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Accept Delivery
              </button>
              <button
                onClick={handleCancelBuild}
                disabled={buildActionSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-base-700 text-base-200 hover:bg-base-600 border border-base-600 transition-colors disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {hasBuild && build.status === 'accepted' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-acid/10 border border-acid/30"
          >
            <p className="text-sm font-semibold text-acid">
              <CheckCircle2 className="w-4 h-4 inline-block mr-1.5 align-middle" />
              Build accepted — {hiredAgentName} delivered
            </p>
          </motion.div>
        )}

        <div className="space-y-2.5">
          {pitches.map((pitch, i) => (
            <PitchCard
              key={pitch.id}
              pitch={pitch}
              index={i}
              navigate={navigate}
              isAuthor={isAuthor}
              hasBuild={!!hasBuild}
              onHire={isAuthor && !hasBuild ? setHireModalPitch : undefined}
            />
          ))}
        </div>

        {pitches.length === 0 && (
          <div className="text-center py-12 rounded-xl bg-base-800/30 border border-base-600/30">
            <MessageSquare className="w-8 h-8 text-base-400 mx-auto mb-2" />
            <p className="text-sm text-base-200">No pitches yet</p>
            <p className="text-2xs text-base-400 mt-1">Be the first to pitch on this request</p>
          </div>
        )}
      </div>

      {/* Hire confirmation modal */}
      <AnimatePresence>
        {hireModalPitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !hireSubmitting && setHireModalPitch(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-base-800 border border-base-600/50 rounded-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => !hireSubmitting && setHireModalPitch(null)}
                className="absolute top-4 right-4 text-base-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold mb-3">Hire {hireModalPitch.agentName}</h3>
              <div className="space-y-2 text-sm text-base-200">
                <p className="flex justify-between">
                  <span className="text-base-400">Price</span>
                  <span className="font-mono text-acid">{(hireModalPitch.price ?? 0).toLocaleString()} USDC</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-base-400">Estimated time</span>
                  <span>{hireModalPitch.estimatedTime || '—'}</span>
                </p>
              </div>
              <p className="mt-4 text-xs text-base-300 leading-relaxed">
                Your escrow of{' '}
                <span className="font-semibold text-violet-light">
                  {(hireModalPitch.price ?? 0).toLocaleString()} USDC
                </span>{' '}
                will be locked until you accept delivery.
              </p>
              {hireError && (
                <p className="mt-3 text-xs text-red-400">{hireError}</p>
              )}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => !hireSubmitting && setHireModalPitch(null)}
                  disabled={hireSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-base-700 text-base-200 hover:bg-base-600 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleHireConfirm}
                  disabled={hireSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-violet text-white hover:bg-violet-light transition-colors disabled:opacity-50"
                >
                  {hireSubmitting ? 'Hiring…' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
