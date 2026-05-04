import { NextRequest, NextResponse } from 'next/server'
import { and, eq, gte, lt, ne } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { services } from '@/db/schema/services'
import { appointments } from '@/db/schema/appointments'
import { blockedSlots } from '@/db/schema/blocked-slots'
import { getAvailableSlots } from '@/lib/availability'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  service_id: z.string().uuid('service_id debe ser un UUID válido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date debe tener formato YYYY-MM-DD'),
})

// Argentina UTC-3: local midnight = 03:00 UTC
const AR_UTC_OFFSET_HOURS = 3

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const parsed = querySchema.safeParse({
    service_id: searchParams.get('service_id'),
    date: searchParams.get('date'),
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { service_id, date } = parsed.data

  try {
    const [service] = await db
      .select({ durationMin: services.durationMin })
      .from(services)
      .where(and(eq(services.id, service_id), eq(services.active, true)))
      .limit(1)

    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    const [year, month, day] = date.split('-').map(Number)

    // Day boundaries in UTC (AR midnight = 03:00 UTC)
    const dayStartUTC = new Date(Date.UTC(year, month - 1, day, AR_UTC_OFFSET_HOURS, 0, 0))
    const dayEndUTC = new Date(Date.UTC(year, month - 1, day + 1, AR_UTC_OFFSET_HOURS, 0, 0))

    // Non-cancelled appointments overlapping this day
    const dayAppointments = await db
      .select({ startAt: appointments.startAt, endAt: appointments.endAt })
      .from(appointments)
      .where(
        and(
          gte(appointments.startAt, dayStartUTC),
          lt(appointments.startAt, dayEndUTC),
          ne(appointments.status, 'cancelled'),
        ),
      )

    // Non-recurring blocks that overlap this day
    const nonRecurringBlocks = await db
      .select({ startAt: blockedSlots.startAt, endAt: blockedSlots.endAt })
      .from(blockedSlots)
      .where(
        and(
          eq(blockedSlots.recurring, false),
          lt(blockedSlots.startAt, dayEndUTC),
          gte(blockedSlots.endAt, dayStartUTC),
        ),
      )

    // Recurring blocks — fetch all and expand to this date if day-of-week matches
    const allRecurring = await db
      .select({ startAt: blockedSlots.startAt, endAt: blockedSlots.endAt })
      .from(blockedSlots)
      .where(eq(blockedSlots.recurring, true))

    const requestedDayOfWeek = dayStartUTC.getUTCDay()
    const expandedRecurring = allRecurring
      .filter((b) => b.startAt.getUTCDay() === requestedDayOfWeek)
      .map((b) => ({
        startAt: new Date(
          Date.UTC(year, month - 1, day, b.startAt.getUTCHours(), b.startAt.getUTCMinutes()),
        ),
        endAt: new Date(
          Date.UTC(year, month - 1, day, b.endAt.getUTCHours(), b.endAt.getUTCMinutes()),
        ),
      }))

    const slots = getAvailableSlots({
      date,
      durationMin: service.durationMin,
      appointments: dayAppointments,
      blockedSlots: [...nonRecurringBlocks, ...expandedRecurring],
    })

    return NextResponse.json(
      slots.map((s) => ({
        start_at: s.startAt.toISOString(),
        end_at: s.endAt.toISOString(),
        available: s.available,
      })),
    )
  } catch (error) {
    console.error('[GET /api/availability]', error)
    return NextResponse.json({ error: 'Error al calcular disponibilidad' }, { status: 500 })
  }
}
