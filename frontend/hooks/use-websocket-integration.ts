import { useEffect, useRef } from 'react'
import { useWebSocketContext } from '@/components/websocket-provider'

interface UseWebSocketIntegrationProps {
  onQuestionsGenerated?: (questions: any[]) => void
  onAnswerSaved?: (data: { question_id: string; answer: string; saved_at: number }) => void
  onAnswerGenerated?: (data: { question: string; answer: string; generated_at: number }) => void
  onProgressComplete?: () => void
}

export function useWebSocketIntegration({
  onQuestionsGenerated,
  onAnswerSaved,
  onAnswerGenerated,
  onProgressComplete
}: UseWebSocketIntegrationProps) {
  const { progressUpdate } = useWebSocketContext()
  
  // Use refs to store the latest callback functions without causing re-renders
  const onQuestionsGeneratedRef = useRef(onQuestionsGenerated)
  const onAnswerSavedRef = useRef(onAnswerSaved)
  const onProgressCompleteRef = useRef(onProgressComplete)

  // Update refs when callbacks change
  onQuestionsGeneratedRef.current = onQuestionsGenerated
  onAnswerSavedRef.current = onAnswerSaved
  onProgressCompleteRef.current = onProgressComplete

  // Handle progress completion
  useEffect(() => {
    if (progressUpdate?.stage === 'completed') {
      onProgressCompleteRef.current?.()
    }
  }, [progressUpdate])

  return {
    progressUpdate
  }
}