'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  durationMin: number
  color: string
  active: boolean
  createdAt: string
  updatedAt: string
}

interface ServiceFormProps {
  service?: Service
  onSuccess?: () => void
  onCancel?: () => void
}

// ─── Slug auto-generation ──────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 100)
}

// ─── Validation ────────────────────────────────────────────────────────────────

interface FormState {
  name: string
  slug: string
  description: string
  durationMin: number
  color: string
  active: boolean
}

interface FormErrors {
  name?: string
  slug?: string
  durationMin?: string
  color?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
  }
  if (!form.slug.trim() || form.slug.trim().length < 2) {
    errors.slug = 'El slug es requerido (mín. 2 caracteres)'
  } else if (!/^[a-z0-9-]+$/.test(form.slug.trim())) {
    errors.slug = 'Solo letras minúsculas, números y guiones'
  }
  if (form.durationMin < 15 || form.durationMin > 240) {
    errors.durationMin = 'La duración debe estar entre 15 y 240 minutos'
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(form.color)) {
    errors.color = 'Color inválido (debe ser #RRGGBB)'
  }
  return errors
}

// ─── Styles ────────────────────────────────────────────────────────────────────

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

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  color: 'var(--text-tertiary)',
  marginTop: 4,
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const isEditing = !!service

  const [form, setForm] = useState<FormState>({
    name: service?.name ?? '',
    slug: service?.slug ?? '',
    description: service?.description ?? '',
    durationMin: service?.durationMin ?? 45,
    color: service?.color ?? '#7B8C76',
    active: service?.active ?? true,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleNameChange = (value: string) => {
    setField('name', value)
    if (!slugManuallyEdited) {
      setField('slug', toSlug(value))
    }
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setField('slug', value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      let res: Response
      if (isEditing) {
        // PATCH — only send editable fields (slug is immutable after create)
        const payload: Record<string, unknown> = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          durationMin: form.durationMin,
          color: form.color,
          active: form.active,
        }
        res = await fetch(`/api/admin/services/${service.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          durationMin: form.durationMin,
          color: form.color,
        }
        res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        const data = json as { error?: string; code?: string }
        if (data.code === 'DUPLICATE_SLUG') {
          setErrors({ slug: 'Ya existe un servicio con ese slug' })
        } else {
          toast.error(data.error ?? `Error HTTP ${res.status}`)
        }
        return
      }

      toast.success(isEditing ? 'Servicio actualizado' : 'Servicio creado')
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
      {/* Nombre */}
      <div>
        <label htmlFor="svc-name" style={labelStyle}>
          Nombre <span style={{ color: 'var(--color-terracota)' }}>*</span>
        </label>
        <Input
          id="svc-name"
          type="text"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="ej. Kinesiología deportiva"
          maxLength={200}
          aria-describedby={errors.name ? 'svc-name-error' : undefined}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderColor: errors.name ? 'var(--color-error, #DC2626)' : undefined,
          }}
        />
        {errors.name && <p id="svc-name-error" style={errorStyle}>{errors.name}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="svc-slug" style={labelStyle}>
          Slug <span style={{ color: 'var(--color-terracota)' }}>*</span>
          {isEditing && (
            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
              (no editable)
            </span>
          )}
        </label>
        <Input
          id="svc-slug"
          type="text"
          value={form.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="ej. kinesiologia-deportiva"
          maxLength={100}
          disabled={isEditing}
          aria-describedby={errors.slug ? 'svc-slug-error' : 'svc-slug-hint'}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderColor: errors.slug ? 'var(--color-error, #DC2626)' : undefined,
            opacity: isEditing ? 0.6 : 1,
          }}
        />
        {errors.slug ? (
          <p id="svc-slug-error" style={errorStyle}>{errors.slug}</p>
        ) : (
          <p id="svc-slug-hint" style={hintStyle}>Se genera automáticamente desde el nombre. Solo letras, números y guiones.</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="svc-description" style={labelStyle}>Descripción (opcional)</label>
        <Textarea
          id="svc-description"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Descripción breve del servicio (visible para pacientes)"
          rows={3}
          maxLength={1000}
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', resize: 'vertical' }}
        />
      </div>

      {/* Duración */}
      <div>
        <label htmlFor="svc-duration" style={labelStyle}>
          Duración (minutos) <span style={{ color: 'var(--color-terracota)' }}>*</span>
        </label>
        <Input
          id="svc-duration"
          type="number"
          min={15}
          max={240}
          step={5}
          value={form.durationMin}
          onChange={(e) => setField('durationMin', Number(e.target.value))}
          aria-describedby={errors.durationMin ? 'svc-duration-error' : 'svc-duration-hint'}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            borderColor: errors.durationMin ? 'var(--color-error, #DC2626)' : undefined,
          }}
        />
        {errors.durationMin ? (
          <p id="svc-duration-error" style={errorStyle}>{errors.durationMin}</p>
        ) : (
          <p id="svc-duration-hint" style={hintStyle}>Entre 15 y 240 minutos</p>
        )}
      </div>

      {/* Color + Activo en fila */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Color */}
        <div style={{ flex: '1 1 120px' }}>
          <label htmlFor="svc-color" style={labelStyle}>
            Color <span style={{ color: 'var(--color-terracota)' }}>*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              id="svc-color"
              type="color"
              value={form.color}
              onChange={(e) => setField('color', e.target.value)}
              style={{
                width: 40,
                height: 36,
                borderRadius: 'var(--radius-base)',
                border: `1px solid ${errors.color ? 'var(--color-error)' : 'var(--border-color)'}`,
                padding: 2,
                cursor: 'pointer',
                backgroundColor: 'transparent',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {form.color.toUpperCase()}
            </span>
          </div>
          {errors.color && <p style={errorStyle}>{errors.color}</p>}
        </div>

        {/* Activo (solo en edición — en creación siempre activo) */}
        {isEditing && (
          <div style={{ flex: '1 1 120px' }}>
            <span style={labelStyle}>Estado</span>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                marginTop: 6,
              }}
            >
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField('active', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--color-salvia, #7B8C76)', cursor: 'pointer' }}
              />
              Servicio activo
            </label>
          </div>
        )}
      </div>

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
          {submitting
            ? (isEditing ? 'Guardando...' : 'Creando...')
            : (isEditing ? 'Guardar cambios' : 'Crear servicio')}
        </button>
      </div>
    </form>
  )
}
