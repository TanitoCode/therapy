'use client'

import { useState, useCallback } from 'react'
import type { CalendarAppointment } from '@/components/admin/calendar/types'
import { CalendarView } from '@/components/admin/calendar'
import { AppointmentDetail } from '@/components/admin/appointment-detail'
import { AppointmentForm } from '@/components/admin/appointment-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function DashboardClient() {
  // ── Appointment detail dialog ──────────────────────────────────────────────
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null)

  // ── Create appointment dialog (slot click) ─────────────────────────────────
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [slotStartAt, setSlotStartAt] = useState<string | undefined>(undefined)

  // ── Calendar refresh key — incrementing forces re-fetch ───────────────────
  const [calendarKey, setCalendarKey] = useState(0)

  const refreshCalendar = useCallback(() => {
    setCalendarKey((k) => k + 1)
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAppointmentClick = useCallback((appt: CalendarAppointment) => {
    setSelectedApptId(appt.id)
  }, [])

  const handleSlotClick = useCallback((date: Date) => {
    setSlotStartAt(date.toISOString())
    setCreateDialogOpen(true)
  }, [])

  const handleDetailClose = useCallback(() => {
    setSelectedApptId(null)
  }, [])

  const handleDetailSuccess = useCallback(() => {
    refreshCalendar()
  }, [refreshCalendar])

  const handleCreateSuccess = useCallback((_apptId: string) => {
    setCreateDialogOpen(false)
    setSlotStartAt(undefined)
    refreshCalendar()
  }, [refreshCalendar])

  const handleCreateCancel = useCallback(() => {
    setCreateDialogOpen(false)
    setSlotStartAt(undefined)
  }, [])

  return (
    <>
      {/* Calendar — key forces remount/refetch when refresh is needed */}
      <CalendarView
        key={calendarKey}
        onAppointmentClick={handleAppointmentClick}
        onSlotClick={handleSlotClick}
      />

      {/* Detail dialog */}
      <AppointmentDetail
        appointmentId={selectedApptId}
        onClose={handleDetailClose}
        onSuccess={handleDetailSuccess}
      />

      {/* Create dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCreateCancel()
        }}
      >
        <DialogContent
          className="sm:max-w-[480px]"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <DialogHeader
            style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-canvas)',
            }}
          >
            <DialogTitle
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 400,
                color: 'var(--text-emphasis)',
                letterSpacing: 'var(--tracking-tight)',
              }}
            >
              Nuevo turno
            </DialogTitle>
            <DialogDescription style={{ display: 'none' }}>
              Formulario para crear un nuevo turno desde el calendario
            </DialogDescription>
          </DialogHeader>
          <div style={{ padding: '20px 24px' }}>
            <AppointmentForm
              defaultStartAt={slotStartAt}
              onSuccess={handleCreateSuccess}
              onCancel={handleCreateCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
