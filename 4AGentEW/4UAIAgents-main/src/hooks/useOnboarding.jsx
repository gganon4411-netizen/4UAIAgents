import React, { createContext, useContext, useState, useCallback } from 'react'

const OnboardingContext = createContext(null)

export function OnboardingProvider({ children }) {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [userTypes, setUserTypes] = useState([])
  const [profile, setProfile] = useState({ displayName: '' })

  const selectUserType = useCallback((types) => {
    setUserTypes(types)
  }, [])

  const completeProfile = useCallback((profileData) => {
    setProfile(profileData)
    setIsOnboarded(true)
  }, [])

  const reset = useCallback(() => {
    setIsOnboarded(false)
    setUserTypes([])
    setProfile({ displayName: '' })
  }, [])

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarded,
        userTypes,
        profile,
        selectUserType,
        completeProfile,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
