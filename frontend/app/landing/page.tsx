"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Brain, 
  BarChart3, 
  Users, 
  Zap,
  Star,
  Quote
} from 'lucide-react'
import { PricingPlans } from '@/components/pricing-plans'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Question Generation',
    description: 'Get personalized interview questions based on your resume and job descriptions.'
  },
  {
    icon: FileText,
    title: 'Smart Answer Templates',
    description: 'Use proven frameworks like STAR method with AI-generated sample answers.'
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Track your progress with detailed insights and improvement recommendations.'
  },
  {
    icon: Users,
    title: 'Mock Interview Sessions',
    description: 'Practice with AI-powered mock interviews and get real-time feedback.'
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    content: 'AI Interview Prep helped me land my dream job! The personalized questions were spot-on.',
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'Product Manager at Microsoft',
    content: 'The analytics feature showed me exactly where I needed to improve. Game changer!',
    rating: 5
  },
  {
    name: 'Emily Johnson',
    role: 'Data Scientist at Netflix',
    content: 'Best interview prep tool I\'ve used. The AI answers helped me structure my responses perfectly.',
    rating: 5
  }
]

const stats = [
  { number: '10,000+', label: 'Interview Questions Generated' },
  { number: '2,500+', label: 'Successful Job Placements' },
  { number: '95%', label: 'User Success Rate' },
  { number: '4.9/5', label: 'Average Rating' }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Interview Preparation
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Ace Your Next Interview with{' '}
              <span className="text-primary">AI Coaching</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get personalized interview questions, AI-generated answers, and detailed performance analytics. 
              Land your dream job with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation tools
              to help you land your dream job.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get interview-ready in just 3 simple steps
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
              <p className="text-muted-foreground">
                Upload your resume and paste the job description you're applying for.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get AI Questions</h3>
              <p className="text-muted-foreground">
                Our AI generates personalized interview questions tailored to your profile.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice & Improve</h3>
              <p className="text-muted-foreground">
                Practice your answers and get AI feedback to improve your performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Loved by Job Seekers Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their success stories
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <PricingPlans />
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="text-center p-8 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-3xl lg:text-4xl mb-4">
                Ready to Land Your Dream Job?
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                Join thousands of successful job seekers who used AI Interview Prep 
                to ace their interviews and get hired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/signup">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link href="/auth/signin">
                    Sign In
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">AI Interview Prep</span>
            </div>
            <p className="text-muted-foreground mb-4">
              The AI-powered platform to ace your next interview
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}