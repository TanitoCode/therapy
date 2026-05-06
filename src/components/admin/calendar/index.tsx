'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { WeekView } from './week-view'
import { MonthView } from './month-view'
import { DayView } from './day-view'
import type { CalendarAppointment, CalendarService, CalendarViewType } from './types'

// --- API response types ---
interface AppointmentRow {
  id: string
  status: CalendarAppointment['status']
  startAt: string
  endAt: string
  notes: string | null
  adminNotes: string | null
  createdAt: string
  patient: {
    id: string
    fullName: string
    email: string
    phone: string | null
  }
  service: {
    id: string
    name: string
    durationMin: number
  }
}

interface AppointmentsResponse {
  data: AppointmentRow[]
  page: number
  per_page: number
}

interface ServicesResponse {
  data: CalendarService[]
}

// --- Skeleton ---
function CalendarSkeleton() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
      aria-busy="true"
      aria-label="Cargando calendario..."
    >
      {/* Header skeleton */}
      <div
        style={{
          height: 48,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-secondary)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      {/* Grid skeleton */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 80,
            borderRadius: 'var(--radius-base)',
            backgroundColor: 'var(--bg-secondary)',
            opacity: 1 - i * 0.12,
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

// --- View toggle button ---
function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 14px',
        border: 'none',
        borderRadius: 'var(--radius-base)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8125rem',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
        backgroundColor: active ? 'var(--color-terracota)' : 'transparent',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      {children}
    </button>
  )
}

// --- Nav button ---
function NavButton({
  onClick,
  children,
  ariaLabel,
}: {
  onClick: () => void
  children: React.ReactNode
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-base)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
        e.currentTarget.style.borderColor = 'var(--border-color-emphasis)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.borderColor = 'var(--border-color)'
      }}
    >
      {children}
    </button>
  )
}

// --- Main CalendarView ---
export interface CalendarViewHandle {
  onAppointmentClick?: (appointment: CalendarAppointment) => void
  onSlotClick?: (date: Date) => void
}

interface CalendarViewProps {
  onAppointmentClick?: (appointment: CalendarAppointment) => void
  onSlotClick?: (date: Date) => void
}

export function CalendarView({ onAppointmentClick, onSlotClick }: CalendarViewProps) {
  const [view, setView] = useState<CalendarViewType>('week')
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serviceColorMap, setServiceColorMap] = useState<Map<string, string>>(new Map())

  // Load services for color mapping once
  useEffect(() => {
    fetch('/api/admin/services')
      .then((r) => r.json())
      .then((json: ServicesResponse) => {
        const map = new Map<string, string>()
        json.data?.forEach((s) => map.set(s.id, s.color))
        setServiceColorMap(map)
      })
      .catch(() => {
        // Non-critical — colors will fall back to default salvia
      })
  }, [])

  // Compute date range for the current view
  const dateRange = useCallback(() => {
    if (view === 'week') {
      return {
        from: startOfWeek(currentDate, { weekStartsOn: 1 }),
        to: endOfWeek(currentDate, { weekStartsOn: 1 }),
      }
    }
    if (view === 'month') {
      return {
        from: startOfMonth(currentDate),
        to: endOfMonth(currentDate),
      }
    }
    // day
    const start = new Date(currentDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(currentDate)
    end.setHours(23, 59, 59, 999)
    return { from: start, to: end }
  }, [view, currentDate])

  // Fetch appointments when view or date changes
  useEffect(() => {
    const { from, to } = dateRange()
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
      per_page: '100',
    })

    fetch(`/api/admin/appointments?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<AppointmentsResponse>
      })
      .then((json) => {
        const enriched: CalendarAppointment[] = (json.data ?? []).map((row) => ({
          ...row,
          serviceColor: serviceColorMap.get(row.service.id) ?? '#7B8C76',
        }))
        setAppointments(enriched)
      })
      .catch(() => {
        setError('No se pudieron cargar los turnos. Verificá tu conexión.')
      })
      .finally(() => setLoading(false))
  }, [view, currentDate, dateRange, serviceColorMap])

  // Navigation handlers
  const goToday = () => setCurrentDate(new Date())

  const goPrev = () => {
    if (view === 'week') setCurrentDate((d) => addWeeks(d, -1))
    else if (view === 'month') setCurrentDate((d) => addMonths(d, -1))
    else setCurrentDate((d) => addDays(d, -1))
  }

  const goNext = () => {
    if (view === 'week') setCurrentDate((d) => addWeeks(d, 1))
    else if (view === 'month') setCurrentDate((d) => addMonths(d, 1))
    else setCurrentDate((d) => addDays(d, 1))
  }

  // Current period label
  const periodLabel = (() => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      const startStr = format(start, 'd MMM', { locale: es })
      const endStr = format(end, 'd MMM yyyy', { locale: es })
      return `${startStr} – ${endStr}`
    }
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: es })
    }
    return format(currentDate, "EEEE d 'de' MMMM", { locale: es })
  })()

  const handleAppointmentClick = (appt: CalendarAppointment) => {
    onAppointmentClick?.(appt)
  }

  const handleSlotClick = (date: Date) => {
    onSlotClick?.(date)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 160px)',
        minHeight: 500,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* ── Calendar Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-canvas)',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {/* Left: navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavButton onClick={goPrev} ariaLabel="Período anterior">
            ‹
          </NavButton>
          <NavButton onClick={goNext} ariaLabel="Período siguiente">
            ›
          </NavButton>
          <button
            type="button"
            onClick={goToday}
            style={{
              padding: '5px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-base)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Hoy
          </button>
        </div>

        {/* Center: period label */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 400,
            color: 'var(--text-emphasis)',
            letterSpacing: 'var(--tracking-tight)',
            margin: 0,
            flex: 1,
            textAlign: 'center',
            textTransform: 'capitalize',
          }}
        >
          {periodLabel}
        </h2>

        {/* Right: view toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: 3,
          }}
        >
          <ViewButton active={view === 'day'} onClick={() => setView('day')}>
            Día
          </ViewButton>
          <ViewButton active={view === 'week'} onClick={() => setView('week')}>
            Semana
          </ViewButton>
          <ViewButton active={view === 'month'} onClick={() => setView('month')}>
            Mes
          </ViewButton>
        </div>
      </div>

      {/* ── Calendar Body ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {loading && (
          <div style={{ padding: '1rem' }}>
            <CalendarSkeleton />
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 12,
              padding: '2rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-error)',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
            <button
              type="button"
              onClick={() => setCurrentDate((d) => new Date(d))}
              style={{
                padding: '6px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-base)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ height: '100%' }}
            >
              {view === 'week' && (
                <WeekView
                  appointments={appointments}
                  currentDate={currentDate}
                  onAppointmentClick={handleAppointmentClick}
                  onSlotClick={handleSlotClick}
                />
              )}
              {view === 'month' && (
                <MonthView
                  appointments={appointments}
                  currentDate={currentDate}
                  onAppointmentClick={handleAppointmentClick}
                  onSlotClick={handleSlotClick}
                />
              )}
              {view === 'day' && (
                <DayView
                  appointments={appointments}
                  currentDate={currentDate}
                  onAppointmentClick={handleAppointmentClick}
                  onSlotClick={handleSlotClick}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
