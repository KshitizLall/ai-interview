"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
// Card components removed - using div for full width layout
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth-provider"
import { AuthModal } from "@/components/auth-modal"
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Lock,
  Zap
} from "lucide-react"
import { apiService, Question } from "@/lib/api-service"
import { toast } from "sonner"

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
  const { isAuthenticated, canGenerateAnswers, updateAnonymousUsage, deductCredits } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
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

    // Check if user can generate answers (credit/usage limits)
    if (!canGenerateAnswers(targetQuestions.length)) {
      if (isAuthenticated) {
        setError(`Insufficient credits to generate ${targetQuestions.length} answers`)
        toast.error(`Need ${targetQuestions.length} credits to generate answers`)
      } else {
        setError("Free limit reached. Please sign up to continue.")
        setShowAuthModal(true)
      }
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

      // Deduct credits/update usage for successful generation
      const answersGenerated = Object.keys(response.answers).length
      if (isAuthenticated) {
        await deductCredits('generate_answers', answersGenerated)
      } else {
        updateAnonymousUsage({ answers_generated: answersGenerated })
      }

      // Update answers
      const newAnswers = { ...answers, ...response.answers }
      setAnswers(newAnswers)
      setGeneratedCount(answersGenerated)

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
      <div className={`${className} text-center text-muted-foreground py-8`}>
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Generate questions first to use bulk answer generation</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="pb-3">
        <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          Bulk Answer Generation
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {answeredCount} answered
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            {unansweredQuestions.length} remaining
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Credit/Usage Status */}
        {!isAuthenticated && !canGenerateAnswers(unansweredQuestions.length) && unansweredQuestions.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <Lock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p><strong>Free limit reached!</strong> Cannot generate {unansweredQuestions.length} answers.</p>
                <Button 
                  size="sm" 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Sign up for 50 free credits
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isAuthenticated && !canGenerateAnswers(unansweredQuestions.length) && unansweredQuestions.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <Lock className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <p><strong>Insufficient credits!</strong> You need {unansweredQuestions.length} credits to generate answers.</p>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isGenerating && (
          <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
            <Button
              onClick={() => handleBulkGeneration('unanswered')}
              disabled={isGenerating || unansweredQuestions.length === 0}
              size="lg"
              className="w-full text-sm bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Fill Missing Answers</span>
                  <span className="sm:hidden">Fill Missing</span>
                  <span className="ml-1">({unansweredQuestions.length})</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => handleBulkGeneration('all')}
              disabled={isGenerating || questions.length === 0}
              variant="outline"
              size="lg"
              className="w-full text-sm border-primary/20 text-primary hover:bg-primary/5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Regenerate All</span>
                  <span className="sm:hidden">Regenerate</span>
                  <span className="ml-1">({questions.length})</span>
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>Fill Missing:</strong> Generate answers only for unanswered questions</p>
            <p>• <strong>Regenerate All:</strong> Replace all existing answers with new ones</p>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab="signup"
      />
    </div>
  )
}
