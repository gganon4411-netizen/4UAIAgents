import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet as useAdapterWallet, useConnection as useAdapterConnection } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { ConnectionProvider, WalletProvider as AdapterWalletProvider } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import api from '../lib/api'

const SESSION_KEY = '4u_session'
const USER_KEY = '4u_user'
const API_BASE = 'https://4u-backend-production.up.railway.app'
const PROFILE_FIELDS = ['display_name', 'username', 'bio', 'avatar_url', 'twitter', 'github', 'website']

const SessionContext = createContext(null)

function shortenAddress(addr) {
  if (!addr) return ''
  return addr.slice(0, 4) + '...' + addr.slice(-4)
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const session = raw ? JSON.parse(raw) : null
    if (session?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(session.user))
    }
    return session
  } catch {
    return null
  }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function AuthSessionProvider({ children }) {
  const { publicKey, signMessage, sendTransaction, connect, disconnect: adapterDisconnect, select, wallets, connected: adapterConnected, connecting: adapterConnecting } = useAdapterWallet()
  const { connection } = useAdapterConnection()
  const [session, setSessionState] = useState(() => getSession())
  const [step, setStep] = useState('idle')
  const [authError, setAuthError] = useState(null)

  const setSession = useCallback((data) => {
    setSessionState(data)
    if (data) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data))
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      }
    } else {
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }, [])

  useEffect(() => {
    if (!publicKey || session?.user?.wallet_address === publicKey.toBase58()) return
    if (session && session.user?.wallet_address !== publicKey.toBase58()) {
      setSession(null)
    }
    let cancelled = false
    setAuthError(null)
    setStep('signing')

    ;(async () => {
      try {
        const { message } = await api.auth.getNonce(publicKey.toBase58())
        if (cancelled) return
        if (!signMessage) {
          setAuthError('Wallet does not support message signing')
          setStep('idle')
          return
        }
        const messageBytes = new TextEncoder().encode(message)
        const signature = await signMessage(messageBytes)
        if (cancelled) return
        const signatureBase58 = bs58.encode(signature)
        const data = await api.auth.signInWithWallet(publicKey.toBase58(), message, signatureBase58)
        if (cancelled) return
        const token = data?.access_token
        if (token) {
          try {
            const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (profileRes.ok) {
              const profileData = await profileRes.json()
              const mergedUser = { ...data.user }
              PROFILE_FIELDS.forEach((key) => {
                if (profileData[key] !== undefined) mergedUser[key] = profileData[key]
              })
              data.user = mergedUser
            }
          } catch (_) {
            // keep session without profile merge on profile fetch failure
          }
        }
        setSession(data)
        setStep('connected')
        setTimeout(() => setStep('idle'), 800)
      } catch (err) {
        if (!cancelled) {
          setAuthError(err.message || 'Sign-in failed')
          setStep('idle')
        }
      }
    })()

    return () => { cancelled = true }
  }, [publicKey?.toBase58(), signMessage, session])

  const disconnect = useCallback(() => {
    setSession(null)
    setStep('idle')
    setAuthError(null)
    adapterDisconnect()
  }, [adapterDisconnect])

  const value = useMemo(() => ({
    session,
    setSession,
    address: session?.user?.wallet_address || publicKey?.toBase58() || '',
    isConnected: !!session,
    publicKey,
    connection,
    sendTransaction,
    connect,
    disconnect,
    select,
    wallets,
    adapterConnected: !!adapterConnected,
    isConnecting: adapterConnecting || (step !== 'idle' && step !== 'connected'),
    step,
    authError,
    setStep,
    shortenAddress,
  }), [session, publicKey, connection, sendTransaction, connect, disconnect, select, wallets, adapterConnected, adapterConnecting, step, authError])

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

const endpoint = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

export function WalletProvider({ children }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new BackpackWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <AdapterWalletProvider wallets={wallets} autoConnect>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </AdapterWalletProvider>
    </ConnectionProvider>
  )
}
