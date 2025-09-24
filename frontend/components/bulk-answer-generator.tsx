"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from "lucide-react"
import { apiService, Question } from "@/lib/api-service"

interface BulkAnswerGeneratorProps {
  questions: Question[]
  resumeText?: string
  jobDescription?: string
  answers: Record<string, string>
  setAnswers: (answers: Record<string, string>) => void
  className?: string
}

const ANSWER_STYLES = [
  {
    value: "professional",
    label: "Professional",
    description: "Formal, corporate-appropriate tone"
  },
  {
    value: "conversational",
    label: "Conversational",
    description: "Friendly but professional approach"
  },
  {
    value: "detailed",
    label: "Detailed",
    description: "Comprehensive answers with examples"
  },
  {
    value: "concise",
    label: "Concise",
    description: "Brief, to-the-point responses"
  }
]

export function BulkAnswerGenerator({
  questions,
  resumeText,
  jobDescription,
  answers,
  setAnswers,
  className
}: BulkAnswerGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [answerStyle, setAnswerStyle] = useState<string>("professional")
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [generatedCount, setGeneratedCount] = useState(0)

  const unansweredQuestions = questions.filter(q => !answers[q.id]?.trim())
  const answeredCount = questions.length - unansweredQuestions.length

  const handleBulkGeneration = async (mode: 'all' | 'unanswered') => {
    if (isGenerating) return

    const targetQuestions = mode === 'all' ? questions : unansweredQuestions

    if (targetQuestions.length === 0) {
      setError("No questions to generate answers for")
      return
    }

    setError(null)
    setIsGenerating(true)
    setProgress(0)
    setGeneratedCount(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 20, 85))
      }, 500)

      const response = await apiService.generateBulkAnswers({
        questions: targetQuestions,
        resume_text: resumeText,
        job_description: jobDescription,
        answer_style: answerStyle as any
      })

      clearInterval(progressInterval)
      setProgress(100)

      // Update answers
      const newAnswers = { ...answers, ...response.answers }
      setAnswers(newAnswers)
      setGeneratedCount(Object.keys(response.answers).length)

      setTimeout(() => {
        setProgress(0)
        setIsGenerating(false)
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate bulk answers")
      setProgress(0)
      setIsGenerating(false)
    }
  }

  if (questions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Generate questions first to use bulk answer generation</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Bulk Answer Generation
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {answeredCount} answered
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            {unansweredQuestions.length} remaining
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isGenerating && (
          <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Generating AI answers...</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {generatedCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Generated {generatedCount} answers so far
              </p>
            )}
          </div>
        )}

        {!resumeText && !jobDescription && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              Add your resume or job description for more personalized AI answers.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Answer Style</Label>
            <Select value={answerStyle} onValueChange={setAnswerStyle} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANSWER_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{style.label}</span>
                      <span className="text-xs text-muted-foreground">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleBulkGeneration('unanswered')}
              disabled={isGenerating || unansweredQuestions.length === 0}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Fill Missing Answers ({unansweredQuestions.length})
                </>
              )}
            </Button>

            <Button
              onClick={() => handleBulkGeneration('all')}
              disabled={isGenerating || questions.length === 0}
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate All ({questions.length})
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>Fill Missing:</strong> Generate answers only for unanswered questions</p>
            <p>• <strong>Regenerate All:</strong> Replace all existing answers with new ones</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
