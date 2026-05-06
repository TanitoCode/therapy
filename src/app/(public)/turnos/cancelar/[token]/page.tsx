'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type State =
  | 'confirm_prompt'
  | 'loading'
  | 'cancelled'
  | 'already_cancelled'
  | 'not_cancellable'
  | 'expired'
  | 'invalid'
  | 'error'

const EASE = [0.16, 1, 0.3, 1] as const

export default function CancelarPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const router = useRouter()

  const [state, setState] = useState<State>('confirm_prompt')
  const [reason, setReason] = useState('')
  const [countdown, setCountdown] = useState(5)

  // Countdown redirect on success
  useEffect(() => {
    if (state !== 'cancelled' && state !== 'already_cancelled') return
    if (countdown === 0) {
      router.push('/')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, state, router])

  function handleCancel() {
    setState('loading')
    fetch(`/api/appointments/cancel/${token}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}))
        if (res.status === 404) return setState('invalid')
        if (res.status === 410) return setState('expired')
        if (res.status === 422) return setState('not_cancellable')
        if (res.status === 409) return setState('error')
        if (!res.ok) return setState('error')
        if ('appointment_id' in body) return setState('cancelled')
        if (body.status === 'cancelled') return setState('already_cancelled')
        setState('error')
      })
      .catch(() => setState('error'))
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-24 lg:px-8">
      <div className="mx-auto w-full max-w-[480px] text-center">
        <AnimatePresence mode="wait">

          {/* Confirmation prompt */}
          {state === 'confirm_prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-warning-bg,#fef9ec)]">
                <WarningIcon className="h-9 w-9 text-[var(--color-warning,#d97706)]" />
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                  ¿Cancelar turno?
                </h1>
                <p className="mt-3 font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
                  Esta acción no se puede deshacer. Si cambiás de idea, podés reservar un nuevo turno en cualquier momento.
                </p>
              </div>

              {/* Optional reason */}
              <div className="w-full text-left">
                <label
                  htmlFor="reason"
                  className="mb-1.5 block font-[family-name:var(--font-plus-jakarta)] text-xs font-medium text-[var(--text-tertiary)]"
                >
                  Motivo de cancelación (opcional)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Ej: No puedo asistir ese día…"
                  className="w-full resize-none rounded-[var(--radius-base)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none ring-[var(--color-terracota)] transition-shadow focus:ring-1"
                />
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center rounded-[var(--radius-base)] bg-[var(--color-error,#dc2626)] px-6 py-2.5 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-white transition-colors hover:bg-[var(--color-error-hover,#b91c1c)]"
                >
                  Sí, cancelar turno
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-[var(--radius-base)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-2.5 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)]"
                >
                  No, volver al inicio
                </Link>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <svg
                className="h-8 w-8 animate-spin text-[var(--color-terracota)]"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray="31.4 31.4"
                  strokeLinecap="round"
                />
              </svg>
              <p className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)]">
                Procesando cancelación…
              </p>
            </motion.div>
          )}

          {/* Cancelled successfully */}
          {state === 'cancelled' && (
            <motion.div
              key="cancelled"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-bg)]">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
                  <motion.path
                    d="M8 18l6 6 14-12"
                    stroke="var(--color-success)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                  Turno cancelado
                </h1>
                <p className="mt-3 font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
                  Tu turno fue cancelado. Recibirás un email de confirmación en breve.
                </p>
              </div>
              <p className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--text-tertiary)]">
                Redirigiendo en {countdown}s…
              </p>
              <Link
                href="/turnos"
                className="inline-flex items-center rounded-[var(--radius-base)] bg-[var(--color-terracota)] px-6 py-2.5 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-on-accent)] transition-colors hover:bg-[var(--color-terracota-hover)]"
              >
                Reservar nuevo turno
              </Link>
            </motion.div>
          )}

          {/* Already cancelled */}
          {state === 'already_cancelled' && (
            <motion.div
              key="already_cancelled"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-muted)]">
                <InfoIcon className="h-8 w-8 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                  Turno ya cancelado
                </h1>
                <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                  Este turno ya había sido cancelado anteriormente.
                </p>
              </div>
              <p className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--text-tertiary)]">
                Redirigiendo en {countdown}s…
              </p>
              <Link
                href="/turnos"
                className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
              >
                Reservar nuevo turno
              </Link>
            </motion.div>
          )}

          {/* Not cancellable (completed / no_show) */}
          {state === 'not_cancellable' && (
            <motion.div
              key="not_cancellable"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center gap-5"
            >
              <InfoIcon className="h-14 w-14 text-[var(--color-warning,#d97706)]" />
              <div>
                <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                  No es posible cancelar
                </h1>
                <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                  Este turno ya fue realizado y no puede cancelarse. Si tenés dudas, contactanos.
                </p>
              </div>
              <Link
                href="/"
                className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
              >
                Volver al inicio
              </Link>
            </motion.div>
          )}

          {/* Expired */}
          {state === 'expired' && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center gap-5"
            >
              <InfoIcon className="h-14 w-14 text-[var(--color-warning,#d97706)]" />
              <div>
                <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                  Enlace expirado
                </h1>
                <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                  Este enlace ya no es válido (más de 30 días). Contactanos directamente para cancelar.
                </p>
              </div>
              <Link
                href="/"
                className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
              >
                Volver al inicio
              </Link>
            </motion.div>
          )}

          {/* Invalid token */}
          {state === 'invalid' && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center gap-5"
            >
              <ErrorIcon className="h-14 w-14 text-[var(--color-error,#dc2626)]" />
              <div>
                <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                  Enlace inválido
                </h1>
                <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                  No encontramos un turno asociado a este enlace. Verificá que copiaste el link completo del email.
                </p>
              </div>
              <Link
                href="/"
                className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
              >
                Volver al inicio
              </Link>
            </motion.div>
          )}

          {/* Generic error */}
          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center gap-5"
            >
              <ErrorIcon className="h-14 w-14 text-[var(--color-error,#dc2626)]" />
              <div>
                <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                  Error inesperado
                </h1>
                <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                  Ocurrió un error al procesar tu solicitud. Intentá de nuevo o contactanos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setState('confirm_prompt')}
                className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
              >
                Reintentar
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden>
      <path
        d="M15.27 5.34a3 3 0 0 1 5.46 0l11.77 20.4A3 3 0 0 1 29.77 30H6.23a3 3 0 0 1-2.73-4.26z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M18 14v7M18 24v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden>
      <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="2.5" />
      <path d="M28 24v12M28 19v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" fill="none" className={className} aria-hidden>
      <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="2.5" />
      <path d="M20 20l16 16M36 20L20 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
