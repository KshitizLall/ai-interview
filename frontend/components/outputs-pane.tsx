"use client"

import { useState } from "react"
import { BulkAnswerGenerator } from "@/components/bulk-answer-generator"
import { QuestionsList } from "@/components/questions-list"
import { SavedQuestions } from "@/components/saved-questions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InterviewSession } from "@/lib/api-service"
import { 
  Briefcase, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw
} from "lucide-react"

interface OutputsPaneProps {
  questions: any[]
  answers: Record<string, string>
  setAnswers: (answers: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void
  savedQuestions: any[]
  setSavedQuestions: (questions: any[]) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  resumeText: string
  jobDescription: string
  setQuestions: (questions: any[]) => void
  resumeFile: File | null
  setResumeFile: (file: File | null) => void
  setResumeText: (text: string) => void
  setJobDescription: (text: string) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  isAuthenticated: boolean
  currentSession: InterviewSession | null
  setCurrentSession: (session: InterviewSession | null) => void
  saveCurrentSession: () => Promise<InterviewSession | null | undefined>
}

export function OutputsPane({
  questions,
  answers,
  setAnswers,
  savedQuestions,
  setSavedQuestions,
  activeTab,
  setActiveTab,
  resumeText,
  jobDescription,
}: OutputsPaneProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 5
  const answeredCount = Object.keys(answers).filter((key) => answers[key]?.trim().length > 0).length
  
  // Pagination logic
  const totalQuestions = activeTab === "questions" ? questions?.length || 0 : savedQuestions?.length || 0
  const totalPages = Math.ceil(totalQuestions / questionsPerPage)
  const startIndex = (currentPage - 1) * questionsPerPage
  const endIndex = startIndex + questionsPerPage
  
  const currentQuestions = activeTab === "questions" 
    ? questions?.slice(startIndex, endIndex) || []
    : savedQuestions?.slice(startIndex, endIndex) || []

  // Reset pagination when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Interview Questions</h1>
        
        {/* Progress Stats */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <Badge variant="secondary" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            {answeredCount} answered
          </Badge>
          <Badge variant="secondary" className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300">
            {(questions?.length || 0) - answeredCount} remaining
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary font-semibold">
            {Math.round((answeredCount / (questions?.length || 1)) * 100)}% complete
          </Badge>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Tab Navigation */}
          <Card className="p-4">
            <div className="flex bg-muted rounded-lg p-1 w-fit">
              <Button
                variant={activeTab === "questions" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("questions")}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Questions
                <Badge variant="secondary" className="ml-1 text-xs">
                  {questions?.length || 0}
                </Badge>
              </Button>
              <Button
                variant={activeTab === "saved" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("saved")}
                className="flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Saved
                <Badge variant="secondary" className="ml-1 text-xs">
                  {savedQuestions?.length || 0}
                </Badge>
              </Button>
            </div>
          </Card>

          {/* Pagination Info */}
          {totalQuestions > 0 && (
            <Card className="p-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="font-medium">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalQuestions)} of {totalQuestions} questions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Questions Content */}
          <div className="space-y-6">
            {activeTab === "questions" ? (
              <QuestionsList
                questions={currentQuestions}
                savedQuestions={savedQuestions}
                setSavedQuestions={setSavedQuestions}
                answers={answers}
                setAnswers={setAnswers}
                resumeText={resumeText}
                jobDescription={jobDescription}
              />
            ) : (
              <SavedQuestions
                savedQuestions={currentQuestions}
                setSavedQuestions={setSavedQuestions}
                answers={answers}
              />
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-9 h-9 sm:w-10 sm:h-10 text-sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Bulk Answer Generator */}
        <div className="w-full lg:w-80 xl:w-96">
          <div className="sticky top-4 lg:top-6 space-y-4 max-h-[calc(100vh-2rem)] lg:max-h-[calc(100vh-3rem)] overflow-auto">
            {activeTab === "questions" && questions?.length > 0 ? (
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
                <BulkAnswerGenerator
                  questions={questions}
                  resumeText={resumeText}
                  jobDescription={jobDescription}
                  answers={answers}
                  setAnswers={setAnswers}
                  className="w-full shadow-lg border-2 border-primary/10"
                />
              </div>
            ) : (
              <Card className="p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-lg border-2 border-border/50">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">No Actions Available</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "saved" 
                        ? "Bulk generation is not available for saved questions." 
                        : "Generate some questions to see bulk actions here."
                      }
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}