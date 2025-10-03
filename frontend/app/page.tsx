"use client"

import { BulkAnswerGenerator } from "@/components/bulk-answer-generator"
import { ConnectionStatus } from "@/components/connection-status"
import { FileUploadZone } from "@/components/file-upload-zone"
import { Footer } from "@/components/footer"
import { GenerationControls } from "@/components/generation-controls"
import { HeaderNavigation } from "@/components/header-navigation"
import { QuestionsList } from "@/components/questions-list"
import { SavedQuestions } from "@/components/saved-questions"
import { useWebSocketContext } from "@/components/websocket-provider"
import { useAuth } from "@/components/auth-provider"
import { SessionSidebar } from "@/components/session-sidebar"
import { CreditDisplayCompact } from "@/components/credit-display"


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { apiService, InterviewSession } from "@/lib/api-service"
import { sessionManager } from "@/lib/session-manager"
import { Briefcase, Clock, Download, FileText, HelpCircle, Moon, Sparkles, Sun, SidebarClose, SidebarOpen } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function HomePage() {
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null)

  const prefersReducedMotion = useReducedMotion()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [savedQuestions, setSavedQuestions] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("questions")
  const [showInputs, setShowInputs] = useState(false)

  // WebSocket integration
  const { isConnected, progressUpdate } = useWebSocketContext()
  
  // Auth integration
  const { isAuthenticated, user, canGenerateQuestions, canGenerateAnswers, updateAnonymousUsage } = useAuth()

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
    // Check for saved theme preference (optimized)
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)

    setIsDark(shouldBeDark)
    if (shouldBeDark !== document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.toggle("dark", shouldBeDark)
    }


  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    // Batch DOM operations
    requestAnimationFrame(() => {
      document.documentElement.classList.toggle("dark", newTheme)
      localStorage.setItem("theme", newTheme ? "dark" : "light")
    })
  }

  const handleExportPDF = async () => {
    if (!questions || questions.length === 0) {
      toast.error('No questions to export', {
        description: 'Generate some questions first before exporting'
      })
      return
    }

    // Show loading toast
    const loadingToast = toast.loading('Preparing PDF export...', {
      description: 'Generating your interview preparation document'
    })

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

      // Show success toast
      toast.success('PDF exported successfully!', {
        id: loadingToast,
        description: `${response.filename} (${(response.file_size / 1024).toFixed(1)} KB) downloaded`
      })
    } catch (error) {
      console.error('PDF export failed:', error)
      toast.error('PDF export failed', {
        id: loadingToast,
        description: 'Please try again or check your connection'
      })
    }
  }

  // Session management functions
  const handleSessionSelect = async (session: InterviewSession) => {
    setCurrentSession(session)
    setResumeText(session.resume_text || '')
    setJobDescription(session.job_description || '')
    setQuestions(session.questions || [])
    setAnswers(session.answers || {})
    setResumeFile(null) // Clear file since we have text content
    
    if (session.resume_filename) {
      // Could potentially restore file info here
    }
    
    toast.success(`Loaded session: ${session.company_name || session.job_title || 'Untitled'}`)
  }

  const handleNewSession = () => {
    setCurrentSession(null)
    setResumeText('')
    setJobDescription('')
    setQuestions([])
    setAnswers({})
    setResumeFile(null)
    setSavedQuestions([])
    toast.success('Started new session')
  }

  const saveCurrentSession = async () => {
    if (!isAuthenticated || !user) return

    const sessionName = generateSessionName()
    const sessionData = {
      company_name: sessionName,
      job_title: extractJobTitle(jobDescription),
      resume_filename: resumeFile?.name,
      resume_text: resumeText,
      job_description: jobDescription
    }

    let session: InterviewSession | null = null
    
    if (currentSession?.id) {
      // Update existing session
      session = await sessionManager.updateSession(currentSession.id, {
        ...sessionData,
        questions,
        answers
      })
    } else {
      // Create new session
      session = await sessionManager.createSession(sessionData)
      
      // Add questions to the session if we have any
      if (session && questions.length > 0) {
        const updatedSession = await sessionManager.updateSession(session.id!, {
          questions,
          answers
        })
        session = updatedSession || session
      }
    }
    
    if (session) {
      setCurrentSession(session)
    }
    return session
  }

  // Auto-create session when questions are generated for authenticated users
  useEffect(() => {
    if (isAuthenticated && user && questions.length > 0 && !currentSession) {
      // Auto-create session when questions are generated
      handleAutoCreateSession()
    }
  }, [questions, isAuthenticated, user, currentSession])

  // Auto-save functionality for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !currentSession?.id) return

    const saveTimeout = setTimeout(async () => {
      if (questions.length > 0 || Object.keys(answers).length > 0) {
        await sessionManager.updateSessionAnswers(currentSession.id!, answers)
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(saveTimeout)
  }, [answers, isAuthenticated, currentSession?.id])

  const handleAutoCreateSession = async () => {
    if (!isAuthenticated || !user || !questions.length) return

    const sessionName = generateSessionName()
    const sessionData = {
      company_name: sessionName,
      job_title: extractJobTitle(jobDescription),
      resume_filename: resumeFile?.name,
      resume_text: resumeText,
      job_description: jobDescription
    }

    const session = await sessionManager.createSession(sessionData)
    if (session) {
      // Add questions to the session
      const updatedSession = await sessionManager.updateSession(session.id!, {
        questions,
        answers
      })

      setCurrentSession(updatedSession || session)
      toast.success(`✅ Session saved: ${session.company_name || 'Interview Session'}`, {
        description: `${questions.length} questions saved automatically`
      })
    }
  }

  // Helper functions
  const extractCompanyName = (jobDesc: string): string | undefined => {
    if (!jobDesc) return undefined
    const lines = jobDesc.trim().split('\n')
    const firstLine = lines[0]?.trim()
    
    // Try to extract company name from common patterns
    if (firstLine && firstLine.toLowerCase().includes(' at ')) {
      return firstLine.split(' at ').pop()?.trim()
    }
    
    // Look for company patterns in first few lines
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i]?.trim().toLowerCase()
      if (line.includes('company:') || line.includes('employer:') || line.includes('organization:')) {
        return lines[i]?.split(':')[1]?.trim()
      }
    }
    
    return undefined
  }

  const extractJobTitle = (jobDesc: string): string | undefined => {
    if (!jobDesc) return undefined
    const lines = jobDesc.trim().split('\n')
    const firstLine = lines[0]?.trim()
    
    // Remove company name if it exists
    if (firstLine.toLowerCase().includes(' at ')) {
      return firstLine.split(' at ')[0]?.trim()
    }
    
    return firstLine
  }

  const generateSessionName = (): string => {
    const companyName = extractCompanyName(jobDescription)
    const jobTitle = extractJobTitle(jobDescription)
    
    if (companyName && jobTitle) {
      return `${companyName} - ${jobTitle}`
    } else if (companyName) {
      return `${companyName} Interview`
    } else if (jobTitle) {
      return jobTitle
    } else {
      const timestamp = new Date().toLocaleDateString()
      return `Interview Session - ${timestamp}`
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Navigation */}
      <HeaderNavigation />

      <div className="flex-1 flex">
        {/* Session Sidebar - Desktop only */}
        <div className={`hidden lg:flex transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
          <SessionSidebar 
            currentSessionId={currentSession?.id}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            onSessionUpdate={() => {
              // Refresh current session data if needed
              if (currentSession?.id) {
                // Could refresh session data here if needed
              }
            }}
            className="h-full"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="border-b border-border/30 bg-card/30 backdrop-blur-md glass-card-subtle sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Sidebar Toggle - Desktop */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex"
                  >
                    {sidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
                  </Button>

                  <ConnectionStatus size="sm" />
                  <span className="text-sm text-muted-foreground hidden sm:inline">AI Interview Prep</span>
                  
                  {/* Current Session Indicator */}
                  {currentSession && (
                    <Badge 
                      variant="outline" 
                      className="hidden sm:inline-flex bg-green-50 border-green-200 text-green-700"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      {currentSession.company_name || currentSession.job_title || 'Active Session'}
                    </Badge>
                  )}
                  
                  {/* Show when session will be auto-created */}
                  {isAuthenticated && !currentSession && questions.length > 0 && (
                    <Badge variant="outline" className="hidden sm:inline-flex bg-blue-50 border-blue-200 text-blue-700">
                      <Clock className="w-3 h-3 mr-1" />
                      Will save automatically
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Credit Display - Compact */}
                  <CreditDisplayCompact />

                  {questions.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleExportPDF()}>
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download your questions and answers as a PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={toggleTheme}>
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle {isDark ? 'light' : 'dark'} mode</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-8 mb-8">
              {/* Main content area */}
              {questions.length === 0 ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Clean Hero Section */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    AI Interview Preparation
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Generate personalized interview questions from your resume, job description, or both. 
                    Practice and prepare with confidence.
                  </p>
                </div>
              </div>
                
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
                
                {/* Help Section */}
                <div className="mt-12 max-w-4xl mx-auto">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Three Ways to Generate Questions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3">
                          <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300">Resume Only</h4>
                        <p className="text-muted-foreground">Upload your resume to get questions about your experience, skills, and background. Perfect for general interview prep.</p>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Experience-based questions</div>
                      </div>
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3">
                          <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">Job Description Only</h4>
                        <p className="text-muted-foreground">Paste a job description to get questions specific to that role's requirements and responsibilities.</p>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">✓ Role-specific questions</div>
                      </div>
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3">
                          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300">Combined Approach</h4>
                        <p className="text-muted-foreground">Use both for the most personalized questions that match your experience to the specific role.</p>
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">✓ Most personalized results</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-xs text-muted-foreground text-center">
                        <strong>Pro tip:</strong> Start with just your resume to get familiar with the tool, then add job descriptions for specific roles you're targeting.
                      </p>
                    </div>
                  </div>
                </div>
              
              {/* Get Started Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={() => setShowInputs(true)} 
                  size="lg"
                  className="px-8 py-3 text-lg font-medium"
                >
                  Get Started
                </Button>
              </div>
            </div>
          ) : (
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
              setQuestions={setQuestions}
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
              setResumeText={setResumeText}
              setJobDescription={setJobDescription}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              isAuthenticated={isAuthenticated}
              currentSession={currentSession}
              setCurrentSession={setCurrentSession}
              saveCurrentSession={saveCurrentSession}
            />
          )}
            </div>
          </div>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
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

// Simplified Input Component
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
  const hasContent = resumeText.trim() || jobDescription.trim()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Simple Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-3">Resume</h3>
          <FileUploadZone
            title="Upload or paste your resume"
            file={resumeFile}
            setFile={setResumeFile}
            text={resumeText}
            setText={setResumeText}
            accept=".pdf,.docx,.txt"
          />
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Job Description</h3>
          <FileUploadZone
            title="Paste job description"
            text={jobDescription}
            setText={setJobDescription}
            isTextArea={true}
          />
        </div>
      </div>

      {/* Generate Button */}
      {hasContent && (
        <div className="text-center">
          <GenerationControls
            resumeText={resumeText}
            jobDescription={jobDescription}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            setQuestions={setQuestions}
            setAnswers={setAnswers}
          />
        </div>
      )}
    </div>
  )
}

// Clean Output Pane Component
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
  setQuestions,
  resumeFile,
  setResumeFile,
  setResumeText,
  setJobDescription,
  isGenerating,
  setIsGenerating,
  isAuthenticated,
  currentSession,
  setCurrentSession,
  saveCurrentSession,
}: any) {
  const answeredCount = Object.keys(answers).filter((key) => answers[key]?.trim().length > 0).length

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Questions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {answeredCount} of {questions?.length || 0} answered • {Math.round((answeredCount / (questions?.length || 1)) * 100)}% complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Bulk Answer Generator */}
          {activeTab === "questions" && questions?.length > 0 && (
            <BulkAnswerGenerator
              questions={questions}
              resumeText={resumeText}
              jobDescription={jobDescription}
              answers={answers}
              setAnswers={setAnswers}
            />
          )}
          
          {/* Save Session Button - only show for authenticated users */}
          {isAuthenticated && questions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const session = await saveCurrentSession()
                if (session) {
                  toast.success('Session saved successfully!')
                }
              }}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <FileText className="w-4 h-4 mr-2" />
              {currentSession ? 'Update Session' : 'Save Session'}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuestions([])
              setAnswers({})
              setSavedQuestions([])
              setCurrentSession(null)
              toast.success('New session started!')
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-10">
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Questions ({questions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Saved ({savedQuestions?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="mt-6">
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
      </Tabs>
    </div>
  )
}