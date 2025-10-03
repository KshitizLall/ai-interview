"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, FileText, Briefcase, HelpCircle } from "lucide-react"
// React automatic runtime is enabled; no explicit hooks needed here
import { useAuth } from "@/hooks/use-auth"
import AuthenticatedArea from "@/components/authenticated-area"
import { Footer } from "@/components/footer"
import Link from 'next/link'

export default function HomePage() {
  const { token } = useAuth()

  // If authenticated, render the authenticated area which implements the post-auth UI
  if (token) return <AuthenticatedArea />

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Interview Preparation</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Upload your resume or paste a job description to generate tailored interview questions and suggested answers. Practice with confidence using AI-powered guidance.
              </p>

              <div className="flex items-center justify-center gap-4">
                <Link href="/auth/login" className="">
                  <Button size="lg" className="px-8 py-3 text-lg font-medium">Get started</Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="px-6 py-3">Learn more</Button>
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Resume Only</h4>
                  <p className="text-muted-foreground">Upload your resume to get questions about your experience, skills, and background.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Job Description</h4>
                  <p className="text-muted-foreground">Paste a job description to get role-specific questions and targeted guidance.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3">
                    <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300">Practice & Export</h4>
                  <p className="text-muted-foreground">Practice answers, auto-save progress, and export a polished PDF for interview reviews.</p>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    )
}
