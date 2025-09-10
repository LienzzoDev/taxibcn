import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/adminAuth'
import fs from 'fs'
import path from 'path'

// Ruta del archivo de configuración
const CONFIG_FILE = path.join(process.cwd(), 'src/lib/pricing-config.json')

// Configuración por defecto
const DEFAULT_CONFIG = {
  baseFare: 2.50,
  pricePerKm: 1.00,
  extraLuggageFee: 10.00,
  largeGroupSurcharge: 5.00,
  accessibleVehicleFee: 2.00,
  childSeatFee: 3.00,
  nightSurcharge: 10.00,
  minimumFare: 5.00
}

// Función para leer la configuración
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8')
      return JSON.parse(data)
    }
    return DEFAULT_CONFIG
  } catch (error) {
    console.error('Error reading config:', error)
    return DEFAULT_CONFIG
  }
}

// Función para escribir la configuración
function writeConfig(config: any) {
  try {
    // Crear directorio si no existe
    const dir = path.dirname(CONFIG_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error('Error writing config:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // Para GET, verificar autenticación solo si hay header de autorización
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
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
    }

    const config = readConfig()

    return NextResponse.json({
      success: true,
      config
    })

  } catch (error) {
    console.error('Error fetching pricing config:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la configuración' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const newConfig = await request.json()

    // Validar que todos los valores sean números positivos
    const requiredFields = [
      'baseFare', 'pricePerKm', 'extraLuggageFee', 'largeGroupSurcharge',
      'accessibleVehicleFee', 'childSeatFee', 'nightSurcharge', 'minimumFare'
    ]

    for (const field of requiredFields) {
      if (typeof newConfig[field] !== 'number' || newConfig[field] < 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `El campo ${field} debe ser un número positivo` 
          },
          { status: 400 }
        )
      }
    }

    // Guardar la configuración
    const success = writeConfig(newConfig)

    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al guardar la configuración' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente'
    })

  } catch (error) {
    console.error('Error updating pricing config:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la configuración' 
      },
      { status: 500 }
    )
  }
}