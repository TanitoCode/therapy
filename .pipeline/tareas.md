# Tareas — Therapy
Fecha: 2026-04-28
Total: 48 tareas | Tiempo estimado: ~36 horas (con buffer ~45h)
Stack detectado: Next.js 15 (App Router) + PostgreSQL + Drizzle ORM + Better Auth + Tailwind CSS + shadcn/ui + Framer Motion + Resend
Estructura: single-repo
Deploy target: Vercel

## Gaps identificados
- **Provider de PostgreSQL**: usuario no especifica si Neon o Supabase. Default sugerido: **Neon** (mejor para Vercel + branching DB). Usar postgres.js driver + Transaction Pooler.
- **Branding/Mood**: pendiente de definir en Fase 2 (visual-direction). Asumir mood "calm-medical-trustworthy" hasta confirmar.
- **Servicios concretos del consultorio**: 3 categorías mencionadas pero contenido pendiente. Asumir: Kinesiología deportiva, Rehabilitación traumatológica, Kinesiología neurológica (placeholder editable desde admin).
- **Duración de turnos**: no especificada. Default: 45 min, con bloques configurables desde admin.
- **Email del admin para notificaciones**: pendiente. Variable env `ADMIN_EMAIL`.
- **Mapa de ubicación**: dirección física pendiente. Usar Google Maps embed o Leaflet con OpenStreetMap (sin API key).
- **Política de cancelación / horario laboral**: asumir Lun-Vie 09:00-19:00 hasta confirmar, configurable desde admin (`blocked_slots` lo cubre).
- **Multilingüe**: no se pide → solo español (es-AR).

---

## Área 1 — Setup & Infrastructure

### Tarea 0: Project Infrastructure (OBLIGATORIA)
**ID**: T0-INFRA
**Tipo**: config
**Complejidad**: M
**Descripción**: Inicializar Next.js 15 con App Router, configurar tooling base, estructura de carpetas estandarizada.
**Archivos esperados**:
- `package.json`, `tsconfig.json`, `next.config.ts`
- `.eslintrc.json`, `.prettierrc`, `.editorconfig`
- `.husky/pre-commit`, `lint-staged.config.js`
- `.env.example` con: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `NEXT_PUBLIC_APP_URL`
- `.gitignore` (node_modules, .next, .env, dist, .pipeline temporal)
- `README.md` con descripción, stack, setup local, scripts, estructura de carpetas
- `vitest.config.ts` + script `"test"` en package.json
- Estructura: `src/app/`, `src/components/ui/`, `src/components/{public,admin,booking}/`, `src/lib/`, `src/hooks/`, `src/types/`, `src/db/`, `src/__tests__/`
**Criterio de aceptación**:
- `npm run lint` pasa sin errores
- `npm run type-check` pasa sin errores
- `npm test` ejecuta vitest (puede no haber tests aún)
- `npm run build` produce build exitoso (con landing placeholder)
- README contiene instrucciones de setup completas (clone → install → .env → migrate → dev)
- Husky pre-commit ejecuta lint + type-check
**Dependencias**: ninguna

### Tarea 1: Tailwind + shadcn/ui Setup
**ID**: T1-STYLE
**Tipo**: config
**Complejidad**: S
**Descripción**: Configurar Tailwind CSS 4, instalar shadcn/ui CLI y componentes base requeridos.
**Archivos esperados**:
- `tailwind.config.ts`, `postcss.config.js`, `src/app/globals.css`
- `components.json` (shadcn config)
- `src/components/ui/{button,input,label,card,dialog,form,toast,calendar,popover,select,textarea,sheet,table,badge,avatar,skeleton}.tsx`
- `src/lib/utils.ts` (con `cn` helper)
**Criterio de aceptación**:
- shadcn `npx shadcn@latest add <component>` funciona
- Tailwind classes se aplican en una página de prueba
- Dark mode configurado (clase `dark` en `<html>`)
- 17+ componentes shadcn instalados y exportables
**Dependencias**: T0-INFRA

### Tarea 2: Database — Drizzle + PostgreSQL Setup
**ID**: T2-DB-SETUP
**Tipo**: backend
**Complejidad**: M
**Descripción**: Conectar a PostgreSQL (Neon recomendado), configurar Drizzle ORM con postgres.js driver y transaction pooler.
**Archivos esperados**:
- `src/db/index.ts` (cliente Drizzle con `postgres-js` + `prepare: false`)
- `drizzle.config.ts`
- Scripts en package.json: `"db:generate"`, `"db:migrate"`, `"db:studio"`
**Criterio de aceptación**:
- `npm run db:studio` abre Drizzle Studio y conecta a la DB
- Ping a la DB desde un script funciona
- Variables `DATABASE_URL` documentadas en `.env.example` con formato Transaction Pooler (puerto 6543 si Supabase, pooled URL si Neon)
**Dependencias**: T0-INFRA

### Tarea 3: Framer Motion + utilidades UI
**ID**: T3-MOTION
**Tipo**: frontend
**Complejidad**: S
**Descripción**: Instalar Framer Motion, configurar variantes reutilizables, helpers de fecha (date-fns con locale es-AR).
**Archivos esperados**:
- `src/lib/motion.ts` (variantes: fadeIn, slideUp, stagger)
- `src/lib/date.ts` (helpers: formatDate, formatTime, getWeekDays, isWeekend con date-fns es-AR)
- `src/lib/constants.ts` (BUSINESS_HOURS, SLOT_DURATION, TIMEZONE='America/Argentina/Buenos_Aires')
**Criterio de aceptación**:
- Importar `fadeIn` desde `@/lib/motion` funciona en cualquier componente
- `formatDate(new Date(), 'es-AR')` devuelve string en español
**Dependencias**: T0-INFRA

