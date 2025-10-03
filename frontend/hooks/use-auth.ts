"use client"

import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/lib/auth-service'

const TOKEN_KEY = 'ib_access_token'
const REMEMBER_KEY = 'ib_remember_token'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for both session and persistent storage
    const sessionToken = sessionStorage.getItem(TOKEN_KEY)
    const persistentToken = localStorage.getItem(REMEMBER_KEY)
    
    if (sessionToken) {
      setToken(sessionToken)
    } else if (persistentToken) {
      setToken(persistentToken)
      // Move to session storage for current session
      sessionStorage.setItem(TOKEN_KEY, persistentToken)
    }
    // Listen for token changes broadcast from other hook instances
    const onTokenChange = (e: Event) => {
      try {
        const t = (e as CustomEvent<string | null>).detail
        setToken(t)
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener('ib_token_changed', onTokenChange as EventListener)

    return () => {
      window.removeEventListener('ib_token_changed', onTokenChange as EventListener)
    }
  }, [])

  const saveToken = useCallback((t: string | null, remember: boolean = false) => {
    if (t) {
      // Always save to session storage
      sessionStorage.setItem(TOKEN_KEY, t)
      
      if (remember) {
        // Save to persistent storage if remember me is checked
        localStorage.setItem(REMEMBER_KEY, t)
      } else {
        // Remove from persistent storage if not remembering
        localStorage.removeItem(REMEMBER_KEY)
      }
    } else {
      // Clear all storage on logout
      sessionStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REMEMBER_KEY)
    }
    setToken(t)
    // Broadcast token change to other hook instances in this window
    try {
      window.dispatchEvent(new CustomEvent('ib_token_changed', { detail: t }))
    } catch (err) {
      // ignore in non-browser environments
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.signup({ email, password, name })
      saveToken(res.access_token, false) // Don't remember by default for signup
      return res
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [saveToken])

  const login = useCallback(async (email: string, password: string, remember: boolean = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.login(email, password)
      saveToken(res.access_token, remember)
      return res
    } catch (err: any) {
      setError(err?.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [saveToken])

  const logout = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      await authService.logout(token)
    } catch (err) {
      // ignore errors on logout
    } finally {
      saveToken(null, false)
      setLoading(false)
    }
  }, [token, saveToken])

  return { token, loading, error, signup, login, logout }
}
