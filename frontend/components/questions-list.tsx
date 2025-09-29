"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bookmark, BookmarkCheck, Edit, Copy, Trash2, ChevronDown, ChevronRight, MessageSquare, Save, Clock, Sparkles, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api-service"

interface Question {
  id: string
  question: string
  type: string
  relevance_score: number
  difficulty?: string
  answer?: string
  created_at: string
}

interface QuestionsListProps {
  questions: Question[]
  savedQuestions: Question[]
  setSavedQuestions: (questions: Question[]) => void
  answers: Record<string, string>
  setAnswers: (answers: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void
  resumeText?: string
  jobDescription?: string
  setActiveTab?: (tab: string) => void
}

export function QuestionsList({ questions, savedQuestions, setSavedQuestions, answers, setAnswers, resumeText, jobDescription, setActiveTab }: QuestionsListProps) {
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({})
  const [autoSaveStatus, setAutoSaveStatus] = useState<Record<string, "saved" | "saving" | "idle">>({})
  const [savingTimeouts, setSavingTimeouts] = useState<Record<string, NodeJS.Timeout>>({})
  const [aiGeneratingStatus, setAiGeneratingStatus] = useState<Record<string, boolean>>({})
  const [aiAnswerStyle, setAiAnswerStyle] = useState<"professional" | "conversational" | "detailed" | "concise">("professional")
  const [showAiOptions, setShowAiOptions] = useState<Record<string, boolean>>({})

  const toggleSave = (question: Question) => {
    const isCurrentlySaved = savedQuestions.some((q) => q.id === question.id)

    if (isCurrentlySaved) {
      setSavedQuestions(savedQuestions.filter((q) => q.id !== question.id))
    } else {
      setSavedQuestions([...savedQuestions, question])
    }
  }

  const copyQuestion = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const deleteQuestion = (questionId: string) => {
    // In a real app, you'd update the questions list
    console.log("Delete question:", questionId)
  }

  const toggleExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
      // Initialize answer input with existing answer
      setAnswerInputs(prev => ({
        ...prev,
        [questionId]: answers[questionId] || ""
      }))
    }
    setExpandedQuestions(newExpanded)
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswerInputs(prev => ({ ...prev, [questionId]: value }))

    // Clear existing timeout
    if (savingTimeouts[questionId]) {
      clearTimeout(savingTimeouts[questionId])
    }

    // Set saving status
    setAutoSaveStatus(prev => ({ ...prev, [questionId]: "saving" }))

    // Auto-save after 800ms of no typing
    const timeout = setTimeout(() => {
      setAnswers(prev => ({ ...prev, [questionId]: value }))
      setAutoSaveStatus(prev => ({ ...prev, [questionId]: "saved" }))
      const statusTimeout = setTimeout(() => {
        setAutoSaveStatus(prev => ({ ...prev, [questionId]: "idle" }))
      }, 2000)
      
      // Store status timeout for cleanup
      setSavingTimeouts(prev => ({ ...prev, [`${questionId}_status`]: statusTimeout }))
    }, 800)

