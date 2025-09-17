import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminToken } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      formData,
      tripCalculation,
      paymentIntentId
    } = data

    // Crear la reserva en la base de datos
    const booking = await prisma.booking.create({
      data: {
        // Datos del pasajero
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        
        // Trayecto
        pickupAddress: formData.pickupAddress,
        pickupLatitude: formData.pickupCoords?.lat,
        pickupLongitude: formData.pickupCoords?.lng,
        destinationAddress: formData.destinationAddress,
        destinationLatitude: formData.destinationCoords?.lat,
        destinationLongitude: formData.destinationCoords?.lng,
        
        // Configuración del viaje
        passengers: formData.passengers,
        vehicleType: formData.vehicleType,
        needsChildSeat: formData.needsChildSeat || false,
        hasLuggage: formData.hasLuggage,
        luggageCount: formData.hasLuggage ? parseInt(formData.luggageCount) : null,
        
        // Programación
        timing: formData.timing,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        
        // Opciones especiales
        isAirport: formData.isAirport,
        flightNumber: formData.flightNumber,
        isPort: formData.isPort,
        portInfo: formData.portInfo,
        needsReturnTrip: formData.needsReturnTrip || false,
        returnDate: formData.returnDate,
        returnTime: formData.returnTime,
        hasObservations: formData.hasObservations,
        observations: formData.observations,
        
        // Pago
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'card' ? 'PAID' : 'PENDING',
        stripePaymentId: paymentIntentId,
        
        // Precio
        distance: tripCalculation?.distance,
        duration: tripCalculation?.duration,
        baseFare: tripCalculation?.baseFare || 0,
        distanceFare: tripCalculation?.distanceFare || 0,
        surcharges: tripCalculation?.surcharges || 0,
        totalAmount: tripCalculation?.total || 0,
        
        // Estado
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Reserva creada exitosamente'
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la reserva' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autorización requerido' 
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token inválido' 
        },
        { status: 401 }
      )
    }

    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      bookings
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las reservas' 
      },
      { status: 500 }
    )
  }
}