import { resend } from './resend'

interface BookingEmailData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  pickupAddress: string
  destinationAddress: string
  totalAmount: number
  paymentMethod: string
  timing: string
  scheduledDate?: string | null
  scheduledTime?: string | null
  passengers: string
  vehicleType: string
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'TaxiBcn <noreply@testmail.lienzzo.com>'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL

export async function sendBookingConfirmationEmail(booking: BookingEmailData) {
  const whenText = booking.timing === 'now'
    ? 'Lo antes posible'
    : `${booking.scheduledDate} a las ${booking.scheduledTime}`

  const paymentText = booking.paymentMethod === 'card' ? 'Tarjeta (pagado)' : 'Efectivo'
  const vehicleText = booking.vehicleType === 'accessible' ? 'Accesible' : 'Estándar'

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ed7e00; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">TaxiBcn</h1>
        <p style="color: white; margin: 5px 0 0; font-size: 14px;">Confirmación de reserva</p>
      </div>

      <div style="border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
        <p style="font-size: 16px; color: #333;">Hola <strong>${booking.firstName}</strong>,</p>
        <p style="color: #555;">Tu reserva ha sido registrada correctamente.</p>

        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px; color: #333; font-size: 16px;">Detalles del viaje</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Reserva</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">#${booking.id.slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Recogida</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">${booking.pickupAddress}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Destino</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">${booking.destinationAddress}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Cuándo</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">${whenText}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Pasajeros</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">${booking.passengers}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Vehículo</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">${vehicleText}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #888; font-size: 14px;">Pago</td>
              <td style="padding: 6px 0; color: #333; font-size: 14px; text-align: right;">${paymentText}</td>
            </tr>
            <tr style="border-top: 1px solid #e0e0e0;">
              <td style="padding: 12px 0 6px; color: #333; font-size: 16px; font-weight: bold;">Total</td>
              <td style="padding: 12px 0 6px; color: #ed7e00; font-size: 16px; font-weight: bold; text-align: right;">${booking.totalAmount.toFixed(2)} €</td>
            </tr>
          </table>
        </div>

        <p style="color: #888; font-size: 12px; text-align: center; margin-top: 24px;">
          Si tienes alguna duda, contacta con nosotros por teléfono.
        </p>
      </div>
    </div>
  `

  // Enviar email al cliente
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.email,
      subject: `Reserva confirmada #${booking.id.slice(-8).toUpperCase()} - TaxiBcn`,
      html: htmlContent,
    })
  } catch (error) {
    console.error('Error enviando email al cliente:', error)
  }

  // Enviar notificación al admin
  if (ADMIN_EMAIL) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nueva reserva #${booking.id.slice(-8).toUpperCase()} - ${booking.firstName} ${booking.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ed7e00;">Nueva reserva recibida</h2>
            <p><strong>Cliente:</strong> ${booking.firstName} ${booking.lastName}</p>
            <p><strong>Teléfono:</strong> ${booking.phone}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Recogida:</strong> ${booking.pickupAddress}</p>
            <p><strong>Destino:</strong> ${booking.destinationAddress}</p>
            <p><strong>Cuándo:</strong> ${whenText}</p>
            <p><strong>Pasajeros:</strong> ${booking.passengers}</p>
            <p><strong>Vehículo:</strong> ${vehicleText}</p>
            <p><strong>Pago:</strong> ${paymentText}</p>
            <p><strong>Total:</strong> ${booking.totalAmount.toFixed(2)} €</p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Error enviando email al admin:', error)
    }
  }
}
