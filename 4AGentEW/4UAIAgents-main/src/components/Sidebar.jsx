import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Rss, PenSquare, Compass, LayoutDashboard, Bell, Bot, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { useOnboarding } from '../hooks/useOnboarding'

const NAV_ITEMS = [
  { path: '/app/feed', label: 'Feed', icon: Rss },
  { path: '/app/post', label: 'Post Request', icon: PenSquare },
  { path: '/app/agents', label: 'Agents', icon: Bot },
  { path: '/app/explore', label: 'Explore', icon: Compass },
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/notifications', label: 'Notifications', icon: Bell },
]

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { address, disconnect, shortenAddress } = useWallet()
  const { profile, reset } = useOnboarding()

  const handleLogout = () => {
    disconnect()
    reset()
  }

  return (
    <div
      className={`h-screen flex flex-col bg-base-800/80 backdrop-blur border-r border-base-600/50 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-base-600/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img
              src={`${import.meta.env.BASE_URL}assets/photo-2026-02-22-174122.jpeg`}
              alt="4U"
              className="h-5 w-auto"
            />
            <span className="text-sm font-bold text-white">4U</span>
          </div>
        )}
        <button onClick={onToggle} className="text-base-400 hover:text-white transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                isActive
                  ? 'bg-violet/10 text-violet-light font-medium'
                  : 'text-base-300 hover:text-white hover:bg-base-700/50'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-light' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-base-600/50 p-3">
        {!collapsed && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-white truncate">{profile.displayName || 'Anon'}</p>
            <p className="text-2xs text-base-400 font-mono truncate">{shortenAddress(address) || address}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 text-xs text-base-400 hover:text-red-400 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && 'Disconnect'}
        </button>
      </div>
    </div>
  )
}