---

## Área 2 — Database Schema

### Tarea 4: Schema — users (Better Auth)
**ID**: T4-SCHEMA-USERS
**Tipo**: backend
**Complejidad**: S
**Descripción**: Definir tablas de Better Auth (`user`, `session`, `account`, `verification`) según schema oficial.
**Archivos esperados**:
- `src/db/schema/auth.ts`
**Criterio de aceptación**:
- Tablas Better Auth presentes con todos los campos requeridos por la lib
- `role` agregado a `user` (enum: 'admin' | 'staff', default 'staff')
- Migración generada y aplicada exitosamente
**Dependencias**: T2-DB-SETUP

### Tarea 5: Schema — service_categories
**ID**: T5-SCHEMA-SERVICES
**Tipo**: backend
**Complejidad**: S
**Descripción**: Tabla de categorías de servicio (3 mínimas, editables desde admin).
**Archivos esperados**:
- `src/db/schema/services.ts`
**Criterio de aceptación**:
- Campos: `id` (uuid pk), `name` (varchar 100, unique), `slug`, `description` (text), `duration_min` (int, default 45), `color` (hex 7 chars), `active` (bool default true), `created_at`, `updated_at`
- Seed inicial con 3 categorías placeholder
- Migración aplicada
**Dependencias**: T2-DB-SETUP

### Tarea 6: Schema — patients
**ID**: T6-SCHEMA-PATIENTS
**Tipo**: backend
**Complejidad**: S
**Descripción**: Tabla de pacientes con datos de contacto y notas clínicas.
**Archivos esperados**:
- `src/db/schema/patients.ts`
**Criterio de aceptación**:
- Campos: `id`, `full_name`, `email` (unique), `phone`, `dni`, `birth_date`, `notes` (text, solo admin), `medical_history` (text, solo admin), `created_at`, `updated_at`
- Constraint email/dni único
- Migración aplicada
**Dependencias**: T2-DB-SETUP

### Tarea 7: Schema — appointments + blocked_slots + audit_log
**ID**: T7-SCHEMA-APPTS
**Tipo**: backend
**Complejidad**: M
**Descripción**: Tablas core del sistema de turnos.
**Archivos esperados**:
- `src/db/schema/appointments.ts`
- `src/db/schema/blocked-slots.ts`
- `src/db/schema/audit.ts`
- `src/db/schema/index.ts` (re-export)
**Criterio de aceptación**:
- `appointments`: `id`, `patient_id` (fk), `service_id` (fk), `start_at` (timestamptz), `end_at`, `status` (enum: pending, confirmed, cancelled, completed, no_show), `notes`, `confirmation_token` (uuid, único), `created_at`, `updated_at`
- Index compuesto en `(start_at, status)` para queries de calendario
- `blocked_slots`: `id`, `start_at`, `end_at`, `reason`, `recurring` (enum: none, weekly), `created_by` (fk user)
- `audit_log`: `id`, `user_id`, `action`, `entity_type`, `entity_id`, `changes` (jsonb), `created_at`
- Migración aplicada y verificada en Drizzle Studio
**Dependencias**: T4-SCHEMA-USERS, T5-SCHEMA-SERVICES, T6-SCHEMA-PATIENTS

---

## Área 3 — Authentication (Better Auth)

### Tarea 8: Better Auth — Server Setup
**ID**: T8-AUTH-SERVER
**Tipo**: backend
**Complejidad**: M
**Descripción**: Configurar Better Auth server-side con email/password, role-based access, session cookies.
**Archivos esperados**:
- `src/lib/auth.ts` (instancia Better Auth)
- `src/app/api/auth/[...all]/route.ts` (con dynamic imports + toCleanRequest)
- `proxy.ts` en raíz (Next.js 16+ pattern, getSessionCookie con cookiePrefix)
**Criterio de aceptación**:
- `npx @better-auth/cli migrate` ejecutado, tablas Better Auth en DB
- Endpoint `POST /api/auth/sign-in/email` retorna 200 con credenciales válidas
- Cookie de sesión se setea correctamente
- Ruta `/admin/**` redirige a `/admin/login` si no hay sesión válida (proxy.ts)
- Solo emails con role='admin' pueden acceder a `/admin`
**Dependencias**: T4-SCHEMA-USERS

### Tarea 9: Better Auth — Client + Login UI
**ID**: T9-AUTH-CLIENT
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Cliente de Better Auth y formulario de login para admin.
**Archivos esperados**:
- `src/lib/auth-client.ts`
- `src/app/admin/login/page.tsx`
- `src/components/admin/login-form.tsx`
- `src/hooks/use-session.ts`
**Criterio de aceptación**:
- Login con email + password redirige a `/admin/dashboard`
- Errores se muestran via toast (shadcn)
- Logout button funciona desde `/admin`
- Sesión persiste tras refresh
- E2E manual: signup admin → login → dashboard → logout (los 4 pasos OK)
**Dependencias**: T8-AUTH-SERVER, T1-STYLE

