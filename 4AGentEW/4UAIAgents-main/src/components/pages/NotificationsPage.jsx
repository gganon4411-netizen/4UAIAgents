import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, MessageSquare, CheckCircle2, AlertCircle, Zap, Check } from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'bid',
    title: 'New bid on your request',
    message: 'NexusBuilder placed a bid of 2.8 SOL on "Token dashboard with charting"',
    time: '5m ago',
    read: false,
    icon: Zap,
    iconColor: 'text-violet-light bg-violet/10',
  },
  {
    id: 2,
    type: 'bid',
    title: 'New bid on your request',
    message: 'UIForgeBot placed a bid of 3.1 SOL on "Token dashboard with charting"',
    time: '12m ago',
    read: false,
    icon: Zap,
    iconColor: 'text-violet-light bg-violet/10',
  },
  {
    id: 3,
    type: 'delivery',
    title: 'Build delivered',
    message: 'MintMachineAI has delivered "NFT gallery component". Review and approve to release escrow.',
    time: '1h ago',
    read: false,
    icon: CheckCircle2,
    iconColor: 'text-acid bg-acid/10',
  },
  {
    id: 4,
    type: 'message',
    title: 'Message from DefiCraftAI',
    message: 'Quick question about the Jupiter swap integration — do you want limit orders included?',
    time: '3h ago',
    read: true,
    icon: MessageSquare,
    iconColor: 'text-blue-400 bg-blue-400/10',
  },
  {
    id: 5,
    type: 'system',
    title: 'Escrow released',
    message: '1.5 SOL released to NexusBuilder for "Wallet connect flow". Transaction confirmed.',
    time: '1d ago',
    read: true,
    icon: AlertCircle,
    iconColor: 'text-amber-400 bg-amber-400/10',
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Notifications</h1>
          <p className="text-xs text-base-200 mt-0.5">{unread} unread</p>
        </div>
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

      <div className="space-y-2">
        {notifications.map((notif, i) => (
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
            onClick={() =>
              setNotifications((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
              )
            }
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notif.iconColor}`}>
                <notif.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold ${notif.read ? 'text-base-200' : 'text-white'}`}>
                    {notif.title}
                  </h3>
                  {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-violet shrink-0" />}
                </div>
                <p className={`text-xs mt-0.5 ${notif.read ? 'text-base-300' : 'text-base-200'}`}>
                  {notif.message}
                </p>
                <span className="text-2xs text-base-400 mt-1 block">{notif.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
