"use client"

import { FileUploadZone } from "@/components/file-upload-zone"
import { QuestionsList } from "@/components/questions-list"
import { SavedQuestions } from "@/components/saved-questions"
import { ConnectionStatus } from "@/components/connection-status"
import { GenerationControls } from "@/components/generation-controls"
import { BulkAnswerGenerator } from "@/components/bulk-answer-generator"
import { useWebSocketContext } from "@/components/websocket-provider"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, Moon, Plus, RotateCcw, Sun, Briefcase, Sparkles, Wifi, WifiOff, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState, useCallback } from "react"
import { apiService } from "@/lib/api-service"

export default function HomePage() {
  const [isDark, setIsDark] = useState(false)
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [savedQuestions, setSavedQuestions] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("questions")

  // WebSocket integration
  const { isConnected, progressUpdate } = useWebSocketContext()

  // Handle progress completion
  useEffect(() => {
    if (progressUpdate?.stage === 'completed') {
      setIsGenerating(false)
    }
  }, [progressUpdate])

  // Listen for WebSocket events
  useEffect(() => {
    const handleQuestionsGenerated = (event: CustomEvent) => {
      setQuestions(event.detail || [])
      setIsGenerating(false)
    }

    const handleAnswerSaved = (event: CustomEvent) => {
      console.log('Answer saved:', event.detail)
    }

    window.addEventListener('questionsGenerated', handleQuestionsGenerated as EventListener)
    window.addEventListener('answerSaved', handleAnswerSaved as EventListener)

    return () => {
      window.removeEventListener('questionsGenerated', handleQuestionsGenerated as EventListener)
      window.removeEventListener('answerSaved', handleAnswerSaved as EventListener)
    }
  }, [])

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)

    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle("dark", shouldBeDark)

    // Start typewriter animation
    setTimeout(() => setTitleAnimationComplete(true), 2000)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle("dark", newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  const handleNewSession = () => {
    setResumeFile(null)
    setResumeText("")
    setJobDescription("")
    setQuestions([])
    setAnswers({})
    setSavedQuestions([])
  }

  const handleExportPDF = async () => {
    if (!questions || questions.length === 0) {
      alert('No questions to export')
      return
    }

    try {
      const response = await apiService.exportPDF({
        questions: questions,
        answers: answers,
        resume_filename: resumeFile?.name,
        job_title: 'Interview Preparation'
      })

      // Download the PDF
      apiService.downloadPDF(response.download_url, response.filename)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to export PDF')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">
                <TypewriterText text="AI Interview Prep" onComplete={() => setTitleAnimationComplete(true)} />
              </h1>
              <ConnectionStatus size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleNewSession}>
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Load Session
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportPDF()}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-3">
            {/* First Row: Logo, Title, Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-semibold truncate">
                  <TypewriterText text="AI Interview Prep" onComplete={() => setTitleAnimationComplete(true)} />
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <ConnectionStatus size="sm" />
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Second Row: Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleNewSession} className="flex-1 min-w-0">
                <Plus className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">New</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 min-w-0">
                <RotateCcw className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">Load</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportPDF()} className="flex-1 min-w-0">
                <Download className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Desktop: Split View, Mobile: Stacked with Tabs */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:h-[calc(100vh-140px)]">
          {/* Left Pane - Inputs */}
          <div className="lg:block hidden">
            <InputsPane
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
              resumeText={resumeText}
              setResumeText={setResumeText}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              setQuestions={setQuestions}
              setAnswers={setAnswers}
            />
          </div>

          {/* Right Pane - Outputs */}
          <div className="lg:block hidden">
            <OutputsPane
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              savedQuestions={savedQuestions}
              setSavedQuestions={setSavedQuestions}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              resumeText={resumeText}
              jobDescription={jobDescription}
            />
          </div>

          {/* Mobile: Tabbed Interface */}
          <div className="lg:hidden col-span-2">
            <Tabs defaultValue="inputs" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="inputs" className="text-sm">Upload & Generate</TabsTrigger>
                <TabsTrigger value="outputs" className="text-sm">Questions & Answers</TabsTrigger>
              </TabsList>

              <TabsContent value="inputs" className="mt-0 space-y-4">
                <InputsPane
                  resumeFile={resumeFile}
                  setResumeFile={setResumeFile}
                  resumeText={resumeText}
                  setResumeText={setResumeText}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  setQuestions={setQuestions}
                />
              </TabsContent>

              <TabsContent value="outputs" className="mt-0 space-y-4">
                <OutputsPane
                  questions={questions}
                  answers={answers}
                  setAnswers={setAnswers}
                  savedQuestions={savedQuestions}
                  setSavedQuestions={setSavedQuestions}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  resumeText={resumeText}
                  jobDescription={jobDescription}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// Typewriter animation component
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 100)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  return <span>{displayText}</span>
}