### Tarea 10: Seed admin user
**ID**: T10-SEED-ADMIN
**Tipo**: backend
**Complejidad**: S
**Descripción**: Script para crear el primer usuario admin desde CLI.
**Archivos esperados**:
- `scripts/seed-admin.ts`
- Script en package.json: `"seed:admin"`
**Criterio de aceptación**:
- `npm run seed:admin -- --email x --password y` crea usuario con role='admin'
- Idempotente: si ya existe, lo informa sin error
- Variables fallback desde `.env`
**Dependencias**: T8-AUTH-SERVER

---

## Área 4 — API Routes (Backend)

### Tarea 11: API — Servicios públicos
**ID**: T11-API-SERVICES
**Tipo**: backend
**Complejidad**: S
**Descripción**: Endpoint público para listar categorías de servicio activas.
**Archivos esperados**:
- `src/app/api/services/route.ts`
- `src/lib/validators/services.ts` (Zod)
**Criterio de aceptación**:
- `GET /api/services` retorna array de servicios activos con cache de 60s
- Validación Zod en respuesta
- Sin auth requerida
**Dependencias**: T5-SCHEMA-SERVICES

### Tarea 12: API — Disponibilidad de turnos
**ID**: T12-API-AVAILABILITY
**Tipo**: backend
**Complejidad**: L
**Descripción**: Endpoint que calcula slots disponibles dado un servicio + fecha, considerando appointments existentes y blocked_slots.
**Archivos esperados**:
- `src/app/api/availability/route.ts`
- `src/lib/availability.ts` (lógica pura, testeable)
- `src/__tests__/availability.test.ts`
**Criterio de aceptación**:
- `GET /api/availability?service_id=X&date=YYYY-MM-DD` retorna `[{start_at, end_at, available: true}]`
- Excluye horarios bloqueados
- Excluye horarios con appointment status != cancelled
- Considera duración del servicio
- Respeta horario laboral (BUSINESS_HOURS config)
- 5+ tests unitarios cubriendo: día normal, día con bloqueo, día con appointments, fin de semana, día completo
**Dependencias**: T7-SCHEMA-APPTS, T11-API-SERVICES

### Tarea 13: API — Crear turno público
**ID**: T13-API-CREATE-APPT
**Tipo**: backend
**Complejidad**: L
**Descripción**: Endpoint público para crear turno + paciente (upsert por email/dni) + token de confirmación.
**Archivos esperados**:
- `src/app/api/appointments/route.ts`
- `src/lib/validators/appointments.ts` (Zod)
**Criterio de aceptación**:
- `POST /api/appointments` con `{patient: {...}, service_id, start_at}` crea/actualiza paciente y crea appointment con status=pending
- Validación: slot disponible (re-check antes de insertar), datos válidos
- Retorna `{appointment_id, confirmation_token}`
- Trigger envío email de confirmación (T26)
- Rate limit: 5 req/min por IP (Vercel KV o memoria local)
- Race condition: si dos requests piden mismo slot, solo uno gana (transaction + check)
**Dependencias**: T12-API-AVAILABILITY, T6-SCHEMA-PATIENTS

### Tarea 14: API — Confirmar/Cancelar turno con token
**ID**: T14-API-TOKEN-ACTIONS
**Tipo**: backend
**Complejidad**: M
**Descripción**: Endpoints públicos accesibles solo via token (no auth).
**Archivos esperados**:
- `src/app/api/appointments/confirm/[token]/route.ts`
- `src/app/api/appointments/cancel/[token]/route.ts`
**Criterio de aceptación**:
- `GET /api/appointments/confirm/:token` cambia status a confirmed (si era pending) y retorna OK
- `GET /api/appointments/cancel/:token` cambia status a cancelled (si era pending/confirmed) y retorna OK
- Token inválido → 404
- Token expirado (>30 días) → 410 Gone
- Email de notificación a admin tras cancelación
**Dependencias**: T13-API-CREATE-APPT

### Tarea 15: API — Admin appointments CRUD
**ID**: T15-API-ADMIN-APPTS
**Tipo**: backend
**Complejidad**: L
**Descripción**: CRUD de turnos para admin (auth required).
**Archivos esperados**:
- `src/app/api/admin/appointments/route.ts` (GET list, POST create)
- `src/app/api/admin/appointments/[id]/route.ts` (GET, PATCH, DELETE)
**Criterio de aceptación**:
- GET con filtros: `?from=&to=&status=&service_id=&patient_id=`
- POST: admin puede crear turno sin restricción de horario laboral (override)
- PATCH: cambiar status, reasignar slot, agregar notas
- DELETE: soft delete (status=cancelled, audit log)
- Todos los endpoints validan sesión Better Auth con role='admin'
- Tests: 401 sin auth, 403 con role wrong, 200 con admin
**Dependencias**: T8-AUTH-SERVER, T7-SCHEMA-APPTS

### Tarea 16: API — Admin patients CRUD
**ID**: T16-API-ADMIN-PATIENTS
**Tipo**: backend
**Complejidad**: M
**Descripción**: CRUD pacientes (admin), incluye búsqueda y exportación.
**Archivos esperados**:
- `src/app/api/admin/patients/route.ts`
- `src/app/api/admin/patients/[id]/route.ts`
- `src/app/api/admin/patients/[id]/appointments/route.ts`
**Criterio de aceptación**:
- GET con search por nombre/email/dni (`?q=`)
- GET `/[id]/appointments` retorna histórico de turnos del paciente
- PATCH permite editar notes y medical_history
- Auth obligatoria
**Dependencias**: T15-API-ADMIN-APPTS

