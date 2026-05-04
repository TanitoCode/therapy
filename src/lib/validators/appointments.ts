import { z } from 'zod'

export const patientInputSchema = z.object({
  fullName: z.string().min(2, 'Nombre demasiado corto').max(150, 'Nombre demasiado largo').trim(),
  email: z.string().email('Email inválido').toLowerCase().trim(),
  phone: z
    .string()
    .regex(/^[\d\s\+\-\(\)]{6,20}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  dni: z
    .string()
    .regex(/^\d{7,8}$/, 'DNI debe tener 7 u 8 dígitos')
    .optional()
    .or(z.literal('')),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)')
    .optional()
    .nullable(),
  notes: z.string().max(500, 'Las notas no pueden superar 500 caracteres').optional(),
})

export const createAppointmentSchema = z.object({
  patient: patientInputSchema,
  serviceId: z.string().uuid('serviceId debe ser un UUID válido'),
  startAt: z.string().datetime({ message: 'startAt debe ser ISO 8601 con timezone' }),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type PatientInput = z.infer<typeof patientInputSchema>
