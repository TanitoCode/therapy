'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

type State =
  | 'loading'
  | 'confirmed'
  | 'already_confirmed'
  | 'not_confirmable'
  | 'expired'
  | 'invalid'
  | 'error'

const EASE = [0.16, 1, 0.3, 1] as const

export default function ConfirmarPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const router = useRouter()

  const [state, setState] = useState<State>('loading')
  const [countdown, setCountdown] = useState(5)

  // Auto-confirm on mount — the GET endpoint confirms immediately
  useEffect(() => {
    fetch(`/api/appointments/confirm/${token}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}))
        if (res.status === 404) return setState('invalid')
        if (res.status === 410) return setState('expired')
        if (!res.ok) return setState('error')
        // 200 — differentiate newly confirmed vs already confirmed
        if ('appointment_id' in body) return setState('confirmed')
        if (body.status === 'confirmed') return setState('already_confirmed')
        setState('not_confirmable')
      })
      .catch(() => setState('error'))
  }, [token])

  // Countdown redirect on success states
  useEffect(() => {
    if (state !== 'confirmed' && state !== 'already_confirmed') return
    if (countdown === 0) {
      router.push('/')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, state, router])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-24 lg:px-8">
      <div className="mx-auto w-full max-w-[480px] text-center">
        {/* Loading */}
        {state === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <svg
              className="h-8 w-8 animate-spin text-[var(--color-terracota)]"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            <p className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)]">
              Confirmando tu turno…
            </p>
          </motion.div>
        )}

        {/* Success — newly confirmed */}
        {state === 'confirmed' && (
          <motion.div
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
                ¡Turno confirmado!
              </h1>
              <p className="mt-3 font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
                Tu asistencia fue registrada. Te esperamos.
              </p>
            </div>
            <p className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--text-tertiary)]">
              Redirigiendo en {countdown}s…
            </p>
            <Link
              href="/"
              className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
            >
              Ir al inicio
            </Link>
          </motion.div>
        )}

        {/* Already confirmed */}
        {state === 'already_confirmed' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-bg)]">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
                <path d="M6 14l5 5 11-10" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                Turno ya confirmado
              </h1>
              <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                Tu turno ya estaba confirmado. ¡Te esperamos!
              </p>
            </div>
            <p className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--text-tertiary)]">
              Redirigiendo en {countdown}s…
            </p>
            <Link
              href="/"
              className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
            >
              Ir al inicio
            </Link>
          </motion.div>
        )}

        {/* Not confirmable (e.g. cancelled) */}
        {state === 'not_confirmable' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center gap-5"
          >
            <InfoIcon className="h-14 w-14 text-[var(--color-warning)]" />
            <div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                No es posible confirmar
              </h1>
              <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                Este turno ya no puede ser confirmado. Si tenés dudas, contactanos.
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center gap-5"
          >
            <InfoIcon className="h-14 w-14 text-[var(--color-warning)]" />
            <div>
              <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-light tracking-[-0.02em] text-[var(--text-emphasis)]">
                Enlace expirado
              </h1>
              <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                Este enlace de confirmación ya no es válido (más de 30 días). Reservá un nuevo turno.
              </p>
            </div>
            <Link
              href="/turnos"
              className="inline-flex items-center rounded-[var(--radius-base)] bg-[var(--color-terracota)] px-6 py-2.5 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-on-accent)] transition-colors hover:bg-[var(--color-terracota-hover)]"
            >
              Reservar nuevo turno
            </Link>
          </motion.div>
        )}

        {/* Invalid token */}
        {state === 'invalid' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center gap-5"
          >
            <ErrorIcon className="h-14 w-14 text-[var(--color-error)]" />
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center gap-5"
          >
            <ErrorIcon className="h-14 w-14 text-[var(--color-error)]" />
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
              onClick={() => { setState('loading'); setCountdown(5) }}
              className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
            >
              Reintentar
            </button>
          </motion.div>
        )}
      </div>
    </div>
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
