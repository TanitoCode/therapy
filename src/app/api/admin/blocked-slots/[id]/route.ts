import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { blockedSlots } from '@/db/schema/blocked-slots'
import { requireAdmin } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

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

  const deleted = await db
    .delete(blockedSlots)
    .where(eq(blockedSlots.id, id))
    .returning({ id: blockedSlots.id })

  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Bloqueo no encontrado' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
