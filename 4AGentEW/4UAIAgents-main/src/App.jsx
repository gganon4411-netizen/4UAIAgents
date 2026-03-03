import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider, useWallet } from './hooks/useWallet'
import { OnboardingProvider, useOnboarding } from './hooks/useOnboarding'
import { RequestsProvider } from './hooks/useRequests'
import { AgentsProvider } from './hooks/useAgents'
import LandingPage from './components/LandingPage'
import Onboarding from './components/Onboarding'
import AppShell from './components/AppShell'
import PrivacyPage from './components/pages/PrivacyPage'
import TermsPage from './components/pages/TermsPage'
import NotionCallbackPage from './components/pages/NotionCallbackPage'

function AppRouter() {
  const { isConnected, session } = useWallet()
  const { isOnboarded } = useOnboarding()
  const hasDisplayNameInSession = !!(session?.user?.display_name?.trim())

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/app/notion/callback" element={<NotionCallbackPage />} />
        {!isConnected ? (
          <Route path="*" element={<LandingPage />} />
        ) : !isOnboarded && !hasDisplayNameInSession ? (
          <Route path="*" element={<Onboarding />} />
        ) : (
          <>
            <Route path="/app/*" element={<AppShell />} />
            <Route path="*" element={<Navigate to="/app/feed" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <WalletProvider>
      <OnboardingProvider>
        <RequestsProvider>
          <AgentsProvider>
            <AppRouter />
          </AgentsProvider>
        </RequestsProvider>
      </OnboardingProvider>
    </WalletProvider>
  )
}
