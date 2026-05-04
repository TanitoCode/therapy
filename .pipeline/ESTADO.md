# DAG State — Therapy

> Backup en disco del estado del pipeline. Source of truth: Engram (`therapy/estado`).
> Última actualización: 2026-04-28T14:00:00Z

## Identidad

- **Proyecto**: therapy
- **Tipo**: web (landing + booking + admin panel)
- **Estructura**: single-repo
- **Locale**: es-AR
- **Timezone**: America/Argentina/Buenos_Aires

## Stack

| Capa          | Tecnología                                             |
| ------------- | ------------------------------------------------------ |
| Frontend      | Next.js 15 (App Router)                                |
| UI            | Tailwind 4 + shadcn/ui                                 |
| Motion        | Framer Motion                                          |
| Backend       | Next.js Route Handlers (REST)                          |
| DB            | Neon PostgreSQL (Transaction Pooler)                   |
| ORM           | Drizzle (postgres-js driver, prepare:false)            |
| Auth          | Better Auth (role-based: admin/staff)                  |
| Email         | Resend + react-email                                   |
| Mapa          | Leaflet + OpenStreetMap (sin API key)                  |
| Tests         | Vitest + Playwright                                    |
| Deploy        | Vercel (gru1 — São Paulo)                              |
| Design System | custom (parametrizado sobre preset editorial-magazine) |

## Intent (Fase 1 Paso 0 — completado)

- **Mood preset**: `editorial-magazine` warm-luxury
- **Originalidad**: balanceado
- **Audience**: B2C (pacientes, todas edades)
- **Reference source**: preset puro (sin imagen/URL aportada)
- **Dials sugeridos**: variance=5, motion=5, density=3
- **Anti-patterns HIGH**:
  - NO teal/cyan SaaS (#0d9488, #14b8a6)
  - NO Inter como heading
  - NO cards uniformes shadow-sm grid 3 columnas
  - NO hero gradient mesh + button rounded-lg
  - NO stock photos doctores genéricos
  - NO iconos lucide outline genéricos
- **Tokens heredados**: serif display heading (Fraunces/Newsreader/Playfair), warm palette (cremas/beiges/terracota/salvia), whitespace generoso

## Gaps Resueltos (input usuario)

| Gap              | Resolución                                 |
| ---------------- | ------------------------------------------ |
| DB Provider      | Neon                                       |
| Admin email      | env var `ADMIN_EMAIL`                      |
| Nombre comercial | Therapy                                    |
| Dirección física | placeholder genérico (resolver pre-deploy) |
| Duración turno   | 45 min                                     |
| Horario          | Lun-Vie 09-19                              |
| Mapa             | Leaflet + OSM                              |

## Fases

### ✅ Fase 1 — Planificación (completada 2026-04-28)

- Intent capturado: `therapy/intent`
- 48 tareas migradas a Engram: `therapy/tareas`
- DAG State inicializado: `therapy/estado`

### 🔄 Fase 2 — Arquitectura (en progreso — parcial 2026-04-29)

- [x] Paso 1: ux-architect → `therapy/css-foundation` ✅ (src/app/globals.css — Fraunces+Plus Jakarta Sans, paleta warm)
- [x] Paso 1.5: Visual Direction Checkpoint → `therapy/visual-direction` ✅ (usuario confirmó: editorial, hero imagen estática, nav blur, moderado, light mode, smooth-scroll+text-reveal+stagger)
- [x] Paso 2: ui-designer → `therapy/design-system` ✅ (1275 líneas, AUTO_AUDIT 6/6 PASS)
- [x] Paso 2: security-engineer → `therapy/security-spec` ✅ (820 líneas, 5 CRITICAL mitigadas, Upstash Redis rate limiting)

### ⏳ Fase 2B — Assets visuales

- [ ] brand-agent → `therapy/branding`
- [ ] (pausa aprobación)
- [ ] Elegir backend imágenes (Gemini vs HuggingFace)
- [ ] logo-agent + image-agent (paralelo)
- [ ] Video: NO requerido

### ⏳ Fase 3 — Dev ↔ QA Loop

- 48 tareas en orden topológico (ver critical path en `tareas.md`)

### ⏳ Fase 4 — Certificación

- seo-discovery (structural) → api-tester + performance-benchmarker → seo-discovery (full) → reality-checker

### ⏳ Fase 5 — Publicación

- git → deployer (Vercel preview → production)

## Estado Sistema

- `phase_gate_retries`: 0
- `recertification_cycles`: 0
- `qa_mode`: full
- `engram_degraded`: false
- `recovered`: false
