'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Schema ────────────────────────────────────────────────────────────────────

const appointmentCreateSchema = z.object({
  patientId: z.string().uuid({ message: 'UUID de paciente inválido' }),
  serviceId: z.string().uuid({ message: 'UUID de servicio inválido' }),
  startAt: z.string().min(1, 'La fecha y hora son requeridas'),
  status: z.enum(['pending', 'confirmed']),
  notes: z.string().max(1000).optional(),
  adminNotes: z.string().max(1000).optional(),
})

type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>

type FormErrors = Partial<Record<keyof AppointmentCreateInput, string>>

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AppointmentFormProps {
  /** ISO string pre-filled when clicking an empty slot */
  defaultStartAt?: string
  onSuccess?: (appointmentId: string) => void
  onCancel?: () => void
}

// ─── Helper: label styles ──────────────────────────────────────────────────────

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

export function AppointmentForm({ defaultStartAt, onSuccess, onCancel }: AppointmentFormProps) {
  // Convert ISO to datetime-local value (strip seconds + timezone)
  const defaultDatetimeLocal = defaultStartAt
    ? new Date(defaultStartAt).toISOString().slice(0, 16)
    : ''

  const [form, setForm] = useState<AppointmentCreateInput>({
    patientId: '',
    serviceId: '',
    startAt: defaultDatetimeLocal,
    status: 'pending',
    notes: '',
    adminNotes: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    // Convert datetime-local to ISO before validating
    const payload = buildPayload()
    const result = appointmentCreateSchema.safeParse(payload)
    if (result.success) {
      setErrors({})
      return true
    }
    const fieldErrors: FormErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof AppointmentCreateInput
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message
      }
    }
    setErrors(fieldErrors)
    return false
  }

  const buildPayload = () => ({
    patientId: form.patientId.trim(),
    serviceId: form.serviceId.trim(),
    // datetime-local is local time without timezone — send as ISO with Z assumption
    // The server stores as-is; in a future step this should use the clinic timezone
    startAt: form.startAt ? new Date(form.startAt).toISOString() : '',
    status: form.status,
    notes: form.notes?.trim() || undefined,
    adminNotes: form.adminNotes?.trim() || undefined,
  })

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        const msg = (json as { error?: string }).error ?? `HTTP ${res.status}`
        toast.error(`Error al crear el turno: ${msg}`)
        return
      }

      const created = await res.json() as { id: string }
      toast.success('Turno creado exitosamente')
      onSuccess?.(created.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error de red al crear el turno')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setField = <K extends keyof AppointmentCreateInput>(key: K, value: AppointmentCreateInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Patient UUID */}
      <div>
        <label htmlFor="appt-patient-id" style={labelStyle}>
          ID Paciente <span style={{ color: 'var(--color-terracota)' }}>*</span>
        </label>
        <Input
          id="appt-patient-id"
          type="text"
          value={form.patientId}
          onChange={(e) => setField('patientId', e.target.value)}
          placeholder="UUID del paciente"
          aria-describedby={errors.patientId ? 'appt-patient-error' : undefined}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderColor: errors.patientId ? 'var(--color-error, #DC2626)' : undefined,
          }}
        />
        {errors.patientId && (
          <p id="appt-patient-error" style={errorStyle}>
            {errors.patientId}
          </p>
        )}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            marginTop: 4,
          }}
        >
          Ingresá el UUID del paciente (la búsqueda por nombre estará disponible en T32)
        </p>
      </div>

      {/* Service UUID */}
      <div>
        <label htmlFor="appt-service-id" style={labelStyle}>
          ID Servicio <span style={{ color: 'var(--color-terracota)' }}>*</span>
        </label>
        <Input
          id="appt-service-id"
          type="text"
          value={form.serviceId}
          onChange={(e) => setField('serviceId', e.target.value)}
          placeholder="UUID del servicio"
          aria-describedby={errors.serviceId ? 'appt-service-error' : undefined}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderColor: errors.serviceId ? 'var(--color-error, #DC2626)' : undefined,
          }}
        />
        {errors.serviceId && (
          <p id="appt-service-error" style={errorStyle}>
            {errors.serviceId}
          </p>
        )}
      </div>

      {/* Start datetime */}
      <div>
        <label htmlFor="appt-start-at" style={labelStyle}>
          Fecha y hora <span style={{ color: 'var(--color-terracota)' }}>*</span>
        </label>
        <Input
          id="appt-start-at"
          type="datetime-local"
          value={form.startAt}
          onChange={(e) => setField('startAt', e.target.value)}
          aria-describedby={errors.startAt ? 'appt-start-error' : undefined}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderColor: errors.startAt ? 'var(--color-error, #DC2626)' : undefined,
          }}
        />
        {errors.startAt && (
          <p id="appt-start-error" style={errorStyle}>
            {errors.startAt}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="appt-status" style={labelStyle}>
          Estado inicial
        </label>
        <Select
          value={form.status}
          onValueChange={(val) => setField('status', val as 'pending' | 'confirmed')}
        >
          <SelectTrigger
            id="appt-status"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient notes */}
      <div>
        <label htmlFor="appt-notes" style={labelStyle}>
          Notas del paciente
        </label>
        <Textarea
          id="appt-notes"
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Notas visibles para el paciente (opcional)"
          rows={2}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Admin notes */}
      <div>
        <label htmlFor="appt-admin-notes" style={labelStyle}>
          Notas admin
        </label>
        <Textarea
          id="appt-admin-notes"
          value={form.adminNotes}
          onChange={(e) => setField('adminNotes', e.target.value)}
          placeholder="Notas internas (no visibles para el paciente)"
          rows={2}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          paddingTop: 4,
        }}
      >
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
          {submitting ? 'Creando...' : 'Crear turno'}
        </button>
      </div>
    </form>
  )
}
