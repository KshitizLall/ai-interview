import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { PageHeader } from "@/components/page-header"
import { ContentSection } from "@/components/content-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RotateCcw, DollarSign, Clock, CheckCircle, AlertTriangle, Mail, Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Refund Policy | InterviewBot",
  description: "Learn about our cancellation and refund policy for InterviewBot subscriptions.",
}

export default function RefundPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Cancellation & Refund Policy"
        description="We want you to be completely satisfied with our service. Learn about our flexible cancellation and refund policies."
      />

      <ContentSection className="space-y-8">
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Customer Satisfaction Guarantee:</strong> We offer a 7-day money-back guarantee on all paid plans.
            No questions asked - if you're not satisfied, we'll refund your payment.
          </AlertDescription>
        </Alert>

        {/* Quick Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Policy Overview</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-300">
                  <RotateCcw className="h-5 w-5" />
                  7-Day Guarantee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Full refund available within 7 days of subscription start date,
                  no questions asked.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-300">
                  <Clock className="h-5 w-5" />
                  Instant Cancellation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Cancel anytime from your account settings.
                  Access continues until your billing period ends.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/30 dark:border-purple-800 dark:bg-purple-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-purple-700 dark:text-purple-300">
                  <DollarSign className="h-5 w-5" />
                  Fair Billing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  No hidden fees, no cancellation charges.
                  Only pay for the time you actually use our service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Refund Eligibility */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Refund Eligibility</h2>

          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  Eligible for Full Refund
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <Calendar className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-300">Within 7 Days</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Request a refund within 7 days of your subscription start date for any reason.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-300">Technical Issues</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Service disruptions or technical problems preventing normal use of our platform.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Mail className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-300">Billing Errors</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Unauthorized charges or billing mistakes on your account.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                  Prorated Refunds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  In exceptional circumstances beyond the 7-day window, we may offer prorated refunds at our discretion:
                </p>
                <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  <li>• Extended service outages affecting your ability to use the platform</li>
                  <li>• Major feature changes that significantly impact your experience</li>
                  <li>• Account security breaches (not caused by user error)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancellation Process */}
        <div>
          <h2 className="text-2xl font-bold mb-6">How to Cancel Your Subscription</h2>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Method 1: Self-Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-xs">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Log into your InterviewBot account
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-xs">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Go to Account Settings → Billing & Subscription
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-xs">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click "Cancel Subscription" and confirm
                    </p>
                  </div>

                  <Button className="w-full mt-4" size="sm">
                    Go to Account Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Method 2: Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Email Support</p>
                      <p className="text-sm text-muted-foreground">
                        Send a cancellation request to:{" "}
                        <a href="mailto:billing@interviewbot.com" className="text-primary hover:underline">
                          billing@interviewbot.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Response Time</p>
                      <p className="text-sm text-muted-foreground">
                        We'll process your request within 24 hours and send confirmation
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4" size="sm">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> After cancellation, you'll continue to have access to all paid features
                until the end of your current billing period. No partial refunds for unused time within the billing cycle.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Refund Process */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Refund Process</h2>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                How Refunds Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-2">1. Request Refund</h4>
                  <p className="text-xs text-muted-foreground">
                    Contact support with your refund request and reason
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-2">2. Review Process</h4>
                  <p className="text-xs text-muted-foreground">
                    We review your request within 1-2 business days
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-2">3. Refund Issued</h4>
                  <p className="text-xs text-muted-foreground">
                    Approved refunds processed within 5-7 business days
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-sm mb-2">Refund Methods</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Credit Card:</strong> Refunded to the original payment method</li>
                  <li>• <strong>PayPal:</strong> Refunded to your PayPal account</li>
                  <li>• <strong>Bank Transfer:</strong> For enterprise customers, refunded via ACH</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Circumstances */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Special Circumstances</h2>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Discounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Student discount subscriptions are subject to the same refund policy.
                  However, if you lose student status during the subscription period,
                  no refund is provided for the price difference.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annual Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Annual plans are eligible for full refund within the first 7 days.
                  After this period, refunds are prorated based on unused months,
                  subject to our discretionary review policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enterprise Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enterprise customers have custom refund terms outlined in their service agreement.
                  Contact your account manager or our enterprise support team for specific details.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I get a refund after 7 days?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  While our standard guarantee is 7 days, we evaluate exceptional cases individually.
                  Contact support to discuss your specific situation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens to my data after cancellation?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your account data remains accessible until your billing period ends.
                  After that, we retain it for 30 days before permanent deletion.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I pause my subscription instead?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Currently, we don't offer subscription pausing. You can cancel and resubscribe
                  later, though you'll lose any progress or saved content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer partial refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We don't provide partial refunds for unused time within a billing cycle.
                  However, your access continues until the period ends after cancellation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Need Help with Cancellation or Refunds?</h2>

          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Our billing support team is here to help with any questions about cancellations or refunds.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Billing Support</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:billing@interviewbot.com" className="text-primary hover:underline">
                        billing@interviewbot.com
                      </a>
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      <a href="tel:+1-555-0123" className="text-primary hover:underline">
                        +1 (555) 012-3456
                      </a>
                    </p>
                    <p><strong>Hours:</strong> Mon-Fri, 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">General Support</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:support@interviewbot.com" className="text-primary hover:underline">
                        support@interviewbot.com
                      </a>
                    </p>
                    <p><strong>Response Time:</strong> Within 24 hours</p>
                    <p><strong>Available:</strong> 7 days a week</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button>
                  Contact Billing Support
                </Button>
                <Button variant="outline">
                  View Account Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>
    </PageLayout>
  )
}
