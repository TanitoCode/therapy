'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

export type ServiceItem = {
  id: string
  name: string
  slug: string
  description: string | null
  durationMin: number
  color: string
}

/* ── Asymmetric grid: 1 featured + up to 2 secondary ── */
export function ServicesGrid({ services }: { services: ServiceItem[] }) {
  if (services.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="py-12 text-center"
      >
        <p className="font-[family-name:var(--font-plus-jakarta)] text-base text-[var(--text-tertiary)]">
          Los servicios estarán disponibles próximamente.
        </p>
      </motion.div>
    )
  }

  const [featured, ...rest] = services

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      {/* Featured card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <FeaturedCard service={featured} />
      </motion.div>

      {/* Secondary stack */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-4">
          {rest.slice(0, 2).map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.08 }}
              className="flex-1"
            >
              <SecondaryCard service={service} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Featured card ── */
function FeaturedCard({ service }: { service: ServiceItem }) {
  return (
    <article
      className="group relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-canvas)] p-8 shadow-[var(--shadow-base)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)] lg:p-10"
      aria-label={service.name}
    >
      {/* Accent left border */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-[var(--radius-lg)] transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: service.color }}
        aria-hidden
      />

      {/* Background glow on hover */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]"
        style={{ backgroundColor: service.color, filter: 'blur(48px)' }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-6">
        {/* Icon */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)]"
          style={{ backgroundColor: `${service.color}18` }}
          aria-hidden
        >
          <ServiceIcon slug={service.slug} color={service.color} size={28} />
        </div>

        <div>
          {/* Eyebrow — duration */}
          <p className="mb-2 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.12em] text-[var(--text-tertiary)] uppercase">
            {service.durationMin} min por sesión
          </p>

          {/* Name */}
          <h3 className="font-[family-name:var(--font-fraunces)] text-3xl font-light leading-tight tracking-[-0.02em] text-[var(--text-emphasis)]">
            {service.name}
          </h3>

          {/* Description */}
          {service.description && (
            <p className="mt-3 max-w-[48ch] font-[family-name:var(--font-plus-jakarta)] text-base leading-relaxed text-[var(--text-secondary)]">
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="relative mt-8">
        <Link
          href={`/turnos?service=${service.slug}`}
          className="inline-flex items-center gap-2 rounded-[var(--radius-base)] px-6 py-2.5 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:shadow-[var(--shadow-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: service.color,
            outlineColor: service.color,
          }}
        >
          Reservar turno
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

/* ── Secondary card ── */
function SecondaryCard({ service }: { service: ServiceItem }) {
  return (
    <article
      className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] p-6 transition-shadow duration-300 hover:shadow-[var(--shadow-base)]"
      aria-label={service.name}
    >
      {/* Top accent line */}
      <div
        className="absolute left-0 right-0 top-0 h-0.5 rounded-t-[var(--radius-lg)]"
        style={{ backgroundColor: service.color }}
        aria-hidden
      />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-base)]"
          style={{ backgroundColor: `${service.color}1A` }}
          aria-hidden
        >
          <ServiceIcon slug={service.slug} color={service.color} size={20} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Duration */}
          <p className="mb-1 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.10em] text-[var(--text-tertiary)] uppercase">
            {service.durationMin} min
          </p>
          {/* Name */}
          <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-light leading-snug tracking-[-0.01em] text-[var(--text-emphasis)]">
            {service.name}
          </h3>
          {/* Description — clamped */}
          {service.description && (
            <p className="mt-2 line-clamp-2 font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* CTA ghost */}
      <Link
        href={`/turnos?service=${service.slug}`}
        className="mt-4 inline-flex items-center gap-1.5 self-start font-[family-name:var(--font-plus-jakarta)] text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ color: service.color, outlineColor: service.color }}
      >
        Reservar
        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </article>
  )
}

/* ── Service icons — custom SVG per specialty slug ── */
function ServiceIcon({
  slug,
  color,
  size = 24,
}: {
  slug: string
  color: string
  size?: number
}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  // Match by slug keywords
  const key = slug.toLowerCase()

  if (key.includes('deport') || key.includes('sport')) {
    // Kinesiología deportiva — stylized movement/velocity
    return (
      <svg {...props}>
        <path d="M5 12c0-1.1.4-2.1 1-2.9L9 5.5" />
        <path d="M9 5.5c.8-.5 1.7-.5 2.5 0l3.5 2.5" />
        <circle cx="15" cy="5" r="1.5" />
        <path d="M13 9l2 5-4 3" />
        <path d="M11 17l-2 3" />
        <path d="M15 14l2 4" />
      </svg>
    )
  }

  if (key.includes('neuro')) {
    // Kinesiología neurológica — neural network pattern
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="2" />
        <circle cx="5" cy="7" r="1.5" />
        <circle cx="19" cy="7" r="1.5" />
        <circle cx="5" cy="17" r="1.5" />
        <circle cx="19" cy="17" r="1.5" />
        <path d="M10 12 6.2 8.2M14 12l3.8-3.8M10 12 6.2 15.8M14 12l3.8 3.8" />
      </svg>
    )
  }

  // Default — traumatología / rehab (stylized joint/spine)
  return (
    <svg {...props}>
      <path d="M12 3v4M12 17v4" />
      <path d="M8 7h8M8 17h8" />
      <path d="M9 7v10" />
      <path d="M15 7v10" />
      <path d="M9 12h6" />
    </svg>
  )
}

/* ── Icons ── */
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}
