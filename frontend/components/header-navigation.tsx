import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Menu, X } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            <span className="text-xl font-semibold">AI Interview Prep</span>
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

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/privacy">Privacy Policy</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/terms">Terms & Conditions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/refund">Refund Policy</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">
              Get Started
            </Button>
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
                <Button variant="outline" size="sm" className="flex-1">
                  Sign In
                </Button>
                <Button size="sm" className="flex-1">
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
