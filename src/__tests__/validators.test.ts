import { describe, it, expect } from 'vitest'
import { patientFormSchema } from '@/lib/validators/booking'
import { createAppointmentSchema, patientInputSchema } from '@/lib/validators/appointments'
import { contactSchema } from '@/lib/validators/contact'

// ─── patientFormSchema ────────────────────────────────────────────────────────

describe('patientFormSchema', () => {
  const valid = {
    fullName: 'María García',
    email: 'maria@example.com',
    phone: '+54 11 1234-5678',
    dni: '12345678',
    birthDate: '1990-06-15',
    notes: 'Sin alergias',
  }

  it('accepts a fully valid payload', () => {
    expect(() => patientFormSchema.parse(valid)).not.toThrow()
  })

  it('accepts minimal payload (only fullName + email required)', () => {
    expect(() => patientFormSchema.parse({ fullName: 'Juan', email: 'j@x.com' })).not.toThrow()
  })

  it('rejects fullName shorter than 2 chars', () => {
    const result = patientFormSchema.safeParse({ ...valid, fullName: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects fullName longer than 150 chars', () => {
    const result = patientFormSchema.safeParse({ ...valid, fullName: 'A'.repeat(151) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = patientFormSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('normalizes email to lowercase', () => {
    const result = patientFormSchema.parse({ ...valid, email: 'MARIA@Example.COM' })
    expect(result.email).toBe('maria@example.com')
  })

  it('accepts empty string for optional phone', () => {
    const result = patientFormSchema.parse({ ...valid, phone: '' })
    expect(result.phone).toBe('')
  })

  it('rejects phone that is too short (< 6 chars)', () => {
    const result = patientFormSchema.safeParse({ ...valid, phone: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects phone with letters', () => {
    const result = patientFormSchema.safeParse({ ...valid, phone: 'abc-def-ghij' })
    expect(result.success).toBe(false)
  })

  it('rejects DNI with 6 digits (too short)', () => {
    const result = patientFormSchema.safeParse({ ...valid, dni: '123456' })
    expect(result.success).toBe(false)
  })

  it('rejects DNI with 9 digits (too long)', () => {
    const result = patientFormSchema.safeParse({ ...valid, dni: '123456789' })
    expect(result.success).toBe(false)
  })

  it('accepts 7-digit DNI', () => {
    const result = patientFormSchema.safeParse({ ...valid, dni: '1234567' })
    expect(result.success).toBe(true)
  })

  it('accepts 8-digit DNI', () => {
    const result = patientFormSchema.safeParse({ ...valid, dni: '12345678' })
    expect(result.success).toBe(true)
  })

  it('rejects birthDate in wrong format', () => {
    const result = patientFormSchema.safeParse({ ...valid, birthDate: '15/06/1990' })
    expect(result.success).toBe(false)
  })

  it('accepts birthDate in YYYY-MM-DD format', () => {
    const result = patientFormSchema.safeParse({ ...valid, birthDate: '1990-06-15' })
    expect(result.success).toBe(true)
  })

  it('rejects notes over 500 characters', () => {
    const result = patientFormSchema.safeParse({ ...valid, notes: 'x'.repeat(501) })
    expect(result.success).toBe(false)
  })
})

// ─── patientInputSchema ───────────────────────────────────────────────────────

describe('patientInputSchema', () => {
  const valid = {
    fullName: 'Carlos Méndez',
    email: 'carlos@test.com',
  }

  it('accepts minimal valid data', () => {
    expect(() => patientInputSchema.parse(valid)).not.toThrow()
  })

  it('accepts null birthDate', () => {
    const result = patientInputSchema.safeParse({ ...valid, birthDate: null })
    expect(result.success).toBe(true)
  })

  it('rejects fullName shorter than 2 chars', () => {
    const result = patientInputSchema.safeParse({ ...valid, fullName: 'X' })
    expect(result.success).toBe(false)
  })

  it('normalizes email to lowercase', () => {
    const result = patientInputSchema.parse({ ...valid, email: 'CARLOS@TEST.COM' })
    expect(result.email).toBe('carlos@test.com')
  })
})

// ─── createAppointmentSchema ──────────────────────────────────────────────────

describe('createAppointmentSchema', () => {
  const validPatient = {
    fullName: 'Ana López',
    email: 'ana@ejemplo.com',
  }

  const validPayload = {
    patient: validPatient,
    serviceId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2026-05-04T12:00:00.000Z',
  }

  it('accepts a fully valid payload', () => {
    expect(() => createAppointmentSchema.parse(validPayload)).not.toThrow()
  })

  it('rejects invalid serviceId (not a UUID)', () => {
    const result = createAppointmentSchema.safeParse({ ...validPayload, serviceId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects startAt that is not ISO 8601', () => {
    const result = createAppointmentSchema.safeParse({ ...validPayload, startAt: '2026-05-04 12:00' })
    expect(result.success).toBe(false)
  })

  it('rejects missing patient', () => {
    const { patient: _p, ...rest } = validPayload
    const result = createAppointmentSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects invalid patient email', () => {
    const result = createAppointmentSchema.safeParse({
      ...validPayload,
      patient: { ...validPatient, email: 'bad' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects startAt with timezone offset (schema requires UTC)', () => {
    // z.string().datetime() only accepts UTC (Z) — no offset support by design
    const result = createAppointmentSchema.safeParse({
      ...validPayload,
      startAt: '2026-05-04T09:00:00-03:00',
    })
    expect(result.success).toBe(false)
  })
})

// ─── contactSchema ────────────────────────────────────────────────────────────

describe('contactSchema', () => {
  const valid = {
    name: 'Laura Fernández',
    email: 'laura@test.com',
    message: 'Quisiera consultar sobre disponibilidad.',
  }

  it('accepts a valid payload', () => {
    expect(() => contactSchema.parse(valid)).not.toThrow()
  })

  it('rejects name shorter than 2 chars', () => {
    const result = contactSchema.safeParse({ ...valid, name: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects name longer than 100 chars', () => {
    const result = contactSchema.safeParse({ ...valid, name: 'A'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('normalizes email to lowercase', () => {
    const result = contactSchema.parse({ ...valid, email: 'LAURA@TEST.COM' })
    expect(result.email).toBe('laura@test.com')
  })

  it('rejects message shorter than 10 chars', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'Hola.' })
    expect(result.success).toBe(false)
  })

  it('rejects message longer than 1000 chars', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'x'.repeat(1001) })
    expect(result.success).toBe(false)
  })

  it('accepts optional phone when omitted', () => {
    const result = contactSchema.safeParse({ name: 'Test User', email: 't@t.com', message: 'Mensaje válido aquí.' })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for phone', () => {
    const result = contactSchema.safeParse({ ...valid, phone: '' })
    expect(result.success).toBe(true)
  })

  it('rejects phone with letters', () => {
    const result = contactSchema.safeParse({ ...valid, phone: 'abc123' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from name and message', () => {
    const result = contactSchema.parse({ ...valid, name: '  Laura  ', message: '  Hola, quisiera consultar.  ' })
    expect(result.name).toBe('Laura')
    expect(result.message).toBe('Hola, quisiera consultar.')
  })
})
