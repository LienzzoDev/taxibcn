import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'eur', bookingData } = await request.json()

    // Crear el payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      metadata: {
        bookingId: bookingData?.id || 'temp',
        pickupAddress: bookingData?.pickupAddress || '',
        destinationAddress: bookingData?.destinationAddress || '',
        passengerName: `${bookingData?.firstName || ''} ${bookingData?.lastName || ''}`.trim(),
        phone: bookingData?.phone || '',
        email: bookingData?.email || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    )
  }
}