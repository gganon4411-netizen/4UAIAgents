import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UserTypeSelect from './UserTypeSelect'
import ProfileSetup from './ProfileSetup'
import { useOnboarding } from '../hooks/useOnboarding'

export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const { selectUserType, completeProfile } = useOnboarding()

  const handleTypeNext = (types) => {
    selectUserType(types)
    setStep(1)
  }

  const handleProfileComplete = (profile) => {
    completeProfile(profile)
  }

  return (
    <div className="min-h-screen bg-base-900 bg-grid flex items-center justify-center p-4 relative">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet/5 rounded-full blur-[200px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'w-8 bg-violet' : 'w-8 bg-base-700'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-base-800/50 border border-base-600/50 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <UserTypeSelect onNext={handleTypeNext} />
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <ProfileSetup onComplete={handleProfileComplete} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
