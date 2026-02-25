import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Copy, Check, Loader2, Edit3, X, ExternalLink,
  FileText, Briefcase, DollarSign, Twitter, Github, Globe,
} from 'lucide-react'
import { getRelativeTime } from '../../hooks/useRequests'
import { useWallet } from '../../hooks/useWallet'

const API_BASE = 'https://4u-backend-production.up.railway.app'

const STATUS_COLORS = {
  Open: 'bg-acid/10 text-acid border-acid/20',
  'In Progress': 'bg-violet/10 text-violet-light border-violet/20',
  Completed: 'bg-base-600/30 text-base-200 border-base-500/30',
}

function getToken() {
  try {
    const raw = localStorage.getItem('4u_session')
    if (!raw) return null
    const data = JSON.parse(raw)
    return data.access_token || null
  } catch {
    return null
  }
}

function getInitials(wallet) {
  if (!wallet || wallet.length < 4) return '??'
  return `${wallet.slice(0, 2)}`.toUpperCase()
}

function truncateWallet(wallet) {
  if (!wallet) return ''
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { session, setSession } = useWallet()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [publicData, setPublicData] = useState(null) // { requests }
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [copied, setCopied] = useState(false)

  // Edit form state (mirrors profile fields)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editTwitter, setEditTwitter] = useState('')
  const [editGithub, setEditGithub] = useState('')
  const [editWebsite, setEditWebsite] = useState('')

  const token = getToken()

  const loadProfile = useCallback(async () => {
    if (!token) {
      setError('Please sign in to view your profile.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || res.statusText || 'Failed to load profile')
      }
      const data = await res.json()
      setProfile(data)
      setEditDisplayName(data.display_name ?? '')
      setEditUsername(data.username ?? '')
      setEditBio(data.bio ?? '')
      setEditTwitter(data.twitter ?? '')
      setEditGithub(data.github ?? '')
      setEditWebsite(data.website ?? '')

      if (data.wallet_address) {
        const pubRes = await fetch(`${API_BASE}/api/auth/profile/${encodeURIComponent(data.wallet_address)}`)
        if (pubRes.ok) {
          const pub = await pubRes.json()
          setPublicData(pub)
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const copyWallet = () => {
    if (!profile?.wallet_address) return
    navigator.clipboard.writeText(profile.wallet_address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const startEdit = () => {
    setEditDisplayName(profile?.display_name ?? '')
    setEditUsername(profile?.username ?? '')
    setEditBio(profile?.bio ?? '')
    setEditTwitter(profile?.twitter ?? '')
    setEditGithub(profile?.github ?? '')
    setEditWebsite(profile?.website ?? '')
    setSaveError(null)
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setSaveError(null)
  }

  const saveProfile = async () => {
    if (!token) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: editDisplayName.trim() || undefined,
          username: editUsername.trim() || undefined,
          bio: editBio.trim() || undefined,
          twitter: editTwitter.trim() || undefined,
          github: editGithub.trim() || undefined,
          website: editWebsite.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || res.statusText || 'Update failed')
      }
      setProfile(data)
      setEditMode(false)
      if (session && data) {
        const mergedUser = { ...session.user, display_name: data.display_name, username: data.username, bio: data.bio, avatar_url: data.avatar_url, twitter: data.twitter, github: data.github, website: data.website }
        setSession({ ...session, user: mergedUser })
      }
    } catch (e) {
      setSaveError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const requests = publicData?.requests ?? []
  const requestsPosted = requests.length

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

  if (error && !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-violet-light font-medium">{error}</p>
        <button
          onClick={loadProfile}
          className="mt-4 px-4 py-2 rounded-xl bg-violet/20 text-violet-light hover:bg-violet/30 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-base-800/80 border border-base-600/50 overflow-hidden mb-8"
        >
          {/* Cover / avatar row */}
          <div className="p-6 pb-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
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
            <div className="flex-1 min-w-0">
              {!editMode ? (
                <>
                  <h1 className="text-xl font-bold text-white truncate">
                    {profile?.display_name || 'Anonymous Builder'}
                  </h1>
                  <p className="text-sm text-base-400 font-mono mt-0.5">
                    {profile?.username ? `@${profile.username}` : 'No username set'}
                  </p>
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
                  <button
                    onClick={startEdit}
                    className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-base-700 hover:bg-violet/20 text-base-200 hover:text-violet-light text-sm font-medium transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-2xs text-base-400 mb-1">Display name</label>
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="w-full px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white placeholder-base-500 focus:ring-2 focus:ring-violet/50 focus:border-violet text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs text-base-400 mb-1">Username (e.g. builder)</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="username"
                      className="w-full px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white placeholder-base-500 focus:ring-2 focus:ring-violet/50 focus:border-violet text-sm font-mono"
                    />
                  </div>
                  {saveError && (
                    <p className="text-sm text-red-400">{saveError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet text-white hover:bg-violet-light font-medium text-sm disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl border border-base-600 text-base-300 hover:bg-base-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio (view or edit) */}
          <div className="px-6 pb-4">
            {!editMode ? (
              <p className="text-sm text-base-300 whitespace-pre-wrap">
                {profile?.bio || 'No bio yet.'}
              </p>
            ) : (
              <>
                <label className="block text-2xs text-base-400 mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell the community about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white placeholder-base-500 focus:ring-2 focus:ring-violet/50 focus:border-violet text-sm resize-y"
                />
              </>
            )}
          </div>

          {/* Social links */}
          <div className="px-6 pb-6 flex flex-wrap gap-3">
            {!editMode ? (
              <>
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
                {!profile?.twitter && !profile?.github && !profile?.website && (
                  <span className="text-2xs text-base-500">No links added</span>
                )}
              </>
            ) : (
              <>
                <div className="w-full sm:w-auto min-w-0">
                  <label className="block text-2xs text-base-400 mb-1">Twitter</label>
                  <input
                    type="text"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    placeholder="@handle or URL"
                    className="w-full sm:w-48 px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white placeholder-base-500 focus:ring-2 focus:ring-violet/50 text-sm"
                  />
                </div>
                <div className="w-full sm:w-auto min-w-0">
                  <label className="block text-2xs text-base-400 mb-1">GitHub</label>
                  <input
                    type="text"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="username or URL"
                    className="w-full sm:w-48 px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white placeholder-base-500 focus:ring-2 focus:ring-violet/50 text-sm"
                  />
                </div>
                <div className="w-full sm:w-auto min-w-0">
                  <label className="block text-2xs text-base-400 mb-1">Website</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full sm:w-48 px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white placeholder-base-500 focus:ring-2 focus:ring-violet/50 text-sm"
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 text-center">
            <FileText className="w-5 h-5 text-violet-light mx-auto mb-2" />
            <p className="text-lg font-bold font-mono text-white">{requestsPosted}</p>
            <p className="text-2xs text-base-400">Requests Posted</p>
          </div>
          <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 text-center">
            <Briefcase className="w-5 h-5 text-acid mx-auto mb-2" />
            <p className="text-lg font-bold font-mono text-white">0</p>
            <p className="text-2xs text-base-400">Jobs Hired</p>
          </div>
          <div className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 text-center">
            <DollarSign className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-lg font-bold font-mono text-white">—</p>
            <p className="text-2xs text-base-400">Total Spent</p>
          </div>
        </motion.div>

        {/* Recent Requests */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-white mb-3">Recent Requests</h2>
          {requests.length === 0 ? (
            <div className="rounded-xl bg-base-800/50 border border-base-600/50 p-6 text-center">
              <FileText className="w-8 h-8 text-base-500 mx-auto mb-2" />
              <p className="text-sm text-base-400">No requests yet</p>
              <button
                onClick={() => navigate('/app/post')}
                className="mt-3 text-sm text-violet-light hover:text-white font-medium"
              >
                Post your first request →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
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
                      <span className="font-mono">${Number(req.budget).toLocaleString()}</span>
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
