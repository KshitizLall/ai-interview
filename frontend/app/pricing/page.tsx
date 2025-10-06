import { Metadata } from "next"
import { PageLayout } from "@/components/page-layout"
import { PageHeader } from "@/components/page-header"
import { ContentSection } from "@/components/content-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star, Zap, Crown } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing | InterviewBot",
  description: "Choose the perfect plan for your interview preparation needs. Start free and upgrade as you grow.",
}

const pricingPlans = [
  {
    name: "Free",
    icon: Star,
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started with basic interview prep",
    features: [
      { name: "10 AI questions per month (anonymous)", included: true },
      { name: "10 AI answers per month (anonymous)", included: true },
      { name: "Resume text extraction", included: true },
      { name: "Basic question types & difficulty levels", included: true },
      { name: "Export to PDF", included: false },
      { name: "Bulk answer generation", included: false },
      { name: "Save interview sessions", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Professional",
    icon: Zap,
    price: "₹199",
    period: "per month",
    description: "For serious job seekers who need comprehensive preparation",
    features: [
      { name: "200 credits per month (signup bonus)", included: true },
      { name: "Unlimited AI questions & answers", included: true },
      { name: "Advanced answer optimization", included: true },
      { name: "Bulk answer generation (4 styles)", included: true },
      { name: "Premium PDF export with tips", included: true },
      { name: "Save & manage interview sessions", included: true },
      { name: "Question relevance scoring", included: true },
      { name: "Email support", included: true },
    ],
    cta: "Start Professional",
    popular: true,
  },
  {
    name: "Power User",
    icon: Crown,
    price: "₹399",
    period: "per month",
    description: "For frequent job seekers and career coaches",
    features: [
      { name: "1000 credits per month", included: true },
      { name: "Everything in Professional", included: true },
      { name: "Priority question generation", included: true },
      { name: "Advanced PDF customization", included: true },
      { name: "Session analytics & insights", included: true },
      { name: "Priority email support", included: true },
      { name: "Multiple resume profiles", included: true },
      { name: "Extended session history", included: true },
    ],
    cta: "Upgrade Now",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Simple, Transparent Pricing"
        description="Choose the plan that fits your interview preparation needs. Start free and upgrade anytime."
      />

      <ContentSection className="space-y-12">
        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary/50 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                    <plan.icon className={`h-6 w-6 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                  at the start of your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the credit system work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Each AI question or answer generation costs 1 credit. New signups get 50 free credits!
                  Unused credits roll over monthly. All prices include GST as applicable in India.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We accept UPI, net banking, credit/debit cards (Visa, MasterCard, RuPay),
                  and digital wallets like Paytm, PhonePe. Enterprise customers can pay by invoice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer student discounts?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! Students get 50% off the Professional plan (₹99/month). Contact our support team
                  with your valid college ID or enrollment certificate to apply the discount.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Credit System Explanation */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">How Our Credit System Works</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every question generation and AI answer costs 1 credit. New users get 50 free credits upon signup!
            No wastage - unused credits roll over. All pricing includes applicable GST for Indian users.
          </p>
          <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto text-sm">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="font-semibold text-primary mb-2">1 Credit =</div>
              <div className="text-muted-foreground">1 AI question OR 1 AI answer</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <div className="font-semibold text-primary mb-2">Free Features</div>
              <div className="text-muted-foreground">PDF export, sessions, file upload</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <div className="font-semibold text-primary mb-2">Rollover</div>
              <div className="text-muted-foreground">Unused credits carry forward</div>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm">
            <Check className="h-4 w-4" />
            7-day money-back guarantee • Try risk-free
          </div>
          <p className="text-sm text-muted-foreground">
            All prices in Indian Rupees (₹) including GST. Made in India for Indian job seekers. Credit system ensures fair usage.
          </p>
        </div>
      </ContentSection>
    </PageLayout>
  )
}
