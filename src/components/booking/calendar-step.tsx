'use client'

import { useState, useEffect } from 'react'
import { format, parse, isWeekend } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { useBookingState, type SlotItem } from '@/hooks/use-booking-state'

const EASE = [0.16, 1, 0.3, 1] as const

function formatSlotTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getTodayMidnight(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function CalendarStep() {
  const { selectedService, selectedDate, selectedSlot, setDate, setSlot } = useBookingState()

  const [slots, setSlots] = useState<SlotItem[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)

  const selectedDateObj: Date | undefined = selectedDate
    ? parse(selectedDate, 'yyyy-MM-dd', new Date())
    : undefined

  // Fetch slots when date or service changes
  useEffect(() => {
    if (!selectedDate || !selectedService) {
      setSlots([])
      return
    }

    let cancelled = false
    setLoadingSlots(true)
    setSlotsError(null)

    fetch(`/api/availability?service_id=${selectedService.id}&date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error')
        return res.json() as Promise<SlotItem[]>
      })
      .then((data) => {
        if (!cancelled) {
          setSlots(data)
          setLoadingSlots(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlotsError('No se pudo cargar la disponibilidad. Intentá de nuevo.')
          setSlots([])
          setLoadingSlots(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedDate, selectedService])

  const availableSlots = slots.filter((s) => s.available)
  const noAvailability =
    !loadingSlots && !slotsError && selectedDate && availableSlots.length === 0

  const today = getTodayMidnight()

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-8"
      >
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-light leading-tight tracking-[-0.02em] text-[var(--text-emphasis)] sm:text-3xl">
          Elegí fecha y horario
        </h2>
        <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)]">
          Seleccioná el día y el turno que mejor se adapte a tu agenda.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start"
      >
        {/* ── Calendar ── */}
        <div className="w-full min-w-[300px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-color-subtle)] bg-[var(--bg-canvas)] p-3 lg:w-[380px]">
          <Calendar
            mode="single"
            locale={es}
            selected={selectedDateObj}
            onSelect={(date) => date && setDate(format(date, 'yyyy-MM-dd'))}
            disabled={(date: Date) => date < today || isWeekend(date)}
            startMonth={new Date()}
            classNames={{ root: "w-full" }}
          />
        </div>

        {/* ── Slots panel ── */}
        <div>
          {/* Prompt: no date selected yet */}
          {!selectedDate && (
            <div className="flex min-h-[200px] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-color-subtle)] bg-[var(--bg-canvas)] p-8">
              <p className="max-w-[28ch] text-center font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)]">
                Seleccioná una fecha para ver los turnos disponibles.
              </p>
            </div>
          )}

          {selectedDate && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-color-subtle)] bg-[var(--bg-canvas)] p-5">
              {/* Date label */}
              <p className="mb-4 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold capitalize text-[var(--text-primary)]">
                {selectedDateObj &&
                  format(selectedDateObj, "EEEE d 'de' MMMM", { locale: es })}
              </p>

              {/* Loading */}
              {loadingSlots && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-[var(--radius-base)]" />
                  ))}
                </div>
              )}

              {/* Error */}
              {slotsError && (
                <p className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-error)]">
                  {slotsError}
                </p>
              )}

              {/* No availability */}
              {noAvailability && (
                <p className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)]">
                  No hay turnos disponibles para este día. Probá con otra fecha.
                </p>
              )}

              {/* Slots grid */}
              {!loadingSlots && !slotsError && availableSlots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.start_at === slot.start_at
                    return (
                      <button
                        key={slot.start_at}
                        type="button"
                        onClick={() => setSlot(slot)}
                        aria-pressed={isSelected}
                        className={[
                          'rounded-[var(--radius-base)] border px-3 py-2.5 font-[family-name:var(--font-plus-jakarta)] text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1',
                          isSelected
                            ? 'border-transparent text-[var(--text-on-accent)]'
                            : 'border-[var(--border-color-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]',
                        ].join(' ')}
                        style={
                          isSelected
                            ? {
                                backgroundColor:
                                  selectedService?.color ?? 'var(--color-terracota)',
                                outlineColor:
                                  selectedService?.color ?? 'var(--color-terracota)',
                              }
                            : {
                                outlineColor:
                                  selectedService?.color ?? 'var(--color-terracota)',
                              }
                        }
                      >
                        {formatSlotTime(slot.start_at)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Selected slot summary bar */}
      {selectedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-5 flex items-center gap-3 rounded-[var(--radius-base)] border border-[var(--border-color-subtle)] bg-[var(--bg-secondary)] px-4 py-3"
        >
          <div
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: selectedService?.color ?? 'var(--color-terracota)' }}
          />
          <p className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
            Turno seleccionado:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {selectedDateObj && format(selectedDateObj, "EEEE d/MM", { locale: es })}{' '}
              a las {formatSlotTime(selectedSlot.start_at)}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  )
}
