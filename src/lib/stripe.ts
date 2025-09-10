import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Cliente de Stripe para el frontend
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Servidor de Stripe para el backend
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})