import { NextRequest, NextResponse } from 'next/server'
import { and, eq, lt, gt } from 'drizzle-orm'
import { db } from '@/db'
import { blockedSlots } from '@/db/schema/blocked-slots'
import { auditLog } from '@/db/schema/audit'
import { requireAdmin } from '@/lib/auth-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string().max(500).optional(),
  recurring: z.boolean().default(false),
}).refine((d) => new Date(d.endAt) > new Date(d.startAt), {
  message: 'endAt debe ser posterior a startAt',
  path: ['endAt'],
})

export async function GET(_request: NextRequest) {
  try {
    await requireAdmin()
  } catch (err) {
    const e = err as Error
    return NextResponse.json(
      { error: e.message === 'UNAUTHORIZED' ? 'No autenticado' : 'Acceso denegado' },
      { status: e.message === 'UNAUTHORIZED' ? 401 : 403 },
    )
  }

  const rows = await db
    .select()
    .from(blockedSlots)
    .orderBy(blockedSlots.startAt)

  return NextResponse.json({ data: rows })
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

  const { startAt: startAtStr, endAt: endAtStr, reason, recurring } = parsed.data
  const startAt = new Date(startAtStr)
  const endAt = new Date(endAtStr)

  // Overlap check (non-recurring only)
  if (!recurring) {
    const overlap = await db
      .select({ id: blockedSlots.id })
      .from(blockedSlots)
      .where(
        and(
          eq(blockedSlots.recurring, false),
          lt(blockedSlots.startAt, endAt),
          gt(blockedSlots.endAt, startAt),
        ),
      )
      .limit(1)

    if (overlap.length > 0) {
      return NextResponse.json(
        { error: 'El bloqueo se superpone con otro existente', code: 'OVERLAP' },
        { status: 409 },
      )
    }
  }

  const [slot] = await db
    .insert(blockedSlots)
    .values({ startAt, endAt, reason: reason ?? null, recurring })
    .returning()

  await db.insert(auditLog).values({
    actorId: session.user.id,
    actorType: 'admin',
    action: 'blocked_slot.created',
    resourceType: 'blocked_slot',
    resourceId: slot.id,
    metadata: { startAt: startAt.toISOString(), endAt: endAt.toISOString(), recurring },
  })

  return NextResponse.json(slot, { status: 201 })
}
