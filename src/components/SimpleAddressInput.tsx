"use client"

import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface SimpleAddressInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SimpleAddressInput({ 
  placeholder, 
  value, 
  onChange, 
  className 
}: SimpleAddressInputProps) {
  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ed7e00]" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 ${className}`}
      />
    </div>
  )
}