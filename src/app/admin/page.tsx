"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LogOut, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Car,
  Users,
  CreditCard,
  Banknote,
  Plane,
  Ship,
  Luggage,
  Settings
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Booking {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  pickupAddress: string
  destinationAddress: string
  timing: string
  scheduledDate?: string
  scheduledTime?: string
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  status: string
  distance?: number
  duration?: number
  vehicleType: string
  passengers: string
  hasLuggage: boolean
  luggageCount?: number
  isAirport: boolean
  flightNumber?: string
  isPort: boolean
  portInfo?: string
  observations?: string
  createdAt: string
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setBookings(result.bookings)
      } else {
        setError(result.error || 'Error al cargar las reservas')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', variant: 'secondary' as const },
      CONFIRMED: { label: 'Confirmada', variant: 'default' as const },
      ASSIGNED: { label: 'Asignada', variant: 'outline' as const },
      IN_PROGRESS: { label: 'En curso', variant: 'default' as const },
      COMPLETED: { label: 'Completada', variant: 'default' as const },
      CANCELLED: { label: 'Cancelada', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentBadge = (paymentStatus: string, paymentMethod: string) => {
    if (paymentStatus === 'PAID') {
      return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
    }
    if (paymentMethod === 'cash') {
      return <Badge variant="outline">Efectivo</Badge>
    }
    return <Badge variant="secondary">Pendiente</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#ed7e00] mx-auto mb-4" />
          <p className="text-[#646464]">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/pidetaxibcn.com.svg"
                alt="PideTaxiBcn.com"
                width={150}
                height={20}
              />
              <Badge variant="outline">Admin</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/configuracion">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Button>
              </Link>
              <Link href="/admin/configuracion">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookings}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1c1b1f] mb-2">
            Panel de Administración
          </h1>
          <p className="text-[#646464]">
            Gestiona las reservas de taxi • Total: {bookings.length} reservas
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Bookings Grid */}
        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="w-12 h-12 text-[#646464] mx-auto mb-4" />
                <p className="text-[#646464]">No hay reservas disponibles</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {booking.firstName} {booking.lastName}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentBadge(booking.paymentStatus, booking.paymentMethod)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-[#646464]">
                    <span>ID: {booking.id}</span>
                    <span>•</span>
                    <span>{formatDate(booking.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trayecto */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-[#646464]">Recogida</p>
                          <p className="text-sm font-medium">{booking.pickupAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-[#646464]">Destino</p>
                          <p className="text-sm font-medium">{booking.destinationAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contacto */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-[#646464]" />
                        <span className="text-sm">{booking.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-[#646464]" />
                        <span className="text-sm">{booking.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalles del viaje */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-[#646464]" />
                      <span>{booking.passengers === '4-or-less' ? '≤4' : '>4'} pasajeros</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Car className="w-4 h-4 text-[#646464]" />
                      <span className="capitalize">{booking.vehicleType}</span>
                    </div>

                    {booking.distance && (
                      <div className="flex items-center space-x-1">
                        <span>{booking.distance}km • {booking.duration}min</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1">
                      {booking.paymentMethod === 'card' ? (
                        <CreditCard className="w-4 h-4 text-[#646464]" />
                      ) : (
                        <Banknote className="w-4 h-4 text-[#646464]" />
                      )}
                      <span className="font-semibold">{booking.totalAmount.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* Información adicional */}
                  {(booking.isAirport || booking.isPort || booking.hasLuggage || booking.timing === 'scheduled') && (
                    <div className="flex flex-wrap gap-2">
                      {booking.isAirport && (
                        <Badge variant="outline" className="text-xs">
                          <Plane className="w-3 h-3 mr-1" />
                          {booking.flightNumber || 'Aeropuerto'}
                        </Badge>
                      )}
                      {booking.isPort && (
                        <Badge variant="outline" className="text-xs">
                          <Ship className="w-3 h-3 mr-1" />
                          {booking.portInfo || 'Puerto'}
                        </Badge>
                      )}
                      {booking.hasLuggage && (
                        <Badge variant="outline" className="text-xs">
                          <Luggage className="w-3 h-3 mr-1" />
                          {booking.luggageCount || 1} maletas
                        </Badge>
                      )}
                      {booking.timing === 'scheduled' && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {booking.scheduledDate} {booking.scheduledTime}
                        </Badge>
                      )}
                    </div>
                  )}

                  {booking.observations && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-[#646464] mb-1">Observaciones:</p>
                      <p className="text-sm">{booking.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}