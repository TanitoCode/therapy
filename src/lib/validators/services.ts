import { z } from 'zod'

export const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  durationMin: z.number().int().positive(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const servicesResponseSchema = z.array(serviceSchema)

export type Service = z.infer<typeof serviceSchema>
