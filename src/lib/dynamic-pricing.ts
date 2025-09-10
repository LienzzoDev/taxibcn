// Función para obtener la configuración de precios desde el servidor
async function fetchPricingConfig() {
  try {
    // En el cliente, intentamos obtener la configuración
    const response = await fetch('/api/admin/pricing')
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return result.config
      }
    }
  } catch (error) {
    console.error('Error fetching pricing config:', error)
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

export interface TripCalculation {
  distance: number
  duration: number
  baseFare: number
  distanceFare: number
  surcharges: number
  total: number
}

// Función para verificar si es horario nocturno (22:00 - 06:00)
export function isNightTime(date: Date): boolean {
  const hour = date.getHours()
  return hour >= 22 || hour < 6
}

export async function calculateTripPriceDynamic(
  distance: number,
  duration: number,
  options: {
    isAirport?: boolean
    isPort?: boolean
    hasLuggage?: boolean
    luggageCount?: number
    vehicleType?: string
    passengerGroup?: string
    scheduledDateTime?: Date
  } = {}
): Promise<TripCalculation> {
  const config = await fetchPricingConfig()
  
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

  // Los transportes desde aeropuerto y puerto no llevan suplemento

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
  } else if (vehicleType === 'child-seats') {
    surcharges += config.childSeatFee
  }

  // Suplemento nocturno
  if (scheduledDateTime && isNightTime(scheduledDateTime)) {
    surcharges += config.nightSurcharge
  }

  let subtotal = baseFare + distanceFare + surcharges

  // Tarifa mínima
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