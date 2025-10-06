"use client"

import { FileUploadZone } from "@/components/file-upload-zone"
import { GenerationControls } from "@/components/generation-controls"

interface InputsPaneProps {
  resumeFile: File | null
  setResumeFile: (file: File | null) => void
  resumeText: string
  setResumeText: (text: string) => void
  jobDescription: string
  setJobDescription: (text: string) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  setQuestions: (questions: any[]) => void
  setAnswers: (answers: Record<string, string>) => void
}

export function InputsPane({
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
}: InputsPaneProps) {
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