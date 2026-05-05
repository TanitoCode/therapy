import { z } from 'zod'

export const patientFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre es demasiado corto')
    .max(150, 'El nombre es demasiado largo')
    .trim(),
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
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500, 'Las notas no pueden superar 500 caracteres').optional(),
})

export type PatientFormData = z.infer<typeof patientFormSchema>
