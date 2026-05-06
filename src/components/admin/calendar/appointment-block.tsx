'use client'

import { useState, useRef, useEffect } from 'react'
import { formatTime } from '@/lib/date'
import type { CalendarAppointment } from './types'

const STATUS_LABELS: Record<CalendarAppointment['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
  no_show: 'No asistió',
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

interface AppointmentBlockProps {
  appointment: CalendarAppointment
  onClick: (appointment: CalendarAppointment) => void
  compact?: boolean // for month view pills
  style?: React.CSSProperties
}

export function AppointmentBlock({ appointment, onClick, compact = false, style }: AppointmentBlockProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top')
  const blockRef = useRef<HTMLButtonElement>(null)
  const color = appointment.serviceColor || '#7B8C76'
  const rgb = hexToRgb(color)

  useEffect(() => {
    if (tooltipVisible && blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect()
      // If the block is in the bottom half of the viewport, show tooltip above
      setTooltipPosition(rect.top > window.innerHeight / 2 ? 'top' : 'bottom')
    }
  }, [tooltipVisible])

  const isCancelled = appointment.status === 'cancelled' || appointment.status === 'no_show'

  if (compact) {
    // Month view: small pill
    return (
      <button
        ref={blockRef}
        type="button"
        onClick={() => onClick(appointment)}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: `rgba(${rgb}, 0.15)`,
          borderLeft: `3px solid ${color}`,
          cursor: 'pointer',
          opacity: isCancelled ? 0.5 : 1,
          position: 'relative',
          ...style,
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            fontWeight: 500,
            color: color,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textDecoration: isCancelled ? 'line-through' : 'none',
          }}
        >
          {formatTime(appointment.startAt)} {appointment.patient.fullName.split(' ')[0]}
        </span>

        {/* Tooltip */}
        {tooltipVisible && (
          <AppointmentTooltip
            appointment={appointment}
            color={color}
            position={tooltipPosition}
          />
        )}
      </button>
    )
  }

  // Week/Day view: full block positioned absolutely
  return (
    <button
      ref={blockRef}
      type="button"
      onClick={() => onClick(appointment)}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      style={{
        position: 'absolute',
        left: '4px',
        right: '4px',
        borderRadius: 'var(--radius-base)',
        backgroundColor: `rgba(${rgb}, 0.18)`,
        borderLeft: `3px solid ${color}`,
        padding: '4px 8px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
        opacity: isCancelled ? 0.55 : 1,
        zIndex: 1,
        ...style,
      }}
      onFocus={() => setTooltipVisible(true)}
      onBlur={() => setTooltipVisible(false)}
      aria-label={`Turno de ${appointment.patient.fullName} — ${appointment.service.name} — ${formatTime(appointment.startAt)}`}
    >
      <span
        style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: color,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textDecoration: isCancelled ? 'line-through' : 'none',
          lineHeight: 1.3,
        }}
      >
        {appointment.patient.fullName}
      </span>
      <span
        style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
          color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.3,
        }}
      >
        {appointment.service.name}
      </span>

      {/* Tooltip */}
      {tooltipVisible && (
        <AppointmentTooltip
          appointment={appointment}
          color={color}
          position={tooltipPosition}
        />
      )}
    </button>
  )
}

function AppointmentTooltip({
  appointment,
  color,
  position,
}: {
  appointment: CalendarAppointment
  color: string
  position: 'top' | 'bottom'
}) {
  return (
    <div
      role="tooltip"
      style={{
        position: 'absolute',
        [position === 'top' ? 'bottom' : 'top']: 'calc(100% + 6px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        backgroundColor: 'var(--bg-canvas)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-lg)',
        minWidth: 200,
        maxWidth: 260,
        pointerEvents: 'none',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-emphasis)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {appointment.patient.fullName}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        <div>{appointment.service.name}</div>
        <div>
          {formatTime(appointment.startAt)} – {formatTime(appointment.endAt)}
        </div>
        <div
          style={{
            marginTop: 4,
            display: 'inline-block',
            padding: '1px 6px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: `rgba(${
              appointment.status === 'confirmed' ? '90, 122, 92' :
              appointment.status === 'completed' ? '71, 106, 122' :
              appointment.status === 'cancelled' ? '155, 58, 58' :
              appointment.status === 'no_show' ? '155, 58, 58' :
              '176, 124, 42'
            }, 0.15)`,
            color:
              appointment.status === 'confirmed' ? 'var(--color-success)' :
              appointment.status === 'completed' ? 'var(--color-info)' :
              appointment.status === 'cancelled' || appointment.status === 'no_show' ? 'var(--color-error)' :
              'var(--color-warning)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {STATUS_LABELS[appointment.status]}
        </div>
      </div>
    </div>
  )
}
