import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UserTypeSelect from './UserTypeSelect'
import ProfileSetup from './ProfileSetup'
import { useOnboarding } from '../hooks/useOnboarding'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const { selectUserType, completeProfile } = useOnboarding()

  const handleTypeSelect = (types) => {
    selectUserType(types)
    setStep(1)
  }

  const handleProfileComplete = (profile) => {
    completeProfile(profile)
  }

  return (
    <div className="min-h-screen bg-base-900 bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet/5 rounded-full blur-[180px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-base-800/50 border border-base-600/50 rounded-2xl p-6 relative z-10 backdrop-blur-sm"
      >
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                i <= step ? 'bg-violet' : 'bg-base-600'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <UserTypeSelect onNext={handleTypeSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProfileSetup onComplete={handleProfileComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
