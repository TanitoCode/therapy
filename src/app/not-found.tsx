import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada — Therapy',
  robots: { index: false },
}

export default function NotFound() {
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
      {/* Decorative number */}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(6rem, 15vw, 12rem)',
          fontWeight: 300,
          color: 'var(--color-bisque-light)',
          lineHeight: 1,
          margin: '0 0 0.5rem',
          letterSpacing: '-0.04em',
        }}
        aria-hidden
      >
        404
      </p>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 400,
          color: 'var(--text-emphasis)',
          letterSpacing: '-0.02em',
          margin: '0 0 1rem',
        }}
      >
        Página no encontrada
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          maxWidth: '380px',
          lineHeight: 1.6,
          margin: '0 0 2.5rem',
        }}
      >
        La página que buscás no existe o fue movida. Podés volver al inicio o reservar un turno.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-on-accent)',
            backgroundColor: 'var(--color-terracota)',
            padding: '0.75rem 1.75rem',
            borderRadius: 'var(--radius-base)',
            textDecoration: 'none',
            transition: 'background-color 0.15s',
          }}
        >
          Volver al inicio
        </Link>
        <Link
          href="/turnos"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-terracota)',
            border: '1.5px solid var(--color-terracota)',
            padding: '0.75rem 1.75rem',
            borderRadius: 'var(--radius-base)',
            textDecoration: 'none',
            transition: 'background-color 0.15s',
            backgroundColor: 'transparent',
          }}
        >
          Reservar turno
        </Link>
      </div>
    </main>
  )
}
