'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { BUSINESS_HOURS, SLOT_DURATION } from '@/lib/constants'

const STORAGE_KEY = 'therapy_admin_config'

interface Config {
  address: string
  phone: string
  email: string
  whatsapp: string
  hours_start: string
  hours_end: string
  work_days: number[]
}

const DEFAULT_CONFIG: Config = {
  address: '',
  phone: '',
  email: '',
  whatsapp: '',
  hours_start: BUSINESS_HOURS.start,
  hours_end: BUSINESS_HOURS.end,
  work_days: [...BUSINESS_HOURS.workDays],
}

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(raw) as Partial<Config> })
    } catch { /* ignore */ }
  }, [])

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      setSaved(true)
      toast.success('Configuración guardada')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error('Error al guardar')
    }
  }

  function toggleDay(day: number) {
    setConfig((c) => ({
      ...c,
      work_days: c.work_days.includes(day)
        ? c.work_days.filter((d) => d !== day)
        : [...c.work_days, day].sort(),
    }))
  }

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  }

  const sectionHeaderStyle: React.CSSProperties = {
    padding: '14px 20px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-canvas)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  }

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-base)',
    padding: '0.5rem 0.75rem',
    width: '100%',
    outline: 'none',
  }

  const noteStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    fontStyle: 'italic',
    margin: 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 640 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 400, color: 'var(--text-emphasis)', letterSpacing: '-0.02em', margin: 0 }}>
          Configuración
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
          Datos del consultorio y horario laboral
        </p>
      </div>

      {/* Datos de contacto */}
      <section style={sectionStyle}>
        <p style={sectionHeaderStyle}>Datos de contacto</p>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="cfg-address">Dirección</label>
            <input
              id="cfg-address"
              style={inputStyle}
              value={config.address}
              onChange={(e) => setConfig((c) => ({ ...c, address: e.target.value }))}
              placeholder="Ej: Av. Corrientes 1234, CABA"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="cfg-phone">Teléfono</label>
              <input
                id="cfg-phone"
                style={inputStyle}
                value={config.phone}
                onChange={(e) => setConfig((c) => ({ ...c, phone: e.target.value }))}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="cfg-whatsapp">WhatsApp</label>
              <input
                id="cfg-whatsapp"
                style={inputStyle}
                value={config.whatsapp}
                onChange={(e) => setConfig((c) => ({ ...c, whatsapp: e.target.value }))}
                placeholder="5491112345678"
              />
            </div>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="cfg-email">Email del consultorio</label>
            <input
              id="cfg-email"
              type="email"
              style={inputStyle}
              value={config.email}
              onChange={(e) => setConfig((c) => ({ ...c, email: e.target.value }))}
              placeholder="info@consultorio.com"
            />
          </div>
          <p style={noteStyle}>
            Estos datos se muestran en el sitio público. Actualización manual necesaria tras guardar.
          </p>
        </div>
      </section>

      {/* Horario laboral */}
      <section style={sectionStyle}>
        <p style={sectionHeaderStyle}>Horario laboral</p>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Días */}
          <div style={fieldStyle}>
            <p style={labelStyle}>Días hábiles</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {DAY_LABELS.map((label, idx) => {
                const active = config.work_days.includes(idx)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--radius-base)',
                      border: `1.5px solid ${active ? 'var(--color-terracota)' : 'var(--border-color)'}`,
                      backgroundColor: active ? 'var(--color-error-bg)' : 'transparent',
                      color: active ? 'var(--color-terracota)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Horario */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="cfg-start">Apertura</label>
              <input
                id="cfg-start"
                type="time"
                style={inputStyle}
                value={config.hours_start}
                onChange={(e) => setConfig((c) => ({ ...c, hours_start: e.target.value }))}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="cfg-end">Cierre</label>
              <input
                id="cfg-end"
                type="time"
                style={inputStyle}
                value={config.hours_end}
                onChange={(e) => setConfig((c) => ({ ...c, hours_end: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-info-bg,#ebf1f4)', borderRadius: 'var(--radius-base)', padding: '0.75rem 1rem' }}>
            <p style={{ ...noteStyle, fontStyle: 'normal', color: 'var(--color-info,#476A7A)' }}>
              Duración de turnos: <strong>{SLOT_DURATION} min</strong>. Cambios en horario afectan la disponibilidad pública pero requieren redeploy para actualizar `constants.ts`.
            </p>
          </div>
        </div>
      </section>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '0.625rem 1.5rem',
            border: 'none',
            borderRadius: 'var(--radius-base)',
            backgroundColor: saved ? 'var(--color-success)' : 'var(--color-terracota)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {saved ? 'Guardado ✓' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
