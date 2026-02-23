import React from 'react'
import { motion } from 'framer-motion'
import { X, Wallet, Loader2, Check, ArrowRight, Shield } from 'lucide-react'
import { useWallet } from '../contexts/SolanaWalletContext'

const WALLET_OPTIONS = [
  { name: 'Phantom', icon: '👻', adapterName: 'Phantom' },
  { name: 'Backpack', icon: '🎒', adapterName: 'Backpack' },
  { name: 'Solflare', icon: '🔥', adapterName: 'Solflare' },
]

const STEPS = {
  idle: { label: 'Connect your Solana wallet', icon: Wallet },
  requesting: { label: 'Approve in wallet...', icon: Shield },
  signing: { label: 'Sign message...', icon: Loader2, spin: true },
  connected: { label: 'Connected!', icon: Check },
}

export default function WalletConnectModal({ onClose }) {
  const { wallets, select, connect, setStep, isConnecting, step, authError } = useWallet()
  const currentStep = STEPS[step] || STEPS.idle

  const handleSelectWallet = (adapterName) => {
    setStep('requesting')
    const wallet = wallets.find((w) => w.adapter.name === adapterName)
    if (wallet) {
      select(wallet.adapter.name)
      connect()
    } else {
      setStep('idle')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm bg-base-800 border border-base-600/50 rounded-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-base-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
            step === 'connected' ? 'bg-acid/10' : 'bg-violet/10'
          }`}>
            <currentStep.icon
              className={`w-6 h-6 ${
                step === 'connected' ? 'text-acid' : 'text-violet-light'
              } ${currentStep.spin ? 'animate-spin' : ''}`}
            />
          </div>

          <h2 className="text-base font-bold mb-1">{currentStep.label}</h2>
          <p className="text-xs text-base-300 mb-6">
            {step === 'idle'
              ? 'Choose a wallet to connect and sign in to 4U.'
              : step === 'connected'
              ? 'Your wallet is connected. Redirecting...'
              : 'Please approve the request in your wallet.'}
          </p>

          {authError && (
            <div className="mb-4 rounded-xl bg-violet/10 border border-violet/30 p-3 text-left">
              <p className="text-sm text-violet-light font-medium">{authError}</p>
            </div>
          )}

          {step === 'idle' && (
            <div className="space-y-2">
              {WALLET_OPTIONS.map((opt) => {
                const wallet = wallets.find((w) => w.adapter.name === opt.adapterName)
                const isAvailable = wallet?.readyState === 'Installed' || wallet?.readyState === 'Loadable'
                return (
                  <motion.button
                    key={opt.adapterName}
                    whileHover={isAvailable ? { scale: 1.01 } : {}}
                    whileTap={isAvailable ? { scale: 0.99 } : {}}
                    onClick={() => isAvailable && handleSelectWallet(opt.adapterName)}
                    disabled={!isAvailable}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all group ${
                      isAvailable
                        ? 'bg-base-700/50 border-base-600 hover:border-violet/30'
                        : 'bg-base-800/50 border-base-700 cursor-not-allowed opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-sm font-semibold text-white">{opt.name}</span>
                      {!isAvailable && (
                        <span className="text-2xs text-base-400">Not detected</span>
                      )}
                    </div>
                    {isAvailable && (
                      <ArrowRight className="w-4 h-4 text-base-400 group-hover:text-violet-light transition-colors" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          )}

          {isConnecting && step !== 'connected' && (
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-violet-light"
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
