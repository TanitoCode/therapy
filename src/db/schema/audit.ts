import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core'

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: text('actor_id'),    // user.id o 'system' o 'patient'
  actorType: text('actor_type', { enum: ['admin', 'staff', 'patient', 'system'] }).notNull(),
  action: text('action').notNull(), // 'appointment.created', 'appointment.cancelled', etc.
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('audit_actor_idx').on(table.actorId),
  index('audit_action_idx').on(table.action),
  index('audit_created_idx').on(table.createdAt),
])
