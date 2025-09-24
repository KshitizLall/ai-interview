"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  FileText,
  Briefcase,
  Sparkles,
  Clock,
  WifiOff,
  ChevronDown,
  ChevronRight,
  Settings,
  Target,
  Users,
  Building
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService, Question } from "@/lib/api-service"

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
}

const QUESTION_TYPES = [
  { value: "technical", label: "Technical", icon: "⚙️" },
  { value: "behavioral", label: "Behavioral", icon: "🧠" },
  { value: "experience", label: "Experience", icon: "📊" },
  { value: "problem-solving", label: "Problem Solving", icon: "🔍" },
  { value: "leadership", label: "Leadership", icon: "👥" },
  { value: "situational", label: "Situational", icon: "🎯" },
  { value: "company-culture", label: "Company Culture", icon: "🏢" },
  { value: "general", label: "General", icon: "💬" }
]

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Advanced", color: "bg-orange-100 text-orange-800" },
  { value: "expert", label: "Expert", color: "bg-red-100 text-red-800" }
]

const POSITION_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "executive", label: "Executive" }
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
  generateQuestions
}: GenerationControlsProps) {
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  // Basic generation options
  const [questionCount, setQuestionCount] = useState(10)
  const [includeAnswers, setIncludeAnswers] = useState(false)

  // Advanced options
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [focusAreas, setFocusAreas] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [positionLevel, setPositionLevel] = useState("")

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

    setError(null)
    setIsGenerating(true)

    try {
      const request = {
        resume_text: mode === 'jd' ? undefined : resumeText,
        job_description: mode === 'resume' ? undefined : jobDescription,
        mode,
        question_count: questionCount,
        include_answers: includeAnswers,
        question_types: selectedQuestionTypes.length > 0 ? selectedQuestionTypes : undefined,
        difficulty_levels: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
        focus_areas: focusAreas.trim() ? focusAreas.split(',').map(s => s.trim()) : undefined,
        company_name: companyName.trim() || undefined,
        position_level: positionLevel || undefined
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
            difficulty_levels: request.difficulty_levels,
            focus_areas: request.focus_areas,
            company_name: request.company_name,
            position_level: request.position_level
          }
        })

        if (!success) {
          throw new Error('Failed to send generation request via WebSocket')
        }
      } else {
        // Fallback to HTTP API
        const response = await apiService.generateQuestions(request)

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions")
      setIsGenerating(false)
    }
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="w-full">
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
                {!isConnected && (
                  <Badge variant="outline" className="text-xs">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                )}
                {/* Quick generation buttons when collapsed */}
                {!isExpanded && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGeneration('resume')
                      }}
                      disabled={!resumeText?.trim() || isGenerating}
                      className="h-7 px-2 text-xs"
                    >
                      {isGenerating ? (
                        <Clock className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <FileText className="w-3 h-3 mr-1" />
                          Resume
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGeneration('jd')
                      }}
                      disabled={!jobDescription?.trim() || isGenerating}
                      className="h-7 px-2 text-xs"
                    >
                      {isGenerating ? (
                        <Clock className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Briefcase className="w-3 h-3 mr-1" />
                          JD
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGeneration('combined')
                      }}
                      disabled={!resumeText?.trim() || !jobDescription?.trim() || isGenerating}
                      className="h-7 px-2 text-xs"
                    >
                      {isGenerating ? (
                        <Clock className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Both
                        </>
                      )}
                    </Button>
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
            <div className="grid grid-cols-2 gap-3">
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

            {/* Advanced Options - More Compact */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start p-2 h-8">
                  <div className="flex items-center gap-2">
                    {advancedOpen ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <Settings className="w-3 h-3" />
                    <span className="text-sm">Advanced Options</span>
                    {(selectedQuestionTypes.length > 0 || selectedDifficulties.length > 0 || companyName || positionLevel) && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        {selectedQuestionTypes.length + selectedDifficulties.length + (companyName ? 1 : 0) + (positionLevel ? 1 : 0)} filters
                      </Badge>
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-3 mt-2">
                {/* Compact Question Types */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Types</Label>
                  <div className="flex flex-wrap gap-1">
                    {QUESTION_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant={selectedQuestionTypes.includes(type.value) ? "default" : "outline"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleTypeToggle(type.value)}
                      >
                        <span className="mr-1">{type.icon}</span>
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Compact Difficulty Levels */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <div className="flex flex-wrap gap-1">
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

                {/* Compact Context Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Company</Label>
                    <Input
                      placeholder="Company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-7 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Level</Label>
                    <Select value={positionLevel} onValueChange={setPositionLevel}>
                      <SelectTrigger className="h-7">
                        <SelectValue placeholder="Position level" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITION_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Focus Areas</Label>
                  <Textarea
                    placeholder="React, Node.js, System Design..."
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                    className="min-h-[50px] resize-none text-sm"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Full Generation Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                onClick={() => handleGeneration('resume')}
                disabled={!resumeText?.trim() || isGenerating}
                className="text-xs"
              >
                {isGenerating ? (
                  <Clock className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <FileText className="w-3 h-3 mr-1" />
                    Resume
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGeneration('jd')}
                disabled={!jobDescription?.trim() || isGenerating}
                className="text-xs"
              >
                {isGenerating ? (
                  <Clock className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Briefcase className="w-3 h-3 mr-1" />
                    Job Desc
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={() => handleGeneration('combined')}
                disabled={!resumeText?.trim() || !jobDescription?.trim() || isGenerating}
                className="text-xs"
              >
                {isGenerating ? (
                  <Clock className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Both
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
