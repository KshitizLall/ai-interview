"use client"

import React from "react"
import { FileUploadZone } from "@/components/file-upload-zone"
import { GenerationControls } from "@/components/generation-controls"

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
}: any) {
  const hasContent = (resumeText || "").trim() || (jobDescription || "").trim()

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

export default InputsPane
