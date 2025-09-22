import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

export const STRIPE_PRICE_IDS = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
  PROFESSIONAL: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
} as const