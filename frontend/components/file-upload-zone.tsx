"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, X, Check, Eye, EyeOff, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api-service"

interface FileUploadZoneProps {
  title: string
  file?: File | null
  setFile?: (file: File | null) => void
  text: string
  setText: (text: string) => void
  accept?: string
  isTextArea?: boolean
}

export function FileUploadZone({
  title,
  file,
  setFile,
  text,
  setText,
  accept = ".pdf,.docx,.txt",
  isTextArea = false,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (!setFile) return

      const files = Array.from(e.dataTransfer.files)
      const file = files[0]

      if (file) {
        await processFile(file)
      }
    },
    [setFile],
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && setFile) {
        await processFile(file)
      }
    },
    [setFile],
  )

  const processFile = async (file: File) => {
    setError(null)
    setIsProcessing(true)
    setUploadSuccess(false)

    try {
      // Validate file type
      const allowedTypes = accept.split(",").map((type) => type.trim())
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (!allowedTypes.includes(fileExtension)) {
        throw new Error(`File type ${fileExtension} is not supported. Please use: ${allowedTypes.join(", ")}`)
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB")
      }

      if (setFile) setFile(file)

      // Extract text using FastAPI backend
      const result = await apiService.uploadFile(file)
      setText(result.content)

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
      if (setFile) setFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearFile = () => {
    if (setFile) setFile(null)
    setText("")
    setUploadSuccess(false)
    setError(null)
  }

  const replaceFile = () => {
    clearFile()
    // Trigger file input click
    const fileInput = document.querySelector(`input[type="file"]`) as HTMLInputElement
    fileInput?.click()
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          {text && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isTextArea && (
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
              isDragOver
                ? "border-primary bg-primary/5 scale-105 shadow-lg animate-pulse-glow"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              isProcessing && "animate-pulse",
              uploadSuccess && "border-green-500 bg-green-50 dark:bg-green-950/20",
              error && "border-destructive bg-destructive/5",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />

            <div className="flex flex-col items-center gap-3">
              {isProcessing ? (
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              ) : error ? (
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              ) : uploadSuccess ? (
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                  <Check className="w-6 h-6 text-white" />
                </div>
              ) : (
                <Upload
                  className={cn("w-12 h-12 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")}
                />
              )}

              <div>
                <p className="font-medium">
                  {isProcessing
                    ? "Processing file..."
                    : error
                      ? "Upload failed"
                      : "Drop your file here or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error ? error : `Supports ${accept.replace(/\./g, "").toUpperCase()} files (max 10MB)`}
                </p>
              </div>
            </div>
          </div>
        )}

        {isTextArea && (
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your job description here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {text.length} characters • {Math.ceil(text.length / 4)} words (estimated)
            </p>
          </div>
        )}

        {file && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} • {file.type || "Unknown type"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={replaceFile}>
                Replace
              </Button>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {text && showPreview && (
          <div className="animate-fade-in-up">
            <div className="border rounded-lg p-4 bg-muted/50 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Text Preview:</p>
                <p className="text-xs text-muted-foreground">
                  {text.length} chars • {text.split(/\s+/).length} words
                </p>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {text.slice(0, 1000)}
                {text.length > 1000 && <span className="text-primary">... ({text.length - 1000} more characters)</span>}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}