    setSavingTimeouts(prev => ({ ...prev, [questionId]: timeout }))
  }

  const copyAnswer = (answer: string) => {
    navigator.clipboard.writeText(answer)
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getEstimatedTime = (wordCount: number) => {
    return Math.ceil(wordCount / 150) // 150 words per minute speaking rate
  }

  const handleGenerateAIAnswer = async (question: Question, style?: typeof aiAnswerStyle) => {
    const questionId = question.id
    setAiGeneratingStatus(prev => ({ ...prev, [questionId]: true }))

    try {
      const response = await apiService.generateAnswer({
        question: question.question,
        resume_text: resumeText,
        job_description: jobDescription,
      })

      // Set the generated answer
      setAnswerInputs(prev => ({ ...prev, [questionId]: response.answer }))

      // Auto-save the generated answer
      setAnswers(prev => ({ ...prev, [questionId]: response.answer }))
      setAutoSaveStatus(prev => ({ ...prev, [questionId]: "saved" }))

      // Hide AI options after generation
      setShowAiOptions(prev => ({ ...prev, [questionId]: false }))

      setTimeout(() => {
        setAutoSaveStatus(prev => ({ ...prev, [questionId]: "idle" }))
      }, 2000)

    } catch (error) {
      console.error("AI generation error:", error)
      // You could show a toast notification here
    } finally {
      setAiGeneratingStatus(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const toggleAiOptions = (questionId: string) => {
    setShowAiOptions(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(savingTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [savingTimeouts])

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">No questions generated yet</h3>
            <p className="text-sm text-muted-foreground">Upload your résumé or job description to get started</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {questions.map((question, index) => {
        const isSaved = savedQuestions.some((q) => q.id === question.id)
        const isExpanded = expandedQuestions.has(question.id)
        const currentAnswer = answerInputs[question.id] || answers[question.id] || ""
        const hasAnswer = answers[question.id]?.trim().length > 0
        const wordCount = getWordCount(currentAnswer)
        const estimatedTime = getEstimatedTime(wordCount)
        const saveStatus = autoSaveStatus[question.id] || "idle"

        return (
          <Collapsible
            key={question.id}
            open={isExpanded}
            onOpenChange={() => toggleExpanded(question.id)}
          >
            <Card
              className={cn(
                "transition-all duration-300 animate-fade-in-up",
                hoveredQuestion === question.id && "shadow-md",
                isExpanded && "ring-1 ring-primary/20"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onMouseEnter={() => setHoveredQuestion(question.id)}
              onMouseLeave={() => setHoveredQuestion(null)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm leading-relaxed text-left pr-2">{question.question}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1 md:gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {question.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(question.relevance_score * 100)}% match
                          </Badge>
                          {question.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              {question.difficulty}
                            </Badge>
                          )}
                          {hasAnswer && (
                            <Badge variant="default" className="text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">{getWordCount(answers[question.id])} words</span>
                              <span className="sm:hidden">{getWordCount(answers[question.id])}</span>
                            </Badge>
                          )}
                        </div>

                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", hasAnswer ? "bg-green-500" : "bg-muted")} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {/* Answer Editor */}
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">Your Answer</h4>
                        {saveStatus === "saving" && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-spin" />
                            Saving...
                          </span>
                        )}
                        {saveStatus === "saved" && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Save className="w-3 h-3" />
                            Saved
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="text-xs text-muted-foreground">
                          {wordCount} words • ~{estimatedTime} min to speak
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAiOptions(question.id)
                            }}
                            disabled={aiGeneratingStatus[question.id]}
                            className="h-7 px-2 text-xs"
                          >
                            {aiGeneratingStatus[question.id] ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                <span className="hidden sm:inline">Generating...</span>
                                <span className="sm:hidden">Gen...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Use AI</span>
                                <span className="sm:hidden">AI</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* AI Options */}
                    {showAiOptions[question.id] && (
                      <Card className="border-primary/20 bg-primary/5 glass-card-subtle">
                        <CardContent className="p-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">AI Answer Generator</span>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Answer Style</Label>
                            <Select
                              value={aiAnswerStyle}
                              onValueChange={(value) => setAiAnswerStyle(value as typeof aiAnswerStyle)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="conversational">Conversational</SelectItem>
                                <SelectItem value="detailed">Detailed</SelectItem>
                                <SelectItem value="concise">Concise</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleGenerateAIAnswer(question, aiAnswerStyle)
                              }}
                              disabled={aiGeneratingStatus[question.id]}
                              className="h-7 text-xs flex-1"
                            >
                              {aiGeneratingStatus[question.id] ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  <span className="hidden sm:inline">Generating...</span>
                                  <span className="sm:hidden">Gen...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  <span className="hidden sm:inline">Generate Answer</span>
                                  <span className="sm:hidden">Generate</span>
                                </>
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowAiOptions(prev => ({ ...prev, [question.id]: false }))
                              }}
                              className="h-7 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>

                          {(!resumeText && !jobDescription) && (
                            <Alert>
                              <AlertCircle className="w-4 h-4" />
                              <AlertDescription className="text-xs">
                                Add your resume or job description for more personalized AI answers.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Write your answer here...

Tips:
• Use the STAR method (Situation, Task, Action, Result) for behavioral questions
• Be specific with examples and metrics
• Keep it concise but comprehensive"
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t gap-3 sm:gap-0">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSave(question)
                        }}
                        className={cn("transition-all duration-200", isSaved && "text-primary")}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        <span className="ml-1 hidden sm:inline">
                          {isSaved ? "Saved" : "Save"}
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyQuestion(question.question)
                        }}
                        className="hidden sm:inline-flex"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="ml-1">Copy</span>
                      </Button>

                      {currentAnswer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyAnswer(currentAnswer)
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Answer</span>
                          <span className="sm:hidden">Copy</span>
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteQuestion(question.id)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="ml-1 hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )
      })}
    </div>
  )
}
