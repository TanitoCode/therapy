import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'
import { patients } from './patients'
import { services } from './services'
import { user } from './auth'

export const appointmentStatusEnum = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'] as const
export type AppointmentStatus = typeof appointmentStatusEnum[number]

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  status: text('status', { enum: appointmentStatusEnum }).notNull().default('pending'),
  confirmationToken: uuid('confirmation_token').unique().defaultRandom(),
  cancelToken: uuid('cancel_token').unique().defaultRandom(),
  notes: text('notes'),
  adminNotes: text('admin_notes'),
  confirmedBy: text('confirmed_by').references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('appts_start_status_idx').on(table.startAt, table.status),
  index('appts_patient_idx').on(table.patientId),
  index('appts_confirmation_token_idx').on(table.confirmationToken),
])
