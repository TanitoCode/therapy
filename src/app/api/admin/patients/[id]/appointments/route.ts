import { NextRequest, NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { appointments } from '@/db/schema/appointments'
import { patients } from '@/db/schema/patients'
import { services } from '@/db/schema/services'
import { requireAdmin } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

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

  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.id, id))
    .limit(1)

  if (!patient) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })

  const rows = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      notes: appointments.notes,
      adminNotes: appointments.adminNotes,
      createdAt: appointments.createdAt,
      service: {
        id: services.id,
        name: services.name,
        durationMin: services.durationMin,
      },
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.patientId, id))
    .orderBy(desc(appointments.startAt))

  return NextResponse.json({ data: rows, total: rows.length })
}
