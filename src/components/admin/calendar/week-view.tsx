'use client'

import { useMemo } from 'react'
import { isSameDay, parseISO } from 'date-fns'
import { formatDateShort, getWeekDays } from '@/lib/date'
import { AppointmentBlock } from './appointment-block'
import type { CalendarAppointment, CalendarViewProps } from './types'

const HOUR_START = 9   // 09:00
const HOUR_END = 19    // 19:00
const HOUR_HEIGHT = 60 // px per hour
const TOTAL_HOURS = HOUR_END - HOUR_START
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT // 600px

const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i)

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function getAppointmentPosition(appt: CalendarAppointment): {
  top: number
  height: number
} {
  const start = parseISO(appt.startAt)
  const end = parseISO(appt.endAt)

  const startMinutes = start.getHours() * 60 + start.getMinutes()
  const endMinutes = end.getHours() * 60 + end.getMinutes()
  const startOffsetMinutes = startMinutes - HOUR_START * 60
  const durationMinutes = endMinutes - startMinutes

  const top = Math.max(0, (startOffsetMinutes / 60) * HOUR_HEIGHT)
  const height = Math.max(20, (durationMinutes / 60) * HOUR_HEIGHT)

  return { top, height }
}

function isToday(date: Date): boolean {
  const now = new Date()
  return isSameDay(date, now)
}

export function WeekView({ appointments, currentDate, onAppointmentClick, onSlotClick }: CalendarViewProps) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>()
    weekDays.forEach((day) => {
      const key = day.toDateString()
      map.set(key, [])
    })
    appointments.forEach((appt) => {
      const apptDay = parseISO(appt.startAt)
      const key = apptDay.toDateString()
      if (map.has(key)) {
        map.get(key)!.push(appt)
      }
    })
    return map
  }, [appointments, weekDays])

  const hasAnyAppointment = appointments.length > 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Day header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '52px repeat(7, 1fr)',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          flexShrink: 0,
        }}
      >
        {/* Time gutter header */}
        <div />
        {weekDays.map((day, i) => (
          <div
            key={day.toISOString()}
            style={{
              padding: '10px 4px',
              textAlign: 'center',
              borderLeft: '1px solid var(--border-color-subtle)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.7rem',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 2,
              }}
            >
              {DAY_NAMES_SHORT[i]}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: isToday(day) ? 'var(--color-terracota)' : 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: isToday(day) ? 600 : 400,
                color: isToday(day) ? 'var(--text-inverse)' : 'var(--text-emphasis)',
                margin: '0 auto',
              }}
            >
              {day.getDate()}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                color: 'var(--text-tertiary)',
                marginTop: 1,
              }}
            >
              {formatDateShort(day).split(' ')[1]}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div
        style={{
          overflowY: 'auto',
          flex: 1,
          scrollbarWidth: 'thin',
        }}
      >
        {!hasAnyAppointment && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}
          >
            No hay turnos esta semana
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '52px repeat(7, 1fr)',
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

          {/* Day columns */}
          {weekDays.map((day) => {
            const key = day.toDateString()
            const dayAppts = appointmentsByDay.get(key) ?? []
            const isTodayDay = isToday(day)

            return (
              <div
                key={key}
                style={{
                  position: 'relative',
                  borderLeft: '1px solid var(--border-color-subtle)',
                  backgroundColor: isTodayDay ? 'rgba(250, 248, 245, 0.6)' : 'transparent',
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
                    const slotDate = new Date(day)
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
                  aria-label={`Agregar turno el ${formatDateShort(day)}`}
                />

                {/* Appointment blocks */}
                {dayAppts.map((appt) => {
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
