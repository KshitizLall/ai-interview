import { prisma } from '@/lib/prisma'
import { SubscriptionPlan } from '@prisma/client'

// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    questionsPerMonth: 5,
    aiAnswersPerMonth: 3,
    resumeUploadsPerMonth: 1,
    pdfExportsPerMonth: 0,
    mockInterviewsPerMonth: 0,
    maxSessions: 0,
  },
  STARTER: {
    questionsPerMonth: 50,
    aiAnswersPerMonth: 25,
    resumeUploadsPerMonth: 5,
    pdfExportsPerMonth: 10,
    mockInterviewsPerMonth: 0,
    maxSessions: 3,
  },
  PROFESSIONAL: {
    questionsPerMonth: 200,
    aiAnswersPerMonth: 100,
    resumeUploadsPerMonth: -1, // unlimited
    pdfExportsPerMonth: -1, // unlimited
    mockInterviewsPerMonth: 3,
    maxSessions: 10,
  },
  ENTERPRISE: {
    questionsPerMonth: -1, // unlimited
    aiAnswersPerMonth: -1, // unlimited
    resumeUploadsPerMonth: -1, // unlimited
    pdfExportsPerMonth: -1, // unlimited
    mockInterviewsPerMonth: -1, // unlimited
    maxSessions: -1, // unlimited
  },
}

export class UsageService {
  static async getCurrentUsage(userId: string) {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    let usage = await prisma.usage.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    })

    if (!usage) {
      usage = await prisma.usage.create({
        data: {
          userId,
          month,
          year,
        },
      })
    }

    return usage
  }

  static async canUseFeature(
    userId: string,
    feature: keyof typeof PLAN_LIMITS.FREE,
    amount: number = 1
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionStatus: true },
    })

    if (!user) {
      return { allowed: false, reason: 'User not found' }
    }

    if (user.subscriptionStatus !== 'ACTIVE' && user.subscriptionPlan !== 'FREE') {
      return { allowed: false, reason: 'Subscription not active' }
    }

    const limits = PLAN_LIMITS[user.subscriptionPlan as SubscriptionPlan]
    const limit = limits[feature] as number

    if (limit === -1) {
      return { allowed: true } // unlimited
    }

    const usage = await this.getCurrentUsage(userId)
    const field = this.getUsageField(feature)
    const currentUsage = Number(usage[field] || 0)
    const remaining = limit - currentUsage

    if (currentUsage + amount > limit) {
      return {
        allowed: false,
        reason: `Monthly limit exceeded. You have used ${currentUsage}/${limit} ${feature}.`,
        remaining: Math.max(0, remaining),
      }
    }

    return { allowed: true, remaining: remaining - amount }
  }

  static async trackUsage(
    userId: string,
    feature: keyof typeof PLAN_LIMITS.FREE,
    amount: number = 1
  ): Promise<void> {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const field = this.getUsageField(feature)

    await prisma.usage.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      update: {
        [field]: {
          increment: amount,
        },
      },
      create: {
        userId,
        month,
        year,
        [field]: amount,
      },
    })
  }

  static async getSessionCount(userId: string): Promise<number> {
    return await prisma.userSession.count({
      where: { userId },
    })
  }

  static async canCreateSession(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionStatus: true },
    })

    if (!user) {
      return { allowed: false, reason: 'User not found' }
    }

    if (user.subscriptionStatus !== 'ACTIVE' && user.subscriptionPlan !== 'FREE') {
      return { allowed: false, reason: 'Subscription not active' }
    }

    const limits = PLAN_LIMITS[user.subscriptionPlan as SubscriptionPlan]
    const maxSessions = limits.maxSessions

    if (maxSessions === -1) {
      return { allowed: true } // unlimited
    }

    if (maxSessions === 0) {
      return { allowed: false, reason: 'Session saving not available in your plan' }
    }

    const currentSessions = await this.getSessionCount(userId)

    if (currentSessions >= maxSessions) {
      return {
        allowed: false,
        reason: `Session limit reached. You have ${currentSessions}/${maxSessions} sessions.`,
      }
    }

    return { allowed: true }
  }

  private static getUsageField(feature: keyof typeof PLAN_LIMITS.FREE): keyof typeof prisma.usage.fields {
    const fieldMap = {
      questionsPerMonth: 'questionsGenerated',
      aiAnswersPerMonth: 'aiAnswersGenerated',
      resumeUploadsPerMonth: 'resumeUploads',
      pdfExportsPerMonth: 'pdfExports',
      mockInterviewsPerMonth: 'mockInterviews',
      maxSessions: 'questionsGenerated', // Not tracked in usage table
    } as const

    return fieldMap[feature] as keyof typeof prisma.usage.fields
  }

  static getPlanLimits(plan: SubscriptionPlan) {
    return PLAN_LIMITS[plan]
  }
}