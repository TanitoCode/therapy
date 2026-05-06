'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

// ─── Types ────────────────────────────────────────────────────────────────────

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

interface AppointmentDetail {
  id: string
  status: AppointmentStatus
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

interface AppointmentDetailProps {
  appointmentId: string | null
  onClose: () => void
  onSuccess?: () => void
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
  no_show: 'No asistió',
}

const STATUS_STYLES: Record<AppointmentStatus, React.CSSProperties> = {
  pending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    border: '1px solid #FDE68A',
  },
  confirmed: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    border: '1px solid #A7F3D0',
  },
  cancelled: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FECACA',
  },
  completed: {
    backgroundColor: '#EDE9FE',
    color: '#4C1D95',
    border: '1px solid #DDD6FE',
  },
  no_show: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: '1px solid #D1D5DB',
  },
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
        ...STATUS_STYLES[status],
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 8,
        alignItems: 'start',
        padding: '8px 0',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          paddingTop: 2,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--text-emphasis)',
        }}
      >
        {children}
      </span>
    </div>
  )
}

// ─── Action button ─────────────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode
}

function ActionButton({ onClick, disabled, variant = 'secondary', children }: ActionButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 14px',
    borderRadius: 'var(--radius-base)',
    fontSize: '0.8125rem',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 0.15s ease, opacity 0.15s ease',
    border: 'none',
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-salvia)',
      color: '#fff',
    },
    secondary: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-emphasis)',
      border: '1px solid var(--border-color)',
    },
    danger: {
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
      border: '1px solid #FECACA',
    },
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  )
}

// ─── Delete confirmation ───────────────────────────────────────────────────────

