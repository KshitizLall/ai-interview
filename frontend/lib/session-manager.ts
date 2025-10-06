"use client"

import { apiService, InterviewSession } from '@/lib/api-service'
import { toast } from 'sonner'

class SessionManager {
  private static instance: SessionManager
  private sessions: InterviewSession[] = []
  private currentUser: any = null

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  // Initialize with user data
  setUser(user: any) {
    this.currentUser = user
  }

  // Load initial sessions
  async loadSessions(): Promise<InterviewSession[]> {
    if (!this.currentUser) return []

    try {
      const response = await apiService.getSessions(true)
      this.sessions = response.sessions
      return this.sessions
    } catch (error) {
      console.error('Failed to load sessions:', error)
      return []
    }
  }

  // Create session and emit event
  async createSession(sessionData: any): Promise<InterviewSession | null> {
    if (!this.currentUser) return null

    try {
      const response = await apiService.createSession(sessionData)
      const newSession = response.session

      // Update local cache
      this.sessions = [newSession, ...this.sessions]

      // Emit event for UI updates
      this.emitSessionCreated(newSession)

      return newSession
    } catch (error) {
      console.error('Failed to create session:', error)
      toast.error('Failed to create session')
      return null
    }
  }

  // Update session and emit event
  async updateSession(sessionId: string, updateData: any): Promise<InterviewSession | null> {
    if (!this.currentUser) return null

    try {
      const response = await apiService.updateSession(sessionId, updateData)
      const updatedSession = response.session

      // Update local cache
      this.sessions = this.sessions.map(session => 
        session.id === sessionId ? updatedSession : session
      )

      // Emit event for UI updates
      this.emitSessionUpdated(updatedSession)

      return updatedSession
    } catch (error) {
      console.error('Failed to update session:', error)
      toast.error('Failed to update session')
      return null
    }
  }

  // Update session answers (for auto-save)
  async updateSessionAnswers(sessionId: string, answers: Record<string, string>): Promise<void> {
    if (!this.currentUser) return

    try {
      const response = await apiService.updateSessionAnswers(sessionId, answers)
      const updatedSession = response.session

      // Update local cache silently (no toast for auto-save)
      this.sessions = this.sessions.map(session => 
        session.id === sessionId ? updatedSession : session
      )

      // Emit quiet update event
      this.emitSessionUpdated(updatedSession, true)
    } catch (error) {
      console.error('Failed to auto-save session:', error)
      // Don't show error toast for auto-save failures
    }
  }

  // Delete session and emit event
  async deleteSession(sessionId: string): Promise<boolean> {
    if (!this.currentUser) return false

    try {
      await apiService.deleteSession(sessionId)

      // Update local cache
      this.sessions = this.sessions.filter(session => session.id !== sessionId)

      // Emit event for UI updates
      this.emitSessionDeleted(sessionId)

      toast.success('Session deleted')
      return true
    } catch (error) {
      console.error('Failed to delete session:', error)
      toast.error('Failed to delete session')
      return false
    }
  }

  // Get cached sessions (no API call)
  getCachedSessions(): InterviewSession[] {
    return this.sessions
  }

  // Get specific session from cache
  getCachedSession(sessionId: string): InterviewSession | undefined {
    return this.sessions.find(session => session.id === sessionId)
  }

  // Clear cache on logout
  clearCache() {
    this.sessions = []
    this.currentUser = null
  }

  // Event emitters
  private emitSessionCreated(session: InterviewSession) {
    const event = new CustomEvent('sessionCreated', { detail: session })
    window.dispatchEvent(event)
  }

  private emitSessionUpdated(session: InterviewSession, silent: boolean = false) {
    const event = new CustomEvent('sessionUpdated', { 
      detail: { session, silent } 
    })
    window.dispatchEvent(event)
  }

  private emitSessionDeleted(sessionId: string) {
    const event = new CustomEvent('sessionDeleted', { detail: sessionId })
    window.dispatchEvent(event)
  }

  // Batch update for multiple sessions (useful for bulk operations)
  updateMultipleSessions(sessions: InterviewSession[]) {
    sessions.forEach(session => {
      const index = this.sessions.findIndex(s => s.id === session.id)
      if (index !== -1) {
        this.sessions[index] = session
      }
    })

    // Emit batch update event
    const event = new CustomEvent('sessionsBatchUpdated', { detail: sessions })
    window.dispatchEvent(event)
  }
}

export const sessionManager = SessionManager.getInstance()