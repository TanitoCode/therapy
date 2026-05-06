'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, CalendarCheck, Clock, TrendingUp } from 'lucide-react'
import { formatDateFull, formatTime } from '@/lib/date'

interface Stats {
  today: number
  week: number
  occupancy_pct: number
  next_appointment: {
    id: string
    startAt: string
    status: string
    patientName: string
    serviceName: string
  } | null
}

export function KPIs() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setStats(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (loading) return <KPISkeleton />

  const cards = [
    {
      label: 'Turnos hoy',
      value: stats?.today ?? 0,
      icon: CalendarDays,
      color: 'var(--color-terracota)',
      bg: 'var(--color-error-bg)',
    },
    {
      label: 'Turnos esta semana',
      value: stats?.week ?? 0,
      icon: CalendarCheck,
      color: 'var(--color-salvia)',
      bg: 'var(--color-success-bg)',
    },
    {
      label: '% ocupación semanal',
      value: `${stats?.occupancy_pct ?? 0}%`,
      icon: TrendingUp,
      color: 'var(--color-bisque)',
      bg: 'var(--color-warning-bg)',
    },
    {
      label: 'Próximo turno',
      value: stats?.next_appointment
        ? formatTime(new Date(stats.next_appointment.startAt))
        : '—',
      sub: stats?.next_appointment
        ? `${stats.next_appointment.patientName} · ${formatDateFull(new Date(stats.next_appointment.startAt)).split(' de ').slice(0, 2).join(' de ')}`
        : 'Sin turnos próximos',
      icon: Clock,
      color: 'var(--color-info,#476A7A)',
      bg: 'var(--color-info-bg,#EBF1F4)',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}
    >
      {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div
          key={label}
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                margin: 0,
              }}
            >
              {label}
            </p>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-base)',
                backgroundColor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden
            >
              <Icon size={16} style={{ color }} />
            </span>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 400,
              color: 'var(--text-emphasis)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </p>

          {sub && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {sub}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function KPISkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ height: 10, width: 80, backgroundColor: 'var(--bg-tertiary)', borderRadius: 4 }} />
            <div style={{ width: 32, height: 32, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-base)' }} />
          </div>
          <div style={{ height: 32, width: 60, backgroundColor: 'var(--bg-tertiary)', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  )
}
