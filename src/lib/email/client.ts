import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[EMAIL] RESEND_API_KEY not set — emails will be skipped')
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? 'Consultorio Kinesiología <turnos@kinesio.ar>'

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@kinesio.ar'

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
