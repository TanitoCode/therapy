import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { patients } from '@/db/schema/patients'
import { requireAdmin } from '@/lib/auth-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  notes: z.string().max(5000).nullable().optional(),
  medicalHistory: z.string().max(10000).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  fullName: z.string().min(2).max(200).optional(),
})

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
  const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1)
  if (!patient) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
  return NextResponse.json(patient)
}

export async function PATCH(request: NextRequest, { params }: Params) {
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

  const { notes, medicalHistory, phone, fullName } = parsed.data
  const updates: Partial<typeof patients.$inferInsert> = { updatedAt: new Date() }
  if (notes !== undefined) updates.notes = notes
  if (medicalHistory !== undefined) updates.medicalHistory = medicalHistory
  if (phone !== undefined) updates.phone = phone
  if (fullName !== undefined) updates.fullName = fullName

  const [updated] = await db
    .update(patients)
    .set(updates)
    .where(eq(patients.id, id))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
  return NextResponse.json(updated)
}
