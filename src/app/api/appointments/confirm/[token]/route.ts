import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { appointments } from '@/db/schema/appointments'

export const dynamic = 'force-dynamic'

const TOKEN_EXPIRY_DAYS = 30

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  const [appt] = await db
    .select({
      id: appointments.id,
      status: appointments.status,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .where(eq(appointments.confirmationToken, token))
    .limit(1)

  if (!appt) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
  }

  const expiryMs = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  if (Date.now() - appt.createdAt.getTime() > expiryMs) {
    return NextResponse.json({ error: 'El enlace expiró' }, { status: 410 })
  }

  if (appt.status !== 'pending') {
    const msg =
      appt.status === 'confirmed'
        ? 'El turno ya estaba confirmado'
        : 'No es posible confirmar este turno'
    return NextResponse.json({ message: msg, status: appt.status }, { status: 200 })
  }

  await db
    .update(appointments)
    .set({ status: 'confirmed', updatedAt: new Date() })
    .where(and(eq(appointments.id, appt.id), eq(appointments.status, 'pending')))

  return NextResponse.json({ message: 'Turno confirmado', appointment_id: appt.id }, { status: 200 })
}
