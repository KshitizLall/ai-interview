"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth-provider"
import { AuthModal } from "@/components/auth-modal"
import { AnswerGenerationAnimation } from "@/components/animations"
import {
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Lock,
  Zap,
  Settings
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
  const [showAnimation, setShowAnimation] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'thinking' | 'generating' | 'complete'>('thinking')

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
    setShowAnimation(true)
    setCurrentPhase('thinking')

    try {
      // Simulate progress updates with phases
      setTimeout(() => setCurrentPhase('generating'), 1500)
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 15, 85)
          if (newProgress > 75) setCurrentPhase('complete')
          return newProgress
        })
      }, 800)

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
        setShowAnimation(false)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate bulk answers")
      setProgress(0)
      setIsGenerating(false)
      setShowAnimation(false)
    }
  }

  if (questions.length === 0) {
    return (
      <Card className={`${className} border border-dashed border-border/50`}>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="p-4 rounded-full bg-muted/30 w-fit mx-auto">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">No Questions Available</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Generate interview questions first to use the bulk answer generator
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} relative overflow-hidden border border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-lg`}>
      {/* Header Section */}
      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-200/20">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Bulk Answer Generator</CardTitle>
              <p className="text-sm text-muted-foreground">Generate AI answers for multiple questions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-medium border-green-200 text-green-700 bg-green-50">
              <CheckCircle className="w-3 h-3 mr-1" />
              {answeredCount} done
            </Badge>
            {unansweredQuestions.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unansweredQuestions.length} remaining
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Credit/Usage Status */}
        {!isAuthenticated && !canGenerateAnswers(unansweredQuestions.length) && unansweredQuestions.length > 0 && (
          <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Lock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-amber-800">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Free limit reached!</p>
                      <p className="text-sm">Cannot generate {unansweredQuestions.length} answers.</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setShowAuthModal(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Sign up for 50 free credits
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {isAuthenticated && !canGenerateAnswers(unansweredQuestions.length) && unansweredQuestions.length > 0 && (
          <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <Lock className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-red-800">
                  <p className="font-medium">Insufficient credits!</p>
                  <p className="text-sm">You need {unansweredQuestions.length} credits to generate answers.</p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Progress indicator */}
        {isGenerating && (
          <div className="space-y-3 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-violet-900">
                  {currentPhase === 'thinking' && 'Analyzing questions...'}
                  {currentPhase === 'generating' && 'Generating AI answers...'}
                  {currentPhase === 'complete' && 'Finalizing answers...'}
                </span>
              </div>
              <span className="text-sm text-violet-700 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {generatedCount > 0 && (
              <p className="text-xs text-violet-700">
                ✨ Generated {generatedCount} answers so far
              </p>
            )}
          </div>
        )}

        {/* Context Alert */}
        {!resumeText && !jobDescription && (
          <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <AlertDescription className="text-blue-800">
                  <p className="text-sm">Add your resume or job description for more personalized AI answers.</p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Configuration Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </h3>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Answer Style</Label>
            <Select value={answerStyle} onValueChange={setAnswerStyle} disabled={isGenerating}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANSWER_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium">{style.label}</span>
                      <span className="text-xs text-muted-foreground">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-2 border-t border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Generate Answers</h3>
          
          <div className="space-y-3">
            {/* Primary Button - Fill Missing */}
            <Button
              onClick={() => handleBulkGeneration('unanswered')}
              disabled={isGenerating || unansweredQuestions.length === 0}
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Generating {unansweredQuestions.length} answers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  <span>Fill Missing Answers ({unansweredQuestions.length})</span>
                  {unansweredQuestions.length > 0 && (
                    <span className="ml-auto text-xs opacity-80">Recommended</span>
                  )}
                </>
              )}
            </Button>

            {/* Secondary Button - Regenerate All */}
            <Button
              onClick={() => handleBulkGeneration('all')}
              disabled={isGenerating || questions.length === 0}
              variant="outline"
              size="lg"
              className="w-full h-10 border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Regenerating all...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Regenerate All Answers ({questions.length})</span>
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
            <p className="font-medium text-foreground mb-2">Options explained:</p>
            <p>• <strong>Fill Missing:</strong> Generate answers only for questions without responses</p>
            <p>• <strong>Regenerate All:</strong> Replace all existing answers with fresh AI-generated ones</p>
          </div>
        </div>
      </CardContent>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab="signup"
      />
      
      <AnswerGenerationAnimation
        show={showAnimation}
        question={`Bulk generating ${isGenerating ? 'answers for multiple questions' : 'answers'}`}
        stage={currentPhase}
        onComplete={() => setShowAnimation(false)}
      />
    </Card>
  )
}
