export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface AppointmentPatient {
  id: string
  fullName: string
  email: string
  phone: string | null
}

export interface AppointmentService {
  id: string
  name: string
  durationMin: number
}

export interface CalendarAppointment {
  id: string
  status: AppointmentStatus
  startAt: string // ISO string
  endAt: string   // ISO string
  notes: string | null
  adminNotes: string | null
  createdAt: string
  patient: AppointmentPatient
  service: AppointmentService
  // color resolved from services map
  serviceColor: string
}

export interface CalendarService {
  id: string
  name: string
  durationMin: number
  color: string
  active: boolean
}

export type CalendarViewType = 'week' | 'month' | 'day'

export interface CalendarViewProps {
  appointments: CalendarAppointment[]
  currentDate: Date
  onAppointmentClick: (appointment: CalendarAppointment) => void
  onSlotClick: (date: Date) => void
}
