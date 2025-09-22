"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Save, Clock, Lightbulb, FileText, Wand2, RotateCcw, Copy, Check, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateAnswerTemplate, type AnswerTemplate } from "@/lib/answer-templates"
import { useWebSocketContext } from "./websocket-provider"

interface AnswersEditorProps {
  questions: any[]
  answers: Record<string, string>
  setAnswers: (answers: Record<string, string>) => void
}

export function AnswersEditor({ questions, answers, setAnswers }: AnswersEditorProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "idle">("idle")
  const [answerTemplate, setAnswerTemplate] = useState<AnswerTemplate | null>(null)
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [copied, setCopied] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { saveAnswer, isConnected } = useWebSocketContext()

  // Auto-save functionality with WebSocket integration
  useEffect(() => {
    if (!selectedQuestion || currentAnswer === (answers[selectedQuestion] || "")) return

    setAutoSaveStatus("saving")
    const timeoutId = setTimeout(() => {
      // Update local state immediately
      setAnswers({
        ...answers,
        [selectedQuestion]: currentAnswer,
      })

      // Send via WebSocket if connected, otherwise just update local state
      if (isConnected) {
        const success = saveAnswer(selectedQuestion, currentAnswer)
        if (success) {
          setAutoSaveStatus("saved")
        } else {
          setAutoSaveStatus("idle")
        }
      } else {
        setAutoSaveStatus("saved")
      }
      
      setTimeout(() => setAutoSaveStatus("idle"), 2000)
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [currentAnswer, selectedQuestion, answers, setAnswers, saveAnswer, isConnected])

  // Load answer when question changes
  useEffect(() => {
    if (selectedQuestion) {
      setCurrentAnswer(answers[selectedQuestion] || "")
    }
  }, [selectedQuestion, answers])

  // Select first question by default
  useEffect(() => {
    if (questions.length > 0 && !selectedQuestion) {
      setSelectedQuestion(questions[0].id)
    }
  }, [questions, selectedQuestion])

  // Update word count and estimated time
  useEffect(() => {
    const words = currentAnswer
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    setWordCount(words)
    setEstimatedTime(Math.ceil(words / 150)) // Assuming 150 words per minute speaking rate
  }, [currentAnswer])

  const handleGenerateTemplate = async () => {
    if (!selectedQuestion) return

    setIsGeneratingTemplate(true)
    const questionData = questions.find((q) => q.id === selectedQuestion)

    try {
      const template = await generateAnswerTemplate(questionData)
      setAnswerTemplate(template)
    } catch (error) {
      console.error("Failed to generate template:", error)
    } finally {
      setIsGeneratingTemplate(false)
    }
  }

  const applyTemplate = (templateText: string) => {
    setCurrentAnswer(templateText)
    setAnswerTemplate(null)
  }

  const clearAnswer = () => {
    setCurrentAnswer("")
    setAnswerTemplate(null)
  }

  const copyAnswer = async () => {
    if (currentAnswer) {
      await navigator.clipboard.writeText(currentAnswer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">No questions to answer</h3>
            <p className="text-sm text-muted-foreground">Generate some questions first to start writing answers</p>
          </div>
        </div>
      </div>
    )
  }

  const selectedQuestionData = questions.find((q) => q.id === selectedQuestion)
  const answeredCount = Object.keys(answers).filter((key) => answers[key]?.trim().length > 0).length

  return (
    <div className="h-full flex flex-col">
      {/* Progress Header */}
      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Answer Progress</h3>
          <Badge variant="outline">
            {answeredCount} of {questions.length} answered
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        {/* Question Selector */}
        <div className="lg:w-1/3 space-y-2 max-h-60 lg:max-h-full overflow-y-auto">
          <h3 className="font-medium text-sm text-muted-foreground mb-3">Select Question</h3>
          {questions.map((question) => {
            const hasAnswer = answers[question.id]?.trim().length > 0
            const answerLength = answers[question.id]?.trim().split(/\s+/).length || 0

            return (
              <Card
                key={question.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-sm",
                  selectedQuestion === question.id && "ring-2 ring-primary bg-primary/5",
                )}
                onClick={() => setSelectedQuestion(question.id)}
              >
                <CardContent className="p-3">
                  <p className="text-sm line-clamp-2 mb-2">{question.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {question.type}
                      </Badge>
                      {hasAnswer && (
                        <Badge variant="default" className="text-xs">
                          {answerLength} words
                        </Badge>
                      )}
                    </div>
                    <div className={cn("w-2 h-2 rounded-full", hasAnswer ? "bg-green-500" : "bg-muted")} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Answer Editor */}
        <div className="lg:flex-1 flex flex-col">
          {selectedQuestionData && (
            <>
              {/* Question Header */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base leading-relaxed">{selectedQuestionData.text}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedQuestionData.type}</Badge>
                    <Badge variant="outline">{Math.round(selectedQuestionData.relevanceScore * 100)}% match</Badge>
                    {selectedQuestionData.difficulty && (
                      <Badge variant="outline">{selectedQuestionData.difficulty} level</Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Editor Controls */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Your Answer</h3>
                    {autoSaveStatus === "saving" && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        Saving...
                      </span>
                    )}
                    {autoSaveStatus === "saved" && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        {isConnected ? <Wifi className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                        {isConnected ? "Synced" : "Saved"}
                      </span>
                    )}
                    {!isConnected && autoSaveStatus === "idle" && (
                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                        <WifiOff className="w-3 h-3" />
                        Offline
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {wordCount} words • ~{estimatedTime} min to speak
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleGenerateTemplate} disabled={isGeneratingTemplate}>
                    {isGeneratingTemplate ? (
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Template
                  </Button>

                  <Button variant="outline" size="sm" onClick={clearAnswer}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>

                  <Button variant="outline" size="sm" onClick={copyAnswer}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview ? "Edit" : "Preview"}
                  </Button>
                </div>
              </div>

              {/* Template Suggestions */}
              {answerTemplate && (
                <Card className="mb-4 border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Answer Template Suggestion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{answerTemplate.description}</p>

                    <Tabs defaultValue="structure" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="structure">Structure</TabsTrigger>
                        <TabsTrigger value="example">Example</TabsTrigger>
                      </TabsList>

                      <TabsContent value="structure" className="mt-3">
                        <div className="space-y-2">
                          {answerTemplate.structure.map((point, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-sm">{point}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="example" className="mt-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">{answerTemplate.example}</p>
                        </div>
                        <Button onClick={() => applyTemplate(answerTemplate.example)} className="mt-3 w-full" size="sm">
                          Use This Template
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Editor/Preview */}
              <div className="flex-1 flex flex-col">
                {showPreview ? (
                  <Card className="flex-1">
                    <CardContent className="p-4 h-full">
                      <div className="prose prose-sm max-w-none h-full overflow-y-auto">
                        {currentAnswer ? (
                          <div className="whitespace-pre-wrap leading-relaxed">{currentAnswer}</div>
                        ) : (
                          <p className="text-muted-foreground italic">No answer written yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Write your answer here... 

Tips:
• Use the STAR method (Situation, Task, Action, Result) for behavioral questions
• Be specific with examples and metrics
• Keep it concise but comprehensive
• Practice speaking your answer aloud"
                    className="flex-1 resize-none min-h-[300px] leading-relaxed"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
