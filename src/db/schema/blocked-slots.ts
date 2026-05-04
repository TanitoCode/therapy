import { pgTable, uuid, text, timestamp, boolean, index } from 'drizzle-orm/pg-core'

export const blockedSlots = pgTable('blocked_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  reason: text('reason'),
  recurring: boolean('recurring').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('blocked_start_idx').on(table.startAt),
])
