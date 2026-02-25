import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bell, Zap, CheckCircle2, MessageSquare, Check, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../../hooks/useWallet'

const API_BASE = import.meta.env.VITE_API_URL || 'https://4u-backend-production.up.railway.app'

const TYPE_CONFIG = {
  hired: { icon: Zap, iconColor: 'text-green-400 bg-green-400/10', label: 'Hired' },
  delivered: { icon: CheckCircle2, iconColor: 'text-acid bg-acid/10', label: 'Delivered' },
  pitch_update: { icon: MessageSquare, iconColor: 'text-violet-light bg-violet/10', label: 'New Pitch' },
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'pitch_update', label: '💬 Pitches' },
  { key: 'hired', label: '🎉 Hired' },
  { key: 'delivered', label: '📦 Delivered' },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationsPage() {
  const { session, address } = useWallet()
  const wallet = session?.user?.wallet_address || address || null
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchNotifications = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${wallet}?limit=100`)
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error('fetchNotifications error:', err)
    } finally {
      setLoading(false)
    }
  }, [wallet])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (err) {
      console.error('markRead error:', err)
    }
  }

  const markAllRead = async () => {
    if (!wallet) return
    try {
      await fetch(`${API_BASE}/api/notifications/${wallet}/read-all`, { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('markAllRead error:', err)
    }
  }

  const handleClick = async (notif) => {
    if (!notif.read) await markRead(notif.id)
    if (notif.type === 'pitch_update') navigate('/app/feed')
    else navigate('/app/dashboard')
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'all') return true
    return n.type === filter
  })

  const unread = notifications.filter((n) => !n.read).length

  if (!wallet) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Bell className="w-10 h-10 text-base-400 mx-auto mb-4" />
        <p className="text-base-200">Connect your wallet to view notifications.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Notifications</h1>
          <p className="text-xs text-base-200 mt-0.5">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-1.5 rounded-lg text-base-400 hover:text-white hover:bg-base-700/50 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-violet-light hover:bg-violet/10 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTERS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === tab.key
                ? 'bg-violet text-white'
                : 'bg-base-700/50 text-base-300 hover:text-white hover:bg-base-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-base-800/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-10 h-10 text-base-400 mx-auto mb-3" />
          <p className="text-base-200 text-sm">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </p>
          <p className="text-base-400 text-xs mt-1">
            {filter === 'unread'
              ? 'You have no unread notifications.'
              : 'Notifications appear here when you get hired, receive deliveries, or get pitches.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif, i) => {
            const config = TYPE_CONFIG[notif.type] || { icon: Bell, iconColor: 'text-base-300 bg-base-700', label: 'Notification' }
            const Icon = config.icon
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  notif.read
                    ? 'bg-base-800/30 border-base-600/30'
                    : 'bg-base-800/50 border-base-600/50 hover:border-violet/20'
                }`}
                onClick={() => handleClick(notif)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-semibold ${notif.read ? 'text-base-200' : 'text-white'}`}>
                        {notif.title}
                      </h3>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-violet shrink-0" />}
                      <span className={`text-2xs px-1.5 py-0.5 rounded-full ml-auto ${
                        notif.type === 'hired' ? 'bg-green-500/10 text-green-400' :
                        notif.type === 'delivered' ? 'bg-acid/10 text-acid' :
                        'bg-violet/10 text-violet-light'
                      }`}>
                        {config.label}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${notif.read ? 'text-base-300' : 'text-base-200'}`}>
                      {notif.message}
                    </p>
                    <span className="text-2xs text-base-400 mt-1 block">{timeAgo(notif.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
