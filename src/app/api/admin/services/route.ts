import { NextRequest, NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { services } from '@/db/schema/services'
import { requireAdmin } from '@/lib/auth-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().max(1000).optional(),
  durationMin: z.number().int().min(15).max(240).default(45),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#7B8C76'),
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

  const rows = await db.select().from(services).orderBy(asc(services.name))
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
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

  const { name, slug, description, durationMin, color } = parsed.data

  // Unique check
  const [existing] = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.slug, slug))
    .limit(1)

  if (existing) {
    return NextResponse.json({ error: 'Ya existe un servicio con ese slug', code: 'DUPLICATE_SLUG' }, { status: 409 })
  }

  const [service] = await db
    .insert(services)
    .values({ name, slug, description: description ?? null, durationMin, color })
    .returning()

  return NextResponse.json(service, { status: 201 })
}
