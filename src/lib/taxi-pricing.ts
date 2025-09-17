// Configuración de precios para taxis en Barcelona
export const PRICING_CONFIG = {
  baseFare: 2.50, // Tarifa base
  pricePerKm: 1.00, // Precio por kilómetro (+1€ por km)
  extraLuggageFee: 10.00, // Suplemento por más de 2 maletas
  largeGroupSurcharge: 5.00, // Suplemento para más de 4 pasajeros
  accessibleVehicleFee: 2.00, // Suplemento vehículo accesible (PMR)
  childSeatFee: 3.00, // Suplemento sillas infantiles
  nightSurcharge: 10.00, // Suplemento viajes nocturnos (22:00-06:00)
  minimumFare: 5.00, // Tarifa mínima
}

export interface TripCalculation {
  distance: number // en kilómetros
  duration: number // en minutos (solo para mostrar)
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

export function calculateTripPrice(
  distance: number, // km
  duration: number, // minutos
  options: {
    isAirport?: boolean
    isPort?: boolean
    hasLuggage?: boolean
    luggageCount?: number
    vehicleType?: string
    needsChildSeat?: boolean
    passengerGroup?: string
    scheduledDateTime?: Date
  } = {}
): TripCalculation {
  const { 
    isAirport, 
    isPort, 
    hasLuggage, 
    luggageCount = 0,
    vehicleType = 'standard',
    needsChildSeat = false,
    passengerGroup = '4-or-less',
    scheduledDateTime
  } = options

  let baseFare = PRICING_CONFIG.baseFare
  let distanceFare = distance * PRICING_CONFIG.pricePerKm
  let surcharges = 0

  // Los transportes desde aeropuerto y puerto no llevan suplemento

  // Suplemento por maletas (solo si hay más de 2)
  if (hasLuggage && luggageCount > 2) {
    surcharges += PRICING_CONFIG.extraLuggageFee
  }

  // Suplemento por grupo grande
  if (passengerGroup === 'more-than-4') {
    surcharges += PRICING_CONFIG.largeGroupSurcharge
  }

  // Suplementos por tipo de vehículo
  if (vehicleType === 'accessible') {
    surcharges += PRICING_CONFIG.accessibleVehicleFee
  }

  // Suplemento por silla de bebé (opción independiente)
  if (needsChildSeat) {
    surcharges += PRICING_CONFIG.childSeatFee
  }

  // Suplemento nocturno
  if (scheduledDateTime && isNightTime(scheduledDateTime)) {
    surcharges += PRICING_CONFIG.nightSurcharge
  }

  let subtotal = baseFare + distanceFare + surcharges

  // Tarifa mínima
  const total = Math.max(subtotal, PRICING_CONFIG.minimumFare)

  return {
    distance,
    duration,
    baseFare,
    distanceFare,
    surcharges,
    total: Math.round(total * 100) / 100 // Redondear a 2 decimales
  }
}