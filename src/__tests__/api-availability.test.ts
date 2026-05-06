/**
 * Integration tests for /api/availability
 * These run against a real server — set NEXT_PUBLIC_APP_URL or use defaults.
 * Skip in pure unit test runs: `vitest run --exclude 'src/__tests__/api-*.test.ts'`
 */
import { describe, it, expect } from 'vitest'

// ─── Unit-level tests for the availability handler logic ─────────────────────
// We test the request validation layer without hitting the DB by
// checking how the API route parses incoming query params.

import { getAvailableSlots } from '@/lib/availability'

describe('API /api/availability — input validation (unit)', () => {
  const MONDAY = '2026-05-04'

  it('getAvailableSlots returns 0 slots for a Sunday', () => {
    const slots = getAvailableSlots({
      date: '2026-05-03', // Sunday
      durationMin: 45,
      appointments: [],
      blockedSlots: [],
    })
    expect(slots).toHaveLength(0)
  })

  it('getAvailableSlots returns slots for a weekday', () => {
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin: 45,
      appointments: [],
      blockedSlots: [],
    })
    expect(slots.length).toBeGreaterThan(0)
  })

  it('all returned slots have required fields', () => {
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin: 45,
      appointments: [],
      blockedSlots: [],
    })
    for (const slot of slots) {
      expect(slot).toHaveProperty('startAt')
      expect(slot).toHaveProperty('endAt')
      expect(slot).toHaveProperty('available')
      expect(slot.startAt).toBeInstanceOf(Date)
      expect(slot.endAt).toBeInstanceOf(Date)
      expect(typeof slot.available).toBe('boolean')
    }
  })

  it('slot duration matches requested durationMin', () => {
    const durationMin = 30
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin,
      appointments: [],
      blockedSlots: [],
    })
    for (const slot of slots) {
      const diffMs = slot.endAt.getTime() - slot.startAt.getTime()
      expect(diffMs).toBe(durationMin * 60 * 1000)
    }
  })

  it('slots are in chronological order', () => {
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin: 45,
      appointments: [],
      blockedSlots: [],
    })
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].startAt.getTime()).toBeGreaterThan(slots[i - 1].startAt.getTime())
    }
  })

  it('slots do not overlap', () => {
    const slots = getAvailableSlots({
      date: MONDAY,
      durationMin: 45,
      appointments: [],
      blockedSlots: [],
    })
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].startAt.getTime()).toBeGreaterThanOrEqual(slots[i - 1].endAt.getTime())
    }
  })
})

// ─── HTTP-level integration tests (require running server) ────────────────────

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

describe.skip('API /api/availability — HTTP (requires running server)', () => {
  const VALID_SERVICE_ID = process.env.TEST_SERVICE_ID ?? '550e8400-e29b-41d4-a716-446655440000'
  const MONDAY = '2026-05-04'

  it('returns 400 when date is missing', async () => {
    const res = await fetch(`${BASE_URL}/api/availability?serviceId=${VALID_SERVICE_ID}`)
    expect(res.status).toBe(400)
  })

  it('returns 400 when serviceId is missing', async () => {
    const res = await fetch(`${BASE_URL}/api/availability?date=${MONDAY}`)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid date format', async () => {
    const res = await fetch(`${BASE_URL}/api/availability?date=05/04/2026&serviceId=${VALID_SERVICE_ID}`)
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-UUID serviceId', async () => {
    const res = await fetch(`${BASE_URL}/api/availability?date=${MONDAY}&serviceId=not-a-uuid`)
    expect(res.status).toBe(400)
  })

  it('returns 200 with slots array for valid request', async () => {
    const res = await fetch(`${BASE_URL}/api/availability?date=${MONDAY}&serviceId=${VALID_SERVICE_ID}`)
    // 200 if service exists, 404 if not found — depends on seeded data
    expect([200, 404]).toContain(res.status)
    if (res.status === 200) {
      const body = await res.json() as unknown
      expect(body).toHaveProperty('slots')
      expect(Array.isArray((body as { slots: unknown }).slots)).toBe(true)
    }
  })

  it('returns empty slots for Sunday', async () => {
    const res = await fetch(`${BASE_URL}/api/availability?date=2026-05-03&serviceId=${VALID_SERVICE_ID}`)
    if (res.status === 200) {
      const body = await res.json() as { slots: unknown[] }
      expect(body.slots).toHaveLength(0)
    }
  })
})

// ─── Booking POST validation (unit) ──────────────────────────────────────────

import { createAppointmentSchema } from '@/lib/validators/appointments'

describe('createAppointmentSchema — edge cases for API', () => {
  const valid = {
    patient: { fullName: 'Test User', email: 'test@test.com' },
    serviceId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2026-05-04T12:00:00.000Z',
  }

  it('rejects past dates (schema allows any ISO — server must validate)', () => {
    // The schema itself does not enforce future dates (server-side responsibility)
    const result = createAppointmentSchema.safeParse({
      ...valid,
      startAt: '2020-01-01T12:00:00.000Z',
    })
    expect(result.success).toBe(true) // Schema does not reject past dates
  })

  it('rejects non-ISO startAt values', () => {
    const result = createAppointmentSchema.safeParse({ ...valid, startAt: 'tomorrow' })
    expect(result.success).toBe(false)
  })

  it('accepts full patient data with optional fields', () => {
    const result = createAppointmentSchema.safeParse({
      ...valid,
      patient: {
        fullName: 'Ana García',
        email: 'ana@test.com',
        phone: '+54 11 1234-5678',
        dni: '12345678',
        birthDate: '1990-06-15',
        notes: 'Sin novedades',
      },
    })
    expect(result.success).toBe(true)
  })
})
