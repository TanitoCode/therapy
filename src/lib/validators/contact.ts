import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'El nombre es demasiado corto').max(100).trim(),
  email: z.string().email('Email inválido').toLowerCase().trim(),
  phone: z
    .string()
    .regex(/^[\d\s\+\-\(\)]{6,20}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, 'El mensaje es demasiado corto')
    .max(1000, 'El mensaje no puede superar 1000 caracteres')
    .trim(),
})

export type ContactInput = z.infer<typeof contactSchema>
