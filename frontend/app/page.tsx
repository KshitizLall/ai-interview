"use client"

import { FileUploadZone } from "@/components/file-upload-zone"
import { QuestionsList } from "@/components/questions-list"
import { SavedQuestions } from "@/components/saved-questions"
import { ConnectionStatus } from "@/components/connection-status"
import { GenerationControls } from "@/components/generation-controls"
import { BulkAnswerGenerator } from "@/components/bulk-answer-generator"
import { HeaderNavigation } from "@/components/header-navigation"
import { Footer } from "@/components/footer"
import { useWebSocketContext } from "@/components/websocket-provider"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, Moon, Sun, Briefcase, Sparkles, Wifi, WifiOff, Clock } from "lucide-react"
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
  const [isGenerationPopupOpen, setIsGenerationPopupOpen] = useState(false)

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
      const questions = event.detail || []
      setQuestions(questions)

      const answersMap: Record<string, string> = {}
      questions.forEach((q: any) => {
        if (q.answer) {
          answersMap[q.id] = q.answer
        }
      })

      if (Object.keys(answersMap).length > 0) {
        setAnswers(prevAnswers => ({ ...prevAnswers, ...answersMap }))
      }

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

  const handleExportPDF = async () => {
    if (!questions || questions.length === 0) {
      alert('No questions to export')
      return
    }

    try {
      // Determine job title from context or use default
      const jobTitle = jobDescription ?
        jobDescription.split('\n')[0].substring(0, 50) + '...' :
        'Professional Interview Preparation'

      const response = await apiService.exportPDF({
        questions: questions,
        answers: answers,
        resume_filename: resumeFile?.name,
        job_title: jobTitle,
        export_options: {
          include_analytics: true,
          include_tips: true,
          color_scheme: 'professional',
          page_layout: 'executive'
        }
      })

      // Download the PDF with success feedback
      apiService.downloadPDF(response.download_url, response.filename)

      // Optional: Show success message
      console.log(`PDF exported successfully: ${response.filename} (${(response.file_size / 1024).toFixed(1)} KB)`)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Navigation */}
      <HeaderNavigation />

      <div className="flex-1">
        {/* Top Bar */}
        <header className="border-b border-border/30 bg-card/30 backdrop-blur-md glass-card-subtle sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 md:py-4">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ConnectionStatus size="sm" />
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={isGenerationPopupOpen} onOpenChange={setIsGenerationPopupOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Questions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Generate Questions</DialogTitle>
                      <DialogDescription>
                        Upload your resume and job description to generate tailored interview questions.
                      </DialogDescription>
                    </DialogHeader>
                    <InputsPane
                      resumeFile={resumeFile}
                      setResumeFile={setResumeFile}
                      resumeText={resumeText}
                      setResumeText={setResumeText}
                      jobDescription={jobDescription}
                      setJobDescription={setJobDescription}
                      isGenerating={isGenerating}
                      setIsGenerating={setIsGenerating}
                      setQuestions={(questions: any[]) => {
                        setQuestions(questions);
                        if (questions.length > 0) {
                          setIsGenerationPopupOpen(false);
                        }
                      }}
                      setAnswers={setAnswers}
                    />
                  </DialogContent>
                </Dialog>
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
                    <TypewriterText text="Interview Prep" onComplete={() => setTitleAnimationComplete(true)} />
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
                <Dialog open={isGenerationPopupOpen} onOpenChange={setIsGenerationPopupOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1 min-w-0">
                      <Sparkles className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Generate</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Generate Questions</DialogTitle>
                      <DialogDescription>
                        Upload your resume and job description to generate tailored interview questions.
                      </DialogDescription>
                    </DialogHeader>
                    <InputsPane
                      resumeFile={resumeFile}
                      setResumeFile={setResumeFile}
                      resumeText={resumeText}
                      setResumeText={setResumeText}
                      jobDescription={jobDescription}
                      setJobDescription={setJobDescription}
                      isGenerating={isGenerating}
                      setIsGenerating={setIsGenerating}
                      setQuestions={(questions: any[]) => {
                        setQuestions(questions);
                        if (questions.length > 0) {
                          setIsGenerationPopupOpen(false);
                        }
                      }}
                      setAnswers={setAnswers}
                    />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => handleExportPDF()} className="flex-1 min-w-0">
                  <Download className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 md:py-6 mb-8">
          {/* Main content area for displaying questions and answers */}
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
            isGenerationPopupOpen={isGenerationPopupOpen}
            setIsGenerationPopupOpen={setIsGenerationPopupOpen}
          />
        </div>
      </div>      {/* Footer */}
      <Footer />
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
      startExpanded={true}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Left panel with upload zones */}
        <div className="space-y-6">
          <FileUploadZone
            title="Résumé"
            file={resumeFile}
            setFile={setResumeFile}
            text={resumeText}
            setText={setResumeText}
            accept=".pdf,.docx,.txt"
          />
          <FileUploadZone
            title="Job Description"
            text={jobDescription}
            setText={setJobDescription}
            isTextArea={true}
          />
        </div>

        {/* Right panel with generation controls */}
        <div>
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

      {/* Status indicator */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Ready to Generate</h4>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${resumeText.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={resumeText.trim() ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                Resume ({resumeText.length} chars)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${jobDescription.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={jobDescription.trim() ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                Job Description ({jobDescription.length} chars)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  isGenerationPopupOpen,
  setIsGenerationPopupOpen,
}: any) {
  const answeredCount = Object.keys(answers).filter((key) => answers[key]?.trim().length > 0).length

  // Show hero section when no questions are generated
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/3 to-purple-500/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 space-y-12 md:space-y-16 max-w-6xl">
          {/* Hero Content */}
          <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center shadow-2xl shadow-primary/10 animate-float">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                AI-Powered
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Interview Prep
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
                Transform your interview preparation with AI-generated questions tailored to your resume and target role
              </p>

              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Smart Analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300" />
                  Personalized Questions
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-600" />
                  Practice Mode
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up delay-300">
            <div className="group relative p-8 bg-gradient-to-br from-card/70 to-card/30 glass-card border border-border/30 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Smart Question Generation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI analyzes your resume and job requirements to create highly relevant, targeted interview questions that matter
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  Powered by advanced ML
                </div>
              </div>
            </div>

            <div className="group relative p-8 bg-gradient-to-br from-card/70 to-card/30 glass-card border border-border/30 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 md:translate-y-4 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/50 dark:to-green-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Industry-Specific Focus</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Questions tailored to your specific field with technical, behavioral, and situational scenarios that recruiters actually ask
                </p>
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  Multi-domain expertise
                </div>
              </div>
            </div>

            <div className="group relative p-8 bg-gradient-to-br from-card/70 to-card/30 glass-card border border-border/30 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/50 dark:to-purple-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Practice & Export</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Practice your answers, save your favorites, and export your complete prep materials as professional PDFs
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  Export ready materials
                </div>
              </div>
            </div>
          </div>

          {/* Premium CTA Section */}
          <div className="space-y-8 animate-fade-in-up delay-500">
            <div className="relative group">
              {/* <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" /> */}
              <Button
                size="lg"
                className="relative px-12 py-6 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 rounded-xl shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                onClick={() => setIsGenerationPopupOpen(true)}
              >
                <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
                Start Your Interview Prep Journey
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Upload Resume
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Add Job Description
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Generate Questions
              </div>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-6">Trusted by professionals worldwide</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-xs font-medium">🚀 AI-Powered</div>
              <div className="text-xs font-medium">⚡ Instant Results</div>
              <div className="text-xs font-medium">🎯 Precision Targeting</div>
              <div className="text-xs font-medium">📄 Export Ready</div>
            </div>
          </div>
        </div>
      </div>
    )
  }  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Enhanced Progress Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-card/60 to-card/30 glass-card border border-border/30 rounded-2xl shadow-lg backdrop-blur-md">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Interview Preparation Progress
                </h3>
              </div>
              <p className="text-sm text-muted-foreground ml-13">
                {answeredCount} of {questions?.length || 0} questions completed
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {Math.round((answeredCount / (questions?.length || 1)) * 100)}% Complete
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {Math.max(1, Math.ceil((questions?.length || 0 - answeredCount) * 2))} min remaining
                  </span>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2 sm:w-auto bg-muted/50">
                  <TabsTrigger value="questions" className="text-xs md:text-sm font-medium">
                    Questions & Answers
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="text-xs md:text-sm font-medium">
                    Saved ({savedQuestions?.length || 0})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-primary to-blue-600 shadow-sm transition-all duration-500 ease-out relative"
                style={{ width: `${questions?.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started</span>
              <span className="font-medium">
                {questions?.length > 0 ? `${answeredCount}/${questions.length}` : '0/0'}
              </span>
              <span>Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Answer Generator */}
      {activeTab === "questions" && questions?.length > 0 && (
        <div className="mb-6">
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
