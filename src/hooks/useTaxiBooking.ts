"use client"

import { useState, useEffect } from "react"
import { calculateTripPrice, type TripCalculation } from "@/lib/taxi-pricing"

// Función para obtener configuración dinámica
async function getDynamicPricingConfig() {
  try {
    const response = await fetch('/api/admin/pricing')
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return result.config
      }
    }
  } catch (error) {
    // Silenciar error y usar configuración por defecto
  }
  
  // Fallback a configuración por defecto
  return {
    baseFare: 2.50,
    pricePerKm: 1.00,
    extraLuggageFee: 10.00,
    largeGroupSurcharge: 5.00,
    accessibleVehicleFee: 2.00,
    childSeatFee: 3.00,
    nightSurcharge: 10.00,
    minimumFare: 5.00
  }
}

// Función de cálculo con configuración dinámica
async function calculateTripPriceWithConfig(
  distance: number,
  duration: number,
  options: any = {}
): Promise<TripCalculation> {
  const config = await getDynamicPricingConfig()
  
  const { 
    isAirport, 
    isPort, 
    hasLuggage, 
    luggageCount = 0,
    vehicleType = 'standard', 
    passengerGroup = '4-or-less',
    scheduledDateTime
  } = options

  let baseFare = config.baseFare
  let distanceFare = distance * config.pricePerKm
  let surcharges = 0

  // Suplemento por maletas (solo si hay más de 2)
  if (hasLuggage && luggageCount > 2) {
    surcharges += config.extraLuggageFee
  }

  // Suplemento por grupo grande
  if (passengerGroup === 'more-than-4') {
    surcharges += config.largeGroupSurcharge
  }

  // Suplementos por tipo de vehículo
  if (vehicleType === 'accessible') {
    surcharges += config.accessibleVehicleFee
  }

  // Suplemento por silla de bebé (opción independiente)
  if (options.needsChildSeat) {
    surcharges += config.childSeatFee
  }

  // Suplemento nocturno
  if (scheduledDateTime && isNightTime(scheduledDateTime)) {
    surcharges += config.nightSurcharge
  }

  let subtotal = baseFare + distanceFare + surcharges
  const total = Math.max(subtotal, config.minimumFare)

  return {
    distance,
    duration,
    baseFare,
    distanceFare,
    surcharges,
    total: Math.round(total * 100) / 100
  }
}

function isNightTime(date: Date): boolean {
  const hour = date.getHours()
  return hour >= 22 || hour < 6
}

export interface BookingFormData {
  // Datos de contacto
  firstName: string
  lastName: string
  phone: string
  email: string
  
  // Trayecto
  pickupAddress: string
  destinationAddress: string
  pickupCoords?: { lat: number; lng: number }
  destinationCoords?: { lat: number; lng: number }
  
  // Configuración del viaje
  passengers: string
  vehicleType: string
  needsChildSeat: boolean
  hasLuggage: boolean
  luggageCount: string
  timing: string
  scheduledDate?: string
  scheduledTime?: string
  
  // Opciones especiales
  isAirport: boolean
  flightNumber?: string
  isPort: boolean
  portInfo?: string // Número de crucero/naviera o terminal
  needsReturnTrip: boolean
  returnDate?: string
  returnTime?: string
  hasObservations: boolean
  observations?: string
  
  // Pago
  paymentMethod: string
  acceptsPrivacy: boolean
}

