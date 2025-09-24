import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background/70 backdrop-blur-md glass-card-subtle supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">AI Interview Prep</h3>
              <p className="text-sm text-muted-foreground">
                Empowering professionals with AI-driven interview preparation tools.
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@aiinterviewprep.com" className="hover:text-foreground">
                  support@aiinterviewprep.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+1-555-0123" className="hover:text-foreground">
                  +1 (555) 012-3456
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Tech Valley, CA 94025</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Product</h4>
            <div className="space-y-2 text-sm">
              <div>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Interview Prep
                </Link>
              </div>
              <div>
                <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </div>
              <div>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </div>
              <div>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Legal</h4>
            <div className="space-y-2 text-sm">
              <div>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms & Conditions
                </Link>
              </div>
              <div>
                <Link href="/refund" className="text-muted-foreground hover:text-foreground">
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Follow on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Follow on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Follow on GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 AI Interview Prep. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/refund" className="hover:text-foreground">
              Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
