"use client"

import { useAuth } from '@/components/auth-provider'
import { sessionManager } from '@/lib/session-manager'
import { InterviewSession } from '@/lib/api-service'

export function useSessionManager() {
  const { isAuthenticated, user } = useAuth()

  const createSession = async (sessionData: any): Promise<InterviewSession | null> => {
    if (!isAuthenticated || !user) return null
    return sessionManager.createSession(sessionData)
  }

  const updateSession = async (sessionId: string, updateData: any): Promise<InterviewSession | null> => {
    if (!isAuthenticated || !user) return null
    return sessionManager.updateSession(sessionId, updateData)
  }

  const updateSessionAnswers = async (sessionId: string, answers: Record<string, string>): Promise<void> => {
    if (!isAuthenticated || !user) return
    return sessionManager.updateSessionAnswers(sessionId, answers)
  }

  const deleteSession = async (sessionId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false
    return sessionManager.deleteSession(sessionId)
  }

  const loadSessions = async (): Promise<InterviewSession[]> => {
    if (!isAuthenticated || !user) return []
    return sessionManager.loadSessions()
  }

  const getCachedSessions = (): InterviewSession[] => {
    return sessionManager.getCachedSessions()
  }

  const getCachedSession = (sessionId: string): InterviewSession | undefined => {
    return sessionManager.getCachedSession(sessionId)
  }

  return {
    createSession,
    updateSession,
    updateSessionAnswers,
    deleteSession,
    loadSessions,
    getCachedSessions,
    getCachedSession,
    isReady: isAuthenticated && user
  }
}