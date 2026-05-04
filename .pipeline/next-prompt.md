Retomamos Therapy. --skip-boot

## Estado conocido (no re-verificar, no llamar Engram)
- therapy/estado ✅ Engram #21
- Fase 2 ✅ completa
- Fase 2B ✅ completa
- Fase 3 en progreso — T1✅ T2✅ T3✅ T4-T7✅ T8✅ T9✅ T10✅ T11✅ T12✅
- Proyecto en /home/soporte/proyectos/kinesio

## Completado en sesión anterior
- T8-T10: Better Auth server + client + seed admin
- T11: GET /api/services con cache 60s y Zod
- T12: GET /api/availability — lógica pura en src/lib/availability.ts, 18 tests (18/18 PASS),
  manejo de recurring blocked slots, timezone AR (UTC-3 hardcoded, sin DST)

## Acción inmediata
Continuar Fase 3 desde T13-API-CREATE-APPT.
NO spawnear orquestador como subagente.
NO releer archivos de diseño inline.
DAG State: solo resumen ligero.
