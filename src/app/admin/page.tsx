"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Settings,
  Check,
  X,
  Clock,
  CheckCircle2
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdminProtected from "@/components/AdminProtected"

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

interface BookingStats {
  PENDING?: number
  CONFIRMED?: number
  IN_PROGRESS?: number
  COMPLETED?: number
  CANCELLED?: number
}

export default function AdminDashboard() {
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("pending")
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    filterBookingsByStatus(allBookings, activeTab)
  }, [activeTab, allBookings])

  useEffect(() => {
    fetchAllBookings()
  }, [])

  const fetchAllBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setAllBookings(result.bookings)
        calculateStats(result.bookings)
        filterBookingsByStatus(result.bookings, activeTab)
      } else {
        setError(result.error || 'Error al cargar las reservas')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (bookings: Booking[]) => {
    const stats: BookingStats = {
      PENDING: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0
    }

    bookings.forEach(booking => {
      if (stats[booking.status as keyof BookingStats] !== undefined) {
        stats[booking.status as keyof BookingStats]!++
      }
    })

    setStats(stats)
  }

  const filterBookingsByStatus = (bookings: Booking[], tab: string) => {
    const statusFilter = getStatusForTab(tab)
    
    if (statusFilter === 'all') {
      setFilteredBookings(bookings)
    } else {
      const filtered = bookings.filter(booking => booking.status === statusFilter)
      setFilteredBookings(filtered)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingStatus(bookingId)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (response.ok) {
        // Actualizar la reserva en el estado local
        const updatedBookings = allBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
        
        setAllBookings(updatedBookings)
        calculateStats(updatedBookings)
        filterBookingsByStatus(updatedBookings, activeTab)
      } else {
        setError(result.error || 'Error al actualizar el estado')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusForTab = (tab: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'in-progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED'
    }
    return statusMap[tab] || 'all'
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', variant: 'secondary' as const },
      CONFIRMED: { label: 'Confirmada', variant: 'default' as const },
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
      <AdminProtected>
        <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#ed7e00] mx-auto mb-4" />
            <p className="text-[#646464]">Cargando reservas...</p>
          </div>
        </div>
      </AdminProtected>
    )
  }

  return (
    <AdminProtected>
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
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllBookings}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
            Gestiona las reservas de taxi • Total: {allBookings.length} reservas
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.PENDING || 0}</div>
              <div className="text-xs text-gray-600">Pendientes</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.CONFIRMED || 0}</div>
              <div className="text-xs text-gray-600">Confirmadas</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.IN_PROGRESS || 0}</div>
              <div className="text-xs text-gray-600">En Curso</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.COMPLETED || 0}</div>
              <div className="text-xs text-gray-600">Finalizadas</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.CANCELLED || 0}</div>
              <div className="text-xs text-gray-600">Canceladas</div>
            </div>
          </Card>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tabs para diferentes estados */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
            <TabsTrigger value="in-progress">En Curso</TabsTrigger>
            <TabsTrigger value="completed">Finalizadas</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-6">
              {filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Car className="w-12 h-12 text-[#646464] mx-auto mb-4" />
                    <p className="text-[#646464]">No hay reservas en este estado</p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
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

                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {booking.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                          disabled={updatingStatus === booking.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                          disabled={updatingStatus === booking.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'IN_PROGRESS')}
                          disabled={updatingStatus === booking.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                          disabled={updatingStatus === booking.id}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    )}

                    {booking.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                        disabled={updatingStatus === booking.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Finalizar
                      </Button>
                    )}

                    {updatingStatus === booking.id && (
                      <div className="flex items-center text-sm text-gray-500">
                        <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                        Actualizando...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AdminProtected>
  )
}