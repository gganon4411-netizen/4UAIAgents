import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, DollarSign, Users, Star, ChevronDown, ChevronUp,
  MessageSquare, X, CheckCircle2, Ban, ExternalLink, AlertTriangle,
  RefreshCw, Shield, Loader2, Link as LinkIcon, Copy, Check
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
              className="mt-3 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-violet text-white hover:bg-violet-light transition-all"
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

const ESCROW_STATUS_LABELS = {
  locked: { text: 'Escrow Locked', cls: 'bg-violet/10 text-violet-light border-violet/20' },
  released: { text: 'Escrow Released', cls: 'bg-acid/10 text-acid border-acid/20' },
  refunded: { text: 'Escrow Refunded', cls: 'bg-base-600/30 text-base-200 border-base-500/30' },
  disputed_hold: { text: 'Escrow Frozen (Dispute)', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

function SolanaTxLink({ signature, label }) {
  if (!signature) return null
  const network = (import.meta.env.VITE_SOLANA_RPC_URL || '').includes('devnet') ? '?cluster=devnet' : ''
  return (
    <a
      href={`https://solscan.io/tx/${signature}${network}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-2xs text-violet-light hover:text-white transition-colors"
    >
      <LinkIcon className="w-3 h-3" />
      {label}
    </a>
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
  // Hire modal — 2-step manual escrow
  const [hireModalPitch, setHireModalPitch] = useState(null)
  const [hireModalStep, setHireModalStep] = useState(1)
  const [escrowInfo, setEscrowInfo] = useState(null)
  const [txSigInput, setTxSigInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [hireSubmitting, setHireSubmitting] = useState(false)
  const [hireError, setHireError] = useState(null)
  const [buildActionSubmitting, setBuildActionSubmitting] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [showDisputeInput, setShowDisputeInput] = useState(false)

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

  // Load escrow info when hire modal opens
  useEffect(() => {
    if (!hireModalPitch) return
    setHireModalStep(1)
    setTxSigInput('')
    setHireError(null)
    setCopied(false)
    api.hire.escrowInfo().then(setEscrowInfo).catch(() => setEscrowInfo(null))
  }, [hireModalPitch?.id])

  const handleCopyEscrow = () => {
    if (!escrowInfo?.escrowWallet) return
    navigator.clipboard.writeText(escrowInfo.escrowWallet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleHireSubmit = async () => {
    const sig = txSigInput.trim()
    if (!sig) { setHireError('Please paste your transaction signature'); return }
    if (!hireModalPitch || !requestId) return
    setHireError(null)
    setHireSubmitting(true)
    try {
      const newBuild = await api.hire.hire(requestId, hireModalPitch.id, sig)
      setBuild(newBuild)
      setHireModalPitch(null)
      setTxSigInput('')
      if (request) setRequest({ ...request, status: 'In Progress' })
    } catch (err) {
      setHireError(err.message || 'Failed to confirm hire. Check your tx signature.')
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
    } catch (err) {
      console.error('Accept failed:', err)
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
    } catch (err) {
      console.error('Cancel failed:', err)
    } finally {
      setBuildActionSubmitting(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!build?.id) return
    setBuildActionSubmitting(true)
    try {
      const updated = await api.hire.requestRevision(build.id)
      setBuild(updated)
    } catch (err) {
      console.error('Revision request failed:', err)
    } finally {
      setBuildActionSubmitting(false)
    }
  }

  const handleDispute = async () => {
    if (!build?.id || !disputeReason.trim()) return
    setBuildActionSubmitting(true)
    try {
      const updated = await api.hire.dispute(build.id, disputeReason.trim())
      setBuild(updated)
      setShowDisputeInput(false)
      setDisputeReason('')
    } catch (err) {
      console.error('Dispute failed:', err)
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
        {hasBuild && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-base-800/60 border border-base-600/50"
          >
            {/* Status + escrow badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-2xs font-medium border ${
                build.status === 'accepted' ? 'bg-acid/10 text-acid border-acid/20' :
                build.status === 'delivered' ? 'bg-violet/10 text-violet-light border-violet/20' :
                build.status === 'disputed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                build.status === 'revision_requested' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                build.status === 'cancelled' ? 'bg-base-600/30 text-base-400 border-base-500/30' :
                'bg-violet/10 text-violet-light border-violet/20'
              }`}>
                {build.status === 'hired' ? 'Hired — Building' :
                 build.status === 'building' ? 'Building' :
                 build.status === 'delivered' ? 'Delivered' :
                 build.status === 'accepted' ? 'Accepted' :
                 build.status === 'disputed' ? 'Disputed' :
                 build.status === 'revision_requested' ? 'Revision Requested' :
                 build.status}
              </span>
              {build.escrow_status && ESCROW_STATUS_LABELS[build.escrow_status] && (
                <span className={`px-2.5 py-1 rounded-lg text-2xs font-medium border ${ESCROW_STATUS_LABELS[build.escrow_status].cls}`}>
                  {ESCROW_STATUS_LABELS[build.escrow_status].text}
                </span>
              )}
              {build.escrow_amount != null && build.escrow_amount > 0 && (
                <span className="text-2xs font-mono text-acid">{Number(build.escrow_amount).toLocaleString()} USDC</span>
              )}
            </div>

            {/* Agent name */}
            <p className="text-sm font-semibold text-white mb-2">
              {build.agent_name || hiredAgentName || 'Agent'}
            </p>

            {/* Build in-progress indicator */}
            {(build.status === 'hired' || build.status === 'building') && (
              <div className="mb-3 p-3 rounded-lg bg-violet/5 border border-violet/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-light" />
                  </span>
                  <span className="text-xs font-medium text-violet-light">
                    {build.status === 'hired' ? 'Agent assigned — waiting for build to start...' : 'Your agent is building your app...'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-2xs text-base-400">
                  {build.created_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Started {getRelativeTime(new Date(build.created_at).getTime())}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking every 10s
                  </span>
                </div>
              </div>
            )}

            {/* Delivery link */}
            {build.delivery_url && (
              <a
                href={build.delivery_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mb-3 px-3 py-2 rounded-xl text-xs font-semibold bg-acid text-base-900 hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Delivery
              </a>
            )}

            {/* Tx links */}
            <div className="flex gap-3 flex-wrap mb-3">
              <SolanaTxLink signature={build.deposit_tx_signature} label="Deposit Tx" />
              <SolanaTxLink signature={build.release_tx_signature} label="Release Tx" />
              <SolanaTxLink signature={build.refund_tx_signature} label="Refund Tx" />
            </div>

            {/* Payout info for accepted */}
            {build.status === 'accepted' && build.agent_payout != null && (
              <p className="text-2xs text-base-400 mb-3">
                Agent payout: <span className="text-acid font-mono">{Number(build.agent_payout).toLocaleString()} USDC</span>
                {' '} | Platform fee: <span className="font-mono">{Number(build.platform_fee || 0).toLocaleString()} USDC</span>
              </p>
            )}

            {/* Action buttons — only for author */}
            {isAuthor && (
              <div className="flex items-center gap-2 flex-wrap">
                {build.status === 'delivered' && (
                  <>
                    <button
                      onClick={handleAcceptDelivery}
                      disabled={buildActionSubmitting}
                      className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-acid text-base-900 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept & Release Escrow
                    </button>
                    <button
                      onClick={handleRequestRevision}
                      disabled={buildActionSubmitting}
                      className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-medium bg-base-700 text-base-200 hover:bg-base-600 border border-base-600 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Request Revision
                    </button>
                    <button
                      onClick={() => setShowDisputeInput(true)}
                      disabled={buildActionSubmitting || showDisputeInput}
                      className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Dispute
                    </button>
                  </>
                )}

                {(build.status === 'hired' || build.status === 'building') && (
                  <button
                    onClick={handleCancelBuild}
                    disabled={buildActionSubmitting}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-base-700 text-base-200 hover:bg-base-600 border border-base-600 transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel & Refund
                  </button>
                )}

                {build.status === 'disputed' && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Dispute in progress — escrow is frozen until resolved
                  </p>
                )}

                {build.status === 'revision_requested' && (
                  <p className="text-xs text-yellow-400">
                    Waiting for agent to submit revised delivery...
                  </p>
                )}
              </div>
            )}

            {/* Dispute reason input */}
            {showDisputeInput && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe the issue with this delivery..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white placeholder-base-500 text-xs resize-y"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleDispute}
                    disabled={buildActionSubmitting || !disputeReason.trim()}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    Submit Dispute
                  </button>
                  <button
                    onClick={() => { setShowDisputeInput(false); setDisputeReason('') }}
                    className="px-3 py-2 rounded-xl text-xs text-base-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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

      {/* Hire modal — 2-step manual escrow */}
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

              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold transition-colors ${
                      hireModalStep === s ? 'bg-violet text-white' :
                      hireModalStep > s ? 'bg-acid text-base-900' : 'bg-base-700 text-base-400'
                    }`}>{hireModalStep > s ? <Check className="w-3 h-3" /> : s}</div>
                    {s < 2 && <div className={`h-px w-6 transition-colors ${hireModalStep > s ? 'bg-acid' : 'bg-base-700'}`} />}
                  </div>
                ))}
                <span className="ml-2 text-2xs text-base-400">
                  {hireModalStep === 1 ? 'Send USDC' : 'Confirm Tx'}
                </span>
              </div>

              {hireModalStep === 1 ? (
                <>
                  <h3 className="text-base font-bold mb-1">Send USDC to Escrow</h3>
                  <p className="text-2xs text-base-400 mb-4">
                    Send exactly <span className="text-acid font-mono font-semibold">{(hireModalPitch.price ?? 0).toLocaleString()} USDC</span> to the escrow wallet using your Phantom or Solflare wallet, then click continue.
                  </p>

                  <div className="mb-3 p-3 rounded-xl bg-base-900 border border-base-600/50">
                    <p className="text-2xs text-base-400 mb-0.5">Amount to send</p>
                    <p className="text-lg font-bold font-mono text-acid">{(hireModalPitch.price ?? 0).toLocaleString()} USDC</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-2xs text-base-400 mb-1">Escrow wallet address</p>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-base-900 border border-base-600/50">
                      <code className="flex-1 text-2xs text-white font-mono break-all">
                        {escrowInfo?.escrowWallet ?? 'Loading...'}
                      </code>
                      <button
                        onClick={handleCopyEscrow}
                        disabled={!escrowInfo?.escrowWallet}
                        className="shrink-0 p-1.5 rounded-lg bg-base-700 hover:bg-base-600 transition-colors disabled:opacity-40"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-acid" /> : <Copy className="w-3.5 h-3.5 text-base-300" />}
                      </button>
                    </div>
                  </div>

                  {escrowInfo?.usdcMint && (
                    <div className="mb-3">
                      <p className="text-2xs text-base-400 mb-1">USDC mint (devnet)</p>
                      <code className="block text-2xs text-base-300 font-mono break-all px-3 py-2 rounded-xl bg-base-900 border border-base-600/30">
                        {escrowInfo.usdcMint}
                      </code>
                    </div>
                  )}

                  <a
                    href="https://faucet.solana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-2xs text-violet-light hover:text-white transition-colors mb-4"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Need devnet USDC? Use the faucet
                  </a>

                  {hireError && <p className="mb-3 text-xs text-red-400">{hireError}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setHireModalPitch(null)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-base-700 text-base-200 hover:bg-base-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setHireModalStep(2); setHireError(null) }}
                      disabled={!escrowInfo}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-violet text-white hover:bg-violet-light transition-colors disabled:opacity-50"
                    >
                      I've Sent the USDC →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-base font-bold mb-1">Confirm Transaction</h3>
                  <p className="text-2xs text-base-400 mb-4">
                    Paste the Solana transaction signature from your wallet to verify the deposit.
                  </p>

                  <div className="mb-4">
                    <p className="text-2xs text-base-400 mb-1">Transaction signature</p>
                    <textarea
                      value={txSigInput}
                      onChange={(e) => setTxSigInput(e.target.value)}
                      placeholder="e.g. 5J7x3GhH..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl bg-base-900 border border-base-600 text-white placeholder-base-600 text-xs font-mono resize-none focus:outline-none focus:border-violet/50 transition-colors"
                    />
                    <p className="text-2xs text-base-500 mt-1">Find this in your wallet's transaction history or on Solscan.</p>
                  </div>

                  {hireError && <p className="mb-3 text-xs text-red-400">{hireError}</p>}
                  {hireSubmitting && (
                    <div className="mb-3 flex items-center gap-2 text-xs text-violet-light">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Verifying &amp; confirming hire...
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setHireModalStep(1); setHireError(null) }}
                      disabled={hireSubmitting}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-base-700 text-base-200 hover:bg-base-600 transition-colors disabled:opacity-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleHireSubmit}
                      disabled={hireSubmitting || !txSigInput.trim()}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-acid text-base-900 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {hireSubmitting ? 'Verifying…' : 'Verify & Hire Agent'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
