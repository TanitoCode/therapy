import { render } from '@react-email/render'
import BookingConfirmation from '@/emails/booking-confirmation'
import BookingCancelled from '@/emails/booking-cancelled'
import AdminNewBooking from '@/emails/admin-new-booking'
import AdminCancellation from '@/emails/admin-cancellation'
import BookingReminder from '@/emails/booking-reminder'
import { resend, FROM_ADDRESS, ADMIN_EMAIL, APP_URL } from './client'

const MAX_RETRIES = 2

async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY not configured — skipping email to', opts.to)
    return
  }

  let lastErr: unknown
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { error } = await resend.emails.send({
        from: opts.from ?? FROM_ADDRESS,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      })
      if (error) throw new Error(error.message)
      return
    } catch (err) {
      lastErr = err
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
      }
    }
  }
  console.error('[EMAIL] Failed after retries:', lastErr)
  throw lastErr
}

// ─── Public helpers ────────────────────────────────────────────────────────────

export interface BookingConfirmationParams {
  to: string
  patientName: string
  serviceName: string
  startAt: Date
  appointmentId: string
  confirmationToken: string
  cancelToken: string
}

export async function sendBookingConfirmation(params: BookingConfirmationParams): Promise<void> {
  const html = await render(
    BookingConfirmation({
      patientName: params.patientName,
      serviceName: params.serviceName,
      startAt: params.startAt,
      confirmationToken: params.confirmationToken,
      cancelToken: params.cancelToken,
      appUrl: APP_URL,
    }),
  )
  await sendEmail({
    to: params.to,
    subject: `Tu turno de ${params.serviceName} está reservado`,
    html,
  })
}

export interface AdminNewBookingParams {
  patientName: string
  patientEmail: string
  serviceName: string
  startAt: Date
  appointmentId: string
}

export async function sendAdminNewBooking(params: AdminNewBookingParams): Promise<void> {
  const html = await render(
    AdminNewBooking({
      patientName: params.patientName,
      patientEmail: params.patientEmail,
      serviceName: params.serviceName,
      startAt: params.startAt,
      appointmentId: params.appointmentId,
      appUrl: APP_URL,
    }),
  )
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Nuevo turno — ${params.patientName} · ${params.serviceName}`,
    html,
  })
}

export async function sendBookingCancelled(params: {
  to: string
  patientName: string
  serviceName: string
  startAt: Date
}): Promise<void> {
  const html = await render(
    BookingCancelled({
      patientName: params.patientName,
      serviceName: params.serviceName,
      startAt: params.startAt,
      appUrl: APP_URL,
    }),
  )
  await sendEmail({
    to: params.to,
    subject: `Tu turno de ${params.serviceName} fue cancelado`,
    html,
  })
}

export async function sendAdminCancellation(params: {
  patientName: string
  serviceName: string
  startAt: Date
  appointmentId: string
}): Promise<void> {
  const html = await render(
    AdminCancellation({
      patientName: params.patientName,
      serviceName: params.serviceName,
      startAt: params.startAt,
      appointmentId: params.appointmentId,
      appUrl: APP_URL,
    }),
  )
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Turno cancelado — ${params.patientName}`,
    html,
  })
}

export async function sendBookingReminder(params: {
  to: string
  patientName: string
  serviceName: string
  startAt: Date
  cancelToken: string
}): Promise<void> {
  const html = await render(
    BookingReminder({
      patientName: params.patientName,
      serviceName: params.serviceName,
      startAt: params.startAt,
      cancelToken: params.cancelToken,
      appUrl: APP_URL,
    }),
  )
  await sendEmail({
    to: params.to,
    subject: `Recordatorio — Tu turno de ${params.serviceName} es mañana`,
    html,
  })
}
