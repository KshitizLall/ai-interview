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
import { apiService, Question } from "@/lib/api-service"
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Settings,
  Sparkles,
  WifiOff
} from "lucide-react"
import { useState } from "react"

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
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(startExpanded)

  // Basic generation options
  const [questionCount, setQuestionCount] = useState(10)
  const [includeAnswers, setIncludeAnswers] = useState(false)

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

    // Immediately update UI state to provide feedback
    setError(null)
    setIsGenerating(true)

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
        } else {
          // Fallback to HTTP API with chunked processing
          const response = await apiService.generateQuestions(request)

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
        })
      }
    }, 0)
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="w-full glass-card-subtle border-border/30">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Sparkles className="w-4 h-4" />
                <CardTitle className="text-base">Generate Questions</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {questionCount} questions
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <Badge variant="default" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Real-time
                  </Badge>
                )}
                {/* Quick generation buttons when collapsed */}
                {!isExpanded && (
                  <div className="flex flex-wrap gap-1">
                    <OptimizedButton
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGeneration('resume')
                      }}
                      disabled={!resumeText?.trim()}
                      loading={isGenerating}
                      preventBlocking={true}
                      debounceMs={300}
                      className="h-7 px-2 text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Resume</span>
                      <span className="sm:hidden">R</span>
                    </OptimizedButton>

                    <OptimizedButton
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGeneration('jd')
                      }}
                      disabled={!jobDescription?.trim()}
                      loading={isGenerating}
                      preventBlocking={true}
                      debounceMs={300}
                      className="h-7 px-2 text-xs"
                    >
                      <Briefcase className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">JD</span>
                      <span className="sm:hidden">J</span>
                    </OptimizedButton>

                    <OptimizedButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGeneration('combined')
                      }}
                      disabled={!resumeText?.trim() || !jobDescription?.trim()}
                      loading={isGenerating}
                      preventBlocking={true}
                      debounceMs={300}
                      className="h-7 px-2 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Both</span>
                      <span className="sm:hidden">B</span>
                    </OptimizedButton>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {/* Progress indicator */}
            {progressUpdate && isGenerating && (
              <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{progressUpdate.message}</span>
                  <span className="text-sm text-muted-foreground">{progressUpdate.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressUpdate.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Compact Basic Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Questions</Label>
                <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Include Answers</Label>
                <div className="flex items-center h-8">
                  <Checkbox
                    id="include-answers"
                    checked={includeAnswers}
                    onCheckedChange={(checked) => setIncludeAnswers(checked as boolean)}
                  />
                  <Label htmlFor="include-answers" className="text-sm ml-2">
                    Auto-generate
                  </Label>
                </div>
              </div>
            </div>

            {/* Advanced Options - Always Visible */}
            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center gap-2">
                <Settings className="w-3 h-3" />
                <span className="text-sm font-medium">Advanced Options</span>
                {(selectedQuestionTypes.length > 0 || selectedDifficulties.length > 0) && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {selectedQuestionTypes.length + selectedDifficulties.length} filters
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                {/* Compact Question Types */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Types</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
                    {QUESTION_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant={selectedQuestionTypes.includes(type.value) ? "default" : "outline"}
                        size="sm"
                        className="h-6 px-2 text-xs justify-start"
                        onClick={() => handleTypeToggle(type.value)}
                      >
                        <span className="mr-1">{type.icon}</span>
                        <span className="truncate">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Compact Difficulty Levels */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <Button
                        key={level.value}
                        variant={selectedDifficulties.includes(level.value) ? "default" : "outline"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleDifficultyToggle(level.value)}
                      >
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </div>


              </div>
            </div>

            {/* Full Generation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <OptimizedButton
                size="sm"
                onClick={() => handleGeneration('resume')}
                disabled={!resumeText?.trim()}
                loading={isGenerating}
                preventBlocking={true}
                debounceMs={300}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Resume</span>
                <span className="sm:hidden">From Resume</span>
              </OptimizedButton>

              <OptimizedButton
                size="sm"
                variant="outline"
                onClick={() => handleGeneration('jd')}
                disabled={!jobDescription?.trim()}
                loading={isGenerating}
                preventBlocking={true}
                debounceMs={300}
                className="text-xs"
              >
                <Briefcase className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Job Desc</span>
                <span className="sm:hidden">From Job Description</span>
              </OptimizedButton>

              <OptimizedButton
                size="sm"
                onClick={() => handleGeneration('combined')}
                disabled={!resumeText?.trim() || !jobDescription?.trim()}
                loading={isGenerating}
                preventBlocking={true}
                debounceMs={300}
                className="text-xs sm:col-span-1 col-span-1"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Both</span>
                <span className="sm:hidden">From Both</span>
              </OptimizedButton>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
