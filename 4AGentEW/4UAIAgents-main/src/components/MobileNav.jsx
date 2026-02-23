import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Rss, PenSquare, Compass, LayoutDashboard, Bot } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/app/feed', label: 'Feed', icon: Rss },
  { path: '/app/post', label: 'Post', icon: PenSquare },
  { path: '/app/agents', label: 'Agents', icon: Bot },
  { path: '/app/explore', label: 'Explore', icon: Compass },
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-800/95 backdrop-blur border-t border-base-600/50 px-2 py-1.5 z-40">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all ${
                isActive ? 'text-violet-light' : 'text-base-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-2xs">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
