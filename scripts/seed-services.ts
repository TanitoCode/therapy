import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { services } from '../src/db/schema/services'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const client = postgres(process.env.DATABASE_URL, { prepare: false })
const db = drizzle(client)

const servicesSeed = [
  {
    name: 'Kinesiología Deportiva',
    slug: 'kinesiologia-deportiva',
    description: 'Tratamiento y rehabilitación de lesiones deportivas. Evaluación funcional, fortalecimiento muscular y retorno a la actividad física.',
    durationMin: 45,
    color: '#7B8C76',
    active: true,
  },
  {
    name: 'Rehabilitación Traumatológica',
    slug: 'rehabilitacion-traumatologica',
    description: 'Rehabilitación post-quirúrgica y tratamiento de lesiones traumatológicas. Fracturas, esguinces, tendinitis y patologías articulares.',
    durationMin: 45,
    color: '#8C7B76',
    active: true,
  },
  {
    name: 'Kinesiología Neurológica',
    slug: 'kinesiologia-neurologica',
    description: 'Rehabilitación de pacientes con patologías neurológicas. ACV, Parkinson, esclerosis múltiple y otras condiciones del sistema nervioso.',
    durationMin: 60,
    color: '#768C7B',
    active: true,
  },
]

async function seed() {
  console.log('Seeding services...')

  for (const service of servicesSeed) {
    await db
      .insert(services)
      .values(service)
      .onConflictDoNothing({ target: services.slug })
    console.log(`  - ${service.name} (${service.slug})`)
  }

  console.log('Services seeded successfully.')
  await client.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
