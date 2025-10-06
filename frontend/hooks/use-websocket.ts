import { useEffect, useRef, useCallback, useState } from 'react'

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'

export interface WebSocketMessage {
  type: string
  data?: any
  timestamp?: number
}

export interface ProgressUpdate {
  stage: string
  message: string
  progress: number
}

export interface UseWebSocketOptions {
  url: string
  sessionId?: string
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  enabled?: boolean
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  onMessage?: (message: WebSocketMessage) => void
  onProgressUpdate?: (progress: ProgressUpdate) => void
  onQuestionsGenerated?: (questions: any[]) => void
  onAnswerSaved?: (data: { question_id: string; answer: string; saved_at: number }) => void
  onAnswerGenerated?: (data: { question: string; answer: string; generated_at: number }) => void
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    sessionId,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    enabled = true,
    onOpen,
    onClose,
    onError,
    onMessage,
    onProgressUpdate,
    onQuestionsGenerated,
    onAnswerSaved,
    onAnswerGenerated,
  } = options

  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [connectionId, setConnectionId] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isManualCloseRef = useRef(false)

  const buildUrl = useCallback(() => {
    const wsUrl = new URL(url)
    if (sessionId) {
      wsUrl.searchParams.set('session_id', sessionId)
    }
    return wsUrl.toString()
  }, [url, sessionId])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setStatus('connecting')
    isManualCloseRef.current = false

    try {
      const ws = new WebSocket(buildUrl())
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('connected')
        reconnectAttemptsRef.current = 0
        onOpen?.()
      }

      ws.onclose = () => {
        if (!isManualCloseRef.current) {
          setStatus('disconnected')
          onClose?.()

          // Attempt to reconnect if enabled and not manually closed
          if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
            setStatus('reconnecting')
            reconnectAttemptsRef.current++
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, reconnectInterval)
          }
        }
      }

      ws.onerror = (error) => {
        setStatus('error')
        onError?.(error)
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          // Handle built-in message types
          switch (message.type) {
            case 'connection':
              if (message.data?.connection_id) {
                setConnectionId(message.data.connection_id)
              }
              break
              
            case 'progress_update':
              onProgressUpdate?.(message.data)
              break
              
            case 'questions_generated':
              onQuestionsGenerated?.(message.data?.questions || [])
              break
              
            case 'answer_saved':
              onAnswerSaved?.(message.data)
              break
              
            case 'answer_generated':
              onAnswerGenerated?.(message.data)
              break
              
            case 'error':
              console.error('WebSocket error:', message.data?.message)
              break
              
            case 'pong':
              // Handle ping/pong for connection health
              break
              
            default:
              // Pass through to custom handler
              onMessage?.(message)
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
    } catch (error) {
      setStatus('error')
      console.error('Failed to create WebSocket connection:', error)
    }
  }, [buildUrl, reconnect, maxReconnectAttempts, reconnectInterval, onOpen, onClose, onError, onMessage, onProgressUpdate, onQuestionsGenerated, onAnswerSaved, onAnswerGenerated])

  const disconnect = useCallback(() => {
    isManualCloseRef.current = true
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setStatus('disconnected')
    setConnectionId(null)
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error('Failed to send WebSocket message:', error)
        return false
      }
    }
    return false
  }, [])

  const ping = useCallback(() => {
    return sendMessage({ type: 'ping' })
  }, [sendMessage])

  const generateQuestions = useCallback((data: {
    resume_text: string
    job_description: string
    options: any
  }) => {
    return sendMessage({
      type: 'generate_questions',
      data
    })
  }, [sendMessage])

  const saveAnswer = useCallback((questionId: string, answer: string) => {
    return sendMessage({
      type: 'save_answer',
      data: {
        question_id: questionId,
        answer
      }
    })
  }, [sendMessage])

  const generateAnswer = useCallback((question: string, resumeText: string) => {
    return sendMessage({
      type: 'generate_answer',
      data: {
        question,
        resume_text: resumeText
      }
    })
  }, [sendMessage])

  // Auto-connect on mount and cleanup on unmount
  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      setStatus('disconnected')
    }

    return () => {
      disconnect()
    }
  }, [enabled]) // Connect when enabled changes

  // Ping periodically to keep connection alive
  useEffect(() => {
    if (status === 'connected') {
      const pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000) // Ping every 30 seconds

      return () => clearInterval(pingInterval)
    }
  }, [status])

  return {
    status,
    connectionId,
    connect,
    disconnect,
    sendMessage,
    ping,
    generateQuestions,
    saveAnswer,
    generateAnswer,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting' || status === 'reconnecting',
    isDisconnected: status === 'disconnected',
    isError: status === 'error',
  }
}