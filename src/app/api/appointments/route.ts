import { NextRequest, NextResponse } from 'next/server'
import { and, eq, gt, lt, ne } from 'drizzle-orm'
import { db } from '@/db'
import { appointments } from '@/db/schema/appointments'
import { patients } from '@/db/schema/patients'
import { services } from '@/db/schema/services'
import { createAppointmentSchema } from '@/lib/validators/appointments'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendBookingConfirmation, sendAdminNewBooking } from '@/lib/email/send'
import { BOOKING_RATE_LIMIT } from '@/lib/constants'

export const dynamic = 'force-dynamic'

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request)
  const { success: allowed } = await checkRateLimit(
    `booking:${ip}`,
    BOOKING_RATE_LIMIT.requests,
    BOOKING_RATE_LIMIT.windowMs,
  )

  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.' },
      { status: 429 },
    )
  }

  // Parse + validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const parsed = createAppointmentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { patient, serviceId, startAt: startAtStr } = parsed.data
  const startAt = new Date(startAtStr)

  try {
    // Fetch service to get duration (and validate it's active)
    const [service] = await db
      .select({ id: services.id, durationMin: services.durationMin, name: services.name })
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.active, true)))
      .limit(1)

    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    const endAt = new Date(startAt.getTime() + service.durationMin * 60_000)

    // Transaction: upsert patient + create appointment (race-condition safe)
    const result = await db.transaction(async (tx) => {
      // Re-check slot availability inside transaction
      const conflict = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            ne(appointments.status, 'cancelled'),
            lt(appointments.startAt, endAt),
            gt(appointments.endAt, startAt),
          ),
        )
        .limit(1)

      if (conflict.length > 0) {
        throw Object.assign(new Error('SLOT_TAKEN'), { code: 'SLOT_TAKEN' })
      }

      // Upsert patient — lookup by email first, then by DNI
      let patientId: string

      const byEmail = await tx
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.email, patient.email))
        .limit(1)

      if (byEmail.length > 0) {
        patientId = byEmail[0].id
        // Update mutable fields (not notes/medicalHistory — admin-only)
        await tx
          .update(patients)
          .set({
            fullName: patient.fullName,
            phone: patient.phone || null,
            birthDate: patient.birthDate || null,
            updatedAt: new Date(),
          })
          .where(eq(patients.id, patientId))
      } else if (patient.dni) {
        const byDni = await tx
          .select({ id: patients.id })
          .from(patients)
          .where(eq(patients.dni, patient.dni))
          .limit(1)

        if (byDni.length > 0) {
          patientId = byDni[0].id
          await tx
            .update(patients)
            .set({
              fullName: patient.fullName,
              email: patient.email,
              phone: patient.phone || null,
              birthDate: patient.birthDate || null,
              updatedAt: new Date(),
            })
            .where(eq(patients.id, patientId))
        } else {
          const [newPatient] = await tx
            .insert(patients)
            .values({
              fullName: patient.fullName,
              email: patient.email,
              phone: patient.phone || null,
              dni: patient.dni || null,
              birthDate: patient.birthDate || null,
            })
            .returning({ id: patients.id })
          patientId = newPatient.id
        }
      } else {
        const [newPatient] = await tx
          .insert(patients)
          .values({
            fullName: patient.fullName,
            email: patient.email,
            phone: patient.phone || null,
            dni: null,
            birthDate: patient.birthDate || null,
          })
          .returning({ id: patients.id })
        patientId = newPatient.id
      }

      // Create appointment
      const [appt] = await tx
        .insert(appointments)
        .values({
          patientId,
          serviceId,
          startAt,
          endAt,
          status: 'pending',
          notes: patient.notes || null,
        })
        .returning({
          id: appointments.id,
          confirmationToken: appointments.confirmationToken,
          cancelToken: appointments.cancelToken,
        })

      return { appt, patientId, serviceName: service.name }
    })

    // Fire-and-forget emails (don't block the response)
    Promise.all([
      sendBookingConfirmation({
        to: patient.email,
        patientName: patient.fullName,
        serviceName: result.serviceName,
        startAt,
        appointmentId: result.appt.id,
        confirmationToken: result.appt.confirmationToken!,
        cancelToken: result.appt.cancelToken!,
      }),
      sendAdminNewBooking({
        patientName: patient.fullName,
        patientEmail: patient.email,
        serviceName: result.serviceName,
        startAt,
        appointmentId: result.appt.id,
      }),
    ]).catch((err) => console.error('[EMAIL] Error sending booking emails:', err))

    return NextResponse.json(
      {
        appointment_id: result.appt.id,
        confirmation_token: result.appt.confirmationToken,
        cancel_token: result.appt.cancelToken,
      },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof Error && err.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        {
          error: 'El turno ya fue tomado por otro paciente. Por favor elegí otro horario.',
          code: 'SLOT_TAKEN',
        },
        { status: 409 },
      )
    }

    console.error('[POST /api/appointments]', err)
    return NextResponse.json({ error: 'Error al crear el turno' }, { status: 500 })
  }
}
