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
      {/* Navigation */}
      {showBackToHome && (
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to App
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {children}
      </main>
    </div>
  )
}