### Tarea 17: API — Admin blocked_slots + services
**ID**: T17-API-ADMIN-CONFIG
**Tipo**: backend
**Complejidad**: M
**Descripción**: CRUD de bloqueos de horario y categorías de servicio.
**Archivos esperados**:
- `src/app/api/admin/blocked-slots/route.ts` y `[id]/route.ts`
- `src/app/api/admin/services/route.ts` y `[id]/route.ts`
**Criterio de aceptación**:
- Bloqueos: crear puntual o recurrente (weekly), validación no superpuestos
- Servicios: CRUD básico, soft-delete (active=false)
- Auth admin obligatoria
**Dependencias**: T15-API-ADMIN-APPTS

---

## Área 5 — Sitio Público (Landing)

### Tarea 18: Layout público + Header + Footer
**ID**: T18-PUBLIC-LAYOUT
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Layout base del sitio público con navegación responsive.
**Archivos esperados**:
- `src/app/(public)/layout.tsx`
- `src/components/public/header.tsx`
- `src/components/public/footer.tsx`
- `src/components/public/mobile-menu.tsx`
**Criterio de aceptación**:
- Header sticky con logo + nav (Inicio, Servicios, Sobre Nosotros, Contacto, "Reservar Turno" CTA)
- Mobile: hamburger → sheet con nav
- Footer: contacto, redes, dirección, copyright
- Accesible (ARIA labels, focus visible)
- Responsive 320px → 1920px (sin overflow horizontal)
**Dependencias**: T1-STYLE, T3-MOTION

### Tarea 19: Hero Section
**ID**: T19-HERO
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Hero principal con headline, subheadline, CTA primario (reservar) y media (imagen del consultorio o video).
**Archivos esperados**:
- `src/components/public/hero.tsx`
**Criterio de aceptación**:
- Headline + subheadline + CTA "Reservar turno" → `/turnos`
- Media (imagen o video del consultorio) — placeholder hasta que image-agent genere
- Animación entrada con Framer Motion (respeta dials de intent.dials_suggested)
- LCP < 2.5s (imagen optimizada con next/image, priority en hero img)
- Sin imágenes de placeholder services (NO picsum/unsplash random)
**Dependencias**: T18-PUBLIC-LAYOUT

### Tarea 20: Sección Servicios
**ID**: T20-SERVICES
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Grid de las 3 categorías de servicio con descripción + CTA reservar.
**Archivos esperados**:
- `src/components/public/services.tsx`
- `src/app/(public)/page.tsx` (composición)
**Criterio de aceptación**:
- Fetch desde `/api/services` (Server Component)
- 3 cards con icono, título, descripción, duración, CTA "Reservar"
- CTA navega a `/turnos?service=<slug>`
- Stagger animation al entrar viewport
- Empty state si no hay servicios activos: mensaje claro
**Dependencias**: T11-API-SERVICES, T18-PUBLIC-LAYOUT

### Tarea 21: Sección Sobre Nosotros + Testimonios + FAQ
**ID**: T21-ABOUT-FAQ
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Tres secciones de contenido estático con copy editable.
**Archivos esperados**:
- `src/components/public/about.tsx`
- `src/components/public/testimonials.tsx`
- `src/components/public/faq.tsx`
- `src/lib/content.ts` (textos centralizados)
**Criterio de aceptación**:
- Sobre Nosotros: bio kinesiólogo/a + foto + credenciales
- Testimonios: carrusel/grid con 3-6 testimonios (placeholders con copy realista, NO Lorem Ipsum)
- FAQ: accordion (shadcn) con 6+ preguntas frecuentes específicas de kinesiología
- Animaciones suaves al entrar viewport
**Dependencias**: T18-PUBLIC-LAYOUT

### Tarea 22: Sección Contacto + Mapa
**ID**: T22-CONTACT-MAP
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Datos de contacto, formulario simple y mapa embebido.
**Archivos esperados**:
- `src/components/public/contact.tsx`
- `src/components/public/map.tsx`
**Criterio de aceptación**:
- Datos: dirección, teléfono (link tel:), email (link mailto:), WhatsApp (link wa.me)
- Mapa: Leaflet + OpenStreetMap (sin API key) o Google Maps embed
- Formulario opcional de contacto (mensaje libre) → POST `/api/contact` envía email a admin
- Lazy load del mapa (no bloquea LCP)
**Dependencias**: T18-PUBLIC-LAYOUT

---

## Área 6 — Sistema de Turnos Público

### Tarea 23: Wizard de reserva — Paso 1 Servicio + Paso 2 Calendario
**ID**: T23-BOOKING-WIZARD-1
**Tipo**: frontend
**Complejidad**: L
**Descripción**: Flow multi-paso con selección de servicio y calendario interactivo.
**Archivos esperados**:
- `src/app/(public)/turnos/page.tsx`
- `src/components/booking/wizard.tsx`
- `src/components/booking/service-step.tsx`
- `src/components/booking/calendar-step.tsx`
- `src/hooks/use-booking-state.ts` (Zustand local)
**Criterio de aceptación**:
- Paso 1: 3 cards de servicios → click avanza
- Paso 2: calendario mensual (shadcn Calendar) + slots disponibles para fecha seleccionada
- Slots se cargan desde `/api/availability` con loading skeleton
- Días sin disponibilidad: visualmente disabled
- Navegación atrás conserva estado
- Pre-selección desde query param `?service=<slug>`
**Dependencias**: T12-API-AVAILABILITY, T20-SERVICES

