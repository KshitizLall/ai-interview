// Shared types for the application

export type QuestionType =
  | 'technical'
  | 'behavioral'
  | 'experience'
  | 'problem-solving'
  | 'leadership'
  | 'situational'
  | 'company-culture'
  | 'general'

export type QuestionDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'

export type GenerationMode =
  | 'resume'
  | 'jd'
  | 'combined'

export type AnswerStyle =
  | 'professional'
  | 'conversational'
  | 'detailed'
  | 'concise'

export interface Question {
  id: string
  question: string
  type: QuestionType
  difficulty: QuestionDifficulty
  relevance_score: number
  answer?: string
  created_at: string
}

export interface GenerationOptions {
  mode: GenerationMode
  count: number
  include_answers: boolean
  question_types?: QuestionType[]
  difficulty_levels?: QuestionDifficulty[]
  focus_areas?: string[]
  company_name?: string
  position_level?: string
}
