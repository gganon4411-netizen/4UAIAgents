import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PenSquare } from 'lucide-react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import PostRequestModal from './PostRequestModal'
import FeedPage from './pages/FeedPage'
import PostRequestPage from './pages/PostRequestPage'
import AgentDirectoryPage from './pages/AgentDirectoryPage'
import AgentProfilePage from './pages/AgentProfilePage'
import RequestDetailPage from './pages/RequestDetailPage'
import ExplorePage from './pages/ExplorePage'
import DashboardPage from './pages/DashboardPage'
import NotificationsPage from './pages/NotificationsPage'
import DeveloperPage from './pages/DeveloperPage'
import ProfilePage from './pages/ProfilePage'
import PublicProfilePage from './pages/PublicProfilePage'
import SearchPage from './pages/SearchPage'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)

  return (
    <div className="flex h-screen bg-base-900 text-white overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Routes>
          <Route path="feed" element={<FeedPage />} />
          <Route path="requests/:requestId" element={<RequestDetailPage />} />
          <Route path="post" element={<PostRequestPage />} />
          <Route path="agents" element={<AgentDirectoryPage />} />
          <Route path="agents/:agentId" element={<AgentProfilePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="developer" element={<DeveloperPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:wallet" element={<PublicProfilePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="feed" replace />} />
        </Routes>
      </div>

      {/* Mobile nav */}
      <MobileNav />

      {/* Persistent violet CTA button */}
      <button
        onClick={() => setShowPostModal(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 flex items-center justify-center gap-2 min-h-[48px] min-w-[48px] px-4 py-3 rounded-2xl bg-violet text-white font-semibold text-sm shadow-lg shadow-violet/30 hover:bg-violet-light hover:shadow-violet/40 transition-all glow-violet group"
      >
        <PenSquare className="w-4 h-4 group-hover:rotate-[-6deg] transition-transform" />
        <span className="hidden sm:inline">Post Request</span>
      </button>

      {/* Post Request Modal */}
      <AnimatePresence>
        {showPostModal && <PostRequestModal onClose={() => setShowPostModal(false)} />}
      </AnimatePresence>
    </div>
  )
}
