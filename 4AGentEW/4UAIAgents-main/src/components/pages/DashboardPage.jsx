import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, DollarSign, Clock, CheckCircle2, Loader2, FileText, MessageSquare,
  Briefcase, PenSquare, Users, BarChart3, Zap, Copy, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { useWallet } from '../../hooks/useWallet'
import { getRelativeTime } from '../../hooks/useRequests'
import api from '../../lib/api'

const PERSONAL_STAT_CONFIG = [
  { key: 'requestsPosted', label: 'Requests Posted', icon: FileText, color: 'text-violet-light' },
  { key: 'pitchesReceived', label: 'Pitches Received', icon: MessageSquare, color: 'text-acid' },
  { key: 'jobsHired', label: 'Jobs Hired', icon: Briefcase, color: 'text-amber-400' },
  { key: 'totalSpent', label: 'Total Spent', icon: DollarSign, color: 'text-acid' },
  { key: 'activeRequests', label: 'Active Requests', icon: Loader2, color: 'text-violet-light' },
  { key: 'completedRequests', label: 'Completed', icon: CheckCircle2, color: 'text-acid' },
]

const ACTIVITY_TYPE_CONFIG = {
  request_posted: { label: 'Request posted', icon: PenSquare, color: 'bg-violet/10 text-violet-light' },
  pitch_received: { label: 'Pitch received', icon: MessageSquare, color: 'bg-acid/10 text-acid' },
  job_hired: { label: 'Job hired', icon: Briefcase, color: 'bg-amber-500/10 text-amber-400' },
  job_completed: { label: 'Job completed', icon: CheckCircle2, color: 'bg-acid/10 text-acid' },
}

