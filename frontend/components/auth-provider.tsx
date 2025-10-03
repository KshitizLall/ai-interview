"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiService, UserProfile, AnonymousUsageLimits } from '@/lib/api-service'
import { sessionManager } from '@/lib/session-manager'
import { toast } from 'sonner'

interface AuthContextType {
  // Authentication state
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  // Anonymous usage tracking
  anonymousUsage: AnonymousUsageLimits
  updateAnonymousUsage: (usage: Partial<AnonymousUsageLimits>) => void

  // Authentication methods
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>

  // Credit management
  checkCredits: (operation: string, cost?: number) => Promise<boolean>
  deductCredits: (operation: string, cost?: number) => Promise<boolean>

  // Usage checks (for both authenticated and anonymous users)
  canGenerateQuestions: (count?: number) => boolean
  canGenerateAnswers: (count?: number) => boolean
  getRemainingQuota: (operation: 'questions' | 'answers') => number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [anonymousUsage, setAnonymousUsage] = useState<AnonymousUsageLimits>({
    questions_generated: 0,
    answers_generated: 0,
    max_questions: 10,
    max_answers: 10
  })

  const isAuthenticated = !!user

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const token = apiService.getToken()
      if (token) {
        try {
          const profile = await apiService.getProfile()
          setUser(profile)
          sessionManager.setUser(profile)
        } catch (error) {
          // Token might be expired, clear it
          apiService.setToken(null)
          sessionManager.clearCache()
          console.error('Failed to load user profile:', error)
        }
      }

      // Load anonymous usage
      const usage = apiService.getAnonymousUsage()
      setAnonymousUsage(usage)

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      await apiService.login({ email, password })
      const profile = await apiService.getProfile()
      setUser(profile)
      sessionManager.setUser(profile)
      
      // Reset anonymous usage when user logs in
      apiService.resetAnonymousUsage()
      setAnonymousUsage({
        questions_generated: 0,
        answers_generated: 0,
        max_questions: 10,
        max_answers: 10
      })

      toast.success('Logged in successfully!')
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      await apiService.signup({ name, email, password })
      const profile = await apiService.getProfile()
      setUser(profile)
      sessionManager.setUser(profile)

      // Reset anonymous usage when user signs up
      apiService.resetAnonymousUsage()
      setAnonymousUsage({
        questions_generated: 0,
        answers_generated: 0,
        max_questions: 10,
        max_answers: 10
      })

      toast.success(`Welcome ${name}! You've received 50 free credits.`)
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      sessionManager.clearCache()
      // Reset anonymous usage tracking
      const usage = apiService.getAnonymousUsage()
      setAnonymousUsage(usage)
      toast.success('Logged out successfully')
    }
  }

  const refreshProfile = async (): Promise<void> => {
    if (!isAuthenticated) return
    
    try {
      const profile = await apiService.getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }

  const checkCredits = async (operation: string, cost: number = 1): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      const response = await apiService.checkCredits(operation, cost)
      return response.has_credits
    } catch (error) {
      console.error('Failed to check credits:', error)
      return false
    }
  }

  const deductCredits = async (operation: string, cost: number = 1): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      const response = await apiService.deductCredits(operation, cost)
      if (response.success) {
        // Update user credits in state
        setUser(prev => prev ? { ...prev, credits: response.new_credit_balance } : null)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to deduct credits:', error)
      return false
    }
  }

  const updateAnonymousUsage = (usage: Partial<AnonymousUsageLimits>) => {
    const updated = { ...anonymousUsage, ...usage }
    setAnonymousUsage(updated)
    apiService.updateAnonymousUsage(usage)
  }

  const canGenerateQuestions = (count: number = 1): boolean => {
    if (isAuthenticated) {
      return user ? user.credits >= count : false
    }
    
    // Anonymous users
    return (anonymousUsage.questions_generated + count) <= anonymousUsage.max_questions
  }

  const canGenerateAnswers = (count: number = 1): boolean => {
    if (isAuthenticated) {
      return user ? user.credits >= count : false
    }
    
    // Anonymous users
    return (anonymousUsage.answers_generated + count) <= anonymousUsage.max_answers
  }

  const getRemainingQuota = (operation: 'questions' | 'answers'): number => {
    if (isAuthenticated) {
      return user ? user.credits : 0
    }
    
    // Anonymous users
    if (operation === 'questions') {
      return Math.max(0, anonymousUsage.max_questions - anonymousUsage.questions_generated)
    } else {
      return Math.max(0, anonymousUsage.max_answers - anonymousUsage.answers_generated)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    anonymousUsage,
    updateAnonymousUsage,
    login,
    signup,
    logout,
    refreshProfile,
    checkCredits,
    deductCredits,
    canGenerateQuestions,
    canGenerateAnswers,
    getRemainingQuota,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook for getting authentication status without throwing error
export function useAuthOptional() {
  return useContext(AuthContext)
}