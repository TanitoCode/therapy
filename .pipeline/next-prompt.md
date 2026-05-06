Retomamos Therapy. --skip-boot

## Estado conocido (no re-verificar, no llamar Engram)
- therapy/estado ✅ Engram actualizado
- Fase 2 ✅ completa
- Fase 2B ✅ completa
- Fase 3 en progreso — T1-T37 ✅
- Proyecto en /home/soporte/proyectos/kinesio
- Build limpio: 37 rutas, tsc sin errores

## Completado en sesiones anteriores
- T1-T13: Setup, DB schema, Better Auth, APIs públicas (servicios, availability, booking)
- T14-T17: APIs token actions, admin appointments, patients, blocked slots
- T18-T22: Layout público, header/footer, hero, servicios, about, contacto+mapa
- T23-T24: Wizard de reserva 4 pasos completo
- T25: Páginas /turnos/cancelar/[token] + /turnos/confirmar/[token]
- T26: 5 email templates react-email + Resend client + send.ts real (con retry)
- T27: /api/cron/reminders + vercel.json (cron 09:00 diario, security headers, cache)
- T28: Admin layout + sidebar + topbar (auth guard server-side, mobile sheet)
- T29: Calendario admin semana/mes/día custom (sin librerías externas), fetch por rango
- T30: /api/admin/stats + kpis.tsx (4 cards, revalidate 60s)
- T31: appointment-detail.tsx + appointment-form.tsx + dashboard-client.tsx (optimistic UI)
- T32: /admin/pacientes — tabla con búsqueda debounced + paginación
- T33: /admin/pacientes/[id] — ficha con tabs Datos/Historial Clínico/Turnos
- T34: /admin/bloqueos — CRUD bloqueos puntuales/semanales
- T35: /admin/servicios CRUD + /admin/configuracion (localStorage MVP)
- T36: SEO — metadata layout público, sitemap.ts, robots.ts, opengraph-image.tsx, JSON-LD MedicalBusiness
- T37: not-found.tsx, error.tsx, turnos/loading.tsx, empty-state.tsx, error-state.tsx

## Pendiente Fase 3
- T38: Accessibility audit (axe + fixes — skip link ya hecho en T36)

## Pendiente Fase 4
- T39: Tests unitarios lib/availability + validators (ya existe src/__tests__/availability.test.ts)
- T40: Tests E2E flujo reserva pública (Playwright)
- T41: Tests E2E flujo admin
- T42: Tests integración API endpoints
- T43: Security — headers + rate limit + audit log
- T44: Performance — bundle gates + images + caching

## Pendiente Fase 5
- T45: Vercel setup + env vars
- T46: Deploy preview + smoke test
- T47: Docs finales

## Notas técnicas para próxima sesión
- @react-email/components requiere instalación separada (ya hecho: npm install)
- cancelToken y confirmationToken son campos DISTINTOS en schema appointments
- admin/turnos/page.tsx hace redirect a /admin/dashboard (sidebar lo necesita)
- vercel.json ya existe con cron + security headers + cache rules
- BUSINESS_HOURS.workDays es readonly — usar [...BUSINESS_HOURS.workDays] al copiar
- Los agentes background pueden cortarse por rate limit — completar inline si son páginas simples

## Acción inmediata
Continuar desde T38-A11Y.
NO spawnear orquestador como subagente.
NO releer archivos de diseño inline.
DAG State: solo resumen ligero.
