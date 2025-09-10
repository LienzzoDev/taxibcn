"use client"

import { CheckCircle, Clock, Car, MapPin, Phone, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

interface BookingDetails {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  pickupAddress: string
  destinationAddress: string
  timing: string
  scheduledDate?: string
  scheduledTime?: string
  totalAmount: number
  paymentMethod: string
  distance?: number
  duration?: number
  vehicleType: string
  passengers: string
  hasLuggage: boolean
  luggageCount?: number
  isAirport: boolean
  flightNumber?: string
  isPort: boolean
  portInfo?: string
}

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON')
        }
        
        const result = await response.json()
        
        if (result.success) {
          setBooking(result.booking)
        } else {
          console.error('Error fetching booking:', result.error)
          setBooking(null)
        }
      } catch (error) {
        console.error('Error fetching booking:', error)
        setBooking(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed7e00] mx-auto mb-4"></div>
          <p className="text-[#646464]">Cargando detalles de la reserva...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#646464] mb-4">No se encontró la reserva</p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isScheduled = booking.timing === 'scheduled'

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-[#f8f8f8] py-4">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center">
            <Image
              src="/pidetaxibcn.com.svg"
              alt="PideTaxiBcn.com"
              width={190}
              height={25}
              className="mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          {/* Success Icon and Title */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-[#1c1b1f] text-2xl font-semibold mb-2">
              ¡Reserva confirmada!
            </h1>
            <p className="text-[#646464] text-sm">
              Tu reserva se ha procesado correctamente
            </p>
          </div>

          {/* Booking ID */}
          <div className="bg-[#f8f8f8] rounded-lg p-4 mb-6 text-center">
            <p className="text-[#646464] text-sm mb-1">ID de reserva</p>
            <p className="text-[#1c1b1f] text-lg font-mono font-semibold">{booking.id}</p>
          </div>

          {/* Status Message */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {isScheduled ? (
                  <>
                    <Calendar className="w-6 h-6 text-[#ed7e00]" />
                    <div>
                      <p className="text-[#1c1b1f] font-medium">Viaje programado</p>
                      <p className="text-[#646464] text-sm">
                        Tu taxi estará listo el {booking.scheduledDate} a las {booking.scheduledTime}
                      </p>
                      <p className="text-[#646464] text-xs mt-1">
                        Recibirás una confirmación 30 minutos antes del viaje
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Car className="w-6 h-6 text-[#ed7e00]" />
                    <div>
                      <p className="text-[#1c1b1f] font-medium">Tu conductor está en camino</p>
                      <p className="text-[#646464] text-sm">
                        Tiempo estimado de llegada: 5-10 minutos
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trip Details */}
          <div className="space-y-4 mb-6">
            <h3 className="text-[#1c1b1f] text-lg font-medium">Detalles del viaje</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-[#646464] text-sm">Recogida</p>
                  <p className="text-[#1c1b1f] font-medium">{booking.pickupAddress}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-[#646464] text-sm">Destino</p>
                  <p className="text-[#1c1b1f] font-medium">{booking.destinationAddress}</p>
                </div>
              </div>

              {booking.distance && booking.duration && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[#646464]" />
                  <p className="text-[#646464] text-sm">
                    {booking.distance}km • {booking.duration} minutos aproximadamente
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {(booking.isAirport || booking.isPort || booking.hasLuggage) && (
            <div className="space-y-2 mb-6">
              <h4 className="text-[#1c1b1f] font-medium">Información adicional</h4>
              {booking.isAirport && booking.flightNumber && (
                <p className="text-[#646464] text-sm">✈️ Vuelo: {booking.flightNumber}</p>
              )}
              {booking.isPort && booking.portInfo && (
                <p className="text-[#646464] text-sm">🚢 Puerto: {booking.portInfo}</p>
              )}
              {booking.hasLuggage && (
                <p className="text-[#646464] text-sm">🧳 Maletas: {booking.luggageCount || 1}</p>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className="border-t border-[#dcdcdc] pt-6 mb-6">
            <h4 className="text-[#1c1b1f] font-medium mb-3">Datos de contacto</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#646464]" />
                <p className="text-[#646464] text-sm">{booking.phone}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#646464]" />
                <p className="text-[#646464] text-sm">{booking.email}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-[#f8f8f8] rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#646464] text-sm">Total pagado</p>
                <p className="text-[#1c1b1f] text-xl font-bold">{booking.totalAmount.toFixed(2)}€</p>
              </div>
              <div className="text-right">
                <p className="text-[#646464] text-sm">Método de pago</p>
                <p className="text-[#1c1b1f] font-medium">
                  {booking.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-[#ed7e00] hover:bg-[#d16d00] text-white">
                Nueva reserva
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => window.print()}>
              Imprimir confirmación
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-[#646464] text-xs">© Copyright 2025. All rights reserved</p>
          <div className="flex justify-center space-x-1 text-[#646464] text-xs">
            <span>Aviso Legal</span>
            <span>|</span>
            <span>Accesibilidad</span>
            <span>|</span>
            <span>Privacidad</span>
            <span>|</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed7e00] mx-auto mb-4"></div>
          <p className="text-[#646464]">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}