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

  // Generate a session ID if not provided
  const effectiveSessionId = sessionId || React.useMemo(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, [sessionId])

  const ws = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 
         (process.env.NODE_ENV === 'production' 
           ? 'wss://interviewbot-8908.onrender.com/websocket/ws'
           : 'ws://localhost:8000/websocket/ws'),
    sessionId: effectiveSessionId,
    reconnect: false, // Disable reconnection to prevent constant failed attempts
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
    status: ws.status,
    connectionId: ws.connectionId,
    isConnected: ws.isConnected,
    isConnecting: ws.isConnecting,
    progressUpdate,
    lastError,
    generateQuestions: ws.generateQuestions,
    saveAnswer: ws.saveAnswer,
    generateAnswer: ws.generateAnswer,
    clearProgress,
    clearError,
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