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
  companyName,
  setCompanyName,
  positionLevel,
  setPositionLevel,
}: any) {
  const hasContent = (resumeText || "").trim() || (jobDescription || "").trim()
  // Local role focus state is lifted to parent via setRoleFocus externally; reuse resumeText as placeholder if missing

  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-8 px-3 sm:px-4 md:px-0">
      {/* Top three-column area */}
  <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr,0.9fr] gap-6 items-start">
  <div className="w-full">
          <h3 className="font-medium mb-3">Resume</h3>
            <FileUploadZone
            title="Upload or paste your resume"
            file={resumeFile}
            setFile={setResumeFile}
            text={resumeText}
            setText={setResumeText}
            accept=".pdf,.docx,.txt"
            minHeight={360}
          />
        </div>

  <div className="w-full">
          <h3 className="font-medium mb-3">Job Description</h3>
          <FileUploadZone
            title="Paste job description"
            text={jobDescription}
            setText={setJobDescription}
            isTextArea={true}
            minHeight={220}
          />
        </div>

  <div className="w-full">
          <h3 className="font-medium mb-3">Company & Position</h3>
          <div className="space-y-3">
            <input value={companyName || ''} onChange={(e) => setCompanyName?.(e.target.value)} placeholder="Company name (optional)" className="w-full px-3 py-2 rounded-lg bg-muted/40 placeholder:text-muted-foreground" />
            <select value={positionLevel || ''} onChange={(e) => setPositionLevel?.(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted/40">
              <option value="">Position level (optional)</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls row - full width */}
        <div className="bg-card border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input
              className="col-span-2 w-full px-3 py-2 border rounded-md bg-input"
              placeholder="Role focus (e.g. Frontend Engineer, Data Scientist)"
              value={resumeText}
              onChange={(e) => setResumeText?.(e.target.value)}
              aria-label="Role focus"
            />

            <div className="flex items-center gap-3">
              <label className="text-sm">Question types:</label>
              <div className="flex gap-2 flex-wrap">
                <label className="flex items-center gap-2"><input type="checkbox" checked readOnly className="accent-primary"/> <span className="text-sm">Technical</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary"/> <span className="text-sm">Behavioral</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary"/> <span className="text-sm">Experience</span></label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center justify-end gap-3 w-full">
            <button
              className="w-full md:w-auto px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
              onClick={() => {
                if (!hasContent) return alert('Please upload or paste resume / job description before starting')
                setIsGenerating?.(true)
                // If parent provided a setQuestions callback, call it; otherwise, let parent handle generation via other props
                if (setQuestions) {
                  // mock generation: create a small set of placeholder questions until API is wired in
                  const q = [{ id: 'q1', question: 'Tell me about yourself.' }, { id: 'q2', question: 'Describe a challenging project.' }]
                  setQuestions(q)
                  setIsGenerating?.(false)
                }
              }}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Start Interview Prep'}
            </button>
          </div>
        </div>
    </div>
  )
}

export default InputsPane
