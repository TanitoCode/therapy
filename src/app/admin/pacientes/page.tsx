import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PatientsTable } from '@/components/admin/patients-table'

export const metadata: Metadata = {
  title: 'Pacientes — Therapy Admin',
  robots: { index: false },
}

function PatientsTableSkeleton() {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar skeleton */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            height: 36,
            width: 260,
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-base)',
          }}
        />
      </div>
      {/* Row skeletons */}
      <div style={{ padding: '0.5rem 0' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.2fr 1fr 1.2fr 0.7fr 0.8fr',
              gap: '0.75rem',
              padding: '0.875rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              alignItems: 'center',
            }}
          >
            {Array.from({ length: 7 }).map((_, j) => (
              <div
                key={j}
                style={{
                  height: 12,
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 4,
                  width: j === 6 ? 60 : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PacientesPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Page header */}
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 400,
            color: 'var(--text-emphasis)',
            letterSpacing: 'var(--tracking-tight)',
            margin: 0,
          }}
        >
          Pacientes
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginTop: '0.25rem',
          }}
        >
          Listado completo de pacientes registrados
        </p>
      </div>

      <Suspense fallback={<PatientsTableSkeleton />}>
        <PatientsTable />
      </Suspense>
    </div>
  )
}
