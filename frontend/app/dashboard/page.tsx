"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Calendar, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Upload, 
  Download,
  Settings,
  Crown
} from 'lucide-react'

interface UsageData {
  questionsGenerated: number
  aiAnswersGenerated: number
  resumeUploads: number
  pdfExports: number
  mockInterviews: number
  sessionsCount: number
}

interface PlanLimits {
  questionsPerMonth: number
  aiAnswersPerMonth: number
  resumeUploadsPerMonth: number
  pdfExportsPerMonth: number
  mockInterviewsPerMonth: number
  maxSessions: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchUsageData()
    }
  }, [status, router])

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/user/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
        setLimits(data.limits)
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || !usage || !limits) {
    return null
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toString()
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'bg-gray-100 text-gray-800'
      case 'STARTER': return 'bg-blue-100 text-blue-800'
      case 'PROFESSIONAL': return 'bg-purple-100 text-purple-800'
      case 'ENTERPRISE': return 'bg-gold-100 text-gold-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {session.user.name || session.user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={getPlanColor(session.user.subscriptionPlan || 'FREE')}>
                <Crown className="w-3 h-3 mr-1" />
                {session.user.subscriptionPlan || 'FREE'}
              </Badge>
              <Button variant="outline" onClick={() => router.push('/analytics')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button onClick={() => router.push('/pricing')}>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
            <TabsTrigger value="sessions">My Sessions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            {/* Usage Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Questions Generated</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.questionsGenerated}</div>
                  <p className="text-xs text-muted-foreground">
                    of {formatLimit(limits.questionsPerMonth)} this month
                  </p>
                  {limits.questionsPerMonth !== -1 && (
                    <Progress 
                      value={getUsagePercentage(usage.questionsGenerated, limits.questionsPerMonth)} 
                      className="mt-2"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Answers</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.aiAnswersGenerated}</div>
                  <p className="text-xs text-muted-foreground">
                    of {formatLimit(limits.aiAnswersPerMonth)} this month
                  </p>
                  {limits.aiAnswersPerMonth !== -1 && (
                    <Progress 
                      value={getUsagePercentage(usage.aiAnswersGenerated, limits.aiAnswersPerMonth)} 
                      className="mt-2"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resume Uploads</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.resumeUploads}</div>
                  <p className="text-xs text-muted-foreground">
                    of {formatLimit(limits.resumeUploadsPerMonth)} this month
                  </p>
                  {limits.resumeUploadsPerMonth !== -1 && (
                    <Progress 
                      value={getUsagePercentage(usage.resumeUploads, limits.resumeUploadsPerMonth)} 
                      className="mt-2"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">PDF Exports</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.pdfExports}</div>
                  <p className="text-xs text-muted-foreground">
                    of {formatLimit(limits.pdfExportsPerMonth)} this month
                  </p>
                  {limits.pdfExportsPerMonth !== -1 && (
                    <Progress 
                      value={getUsagePercentage(usage.pdfExports, limits.pdfExportsPerMonth)} 
                      className="mt-2"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mock Interviews</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.mockInterviews}</div>
                  <p className="text-xs text-muted-foreground">
                    of {formatLimit(limits.mockInterviewsPerMonth)} this month
                  </p>
                  {limits.mockInterviewsPerMonth !== -1 && (
                    <Progress 
                      value={getUsagePercentage(usage.mockInterviews, limits.mockInterviewsPerMonth)} 
                      className="mt-2"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage.sessionsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    of {formatLimit(limits.maxSessions)} sessions
                  </p>
                  {limits.maxSessions !== -1 && (
                    <Progress 
                      value={getUsagePercentage(usage.sessionsCount, limits.maxSessions)} 
                      className="mt-2"
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upgrade Prompt */}
            {session.user.subscriptionPlan === 'FREE' && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Upgrade Your Plan
                  </CardTitle>
                  <CardDescription>
                    Get more questions, AI answers, and advanced features with a paid plan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push('/pricing')}>
                    View Pricing Plans
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>My Interview Sessions</CardTitle>
                <CardDescription>
                  Your saved interview preparation sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Session management will be available in the next update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences and subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Subscription Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Current plan: {session.user.subscriptionPlan || 'FREE'}
                    </p>
                    {session.user.currentPeriodEnd && (
                      <p className="text-sm text-muted-foreground">
                        Next billing: {new Date(session.user.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <Button onClick={() => router.push('/pricing')}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}