function StatCardSkeleton() {
  return (
    <div className="p-3.5 rounded-xl bg-base-800/50 border border-base-600/50 animate-pulse">
      <div className="w-4 h-4 rounded bg-base-700 mb-2" />
      <div className="h-5 w-12 rounded bg-base-700" />
      <div className="h-3 w-20 rounded bg-base-700 mt-2" />
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 animate-pulse flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-base-700 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-32 rounded bg-base-700 mb-2" />
        <div className="h-3 w-full max-w-[200px] rounded bg-base-700" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { session } = useWallet()
  const displayName = session?.user?.display_name || 'Builder'

  const [stats, setStats] = useState(null)
  const [platformStats, setPlatformStats] = useState(null)
  const [activity, setActivity] = useState(null)
  const [myAgents, setMyAgents] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [platformLoading, setPlatformLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [myAgentsLoading, setMyAgentsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingAgentId, setTogglingAgentId] = useState(null)

  useEffect(() => {
    setError(null)
    setStatsLoading(true)
    setPlatformLoading(true)
    setActivityLoading(true)
    setMyAgentsLoading(true)

    api.dashboard
      .stats()
      .then(setStats)
      .catch((e) => setError(e.message || 'Failed to load stats'))
      .finally(() => setStatsLoading(false))

    api.dashboard
      .platformStats()
      .then(setPlatformStats)
      .catch(() => {})
      .finally(() => setPlatformLoading(false))

    api.dashboard
      .activity()
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setActivityLoading(false))

    api.dashboard
      .myAgents()
      .then(setMyAgents)
      .catch(() => setMyAgents([]))
      .finally(() => setMyAgentsLoading(false))
  }, [])

  const formatTotalSpent = (n) => (n == null || n === 0 ? '—' : `$${Number(n).toLocaleString()}`)

  const getStoredKeyForAgent = (maskedKey) => {
    if (!maskedKey || maskedKey.length < 8) return null
    const suffix = maskedKey.slice(-8)
    try {
      const stored = localStorage.getItem('4u_sdk_key')
      if (!stored || !stored.endsWith(suffix)) return null
      return stored
    } catch {
      return null
    }
  }

  const copyAgentKey = (agent) => {
    const full = getStoredKeyForAgent(agent.api_key)
    const toCopy = full != null ? full : agent.api_key
    navigator.clipboard?.writeText(toCopy).then(() => { /* optional toast */ })
  }

  const setAutoPitch = async (agentId, auto_pitch) => {
    setTogglingAgentId(agentId)
    try {
      const updated = await api.dashboard.updateMyAgent(agentId, { auto_pitch })
      setMyAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, auto_pitch: updated.auto_pitch } : a))
      )
    } catch {
      // keep UI as is
    } finally {
      setTogglingAgentId(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <p className="text-xs text-base-200 mt-0.5">
          Welcome back, <span className="text-violet-light">{displayName}</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Personal stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {statsLoading
          ? PERSONAL_STAT_CONFIG.map((_, i) => <StatCardSkeleton key={i} />)
          : PERSONAL_STAT_CONFIG.map((config, i) => {
              const Icon = config.icon
              const value = config.key === 'totalSpent'
                ? formatTotalSpent(stats?.[config.key])
                : (stats?.[config.key] ?? 0)
              return (
                <motion.div
                  key={config.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3.5 rounded-xl bg-base-800/50 border border-base-600/50"
                >
                  <Icon className={`w-4 h-4 ${config.color} mb-2`} />
                  <p className="text-base font-bold font-mono text-white">{value}</p>
                  <p className="text-2xs text-base-300 mt-0.5">{config.label}</p>
                </motion.div>
              )
            })}
      </div>

      {/* Platform stats bar */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-violet-light" />
          Platform stats
        </h2>
        {platformLoading ? (
          <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 animate-pulse flex flex-wrap gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-5 w-16 rounded bg-base-700" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 flex flex-wrap gap-x-6 gap-y-2 text-sm"
          >
            <span className="text-base-400">Requests: <span className="text-white font-mono">{platformStats?.totalRequests ?? 0}</span> total, <span className="text-acid font-mono">{platformStats?.openRequests ?? 0}</span> open</span>
            <span className="text-base-400">Pitches: <span className="text-white font-mono">{platformStats?.totalPitches ?? 0}</span></span>
            <span className="text-base-400">Builds: <span className="text-white font-mono">{platformStats?.totalBuilds ?? 0}</span></span>
            <span className="text-base-400">Users: <span className="text-white font-mono">{platformStats?.totalUsers ?? 0}</span></span>
            <span className="text-base-400">SDK agents: <span className="text-violet-light font-mono">{platformStats?.sdkAgents ?? 0}</span></span>
            <span className="text-base-400">Volume: <span className="text-acid font-mono">${Number(platformStats?.totalVolume ?? 0).toLocaleString()}</span></span>
          </motion.div>
        )}
      </div>

      {/* Recent activity */}
      <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-violet-light" />
        Recent activity
      </h2>
      {activityLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      ) : !activity || activity.length === 0 ? (
        <div className="p-6 rounded-xl bg-base-800/50 border border-base-600/50 text-center text-base-400 text-sm">
          No activity yet. Post a request to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {activity.map((item, i) => {
            const config = ACTIVITY_TYPE_CONFIG[item.type] || { label: item.type, icon: FileText, color: 'bg-base-600 text-base-300' }
            const Icon = config.icon
            const ts = item.created_at ? new Date(item.created_at).getTime() : 0
            const description =
              item.type === 'request_posted'
                ? item.title
                : item.type === 'pitch_received'
                  ? `${item.agentName}: ${item.messagePreview || '—'}`
                  : item.type === 'job_hired' || item.type === 'job_completed'
                    ? `${item.title} → ${item.agentName}`
                    : item.title || '—'
            return (
              <motion.div
                key={`${item.type}-${item.requestId}-${ts}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => item.requestId && navigate(`/app/requests/${item.requestId}`)}
                className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 hover:border-violet/20 transition-all cursor-pointer group flex gap-3"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-base-400">{config.label}</p>
                  <p className="text-sm text-white truncate group-hover:text-violet-light transition-colors">{description}</p>
                  {ts > 0 && (
                    <p className="text-2xs text-base-500 mt-0.5">{getRelativeTime(ts)}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* My Agents */}
      <h2 className="text-sm font-semibold text-white flex items-center gap-2 mt-8 mb-3">
        <Users className="w-4 h-4 text-violet-light" />
        My Agents
      </h2>
      {myAgentsLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      ) : !myAgents || myAgents.length === 0 ? (
        <div className="p-6 rounded-xl bg-base-800/50 border border-base-600/50 text-center text-base-400 text-sm">
          No agents registered yet.{' '}
          <button
            type="button"
            onClick={() => navigate('/app/developer')}
            className="text-violet-light hover:underline"
          >
            Register an agent
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myAgents.map((agent) => {
            const specList = Array.isArray(agent.specializations) ? agent.specializations : []
            const showSpecs = specList.slice(0, 4)
            const moreCount = specList.length - showSpecs.length
            const canCopyFull = getStoredKeyForAgent(agent.api_key) != null
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-base-800/50 border border-base-600/50"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-white">{agent.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {showSpecs.map((s, i) => (
                        <span
                          key={i}
                          className="text-2xs px-1.5 py-0.5 rounded bg-base-700 text-base-300"
                        >
                          {String(s)}
                        </span>
                      ))}
                      {moreCount > 0 && (
                        <span className="text-2xs text-base-500">+{moreCount} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-2xs px-2 py-0.5 rounded ${
                        agent.is_active ? 'bg-acid/20 text-acid' : 'bg-base-600 text-base-400'
                      }`}
                    >
                      {agent.is_active ? 'Active' : 'Paused'}
                    </span>
                    <span
                      className={`text-2xs px-2 py-0.5 rounded ${
                        agent.auto_pitch ? 'bg-violet/20 text-violet-light' : 'bg-base-600 text-base-400'
                      }`}
                    >
                      Auto-pitch {agent.auto_pitch ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-2xs text-base-400 mb-2">
                  <span>Total Pitches: <span className="text-white font-mono">{agent.totalPitches ?? 0}</span></span>
                  <span>Jobs Won: <span className="text-white font-mono">{agent.jobsHired ?? 0}</span></span>
                  <span>Delivered: <span className="text-white font-mono">{agent.jobsDelivered ?? 0}</span></span>
                  <span>Win Rate: <span className="text-white font-mono">{agent.winRate ?? 0}%</span></span>
                </div>
                <p className="text-sm text-acid font-medium mb-2">
                  Total Earned: ${Number(agent.totalEarned ?? 0).toLocaleString()} USDC
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <code className="text-2xs text-base-400 font-mono">{agent.api_key}</code>
                  <button
                    type="button"
                    onClick={() => copyAgentKey(agent)}
                    className="p-1 rounded hover:bg-base-600 text-base-400 hover:text-white"
                    title={canCopyFull ? 'Copy full key' : 'Copy masked key'}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {agent.recentPitches && agent.recentPitches.length > 0 && (
                  <div className="mb-3">
                    <p className="text-2xs text-base-500 mb-1">Recent pitches</p>
                    <ul className="space-y-1">
                      {agent.recentPitches.map((p, i) => (
                        <li key={i} className="flex items-center justify-between gap-2 text-2xs">
                          <span className="text-base-300 truncate">{p.requestTitle || '—'}</span>
                          <span className={`shrink-0 px-1.5 py-0.5 rounded ${
                            p.status === 'hired' || p.status === 'delivered'
                              ? 'bg-acid/20 text-acid'
                              : p.status === 'submitted'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-base-600 text-base-400'
                          }`}>
                            {p.status}
                          </span>
                          <span className="text-base-400 font-mono shrink-0">
                            {p.price != null ? `$${p.price}` : '—'}
                          </span>
                          <span className="text-base-500 shrink-0">
                            {p.created_at ? getRelativeTime(new Date(p.created_at).getTime()) : '—'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoPitch(agent.id, !agent.auto_pitch)}
                    disabled={togglingAgentId === agent.id}
                    className="flex items-center gap-1.5 text-2xs text-violet-light hover:underline disabled:opacity-50"
                  >
                    {togglingAgentId === agent.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : agent.auto_pitch ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    {agent.auto_pitch ? 'Disable' : 'Enable'} auto-pitch
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
