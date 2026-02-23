import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Check } from 'lucide-react'

export default function ProfileSetup({ onComplete }) {
  const [displayName, setDisplayName] = useState('')

  const isValid = displayName.trim().length >= 2

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Set up your profile</h2>
      <p className="text-xs text-base-200 mb-5">Choose a display name for the marketplace.</p>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
          <User className="w-3.5 h-3.5 text-violet-light" />
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g., builder_42"
          maxLength={30}
          className="w-full px-4 py-3 rounded-xl bg-base-700/50 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => isValid && onComplete({ displayName: displayName.trim() })}
        disabled={!isValid}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
          isValid
            ? 'bg-violet text-white glow-violet hover:bg-violet-light'
            : 'bg-base-700 text-base-300 cursor-not-allowed'
        }`}
      >
        <Check className="w-4 h-4" />
        Enter 4U
      </motion.button>
    </div>
  )
}
