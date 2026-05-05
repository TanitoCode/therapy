export const TIMEZONE = 'America/Argentina/Buenos_Aires' as const
export const SLOT_DURATION = 45 // minutos
export const LOCALE = 'es-AR' as const

export const BUSINESS_HOURS = {
  start: '09:00',
  end: '19:00',
  workDays: [1, 2, 3, 4, 5] as number[], // 0=dom, 1=lun, ..., 5=vie
} as const

export const APPOINTMENT_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'completed',
  no_show: 'no_show',
} as const

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS

export const BOOKING_RATE_LIMIT = {
  requests: 5,
  windowMs: 60_000, // 1 minuto
} as const

export const CONTACT_RATE_LIMIT = {
  requests: 3,
  windowMs: 3_600_000, // 1 hora
} as const

export const TOKEN_EXPIRY_DAYS = 30
