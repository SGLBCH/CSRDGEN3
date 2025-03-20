import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-09-30.acacia' as Stripe.LatestApiVersion,
})

export const STRIPE_PLANS = {
  PREMIUM: {
    name: 'Premium',
    price_id: 'price_XXX', // TODO: Add your Stripe price ID here
    features: [
      'Full access to CSRD reports',
      'Advanced analytics',
      'Priority support',
      'Team collaboration',
    ],
  },
}

// Helper function to format prices
export const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount / 100)
} 