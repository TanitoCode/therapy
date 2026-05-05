'use client'

import { motion } from 'framer-motion'
import { useBookingState, type ServiceItem } from '@/hooks/use-booking-state'

const EASE = [0.16, 1, 0.3, 1] as const

function ServiceIcon({ slug, color, size = 24 }: { slug: string; color: string; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  const key = slug.toLowerCase()

  if (key.includes('deport') || key.includes('sport')) {
    return (
      <svg {...p}>
        <path d="M5 12c0-1.1.4-2.1 1-2.9L9 5.5" />
        <path d="M9 5.5c.8-.5 1.7-.5 2.5 0l3.5 2.5" />
        <circle cx="15" cy="5" r="1.5" />
        <path d="M13 9l2 5-4 3" />
        <path d="M11 17l-2 3M15 14l2 4" />
      </svg>
    )
  }
  if (key.includes('neuro')) {
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="2" />
        <circle cx="5" cy="7" r="1.5" /><circle cx="19" cy="7" r="1.5" />
        <circle cx="5" cy="17" r="1.5" /><circle cx="19" cy="17" r="1.5" />
        <path d="M10 12 6.2 8.2M14 12l3.8-3.8M10 12 6.2 15.8M14 12l3.8 3.8" />
      </svg>
    )
  }
  return (
    <svg {...p}>
      <path d="M12 3v4M12 17v4M8 7h8M8 17h8M9 7v10M15 7v10M9 12h6" />
    </svg>
  )
}

export function ServiceStep({ services }: { services: ServiceItem[] }) {
  const { setService, selectedService } = useBookingState()

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-8"
      >
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-light leading-tight tracking-[-0.02em] text-[var(--text-emphasis)] sm:text-3xl">
          ¿Qué servicio necesitás?
        </h2>
        <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)]">
          Seleccioná la especialidad para ver la disponibilidad de turnos.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const isSelected = selectedService?.id === service.id
          return (
            <motion.button
              key={service.id}
              type="button"
              onClick={() => setService(service)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}
              aria-pressed={isSelected}
              className={[
                'group relative flex flex-col items-start gap-4 overflow-hidden rounded-[var(--radius-lg)] border p-6 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                isSelected
                  ? 'bg-[var(--bg-secondary)] shadow-[var(--shadow-base)]'
                  : 'border-[var(--border-color-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-color)] hover:shadow-[var(--shadow-sm)]',
              ].join(' ')}
              style={{
                outlineColor: service.color,
                borderColor: isSelected ? service.color + '50' : undefined,
              }}
            >
              {/* Left accent bar */}
              <div
                aria-hidden
                className={[
                  'absolute left-0 top-0 h-full w-0.5 rounded-l-[var(--radius-lg)] transition-opacity duration-200',
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40',
                ].join(' ')}
                style={{ backgroundColor: service.color }}
              />

              {/* Icon */}
              <div
                aria-hidden
                className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]"
                style={{ backgroundColor: service.color + '18' }}
              >
                <ServiceIcon slug={service.slug} color={service.color} size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.1em] text-[var(--text-tertiary)] uppercase">
                  {service.durationMin} min por sesión
                </p>
                <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-light leading-snug tracking-[-0.01em] text-[var(--text-emphasis)]">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="mt-1.5 line-clamp-2 font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div
                  aria-hidden
                  className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: service.color }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
