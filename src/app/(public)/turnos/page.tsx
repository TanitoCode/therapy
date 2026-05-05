import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { services } from '@/db/schema/services'
import { Wizard } from '@/components/booking/wizard'

export const dynamic = 'force-dynamic'

export default async function TurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const { service: serviceSlug } = await searchParams

  const rows = await db
    .select({
      id: services.id,
      name: services.name,
      slug: services.slug,
      description: services.description,
      durationMin: services.durationMin,
      color: services.color,
    })
    .from(services)
    .where(eq(services.active, true))
    .orderBy(services.name)

  return <Wizard services={rows} initialSlug={serviceSlug} />
}
