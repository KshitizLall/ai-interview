import 'next-auth'
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscriptionPlan?: SubscriptionPlan
      subscriptionStatus?: SubscriptionStatus
      currentPeriodEnd?: Date | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    subscriptionPlan?: SubscriptionPlan
    subscriptionStatus?: SubscriptionStatus
    currentPeriodEnd?: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}