import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { PageHeader } from "@/components/page-header"
import { ContentSection } from "@/components/content-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Scale, AlertTriangle, Shield, Users, CreditCard } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms & Conditions | InterviewBot",
  description: "Terms of service and conditions for using InterviewBot platform.",
}

export default function TermsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Terms & Conditions"
        description="These terms govern your use of InterviewBot. Please read them carefully before using our service."
      />

      <ContentSection className="space-y-8">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Effective Date:</strong> September 24, 2025. By using our service, you agree to these terms.
            We may update these terms from time to time and will notify you of significant changes.
          </AlertDescription>
        </Alert>

        {/* Acceptance of Terms */}
        <div>
          <h2 className="text-2xl font-bold mb-6">1. Acceptance of Terms</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                By accessing or using InterviewBot ("Service"), you agree to be bound by these Terms & Conditions
                ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-muted-foreground">
                These Terms apply to all visitors, users, and others who access or use the Service,
                including both free and paid users.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Description */}
        <div>
          <h2 className="text-2xl font-bold mb-6">2. Description of Service</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  What We Provide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI-powered interview question generation based on resumes and job descriptions</li>
                  <li>• Answer optimization suggestions and feedback</li>
                  <li>• Export functionality for preparation materials</li>
                  <li>• Practice tools and progress tracking</li>
                  <li>• Customer support and educational resources</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Service Limitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our Service is provided "as-is" and we cannot guarantee specific outcomes from using our platform.
                  AI-generated content should be reviewed and customized based on your specific situation and requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* User Accounts */}
        <div>
          <h2 className="text-2xl font-bold mb-6">3. User Accounts</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Account Responsibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Account Security</h4>
                  <p className="text-sm text-muted-foreground">
                    You are responsible for safeguarding your account credentials and for all activities
                    that occur under your account. Notify us immediately of any unauthorized use.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Accurate Information</h4>
                  <p className="text-sm text-muted-foreground">
                    You agree to provide accurate, current, and complete information during registration
                    and to update such information to keep it accurate.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Age Requirement</h4>
                  <p className="text-sm text-muted-foreground">
                    You must be at least 16 years old to use this Service. Users under 18 must have
                    parental consent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Acceptable Use */}
        <div>
          <h2 className="text-2xl font-bold mb-6">4. Acceptable Use Policy</h2>
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-900/10">
              <CardHeader>
                <CardTitle className="text-lg text-green-700 dark:text-green-300">✓ Permitted Uses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <li>• Use the Service for legitimate interview preparation</li>
                  <li>• Upload your own resume and job descriptions</li>
                  <li>• Share generated content for your own use</li>
                  <li>• Provide feedback to improve our service</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-900/10">
              <CardHeader>
                <CardTitle className="text-lg text-red-700 dark:text-red-300">✗ Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                  <li>• Upload false, misleading, or fraudulent content</li>
                  <li>• Violate any applicable laws or regulations</li>
                  <li>• Attempt to reverse engineer our AI systems</li>
                  <li>• Use the Service to spam, harass, or harm others</li>
                  <li>• Share your account with unauthorized third parties</li>
                  <li>• Resell or redistribute our Service without permission</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subscription and Billing */}
        <div>
          <h2 className="text-2xl font-bold mb-6">5. Subscription and Billing</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Billing Cycle</h4>
                  <p className="text-sm text-muted-foreground">
                    Subscriptions are billed monthly or annually in advance. Your subscription will automatically
                    renew unless cancelled before the renewal date.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Price Changes</h4>
                  <p className="text-sm text-muted-foreground">
                    We reserve the right to modify our pricing with 30 days' notice.
                    Existing subscribers will be notified via email.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Cancellation</h4>
                  <p className="text-sm text-muted-foreground">
                    You may cancel your subscription at any time. You'll continue to have access until
                    the end of your current billing period.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Intellectual Property */}
        <div>
          <h2 className="text-2xl font-bold mb-6">6. Intellectual Property Rights</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You retain ownership of all content you upload (resumes, job descriptions, answers).
                  By using our Service, you grant us a limited license to process this content to provide our services.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Our Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The Service, including its design, functionality, AI algorithms, and generated content,
                  are protected by copyright and other intellectual property laws. You may not copy,
                  distribute, or create derivative works without our permission.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Privacy and Data */}
        <div>
          <h2 className="text-2xl font-bold mb-6">7. Privacy and Data Protection</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. Please review our{" "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>{" "}
                to understand how we collect, use, and protect your personal information.
              </p>
              <p className="text-sm text-muted-foreground">
                By using our Service, you consent to the collection and use of your information
                as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimers */}
        <div>
          <h2 className="text-2xl font-bold mb-6">8. Disclaimers and Limitation of Liability</h2>
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Our Service is provided "as-is" without warranties of any kind.
                We cannot guarantee specific outcomes or results from using our platform.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  While we strive for 99.9% uptime, we cannot guarantee uninterrupted access to our Service.
                  We may need to perform maintenance or updates that temporarily affect availability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI-Generated Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI-generated questions and suggestions are provided for guidance only. Users should review,
                  customize, and verify all content before using it in actual interview situations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Termination */}
        <div>
          <h2 className="text-2xl font-bold mb-6">9. Termination</h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Termination by You</h4>
                <p className="text-sm text-muted-foreground">
                  You may terminate your account at any time by contacting our support team or
                  using the account deletion feature in your settings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Termination by Us</h4>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to suspend or terminate accounts that violate these Terms,
                  engage in fraudulent activity, or pose a security risk to our Service.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Effect of Termination</h4>
                <p className="text-sm text-muted-foreground">
                  Upon termination, your access to the Service will cease, and we may delete your account
                  data in accordance with our data retention policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Changes to Terms */}
        <div>
          <h2 className="text-2xl font-bold mb-6">10. Changes to Terms</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material
                changes via email or through our Service at least 30 days before they take effect.
              </p>
              <p className="text-sm text-muted-foreground">
                Continued use of our Service after changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">11. Contact Information</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms & Conditions, please contact us:
              </p>

              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:legal@interviewbot.com" className="text-primary hover:underline">
                    legal@interviewbot.com
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Address:</strong> InterviewBot, 123 Innovation Drive, Tech Valley, CA 94025
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+1-555-0123" className="text-primary hover:underline">
                    +1 (555) 012-3456
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Governing Law */}
        <div>
          <h2 className="text-2xl font-bold mb-6">12. Governing Law</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scale className="h-5 w-5 text-primary" />
                Legal Jurisdiction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These Terms are governed by and construed in accordance with the laws of the State of California,
                without regard to conflict of law principles. Any disputes arising from these Terms will be
                resolved in the courts of California.
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>
    </PageLayout>
  )
}
