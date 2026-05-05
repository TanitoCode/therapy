import { NextRequest, NextResponse } from 'next/server'
import { and, eq, or } from 'drizzle-orm'
import { db } from '@/db'
import { appointments } from '@/db/schema/appointments'
import { patients } from '@/db/schema/patients'
import { services } from '@/db/schema/services'
import { sendBookingCancelled, sendAdminCancellation } from '@/lib/email/send'

export const dynamic = 'force-dynamic'

const TOKEN_EXPIRY_DAYS = 30

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  const [appt] = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      startAt: appointments.startAt,
      patientId: appointments.patientId,
      serviceId: appointments.serviceId,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .where(eq(appointments.cancelToken, token))
    .limit(1)

  if (!appt) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
  }

  const expiryMs = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  if (Date.now() - appt.createdAt.getTime() > expiryMs) {
    return NextResponse.json({ error: 'El enlace expiró' }, { status: 410 })
  }

  if (appt.status === 'cancelled') {
    return NextResponse.json(
      { message: 'El turno ya estaba cancelado', status: 'cancelled' },
      { status: 200 },
    )
  }

  if (appt.status === 'completed' || appt.status === 'no_show') {
    return NextResponse.json(
      { error: 'No es posible cancelar un turno ya finalizado' },
      { status: 422 },
    )
  }

  // status is pending or confirmed — allow cancellation
  const updated = await db
    .update(appointments)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(
      and(
        eq(appointments.id, appt.id),
        or(eq(appointments.status, 'pending'), eq(appointments.status, 'confirmed')),
      ),
    )
    .returning({ id: appointments.id })

  if (updated.length === 0) {
    // Concurrent update changed status — re-read and report
    return NextResponse.json({ error: 'No se pudo cancelar el turno' }, { status: 409 })
  }

  // Load patient + service for email
  const [[patient], [service]] = await Promise.all([
    db
      .select({ fullName: patients.fullName, email: patients.email })
      .from(patients)
      .where(eq(patients.id, appt.patientId))
      .limit(1),
    db
      .select({ name: services.name })
      .from(services)
      .where(eq(services.id, appt.serviceId))
      .limit(1),
  ])

  if (patient && service) {
    Promise.all([
      sendBookingCancelled({
        to: patient.email,
        patientName: patient.fullName,
        serviceName: service.name,
        startAt: appt.startAt,
      }),
      sendAdminCancellation({
        patientName: patient.fullName,
        serviceName: service.name,
        startAt: appt.startAt,
        appointmentId: appt.id,
      }),
    ]).catch((err) => console.error('[EMAIL] Error sending cancellation emails:', err))
  }

  return NextResponse.json({ message: 'Turno cancelado', appointment_id: appt.id }, { status: 200 })
}
