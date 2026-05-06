'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, User, FileText, CalendarDays } from 'lucide-react'
import { PatientHistory } from '@/components/admin/patient-history'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PatientData {
  id: string
  fullName: string
  email: string
  phone: string | null
  dni: string | null
  birthDate: string | null
  notes: string | null
  medicalHistory: string | null
  createdAt: string
  updatedAt: string
}

type TabId = 'datos' | 'historial' | 'turnos'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    // birthDate comes as YYYY-MM-DD (date column, no timezone)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-')
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      ]
      return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`
    }
    // ISO datetime
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateStr
  }
}

// ─── Shared button ─────────────────────────────────────────────────────────────

function Btn({
  onClick,
  disabled,
  variant = 'secondary',
  children,
}: {
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
}) {
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-salvia)',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-color)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-tertiary)',
      border: 'none',
    },
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 'var(--radius-base)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8125rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s, opacity 0.15s',
        ...variants[variant],
      }}
    >
      {children}
    </button>
  )
}

// ─── Field display row ─────────────────────────────────────────────────────────

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: 8,
        padding: '10px 0',
        borderBottom: '1px solid var(--border-color)',
        alignItems: 'start',
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
          paddingTop: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--text-emphasis)',
          lineHeight: 1.5,
        }}
      >
        {value || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
      </span>
    </div>
  )
}

// ─── Edit field ────────────────────────────────────────────────────────────────

function EditField({
  label,
  id,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-base)',
          backgroundColor: 'var(--bg-canvas)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--text-emphasis)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ─── Tab: Datos ────────────────────────────────────────────────────────────────

function TabDatos({ patient, onUpdate }: { patient: PatientData; onUpdate: (p: PatientData) => void }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState(patient.fullName)
  const [email, setEmail] = useState(patient.email)
  const [phone, setPhone] = useState(patient.phone ?? '')
  const [dni, setDni] = useState(patient.dni ?? '')
  const [birthDate, setBirthDate] = useState(patient.birthDate ?? '')

  const handleEdit = () => {
    // Reset form to current patient values
    setFullName(patient.fullName)
    setEmail(patient.email)
    setPhone(patient.phone ?? '')
    setDni(patient.dni ?? '')
    setBirthDate(patient.birthDate ?? '')
    setEditing(true)
  }

  const handleCancel = () => setEditing(false)

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/patients/${patient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const updated: PatientData = await res.json()
      onUpdate(updated)
      setEditing(false)
      toast.success('Datos actualizados')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          <EditField
            label="Nombre completo"
            id="edit-fullName"
            value={fullName}
            onChange={setFullName}
            required
          />
          <EditField
            label="Email"
            id="edit-email"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <EditField
            label="Teléfono"
            id="edit-phone"
            value={phone}
            onChange={setPhone}
            type="tel"
          />
          <EditField label="DNI" id="edit-dni" value={dni} onChange={setDni} />
          <EditField
            label="Fecha de nacimiento"
            id="edit-birthDate"
            value={birthDate}
            onChange={setBirthDate}
            type="date"
          />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            margin: 0,
          }}
        >
          Nota: email y DNI no son editables desde esta vista (campos de identidad del sistema).
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Btn>
          <Btn variant="secondary" onClick={handleCancel} disabled={saving}>
            Cancelar
          </Btn>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <FieldRow label="Nombre" value={patient.fullName} />
      <FieldRow label="Email" value={patient.email} />
      <FieldRow label="Teléfono" value={patient.phone} />
      <FieldRow label="DNI" value={patient.dni} />
      <FieldRow label="Nacimiento" value={formatDateDisplay(patient.birthDate)} />
      <FieldRow label="Registrado" value={formatDateDisplay(patient.createdAt)} />
      <FieldRow label="Última actualiz." value={formatDateDisplay(patient.updatedAt)} />

      <div style={{ marginTop: 20 }}>
        <Btn variant="secondary" onClick={handleEdit}>
          Editar datos
        </Btn>
      </div>
    </div>
  )
}

// ─── Tab: Historial clínico ───────────────────────────────────────────────────

function TabHistorial({ patient, onUpdate }: { patient: PatientData; onUpdate: (p: PatientData) => void }) {
  const [notes, setNotes] = useState(patient.notes ?? '')
  const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory ?? '')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track dirty state
  useEffect(() => {
    const isDirty =
      notes !== (patient.notes ?? '') || medicalHistory !== (patient.medicalHistory ?? '')
    setDirty(isDirty)
  }, [notes, medicalHistory, patient.notes, patient.medicalHistory])

  const handleSave = useCallback(async (notesVal: string, medHisVal: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/patients/${patient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notesVal.trim() || null,
          medicalHistory: medHisVal.trim() || null,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const updated: PatientData = await res.json()
      onUpdate(updated)
      setDirty(false)
      toast.success('Historial guardado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }, [patient.id, onUpdate])

  // Auto-save debounced 1500ms
  useEffect(() => {
    if (!dirty) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      handleSave(notes, medicalHistory)
    }, 1500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [notes, medicalHistory, dirty, handleSave])

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 6,
  }

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-base)',
    backgroundColor: 'var(--bg-canvas)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--text-emphasis)',
    resize: 'vertical',
    lineHeight: 1.6,
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label htmlFor="hist-notes" style={labelStyle}>
          Notas clínicas
        </label>
        <textarea
          id="hist-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Observaciones generales sobre el paciente..."
          style={textareaStyle}
        />
      </div>

      <div>
        <label htmlFor="hist-medical" style={labelStyle}>
          Historial médico
        </label>
        <textarea
          id="hist-medical"
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
          rows={8}
          placeholder="Antecedentes, diagnósticos, tratamientos anteriores..."
          style={textareaStyle}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Btn
          variant="primary"
          onClick={() => handleSave(notes, medicalHistory)}
          disabled={saving || !dirty}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Btn>
        {saving && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'var(--text-tertiary)',
              fontStyle: 'italic',
            }}
          >
            Guardando automáticamente...
          </span>
        )}
        {!saving && !dirty && patient.updatedAt && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'var(--text-tertiary)',
            }}
          >
            Guardado — {formatDateDisplay(patient.updatedAt)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface PatientDetailProps {
  patient: PatientData
}

export function PatientDetail({ patient: initialPatient }: PatientDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('datos')
  const [patient, setPatient] = useState<PatientData>(initialPatient)

  const tabs: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
    { id: 'datos', label: 'Datos', icon: User },
    { id: 'historial', label: 'Historial Clínico', icon: FileText },
    { id: 'turnos', label: 'Turnos', icon: CalendarDays },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button
            type="button"
            onClick={() => router.push('/admin/pacientes')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'var(--text-tertiary)',
              padding: 0,
              marginBottom: 4,
              transition: 'color 0.15s',
            }}
          >
            <ChevronLeft size={15} />
            Volver a pacientes
          </button>
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
            {patient.fullName}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              margin: 0,
            }}
          >
            {patient.email}
          </p>
        </div>

        <Btn
          variant="secondary"
          onClick={() => router.push('/admin/dashboard')}
        >
          <CalendarDays size={14} />
          Crear turno
        </Btn>
      </div>

      {/* Card with tabs */}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Secciones del paciente"
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-canvas)',
            overflowX: 'auto',
          }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`tabpanel-${id}`}
                id={`tab-${id}`}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.75rem 1.25rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-terracota)' : 'var(--text-tertiary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--color-terracota)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                  marginBottom: -1,
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 1.75} />
                {label}
              </button>
            )
          })}
        </div>

        {/* Tab panels */}
        <div style={{ padding: '1.5rem' }}>
          <div
            id="tabpanel-datos"
            role="tabpanel"
            aria-labelledby="tab-datos"
            hidden={activeTab !== 'datos'}
          >
            {activeTab === 'datos' && (
              <TabDatos patient={patient} onUpdate={setPatient} />
            )}
          </div>

          <div
            id="tabpanel-historial"
            role="tabpanel"
            aria-labelledby="tab-historial"
            hidden={activeTab !== 'historial'}
          >
            {activeTab === 'historial' && (
              <TabHistorial patient={patient} onUpdate={setPatient} />
            )}
          </div>

          <div
            id="tabpanel-turnos"
            role="tabpanel"
            aria-labelledby="tab-turnos"
            hidden={activeTab !== 'turnos'}
          >
            {activeTab === 'turnos' && (
              <PatientHistory patientId={patient.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
