import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { cache } from 'react'

// Cached per-request session fetch (React cache — una sola llamada por request)
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
})

// Require auth — lanza error si no hay sesión activa
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

// Require admin — lanza error si no está autenticado o no es admin
export async function requireAdmin() {
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  if (session.user.role !== 'admin') {
    throw new Error('FORBIDDEN')
  }
  return session
}
