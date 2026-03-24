"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin } from "lucide-react"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
}

interface AddressAutocompleteProps {
  placeholder: string
  value: string
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void
  className?: string
}

export function AddressAutocomplete({
  placeholder,
  value,
  onChange,
  className
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=es&viewbox=0.5,40.5,3.5,42.5&bounded=0&accept-language=es`
      )
      const data: NominatimResult[] = await res.json()
      setSuggestions(data)
      setShowSuggestions(data.length > 0)
    } catch (error) {
      console.error('Error buscando direcciones:', error)
    }
  }, [])

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(inputValue)
    }, 400)
  }

  const handleSuggestionClick = (result: NominatimResult) => {
    const address = result.display_name
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    const placeResult = {
      formatted_address: address,
      name: address,
      geometry: {
        location: {
          lat: () => lat,
          lng: () => lng,
        }
      }
    } as google.maps.places.PlaceResult

    onChange(address, placeResult)
    setShowSuggestions(false)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ed7e00] z-10 pointer-events-none" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true)
        }}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 200)
        }}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pl-10 ${className}`}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#dcdcdc] rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((result) => (
            <div
              key={result.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#646464]"
              onClick={() => handleSuggestionClick(result)}
            >
              {result.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
