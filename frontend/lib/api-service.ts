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

class APIService {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
