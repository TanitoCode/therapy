'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeIn, slideUp, stagger } from '@/lib/motion'

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[var(--bg-canvas)] pt-16"
    >
      {/* Background accent — diffuse warm glow top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-[var(--color-terracota)] opacity-[0.05]"
        style={{ filter: 'blur(120px)' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 py-20 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[55fr_45fr]">

          {/* ── Text column ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-[600px]"
          >
            {/* Eyebrow */}
            <motion.p
              variants={fadeIn}
              className="mb-6 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.15em] text-[var(--color-bisque)] uppercase"
            >
              Kinesiología · Buenos Aires
            </motion.p>

            {/* Headline */}
            <motion.h1
              id="hero-heading"
              variants={slideUp}
              className="font-[family-name:var(--font-fraunces)] font-light leading-[0.92] tracking-[-0.03em] text-[var(--text-emphasis)]"
              style={{ fontSize: 'clamp(3.5rem, 6vw + 1.5rem, 7rem)' }}
            >
              Movimiento
              <br />
              <em className="not-italic text-[var(--color-terracota)]">que sana.</em>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={slideUp}
              className="mt-8 max-w-[52ch] font-[family-name:var(--font-plus-jakarta)] text-lg leading-relaxed text-[var(--text-secondary)]"
            >
              Atención personalizada en kinesiología deportiva, neurológica y traumatológica. Reservá tu turno online en minutos.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeIn} className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/turnos"
                className="inline-flex items-center gap-2 rounded-[var(--radius-base)] bg-[var(--color-terracota)] px-7 py-3.5 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--color-terracota-hover)] hover:shadow-[var(--shadow-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracota)]"
              >
                Reservar Turno
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>

              <Link
                href="/#servicios"
                className="inline-flex items-center gap-2 rounded-[var(--radius-base)] border border-[var(--border-color)] px-7 py-3.5 font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--color-terracota)] hover:text-[var(--color-terracota)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracota)]"
              >
                Ver servicios
              </Link>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              variants={fadeIn}
              className="mt-12 flex flex-wrap items-center gap-6"
            >
              <TrustItem value="+10 años" label="de experiencia clínica" />
              <Divider />
              <TrustItem value="3 especialidades" label="deporte, neuro, traumato" />
              <Divider />
              <TrustItem value="Lun–Vie" label="09:00 a 19:00" />
            </motion.div>
          </motion.div>

          {/* ── Media column ── */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            className="relative hidden lg:block"
          >
            <HeroMedia />
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex h-8 w-5 items-start justify-center rounded-full border border-[var(--border-color)] pt-1.5"
        >
          <div className="h-2 w-0.5 rounded-full bg-[var(--text-tertiary)]" />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function TrustItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-[family-name:var(--font-fraunces)] text-2xl font-light leading-none tracking-[-0.02em] text-[var(--text-emphasis)]">
        {value}
      </span>
      <span className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--text-tertiary)]">
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return (
    <div
      aria-hidden
      className="h-8 w-px bg-[var(--border-color)]"
    />
  )
}

/**
 * Placeholder editorial — replaced by next/image when image-agent delivers hero.png.
 * Uses only brand colors + CSS geometry. No external URLs.
 */
function HeroMedia() {
  return (
    <div
      data-placeholder="hero-image"
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-secondary)]"
      role="img"
      aria-label="Imagen del consultorio — próximamente"
    >
      {/* Warm glow — terracota top-right */}
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-[var(--color-terracota)] opacity-20"
        style={{ filter: 'blur(64px)' }}
      />

      {/* Salvia glow — bottom-left */}
      <div
        aria-hidden
        className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-[var(--color-salvia)] opacity-25"
        style={{ filter: 'blur(48px)' }}
      />

      {/* Bisque horizontal stripe — editorial detail */}
      <div
        aria-hidden
        className="absolute left-8 right-8 top-[38%] h-px bg-[var(--color-bisque)] opacity-40"
      />
      <div
        aria-hidden
        className="absolute left-8 right-8 top-[40%] h-px bg-[var(--color-bisque)] opacity-20"
      />

      {/* Inner frame */}
      <div
        aria-hidden
        className="absolute inset-6 rounded-[var(--radius-base)] border border-[var(--border-color-subtle)]"
      />

      {/* Corner accents */}
      <div
        aria-hidden
        className="absolute bottom-6 right-6 h-12 w-12 border-b border-r border-[var(--color-terracota)] opacity-35 rounded-br-[var(--radius-sm)]"
      />
      <div
        aria-hidden
        className="absolute left-6 top-6 h-12 w-12 border-l border-t border-[var(--color-salvia)] opacity-35 rounded-tl-[var(--radius-sm)]"
      />

      {/* Wordmark center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div
          aria-hidden
          className="h-px w-10 bg-[var(--color-bisque)] opacity-60"
        />
        <p className="font-[family-name:var(--font-fraunces)] text-base font-light tracking-[0.08em] text-[var(--text-tertiary)]">
          Consultorio
        </p>
        <p className="font-[family-name:var(--font-plus-jakarta)] text-xs tracking-[0.15em] text-[var(--text-tertiary)] opacity-60 uppercase">
          Buenos Aires
        </p>
        <div
          aria-hidden
          className="h-px w-10 bg-[var(--color-bisque)] opacity-60"
        />
      </div>
    </div>
  )
}

/* ── Icon ──────────────────────────────────────────────────────────────────── */

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
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}
