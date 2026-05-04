import { BUSINESS_HOURS } from './constants'

// Argentina is always UTC-3 (no DST)
const AR_UTC_OFFSET_HOURS = 3

export interface TimeSlot {
  startAt: Date
  endAt: Date
  available: boolean
}

export interface Period {
  startAt: Date
  endAt: Date
}

function overlaps(slot: Period, block: Period): boolean {
  return slot.startAt < block.endAt && slot.endAt > block.startAt
}

export function generateSlots(dayStart: Date, dayEnd: Date, durationMin: number): TimeSlot[] {
  if (durationMin <= 0) return []

  const slots: TimeSlot[] = []
  const durationMs = durationMin * 60_000
  let current = dayStart.getTime()
  const end = dayEnd.getTime()

  while (current + durationMs <= end) {
    slots.push({
      startAt: new Date(current),
      endAt: new Date(current + durationMs),
      available: true,
    })
    current += durationMs
  }

  return slots
}

export function applyBlocking(slots: TimeSlot[], blocked: Period[]): TimeSlot[] {
  if (blocked.length === 0) return slots
  return slots.map((slot) => ({
    ...slot,
    available: !blocked.some((b) => overlaps(slot, b)),
  }))
}

export interface ParsedDay {
  isWorkDay: boolean
  dayOfWeek: number
  dayStart: Date
  dayEnd: Date
}

export function parseDateAR(date: string): ParsedDay {
  const [year, month, day] = date.split('-').map(Number)

  // AR midnight = 03:00 UTC (UTC-3 means local = UTC - 3, so UTC = local + 3)
  const midnightUTC = new Date(Date.UTC(year, month - 1, day, AR_UTC_OFFSET_HOURS, 0, 0))
  const dayOfWeek = midnightUTC.getUTCDay()

  const [startH, startM] = BUSINESS_HOURS.start.split(':').map(Number)
  const [endH, endM] = BUSINESS_HOURS.end.split(':').map(Number)

  const dayStart = new Date(Date.UTC(year, month - 1, day, startH + AR_UTC_OFFSET_HOURS, startM))
  const dayEnd = new Date(Date.UTC(year, month - 1, day, endH + AR_UTC_OFFSET_HOURS, endM))

  const isWorkDay = (BUSINESS_HOURS.workDays as readonly number[]).includes(dayOfWeek)

  return { isWorkDay, dayOfWeek, dayStart, dayEnd }
}

export interface AvailabilityParams {
  date: string
  durationMin: number
  appointments: Period[]
  blockedSlots: Period[]
}

export function getAvailableSlots(params: AvailabilityParams): TimeSlot[] {
  const { date, durationMin, appointments, blockedSlots } = params
  const { isWorkDay, dayStart, dayEnd } = parseDateAR(date)

  if (!isWorkDay) return []
  if (durationMin <= 0) return []

  const slots = generateSlots(dayStart, dayEnd, durationMin)
  return applyBlocking(slots, [...appointments, ...blockedSlots])
}
