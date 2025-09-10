"use client"

import { MapPin, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"
import { GoogleMapsProvider } from "@/components/GoogleMapsProvider"
import { StripeCheckout } from "@/components/StripeCheckout"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTaxiBooking } from "@/hooks/useTaxiBooking"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"

function TaxiBookingForm() {
  const { formData, updateField, tripCalculation, isCalculating, handleSubmit, saveBooking } = useTaxiBooking()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const router = useRouter()

  const handleAddressChange = (field: 'pickupAddress' | 'destinationAddress') => 
    (value: string, placeDetails?: google.maps.places.PlaceResult) => {
      updateField(field, value)
      
      if (placeDetails?.geometry?.location) {
        const coords = {
          lat: placeDetails.geometry.location.lat(),
          lng: placeDetails.geometry.location.lng()
        }
        
        if (field === 'pickupAddress') {
          updateField('pickupCoords', coords)
        } else {
          updateField('destinationCoords', coords)
        }
      }
    }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulario primero
    const isValid = await handleSubmit()
    if (!isValid) return
    
    // Si es pago con tarjeta, abrir modal de Stripe
    if (formData.paymentMethod === 'card') {
      setShowPaymentModal(true)
    } else {
      // Para pago en efectivo, procesar directamente
      alert('¡Reserva confirmada! El pago se realizará en efectivo al conductor.')
    }
  }

  const handlePaymentSuccess = (bookingId: string) => {
    setShowPaymentModal(false)
    // Redirigir a la página de confirmación
    router.push(`/confirmacion?id=${bookingId}`)
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

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
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-[#1c1b1f] text-2xl font-semibold mb-4">
              Reserva online de taxi en Barcelona
            </h1>
            <p className="text-[#646464] text-sm leading-relaxed">
              Completa el siguiente formulario, haz tu reserva y tendrás tu transporte en tu ubicación cuando lo
              necesites.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Contact Data */}
            <div>
              <h3 className="text-[#1c1b1f] text-sm font-medium mb-4">Datos de contacto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464]"
                  required
                />
                <Input
                  placeholder="Apellidos"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Teléfono"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464]"
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464]"
                  required
                />
              </div>
            </div>

            {/* Route Selection */}
            <div>
              <h3 className="text-[#1c1b1f] text-sm font-medium mb-4">Seleccionar trayecto</h3>
              <div className="space-y-4">
                <AddressAutocomplete
                  placeholder="Dirección de recogida"
                  value={formData.pickupAddress}
                  onChange={handleAddressChange('pickupAddress')}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464] w-full"
                />
                <AddressAutocomplete
                  placeholder="Dirección de destino"
                  value={formData.destinationAddress}
                  onChange={handleAddressChange('destinationAddress')}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464] w-full"
                />
              </div>
            </div>

            {/* Passengers and Vehicle - 50% each in same row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Passengers - 50% */}
              <div>
                <h3 className="text-[#1c1b1f] text-sm font-medium mb-4">Pasajeros</h3>
                <Select value={formData.passengers} onValueChange={(value) => updateField('passengers', value)}>
                  <SelectTrigger className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] !w-full">
                    <SelectValue placeholder="4 o menos pasajeros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4-or-less">4 o menos pasajeros</SelectItem>
                    <SelectItem value="more-than-4">Más de 4 pasajeros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Type - 50% */}
              <div>
                <h3 className="text-[#1c1b1f] text-sm font-medium mb-4">Vehículo</h3>
                <Select value={formData.vehicleType} onValueChange={(value) => updateField('vehicleType', value)}>
                  <SelectTrigger className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] !w-full">
                    <SelectValue placeholder="Vehículo estándar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Vehículo estándar</SelectItem>
                    <SelectItem value="accessible">Vehículo accesible (PMR)</SelectItem>
                    <SelectItem value="child-seats">Sillas infantiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Luggage Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="luggage" 
                  className="border-[#dcdcdc]" 
                  checked={formData.hasLuggage}
                  onCheckedChange={(checked) => updateField('hasLuggage', checked)}
                />
                <label htmlFor="luggage" className="text-[#646464] text-sm">
                  ¿Llevas maletas?
                </label>
              </div>
              {formData.hasLuggage && (
                <Select value={formData.luggageCount} onValueChange={(value) => updateField('luggageCount', value)}>
                  <SelectTrigger className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] w-full">
                    <SelectValue placeholder="Número de maletas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 maleta</SelectItem>
                    <SelectItem value="2">2 maletas</SelectItem>
                    <SelectItem value="3">3 maletas</SelectItem>
                    <SelectItem value="4">4 maletas</SelectItem>
                    <SelectItem value="5">5+ maletas</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Trip Timing - 100% width below */}
            <div>
              <h3 className="text-[#1c1b1f] text-sm font-medium mb-4">Viaje</h3>
              <div className="space-y-4">
                <Select value={formData.timing} onValueChange={(value) => updateField('timing', value)}>
                  <SelectTrigger className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] w-full">
                    <SelectValue placeholder="Necesito el taxi ya" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Necesito el taxi ya</SelectItem>
                    <SelectItem value="scheduled">Programar viaje</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.timing === 'scheduled' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      value={formData.scheduledDate || ''}
                      onChange={(e) => updateField('scheduledDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464]"
                      required
                    />
                    <Input
                      type="time"
                      value={formData.scheduledTime || ''}
                      onChange={(e) => updateField('scheduledTime', e.target.value)}
                      className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464]"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="airport" 
                  className="border-[#dcdcdc]" 
                  checked={formData.isAirport}
                  onCheckedChange={(checked) => {
                    updateField('isAirport', checked)
                    if (!checked) {
                      updateField('flightNumber', '')
                    }
                  }}
                />
                <label htmlFor="airport" className="text-[#646464] text-sm">
                  ¿El trasporte es desde el <span className="font-medium">aeropuerto</span>?
                </label>
              </div>
              {formData.isAirport && (
                <Input
                  placeholder="Número de vuelo (ej: IB6251, VY1234)"
                  value={formData.flightNumber || ''}
                  onChange={(e) => updateField('flightNumber', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464] ml-6 w-full"
                />
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="port" 
                  className="border-[#dcdcdc]" 
                  checked={formData.isPort}
                  onCheckedChange={(checked) => {
                    updateField('isPort', checked)
                    if (!checked) {
                      updateField('portInfo', '')
                    }
                  }}
                />
                <label htmlFor="port" className="text-[#646464] text-sm">
                  ¿El trasporte es desde el <span className="font-medium">puerto</span>?
                </label>
              </div>
              {formData.isPort && (
                <Input
                  placeholder="Número de crucero, naviera o terminal (ej: MSC Seaside, Terminal A)"
                  value={formData.portInfo || ''}
                  onChange={(e) => updateField('portInfo', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464] ml-6 w-full"
                />
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="observations" 
                  className="border-[#dcdcdc]" 
                  checked={formData.hasObservations}
                  onCheckedChange={(checked) => updateField('hasObservations', checked)}
                />
                <label htmlFor="observations" className="text-[#646464] text-sm">
                  Añadir observaciones
                </label>
              </div>
              {formData.hasObservations && (
                <Input
                  placeholder="Escribe tus observaciones aquí..."
                  value={formData.observations || ''}
                  onChange={(e) => updateField('observations', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] placeholder:text-[#646464] w-full"
                />
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-[#1c1b1f] text-sm font-medium mb-4">Forma de pago</h3>
              <Select value={formData.paymentMethod} onValueChange={(value) => updateField('paymentMethod', value)}>
                <SelectTrigger className="bg-[#f8f8f8] border-[#dcdcdc] text-[#646464] w-full">
                  <SelectValue placeholder="Pagar con tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Pagar con tarjeta</SelectItem>
                  <SelectItem value="cash">Pagar en efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="privacy" 
                className="border-[#dcdcdc] mt-0.5" 
                checked={formData.acceptsPrivacy}
                onCheckedChange={(checked) => updateField('acceptsPrivacy', checked)}
                required
              />
              <label htmlFor="privacy" className="text-[#646464] text-sm leading-relaxed">
                Acepto las <span className="font-medium">Política de privacidad</span> del sitio web.
              </label>
            </div>

            {/* Price and Book Button */}
            <div className="flex items-center justify-between pt-6 border-t border-[#dcdcdc]">
              <div>
                <p className="text-[#646464] text-sm mb-1">Precio viaje</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#1c1b1f] text-3xl font-bold">
                    {tripCalculation ? `${tripCalculation.total.toFixed(2)}€` : '---'}
                  </p>
                  {isCalculating && <Loader2 className="w-4 h-4 animate-spin text-[#ed7e00]" />}
                </div>

              </div>
              <Button 
                type="submit"
                className="bg-[#ed7e00] hover:bg-[#d16d00] text-white px-8 py-3 rounded-md font-medium"
                disabled={!formData.acceptsPrivacy || !tripCalculation}
              >
                <Lock className="w-4 h-4 mr-2" />
                Reservar y pagar
              </Button>
            </div>
          </form>
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

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar con tarjeta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{paymentError}</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Resumen del viaje</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Desde:</strong> {formData.pickupAddress}</p>
                <p><strong>Hasta:</strong> {formData.destinationAddress}</p>
                {tripCalculation && (
                  <>
                    <p><strong>Distancia:</strong> {tripCalculation.distance}km</p>
                    <p><strong>Total:</strong> {tripCalculation.total.toFixed(2)}€</p>
                  </>
                )}
              </div>
            </div>

            {tripCalculation && (
              <StripeCheckout
                amount={tripCalculation.total}
                bookingData={formData}
                tripCalculation={tripCalculation}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function TaxiBookingPage() {
  return (
    <GoogleMapsProvider>
      <TaxiBookingForm />
    </GoogleMapsProvider>
  )
}