import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Credenciales hardcodeadas para simplicidad (en producción usar base de datos)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Verificar credenciales
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Credenciales incorrectas' 
        },
        { status: 401 }
      )
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        username,
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    )

    return NextResponse.json({
      success: true,
      token,
      message: 'Login exitoso'
    })

  } catch (error) {
    console.error('Error in admin login:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}