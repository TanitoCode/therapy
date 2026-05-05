import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { appointments } from '@/db/schema/appointments'
import { patients } from '@/db/schema/patients'
import { services } from '@/db/schema/services'
import { auditLog } from '@/db/schema/audit'
import { requireAdmin } from '@/lib/auth-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  startAt: z.string().datetime().optional(),
  serviceId: z.string().uuid().optional(),
  notes: z.string().max(1000).nullable().optional(),
  adminNotes: z.string().max(1000).nullable().optional(),
})

async function loadAppt(id: string) {
  const [appt] = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      notes: appointments.notes,
      adminNotes: appointments.adminNotes,
      patientId: appointments.patientId,
      serviceId: appointments.serviceId,
      confirmationToken: appointments.confirmationToken,
      cancelToken: appointments.cancelToken,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      patient: {
        id: patients.id,
        fullName: patients.fullName,
        email: patients.email,
        phone: patients.phone,
      },
      service: {
        id: services.id,
        name: services.name,
        durationMin: services.durationMin,
      },
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.id, id))
    .limit(1)
  return appt ?? null
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin()
  } catch (err) {
    const e = err as Error
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'No autenticado' : 'Acceso denegado' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 403 },
    )
  }

  const { id } = await params
  const appt = await loadAppt(id)
  if (!appt) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })
  return NextResponse.json(appt)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  let session: Awaited<ReturnType<typeof requireAdmin>>
  try {
    session = await requireAdmin()
  } catch (err) {
    const e = err as Error
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'No autenticado' : 'Acceso denegado' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 403 },
    )
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { status, startAt: startAtStr, serviceId, notes, adminNotes } = parsed.data

  const [existing] = await db
    .select({ id: appointments.id, serviceId: appointments.serviceId, startAt: appointments.startAt })
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1)

  if (!existing) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })

  const updates: Partial<typeof appointments.$inferInsert> = { updatedAt: new Date() }
  if (status !== undefined) updates.status = status
  if (notes !== undefined) updates.notes = notes
  if (adminNotes !== undefined) updates.adminNotes = adminNotes

  if (startAtStr || serviceId) {
    const resolvedServiceId = serviceId ?? existing.serviceId
    const resolvedStart = startAtStr ? new Date(startAtStr) : existing.startAt

    const [svc] = await db
      .select({ durationMin: services.durationMin })
      .from(services)
      .where(eq(services.id, resolvedServiceId))
      .limit(1)

    if (!svc) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

    updates.startAt = resolvedStart
    updates.endAt = new Date(resolvedStart.getTime() + svc.durationMin * 60_000)
    if (serviceId) updates.serviceId = serviceId
  }

  const [updated] = await db
    .update(appointments)
    .set(updates)
    .where(eq(appointments.id, id))
    .returning()

  await db.insert(auditLog).values({
    actorId: session.user.id,
    actorType: 'admin',
    action: 'appointment.updated',
    resourceType: 'appointment',
    resourceId: id,
    metadata: { changes: Object.keys(parsed.data) },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  let session: Awaited<ReturnType<typeof requireAdmin>>
  try {
    session = await requireAdmin()
  } catch (err) {
    const e = err as Error
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'No autenticado' : 'Acceso denegado' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 403 },
    )
  }

  const { id } = await params

  const [appt] = await db
    .select({ id: appointments.id, status: appointments.status })
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1)

  if (!appt) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 })

  // Soft delete
  await db
    .update(appointments)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(appointments.id, id))

  await db.insert(auditLog).values({
    actorId: session.user.id,
    actorType: 'admin',
    action: 'appointment.deleted',
    resourceType: 'appointment',
    resourceId: id,
    metadata: { previousStatus: appt.status, softDelete: true },
  })

  return new NextResponse(null, { status: 204 })
}
