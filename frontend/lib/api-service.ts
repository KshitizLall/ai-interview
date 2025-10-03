// API service for communicating with FastAPI backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Question {
  id: string
  question: string
  type: 'technical' | 'behavioral' | 'experience' | 'problem-solving' | 'leadership' | 'situational' | 'company-culture' | 'general'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  relevance_score: number
  answer?: string
  created_at: string
}

export interface FileUploadResponse {
  filename: string
  file_size: number
  content: string
  word_count: number
  character_count: number
  processing_time: number
}

export interface QuestionGenerationRequest {
  resume_text?: string
  job_description?: string
  mode: 'resume' | 'jd' | 'combined'
  question_count: number
  include_answers: boolean
  question_types?: string[]
  difficulty_levels?: string[]
  focus_areas?: string[]
  company_name?: string
  position_level?: string
}

export interface QuestionGenerationResponse {
  questions: Question[]
  generation_time: number
  total_questions: number
}

export interface AnswerGenerationRequest {
  question: string
  resume_text?: string
  job_description?: string
}

export interface AnswerGenerationResponse {
  question: string
  answer: string
  generation_time: number
}

export interface BulkAnswerGenerationRequest {
  questions: Question[]
  resume_text?: string
  job_description?: string
  answer_style?: 'professional' | 'conversational' | 'detailed' | 'concise'
}

export interface BulkAnswerGenerationResponse {
  answers: Record<string, string>  // question_id -> answer
  generation_time: number
  total_answers: number
}

export interface PDFExportRequest {
  questions: Question[]
  answers: Record<string, string>
  resume_filename?: string
  job_title?: string
  export_options?: {
    include_analytics?: boolean
    include_tips?: boolean
    color_scheme?: 'professional' | 'minimal' | 'modern'
    page_layout?: 'compact' | 'spacious' | 'executive'
  }
}

export interface PDFExportResponse {
  filename: string
  download_url: string
  file_size: number
  generation_time: number
}

// Auth interfaces
export interface UserCreate {
  name?: string
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface UserProfile {
  id?: string
  name?: string
  email: string
  credits: number
  sessions: string[]
  created_at: string
}

export interface UserProfileUpdate {
  name?: string
}

export interface CreditCheckRequest {
  operation: string
  cost?: number
}

export interface CreditCheckResponse {
  has_credits: boolean
  current_credits: number
  required_credits: number
}

// Session interfaces
export interface InterviewSession {
  id?: string
  user_id: string
  company_name?: string
  job_title?: string
  resume_filename?: string
  resume_text?: string
  job_description?: string
  questions: Question[]
  answers: Record<string, string>
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface SessionCreate {
  company_name?: string
  job_title?: string
  resume_filename?: string
  resume_text?: string
  job_description?: string
}

export interface SessionUpdate {
  company_name?: string
  job_title?: string
  questions?: Question[]
  answers?: Record<string, string>
  is_active?: boolean
}

export interface SessionListResponse {
  sessions: InterviewSession[]
  total_sessions: number
}

export interface SessionResponse {
  session: InterviewSession
}

export interface SessionStatsResponse {
  total_questions: number
  answered_questions: number
  completion_percentage: number
  last_updated: string
}

export interface AnonymousUsageLimits {
  questions_generated: number
  answers_generated: number
  max_questions: number
  max_answers: number
}

class APIService {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/interview/upload-file`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'File upload failed')
    }

    return response.json()
  }

  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    const response = await fetch(`${this.baseURL}/interview/generate-questions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Question generation failed')
    }

    return response.json()
  }

  async generateAnswer(request: AnswerGenerationRequest): Promise<AnswerGenerationResponse> {
    const response = await fetch(`${this.baseURL}/interview/generate-answer`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Answer generation failed')
    }

    return response.json()
  }

