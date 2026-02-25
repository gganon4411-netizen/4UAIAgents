import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Rss, PenSquare, Compass, LayoutDashboard, Bot, Bell, Search } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

const API_BASE = import.meta.env.VITE_API_URL || 'https://4u-backend-production.up.railway.app'

const NAV_ITEMS = [
  { path: '/app/feed', label: 'Feed', icon: Rss },
  { path: '/app/search', label: 'Search', icon: Search },
  { path: '/app/agents', label: 'Agents', icon: Bot },
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/notifications', label: 'Alerts', icon: Bell },
]

export default function MobileNav() {
  const location = useLocation()
  const { session, address } = useWallet()
  const wallet = session?.user?.wallet_address || address || null
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!wallet) return
    const load = () =>
      fetch(`${API_BASE}/api/notifications/${wallet}/unread-count`)
        .then((r) => r.json())
        .then((d) => setUnreadCount(d.count || 0))
        .catch(() => {})
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [wallet])

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-800/95 backdrop-blur border-t border-base-600/50 px-2 py-1.5 z-40">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const isNotif = item.path === '/app/notifications'
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
                isActive ? 'text-violet-light' : 'text-base-400'
              }`}
            >
              <span className="relative">
                <item.icon className="w-5 h-5" />
                {isNotif && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-violet text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="text-2xs">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
