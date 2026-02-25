import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Copy, Check, Loader2, ExternalLink,
  FileText, Briefcase, DollarSign, Twitter, Github, Globe, Bot, Trophy, ArrowLeft,
  UserPlus, UserCheck, Users,
} from 'lucide-react'
import { getRelativeTime } from '../../hooks/useRequests'
import { useWallet } from '../../hooks/useWallet'

const API_BASE = import.meta.env.VITE_API_URL || 'https://4u-backend-production.up.railway.app'

const STATUS_COLORS = {
  Open: 'bg-acid/10 text-acid border-acid/20',
  'In Progress': 'bg-violet/10 text-violet-light border-violet/20',
  Completed: 'bg-base-600/30 text-base-200 border-base-500/30',
}

function truncateWallet(wallet) {
  if (!wallet || wallet.length < 10) return wallet || ''
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

function getInitials(wallet) {
  if (!wallet || wallet.length < 2) return '??'
  return wallet.slice(0, 2).toUpperCase()
}

function joinDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function PublicProfilePage() {
  const { wallet } = useParams()
  const navigate = useNavigate()
  const { session, address } = useWallet()
  const viewerWallet = session?.user?.wallet_address || address || null

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followCounts, setFollowCounts] = useState({ followers_count: 0, following_count: 0 })

  const loadProfile = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/${encodeURIComponent(wallet)}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'User not found')
      }
      const data = await res.json()
      setProfile(data)
    } catch (e) {
      setError(e.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [wallet])

  const loadFollowData = useCallback(async () => {
    if (!wallet) return
    const [countsRes, statusRes] = await Promise.all([
      fetch(`${API_BASE}/api/follows/counts?wallet=${encodeURIComponent(wallet)}`),
      viewerWallet
        ? fetch(`${API_BASE}/api/follows/status?follower_wallet=${encodeURIComponent(viewerWallet)}&followee_id=${encodeURIComponent(wallet)}&followee_type=user`)
        : Promise.resolve(null),
    ])
    if (countsRes.ok) {
      const counts = await countsRes.json()
      setFollowCounts(counts)
    }
    if (statusRes?.ok) {
      const status = await statusRes.json()
      setIsFollowing(status.is_following || false)
    }
  }, [wallet, viewerWallet])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    loadFollowData()
  }, [loadFollowData])

  const copyWallet = () => {
    if (!profile?.wallet_address) return
    navigator.clipboard.writeText(profile.wallet_address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleFollow = async () => {
    if (!viewerWallet || !wallet) return
    const sessionData = JSON.parse(localStorage.getItem('4u_session') || 'null')
    const token = sessionData?.access_token
    if (!token) return

    setFollowLoading(true)
    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      await fetch(`${API_BASE}/api/follows`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ followee_id: wallet, followee_type: 'user' }),
      })
      setIsFollowing(!isFollowing)
      setFollowCounts((prev) => ({
        ...prev,
        followers_count: prev.followers_count + (isFollowing ? -1 : 1),
      }))
    } catch {
      // ignore
    } finally {
      setFollowLoading(false)
    }
  }

  const isOwnProfile = viewerWallet && profile?.wallet_address && viewerWallet === profile.wallet_address

  if (loading) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-light animate-spin" />
          <p className="text-sm text-base-400">Loading profile…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <User className="w-12 h-12 text-base-500 mx-auto mb-4" />
        <p className="text-base-200 font-medium">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-base-700 hover:bg-base-600 text-sm text-base-200 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    )
  }

  const { stats = {}, requests = [], sdk_agents = [] } = profile

  return (
    <div className="min-h-screen bg-base-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-base-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-base-800/80 border border-base-600/50 overflow-hidden mb-6"
        >
          <div className="p-6 pb-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-base-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-violet/20 border-2 border-violet/40 flex items-center justify-center">
                  <span className="text-2xl font-bold text-violet-light">
                    {getInitials(profile?.wallet_address)}
                  </span>
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-white truncate">
                    {profile?.display_name || 'Anonymous Builder'}
                  </h1>
                  {profile?.username && (
                    <p className="text-sm text-base-400 font-mono mt-0.5">@{profile.username}</p>
                  )}
                </div>
                {/* Follow button */}
                {viewerWallet && !isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                      isFollowing
                        ? 'bg-base-700 text-base-200 hover:bg-red-500/20 hover:text-red-400 border border-base-600 hover:border-red-500/30'
                        : 'bg-violet text-white hover:bg-violet-light'
                    }`}
                  >
                    {isFollowing ? (
                      <><UserCheck className="w-3.5 h-3.5" /> Following</>
                    ) : (
                      <><UserPlus className="w-3.5 h-3.5" /> Follow</>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-2xs text-base-500">
                  {truncateWallet(profile?.wallet_address)}
                </span>
                <button
                  onClick={copyWallet}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-base-700 hover:bg-base-600 text-base-400 hover:text-white transition-colors text-2xs"
                >
                  {copied ? <Check className="w-3 h-3 text-acid" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Follower / following counts */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  className="flex items-center gap-1 text-2xs text-base-400 hover:text-white transition-colors"
                >
                  <Users className="w-3 h-3" />
                  <span className="font-mono font-semibold text-white">{followCounts.followers_count}</span>
                  <span>followers</span>
                </button>
                <button
                  className="flex items-center gap-1 text-2xs text-base-400 hover:text-white transition-colors"
                >
                  <span className="font-mono font-semibold text-white">{followCounts.following_count}</span>
                  <span>following</span>
                </button>
              </div>

              {profile?.created_at && (
                <p className="text-2xs text-base-500 mt-2">Joined {joinDate(profile.created_at)}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="px-6 pb-4">
              <p className="text-sm text-base-300 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Social links */}
          <div className="px-6 pb-6 flex flex-wrap gap-4">
            {profile?.twitter && (
              <a
                href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-base-400 hover:text-violet-light transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span className="truncate">{profile.twitter}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
            {profile?.github && (
              <a
                href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-base-400 hover:text-violet-light transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="truncate">{profile.github}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
            {profile?.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-base-400 hover:text-violet-light transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="truncate">{profile.website}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 text-center">
            <FileText className="w-5 h-5 text-violet-light mx-auto mb-2" />
            <p className="text-lg font-bold font-mono text-white">{stats.requests_posted ?? 0}</p>
            <p className="text-2xs text-base-400">Requests</p>
          </div>
          <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 text-center">
            <Briefcase className="w-5 h-5 text-acid mx-auto mb-2" />
            <p className="text-lg font-bold font-mono text-white">{stats.completed_hires ?? 0}</p>
            <p className="text-2xs text-base-400">Hires</p>
          </div>
          <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 text-center">
            <DollarSign className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-lg font-bold font-mono text-white">
              {stats.total_spent ? `$${Number(stats.total_spent).toLocaleString()}` : '—'}
            </p>
            <p className="text-2xs text-base-400">Spent</p>
          </div>
          <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 text-center">
            <Bot className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold font-mono text-white">{stats.agents_owned ?? 0}</p>
            <p className="text-2xs text-base-400">Agents</p>
          </div>
        </motion.div>

        {/* SDK Agents */}
        {sdk_agents.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-sm font-semibold text-white mb-3">Agents</h2>
            <div className="space-y-2">
              {sdk_agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 rounded-xl bg-base-800/60 border border-base-600/50 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
                      <span className="flex items-center gap-1 text-2xs text-amber-400 shrink-0">
                        <Trophy className="w-3 h-3" />
                        {agent.total_wins} wins
                      </span>
                    </div>
                    {agent.bio && (
                      <p className="text-xs text-base-400 mt-0.5 line-clamp-2">{agent.bio}</p>
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
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Requests */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold text-white mb-3">Requests</h2>
          {requests.length === 0 ? (
            <div className="rounded-xl bg-base-800/50 border border-base-600/50 p-8 text-center">
              <FileText className="w-8 h-8 text-base-500 mx-auto mb-2" />
              <p className="text-sm text-base-400">No requests posted yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => navigate(`/app/requests/${req.id}`)}
                  className="w-full text-left p-4 rounded-xl bg-base-800/60 border border-base-600/50 hover:border-violet/30 hover:bg-base-800 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-light transition-colors truncate flex-1">
                      {req.title}
                    </h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-2xs font-medium border ${STATUS_COLORS[req.status] || 'bg-base-600/30 text-base-400'}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-2xs text-base-400">
                    {req.budget != null && (
                      <span className="font-mono text-acid">${Number(req.budget).toLocaleString()}</span>
                    )}
                    <span>{req.created_at ? getRelativeTime(new Date(req.created_at).getTime()) : ''}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.section>

      </div>
    </div>
  )
}
