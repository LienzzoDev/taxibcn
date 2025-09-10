import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPricing() {
  try {
    // Verificar si ya existe configuración
    const existingConfig = await prisma.pricingConfig.findFirst()
    
    if (!existingConfig) {
      // Crear configuración inicial
      await prisma.pricingConfig.create({
        data: {
          baseFare: 2.50,
          pricePerKm: 1.00,
          extraLuggageFee: 10.00,
          largeGroupSurcharge: 5.00,
          accessibleVehicleFee: 2.00,
          childSeatFee: 3.00,
          nightSurcharge: 10.00,
          minimumFare: 5.00
        }
      })
      console.log('✅ Configuración de precios inicial creada')
    } else {
      console.log('ℹ️ La configuración de precios ya existe')
    }
  } catch (error) {
    console.error('❌ Error al crear configuración inicial:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPricing()