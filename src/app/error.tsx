'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--bg-canvas)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'var(--color-error-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
        aria-hidden
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="var(--color-error)" strokeWidth="2" />
          <path d="M14 9v6M14 18v2" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 400,
          color: 'var(--text-emphasis)',
          letterSpacing: '-0.02em',
          margin: '0 0 0.75rem',
        }}
      >
        Algo salió mal
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          maxWidth: '360px',
          lineHeight: 1.6,
          margin: '0 0 2rem',
        }}
      >
        Ocurrió un error inesperado. Si el problema persiste, contactanos.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={reset}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-on-accent)',
            backgroundColor: 'var(--color-terracota)',
            padding: '0.75rem 1.75rem',
            borderRadius: 'var(--radius-base)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
        >
          Reintentar
        </button>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            border: '1.5px solid var(--border-color)',
            padding: '0.75rem 1.75rem',
            borderRadius: 'var(--radius-base)',
            textDecoration: 'none',
            backgroundColor: 'transparent',
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