### Tarea 24: Wizard de reserva — Paso 3 Datos paciente + Paso 4 Confirmación
**ID**: T24-BOOKING-WIZARD-2
**Tipo**: frontend
**Complejidad**: L
**Descripción**: Formulario de paciente y pantalla de confirmación post-creación.
**Archivos esperados**:
- `src/components/booking/patient-step.tsx`
- `src/components/booking/confirmation-step.tsx`
- `src/lib/validators/booking.ts` (Zod + react-hook-form)
**Criterio de aceptación**:
- Paso 3: form con full_name, email, phone, dni, birth_date, notes opcional
- Validación inline (Zod): email válido, dni 7-8 dígitos, phone formato AR
- Submit → POST `/api/appointments` → muestra loading → paso 4
- Paso 4: confirmación con datos del turno + nota de email enviado
- Error states: slot tomado por otro (race) → reload calendario, mensaje claro
- Toast en éxito y error
**Dependencias**: T23-BOOKING-WIZARD-1, T13-API-CREATE-APPT

### Tarea 25: Páginas confirm/cancel con token
**ID**: T25-TOKEN-PAGES
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Páginas accesibles desde el link del email.
**Archivos esperados**:
- `src/app/(public)/turnos/confirmar/[token]/page.tsx`
- `src/app/(public)/turnos/cancelar/[token]/page.tsx`
**Criterio de aceptación**:
- Confirmar: muestra detalles del turno + botón "Confirmar asistencia" → POST → success/error UI
- Cancelar: muestra detalles + confirmación "¿Estás seguro?" + razón opcional → POST → success
- Estados: token inválido (404 page), token expirado (410), turno ya cancelado (mensaje informativo)
- Redirige a home tras 5s en éxito
**Dependencias**: T14-API-TOKEN-ACTIONS

---

## Área 7 — Email (Resend)

### Tarea 26: Email — Templates + send wrapper
**ID**: T26-EMAIL-CORE
**Tipo**: backend
**Complejidad**: M
**Descripción**: Configurar Resend, crear wrapper de envío y templates con react-email.
**Archivos esperados**:
- `src/lib/email/client.ts` (Resend instance)
- `src/lib/email/send.ts` (wrapper con retry + log)
- `src/emails/booking-confirmation.tsx` (react-email template)
- `src/emails/booking-cancelled.tsx`
- `src/emails/admin-new-booking.tsx`
- `src/emails/admin-cancellation.tsx`
- `src/emails/booking-reminder.tsx` (24h antes)
**Criterio de aceptación**:
- Templates render correcto en preview (`npm run email:dev`)
- Email contiene: datos del turno, link de confirmación (token), link de cancelación, contacto del consultorio
- Wrapper maneja errores (no rompe el flujo de creación de turno si Resend falla — log + alert admin)
- Preview disponible en `/api/email/preview/[template]` solo en dev
**Dependencias**: T13-API-CREATE-APPT

### Tarea 27: Email — Triggers + Cron de recordatorios
**ID**: T27-EMAIL-TRIGGERS
**Tipo**: backend
**Complejidad**: M
**Descripción**: Conectar emails al flujo de booking + cron job para recordatorios 24h antes.
**Archivos esperados**:
- `src/app/api/cron/reminders/route.ts` (con verificación de Vercel Cron secret)
- `vercel.json` con cron: `"crons": [{"path": "/api/cron/reminders", "schedule": "0 9 * * *"}]`
**Criterio de aceptación**:
- Crear turno → email paciente + email admin
- Cancelar turno → email paciente + email admin
- Cron diario 09:00 envía reminder a turnos del día siguiente
- Endpoint cron protegido con `CRON_SECRET` (header verification)
**Dependencias**: T26-EMAIL-CORE, T14-API-TOKEN-ACTIONS

---

## Área 8 — Panel Admin

### Tarea 28: Layout Admin + Sidebar + Auth Guard
**ID**: T28-ADMIN-LAYOUT
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Estructura del panel admin con navegación y guards.
**Archivos esperados**:
- `src/app/admin/layout.tsx`
- `src/components/admin/sidebar.tsx`
- `src/components/admin/topbar.tsx`
**Criterio de aceptación**:
- Sidebar con: Dashboard, Turnos, Pacientes, Servicios, Bloqueos, Configuración, Logout
- Topbar con avatar + nombre admin + dropdown logout
- Sin sesión → redirige a `/admin/login` (proxy.ts)
- Layout responsive: sidebar collapsible en mobile (sheet)
- Active state visible en sidebar según ruta actual
**Dependencias**: T9-AUTH-CLIENT

### Tarea 29: Dashboard — Calendario semanal/mensual
**ID**: T29-ADMIN-CALENDAR
**Tipo**: frontend
**Complejidad**: XL
**Descripción**: Vista de calendario tipo Google Calendar con turnos como bloques.
**Archivos esperados**:
- `src/app/admin/dashboard/page.tsx`
- `src/components/admin/calendar/index.tsx`
- `src/components/admin/calendar/week-view.tsx`
- `src/components/admin/calendar/month-view.tsx`
- `src/components/admin/calendar/day-view.tsx`
- `src/components/admin/calendar/appointment-block.tsx`
**Criterio de aceptación**:
- Toggle entre vista semanal / mensual / día
- Turnos renderizados como bloques de color según servicio (color de service_categories)
- Hover muestra tooltip con paciente + servicio + horario
- Click en turno abre dialog de detalle (T31)
- Click en slot vacío abre dialog de creación rápida
- Bloqueos visibles como zonas grises diagonales
- Navegación temporal (prev/next week/month, "Hoy")
- Loading state, empty state ("No hay turnos esta semana")
- Performance: virtualización si >100 turnos en vista
**Dependencias**: T15-API-ADMIN-APPTS, T28-ADMIN-LAYOUT

