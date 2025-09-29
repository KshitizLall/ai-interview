import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { PageHeader } from "@/components/page-header"
import { ContentSection } from "@/components/content-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, Lock, Users, FileText, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | InterviewBot",
  description: "Learn how we collect, use, and protect your personal information at InterviewBot.",
}

export default function PrivacyPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Privacy Policy"
        description="We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information."
      />

      <ContentSection className="space-y-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Last Updated:</strong> September 24, 2025. We may update this policy from time to time.
            We'll notify you of any material changes via email or through our service.
          </AlertDescription>
        </Alert>

        {/* Quick Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Privacy at a Glance</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-300">
                  <Lock className="h-5 w-5" />
                  We Protect Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your resume content and personal information are encrypted and stored securely.
                  We never sell or share your data with third parties.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-300">
                  <Eye className="h-5 w-5" />
                  You Control Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Access, update, or delete your data anytime. You own your content
                  and can export or remove it whenever you choose.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information We Collect */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Information We Collect</h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">When you create an account, we collect:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Name and email address</li>
                  <li>• Password (encrypted and hashed)</li>
                  <li>• Profile preferences and settings</li>
                  <li>• Subscription and billing information</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Content You Provide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">To provide our AI services, we process:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Resume content (text and files)</li>
                  <li>• Job descriptions you input</li>
                  <li>• Interview answers you write</li>
                  <li>• Questions you save or bookmark</li>
                  <li>• Feedback and support messages</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Usage Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">We automatically collect:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• How you interact with our service</li>
                  <li>• Device and browser information</li>
                  <li>• IP address and general location</li>
                  <li>• Usage patterns and feature preferences</li>
                  <li>• Performance and error data</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">How We Use Your Information</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Provide Our Services</h3>
                <p className="text-sm text-muted-foreground">
                  Generate personalized interview questions, provide AI-powered answer suggestions,
                  and enable you to practice and export your preparation materials.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Improve Our Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze usage patterns to enhance our AI algorithms, fix bugs,
                  and develop new features that better serve our users.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Communicate with You</h3>
                <p className="text-sm text-muted-foreground">
                  Send service updates, respond to support requests, and provide
                  relevant information about our platform (you can opt out anytime).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">4</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Ensure Security</h3>
                <p className="text-sm text-muted-foreground">
                  Protect our platform from abuse, fraud, and unauthorized access
                  to keep your data and our service secure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sharing */}
        <div>
          <h2 className="text-2xl font-bold mb-6">How We Share Your Information</h2>

          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>We never sell your personal data.</strong> We only share information in the limited
              circumstances described below, and always with appropriate safeguards.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We work with trusted third-party services (cloud hosting, email, analytics)
                  that help us operate our platform. They're bound by strict confidentiality agreements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Legal Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We may disclose information if required by law, court order, or to protect
                  the rights, safety, and security of our users and the public.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  If we're involved in a merger or acquisition, user information may be transferred
                  to the new entity, subject to the same privacy protections.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Your Rights */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Rights and Choices</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  Access Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Request a copy of all personal information we have about you,
                  including your activity history and account details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Update Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Correct any inaccurate information or update your preferences
                  directly in your account settings at any time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Delete Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Request deletion of your account and all associated data.
                  Some information may be retained for legal or security purposes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  Opt Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Unsubscribe from marketing communications or request to limit
                  how we process your information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Security */}
        <div>
          <h2 className="text-2xl font-bold mb-6">How We Protect Your Data</h2>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Encryption</h3>
                    <p className="text-sm text-muted-foreground">
                      All data is encrypted in transit and at rest using industry-standard encryption protocols.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Access Controls</h3>
                    <p className="text-sm text-muted-foreground">
                      Strict access controls ensure only authorized personnel can access your data,
                      and only when necessary for service operation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Eye className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Regular Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                      We continuously monitor our systems for potential security threats
                      and vulnerabilities to keep your data safe.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Questions About Privacy?</h2>

          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or how we handle your data,
                please don't hesitate to contact us:
              </p>

              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@interviewbot.com" className="text-primary hover:underline">
                    privacy@interviewbot.com
                  </a>
                </p>
                <p className="text-sm">
                  <strong>Address:</strong> 123 Innovation Drive, Tech Valley, CA 94025
                </p>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                We're committed to resolving any privacy concerns you may have and will respond
                to your inquiry within 48 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentSection>
    </PageLayout>
  )
}