function DeleteConfirmation({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: '#7F1D1D',
          margin: 0,
        }}
      >
        Esta acción marcará el turno como cancelado. ¿Confirmar eliminación?
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <ActionButton variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Eliminando...' : 'Sí, eliminar'}
        </ActionButton>
        <ActionButton variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </ActionButton>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AppointmentDetail({ appointmentId, onClose, onSuccess }: AppointmentDetailProps) {
  const [appt, setAppt] = useState<AppointmentDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Admin notes edit state
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Status action loading
  const [statusLoading, setStatusLoading] = useState(false)

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Track previous appt for optimistic rollback
  const prevApptRef = useRef<AppointmentDetail | null>(null)

  const isOpen = appointmentId !== null

  // ── Fetch appointment ──────────────────────────────────────────────────────

  const fetchAppt = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/appointments/${id}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const data: AppointmentDetail = await res.json()
      setAppt(data)
      setAdminNotes(data.adminNotes ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el turno')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !appointmentId) {
      // Reset state when dialog closes
      setAppt(null)
      setError(null)
      setShowDeleteConfirm(false)
      setAdminNotes('')
      return
    }
    fetchAppt(appointmentId)
  }, [appointmentId, isOpen, fetchAppt])

  // ── Status change (optimistic) ──────────────────────────────────────────────

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    if (!appt) return
    prevApptRef.current = appt

    // Optimistic update
    setAppt((prev) => prev ? { ...prev, status: newStatus } : prev)
    setStatusLoading(true)

    try {
      const res = await fetch(`/api/admin/appointments/${appt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      toast.success(`Turno marcado como "${STATUS_LABELS[newStatus]}"`)
      onSuccess?.()
    } catch (err) {
      // Rollback on error
      setAppt(prevApptRef.current)
      toast.error(err instanceof Error ? err.message : 'Error al actualizar el estado')
    } finally {
      setStatusLoading(false)
    }
  }

  // ── Save admin notes ────────────────────────────────────────────────────────

  const handleSaveNotes = async () => {
    if (!appt) return
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/appointments/${appt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: adminNotes || null }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      setAppt((prev) => prev ? { ...prev, adminNotes: adminNotes || null } : prev)
      toast.success('Notas guardadas')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar las notas')
    } finally {
      setSavingNotes(false)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!appt) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/appointments/${appt.id}`, {
        method: 'DELETE',
      })
      if (!res.ok && res.status !== 204) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      toast.success('Turno eliminado')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar el turno')
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // ── Status actions config ──────────────────────────────────────────────────

  const statusActions: Record<AppointmentStatus, Array<{ label: string; status: AppointmentStatus; variant: 'primary' | 'secondary' | 'danger' }>> = {
    pending: [
      { label: 'Confirmar', status: 'confirmed', variant: 'primary' },
      { label: 'Cancelar turno', status: 'cancelled', variant: 'danger' },
    ],
    confirmed: [
      { label: 'Completar', status: 'completed', variant: 'primary' },
      { label: 'No asistió', status: 'no_show', variant: 'secondary' },
      { label: 'Cancelar turno', status: 'cancelled', variant: 'danger' },
    ],
    cancelled: [],
    completed: [],
    no_show: [],
  }

  const actions = appt ? statusActions[appt.status] : []
  const isReadOnly = appt ? ['cancelled', 'completed', 'no_show'].includes(appt.status) : false

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="sm:max-w-[520px]"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <DialogHeader
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-canvas)',
          }}
        >
          <DialogTitle
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 400,
              color: 'var(--text-emphasis)',
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            Detalle del turno
          </DialogTitle>
          <DialogDescription style={{ display: 'none' }}>
            Información completa y acciones para el turno seleccionado
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', maxHeight: '70vh' }}>
          {/* Loading */}
          {loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--text-tertiary)',
                }}
              >
                Cargando...
              </span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '2rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  color: 'var(--color-error, #DC2626)',
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
              <button
                type="button"
                onClick={() => appointmentId && fetchAppt(appointmentId)}
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

          {/* Content */}
          {appt && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Status badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <StatusBadge status={appt.status} />
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  ID: {appt.id.slice(0, 8)}...
                </span>
              </div>

              {/* Fields */}
              <FieldRow label="Paciente">
                <Link
                  href={`/admin/pacientes/${appt.patient.id}`}
                  style={{
                    color: 'var(--color-terracota)',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  {appt.patient.fullName}
                </Link>
              </FieldRow>

              <FieldRow label="Email">
                <a
                  href={`mailto:${appt.patient.email}`}
                  style={{
                    color: 'var(--color-terracota)',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  {appt.patient.email}
                </a>
              </FieldRow>

              {appt.patient.phone && (
                <FieldRow label="Teléfono">
                  <a
                    href={`tel:${appt.patient.phone}`}
                    style={{
                      color: 'var(--color-terracota)',
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                    }}
                  >
                    {appt.patient.phone}
                  </a>
                </FieldRow>
              )}

              <FieldRow label="Servicio">
                {appt.service.name}{' '}
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  ({appt.service.durationMin} min)
                </span>
              </FieldRow>

              <FieldRow label="Fecha">
                {format(new Date(appt.startAt), "EEEE d 'de' MMMM yyyy", { locale: es })}
              </FieldRow>

              <FieldRow label="Horario">
                {format(new Date(appt.startAt), 'HH:mm')} –{' '}
                {format(new Date(appt.endAt), 'HH:mm')}
              </FieldRow>

              <FieldRow label="Creado">
                {format(new Date(appt.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
              </FieldRow>

              {appt.notes && (
                <FieldRow label="Notas paciente">
                  <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    {appt.notes}
                  </span>
                </FieldRow>
              )}

              {/* Admin notes */}
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <label
                  htmlFor="admin-notes"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Notas admin
                </label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notas internas (no visibles para el paciente)"
                  rows={3}
                  disabled={isReadOnly || savingNotes}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    backgroundColor: isReadOnly ? 'var(--bg-secondary)' : undefined,
                  }}
                />
                {!isReadOnly && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ActionButton
                      variant="secondary"
                      onClick={handleSaveNotes}
                      disabled={savingNotes || adminNotes === (appt.adminNotes ?? '')}
                    >
                      {savingNotes ? 'Guardando...' : 'Guardar notas'}
                    </ActionButton>
                  </div>
                )}
              </div>

              {/* Delete confirmation panel */}
              {showDeleteConfirm && (
                <div style={{ marginTop: 16 }}>
                  <DeleteConfirmation
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    loading={deleting}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {appt && !loading && !error && (
          <div
            style={{
              padding: '12px 24px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-canvas)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Status actions */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {actions.map((action) => (
                <ActionButton
                  key={action.status}
                  variant={action.variant}
                  onClick={() => handleStatusChange(action.status)}
                  disabled={statusLoading}
                >
                  {statusLoading ? '...' : action.label}
                </ActionButton>
              ))}
            </div>

            {/* Delete button (right side) */}
            {!isReadOnly && !showDeleteConfirm && (
              <ActionButton
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={statusLoading || deleting}
              >
                Eliminar turno
              </ActionButton>
            )}

            {/* Read-only label */}
            {isReadOnly && (
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic',
                }}
              >
                Turno finalizado — solo lectura
              </span>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
