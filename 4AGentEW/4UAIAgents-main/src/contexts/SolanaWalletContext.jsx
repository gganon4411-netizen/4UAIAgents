import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet as useAdapterWallet } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { ConnectionProvider, WalletProvider as AdapterWalletProvider } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import api from '../lib/api'

const SESSION_KEY = '4u_session'

const SessionContext = createContext(null)

function shortenAddress(addr) {
  if (!addr) return ''
  return addr.slice(0, 4) + '...' + addr.slice(-4)
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function AuthSessionProvider({ children }) {
  const { publicKey, signMessage, connect, disconnect: adapterDisconnect, select, wallets, connected: adapterConnected, connecting: adapterConnecting } = useAdapterWallet()
  const [session, setSessionState] = useState(() => getSession())
  const [step, setStep] = useState('idle')
  const [authError, setAuthError] = useState(null)

  const setSession = useCallback((data) => {
    setSessionState(data)
    if (data) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(SESSION_KEY)
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
  }), [session, publicKey, connect, disconnect, select, wallets, adapterConnected, adapterConnecting, step, authError])

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
      <AdapterWalletProvider wallets={wallets} autoConnect={false}>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </AdapterWalletProvider>
    </ConnectionProvider>
  )
}