export function useTaxiBooking() {
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    pickupAddress: "",
    destinationAddress: "",
    passengers: "4-or-less",
    vehicleType: "standard",
    needsChildSeat: false,
    hasLuggage: false,
    luggageCount: "1",
    timing: "now",
    isAirport: false,
    isPort: false,
    needsReturnTrip: false,
    hasObservations: false,
    paymentMethod: "card",
    acceptsPrivacy: true,
  })

  const [tripCalculation, setTripCalculation] = useState<TripCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Función para actualizar campos del formulario
  const updateField = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Función para calcular distancia usando Google Maps
  const calculateDistance = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{ distance: number; duration: number } | null> => {
    if (typeof google === 'undefined' || !google.maps) {
      console.warn('Google Maps API no disponible')
      return null
    }

    return new Promise((resolve) => {
      const service = new google.maps.DistanceMatrixService()
      
      service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const element = response.rows[0]?.elements[0]
          
          if (element && element.status === 'OK') {
            const distanceKm = element.distance!.value / 1000 // Convertir a km
            const durationMin = element.duration!.value / 60 // Convertir a minutos
            
            resolve({
              distance: Math.round(distanceKm * 100) / 100,
              duration: Math.round(durationMin)
            })
          } else {
            resolve(null)
          }
        } else {
          resolve(null)
        }
      })
    })
  }

  // Recalcular precio cuando cambien los datos relevantes
  useEffect(() => {
    const recalculatePrice = async () => {
      if (!formData.pickupCoords || !formData.destinationCoords) {
        // Si no hay coordenadas, usar valores estimados
        const estimatedDistance = 5 // km estimados
        const estimatedDuration = 15 // minutos estimados
        
        // Crear fecha programada si aplica
        let scheduledDateTime: Date | undefined
        if (formData.timing === 'scheduled' && formData.scheduledDate && formData.scheduledTime) {
          scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        }

        const calculation = await calculateTripPriceWithConfig(estimatedDistance, estimatedDuration, {
          isAirport: formData.isAirport,
          isPort: formData.isPort,
          hasLuggage: formData.hasLuggage,
          luggageCount: formData.hasLuggage ? parseInt(formData.luggageCount) : 0,
          vehicleType: formData.vehicleType,
          needsChildSeat: formData.needsChildSeat,
          passengerGroup: formData.passengers,
          scheduledDateTime
        })
        
        setTripCalculation(calculation)
        return
      }

      setIsCalculating(true)
      
      try {
        const result = await calculateDistance(
          formData.pickupCoords,
          formData.destinationCoords
        )
        
        if (result) {
          // Crear fecha programada si aplica
          let scheduledDateTime: Date | undefined
          if (formData.timing === 'scheduled' && formData.scheduledDate && formData.scheduledTime) {
            scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
          }

          const calculation = await calculateTripPriceWithConfig(result.distance, result.duration, {
            isAirport: formData.isAirport,
            isPort: formData.isPort,
            hasLuggage: formData.hasLuggage,
            luggageCount: formData.hasLuggage ? parseInt(formData.luggageCount) : 0,
            vehicleType: formData.vehicleType,
            needsChildSeat: formData.needsChildSeat,
            passengerGroup: formData.passengers,
            scheduledDateTime
          })
          
          setTripCalculation(calculation)
        }
      } catch (error) {
        console.error('Error calculando distancia:', error)
      } finally {
        setIsCalculating(false)
      }
    }

    recalculatePrice()
  }, [
    formData.pickupCoords,
    formData.destinationCoords,
    formData.isAirport,
    formData.isPort,
    formData.hasLuggage,
    formData.luggageCount,
    formData.vehicleType,
    formData.needsChildSeat,
    formData.passengers,
    formData.timing,
    formData.scheduledDate,
    formData.scheduledTime
  ])

  // Función para guardar la reserva en la base de datos
  const saveBooking = async () => {
    if (!tripCalculation) return null

    try {
      const bookingPayload = {
        ...formData,
        totalAmount: tripCalculation.total,
        distance: tripCalculation.distance,
        duration: tripCalculation.duration,
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      })

      const result = await response.json()
      
      if (result.success) {
        return result.rideId
      } else {
        throw new Error(result.error || 'Error al guardar la reserva')
      }
    } catch (error) {
      console.error('Error saving booking:', error)
      throw error
    }
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      alert('Por favor, completa todos los datos de contacto')
      return false
    }
    
    if (!formData.pickupAddress || !formData.destinationAddress) {
      alert('Por favor, especifica las direcciones de recogida y destino')
      return false
    }
    
    if (formData.timing === 'scheduled' && (!formData.scheduledDate || !formData.scheduledTime)) {
      alert('Por favor, especifica la fecha y hora para el viaje programado')
      return false
    }
    
    if (formData.isAirport && !formData.flightNumber) {
      alert('Por favor, especifica el número de vuelo')
      return false
    }
    
    if (formData.isPort && !formData.portInfo) {
      alert('Por favor, especifica el número de crucero, naviera o terminal')
      return false
    }
    
    if (formData.needsReturnTrip && (!formData.returnDate || !formData.returnTime)) {
      alert('Por favor, especifica la fecha y hora del viaje de vuelta')
      return false
    }
    
    if (!formData.acceptsPrivacy) {
      alert('Debes aceptar la política de privacidad')
      return false
    }

    // Para pago en efectivo, guardar reserva inmediatamente
    if (formData.paymentMethod === 'cash') {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData,
            tripCalculation,
            paymentIntentId: null
          })
        })

        const result = await response.json()
        
        if (result.success) {
          // Redirigir a la página de confirmación
          window.location.href = `/confirmacion?id=${result.bookingId}`
          return true
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        alert('Error al guardar la reserva. Por favor, inténtalo de nuevo.')
        return false
      }
    }
    
    // Para pago con tarjeta, solo validar (se guardará después del pago)
    return Promise.resolve(true)
  }

  return {
    formData,
    updateField,
    tripCalculation,
    isCalculating,
    handleSubmit,
    saveBooking
  }
}