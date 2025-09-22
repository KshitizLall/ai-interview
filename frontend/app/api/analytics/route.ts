import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has premium plan for analytics
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionPlan: true }
    })

    if (!user || (user.subscriptionPlan !== 'PROFESSIONAL' && user.subscriptionPlan !== 'ENTERPRISE')) {
      return NextResponse.json({
        totalQuestions: 0,
        answeredQuestions: 0,
        averageScore: 0,
        strongAreas: [],
        improvementAreas: [],
        categoryPerformance: [],
        progressOverTime: [],
        responseTime: { average: 0, median: 0 }
      })
    }

    // Get user's questions and answers
    const userSessions = await prisma.userSession.findMany({
      where: { userId: session.user.id },
      include: {
        questions: {
          include: {
            answers: {
              where: { userId: session.user.id }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Calculate analytics
    const totalQuestions = userSessions.reduce((sum, session) => sum + session.questions.length, 0)
    const answeredQuestions = userSessions.reduce((sum, session) => 
      sum + session.questions.filter(q => q.answers.length > 0).length, 0
    )

    // Mock analytics data for demo purposes
    const categoryPerformance = [
      { category: 'Technical', score: 7.8, questions: 15 },
      { category: 'Behavioral', score: 8.2, questions: 12 },
      { category: 'Experience', score: 6.9, questions: 8 }
    ]

    const progressOverTime = userSessions.map((session, index) => ({
      date: session.createdAt.toISOString().split('T')[0],
      score: Math.random() * 3 + 7, // Mock score between 7-10
      questions: session.questions.length
    }))

    const averageScore = categoryPerformance.reduce((sum, cat) => sum + cat.score, 0) / categoryPerformance.length

    const strongAreas = [
      'Communication skills',
      'Problem-solving approach',
      'Technical knowledge'
    ]

    const improvementAreas = [
      'Providing specific examples',
      'Quantifying achievements',
      'Interview confidence'
    ]

    return NextResponse.json({
      totalQuestions,
      answeredQuestions,
      averageScore,
      strongAreas,
      improvementAreas,
      categoryPerformance,
      progressOverTime,
      responseTime: {
        average: 145,
        median: 120
      }
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}