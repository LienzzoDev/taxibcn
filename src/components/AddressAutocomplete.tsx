"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface AddressAutocompleteProps {
  placeholder: string
  value: string
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void
  className?: string
}

// Direcciones de ejemplo para Barcelona
const BARCELONA_SUGGESTIONS = [
  "Plaça de Catalunya, Barcelona, España",
  "Sagrada Família, Barcelona, España", 
  "Park Güell, Barcelona, España",
  "Las Ramblas, Barcelona, España",
  "Aeropuerto de Barcelona-El Prat, El Prat de Llobregat, España",
  "Puerto de Barcelona, Barcelona, España",
  "Estación de Sants, Barcelona, España",
  "Plaza España, Barcelona, España",
  "Passeig de Gràcia, Barcelona, España",
  "Barrio Gótico, Barcelona, España"
]

export function AddressAutocomplete({ 
  placeholder, 
  value, 
  onChange, 
  className 
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  // Verificar si Google Maps está disponible
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        setIsGoogleMapsLoaded(true)
        initializeGoogleAutocomplete()
      }
    }

    // Verificar inmediatamente
    checkGoogleMaps()

    // Verificar cada segundo hasta que esté disponible
    const interval = setInterval(() => {
      if (!isGoogleMapsLoaded) {
        checkGoogleMaps()
      } else {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isGoogleMapsLoaded])

  const initializeGoogleAutocomplete = () => {
    if (!inputRef.current || !google.maps) return

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'es' },
        fields: ['formatted_address', 'geometry', 'place_id', 'name']
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.formatted_address) {
          onChange(place.formatted_address, place)
          setShowSuggestions(false)
        }
      })
    } catch (error) {
      console.error('Error inicializando Google Places:', error)
    }
  }

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue)
    
    if (!isGoogleMapsLoaded && inputValue.length > 2) {
      // Filtrar sugerencias locales si Google Maps no está disponible
      const filtered = BARCELONA_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
      setShowSuggestions(true)
    } else if (inputValue.length === 0) {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
    
    // Simular coordenadas para Barcelona (esto se reemplazará con Google Maps)
    const mockPlaceDetails = {
      formatted_address: suggestion,
      geometry: {
        location: {
          lat: () => 41.3851 + (Math.random() - 0.5) * 0.1,
          lng: () => 2.1734 + (Math.random() - 0.5) * 0.1
        }
      }
    } as google.maps.places.PlaceResult
    
    onChange(suggestion, mockPlaceDetails)
  }

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ed7e00]" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (!isGoogleMapsLoaded && value.length > 2) {
            setShowSuggestions(true)
          }
        }}
        onBlur={() => {
          // Delay para permitir clicks en sugerencias
          setTimeout(() => setShowSuggestions(false), 200)
        }}
        className={`pl-10 ${className}`}
      />
      
      {/* Sugerencias locales cuando Google Maps no está disponible */}
      {!isGoogleMapsLoaded && showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[#dcdcdc] rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#646464]"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      {/* Indicador de estado */}
      {!isGoogleMapsLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Usando sugerencias locales - Configure Google Maps API para autocompletado completo" />
        </div>
      )}
    </div>
  )
}