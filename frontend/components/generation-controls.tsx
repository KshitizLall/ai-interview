"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OptimizedButton } from "@/components/ui/optimized-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { AuthModal } from "@/components/auth-modal"
import { QuestionGenerationAnimation } from "@/components/animations"
import { apiService, Question } from "@/lib/api-service"
import {
  AlertCircle,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Settings,
  Sparkles,
  WifiOff,
  Lock,
  Zap
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface GenerationControlsProps {
  resumeText: string
  jobDescription: string
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  setQuestions: (questions: Question[]) => void
  setAnswers?: (answers: Record<string, string>) => void
  isConnected?: boolean
  progressUpdate?: any
  generateQuestions?: (params: any) => boolean
  startExpanded?: boolean
}

const QUESTION_TYPES = [
  { value: "technical", label: "Technical", icon: "⚙️" },
  { value: "behavioral", label: "Behavioral", icon: "🧠" },
  { value: "experience", label: "Experience", icon: "📊" },
  { value: "problem-solving", label: "Problem Solving", icon: "🔍" },
  { value: "general", label: "General", icon: "💬" }
]

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Advanced", color: "bg-orange-100 text-orange-800" },
  { value: "expert", label: "Expert", color: "bg-red-100 text-red-800" }
]



export function GenerationControls({
  resumeText,
  jobDescription,
  isGenerating,
  setIsGenerating,
  setQuestions,
  setAnswers,
  isConnected = false,
  progressUpdate,
  generateQuestions,
  startExpanded = false
}: GenerationControlsProps) {
  const { isAuthenticated, canGenerateQuestions, updateAnonymousUsage, deductCredits } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(startExpanded)

  // Basic generation options
  const [questionCount, setQuestionCount] = useState(10)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [includeAnswers, setIncludeAnswers] = useState(false)
  const [showQuestionAnimation, setShowQuestionAnimation] = useState(false)
  const [currentGenerationMode, setCurrentGenerationMode] = useState<'resume' | 'jd' | 'combined'>('combined')

  // Advanced options
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])

  const handleTypeToggle = (type: string) => {
    setSelectedQuestionTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    )
  }

  const handleGeneration = async (mode: 'resume' | 'jd' | 'combined') => {
    if (isGenerating) return

    // Check if user can generate questions (credit/usage limits)
    if (!canGenerateQuestions(questionCount)) {
      if (isAuthenticated) {
        setError("Insufficient credits to generate questions")
        toast.error(`Need ${questionCount} credits to generate questions`)
      } else {
        setError("Free limit reached. Please sign up to continue.")
        setShowAuthModal(true)
      }
      return
    }

    // Immediately update UI state to provide feedback
    setError(null)
    setIsGenerating(true)
    setCurrentGenerationMode(mode)
    setShowQuestionAnimation(true)

    // Use setTimeout to allow UI to update before heavy operations
    setTimeout(async () => {
      try {
        const request = {
          resume_text: mode === 'jd' ? undefined : resumeText,
          job_description: mode === 'resume' ? undefined : jobDescription,
          mode,
          question_count: questionCount,
          include_answers: includeAnswers,
          question_types: selectedQuestionTypes.length > 0 ? selectedQuestionTypes : undefined,
          difficulty_levels: selectedDifficulties.length > 0 ? selectedDifficulties : undefined
        }

        if (isConnected && generateQuestions) {
          // Use WebSocket for real-time generation
          const success = generateQuestions({
            resume_text: request.resume_text || '',
            job_description: request.job_description || '',
            options: {
              mode,
              count: questionCount,
              include_answers: includeAnswers,
              question_types: request.question_types,
              difficulty_levels: request.difficulty_levels
            }
          })

          if (!success) {
            throw new Error('Failed to send generation request via WebSocket')
          }
          
          // Deduct credits/update usage for successful generation
          if (isAuthenticated) {
            await deductCredits('generate_questions', questionCount)
          } else {
            updateAnonymousUsage({ questions_generated: questionCount })
          }
        } else {
          // Fallback to HTTP API with chunked processing
          const response = await apiService.generateQuestions(request)

          // Deduct credits/update usage for successful generation
          if (isAuthenticated) {
            await deductCredits('generate_questions', questionCount)
          } else {
            updateAnonymousUsage({ questions_generated: questionCount })
          }

          // Use requestAnimationFrame for smooth UI updates
          requestAnimationFrame(() => {
            setQuestions(response.questions)

            if (includeAnswers && setAnswers) {
              const answersMap: Record<string, string> = {}
              response.questions.forEach(q => {
                if (q.answer) {
                  answersMap[q.id] = q.answer
                }
              })
              setAnswers(answersMap)
            }
            setIsGenerating(false)
          })
        }
      } catch (err) {
        requestAnimationFrame(() => {
          setError(err instanceof Error ? err.message : "Failed to generate questions")
          setIsGenerating(false)
          setShowQuestionAnimation(false)
        })
      }
    }, 0)
  }

  return (
    <div className="w-full">
      {/* Main Card with Modern Design */}
      <Card className="relative overflow-hidden border border-border/50 bg-gradient-to-br from-background to-muted/20 shadow-lg">
        {/* Header Section */}
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">AI Question Generator</CardTitle>
                <p className="text-sm text-muted-foreground">Create personalized interview questions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected && (
                <Badge variant="default" className="text-xs font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {questionCount} questions
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Credit/Usage Status */}
          {!isAuthenticated && !canGenerateQuestions(questionCount) && (
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
                        <p className="text-sm">You've used all 10 free questions.</p>
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

          {isAuthenticated && !canGenerateQuestions(questionCount) && (
            <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <Lock className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <AlertDescription className="text-red-800">
                    <p className="font-medium">Insufficient credits!</p>
                    <p className="text-sm">You need {questionCount} credits to generate questions.</p>
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
          {progressUpdate && isGenerating && (
            <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-blue-900">{progressUpdate.message}</span>
                </div>
                <span className="text-sm text-blue-700 font-medium">{progressUpdate.progress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressUpdate.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Configuration Section */}
          <div className="grid gap-6">
            {/* Basic Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of Questions</Label>
                  <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="25">25 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">AI-Generated Answers</Label>
                  <div className="flex items-center space-x-2 h-10 px-3 border border-border rounded-lg bg-background/50">
                    <Checkbox
                      id="include-answers"
                      checked={includeAnswers}
                      onCheckedChange={(checked) => setIncludeAnswers(checked as boolean)}
                    />
                    <Label htmlFor="include-answers" className="text-sm">
                      Include sample answers
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Advanced Filters</span>
                    {(selectedQuestionTypes.length > 0 || selectedDifficulties.length > 0) && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedQuestionTypes.length + selectedDifficulties.length} active
                      </Badge>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 mt-4">
                {/* Question Types */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Question Types</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {QUESTION_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant={selectedQuestionTypes.includes(type.value) ? "default" : "outline"}
                        size="sm"
                        className="h-10 justify-start"
                        onClick={() => handleTypeToggle(type.value)}
                      >
                        <span className="mr-2 text-base">{type.icon}</span>
                        <span className="truncate">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Levels */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Difficulty Level</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <Button
                        key={level.value}
                        variant={selectedDifficulties.includes(level.value) ? "default" : "outline"}
                        size="sm"
                        className="h-10"
                        onClick={() => handleDifficultyToggle(level.value)}
                      >
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Generation Buttons */}
          <div className="space-y-4 pt-2 border-t border-border/50">
            <h3 className="text-sm font-semibold text-foreground">Generate Questions</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Primary Combined Button */}
              <OptimizedButton
                size="lg"
                onClick={() => handleGeneration('combined')}
                disabled={!resumeText?.trim() || !jobDescription?.trim() || isGenerating}
                loading={isGenerating && currentGenerationMode === 'combined'}
                preventBlocking={true}
                debounceMs={300}
                className="h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate from Resume + Job Description
                <span className="ml-auto text-xs opacity-80">Recommended</span>
              </OptimizedButton>

              {/* Secondary Options */}
              <div className="grid grid-cols-2 gap-3">
                <OptimizedButton
                  variant="outline"
                  onClick={() => handleGeneration('resume')}
                  disabled={!resumeText?.trim() || isGenerating}
                  loading={isGenerating && currentGenerationMode === 'resume'}
                  preventBlocking={true}
                  debounceMs={300}
                  className="h-10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  From Resume Only
                </OptimizedButton>

                <OptimizedButton
                  variant="outline"
                  onClick={() => handleGeneration('jd')}
                  disabled={!jobDescription?.trim() || isGenerating}
                  loading={isGenerating && currentGenerationMode === 'jd'}
                  preventBlocking={true}
                  debounceMs={300}
                  className="h-10"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  From Job Description
                </OptimizedButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab="signup"
      />
      
      <QuestionGenerationAnimation
        show={showQuestionAnimation}
        mode={currentGenerationMode}
        questionCount={questionCount}
        onComplete={() => {
          setShowQuestionAnimation(false)
          setIsGenerating(false)
        }}
      />
    </div>
  )
}
