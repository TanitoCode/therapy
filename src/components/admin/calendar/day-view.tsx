'use client'

import { useMemo } from 'react'
import { isSameDay, parseISO } from 'date-fns'
import { formatDateFull } from '@/lib/date'
import { AppointmentBlock } from './appointment-block'
import type { CalendarAppointment, CalendarViewProps } from './types'

const HOUR_START = 9
const HOUR_END = 19
const HOUR_HEIGHT = 60
const TOTAL_HOURS = HOUR_END - HOUR_START
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT

const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i)

function getAppointmentPosition(appt: CalendarAppointment): {
  top: number
  height: number
} {
  const start = parseISO(appt.startAt)
  const end = parseISO(appt.endAt)
  const startMinutes = start.getHours() * 60 + start.getMinutes()
  const endMinutes = end.getHours() * 60 + end.getMinutes()
  const top = Math.max(0, ((startMinutes - HOUR_START * 60) / 60) * HOUR_HEIGHT)
  const height = Math.max(20, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT)
  return { top, height }
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function DayView({ appointments, currentDate, onAppointmentClick, onSlotClick }: CalendarViewProps) {
  const dayAppointments = useMemo(
    () =>
      appointments.filter((appt) => {
        const apptDay = parseISO(appt.startAt)
        return isSameDay(apptDay, currentDate)
      }),
    [appointments, currentDate],
  )

  const isTodayDay = isToday(currentDate)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Day header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: isTodayDay ? 'var(--color-terracota)' : 'var(--bg-secondary)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 400,
            color: isTodayDay ? 'var(--text-inverse)' : 'var(--text-emphasis)',
            flexShrink: 0,
          }}
        >
          {currentDate.getDate()}
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-emphasis)',
              textTransform: 'capitalize',
            }}
          >
            {formatDateFull(currentDate)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
            }}
          >
            {dayAppointments.length === 0
              ? 'Sin turnos'
              : `${dayAppointments.length} turno${dayAppointments.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {/* Scrollable time grid */}
      <div
        style={{
          overflowY: 'auto',
          flex: 1,
          scrollbarWidth: 'thin',
        }}
      >
        {dayAppointments.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 120,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}
          >
            No hay turnos este día
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '52px 1fr',
            height: TOTAL_HEIGHT,
            position: 'relative',
          }}
        >
          {/* Time gutter */}
          <div style={{ position: 'relative' }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{
                  position: 'absolute',
                  top: (hour - HOUR_START) * HOUR_HEIGHT - 8,
                  right: 8,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.65rem',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {hour < HOUR_END ? `${String(hour).padStart(2, '0')}:00` : ''}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            style={{
              position: 'relative',
              borderLeft: '1px solid var(--border-color-subtle)',
            }}
          >
            {/* Hour lines */}
            {HOURS.slice(0, -1).map((hour) => (
              <div
                key={hour}
                style={{
                  position: 'absolute',
                  top: (hour - HOUR_START) * HOUR_HEIGHT,
                  left: 0,
                  right: 0,
                  borderTop: '1px solid var(--border-color-subtle)',
                }}
              />
            ))}

            {/* 30-min markers */}
            {HOURS.slice(0, -1).map((hour) => (
              <div
                key={`${hour}-30`}
                style={{
                  position: 'absolute',
                  top: (hour - HOUR_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                  left: 0,
                  right: 0,
                  borderTop: '1px dashed var(--border-color-subtle)',
                  opacity: 0.5,
                }}
              />
            ))}

            {/* Clickable slot overlay */}
            <button
              type="button"
              onClick={() => {
                const slotDate = new Date(currentDate)
                slotDate.setHours(HOUR_START, 0, 0, 0)
                onSlotClick(slotDate)
              }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                zIndex: 0,
              }}
              aria-label="Agregar turno en este horario"
            />

            {/* Appointment blocks */}
            {dayAppointments.map((appt) => {
              const { top, height } = getAppointmentPosition(appt)
              return (
                <AppointmentBlock
                  key={appt.id}
                  appointment={appt}
                  onClick={onAppointmentClick}
                  style={{ top, height }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
