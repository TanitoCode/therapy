import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { services } from '@/db/schema/services'
import { servicesResponseSchema } from '@/lib/validators/services'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(services)
      .where(eq(services.active, true))
      .orderBy(services.name)

    const parsed = servicesResponseSchema.parse(rows)

    return NextResponse.json(parsed, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('[GET /api/services]', error)
    return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 })
  }
}
