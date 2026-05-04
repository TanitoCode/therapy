import { describe, it, expect } from 'vitest'
import {
  generateSlots,
  applyBlocking,
  parseDateAR,
  getAvailableSlots,
  type Period,
} from '@/lib/availability'

// Argentina is UTC-3: AR 09:00 = UTC 12:00, AR 19:00 = UTC 22:00
// Test dates: 2026-05-04 = Monday, 2026-05-03 = Sunday

const MONDAY = '2026-05-04'
const SUNDAY = '2026-05-03'
const TUESDAY = '2026-05-05'

function utcDate(dateStr: string, hours: number, minutes = 0): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hours, minutes))
}

// AR business start/end in UTC for a given date
function arBusinessStart(date: string) {
  return utcDate(date, 12, 0) // 09:00 AR = 12:00 UTC
}
function arBusinessEnd(date: string) {
  return utcDate(date, 22, 0) // 19:00 AR = 22:00 UTC
}

describe('generateSlots', () => {
  it('produces 13 slots for a 45-min service in a 10-hour window', () => {
    const slots = generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 45)
    expect(slots).toHaveLength(13)
    expect(slots.every((s) => s.available)).toBe(true)
  })

  it('produces 10 slots for a 60-min service in a 10-hour window', () => {
    const slots = generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 60)
    expect(slots).toHaveLength(10)
  })

  it('first slot starts at business open and last slot ends at business close', () => {
    const slots = generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 45)
    expect(slots[0].startAt.toISOString()).toBe('2026-05-04T12:00:00.000Z') // 09:00 AR
    expect(slots[slots.length - 1].endAt.toISOString()).toBe('2026-05-04T21:45:00.000Z') // 18:45 AR
  })

  it('returns empty when duration exceeds the window', () => {
    const slots = generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 700)
    expect(slots).toHaveLength(0)
  })

  it('returns empty for zero duration', () => {
    expect(generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 0)).toHaveLength(0)
  })
})

describe('applyBlocking', () => {
  it('returns all available when no blocks', () => {
    const slots = generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 45)
    const result = applyBlocking(slots, [])
    expect(result.every((s) => s.available)).toBe(true)
  })

  it('marks a slot unavailable when exactly covered by a block', () => {
    const slots = generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 45)
    // Block covers the first slot: 12:00–12:45 UTC (09:00–09:45 AR)
    const block: Period = {
      startAt: utcDate(MONDAY, 12, 0),
      endAt: utcDate(MONDAY, 12, 45),
    }
    const result = applyBlocking(slots, [block])
    expect(result[0].available).toBe(false)
    expect(result[1].available).toBe(true)
  })

  it('marks a slot unavailable on partial overlap (block starts mid-slot)', () => {
    const slots = generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 45)
    // Block starts 15 min into the first slot
    const block: Period = {
      startAt: utcDate(MONDAY, 12, 15),
      endAt: utcDate(MONDAY, 12, 50),
    }
    const result = applyBlocking(slots, [block])
    expect(result[0].available).toBe(false)
  })

  it('marks multiple slots unavailable when block spans several slots', () => {
    const slots = generateSlots(arBusinessStart(MONDAY), arBusinessEnd(MONDAY), 45)
    // Block covers slots 2, 3, 4 (12:45–15:00 UTC)
    const block: Period = {
      startAt: utcDate(MONDAY, 12, 45),
      endAt: utcDate(MONDAY, 15, 0),
    }
    const result = applyBlocking(slots, [block])
    expect(result[0].available).toBe(true)
    expect(result[1].available).toBe(false) // 12:45–13:30
    expect(result[2].available).toBe(false) // 13:30–14:15
    expect(result[3].available).toBe(false) // 14:15–15:00
    expect(result[4].available).toBe(true)  // 15:00–15:45
  })
})

describe('parseDateAR', () => {
  it('identifies Monday correctly', () => {
    const { isWorkDay, dayOfWeek } = parseDateAR(MONDAY)
    expect(dayOfWeek).toBe(1)
    expect(isWorkDay).toBe(true)
  })

  it('identifies Sunday as non-work day', () => {
    const { isWorkDay, dayOfWeek } = parseDateAR(SUNDAY)
    expect(dayOfWeek).toBe(0)
    expect(isWorkDay).toBe(false)
  })

  it('sets correct UTC business hours for an AR date', () => {
    const { dayStart, dayEnd } = parseDateAR(MONDAY)
    expect(dayStart.toISOString()).toBe('2026-05-04T12:00:00.000Z') // 09:00 AR
    expect(dayEnd.toISOString()).toBe('2026-05-04T22:00:00.000Z')   // 19:00 AR
  })
})

describe('getAvailableSlots', () => {
  it('returns empty array for a weekend day', () => {
    const slots = getAvailableSlots({
      date: SUNDAY,
      durationMin: 45,
      appointments: [],
      blockedSlots: [],
    })
    expect(slots).toHaveLength(0)
  })

  it('returns 13 available slots for a clean workday (45 min)', () => {
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin: 45,
      appointments: [],
      blockedSlots: [],
    })
    expect(slots).toHaveLength(13)
    expect(slots.every((s) => s.available)).toBe(true)
  })

  it('marks a slot as unavailable when a non-cancelled appointment exists', () => {
    // Slot 3 on MONDAY: 14:15–15:00 UTC (11:15–12:00 AR) — aligned with slot boundary
    const appt: Period = {
      startAt: utcDate(MONDAY, 14, 15),
      endAt: utcDate(MONDAY, 15, 0),
    }
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin: 45,
      appointments: [appt],
      blockedSlots: [],
    })
    const unavailable = slots.filter((s) => !s.available)
    expect(unavailable).toHaveLength(1)
    expect(unavailable[0].startAt.toISOString()).toBe('2026-05-04T14:15:00.000Z')
  })

  it('marks a slot unavailable when a blocked slot covers it', () => {
    // Slot 6 on TUESDAY: 16:30–17:15 UTC (13:30–14:15 AR) — aligned with slot boundary
    const block: Period = {
      startAt: utcDate(TUESDAY, 16, 30),
      endAt: utcDate(TUESDAY, 17, 15),
    }
    const slots = getAvailableSlots({
      date: TUESDAY,
      durationMin: 45,
      appointments: [],
      blockedSlots: [block],
    })
    const unavailable = slots.filter((s) => !s.available)
    expect(unavailable).toHaveLength(1)
    expect(unavailable[0].startAt.toISOString()).toBe('2026-05-05T16:30:00.000Z')
  })

  it('returns all slots unavailable when entire day is blocked', () => {
    const block: Period = {
      startAt: arBusinessStart(MONDAY),
      endAt: arBusinessEnd(MONDAY),
    }
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin: 45,
      appointments: [],
      blockedSlots: [block],
    })
    expect(slots).toHaveLength(13)
    expect(slots.every((s) => !s.available)).toBe(true)
  })

  it('handles multiple overlapping appointments leaving some slots free', () => {
    const booked: Period[] = [
      { startAt: utcDate(MONDAY, 12, 0), endAt: utcDate(MONDAY, 12, 45) }, // slot 1
      { startAt: utcDate(MONDAY, 13, 30), endAt: utcDate(MONDAY, 14, 15) }, // slot 3
    ]
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin: 45,
      appointments: booked,
      blockedSlots: [],
    })
    expect(slots.filter((s) => !s.available)).toHaveLength(2)
    expect(slots.filter((s) => s.available)).toHaveLength(11)
  })
})
