import { pgTable, uuid, text, date, timestamp, index } from 'drizzle-orm/pg-core'

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  dni: text('dni').unique(),
  birthDate: date('birth_date'),
  notes: text('notes'),          // solo admin puede leer/escribir (enforcement en API)
  medicalHistory: text('medical_history'), // solo admin
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('patients_email_idx').on(table.email),
  index('patients_dni_idx').on(table.dni),
])
