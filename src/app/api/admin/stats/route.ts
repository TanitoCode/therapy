import { NextResponse } from 'next/server'
import { and, count, eq, gte, gt, lte, or } from 'drizzle-orm'
import { db } from '@/db'
import { appointments } from '@/db/schema/appointments'
import { patients } from '@/db/schema/patients'
import { services } from '@/db/schema/services'
import { requireAdmin } from '@/lib/auth-server'
import { BUSINESS_HOURS, SLOT_DURATION, TIMEZONE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

function getArgentineDay(offset: number = 0): { start: Date; end: Date } {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: TIMEZONE }),
  )
  const d = new Date(now)
  d.setDate(d.getDate() + offset)
  d.setHours(0, 0, 0, 0)
  // Compensate: convert local Argentine time to UTC approximation
  const utcOffset = -3 * 60 // AR = UTC-3
  const startUTC = new Date(d.getTime() - utcOffset * 60000)

  const endLocal = new Date(d)
  endLocal.setHours(23, 59, 59, 999)
  const endUTC = new Date(endLocal.getTime() - utcOffset * 60000)

  return { start: startUTC, end: endUTC }
}

function getArgentineWeek(): { start: Date; end: Date } {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
  const day = now.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day // Monday
  const monday = new Date(now)
  monday.setDate(monday.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const utcOffset = -3 * 60
  return {
    start: new Date(monday.getTime() - utcOffset * 60000),
    end: new Date(sunday.getTime() - utcOffset * 60000),
  }
}

function totalSlotsInWeek(): number {
  // 5 work days, slots per day
  const [startH, startM] = BUSINESS_HOURS.start.split(':').map(Number)
  const [endH, endM] = BUSINESS_HOURS.end.split(':').map(Number)
  const minutesPerDay = (endH * 60 + endM) - (startH * 60 + startM)
  const slotsPerDay = Math.floor(minutesPerDay / SLOT_DURATION)
  return BUSINESS_HOURS.workDays.length * slotsPerDay
}

export async function GET() {
  try {
    await requireAdmin()
  } catch (err) {
    const e = err as Error
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'No autenticado' : 'Acceso denegado' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 403 },
    )
  }

  const today = getArgentineDay()
  const week = getArgentineWeek()
  const now = new Date()

  const activeStatuses = or(
    eq(appointments.status, 'pending'),
    eq(appointments.status, 'confirmed'),
    eq(appointments.status, 'completed'),
  )!

  const [
    todayRows,
    weekRows,
    nextAppt,
  ] = await Promise.all([
    // Turnos hoy (no cancelled, no no_show)
    db
      .select({ count: count() })
      .from(appointments)
      .where(and(gte(appointments.startAt, today.start), lte(appointments.startAt, today.end), activeStatuses)),

    // Turnos esta semana
    db
      .select({ count: count() })
      .from(appointments)
      .where(and(gte(appointments.startAt, week.start), lte(appointments.startAt, week.end), activeStatuses)),

    // Próximo turno (confirmed o pending, en el futuro)
    db
      .select({
        id: appointments.id,
        startAt: appointments.startAt,
        status: appointments.status,
        patientName: patients.fullName,
        serviceName: services.name,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(
        and(
          gt(appointments.startAt, now),
          or(eq(appointments.status, 'confirmed'), eq(appointments.status, 'pending'))!,
        ),
      )
      .orderBy(appointments.startAt)
      .limit(1),
  ])

  const todayCount = todayRows[0]?.count ?? 0
  const weekCount = weekRows[0]?.count ?? 0
  const totalSlots = totalSlotsInWeek()
  const occupancyPct = totalSlots > 0 ? Math.round((weekCount / totalSlots) * 100) : 0

  return NextResponse.json({
    today: todayCount,
    week: weekCount,
    occupancy_pct: occupancyPct,
    next_appointment: nextAppt[0] ?? null,
  })
}
