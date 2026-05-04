Retomamos Therapy. --skip-boot

## Estado conocido (no re-verificar, no llamar Engram)
- therapy/estado ✅ Engram #21
- Fase 2 ✅ completa
- Fase 2B ✅ completa
- Fase 3 en progreso — T1✅ T2✅ T3✅ T4-T7✅ T8✅ T9✅ T10✅ T11✅ T12✅ T13✅
- Proyecto en /home/soporte/proyectos/kinesio

## Completado en sesión anterior
- T8-T12: Better Auth + API services + availability (18 tests)
- T13: POST /api/appointments — rate limit (Upstash/in-memory fallback),
  upsert patient (by email → DNI → create), transaction + conflict check,
  fire-and-forget emails (stubs en src/lib/email/send.ts), retorna 201 con tokens
- ESLint fix: argsIgnorePattern ^_ en .eslintrc.json

## Acción inmediata
Continuar Fase 3 desde T14-API-TOKEN-ACTIONS.
NO spawnear orquestador como subagente.
NO releer archivos de diseño inline.
DAG State: solo resumen ligero.
