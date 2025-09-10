import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: params.id
      }
    })

    if (!booking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reserva no encontrada' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking
    })

  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la reserva' 
      },
      { status: 500 }
    )
  }
}