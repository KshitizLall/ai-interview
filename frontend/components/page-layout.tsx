import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

interface PageLayoutProps {
  children: React.ReactNode
  showBackToHome?: boolean
}

export function PageLayout({ children, showBackToHome = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation removed: global header renders in layout */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {children}
      </main>
    </div>
  )
}