### Tarea 30: Dashboard — KPIs (sidebar/top widgets)
**ID**: T30-ADMIN-KPIS
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Widgets con métricas: turnos hoy, semana, ocupación %, próximo turno.
**Archivos esperados**:
- `src/components/admin/kpis.tsx`
- `src/app/api/admin/stats/route.ts`
**Criterio de aceptación**:
- 4 cards: Turnos hoy, Turnos esta semana, % ocupación semanal, Próximo turno
- Datos en tiempo real (revalidate cada 60s)
- Loading skeleton
- Iconos coherentes con design system
**Dependencias**: T29-ADMIN-CALENDAR

### Tarea 31: Admin — Detalle/Edición de turno
**ID**: T31-ADMIN-APPT-DETAIL
**Tipo**: frontend
**Complejidad**: L
**Descripción**: Dialog/sheet con detalle completo del turno + acciones.
**Archivos esperados**:
- `src/components/admin/appointment-detail.tsx`
- `src/components/admin/appointment-form.tsx` (compartido create/edit)
**Criterio de aceptación**:
- Muestra: paciente (link a ficha), servicio, fecha/hora, status, notas, historial de cambios (audit_log)
- Acciones: cambiar status (confirmar/cancelar/completar/no-show), editar notas, reasignar slot, eliminar
- Confirmación destructiva para eliminar
- Toast en éxito/error
- Optimistic UI (rollback si falla)
**Dependencias**: T15-API-ADMIN-APPTS, T29-ADMIN-CALENDAR

### Tarea 32: Admin — Lista de pacientes
**ID**: T32-ADMIN-PATIENTS-LIST
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Tabla de pacientes con búsqueda, paginación y CTA "ver ficha".
**Archivos esperados**:
- `src/app/admin/pacientes/page.tsx`
- `src/components/admin/patients-table.tsx`
**Criterio de aceptación**:
- Tabla shadcn con columnas: nombre, email, phone, último turno, total turnos, acciones
- Búsqueda live por nombre/email/dni (debounced 300ms)
- Paginación 20 por página
- Empty state ("Aún no hay pacientes")
- Sort por columnas
**Dependencias**: T16-API-ADMIN-PATIENTS, T28-ADMIN-LAYOUT

### Tarea 33: Admin — Ficha de paciente
**ID**: T33-ADMIN-PATIENT-DETAIL
**Tipo**: frontend
**Complejidad**: L
**Descripción**: Vista detallada con datos personales, historial clínico editable, histórico de turnos.
**Archivos esperados**:
- `src/app/admin/pacientes/[id]/page.tsx`
- `src/components/admin/patient-detail.tsx`
- `src/components/admin/patient-history.tsx`
**Criterio de aceptación**:
- Tabs: Datos, Historial Clínico, Turnos
- Edición inline con guardado automático (debounced) o botón "Guardar"
- Lista de turnos pasados/futuros con link a detalle
- CTA "Crear nuevo turno para este paciente"
- Audit log visible (quién editó qué y cuándo)
**Dependencias**: T16-API-ADMIN-PATIENTS, T31-ADMIN-APPT-DETAIL

### Tarea 34: Admin — Bloqueos de horario
**ID**: T34-ADMIN-BLOCKED
**Tipo**: frontend
**Complejidad**: M
**Descripción**: CRUD de bloqueos puntuales y recurrentes.
**Archivos esperados**:
- `src/app/admin/bloqueos/page.tsx`
- `src/components/admin/blocked-slot-form.tsx`
**Criterio de aceptación**:
- Lista de bloqueos activos (futuros + recurrentes)
- Form crear: tipo (puntual/semanal), fecha/hora inicio-fin, razón
- Editar y eliminar
- Validación: no superponer con turnos confirmados existentes (warning, no bloquea)
**Dependencias**: T17-API-ADMIN-CONFIG, T28-ADMIN-LAYOUT

### Tarea 35: Admin — Servicios + Configuración general
**ID**: T35-ADMIN-CONFIG
**Tipo**: frontend
**Complejidad**: M
**Descripción**: CRUD servicios + página de configuración (horario laboral, contacto, branding).
**Archivos esperados**:
- `src/app/admin/servicios/page.tsx`
- `src/app/admin/configuracion/page.tsx`
- `src/components/admin/service-form.tsx`
- `src/components/admin/business-hours-form.tsx`
**Criterio de aceptación**:
- Servicios: tabla + form (nombre, descripción, duración, color picker, activo)
- Configuración: horario laboral por día (open/close/closed), datos de contacto, email admin
- Cambios reflejados inmediatamente en disponibilidad pública
**Dependencias**: T17-API-ADMIN-CONFIG, T28-ADMIN-LAYOUT

---

## Área 9 — SEO, Estados, Accesibilidad

