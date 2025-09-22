import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UsageService } from '@/lib/usage-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { count = 1 } = await request.json()

    // Check if user can generate questions
    const canUse = await UsageService.canUseFeature(
      session.user.id, 
      'questionsPerMonth', 
      count
    )

    if (!canUse.allowed) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          message: canUse.reason,
          remaining: canUse.remaining || 0
        },
        { status: 429 }
      )
    }

    // Here you would integrate with your existing question generation logic
    // For now, we'll just track the usage
    await UsageService.trackUsage(session.user.id, 'questionsPerMonth', count)

    return NextResponse.json({
      success: true,
      remaining: canUse.remaining
    })

  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}