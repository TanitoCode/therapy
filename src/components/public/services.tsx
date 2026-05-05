import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { services } from '@/db/schema/services'
import { ServicesGrid } from './services-grid'

export async function Services() {
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

  return (
    <section
      id="servicios"
      aria-labelledby="servicios-heading"
      className="bg-[var(--bg-primary)] px-6 py-[clamp(5rem,8vw,10rem)] lg:px-8"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Section header */}
        <div className="mb-14 max-w-[540px]">
          <p className="mb-3 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.15em] text-[var(--color-bisque)] uppercase">
            Nuestros servicios
          </p>
          <h2
            id="servicios-heading"
            className="font-[family-name:var(--font-fraunces)] text-[var(--text-4xl)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--text-emphasis)]"
            style={{ fontSize: 'clamp(2.5rem, 3.5vw + 1rem, 4rem)' }}
          >
            Especialidades
          </h2>
          <p className="mt-4 font-[family-name:var(--font-plus-jakarta)] text-base leading-relaxed text-[var(--text-secondary)]">
            Cada tratamiento es diseñado a medida según tu diagnóstico y objetivos.
          </p>
        </div>

        <ServicesGrid services={rows} />
      </div>
    </section>
  )
}
