# PideTaxiBcn - Aplicación de Reserva de Taxis

Una aplicación web moderna para reservar taxis en Barcelona, construida con Next.js, Tailwind CSS, Prisma, Neon Database y Stripe.

## 🚀 Tecnologías Utilizadas

- **Next.js 15** - Framework de React para aplicaciones web
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **Prisma** - ORM para base de datos
- **Neon** - Base de datos PostgreSQL serverless
- **Stripe** - Procesamiento de pagos
- **Google Maps API** - Autocompletado de direcciones y cálculo de distancias
- **shadcn/ui** - Componentes de UI reutilizables
- **Lucide React** - Iconos modernos

## 📦 Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/LienzzoDev/taxibcn.git
cd taxibcn
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Configura las APIs necesarias:

### Google Maps API:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita las APIs: Maps JavaScript API, Places API, Distance Matrix API
   - Crea una clave API y restringe su uso a tu dominio
   - Actualiza `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` en `.env.local`

### Neon Database:
   - Crea una cuenta en [Neon](https://neon.tech)
   - Crea una nueva base de datos
   - Copia la URL de conexión y actualiza `DATABASE_URL` en `.env.local`

### Stripe:
   - Crea una cuenta en [Stripe](https://stripe.com)
   - Obtén las claves de API (test/live)
   - Actualiza `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` y `STRIPE_SECRET_KEY` en `.env.local`

5. Ejecuta las migraciones de Prisma:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Inicia el servidor de desarrollo:
```bash
pnpm dev
```

## 🌐 Deploy en Vercel

### Variables de entorno requeridas:
```bash
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_google_maps

# Neon Database
DATABASE_URL=tu_url_neon_database

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_clave_publica_stripe
STRIPE_SECRET_KEY=tu_clave_secreta_stripe
STRIPE_WEBHOOK_SECRET=tu_webhook_secret_stripe

# NextAuth
NEXTAUTH_SECRET=tu_secret_aleatorio
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

## 🎯 Características Implementadas

- ✅ **Formulario de reserva completo** con autocompletado de direcciones
- ✅ **Cálculo dinámico de precios** basado en distancia y suplementos
- ✅ **Pagos integrados** con Stripe (tarjeta y efectivo)
- ✅ **Panel de administración** para gestionar reservas y precios
- ✅ **Configuración dinámica** de tarifas y suplementos
- ✅ **Base de datos** con Prisma y Neon PostgreSQL
- ✅ **Diseño responsive** con Tailwind CSS
- ✅ **Página de confirmación** con detalles de la reserva

## 🗂️ Estructura del Proyecto

```
taxibcn/
├── src/
│   ├── app/
│   │   ├── formulario-reserva/     # Formulario de reserva
│   │   ├── confirmacion/           # Página de confirmación
│   │   ├── admin/                  # Panel de administración
│   │   │   ├── login/              # Login del admin
│   │   │   └── configuracion/      # Configuración de precios
│   │   └── api/                    # APIs del backend
│   ├── components/
│   │   ├── ui/                     # Componentes de shadcn/ui
│   │   ├── AddressAutocomplete.tsx # Autocompletado de direcciones
│   │   └── StripeCheckout.tsx      # Componente de pago
│   ├── hooks/
│   │   └── useTaxiBooking.ts       # Hook para gestión de reservas
│   └── lib/
│       ├── db.ts                   # Configuración de Prisma
│       ├── stripe.ts               # Configuración de Stripe
│       └── taxi-pricing.ts         # Lógica de precios
├── prisma/
│   └── schema.prisma               # Esquema de base de datos
└── public/
    └── pidetaxibcn.com.svg         # Logo de la aplicación
```

## 🚗 Funcionalidades

### Para Usuarios:
- **Reserva de taxi** con direcciones autocompletadas
- **Cálculo automático** de precios en tiempo real
- **Opciones de viaje**: pasajeros, vehículo, maletas, programación
- **Pago seguro** con Stripe o efectivo
- **Confirmación** con detalles completos de la reserva

### Para Administradores:
- **Panel de control** para ver todas las reservas
- **Configuración de precios** dinámica y en tiempo real
- **Gestión de suplementos** por tipo de vehículo, horario, etc.
- **Autenticación segura** con JWT

## 🛠️ Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Construcción para producción
pnpm build

# Iniciar en producción
pnpm start

# Linting
pnpm lint

# Prisma
npx prisma studio          # Interfaz visual de la DB
npx prisma migrate dev     # Crear nueva migración
npx prisma generate        # Generar cliente de Prisma
```

## 🌐 Rutas Principales

- `/` - Página principal
- `/formulario-reserva` - Formulario de reserva de taxi
- `/confirmacion` - Página de confirmación de reserva
- `/admin/login` - Login del administrador
- `/admin` - Panel de administración
- `/admin/configuracion` - Configuración de precios

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.