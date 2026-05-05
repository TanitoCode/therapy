import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { services } from '@/db/schema/services'
import { requireAdmin } from '@/lib/auth-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  durationMin: z.number().int().min(15).max(240).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  active: z.boolean().optional(),
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
  const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1)
  if (!service) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
  return NextResponse.json(service)
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

  const updates: Partial<typeof services.$inferInsert> = { updatedAt: new Date() }
  const { name, description, durationMin, color, active } = parsed.data
  if (name !== undefined) updates.name = name
  if (description !== undefined) updates.description = description
  if (durationMin !== undefined) updates.durationMin = durationMin
  if (color !== undefined) updates.color = color
  if (active !== undefined) updates.active = active

  const [updated] = await db
    .update(services)
    .set(updates)
    .where(eq(services.id, id))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
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

  // Soft delete — no borrar físicamente (puede haber turnos referenciando)
  const [updated] = await db
    .update(services)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning({ id: services.id })

  if (!updated) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
