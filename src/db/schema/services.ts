import { pgTable, uuid, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core'

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  durationMin: integer('duration_min').notNull().default(45),
  color: text('color').notNull().default('#7B8C76'), // salvia
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('services_active_idx').on(table.active),
])
