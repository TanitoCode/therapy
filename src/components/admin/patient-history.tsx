'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { format, parseISO, isFuture, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { AppointmentDetail } from '@/components/admin/appointment-detail'

// ─── Types ─────────────────────────────────────────────────────────────────────

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

interface Appointment {
  id: string
  status: AppointmentStatus
  startAt: string
  endAt: string
  notes: string | null
  adminNotes: string | null
  createdAt: string
  service: {
    id: string
    name: string
    durationMin: number
  }
}

interface AppointmentsResponse {
  data: Appointment[]
  total: number
}

// ─── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
  no_show: 'No asistió',
}

const STATUS_STYLES: Record<AppointmentStatus, React.CSSProperties> = {
  pending: { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' },
  confirmed: { backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0' },
  cancelled: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' },
  completed: { backgroundColor: '#EDE9FE', color: '#4C1D95', border: '1px solid #DDD6FE' },
  no_show: { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB' },
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        ...STATUS_STYLES[status],
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function AppointmentSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ height: 20, width: 80, backgroundColor: 'var(--bg-tertiary)', borderRadius: 999 }} />
            <div style={{ height: 14, width: 120, backgroundColor: 'var(--bg-tertiary)', borderRadius: 4 }} />
          </div>
          <div style={{ height: 12, width: '60%', backgroundColor: 'var(--bg-tertiary)', borderRadius: 4 }} />
        </div>
      ))}
    </>
  )
}

// ─── Appointment card ──────────────────────────────────────────────────────────

function AppointmentCard({
  appt,
  onOpen,
}: {
  appt: Appointment
  onOpen: (id: string) => void
}) {
  const startDate = parseISO(appt.startAt)
  const endDate = parseISO(appt.endAt)
  const upcoming = isFuture(startDate) || isToday(startDate)

  const dateLabel = format(startDate, "EEEE d 'de' MMMM yyyy", { locale: es })
  const timeLabel = `${format(startDate, 'HH:mm')} – ${format(endDate, 'HH:mm')}`
  const createdLabel = format(parseISO(appt.createdAt), "d MMM yyyy, HH:mm", { locale: es })

  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: upcoming ? 'var(--bg-canvas)' : 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
      }}
    >
      {/* Upcoming indicator */}
      {upcoming && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            borderRadius: '6px 0 0 6px',
            backgroundColor: 'var(--color-salvia)',
          }}
          aria-hidden
        />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status={appt.status} />
          {upcoming && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-salvia)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
              }}
            >
              Próximo
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpen(appt.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 'var(--radius-base)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            transition: 'background-color 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          Ver detalle
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-emphasis)',
          }}
        >
          {appt.service.name}{' '}
          <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>
            ({appt.service.durationMin} min)
          </span>
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            textTransform: 'capitalize',
          }}
        >
          {dateLabel} · {timeLabel}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
          }}
        >
          Creado: {createdLabel}
        </p>
      </div>

      {appt.notes && (
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            paddingTop: 4,
            borderTop: '1px solid var(--border-color)',
          }}
        >
          &ldquo;{appt.notes}&rdquo;
        </p>
      )}
    </div>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        margin: '0 0 8px 0',
      }}
    >
      {children}
    </h3>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface PatientHistoryProps {
  patientId: string
}

export function PatientHistory({ patientId }: PatientHistoryProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/patients/${patientId}/appointments`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const data: AppointmentsResponse = await res.json()
      // API already returns ordered desc by startAt
      setAppointments(data.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar los turnos')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Split into upcoming (future or today) and past
  const upcoming = appointments.filter((a) => {
    const d = parseISO(a.startAt)
    return isFuture(d) || isToday(d)
  })
  const past = appointments.filter((a) => {
    const d = parseISO(a.startAt)
    return !isFuture(d) && !isToday(d)
  })

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AppointmentSkeleton />
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '2rem 0',
            }}
          >
            Este paciente aún no tiene turnos registrados
          </p>
        )}

        {!loading && upcoming.length > 0 && (
          <div>
            <SectionHeader>Próximos ({upcoming.length})</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} onOpen={setSelectedId} />
              ))}
            </div>
          </div>
        )}

        {!loading && past.length > 0 && (
          <div>
            <SectionHeader>Historial ({past.length})</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {past.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} onOpen={setSelectedId} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Appointment detail dialog (reuse existing component) */}
      <AppointmentDetail
        appointmentId={selectedId}
        onClose={() => setSelectedId(null)}
        onSuccess={() => {
          setSelectedId(null)
          fetchAppointments()
        }}
      />
    </>
  )
}
