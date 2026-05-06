import type { Metadata } from 'next'
import { KPIs } from '@/components/admin/kpis'
import { DashboardClient } from '@/components/admin/dashboard-client'

export const metadata: Metadata = {
  title: 'Dashboard — Therapy Admin',
  robots: { index: false },
}

export default function DashboardPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        height: '100%',
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
          Calendario
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginTop: '0.25rem',
          }}
        >
          Gestión de turnos y disponibilidad
        </p>
      </div>

      {/* KPIs — auto-revalidate cada 60s */}
      <KPIs />

      {/* Calendar + dialogs — Client Component */}
      <DashboardClient />
    </div>
  )
}