### Tarea 36: SEO — Metadata + sitemap + robots
**ID**: T36-SEO
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Meta tags, OG, sitemap dinámico, robots.txt.
**Archivos esperados**:
- `src/app/(public)/layout.tsx` (metadata generada)
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/opengraph-image.tsx` (dinámico)
**Criterio de aceptación**:
- Cada página pública tiene `<title>` único y `<meta description>`
- OG image dinámica con título de página
- Sitemap incluye home + cada página estática
- robots.txt: allow `/`, disallow `/admin`, `/api`
- JSON-LD: LocalBusiness + MedicalBusiness en home
- Lighthouse SEO ≥ 95 en home
**Dependencias**: T18-PUBLIC-LAYOUT

### Tarea 37: Estados secundarios (loading/error/empty/404)
**ID**: T37-STATES
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Páginas y componentes para estados no-happy-path.
**Archivos esperados**:
- `src/app/not-found.tsx` (404 con branding)
- `src/app/error.tsx` (500 fallback)
- `src/app/(public)/turnos/loading.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/error-state.tsx`
**Criterio de aceptación**:
- 404 personalizada con CTA "Volver al inicio" / "Reservar turno"
- Error boundaries en rutas críticas
- Empty states en: turnos sin servicios, calendario sin disponibilidad, lista de pacientes vacía
- Loading: skeletons en lugar de spinners en páginas con data
- Offline detection (toast con mensaje)
**Dependencias**: T18-PUBLIC-LAYOUT, T28-ADMIN-LAYOUT

### Tarea 38: Accesibilidad audit + fixes
**ID**: T38-A11Y
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Audit con axe + correcciones a problemas detectados.
**Archivos esperados**: ajustes en componentes existentes
**Criterio de aceptación**:
- axe-core 0 violations críticas en home, /turnos, /admin/dashboard
- Todos los formularios tienen labels asociados
- Color contrast AA en todos los textos (mínimo 4.5:1)
- Focus visible en todos los elementos interactivos
- Skip link "Saltar al contenido" en layout público
- Lighthouse Accessibility ≥ 95
**Dependencias**: T18-PUBLIC-LAYOUT, T29-ADMIN-CALENDAR

---

## Área 10 — Testing & QA

### Tarea 39: Tests unitarios — lib/availability + validators
**ID**: T39-UNIT-TESTS
**Tipo**: backend
**Complejidad**: M
**Descripción**: Suite de tests unitarios para lógica crítica.
**Archivos esperados**:
- `src/__tests__/availability.test.ts` (8+ casos)
- `src/__tests__/validators.test.ts`
- `src/__tests__/date.test.ts`
**Criterio de aceptación**:
- Coverage ≥ 80% en `lib/`
- Tests pasan en CI (`npm test`)
- Edge cases: timezone (AR), DST, fin de semana, día completo, slot 0min
**Dependencias**: T12-API-AVAILABILITY

### Tarea 40: Tests E2E — Flujo de reserva pública
**ID**: T40-E2E-BOOKING
**Tipo**: fullstack
**Complejidad**: L
**Descripción**: Playwright test del flujo completo de reserva.
**Archivos esperados**:
- `e2e/booking.spec.ts`
- `playwright.config.ts`
**Criterio de aceptación**:
- Test: home → /turnos → selecciona servicio → selecciona fecha → selecciona slot → llena form → submit → confirmación
- Test: confirmar via token (link de email mock)
- Test: cancelar via token
- Test: race condition (2 reservas mismo slot, una falla con mensaje claro)
- Tests pasan en Chromium
**Dependencias**: T24-BOOKING-WIZARD-2, T25-TOKEN-PAGES

### Tarea 41: Tests E2E — Flujo admin
**ID**: T41-E2E-ADMIN
**Tipo**: fullstack
**Complejidad**: L
**Descripción**: Playwright test de operaciones admin.
**Archivos esperados**:
- `e2e/admin.spec.ts`
**Criterio de aceptación**:
- Test: signup admin (seed) → login → dashboard → crear turno manual → editar → eliminar → logout
- Test: crear paciente → editar ficha → ver historial
- Test: crear bloqueo → verificar que no aparece en availability pública
- Test: 401/redirect si se accede a `/admin/dashboard` sin auth
**Dependencias**: T35-ADMIN-CONFIG, T34-ADMIN-BLOCKED, T33-ADMIN-PATIENT-DETAIL

### Tarea 42: Tests integración — API endpoints
**ID**: T42-API-TESTS
**Tipo**: backend
**Complejidad**: M
**Descripción**: Tests de endpoints contra DB de test.
**Archivos esperados**:
- `src/__tests__/api/appointments.test.ts`
- `src/__tests__/api/auth.test.ts`
- `src/__tests__/api/admin.test.ts`
**Criterio de aceptación**:
- Suite con DB de test (transaccional, rollback al final)
- Casos: 200/201/400/401/403/404/409
- Race condition test (Promise.all 2 inserts mismo slot → uno gana)
**Dependencias**: T15-API-ADMIN-APPTS

---

## Área 11 — Seguridad y Performance

### Tarea 43: Seguridad — Headers + Rate limit + Audit log
**ID**: T43-SECURITY
**Tipo**: backend
**Complejidad**: M
**Descripción**: Hardening de seguridad.
**Archivos esperados**:
- `vercel.json` con security headers
- `src/lib/rate-limit.ts`
- `src/lib/audit.ts` (helper para logear acciones admin)
**Criterio de aceptación**:
- Headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, CSP estricta
- Rate limit en endpoints públicos (5/min IP en booking, 10/min en availability)
- Todos los mutations admin escriben en audit_log
- CSRF: Better Auth ya lo maneja (verificar)
- Validación Zod en TODOS los inputs (request body, query, params)
- No secrets en logs (sanitizer)
**Dependencias**: T15-API-ADMIN-APPTS, T13-API-CREATE-APPT

### Tarea 44: Performance — Bundle + Images + Caching
**ID**: T44-PERF
**Tipo**: frontend
**Complejidad**: M
**Descripción**: Optimización de bundle, imágenes y caching estratégico.
**Archivos esperados**:
- `vercel.json` (Cache-Control headers)
- `next.config.ts` (image domains, compress)
- `bundlewatch.config.json`
**Criterio de aceptación**:
- Bundle main < 250KB gzip, vendor < 150KB gzip, páginas < 50KB gzip
- Imágenes via next/image con sizes correctos
- Cache: assets 7d, JS/CSS 1h, HTML 0
- Lighthouse Performance ≥ 85 (móvil) en home y /turnos
- LCP < 2.5s, CLS < 0.1, INP < 200ms
- Calendar admin: virtualizado o lazy si >50 turnos
**Dependencias**: T19-HERO, T29-ADMIN-CALENDAR

---

## Área 12 — Deploy

### Tarea 45: Vercel — Setup proyecto + env vars
**ID**: T45-VERCEL-SETUP
**Tipo**: config
**Complejidad**: S
**Descripción**: Linkear repo a Vercel, configurar env vars en preview/production.
**Archivos esperados**:
- `vercel.json` (regions, framework)
**Criterio de aceptación**:
- `vercel link` ejecutado, proyecto creado
- Env vars en Preview y Production: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `ADMIN_EMAIL`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`
- `BETTER_AUTH_URL` apunta a dominio Vercel correcto en cada env
- Region: `gru1` (São Paulo, latencia AR)
**Dependencias**: T0-INFRA

