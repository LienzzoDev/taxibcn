import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Falta la firma de Stripe' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error verificando webhook de Stripe:', message)
    return NextResponse.json(
      { error: `Firma inválida: ${message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Pago exitoso: ${paymentIntent.id}`)

        await prisma.booking.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { paymentStatus: 'PAID' },
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error(`Pago fallido: ${paymentIntent.id}`)

        await prisma.booking.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: { paymentStatus: 'FAILED' },
        })
        break
      }

      default:
        console.log(`Evento no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando el evento' },
      { status: 500 }
    )
  }
}
