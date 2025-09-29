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
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with basic interview prep",
    features: [
      { name: "5 AI-generated questions per month", included: true },
      { name: "Basic answer suggestions", included: true },
      { name: "Resume text extraction", included: true },
      { name: "Export to PDF", included: false },
      { name: "Bulk answer generation", included: false },
      { name: "Priority support", included: false },
      { name: "Advanced question analytics", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Professional",
    icon: Zap,
    price: "$19",
    period: "per month",
    description: "Ideal for active job seekers and career changers",
    features: [
      { name: "Unlimited AI-generated questions", included: true },
      { name: "Advanced answer optimization", included: true },
      { name: "Resume text extraction", included: true },
      { name: "Export to PDF", included: true },
      { name: "Bulk answer generation", included: true },
      { name: "Email support", included: true },
      { name: "Question relevance scoring", included: true },
    ],
    cta: "Start Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "$49",
    period: "per month",
    description: "For teams and organizations preparing multiple candidates",
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Team collaboration tools", included: true },
      { name: "Custom question templates", included: true },
      { name: "Advanced analytics dashboard", included: true },
      { name: "Priority phone support", included: true },
      { name: "SSO integration", included: true },
      { name: "Custom integrations", included: true },
    ],
    cta: "Contact Sales",
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
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our free plan gives you a taste of our AI-powered features. You can try
                  professional features with our 7-day money-back guarantee.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards (Visa, MasterCard, American Express)
                  and PayPal. Enterprise customers can pay by invoice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer student discounts?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! Students get 50% off the Professional plan. Contact our support team
                  with your valid student ID to apply the discount.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We work with organizations of all sizes to provide customized interview preparation
            solutions. Get in touch to discuss volume pricing and enterprise features.
          </p>
          <div className="flex gap-4 justify-center">
            <Button>
              Contact Sales
            </Button>
            <Button variant="outline">
              Schedule Demo
            </Button>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm">
            <Check className="h-4 w-4" />
            7-day money-back guarantee on all paid plans
          </div>
        </div>
      </ContentSection>
    </PageLayout>
  )
}
