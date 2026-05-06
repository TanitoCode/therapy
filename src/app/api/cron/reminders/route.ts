import { NextRequest, NextResponse } from 'next/server'
import { and, eq, gte, lt, or } from 'drizzle-orm'
import { db } from '@/db'
import { appointments } from '@/db/schema/appointments'
import { patients } from '@/db/schema/patients'
import { services } from '@/db/schema/services'
import { sendBookingReminder } from '@/lib/email/send'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find appointments for tomorrow (confirmed or pending)
  const now = new Date()
  const tomorrowStart = new Date(now)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  tomorrowStart.setHours(0, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrowStart)
  tomorrowEnd.setHours(23, 59, 59, 999)

  const upcomingAppts = await db
    .select({
      id: appointments.id,
      startAt: appointments.startAt,
      cancelToken: appointments.cancelToken,
      patientEmail: patients.email,
      patientName: patients.fullName,
      serviceName: services.name,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        gte(appointments.startAt, tomorrowStart),
        lt(appointments.startAt, tomorrowEnd),
        or(
          eq(appointments.status, 'confirmed'),
          eq(appointments.status, 'pending'),
        ),
      ),
    )

  const results = await Promise.allSettled(
    upcomingAppts.map((appt) =>
      sendBookingReminder({
        to: appt.patientEmail,
        patientName: appt.patientName,
        serviceName: appt.serviceName,
        startAt: appt.startAt,
        cancelToken: appt.cancelToken ?? '',
      }),
    ),
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  console.log(`[CRON:reminders] Sent ${sent}, failed ${failed} of ${upcomingAppts.length}`)

  return NextResponse.json({
    total: upcomingAppts.length,
    sent,
    failed,
  })
}
