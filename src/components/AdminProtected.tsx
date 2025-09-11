"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminProtectedProps {
  children: React.ReactNode
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        setIsAuthenticated(false)
        return
      }
      
      // Verificar si el token no ha expirado
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        
        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem('adminToken')
          router.push('/admin/login')
          setIsAuthenticated(false)
          return
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('adminToken')
        router.push('/admin/login')
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [router])

  // Mostrar loading mientras verificamos la autenticación
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#ed7e00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#646464]">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no renderizar nada (ya se redirigió)
  if (!isAuthenticated) {
    return null
  }

  // Si está autenticado, renderizar el contenido
  return <>{children}</>
}