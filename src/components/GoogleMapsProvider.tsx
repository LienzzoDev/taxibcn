"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface GoogleMapsContextType {
  isLoaded: boolean
  loadError: string | null
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: null
})

export const useGoogleMaps = () => useContext(GoogleMapsContext)

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si ya está cargado
    if (typeof google !== 'undefined' && google.maps) {
      setIsLoaded(true)
      return
    }

    // Verificar si ya existe el script
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Esperar a que se cargue
      const checkLoaded = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          setIsLoaded(true)
          clearInterval(checkLoaded)
        }
      }, 100)
      
      setTimeout(() => {
        clearInterval(checkLoaded)
        if (!isLoaded) {
          setLoadError('Timeout cargando Google Maps')
        }
      }, 10000)
      
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setLoadError('Google Maps API key no configurada')
      console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está configurada')
      return
    }

    // Cargar el script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    // Callback global
    ;(window as any).initGoogleMaps = () => {
      setIsLoaded(true)
      delete (window as any).initGoogleMaps
    }

    script.onerror = () => {
      setLoadError('Error cargando Google Maps API')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.remove()
      }
      delete (window as any).initGoogleMaps
    }
  }, [])

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  )
}