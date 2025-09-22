import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          const userId = session.metadata?.userId

          if (userId && subscriptionId) {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            
            // Map price ID to plan name
            const priceId = subscription.items.data[0]?.price.id
            const planName = getPlanFromPriceId(priceId)

            if (planName) {
              await prisma.user.update({
                where: { id: userId },
                data: {
                  stripeSubscriptionId: subscriptionId,
                  subscriptionPlan: planName,
                  subscriptionStatus: 'ACTIVE',
                  currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                },
              })
            }
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          })

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: 'ACTIVE',
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              },
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string

        if (subscriptionId) {
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          })

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: 'PAST_DUE',
              },
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionPlan: 'FREE',
              subscriptionStatus: 'ACTIVE', // Free users are always active
              stripeSubscriptionId: null,
              currentPeriodEnd: null,
            },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (user) {
          const priceId = subscription.items.data[0]?.price.id
          const planName = getPlanFromPriceId(priceId)
          
          if (planName) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionPlan: planName,
                subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 
                                 subscription.status === 'past_due' ? 'PAST_DUE' :
                                 subscription.status === 'canceled' ? 'CANCELED' :
                                 subscription.status === 'unpaid' ? 'UNPAID' : 'INACTIVE',
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              },
            })
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

function getPlanFromPriceId(priceId: string): 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | null {
  const priceIdMap = {
    [process.env.STRIPE_STARTER_PRICE_ID || 'price_starter']: 'STARTER' as const,
    [process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional']: 'PROFESSIONAL' as const,
    [process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise']: 'ENTERPRISE' as const,
  }

  return priceIdMap[priceId] || null
}