### Tarea 46: Deploy preview + smoke test
**ID**: T46-DEPLOY-PREVIEW
**Tipo**: fullstack
**Complejidad**: M
**Descripción**: Deploy a preview URL y verificación end-to-end en producción real.
**Archivos esperados**: ninguno (verificación)
**Criterio de aceptación**:
- Build pasa en Vercel sin warnings críticos
- Migración Better Auth ejecutada contra DB de producción
- Seed admin ejecutado contra DB de producción
- Smoke test manual: home loads, /turnos loads, /admin/login loads, login funciona, crear turno funciona end-to-end con email REAL recibido
- Mixed Content check: 0 warnings
- Mobile responsive verificado en device real
**Dependencias**: T45-VERCEL-SETUP, T42-API-TESTS

### Tarea 47: Documentación final + Handoff
**ID**: T47-DOCS
**Tipo**: config
**Complejidad**: S
**Descripción**: README final con instrucciones de uso, troubleshooting, runbook.
**Archivos esperados**:
- `README.md` (actualizado)
- `docs/admin-guide.md` (manual del admin)
- `docs/troubleshooting.md`
**Criterio de aceptación**:
- README con: descripción, stack, setup local completo, scripts, deploy
- Admin guide explica: crear admin, gestionar turnos, ficha paciente, bloqueos, servicios
- Troubleshooting cubre: emails no llegan, login falla, DB connection, migraciones
**Dependencias**: T46-DEPLOY-PREVIEW

---

## Resumen por área

| Área | Tareas | Complejidad total |
|------|--------|-------------------|
| 1. Setup & Infrastructure | T0–T3 (4) | S+M+M+S |
| 2. Database Schema | T4–T7 (4) | S+S+S+M |
| 3. Authentication | T8–T10 (3) | M+M+S |
| 4. API Routes | T11–T17 (7) | S+L+L+M+L+M+M |
| 5. Sitio Público | T18–T22 (5) | M+M+M+M+M |
| 6. Sistema Turnos Público | T23–T25 (3) | L+L+M |
| 7. Email | T26–T27 (2) | M+M |
| 8. Panel Admin | T28–T35 (8) | M+XL+M+L+M+L+M+M |
| 9. SEO/Estados/A11y | T36–T38 (3) | M+M+M |
| 10. Testing & QA | T39–T42 (4) | M+L+L+M |
| 11. Security/Performance | T43–T44 (2) | M+M |
| 12. Deploy | T45–T47 (3) | S+M+S |
| **TOTAL** | **48 tareas** | ~36h work + buffer |

## Critical Path (dependencias bloqueantes)
```
T0 → T2 → T4,T5,T6 → T7 → T8 → T9 → T10
                          ↓
T0 → T1, T3
                          ↓
T7 → T11 → T12 → T13 → T14 → T26 → T27
                       ↓
T18 → T19,T20,T21,T22 (paralelo)
                       ↓
T23 → T24 → T25
                       ↓
T28 → T29 → T30,T31
              ↓
T32 → T33; T34, T35 (paralelo)
                       ↓
T36, T37, T38 (paralelo)
                       ↓
T39, T40, T41, T42 (paralelo)
                       ↓
T43, T44 (paralelo)
                       ↓
T45 → T46 → T47
```

## Notas finales
- **Mood/branding** se define en Fase 2 antes de implementar componentes UI. Tareas de UI (T18-T35) consumen `{proyecto}/visual-direction` y `{proyecto}/branding`.
- **Imágenes**: hero (T19), about/testimonios (T21) requieren image-agent en Fase 2B. NO usar placeholder services.
- **Logo**: requerido en T18 (header/footer) — generado por logo-agent en Fase 2B.
- **Evidence collector**: cada tarea de UI pasa por QA antes de avanzar (proxy.ts intercepta sin auth en admin).
- **Seguridad**: T43 es non-negotiable — security-engineer revisa en Fase 2 paralelo y reality-checker valida en Fase 4.
