"use client"

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  amount: number
  bookingData: any
  tripCalculation: any
  onSuccess: (bookingId: string) => void
  onError: (error: string) => void
}

function CheckoutForm({ amount, bookingData, tripCalculation, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    // Crear payment intent cuando se monta el componente
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        bookingData,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          onError('Error al inicializar el pago')
        }
      })
      .catch(() => {
        onError('Error al conectar con el servidor de pagos')
      })
  }, [amount, bookingData])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsLoading(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      onError('Error al cargar el formulario de pago')
      setIsLoading(false)
      return
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${bookingData.firstName} ${bookingData.lastName}`,
          email: bookingData.email,
          phone: bookingData.phone,
        },
      },
    })

    setIsLoading(false)

    if (error) {
      onError(error.message || 'Error en el pago')
    } else if (paymentIntent.status === 'succeeded') {
      // Guardar la reserva en la base de datos después del pago exitoso
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData: bookingData,
            tripCalculation,
            paymentIntentId: paymentIntent.id
          })
        })

        const result = await response.json()
        
        if (result.success) {
          onSuccess(result.bookingId)
        } else {
          onError('Error al guardar la reserva')
        }
      } catch (error) {
        onError('Error al procesar la reserva')
      }
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-[#dcdcdc] rounded-md bg-[#f8f8f8]">
        <CardElement options={cardElementOptions} />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || !clientSecret || isLoading}
        className="w-full bg-[#ed7e00] hover:bg-[#d16d00] text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar {amount.toFixed(2)}€
          </>
        )}
      </Button>
    </form>
  )
}

interface StripeCheckoutProps {
  amount: number
  bookingData: any
  tripCalculation: any
  onSuccess: (bookingId: string) => void
  onError: (error: string) => void
}

export function StripeCheckout({ amount, bookingData, tripCalculation, onSuccess, onError }: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        bookingData={bookingData}
        tripCalculation={tripCalculation}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}