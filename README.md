# Therapy — Sistema de Turnos para Consultorio de Kinesiología

Sistema de reserva de turnos online para un consultorio de kinesiología en San Rafael, Mendoza.
Permite a los pacientes gestionar sus turnos, y al profesional administrar la agenda desde un panel privado.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Tipado | TypeScript 5 |
| ORM | Drizzle ORM + postgres.js |
| Base de datos | PostgreSQL (Neon) |
| Auth | Better Auth |
| Email | React Email + Resend |
| Animaciones | Framer Motion |
| Rate limiting | Upstash Redis |
| Deploy | Vercel (región gru1) |

## Setup local

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd therapy

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales reales

# 4. Ejecutar migraciones (Better Auth + Drizzle)
npm run migrate       # Better Auth: crea tablas de sesiones/usuarios
npm run db:migrate    # Drizzle: aplica schema del dominio

# 5. Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm start` | Iniciar servidor de producción |
| `npm run lint` | ESLint + TypeScript check |
| `npm run type-check` | Solo TypeScript check |
| `npm run format` | Formatear código con Prettier |
| `npm test` | Ejecutar tests con Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run test:e2e` | Tests E2E con Playwright (requiere servidor activo) |
| `npm run test:e2e:ui` | Tests E2E en modo interactivo |
| `npm run db:generate` | Generar migraciones Drizzle |
| `npm run db:migrate` | Aplicar migraciones Drizzle |
| `npm run db:studio` | Abrir Drizzle Studio |
| `npm run migrate` | Migraciones de Better Auth |
| `npm run seed:admin` | Crear usuario administrador inicial |
| `npm run email:dev` | Servidor de preview de emails (puerto 3001) |

## Estructura de carpetas

```
therapy/
├── src/
│   ├── app/
│   │   ├── (public)/          # Rutas públicas (landing, servicios, contacto)
│   │   ├── admin/
│   │   │   ├── (protected)/   # Rutas protegidas (layout con auth guard)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── pacientes/
│   │   │   │   ├── servicios/
│   │   │   │   ├── bloqueos/
│   │   │   │   ├── turnos/
│   │   │   │   └── configuracion/
│   │   │   └── login/         # Pública — fuera del layout protegido
│   │   └── api/               # API Routes (auth, turnos, webhooks)
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitivos
│   │   ├── public/            # Componentes del sitio público
│   │   ├── admin/             # Componentes del panel admin
│   │   └── booking/           # Componentes del flujo de reserva
│   ├── db/
│   │   └── schema/            # Schema Drizzle (tablas, relaciones)
│   ├── emails/                # Templates React Email
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── email/             # Helpers de envío de emails
│   │   ├── validators/        # Schemas Zod reutilizables
│   │   ├── fonts.ts           # Fuentes next/font
│   │   └── utils.ts           # Utilidades (cn helper)
│   ├── types/                 # Tipos TypeScript globales
│   └── __tests__/             # Tests (Vitest)
│       └── api/
├── scripts/                   # Scripts de utilidad (seed, etc.)
├── drizzle/
│   └── migrations/            # Archivos de migración generados
├── e2e/                       # Tests end-to-end (Playwright)
├── docs/                      # Documentación técnica
├── assets/
│   ├── logos/                 # SVGs del logo
│   └── images/                # Imágenes del proyecto
├── .env.example               # Variables de entorno requeridas
├── brand.json                 # Design tokens del brand
├── components.json            # Configuración shadcn/ui
├── drizzle.config.ts          # Configuración Drizzle Kit
└── vitest.config.ts           # Configuración Vitest
```

## Deploy: Vercel (gru1)

El proyecto está configurado para deployar en Vercel usando la región `gru1` (São Paulo, la más cercana a Buenos Aires).

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod
```

Variables de entorno requeridas en Vercel:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de Neon — Transaction Pooler, puerto 6543 |
| `BETTER_AUTH_SECRET` | Secret para Better Auth — mínimo 32 caracteres |
| `BETTER_AUTH_URL` | URL pública del deployment (ej: `https://tu-dominio.vercel.app`) |
| `RESEND_API_KEY` | API key de Resend para envío de emails |
| `ADMIN_EMAIL` | Email del administrador del consultorio |
| `CRON_SECRET` | Secret para proteger `/api/cron/reminders` |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (igual que `BETTER_AUTH_URL`) |
| `UPSTASH_REDIS_REST_URL` | URL del Redis de Upstash (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Token del Redis de Upstash |

Ver `.env.example` para descripción completa de cada variable.

## Documentación

- [Manual de administración](docs/admin-guide.md) — Gestión de turnos, pacientes, servicios y configuración
- [Troubleshooting](docs/troubleshooting.md) — Problemas comunes y soluciones
