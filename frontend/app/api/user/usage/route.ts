import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UsageService, PLAN_LIMITS } from '@/lib/usage-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current usage
    const usage = await UsageService.getCurrentUsage(session.user.id)
    
    // Get session count
    const sessionsCount = await UsageService.getSessionCount(session.user.id)
    
    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionPlan: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const limits = PLAN_LIMITS[user.subscriptionPlan]

    return NextResponse.json({
      usage: {
        questionsGenerated: usage.questionsGenerated,
        aiAnswersGenerated: usage.aiAnswersGenerated,
        resumeUploads: usage.resumeUploads,
        pdfExports: usage.pdfExports,
        mockInterviews: usage.mockInterviews,
        sessionsCount,
      },
      limits,
      plan: user.subscriptionPlan,
    })

  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}