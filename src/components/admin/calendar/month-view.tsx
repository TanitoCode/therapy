'use client'

import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  parseISO,
} from 'date-fns'
import { formatDateShort } from '@/lib/date'
import { AppointmentBlock } from './appointment-block'
import type { CalendarAppointment, CalendarViewProps } from './types'

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function MonthView({ appointments, currentDate, onAppointmentClick, onSlotClick }: CalendarViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentDate])

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>()
    appointments.forEach((appt) => {
      const day = parseISO(appt.startAt)
      const key = day.toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(appt)
    })
    return map
  }, [appointments])

  const hasAnyAppointment = appointments.length > 0
  const weeksCount = calendarDays.length / 7

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Day name header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          flexShrink: 0,
        }}
      >
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            style={{
              padding: '10px 4px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              fontWeight: 500,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
        }}
      >
        {!hasAnyAppointment && isSameMonth(currentDate, new Date()) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 80,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
              borderBottom: '1px solid var(--border-color-subtle)',
            }}
          >
            No hay turnos este mes
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: `repeat(${weeksCount}, minmax(100px, 1fr))`,
            minHeight: weeksCount * 100,
          }}
        >
          {calendarDays.map((day) => {
            const key = day.toDateString()
            const dayAppts = appointmentsByDay.get(key) ?? []
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDay = isToday(day)
            const maxVisible = 3
            const overflow = dayAppts.length - maxVisible

            return (
              <div
                key={key}
                style={{
                  borderRight: '1px solid var(--border-color-subtle)',
                  borderBottom: '1px solid var(--border-color-subtle)',
                  padding: '4px',
                  backgroundColor: isTodayDay
                    ? 'rgba(184, 92, 56, 0.04)'
                    : !isCurrentMonth
                    ? 'rgba(0,0,0,0.02)'
                    : 'transparent',
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* Day number */}
                <button
                  type="button"
                  onClick={() => onSlotClick(day)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: isTodayDay ? 'var(--color-terracota)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    fontWeight: isTodayDay ? 600 : 400,
                    color: isTodayDay
                      ? 'var(--text-inverse)'
                      : isCurrentMonth
                      ? 'var(--text-secondary)'
                      : 'var(--text-tertiary)',
                    padding: 0,
                    alignSelf: 'flex-end',
                    marginBottom: 2,
                  }}
                  aria-label={`${isTodayDay ? 'Hoy, ' : ''}${formatDateShort(day)} — agregar turno`}
                >
                  {day.getDate()}
                </button>

                {/* Appointments (max 3 visible) */}
                {dayAppts.slice(0, maxVisible).map((appt) => (
                  <AppointmentBlock
                    key={appt.id}
                    appointment={appt}
                    onClick={onAppointmentClick}
                    compact
                  />
                ))}

                {/* Overflow */}
                {overflow > 0 && (
                  <button
                    type="button"
                    onClick={() => onSlotClick(day)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '1px 6px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.65rem',
                      color: 'var(--text-tertiary)',
                      fontWeight: 500,
                    }}
                    aria-label={`Ver ${overflow} turno${overflow > 1 ? 's' : ''} más el ${formatDateShort(day)}`}
                  >
                    +{overflow} más
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
