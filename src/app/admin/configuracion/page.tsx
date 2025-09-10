"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  ArrowLeft, 
  Settings, 
  Euro,
  Car,
  Users,
  Luggage,
  Moon,
  Accessibility,
  Heart,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PricingConfig {
  baseFare: number
  pricePerKm: number
  extraLuggageFee: number
  largeGroupSurcharge: number
  accessibleVehicleFee: number
  childSeatFee: number
  nightSurcharge: number
  minimumFare: number
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<PricingConfig>({
    baseFare: 2.50,
    pricePerKm: 1.00,
    extraLuggageFee: 10.00,
    largeGroupSurcharge: 5.00,
    accessibleVehicleFee: 2.00,
    childSeatFee: 3.00,
    nightSurcharge: 10.00,
    minimumFare: 5.00
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/admin/pricing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setConfig(result.config)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al cargar la configuración' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Configuración guardada correctamente' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al guardar la configuración' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof PricingConfig, value: string) => {
    const numValue = parseFloat(value) || 0
    setConfig(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#ed7e00] mx-auto mb-4" />
          <p className="text-[#646464]">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <Image
                src="/pidetaxibcn.com.svg"
                alt="PideTaxiBcn.com"
                width={150}
                height={20}
              />
              <Badge variant="outline">Admin</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-[#ed7e00]" />
              <span className="font-medium">Configuración de Precios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1c1b1f] mb-2">
            Configuración de Precios
          </h1>
          <p className="text-[#646464]">
            Modifica las tarifas y suplementos del servicio de taxi
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <div className="grid gap-6">
          {/* Tarifas Base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-[#ed7e00]" />
                Tarifas Base
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1c1b1f]">
                  Tarifa Base (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.baseFare}
                  onChange={(e) => updateField('baseFare', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc]"
                />
                <p className="text-xs text-[#646464]">
                  Tarifa fija que se aplica a todos los viajes
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1c1b1f]">
                  Precio por Kilómetro (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.pricePerKm}
                  onChange={(e) => updateField('pricePerKm', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc]"
                />
                <p className="text-xs text-[#646464]">
                  Tarifa por cada kilómetro recorrido
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1c1b1f]">
                  Tarifa Mínima (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.minimumFare}
                  onChange={(e) => updateField('minimumFare', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc]"
                />
                <p className="text-xs text-[#646464]">
                  Precio mínimo que se cobra por cualquier viaje
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Suplementos por Tipo de Vehículo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#ed7e00]" />
                Suplementos por Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1c1b1f] flex items-center gap-2">
                  <Accessibility className="w-4 h-4" />
                  Vehículo Accesible (PMR) (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.accessibleVehicleFee}
                  onChange={(e) => updateField('accessibleVehicleFee', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc]"
                />
                <p className="text-xs text-[#646464]">
                  Suplemento para vehículos adaptados
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1c1b1f] flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Sillas Infantiles (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.childSeatFee}
                  onChange={(e) => updateField('childSeatFee', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc]"
                />
                <p className="text-xs text-[#646464]">
                  Suplemento por sillas infantiles
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Suplementos por Pasajeros y Equipaje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ed7e00]" />
                Suplementos por Pasajeros y Equipaje
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1c1b1f] flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Más de 4 Pasajeros (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.largeGroupSurcharge}
                  onChange={(e) => updateField('largeGroupSurcharge', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc]"
                />
                <p className="text-xs text-[#646464]">
                  Suplemento para grupos grandes
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1c1b1f] flex items-center gap-2">
                  <Luggage className="w-4 h-4" />
                  Más de 2 Maletas (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.extraLuggageFee}
                  onChange={(e) => updateField('extraLuggageFee', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc]"
                />
                <p className="text-xs text-[#646464]">
                  Suplemento fijo por exceso de equipaje
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Suplementos por Horario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-[#ed7e00]" />
                Suplementos por Horario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1c1b1f] flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Viajes Nocturnos (22:00 - 06:00) (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.nightSurcharge}
                  onChange={(e) => updateField('nightSurcharge', e.target.value)}
                  className="bg-[#f8f8f8] border-[#dcdcdc] max-w-xs"
                />
                <p className="text-xs text-[#646464]">
                  Suplemento para viajes programados en horario nocturno
                </p>
              </div>
            </CardContent>
          </Card>



          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#ed7e00] hover:bg-[#d16d00] text-white px-8"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}