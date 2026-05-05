import { NextRequest, NextResponse } from 'next/server'
import { asc, ilike, or, SQL } from 'drizzle-orm'
import { db } from '@/db'
import { patients } from '@/db/schema/patients'
import { requireAdmin } from '@/lib/auth-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const listSchema = z.object({
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
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

  const { q, page, per_page } = parsed.data
  const offset = (page - 1) * per_page

  const where: SQL | undefined = q
    ? or(
        ilike(patients.fullName, `%${q}%`),
        ilike(patients.email, `%${q}%`),
        ilike(patients.dni, `%${q}%`),
      )
    : undefined

  const rows = await db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      email: patients.email,
      phone: patients.phone,
      dni: patients.dni,
      birthDate: patients.birthDate,
      createdAt: patients.createdAt,
    })
    .from(patients)
    .where(where)
    .orderBy(asc(patients.fullName))
    .limit(per_page)
    .offset(offset)

  return NextResponse.json({ data: rows, page, per_page })
}
