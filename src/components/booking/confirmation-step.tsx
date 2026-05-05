'use client'

import Link from 'next/link'
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { useBookingState } from '@/hooks/use-booking-state'

const EASE = [0.16, 1, 0.3, 1] as const

function formatSlotTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-36 shrink-0 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.08em] text-[var(--text-tertiary)] uppercase">
        {label}
      </span>
      <span className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-primary)]">
        {value}
      </span>
    </div>
  )
}

export function ConfirmationStep() {
  const { selectedService, selectedDate, selectedSlot, patientData, reset } = useBookingState()

  const selectedDateObj = selectedDate
    ? parse(selectedDate, 'yyyy-MM-dd', new Date())
    : null

  return (
    <div className="mx-auto max-w-[640px]">
      {/* ── Success icon + heading ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-10 flex flex-col items-center text-center"
      >
        {/* Animated checkmark circle */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-bg)]">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden
          >
            <motion.path
              d="M8 18l6 6 14-12"
              stroke="var(--color-success)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            />
          </svg>
        </div>

        <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-light leading-tight tracking-[-0.02em] text-[var(--text-emphasis)] sm:text-4xl">
          ¡Turno reservado!
        </h2>
        <p className="mt-3 max-w-[42ch] font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
          Tu solicitud fue recibida. Revisá tu correo para confirmar la asistencia — el turno queda reservado hasta que confirmes.
        </p>
      </motion.div>

      {/* ── Booking detail card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
        className="mb-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-color-subtle)] bg-[var(--bg-canvas)]"
      >
        {/* Card header — service color accent */}
        {selectedService && (
          <div
            className="px-6 py-4"
            style={{ backgroundColor: selectedService.color + '12' }}
          >
            <div className="flex items-center gap-2">
              <div
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: selectedService.color }}
              />
              <span
                className="font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold"
                style={{ color: selectedService.color }}
              >
                {selectedService.name}
              </span>
            </div>
          </div>
        )}

        {/* Detail rows */}
        <div className="divide-y divide-[var(--border-color-subtle)] px-6">
          {selectedDateObj && (
            <DetailRow
              label="Fecha"
              value={format(selectedDateObj, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
            />
          )}
          {selectedSlot && (
            <DetailRow
              label="Horario"
              value={`${formatSlotTime(selectedSlot.start_at)} hs`}
            />
          )}
          {selectedService && (
            <DetailRow
              label="Duración"
              value={`${selectedService.durationMin} minutos`}
            />
          )}
          {patientData?.fullName && (
            <DetailRow label="Paciente" value={patientData.fullName} />
          )}
          {patientData?.email && (
            <DetailRow label="Email" value={patientData.email} />
          )}
        </div>
      </motion.div>

      {/* ── Email note ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.25 }}
        className="mb-8 flex items-start gap-3 rounded-[var(--radius-base)] bg-[var(--color-info-bg)] px-4 py-3"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="mt-0.5 shrink-0 text-[var(--color-info)]"
          aria-hidden
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--color-info)]">
          Enviamos un email a{' '}
          <span className="font-semibold">{patientData?.email}</span>{' '}
          con el link para confirmar o cancelar tu turno.
        </p>
      </motion.div>

      {/* ── CTAs ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Link
          href="/"
          onClick={reset}
          className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-base)] bg-[var(--color-terracota)] px-6 py-3 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--color-terracota-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracota)]"
        >
          Ir al inicio
        </Link>
        <button
          type="button"
          onClick={reset}
          className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-base)] border border-[var(--border-color)] bg-transparent px-6 py-3 font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)] transition-all duration-200 hover:bg-[var(--bg-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracota)]"
        >
          Reservar otro turno
        </button>
      </motion.div>
    </div>
  )
}
