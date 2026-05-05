'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { patientFormSchema, type PatientFormData } from '@/lib/validators/booking'
import { useBookingState } from '@/hooks/use-booking-state'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const EASE = [0.16, 1, 0.3, 1] as const

function formatSlotTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--color-error)]">
      {message}
    </p>
  )
}

export function PatientStep() {
  const {
    selectedService,
    selectedDate,
    selectedSlot,
    patientData,
    setPatientData,
    setAppointmentResult,
    nextStep,
    prevStep,
    clearSlot,
  } = useBookingState()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patientData ?? {},
  })

  const selectedDateObj = selectedDate
    ? parse(selectedDate, 'yyyy-MM-dd', new Date())
    : null

  async function onSubmit(data: PatientFormData) {
    if (!selectedService || !selectedSlot) return

    setIsSubmitting(true)
    setPatientData(data)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone || undefined,
            dni: data.dni || undefined,
            birthDate: data.birthDate || undefined,
            notes: data.notes || undefined,
          },
          serviceId: selectedService.id,
          startAt: selectedSlot.start_at,
        }),
      })

      const body = await res.json().catch(() => ({}))

      if (res.status === 409) {
        toast.error('El turno ya fue tomado por otro paciente. Por favor elegí otro horario.', {
          duration: 6000,
        })
        clearSlot()
        prevStep()
        return
      }

      if (res.status === 429) {
        toast.error('Demasiadas solicitudes. Esperá un momento e intentá de nuevo.')
        return
      }

      if (!res.ok) {
        toast.error(body.error ?? 'Error al crear el turno. Intentá de nuevo.')
        return
      }

      setAppointmentResult(body)
      nextStep()
    } catch {
      toast.error('Error de conexión. Verificá tu internet e intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-8"
      >
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-light leading-tight tracking-[-0.02em] text-[var(--text-emphasis)] sm:text-3xl">
          Tus datos
        </h2>
        <p className="mt-2 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-tertiary)]">
          Completá tus datos para confirmar el turno.
        </p>
      </motion.div>

      {/* Booking summary bar */}
      {selectedService && selectedSlot && selectedDateObj && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--radius-base)] border border-[var(--border-color-subtle)] bg-[var(--bg-secondary)] px-5 py-3"
        >
          <div
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: selectedService.color }}
          />
          <span className="font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-primary)]">
            {selectedService.name}
          </span>
          <span aria-hidden className="hidden text-[var(--border-color)] sm:inline">·</span>
          <span className="font-[family-name:var(--font-plus-jakarta)] text-sm capitalize text-[var(--text-secondary)]">
            {format(selectedDateObj, "EEEE d 'de' MMMM", { locale: es })}
          </span>
          <span aria-hidden className="hidden text-[var(--border-color)] sm:inline">·</span>
          <span className="font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]">
            {formatSlotTime(selectedSlot.start_at)}
          </span>
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Full name */}
        <div>
          <Label
            htmlFor="patient-name"
            className="mb-1.5 block font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
          >
            Nombre completo{' '}
            <span aria-hidden className="text-[var(--color-terracota)]">*</span>
          </Label>
          <Input
            id="patient-name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre y apellido"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'err-name' : undefined}
            {...register('fullName')}
          />
          <FieldError message={errors.fullName?.message} />
        </div>

        {/* Email + Phone */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="patient-email"
              className="mb-1.5 block font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
            >
              Email{' '}
              <span aria-hidden className="text-[var(--color-terracota)]">*</span>
            </Label>
            <Input
              id="patient-email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <Label
              htmlFor="patient-phone"
              className="mb-1.5 block font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
            >
              Teléfono{' '}
              <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
            </Label>
            <Input
              id="patient-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+54 11 0000-0000"
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
            <FieldError message={errors.phone?.message} />
          </div>
        </div>

        {/* DNI + Birth date */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="patient-dni"
              className="mb-1.5 block font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
            >
              DNI{' '}
              <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
            </Label>
            <Input
              id="patient-dni"
              type="text"
              inputMode="numeric"
              placeholder="12345678"
              maxLength={8}
              aria-invalid={!!errors.dni}
              {...register('dni')}
            />
            <FieldError message={errors.dni?.message} />
          </div>

          <div>
            <Label
              htmlFor="patient-birthdate"
              className="mb-1.5 block font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
            >
              Fecha de nacimiento{' '}
              <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
            </Label>
            <Input
              id="patient-birthdate"
              type="date"
              min="1900-01-01"
              max={new Date().toISOString().split('T')[0]}
              aria-invalid={!!errors.birthDate}
              {...register('birthDate')}
            />
            <FieldError message={errors.birthDate?.message} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label
            htmlFor="patient-notes"
            className="mb-1.5 block font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
          >
            Notas{' '}
            <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
          </Label>
          <Textarea
            id="patient-notes"
            rows={3}
            placeholder="Diagnóstico previo, medicación, o información relevante para el profesional..."
            className="resize-none"
            aria-invalid={!!errors.notes}
            {...register('notes')}
          />
          <FieldError message={errors.notes?.message} />
        </div>

        {/* Submit */}
        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-w-[160px] items-center justify-center gap-2 bg-[var(--color-terracota)] font-[family-name:var(--font-plus-jakarta)] font-semibold text-[var(--text-on-accent)] hover:bg-[var(--color-terracota-hover)] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
                Reservando…
              </>
            ) : (
              'Confirmar turno'
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