  async generateBulkAnswers(request: BulkAnswerGenerationRequest): Promise<BulkAnswerGenerationResponse> {
    const response = await fetch(`${this.baseURL}/interview/generate-bulk-answers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Bulk answer generation failed')
    }

    return response.json()
  }

  async exportPDF(request: PDFExportRequest): Promise<PDFExportResponse> {
    const response = await fetch(`${this.baseURL}/interview/export-pdf`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'PDF export failed')
    }

    return response.json()
  }

  async healthCheck(): Promise<{ status: string; service?: string }> {
    const response = await fetch(`${this.baseURL}/health`)

    if (!response.ok) {
      throw new Error('Health check failed')
    }

    return response.json()
  }

  // Authentication methods
  async signup(userData: UserCreate): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Signup failed')
    }

    const tokenData = await response.json()
    this.setToken(tokenData.access_token)
    return tokenData
  }

  async login(credentials: UserCreate): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Login failed')
    }

    const tokenData = await response.json()
    this.setToken(tokenData.access_token)
    return tokenData
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    })

    // Clear token regardless of response status
    this.setToken(null)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Logout failed')
    }
  }

  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to get profile')
    }

    return response.json()
  }

  async updateProfile(profileUpdate: UserProfileUpdate): Promise<UserProfile> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileUpdate),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to update profile')
    }

    return response.json()
  }

  async checkCredits(operation: string, cost: number = 1): Promise<CreditCheckResponse> {
    const response = await fetch(`${this.baseURL}/auth/credits/check`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ operation, cost }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to check credits')
    }

    return response.json()
  }

  async deductCredits(operation: string, cost: number = 1): Promise<{ success: boolean; new_credit_balance: number }> {
    const response = await fetch(`${this.baseURL}/auth/credits/deduct`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ operation, cost }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to deduct credits')
    }

    return response.json()
  }

  // Session management methods
  async createSession(sessionData: SessionCreate): Promise<SessionResponse> {
    const response = await fetch(`${this.baseURL}/sessions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to create session')
    }

    return response.json()
  }

  async getSessions(activeOnly: boolean = true): Promise<SessionListResponse> {
    const response = await fetch(`${this.baseURL}/sessions?active_only=${activeOnly}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to get sessions')
    }

    return response.json()
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to get session')
    }

    return response.json()
  }

  async updateSession(sessionId: string, sessionUpdate: SessionUpdate): Promise<SessionResponse> {
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sessionUpdate),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to update session')
    }

    return response.json()
  }

  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to delete session')
    }
  }

  async updateSessionAnswers(sessionId: string, answers: Record<string, string>): Promise<SessionResponse> {
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}/answers`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(answers),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to update session answers')
    }

    return response.json()
  }

  async getSessionStats(sessionId: string): Promise<SessionStatsResponse> {
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to get session stats')
    }

    return response.json()
  }

  async searchSessions(query: string): Promise<SessionListResponse> {
    const response = await fetch(`${this.baseURL}/sessions/search/?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to search sessions')
    }

    return response.json()
  }

  // Anonymous usage tracking (client-side)
  getAnonymousUsage(): AnonymousUsageLimits {
    if (typeof window === 'undefined') {
      return { questions_generated: 0, answers_generated: 0, max_questions: 10, max_answers: 10 }
    }

    const stored = localStorage.getItem('anonymous_usage')
    if (stored) {
      return JSON.parse(stored)
    }

    return { questions_generated: 0, answers_generated: 0, max_questions: 10, max_answers: 10 }
  }

  updateAnonymousUsage(usage: Partial<AnonymousUsageLimits>): void {
    if (typeof window === 'undefined') return

    const current = this.getAnonymousUsage()
    const updated = { ...current, ...usage }
    localStorage.setItem('anonymous_usage', JSON.stringify(updated))
  }

  resetAnonymousUsage(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('anonymous_usage')
  }

  // Helper method to download PDF
  downloadPDF(downloadUrl: string, filename: string) {
    const link = document.createElement('a')
    link.href = `${this.baseURL}${downloadUrl}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const apiService = new APIService()
