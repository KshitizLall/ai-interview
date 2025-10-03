"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWebSocket, WebSocketStatus, ProgressUpdate } from '@/hooks/use-websocket'

interface WebSocketContextType {
  status: WebSocketStatus
  connectionId: string | null
  isConnected: boolean
  isConnecting: boolean
  progressUpdate: ProgressUpdate | null
  lastError: string | null
  generateQuestions: (data: {
    resume_text: string
    job_description: string
    options: any
  }) => boolean
  saveAnswer: (questionId: string, answer: string) => boolean
  generateAnswer: (question: string, resumeText: string) => boolean
  clearProgress: () => void
  clearError: () => void
  // Session events
  notifySessionCreated: (session: any) => void
  notifySessionUpdated: (session: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: React.ReactNode
  sessionId?: string
  onQuestionsGenerated?: (questions: any[]) => void
  onAnswerSaved?: (data: any) => void
}

export function WebSocketProvider({ 
  children, 
  sessionId, 
  onQuestionsGenerated,
  onAnswerSaved 
}: WebSocketProviderProps) {
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [connectionAttempted, setConnectionAttempted] = useState(false)

  // Generate a session ID if not provided
  const effectiveSessionId = sessionId || React.useMemo(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, [sessionId])

  // Check if backend is available before attempting WebSocket connection
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)

  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://interviewbot-8908.onrender.com'
          : 'http://localhost:8000'
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch(`${baseUrl}/websocket/ws/stats`, {
          method: 'GET',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          setBackendAvailable(true)
        } else {
          setBackendAvailable(false)
        }
      } catch (error) {
        setBackendAvailable(false)
        console.log('Backend WebSocket server not available, using HTTP API fallback')
      } finally {
        setConnectionAttempted(true)
      }
    }
    
    checkBackend()
  }, [])

  const ws = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 
         (process.env.NODE_ENV === 'production' 
           ? 'wss://interviewbot-8908.onrender.com/websocket/ws'
           : 'ws://localhost:8000/websocket/ws'),
    sessionId: effectiveSessionId,
    reconnect: false, // Disable reconnection to prevent constant failed attempts
    enabled: backendAvailable === true, // Only connect if backend is available
    onProgressUpdate: (progress) => {
      setProgressUpdate(progress)
    },
    onQuestionsGenerated: (questions) => {
      onQuestionsGenerated?.(questions)
      // Dispatch custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('questionsGenerated', { 
          detail: questions 
        }))
      }
    },
    onAnswerSaved: (data) => {
      onAnswerSaved?.(data)
      // Dispatch custom event for answer saved
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('answerSaved', { 
          detail: data 
        }))
      }
    },
    onError: (error) => {
      setLastError('WebSocket connection error')
      console.error('WebSocket error:', error)
    },
    onClose: () => {
      setLastError(null)
    },
    onMessage: (message) => {
      if (message.type === 'error') {
        setLastError(message.data?.message || 'Unknown error occurred')
      }
    }
  })

  const clearProgress = () => setProgressUpdate(null)
  const clearError = () => setLastError(null)

  const contextValue: WebSocketContextType = {
    status: !connectionAttempted ? 'connecting' : (backendAvailable === false ? 'disconnected' : ws.status),
    connectionId: ws.connectionId,
    isConnected: ws.isConnected && backendAvailable === true,
    isConnecting: !connectionAttempted || ws.isConnecting,
    progressUpdate,
    lastError: backendAvailable === false ? null : lastError, // Don't show WebSocket errors if backend is not available
    generateQuestions: ws.generateQuestions,
    saveAnswer: ws.saveAnswer,
    generateAnswer: ws.generateAnswer,
    clearProgress,
    clearError,
    // Session event notifiers
    notifySessionCreated: (session: any) => {
      // Emit custom event for session creation
      const event = new CustomEvent('sessionCreated', { detail: session })
      window.dispatchEvent(event)
    },
    notifySessionUpdated: (session: any) => {
      // Emit custom event for session update
      const event = new CustomEvent('sessionUpdated', { detail: { session, silent: false } })
      window.dispatchEvent(event)
    },
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider')
  }
  return context
}