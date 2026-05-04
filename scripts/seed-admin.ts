/**
 * Crea el primer usuario admin directamente en DB (sin pasar por Better Auth API).
 * El databaseHooks.user.create.before bloquea creación vía API pública — este script
 * inserta directamente para saltear ese hook.
 *
 * Uso:  npm run seed:admin -- --email admin@example.com --password mipassword
 * Env fallback: SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en .env
 */
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import { user, account } from '../src/db/schema/auth'
import { hashPassword } from 'better-auth/crypto'
import { randomUUID } from 'crypto'

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL no está definida en .env')
  process.exit(1)
}

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  return idx !== -1 ? process.argv[idx + 1] : undefined
}

const email = getArg('--email') ?? process.env.SEED_ADMIN_EMAIL
const password = getArg('--password') ?? process.env.SEED_ADMIN_PASSWORD

if (!email || !password) {
  console.error(
    'ERROR: Pasá --email y --password, o definí SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en .env',
  )
  process.exit(1)
}

if (password.length < 8) {
  console.error('ERROR: La contraseña debe tener al menos 8 caracteres')
  process.exit(1)
}

const client = postgres(process.env.DATABASE_URL, { prepare: false })
const db = drizzle(client)

async function main() {
  const existing = await db.select().from(user).where(eq(user.email, email!)).limit(1)

  if (existing.length > 0) {
    const u = existing[0]
    if (u.role === 'admin') {
      console.log(`✓ Ya existe un admin con email ${email} (id: ${u.id})`)
    } else {
      await db.update(user).set({ role: 'admin', updatedAt: new Date() }).where(eq(user.email, email!))
      console.log(`✓ Usuario ${email} actualizado a role='admin'`)
    }
    await client.end()
    return
  }

  const hashed = await hashPassword(password!)
  const userId = randomUUID()

  await db.insert(user).values({
    id: userId,
    name: email!.split('@')[0],
    email: email!,
    emailVerified: true,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  console.log(`✓ Admin creado: ${email} (id: ${userId})`)
  await client.end()
}

main().catch((err) => {
  console.error('ERROR:', err.message ?? err)
  process.exit(1)
})
