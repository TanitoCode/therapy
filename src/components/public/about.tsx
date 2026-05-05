'use client'

import { motion } from 'framer-motion'
import { ABOUT } from '@/lib/content'

const EASE = [0.16, 1, 0.3, 1] as const

export function About() {
  return (
    <section
      id="nosotros"
      aria-labelledby="about-heading"
      className="bg-[var(--bg-canvas)] px-6 py-[clamp(5rem,8vw,10rem)] lg:px-8"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid items-start gap-16 lg:grid-cols-[55fr_45fr]">

          {/* ── Text column ── */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-4 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.15em] text-[var(--color-bisque)] uppercase"
            >
              {ABOUT.eyebrow}
            </motion.p>

            <motion.h2
              id="about-heading"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
              className="font-[family-name:var(--font-fraunces)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--text-emphasis)]"
              style={{ fontSize: 'clamp(2.5rem, 3.5vw + 1rem, 4rem)' }}
            >
              {ABOUT.heading}
            </motion.h2>

            {/* Bio paragraphs */}
            <div className="mt-8 flex flex-col gap-4">
              {ABOUT.bio.map((paragraph, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.07 }}
                  className="max-w-[58ch] font-[family-name:var(--font-plus-jakarta)] text-base leading-relaxed text-[var(--text-secondary)]"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Credentials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
              className="mt-10"
            >
              <p className="mb-4 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.12em] text-[var(--text-tertiary)] uppercase">
                Formación y habilitaciones
              </p>
              <ul className="flex flex-col gap-3" role="list">
                {ABOUT.credentials.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-terracota)] opacity-70"
                    />
                    <div>
                      <span className="font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]">
                        {c.label}
                      </span>
                      <span className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)]">
                        {' '}— {c.institution}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
              className="mt-10 flex flex-wrap gap-8 border-t border-[var(--border-color-subtle)] pt-8"
            >
              {ABOUT.stats.map((stat, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="font-[family-name:var(--font-fraunces)] text-3xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                    {stat.value}
                  </span>
                  <span className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--text-tertiary)]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Media column ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="hidden lg:block"
            aria-hidden
          >
            <AboutMedia />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/**
 * CSS-only placeholder. Replace with <Image> when image-agent delivers about.jpg.
 */
function AboutMedia() {
  return (
    <div
      data-placeholder="about-image"
      className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-secondary)]"
      role="img"
      aria-label="Foto de la kinesióloga — próximamente"
    >
      {/* Salvia glow top */}
      <div
        className="absolute -left-8 -top-8 h-56 w-56 rounded-full bg-[var(--color-salvia)] opacity-20"
        style={{ filter: 'blur(56px)' }}
      />
      {/* Bisque glow bottom */}
      <div
        className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-[var(--color-bisque)] opacity-25"
        style={{ filter: 'blur(40px)' }}
      />

      {/* Offset decorative frame */}
      <div className="absolute inset-5 rounded-[var(--radius-base)] border border-[var(--border-color-subtle)]" />
      <div className="absolute inset-8 rounded-[var(--radius-base)] border border-[var(--border-color-subtle)] opacity-40" />

      {/* Credential badge */}
      <div className="absolute bottom-8 left-8 right-8 rounded-[var(--radius-md)] border border-[var(--border-color-subtle)] bg-[var(--bg-overlay)] px-4 py-3 backdrop-blur-sm">
        <p className="font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.10em] text-[var(--text-tertiary)] uppercase">
          Lic. en Kinesiología
        </p>
        <p className="mt-0.5 font-[family-name:var(--font-fraunces)] text-base font-light text-[var(--text-emphasis)]">
          Mat. KIN-4821
        </p>
      </div>
    </div>
  )
}
