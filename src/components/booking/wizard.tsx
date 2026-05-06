'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBookingState, type ServiceItem } from '@/hooks/use-booking-state'
import { ServiceStep } from './service-step'
import { CalendarStep } from './calendar-step'
import { PatientStep } from './patient-step'
import { ConfirmationStep } from './confirmation-step'

const EASE = [0.16, 1, 0.3, 1] as const

const STEPS = [
  { n: 1, label: 'Servicio' },
  { n: 2, label: 'Fecha y hora' },
  { n: 3, label: 'Tus datos' },
  { n: 4, label: 'Confirmación' },
] as const

interface WizardProps {
  services: ServiceItem[]
  initialSlug?: string
}

export function Wizard({ services, initialSlug }: WizardProps) {
  const { step, selectedSlot, setService, prevStep, nextStep } = useBookingState()

  // Pre-select service from ?service= query param on mount
  useEffect(() => {
    if (initialSlug) {
      const match = services.find((s) => s.slug === initialSlug)
      if (match) setService(match)
    }
    // intentionally run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canContinue = step === 2 && selectedSlot !== null

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-[clamp(4rem,6vw,8rem)] lg:px-8">
      {/* ── Step progress indicator ── */}
      <nav aria-label="Progreso de reserva" className="mb-10">
        <ol className="flex items-center">
          {STEPS.map((s, i) => {
            const isDone = step > s.n
            const isActive = step === s.n
            return (
              <li key={s.n} className="flex items-center">
                <div className="flex items-center gap-2">
                  {/* Circle */}
                  <div
                    aria-current={isActive ? 'step' : undefined}
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold transition-all duration-300',
                      isDone
                        ? 'bg-[var(--color-terracota)] text-white'
                        : isActive
                          ? 'border-2 border-[var(--color-terracota)] text-[var(--color-terracota)]'
                          : 'border border-[var(--border-color-subtle)] text-[var(--text-tertiary)]',
                    ].join(' ')}
                  >
                    {isDone ? (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      s.n
                    )}
                  </div>
                  {/* Label — sr-only on xs so screen readers always get step name */}
                  <span
                    className={[
                      'sr-only font-[family-name:var(--font-plus-jakarta)] text-xs sm:not-sr-only sm:block',
                      isActive
                        ? 'font-semibold text-[var(--text-primary)]'
                        : isDone
                          ? 'text-[var(--text-secondary)]'
                          : 'text-[var(--text-tertiary)]',
                    ].join(' ')}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    className={[
                      'mx-2 h-px w-6 transition-colors duration-300 sm:w-10',
                      isDone ? 'bg-[var(--color-terracota)]' : 'bg-[var(--border-color-subtle)]',
                    ].join(' ')}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* ── Back button — only on steps 2 and 3; step 4 (confirmation) has its own CTAs ── */}
      {step > 1 && step < 4 && (
        <button
          type="button"
          onClick={prevStep}
          className="mb-6 flex items-center gap-1.5 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M10 12L6 8l4-4" />
          </svg>
          Volver
        </button>
      )}

      {/* ── Step content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {step === 1 && <ServiceStep services={services} />}
          {step === 2 && <CalendarStep />}
          {step === 3 && <PatientStep />}
          {step === 4 && <ConfirmationStep />}
        </motion.div>
      </AnimatePresence>

      {/* ── Continue CTA — only on step 2 when slot selected; step 3 has its own form submit ── */}
      {canContinue && step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-8 flex justify-end"
        >
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-[var(--radius-base)] bg-[var(--color-terracota)] px-7 py-3 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--color-terracota-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracota)]"
          >
            Continuar
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 12l4-4-4-4" />
            </svg>
          </button>
        </motion.div>
      )}
    </div>
  )
}
