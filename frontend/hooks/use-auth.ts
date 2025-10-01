"use client"

import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/lib/auth-service'

const TOKEN_KEY = 'ib_access_token'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t) setToken(t)
  }, [])

  const saveToken = useCallback((t: string | null) => {
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
    setToken(t)
  }, [])

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.signup({ email, password, name })
      saveToken(res.access_token)
      return res
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [saveToken])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authService.login(email, password)
      saveToken(res.access_token)
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
      saveToken(null)
      setLoading(false)
    }
  }, [token, saveToken])

  return { token, loading, error, signup, login, logout }
}
