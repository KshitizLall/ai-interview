"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, GripVertical, Trash2, FileText, Settings, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { exportToPDF, type ExportOptions, type ExportFormat } from "@/lib/pdf-exporter"

interface SavedQuestionsProps {
  savedQuestions: any[]
  setSavedQuestions: (questions: any[]) => void
  answers: Record<string, string>
}

export function SavedQuestions({ savedQuestions, setSavedQuestions, answers }: SavedQuestionsProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>("comprehensive")
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeAnswers: true,
    includeQuestionTypes: true,
    includeRelevanceScores: true,
    includeTips: false,
    includeHeader: true,
    includeFooter: true,
    pageBreakBetweenQuestions: false,
  })

  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedItem(questionId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()

    if (!draggedItem || draggedItem === targetId) return

    const draggedIndex = savedQuestions.findIndex((q) => q.id === draggedItem)
    const targetIndex = savedQuestions.findIndex((q) => q.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newQuestions = [...savedQuestions]
    const [draggedQuestion] = newQuestions.splice(draggedIndex, 1)
    newQuestions.splice(targetIndex, 0, draggedQuestion)

    setSavedQuestions(newQuestions)
    setDraggedItem(null)
  }

  const removeQuestion = (questionId: string) => {
    setSavedQuestions(savedQuestions.filter((q) => q.id !== questionId))
    setSelectedQuestions((prev) => prev.filter((id) => id !== questionId))
  }

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  const selectAllQuestions = () => {
    setSelectedQuestions(savedQuestions.map((q) => q.id))
  }

  const clearSelection = () => {
    setSelectedQuestions([])
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const questionsToExport =
        selectedQuestions.length > 0 ? savedQuestions.filter((q) => selectedQuestions.includes(q.id)) : savedQuestions

      await exportToPDF({
        questions: questionsToExport,
        answers,
        format: exportFormat,
        options: exportOptions,
      })
    } catch (error) {
      console.error("Export failed:", error)
      // Handle error - could show toast notification
    } finally {
      setIsExporting(false)
    }
  }

  const previewExport = () => {
    // Open preview modal or new tab with formatted content
    console.log("Preview export functionality would open here")
  }

  if (savedQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">No saved questions</h3>
            <p className="text-sm text-muted-foreground">
              Save questions from the Questions tab to build your interview prep sheet
            </p>
          </div>
        </div>
      </div>
    )
  }

  const answeredCount = savedQuestions.filter((q) => answers[q.id]?.trim().length > 0).length

  return (
    <div className="h-full flex flex-col">
      {/* Header with Export Controls */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Saved Questions ({savedQuestions.length})</h3>
            <p className="text-sm text-muted-foreground">
              {answeredCount} answered • {savedQuestions.length - answeredCount} pending
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowExportOptions(!showExportOptions)}>
              <Settings className="w-4 h-4 mr-2" />
              Options
            </Button>

            <Button variant="outline" size="sm" onClick={previewExport}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            <Button onClick={handleExport} disabled={isExporting} className="gap-2">
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export PDF
            </Button>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectedQuestions.length === savedQuestions.length ? clearSelection : selectAllQuestions}
            >
              {selectedQuestions.length === savedQuestions.length ? "Clear All" : "Select All"}
            </Button>

            {selectedQuestions.length > 0 && (
              <span className="text-muted-foreground">{selectedQuestions.length} selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Format:</span>
            <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="questions-only">Questions Only</SelectItem>
                <SelectItem value="answers-only">Answers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Options */}
        {showExportOptions && (
          <Card className="animate-fade-in-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-answers"
                      checked={exportOptions.includeAnswers}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeAnswers: checked as boolean }))
                      }
                    />
                    <label htmlFor="include-answers" className="text-sm">
                      Include answers
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-types"
                      checked={exportOptions.includeQuestionTypes}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeQuestionTypes: checked as boolean }))
                      }
                    />
                    <label htmlFor="include-types" className="text-sm">
                      Include question types
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-scores"
                      checked={exportOptions.includeRelevanceScores}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeRelevanceScores: checked as boolean }))
                      }
                    />
                    <label htmlFor="include-scores" className="text-sm">
                      Include relevance scores
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-header"
                      checked={exportOptions.includeHeader}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeHeader: checked as boolean }))
                      }
                    />
                    <label htmlFor="include-header" className="text-sm">
                      Include header
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="page-breaks"
                      checked={exportOptions.pageBreakBetweenQuestions}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, pageBreakBetweenQuestions: checked as boolean }))
                      }
                    />
                    <label htmlFor="page-breaks" className="text-sm">
                      Page break between questions
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-tips"
                      checked={exportOptions.includeTips}
                      onCheckedChange={(checked) =>
                        setExportOptions((prev) => ({ ...prev, includeTips: checked as boolean }))
                      }
                    />
                    <label htmlFor="include-tips" className="text-sm">
                      Include answer tips
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Questions List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {savedQuestions.map((question, index) => {
          const hasAnswer = answers[question.id]?.trim().length > 0
          const isSelected = selectedQuestions.includes(question.id)

          return (
            <Card
              key={question.id}
              draggable
              onDragStart={(e) => handleDragStart(e, question.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, question.id)}
              className={cn(
                "transition-all duration-200 cursor-move hover:shadow-md",
                draggedItem === question.id && "opacity-50 scale-95",
                isSelected && "ring-2 ring-primary bg-primary/5",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleQuestionSelection(question.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm leading-relaxed">
                      {index + 1}. {question.text}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {question.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(question.relevanceScore * 100)}% match
                      </Badge>
                      {question.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty} level
                        </Badge>
                      )}
                      {hasAnswer && (
                        <Badge variant="default" className="text-xs">
                          Answered ({answers[question.id].trim().split(/\s+/).length} words)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="text-destructive hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {hasAnswer && (
                <CardContent className="pt-0">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">Your Answer:</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{answers[question.id]}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
