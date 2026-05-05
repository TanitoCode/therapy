'use client'

import { motion } from 'framer-motion'
import { TESTIMONIALS } from '@/lib/content'

const EASE = [0.16, 1, 0.3, 1] as const

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-[var(--bg-primary)] px-6 py-[clamp(5rem,8vw,10rem)] lg:px-8"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-14"
        >
          <p className="mb-3 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.15em] text-[var(--color-bisque)] uppercase">
            Testimonios
          </p>
          <h2
            id="testimonials-heading"
            className="font-[family-name:var(--font-fraunces)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--text-emphasis)]"
            style={{ fontSize: 'clamp(2.5rem, 3.5vw + 1rem, 4rem)' }}
          >
            Lo que dicen<br />
            <em className="not-italic text-[var(--color-terracota)]">nuestros pacientes.</em>
          </h2>
        </motion.div>

        {/* Grid — 2 cols desktop, 1 col mobile */}
        <div className="grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}
              aria-label={`Testimonio de ${t.author}`}
              className={[
                'relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] p-7',
                // First card gets the featured treatment
                i === 0
                  ? 'bg-[var(--color-terracota)] md:col-span-2'
                  : 'bg-[var(--bg-canvas)]',
              ].join(' ')}
            >
              {/* Quote mark — decorative */}
              <span
                aria-hidden
                className={[
                  'absolute -right-2 -top-4 font-[family-name:var(--font-fraunces)] text-8xl font-light leading-none select-none',
                  i === 0
                    ? 'text-white opacity-10'
                    : 'text-[var(--color-terracota)] opacity-10',
                ].join(' ')}
              >
                &ldquo;
              </span>

              {/* Stars */}
              <div className="mb-4 flex gap-1" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: t.rating }).map((_, si) => (
                  <StarIcon
                    key={si}
                    className={[
                      'h-4 w-4',
                      i === 0 ? 'text-[rgba(255,255,255,0.7)]' : 'text-[var(--color-bisque)]',
                    ].join(' ')}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote
                className={[
                  'font-[family-name:var(--font-plus-jakarta)] text-base leading-relaxed',
                  i === 0
                    ? 'text-[var(--text-on-accent)]'
                    : 'text-[var(--text-secondary)]',
                  i === 0 ? 'md:text-lg' : '',
                ].join(' ')}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <footer className="mt-6 flex items-center gap-3">
                {/* Avatar initial */}
                <div
                  aria-hidden
                  className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    i === 0
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  {t.author[0]}
                </div>
                <div>
                  <p
                    className={[
                      'font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold',
                      i === 0 ? 'text-white' : 'text-[var(--text-primary)]',
                    ].join(' ')}
                  >
                    {t.author}
                  </p>
                  <p
                    className={[
                      'font-[family-name:var(--font-plus-jakarta)] text-xs',
                      i === 0 ? 'text-white/70' : 'text-[var(--text-tertiary)]',
                    ].join(' ')}
                  >
                    {t.treatment}
                  </p>
                </div>
              </footer>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.7 4.08L8 10.4l-3.7 2.1.7-4.08L2 5.5l4.15-.75L8 1z" />
    </svg>
  )
}
