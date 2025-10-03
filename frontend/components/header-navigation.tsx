"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { FileText, Menu, X, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

function AuthActions({ isMobile }: { isMobile?: boolean }) {
  const { token, logout } = useAuth()

  if (token) {
    return (
      <>
        <Button variant="ghost" size={isMobile ? "sm" : "sm"} onClick={() => logout()}>
          Sign out
        </Button>
      </>
    )
  }

  return (
    <>
      <Link href="/auth/login">
        <Button variant="ghost" size={isMobile ? "sm" : "sm"}>Sign in</Button>
      </Link>
      <Link href="/auth/signup">
        <Button size={isMobile ? "sm" : "sm"}>Sign up</Button>
      </Link>
    </>
  )
}

export function HeaderNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { token, logout } = useAuth()
  // treat non-empty string token as logged in
  const isLoggedIn = Boolean(token && String(token).length > 0)

  const navClass = (href: string) => {
    const isActive = pathname?.startsWith(href)
    return (
      (isActive ? 'text-sm font-medium text-foreground border-b-2 border-primary' : 'text-sm text-muted-foreground hover:text-foreground') +
      ' transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 rounded-sm'
    )
  }

  // derive user initials from token (assumes JWT with sub or name)
  const getInitials = (tkn?: string | null) => {
    if (!tkn) return ''
    try {
      const payload = JSON.parse(atob(tkn.split('.')[1]))
      const name = payload.name || payload.sub || payload.email || ''
      const parts = String(name).split(/\s+/).filter(Boolean)
      if (parts.length === 0) return ''
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    } catch (err) {
      return ''
    }
  }

  // close mobile menu if auth state changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [isLoggedIn])

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={isLoggedIn ? "/prepare-interview" : "/"} className="flex items-center gap-3" aria-label="InterviewBot - Go to prepare interview">
                  <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center transform transition-transform duration-200 hover:scale-105 hover:-rotate-3">
                    <FileText className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-semibold tracking-tight">InterviewBot</span>
                </Link>
              </TooltipTrigger>
            </Tooltip>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {!token ? (
              <>
                <Link href="/about" className={navClass('/about')}>About</Link>
                <Link href="/pricing" className={navClass('/pricing')}>Pricing</Link>
                <Link href="/contact" className={navClass('/contact')}>Contact</Link>
              </>
            ) : (
              <>
                <Link href="/prepare-interview" className={navClass('/prepare-interview')}>Prepare Interview</Link>
              </>
            )}
          </nav>

          {/* Actions / Profile */}
          <div className="flex items-center gap-3">
            {/* Desktop auth actions */}
            <div className="hidden md:flex items-center gap-3">
              {!isLoggedIn ? (
                <AuthActions />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="menu" variant="ghost" className="px-3 py-2 flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            {/* If you have an avatar image URL in token, AvatarImage can be used */}
                            <AvatarFallback>{getInitials(token)}</AvatarFallback>
                          </Avatar>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/account">Account Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/billing">Subscription & Billing</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => logout()}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((s) => !s)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pb-4 border-t border-border/40">
            <nav className="flex flex-col gap-3 pt-3">
              {!token ? (
                <>
                  <Link href="/about" className="text-base text-foreground" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                  <Link href="/pricing" className="text-base text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                  <Link href="/contact" className="text-base text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-base text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/prepare-interview" className="text-base text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Prepare Interview</Link>

                  <div className="mt-2 border-t border-border/40 pt-3">
                    <Link href="/account" className="block text-sm text-muted-foreground mb-2" onClick={() => setIsMobileMenuOpen(false)}>Account Settings</Link>
                    <Link href="/billing" className="block text-sm text-muted-foreground mb-2" onClick={() => setIsMobileMenuOpen(false)}>Subscription & Billing</Link>
                    <Link href="/profile" className="block text-sm text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>Profile Details</Link>
                    <button className="w-full text-left text-sm text-destructive mt-3" onClick={() => { setIsMobileMenuOpen(false); logout(); }}>Sign Out</button>
                  </div>
                </>
              )}

              {/* Footer links for mobile */}
              <div className="pt-3 border-t border-border/40 mt-3">
                <Link href="/privacy" className="text-xs text-muted-foreground block mb-1" onClick={() => setIsMobileMenuOpen(false)}>Privacy</Link>
                <Link href="/terms" className="text-xs text-muted-foreground block mb-1" onClick={() => setIsMobileMenuOpen(false)}>Terms</Link>
                <Link href="/refund" className="text-xs text-muted-foreground block" onClick={() => setIsMobileMenuOpen(false)}>Refund</Link>
              </div>

              {/* Mobile auth actions when logged out */}
              {!token && (
                <div className="mt-4 border-t border-border/40 pt-4">
                  <AuthActions isMobile />
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
