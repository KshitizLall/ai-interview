"use client"

import { GenerationControls } from "@/components/generation-controls"
import { useWebSocketContext } from "@/components/websocket-provider"

interface EnhancedGenerationControlsProps {
  resumeText: string
  jobDescription: string
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  setQuestions: (questions: any[]) => void
  setAnswers?: (answers: Record<string, string>) => void
}

export function EnhancedGenerationControls({
  resumeText,
  jobDescription,
  isGenerating,
  setIsGenerating,
  setQuestions,
  setAnswers,
}: EnhancedGenerationControlsProps) {
  const { generateQuestions, isConnected, progressUpdate } = useWebSocketContext()

  return (
    <GenerationControls
      resumeText={resumeText}
      jobDescription={jobDescription}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
      setQuestions={setQuestions}
      setAnswers={setAnswers}
      isConnected={isConnected}
      progressUpdate={progressUpdate}
      generateQuestions={generateQuestions}
      startExpanded={true}
    />
  )
}