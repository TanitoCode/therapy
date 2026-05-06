'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { BanIcon, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { BlockedSlotForm, type BlockedSlot } from '@/components/admin/blocked-slot-form'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(iso))
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-2xl)',
  fontWeight: 400,
  color: 'var(--text-emphasis)',
  letterSpacing: 'var(--tracking-tight)',
  margin: 0,
}

const subheadStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--text-tertiary)',
  marginTop: '0.25rem',
}

const thStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '0.5rem 0.875rem',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--border-color)',
}

const tdStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
  padding: '0.75rem 0.875rem',
  verticalAlign: 'middle',
}

// ─── Page component ────────────────────────────────────────────────────────────

export default function BloqueosPage() {
  const [slots, setSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<BlockedSlot | undefined>(undefined)

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blocked-slots')
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        toast.error((json as { error?: string }).error ?? 'Error al cargar bloqueos')
        return
      }
      const json = await res.json() as { data: BlockedSlot[] }
      setSlots(json.data)
    } catch {
      toast.error('Error de red al cargar bloqueos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSlots()
  }, [fetchSlots])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCreate = () => {
    setEditingSlot(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (slot: BlockedSlot) => {
    setEditingSlot(slot)
    setDialogOpen(true)
  }

  const handleDelete = async (slot: BlockedSlot) => {
    const label = slot.reason ? `"${slot.reason}"` : formatDateTime(slot.startAt)
    if (!window.confirm(`¿Eliminar el bloqueo ${label}?`)) return

    try {
      const res = await fetch(`/api/admin/blocked-slots/${slot.id}`, { method: 'DELETE' })
      if (res.status === 204 || res.ok) {
        toast.success('Bloqueo eliminado')
        await fetchSlots()
      } else {
        const json = await res.json().catch(() => ({}))
        toast.error((json as { error?: string }).error ?? `Error HTTP ${res.status}`)
      }
    } catch {
      toast.error('Error de red al eliminar')
    }
  }

  const handleFormSuccess = async () => {
    setDialogOpen(false)
    setEditingSlot(undefined)
    await fetchSlots()
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={headingStyle}>Bloqueos de horario</h1>
          <p style={subheadStyle}>Gestioná períodos en los que no se aceptan turnos</p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            border: 'none',
            borderRadius: 'var(--radius-base)',
            backgroundColor: 'var(--color-terracota)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
            flexShrink: 0,
          }}
        >
          <Plus size={15} />
          Nuevo bloqueo
        </button>
      </div>

      {/* Table card */}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <RefreshCw
              size={20}
              style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }}
            />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Cargando bloqueos...
            </p>
          </div>
        ) : slots.length === 0 ? (
          /* Empty state */
          <div
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <BanIcon size={32} style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              No hay bloqueos activos
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Creá un bloqueo para restringir la agenda en una fecha o de forma semanal.
            </p>
          </div>
        ) : (
          /* Table */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-canvas)' }}>
                  <th style={thStyle}>Inicio</th>
                  <th style={thStyle}>Fin</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Razón</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, idx) => (
                  <tr
                    key={slot.id}
                    style={{
                      borderTop: idx === 0 ? undefined : '1px solid var(--border-color-subtle, var(--border-color))',
                    }}
                  >
                    <td style={tdStyle}>{formatDateTime(slot.startAt)}</td>
                    <td style={tdStyle}>{formatDateTime(slot.endAt)}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          fontFamily: 'var(--font-body)',
                          backgroundColor: slot.recurring ? 'var(--color-salvia-bg, #EDF2ED)' : 'var(--bg-secondary)',
                          color: slot.recurring ? 'var(--color-salvia, #7B8C76)' : 'var(--text-secondary)',
                          border: `1px solid ${slot.recurring ? 'var(--color-salvia, #7B8C76)' : 'var(--border-color)'}`,
                        }}
                      >
                        {slot.recurring ? 'Semanal' : 'Puntual'}
                      </span>
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        color: slot.reason ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        fontStyle: slot.reason ? 'normal' : 'italic',
                        maxWidth: 260,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {slot.reason ?? '—'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(slot)}
                          aria-label="Editar bloqueo"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 30,
                            height: 30,
                            borderRadius: 'var(--radius-base)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.15s',
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(slot)}
                          aria-label="Eliminar bloqueo"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 30,
                            height: 30,
                            borderRadius: 'var(--radius-base)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--color-error, #DC2626)',
                            transition: 'all 0.15s',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false)
            setEditingSlot(undefined)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-[480px]"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            padding: 0,
            overflow: 'hidden',
          }}
        >
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
              {editingSlot ? 'Editar bloqueo' : 'Nuevo bloqueo'}
            </DialogTitle>
            <DialogDescription style={{ display: 'none' }}>
              {editingSlot ? 'Editá los datos del bloqueo de horario' : 'Creá un nuevo bloqueo de horario'}
            </DialogDescription>
          </DialogHeader>
          <div style={{ padding: '20px 24px' }}>
            <BlockedSlotForm
              slot={editingSlot}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setDialogOpen(false)
                setEditingSlot(undefined)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
