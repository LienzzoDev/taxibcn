// Función para obtener la configuración de precios desde la API
export async function getPricingConfig() {
  try {
    const response = await fetch('/api/admin/pricing', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return result.config
      }
    }
  } catch (error) {
    console.error('Error fetching pricing config:', error)
  }
  
  // Fallback a configuración por defecto
  return {
    baseFare: 2.50,
    pricePerKm: 1.00,
    extraLuggageFee: 10.00,
    largeGroupSurcharge: 5.00,
    accessibleVehicleFee: 2.00,
    childSeatFee: 3.00,
    nightSurcharge: 10.00,
    minimumFare: 5.00
  }
}