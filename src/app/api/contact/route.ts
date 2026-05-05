import { NextRequest, NextResponse } from 'next/server'
import { contactSchema } from '@/lib/validators/contact'
import { checkRateLimit } from '@/lib/rate-limit'
import { CONTACT_RATE_LIMIT } from '@/lib/constants'

export const dynamic = 'force-dynamic'

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { success: allowed } = await checkRateLimit(
    `contact:${ip}`,
    CONTACT_RATE_LIMIT.requests,
    CONTACT_RATE_LIMIT.windowMs,
  )

  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Esperá unos minutos e intentá de nuevo.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  // T26: send contact email via Resend
  console.info('[contact] message from', parsed.data.email)

  return NextResponse.json({ ok: true }, { status: 200 })
}
