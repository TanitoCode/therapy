'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface BlockedSlot {
  id: string
  startAt: string
  endAt: string
  reason: string | null
  recurring: boolean
  createdAt: string
}

interface BlockedSlotFormProps {
  /** If provided, we're editing — otherwise creating */
  slot?: BlockedSlot
  onSuccess?: () => void
  onCancel?: () => void
}

// ─── Validation ────────────────────────────────────────────────────────────────

interface FormState {
  recurring: boolean
  startAt: string
  endAt: string
  reason: string
}

interface FormErrors {
  startAt?: string
  endAt?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.startAt) {
    errors.startAt = 'La fecha de inicio es requerida'
    return errors
  }
  if (!form.endAt) {
    errors.endAt = 'La fecha de fin es requerida'
    return errors
  }
  const start = new Date(form.startAt)
  const end = new Date(form.endAt)
  if (end <= start) {
    errors.endAt = 'La fecha de fin debe ser posterior al inicio'
    return errors
  }
  const diffMs = end.getTime() - start.getTime()
  const diffH = diffMs / (1000 * 60 * 60)
  if (diffH > 24) {
    errors.endAt = 'La duración máxima es 24 horas'
  }
  return errors
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Convert an ISO string or Date to the value expected by datetime-local input */
function toDatetimeLocal(iso: string): string {
  // Slice to "YYYY-MM-DDTHH:mm"
  return new Date(iso).toISOString().slice(0, 16)
}

/** Build ISO from datetime-local string (treating it as local time) */
function datetimeLocalToISO(val: string): string {
  return new Date(val).toISOString()
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 4,
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  color: 'var(--color-error, #DC2626)',
  marginTop: 4,
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function BlockedSlotForm({ slot, onSuccess, onCancel }: BlockedSlotFormProps) {
  const isEditing = !!slot

  const [form, setForm] = useState<FormState>({
    recurring: slot?.recurring ?? false,
    startAt: slot ? toDatetimeLocal(slot.startAt) : '',
    endAt: slot ? toDatetimeLocal(slot.endAt) : '',
    reason: slot?.reason ?? '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)

  // ── Helpers ───────────────────────────────────────────────────────────────

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }))
    setConflictWarning(null)
  }

  // ── Check for appointment conflicts (non-blocking warning) ────────────────

  async function checkConflicts(startISO: string, endISO: string): Promise<void> {
    try {
      const params = new URLSearchParams({
        from: startISO,
        to: endISO,
        status: 'confirmed',
      })
      const res = await fetch(`/api/admin/appointments?${params.toString()}`)
      if (!res.ok) return
      const json = await res.json() as { data?: unknown[] }
      const count = json.data?.length ?? 0
      if (count > 0) {
        setConflictWarning(
          `Hay ${count} turno${count === 1 ? '' : 's'} confirmado${count === 1 ? '' : 's'} en este horario. El bloqueo se creará igualmente.`
        )
      }
    } catch {
      // Silently ignore — warning is non-blocking
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const startISO = datetimeLocalToISO(form.startAt)
    const endISO = datetimeLocalToISO(form.endAt)

    // Check conflicts before saving (non-blocking)
    await checkConflicts(startISO, endISO)

    setSubmitting(true)
    try {
      const payload = {
        startAt: startISO,
        endAt: endISO,
        reason: form.reason.trim() || undefined,
        recurring: form.recurring,
      }

      let res: Response
      if (isEditing) {
        res = await fetch(`/api/admin/blocked-slots/${slot.id}`, {
          method: 'DELETE',
        })
        if (!res.ok && res.status !== 204) {
          const json = await res.json().catch(() => ({}))
          const msg = (json as { error?: string }).error ?? `HTTP ${res.status}`
          toast.error(`Error al eliminar el bloqueo anterior: ${msg}`)
          return
        }
        // Re-create with new values (the API has no PATCH for blocked-slots)
        res = await fetch('/api/admin/blocked-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/blocked-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        const data = json as { error?: string; code?: string }
        if (data.code === 'OVERLAP') {
          toast.error('El bloqueo se superpone con otro existente')
        } else {
          toast.error(data.error ?? `Error HTTP ${res.status}`)
        }
        return
      }

      toast.success(isEditing ? 'Bloqueo actualizado' : 'Bloqueo creado')
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error de red')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Tipo */}
      <div>
        <span style={labelStyle}>Tipo de bloqueo</span>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[
            { value: false, label: 'Puntual' },
            { value: true, label: 'Semanal recurrente' },
          ].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setField('recurring', value)}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-base)',
                border: `1px solid ${form.recurring === value ? 'var(--color-terracota)' : 'var(--border-color)'}`,
                backgroundColor: form.recurring === value ? 'var(--color-error-bg)' : 'transparent',
                color: form.recurring === value ? 'var(--color-terracota)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                fontWeight: form.recurring === value ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {form.recurring && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
            Los bloqueos semanales se repiten en el mismo día de la semana y horario indefinidamente.
          </p>
        )}
      </div>

      {/* Inicio */}
      <div>
        <label htmlFor="bs-start" style={labelStyle}>
          Fecha y hora de inicio <span style={{ color: 'var(--color-terracota)' }}>*</span>
        </label>
        <Input
          id="bs-start"
          type="datetime-local"
          value={form.startAt}
          onChange={(e) => setField('startAt', e.target.value)}
          aria-describedby={errors.startAt ? 'bs-start-error' : undefined}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderColor: errors.startAt ? 'var(--color-error, #DC2626)' : undefined,
          }}
        />
        {errors.startAt && (
          <p id="bs-start-error" style={errorStyle}>{errors.startAt}</p>
        )}
      </div>

      {/* Fin */}
      <div>
        <label htmlFor="bs-end" style={labelStyle}>
          Fecha y hora de fin <span style={{ color: 'var(--color-terracota)' }}>*</span>
        </label>
        <Input
          id="bs-end"
          type="datetime-local"
          value={form.endAt}
          onChange={(e) => setField('endAt', e.target.value)}
          aria-describedby={errors.endAt ? 'bs-end-error' : undefined}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderColor: errors.endAt ? 'var(--color-error, #DC2626)' : undefined,
          }}
        />
        {errors.endAt && (
          <p id="bs-end-error" style={errorStyle}>{errors.endAt}</p>
        )}
      </div>

      {/* Razón */}
      <div>
        <label htmlFor="bs-reason" style={labelStyle}>
          Razón (opcional)
        </label>
        <Input
          id="bs-reason"
          type="text"
          value={form.reason}
          onChange={(e) => setField('reason', e.target.value)}
          placeholder="ej. Feriado, licencia, capacitación..."
          maxLength={500}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
          }}
        />
      </div>

      {/* Conflict warning */}
      {conflictWarning && (
        <div
          role="alert"
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-base)',
            backgroundColor: 'var(--color-warning-bg, #FEF3C7)',
            border: '1px solid var(--color-warning, #D97706)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            color: 'var(--color-warning-text, #92400E)',
          }}
        >
          {conflictWarning}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: '6px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-base)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '6px 20px',
            border: 'none',
            borderRadius: 'var(--radius-base)',
            backgroundColor: 'var(--color-terracota)',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#fff',
            opacity: submitting ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {submitting ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar cambios' : 'Crear bloqueo')}
        </button>
      </div>
    </form>
  )
}
