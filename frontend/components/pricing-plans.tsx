"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Building2, Star } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface PricingPlan {
  name: string
  price: number
  period: string
  description: string
  icon: React.ComponentType<any>
  popular?: boolean
  features: string[]
  limitations: string[]
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for casual job seekers',
    icon: Zap,
    features: [
      '5 AI-generated questions per month',
      '3 AI sample answers per month',
      '1 resume upload per month',
      'Basic question types',
      'Community support',
    ],
    limitations: [
      'No session saving',
      'No PDF export',
      'No analytics',
    ],
  },
  {
    name: 'Starter',
    price: 9,
    period: 'month',
    description: 'Ideal for active job seekers',
    icon: Star,
    popular: true,
    features: [
      '50 AI-generated questions per month',
      '25 AI sample answers per month',
      '5 resume uploads per month',
      '3 saved sessions',
      'All question types',
      'Basic PDF export',
      '3 answer templates',
      'Email support',
      'Basic progress tracking',
    ],
    limitations: [],
  },
  {
    name: 'Professional',
    price: 29,
    period: 'month',
    description: 'Best for serious career advancement',
    icon: Crown,
    features: [
      '200 AI-generated questions per month',
      '100 AI sample answers per month',
      'Unlimited uploads',
      '10 saved sessions with tags',
      'Industry-specific questions',
      'Advanced PDF export with branding',
      '10 answer templates + custom ones',
      '3 AI mock interviews per month',
      'Detailed analytics & insights',
      'Interview recording & playback',
      'Performance scoring',
      'Priority support',
    ],
    limitations: [],
  },
  {
    name: 'Enterprise',
    price: 79,
    period: 'month',
    description: 'Perfect for teams and career coaches',
    icon: Building2,
    features: [
      'Unlimited everything',
      'White-label PDF exports',
      'Custom question creation',
      'Unlimited templates & sharing',
      'Unlimited mock interviews',
      'Team management',
      'Bulk user management',
      'Shared question banks',
      'API access',
      'Custom AI model fine-tuning',
      'Video interview simulation',
      'ATS integrations',
      '24/7 priority support',
      'Dedicated account manager',
    ],
    limitations: [],
  },
]

export function PricingPlans() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planName: string) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (planName === 'Free') {
      return // Already on free plan
    }

    setIsLoading(planName)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: planName.toUpperCase(),
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start preparing for your dream job with our AI-powered interview preparation platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.limitations.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="w-4 h-4 text-muted-foreground mt-0.5 text-xs">•</span>
                        <span className="text-xs text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={isLoading === plan.name}
                >
                  {isLoading === plan.name ? (
                    'Processing...'
                  ) : plan.name === 'Free' ? (
                    'Current Plan'
                  ) : session?.user?.subscriptionPlan === plan.name.toUpperCase() ? (
                    'Current Plan'
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          All plans include our core AI-powered interview preparation features
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span>✓ 14-day money-back guarantee</span>
          <span>✓ Cancel anytime</span>
          <span>✓ Secure payments</span>
          <span>✓ 99.9% uptime</span>
        </div>
      </div>
    </div>
  )
}