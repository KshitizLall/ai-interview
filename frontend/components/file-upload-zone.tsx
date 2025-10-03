"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
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
  minHeight?: number
}

export function FileUploadZone({
  title,
  file,
  setFile,
  text,
  setText,
  accept = ".pdf,.docx,.txt",
  isTextArea = false,
  minHeight = 200,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

      const [file] = Array.from(e.dataTransfer.files)
      if (file) await processFile(file)
    },
    [setFile],
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) await processFile(file)
    },
    [setFile],
  )

  const processFile = async (file: File) => {
    setError(null)
    setIsProcessing(true)
    setUploadSuccess(false)

    try {
      // Validate file type
      // Normalize allowed extensions and validate by extension
      const allowedTypes = accept.split(",").map((t) => t.trim().toLowerCase())
      const fileExt = "." + (file.name.split(".").pop() || "").toLowerCase()
      if (!allowedTypes.includes(fileExt)) {
        throw new Error(`Unsupported file type ${fileExt}. Allowed: ${allowedTypes.join(", ")}`)
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB")
      }

  setFile?.(file)

  // Extract text using backend API
  const result = await apiService.uploadFile(file)
  if (result?.content) setText(result.content)

  setUploadSuccess(true)
  setTimeout(() => setUploadSuccess(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
      if (setFile) setFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearFile = () => {
    setFile?.(null)
    setText("")
    setUploadSuccess(false)
    setError(null)
  }

  const replaceFile = () => {
    clearFile()
    // Trigger file input click using ref
    fileInputRef.current?.click()
  }

  return (
  <Card className="relative overflow-hidden glass-card-subtle border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center justify-between">
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
              "relative rounded-lg p-4 md:p-6 transition-all duration-300 flex flex-col items-center md:justify-center",
              isDragOver ? "scale-105 shadow-lg animate-pulse-glow" : "",
              isProcessing && "animate-pulse",
              uploadSuccess && "border-green-500 bg-green-50 dark:bg-green-950/20",
              error && "border-destructive bg-destructive/5",
            )}
            style={{
              minHeight: `${Math.max(140, Math.min(minHeight, 520))}px`,
              borderStyle: 'dashed',
              borderWidth: '2px',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              aria-label="Upload file"
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />

            <div className="flex flex-col items-center gap-2 md:gap-3 w-full">
              {isProcessing ? (
                <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              ) : error ? (
                <div className="w-8 h-8 md:w-12 md:h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 md:w-6 md:h-6 text-destructive" />
                </div>
              ) : uploadSuccess ? (
                <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                  <Check className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
              ) : (
                <Upload className={cn("w-8 h-8 md:w-12 md:h-12 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")} />
              )}

              <div className="bg-card p-3 rounded-lg mt-3 w-full max-w-full sm:max-w-[640px] md:max-w-[540px]">
                <p className="font-semibold text-base md:text-lg text-left">
                  {isProcessing ? "Processing file..." : error ? "Upload failed" : "Drop your file here or click to browse"}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 text-left">
                  {error ? error : `Supports ${accept.replace(/\./g, "").toUpperCase()} files (max 10MB)`}
                </p>
              </div>
            </div>
          </div>
        )}

        {isTextArea && (
          <div className="space-y-2">
            <div className="bg-card p-3 rounded-lg">
              <Textarea
                placeholder="Paste your job description here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] md:min-h-[200px] resize-none bg-white w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {text.length} characters • {Math.ceil(text.length / 4)} words (estimated)
              </p>
            </div>
          </div>
        )}

        {file && (
          <div className="flex flex-col md:flex-row items-center justify-between p-3 bg-muted rounded-lg animate-fade-in-up gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 w-full">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} • {file.type || "Unknown type"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 w-full md:w-auto">
              <Button variant="ghost" size="sm" onClick={replaceFile} className="text-xs px-2 md:px-3 w-full md:w-auto">
                Replace
              </Button>
              <Button variant="ghost" size="sm" onClick={clearFile} className="p-1 md:p-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {text && showPreview && (
          <div className="animate-fade-in-up">
            <div className="border rounded-lg p-4 bg-muted/50 max-h-56 md:max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Text Preview:</p>
                <p className="text-xs text-muted-foreground">
                  {text.length} chars • {text.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {text.slice(0, 1200)}
                {text.length > 1200 && <span className="text-primary">... ({text.length - 1200} more characters)</span>}
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
