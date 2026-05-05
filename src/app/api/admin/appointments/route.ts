import { NextRequest, NextResponse } from 'next/server'
import { and, desc, eq, gte, lte, SQL } from 'drizzle-orm'
import { db } from '@/db'
import { appointments } from '@/db/schema/appointments'
import { patients } from '@/db/schema/patients'
import { services } from '@/db/schema/services'
import { auditLog } from '@/db/schema/audit'
import { requireAdmin } from '@/lib/auth-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const listSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  service_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
})

const createSchema = z.object({
  patientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startAt: z.string().datetime(),
  notes: z.string().max(1000).optional(),
  adminNotes: z.string().max(1000).optional(),
  status: z.enum(['pending', 'confirmed']).default('confirmed'),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    const e = err as Error
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'No autenticado' : 'Acceso denegado' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 403 },
    )
  }

  const parsed = listSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { from, to, status, service_id, patient_id, page, per_page } = parsed.data

  const conditions: SQL[] = []
  if (from) conditions.push(gte(appointments.startAt, new Date(from)))
  if (to) conditions.push(lte(appointments.startAt, new Date(to)))
  if (status) conditions.push(eq(appointments.status, status))
  if (service_id) conditions.push(eq(appointments.serviceId, service_id))
  if (patient_id) conditions.push(eq(appointments.patientId, patient_id))

  const where = conditions.length > 0 ? and(...conditions) : undefined
  const offset = (page - 1) * per_page

  const rows = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      notes: appointments.notes,
      adminNotes: appointments.adminNotes,
      createdAt: appointments.createdAt,
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
    .where(where)
    .orderBy(desc(appointments.startAt))
    .limit(per_page)
    .offset(offset)

  return NextResponse.json({ data: rows, page, per_page })
}

export async function POST(request: NextRequest) {
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { patientId, serviceId, startAt: startAtStr, notes, adminNotes, status } = parsed.data
  const startAt = new Date(startAtStr)

  const [service] = await db
    .select({ durationMin: services.durationMin })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1)

  if (!service) {
    return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
  }

  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.id, patientId))
    .limit(1)

  if (!patient) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
  }

  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000)

  const [appt] = await db
    .insert(appointments)
    .values({ patientId, serviceId, startAt, endAt, status, notes: notes ?? null, adminNotes: adminNotes ?? null })
    .returning()

  await db.insert(auditLog).values({
    actorId: session.user.id,
    actorType: 'admin',
    action: 'appointment.created',
    resourceType: 'appointment',
    resourceId: appt.id,
    metadata: { override: true, status },
  })

  return NextResponse.json(appt, { status: 201 })
}
