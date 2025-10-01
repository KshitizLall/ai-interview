import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

function AuthActions({ isMobile }: { isMobile?: boolean }) {
  const { token, logout } = useAuth()

  if (token) {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => logout()}>
          Logout
        </Button>
      </>
    )
  }

  return (
    <>
      <Link href="/auth/login">
        <Button variant="ghost" size={isMobile ? 'sm' : 'sm'}>Login</Button>
      </Link>
      <Link href="/auth/signup">
        <Button size={isMobile ? 'sm' : 'sm'}>Sign up</Button>
      </Link>
    </>
  )
}

export function HeaderNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 glass-card-subtle">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">InterviewBot</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>

          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <AuthActions />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/40">
            <nav className="flex flex-col gap-4 pt-4">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              <div className="border-t border-border/40 pt-4">
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors block mb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors block mb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Terms & Conditions
                </Link>
                <Link
                  href="/refund"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Refund Policy
                </Link>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border/40">
                <AuthActions isMobile />
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