// Generation Controls Component
function EnhancedGenerationControls({
  resumeText,
  jobDescription,
  isGenerating,
  setIsGenerating,
  setQuestions,
  setAnswers,
}: {
  resumeText: string
  jobDescription: string
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  setQuestions: (questions: any[]) => void
  setAnswers?: (answers: Record<string, string>) => void
}) {
  const { generateQuestions, isConnected, progressUpdate } = useWebSocketContext()

  return (
    <GenerationControls
      resumeText={resumeText}
      jobDescription={jobDescription}
      isGenerating={isGenerating}
      setIsGenerating={setIsGenerating}
      setQuestions={setQuestions}
      setAnswers={setAnswers}
      isConnected={isConnected}
      progressUpdate={progressUpdate}
      generateQuestions={generateQuestions}
    />
  )
}

// Input pane component
function InputsPane({
  resumeFile,
  setResumeFile,
  resumeText,
  setResumeText,
  jobDescription,
  setJobDescription,
  isGenerating,
  setIsGenerating,
  setQuestions,
  setAnswers,
}: any) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-1 space-y-6">
        <FileUploadZone
          title="Résumé"
          file={resumeFile}
          setFile={setResumeFile}
          text={resumeText}
          setText={setResumeText}
          accept=".pdf,.docx,.txt"
        />

        <FileUploadZone title="Job Description" text={jobDescription} setText={setJobDescription} isTextArea={true} />
      </div>

      <div className="lg:sticky lg:bottom-0 bg-background/80 backdrop-blur-sm border-t border-border pt-4 space-y-4">
        <EnhancedGenerationControls
          resumeText={resumeText}
          jobDescription={jobDescription}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          setQuestions={setQuestions}
          setAnswers={setAnswers}
        />
      </div>
    </div>
  )
}

// Output pane component
function OutputsPane({
  questions,
  answers,
  setAnswers,
  savedQuestions,
  setSavedQuestions,
  activeTab,
  setActiveTab,
  resumeText,
  jobDescription,
}: any) {
  const answeredCount = Object.keys(answers).filter((key) => answers[key]?.trim().length > 0).length

  return (
    <div className="h-full flex flex-col">
      {/* Progress Header */}
      <div className="mb-4 p-3 md:p-4 bg-muted/50 rounded-lg">
        <div className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
          <h3 className="font-medium text-sm md:text-base">Interview Preparation Progress</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <span className="text-sm text-muted-foreground">
              {answeredCount} of {questions?.length || 0} answered
            </span>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="questions" className="text-xs md:text-sm">Questions & Answers</TabsTrigger>
                <TabsTrigger value="saved" className="text-xs md:text-sm">Saved ({savedQuestions?.length || 0})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${questions?.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Bulk Answer Generator */}
      {activeTab === "questions" && questions?.length > 0 && (
        <div className="mb-4">
          <BulkAnswerGenerator
            questions={questions}
            resumeText={resumeText}
            jobDescription={jobDescription}
            answers={answers}
            setAnswers={setAnswers}
          />
        </div>
      )}

      <div className="flex-1">
        {activeTab === "questions" ? (
          <QuestionsList
            questions={questions}
            savedQuestions={savedQuestions}
            setSavedQuestions={setSavedQuestions}
            answers={answers}
            setAnswers={setAnswers}
            resumeText={resumeText}
            jobDescription={jobDescription}
          />
        ) : (
          <SavedQuestions
            savedQuestions={savedQuestions}
            setSavedQuestions={setSavedQuestions}
            answers={answers}
          />
        )}
      </div>
    </div>
  )
}
