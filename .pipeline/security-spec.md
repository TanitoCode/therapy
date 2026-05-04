# Therapy — Security Spec (Fase 2 Paso 2)

**Proyecto**: Therapy — Consultorio de kinesiología (Buenos Aires, AR)
**Stack**: Next.js 15 App Router · Neon PostgreSQL · Drizzle ORM · Better Auth · Resend · Vercel (gru1)
**Locale**: es-AR · **Fecha**: 2026-04-29
**Autor**: security-engineer (pipeline vibecoding)

---

## 0. Resumen ejecutivo

Therapy es una web app pública que captura **PII médico-light** (nombre, email, teléfono, historial de turnos) de pacientes que reservan online, mas un panel admin con role-based access (`admin`, `staff`). El threat model identifica **5 amenazas CRITICAL**, **9 HIGH**, **7 MEDIUM** y **4 LOW**.

**Amenazas críticas a mitigar antes de deploy**:

1. **C1 — IDOR en endpoints de turnos** (paciente accede/cancela turnos ajenos por adivinar `id`/`token`).
2. **C2 — Broken Access Control en `/admin/*`** (rutas admin sin guard server-side renderizan SSR con datos sensibles).
3. **C3 — Privilege Escalation por mass-assignment** (alta de paciente público que envía `role: "admin"` y Better Auth lo persiste).
4. **C4 — PII en logs/responses** (logs de Vercel exponen email + teléfono; respuestas API filtran campos internos).
5. **C5 — Mass booking abuse** (sin rate limit, un atacante satura agenda con turnos falsos: `POST /api/bookings` infinito).

**Defensas obligatorias antes de Fase 5 (deploy)**: rate limiting (Upstash Redis o Vercel KV), CSP estricta vía `vercel.json`, validación Zod en cada boundary, audit log con esquema `audit_log`, cancelación con HMAC token (no UUID adivinable), `noindex` en `/admin/*`.

---

## 1. STRIDE Threat Model

Componentes evaluados:
- **A.** Better Auth server (`/api/auth/[...all]`) + tabla `user`/`session`
- **B.** Booking API público (`POST /api/bookings`, `GET /api/availability`, `GET /api/services`)
- **C.** Token actions (`POST /api/appointments/cancel`, `POST /api/appointments/reschedule` vía token email)
- **D.** Admin API (`/api/admin/*` — appointments, patients, config)
- **E.** Panel Admin SSR (`/admin/*` rutas Next.js)
- **F.** Email pipeline (Resend — confirmación/recordatorio/cancelación)
- **G.** Database (Neon PostgreSQL — pool serverless)
- **H.** Public site (`/`, `/turnos`, `/contacto`)

### Tabla maestra (priorizada por severidad)

| ID | Componente | Categoría STRIDE | Amenaza | Severidad | Mitigación |
|----|-----------|------------------|---------|-----------|-----------|
| **C1** | B, C | Spoofing + Info Disclosure | Paciente A obtiene `appointment_id` o `token` numérico secuencial y consulta/cancela turno de paciente B | **CRITICAL** | Tokens de cancelación/reschedule = HMAC-SHA256(`appointment_id` + `secret` + `expires_at`), NO UUIDs. Endpoint verifica firma antes de operar. `appointment_id` interno = UUID v4, nunca expuesto al cliente público. |
| **C2** | D, E | Elevation of Privilege | Atacante navega a `/admin` y obtiene HTML SSR con datos sensibles porque el guard solo es client-side | **CRITICAL** | `proxy.ts` (Next 16+) intercepta `/admin/*` y `/api/admin/*` → llama `auth.api.getSession({headers})` server-side → si `session.user.role !== "admin"` → 302 a `/login` o 403 JSON. Adicional: cada server component admin re-verifica con `requireAdmin()`. |
| **C3** | A | Elevation of Privilege | Mass-assignment: cliente envía `{ "email": "x", "role": "admin" }` al endpoint de signup público y Better Auth lo persiste | **CRITICAL** | Better Auth `additionalFields` con `role: { input: false, defaultValue: "staff" }` (input:false bloquea el field desde cliente). Crear admins SOLO vía script seed (T10) o CLI manual con CLI Better Auth. |
| **C4** | B, D, F | Info Disclosure | Logs de Vercel (function logs) imprimen `console.log(req.body)` que contiene email + teléfono → PII en plataforma de terceros. Respuestas API incluyen campos internos (`hashed_password`, `internal_notes`). | **CRITICAL** | Helper `safeLog(payload)` que redacta keys sensibles (`email`, `phone`, `notes`, `token`). Drizzle responses → mapear con `select()` explícito (jamás `select all`). Test: integration test que `POST /api/bookings` y verifica response NO contiene `id` interno crudo, solo confirmación. |
| **C5** | B | Denial of Service | `POST /api/bookings` sin rate limit. Atacante envía 1000 reservas con emails fake → satura agenda 60 días, deniega servicio real. | **CRITICAL** | Rate limit 3/hora/IP en `POST /api/bookings` (Upstash Redis sliding window). Adicional: validación de email (sin throwaway domains conocidos opcional), CAPTCHA invisible (Turnstile) si se detectan >10 attempts/IP/día. Deduplicación: índice único `(email, date, time)` en DB. |
| H1 | A | Spoofing | Session hijacking — cookie `better-auth.session_token` robada por XSS → atacante asume rol admin | HIGH | Cookie con `HttpOnly`, `Secure`, `SameSite=Lax` (Better Auth default). CSP estricta (mitiga XSS). Session expiry 7 días con rotation cada 24h (`updateAge`). |
| H2 | B | Tampering | Cliente modifica `service_id` o `duration` en payload de booking → reserva turno de servicio premium pagando precio básico | HIGH | Server-side: nunca confiar en duración/precio del cliente. `service_id` valida en DB → backend lee `duration_min` y `price` de `services` table al crear appointment. Drizzle insert solo persiste campos sanitizados. |
| H3 | B, C | Repudiation | Paciente cancela turno → al día siguiente niega haberlo cancelado. No hay registro de quién/cuándo. | HIGH | Tabla `audit_log` con `actor_type`, `actor_id`, `actor_email`, `action`, `entity`, `entity_id`, `metadata`, `ip_addr`, `user_agent`, `created_at`. Toda mutación en appointment dispara INSERT en audit_log dentro de la misma transacción Drizzle. |
| H4 | D, E | Info Disclosure | Admin endpoint devuelve listado completo de pacientes con email + teléfono en JSON. Respuesta queda en cache de proxy / browser DevTools. | HIGH | Headers `Cache-Control: no-store, private` en `/api/admin/*`. Pagination obligatoria (max 50 por página). Búsqueda server-side, no enviar lista completa. |
| H5 | F | Info Disclosure + Spoofing | Email de confirmación se envía a address tipeado por atacante (no verificado) → fuga de datos del turno (servicio, fecha, dirección consultorio) a desconocido | HIGH | Token de cancelación con expires_at (7 días post-turno). Email NO incluye nombre completo del paciente, solo iniciales o nombre de pila. Si flow lo requiere: doble opt-in (verificar email antes de confirmar reserva — opcional, evaluar UX). |
| H6 | G | Tampering | SQL injection si algún query usa string concatenation crudo (Drizzle protege con prepared statements PERO `sql\`\`` raw es vulnerable si se concatena input) | HIGH | Lint rule: prohibir `sql\`...${input}...\`` con input de request. Solo `sql\`...${sql.placeholder()}...\`` o queries builder. Code review obligatorio en PR que toque DB. |
| H7 | A | Brute Force | Login admin sin rate limit → atacante prueba password de admin con dict attack (Better Auth tiene 0 protección de fábrica para esto) | HIGH | Rate limit 5/15min/IP en `POST /api/auth/sign-in/email`. Lockout: tras 10 fallos en 1h, cuenta bloqueada 24h (campo `locked_until` en user). Notificación email al admin afectado. |
| H8 | B, H | XSS | Campo `nombre` del paciente se renderiza en panel admin sin escapar → admin abre detalle de paciente con `<script>alert(1)</script>` → XSS en sesión admin | HIGH | React escapa por default — verificar que NO se usa `dangerouslySetInnerHTML`. Validación Zod del nombre: regex `/^[\p{L}\s\-'.]{2,100}$/u` (solo letras Unicode, espacios, guiones, apóstrofes, puntos). CSP `script-src 'self'` bloquea inline. |
| H9 | A, F | Info Disclosure | `BETTER_AUTH_SECRET` o `RESEND_API_KEY` filtrado en client bundle (variable mal prefijada con `NEXT_PUBLIC_`) | HIGH | Convención: ningún secret con prefix `NEXT_PUBLIC_`. CI gate: `grep -r "NEXT_PUBLIC_" --include="*.env*"` no debe contener `SECRET\|KEY\|TOKEN\|PASSWORD`. Build verifica con script pre-deploy. |
| M1 | A | Repudiation | Login admin no queda registrado en audit log | MEDIUM | Hook `after.signIn` en Better Auth → INSERT en `audit_log` con action="admin_login_success" o "admin_login_failed". |
| M2 | B | DoS | `GET /api/availability?date=2099-01-01&days=10000` → query DB pesado consume conexiones del pool Neon | MEDIUM | Validar rango `days <= 60` y `date <= today + 90d` con Zod. Rate limit 30/min/IP. Cache de availability por (service_id, date) en Vercel KV con TTL 5min. |
| M3 | E | Spoofing (Tab-nabbing) | Links externos en panel admin (mapas, redes sociales) sin `rel="noopener noreferrer"` → sitio externo accede a `window.opener` y redirige pestaña admin | MEDIUM | Lint rule: `<a target="_blank">` requiere `rel="noopener noreferrer"`. Verificar con grep en pre-return audit. |
| M4 | D, E | Info Disclosure | Panel admin indexado por Google → URLs `/admin` aparecen en SERPs | MEDIUM | Header `X-Robots-Tag: noindex, nofollow` en `/admin/*` vía `vercel.json`. `robots.txt` con `Disallow: /admin/`, `Disallow: /api/`. Meta tag `<meta name="robots" content="noindex">` en layout admin. |
| M5 | F | Spoofing | Email de Resend con FROM `noreply@therapy.com.ar` no firmado con DKIM/SPF → atacante puede spoofear al consultorio | MEDIUM | Configurar DNS records: SPF `v=spf1 include:_spf.resend.com ~all`, DKIM (Resend dashboard genera), DMARC `v=DMARC1; p=quarantine; rua=mailto:dmarc@therapy.com.ar`. Verificar antes de deploy con `dig TXT therapy.com.ar`. |
| M6 | G | Info Disclosure | DB connection string en Neon contiene password en texto plano → cualquiera con acceso a Vercel env vars la ve | MEDIUM | Usar **Vercel Marketplace integration** Neon → env vars auto-provisionadas con rotación. NO copiar manualmente connection string en logs/Slack/docs. Rotar `DATABASE_URL` cada 90 días. |
| M7 | H | DoS (supply chain) | `package-lock.json` envenenado apunta a host malicioso → typosquatting de dependency | MEDIUM | CI gate: `npx lockfile-lint --allowed-hosts npm --allowed-schemes https: --type npm --path package-lock.json` antes de cada deploy. Renovate/Dependabot con review manual de bumps. |
| L1 | H | Tampering | Source maps en producción exponen código fuente | LOW | Next.js 15: `productionBrowserSourceMaps: false` en `next.config.ts` (default). Verificar pre-deploy: `curl https://therapy.com.ar/_next/static/chunks/main-xxx.js.map` debe ser 404. |
| L2 | F | Spoofing | Email transaccional con HTML mal sanitizado permite phishing | LOW | Templates de Resend hardcoded (no aceptan HTML user-input). Variables interpoladas con `{{nombre}}` escapadas por React Email. |
| L3 | B, H | Info Disclosure | Banner de error genérico expone stack trace en producción | LOW | Next.js `error.tsx` boundary devuelve mensaje genérico. `console.error` solo en dev (`if (process.env.NODE_ENV !== "production")`). Vercel ya redacta `NODE_ENV=production`. |
| L4 | H | Clickjacking | Sitio embebible en iframe → ataque UI redress | LOW | Header `X-Frame-Options: SAMEORIGIN` (sitio público) y `DENY` para `/admin/*`. CSP `frame-ancestors 'self'` (panel admin). |

**Total**: 5 CRITICAL · 9 HIGH · 7 MEDIUM · 4 LOW = **25 amenazas catalogadas**.

---

## 2. OWASP Top 10 (2021) — Checklist específico

### A01: Broken Access Control — **APLICA (CRITICAL)**

**Riesgos en este proyecto**:
- IDOR en `/api/appointments/:id` y `/api/admin/patients/:id`.
- Rutas `/admin/*` accesibles sin auth si guard solo es client.
- Endpoints de mutación admin sin verificación de role.

**Mitigación Next.js 15 + Better Auth**:
- **`proxy.ts`** en raíz (Next 16+) que protege paths matching `/admin/:path*` y `/api/admin/:path*`:
  ```ts
  // proxy.ts
  import { NextResponse, type NextRequest } from "next/server";
  import { getSessionCookie } from "better-auth/cookies";

  export async function proxy(req: NextRequest) {
    const sessionCookie = getSessionCookie(req, { cookiePrefix: "therapy" });
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") ||
                         req.nextUrl.pathname.startsWith("/api/admin");
    if (isAdminRoute && !sessionCookie) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }
  export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
  ```
- **Helper `requireAdmin()`** en cada server component admin y route handler:
  ```ts
  // lib/auth/require.ts
  export async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      throw new Response("Forbidden", { status: 403 });
    }
    return session.user;
  }
  ```
- **IDOR fix**: tokens HMAC para acciones públicas (cancelación), nunca exponer `appointment.id` (UUID interno). Para admin: cada query incluye `WHERE owner_id = :session.userId` cuando aplique.

### A02: Cryptographic Failures — **APLICA (HIGH)**

**Riesgos**:
- Passwords en plain text (mitigado por Better Auth — usa scrypt).
- Connection string DB en logs.
- HMAC token sin secret rotation.

**Mitigación**:
- Better Auth gestiona password hashing con scrypt (default seguro). NO override.
- `BETTER_AUTH_SECRET` ≥ 32 bytes random (`openssl rand -base64 32`).
- HTTPS everywhere — Vercel default + HSTS preload (header en `vercel.json`).
- HMAC para tokens cancelación: secret separado `APPOINTMENT_TOKEN_SECRET` (rotable independiente de BETTER_AUTH_SECRET).
- DB encryption at rest: Neon lo provee by default (AES-256). Sin acción adicional.

### A03: Injection — **APLICA (HIGH)**

**Riesgos**:
- SQL injection si se usa raw SQL con concatenación.
- XSS via campo `nombre`/`notas` del paciente.
- Header injection via `X-Forwarded-For` mal validado en rate limiter.

**Mitigación**:
- **Drizzle ORM** usa prepared statements por default — usar `eq()`, `and()`, query builder. Prohibir `sql\`...\${input}\``. Si se necesita SQL raw, usar `sql.placeholder()`.
- **XSS**: React escapa output. Validación Zod estricta en input (regex unicode para nombre, sin HTML/script tags). NO usar `dangerouslySetInnerHTML` salvo con DOMPurify allowlist.
- **CSP**: `script-src 'self'` (sin `unsafe-inline`). Si Next.js inline scripts requieren nonce, usar el nonce-based CSP de Next 15.
- **Header injection**: validar `X-Forwarded-For` con regex IP (IPv4/IPv6) antes de usar como rate limit key.

### A04: Insecure Design — **APLICA (MEDIUM)**

**Mitigación**:
- Este threat model ES la mitigación de A04 — diseño con seguridad antes de codear.
- Diagramas de flujo de auth + booking deben incluir checkpoints de validación.
- Definir "abuse cases" antes de "use cases": qué hace un atacante con cada feature.

### A05: Security Misconfiguration — **APLICA (HIGH)**

**Riesgos**:
- Headers de seguridad ausentes (Vercel NO los agrega por default).
- CORS permisivo.
- Stack traces expuestos.
- Dev tools / debug endpoints en prod.

**Mitigación**:
- **`vercel.json` con bloque headers completo** (ver §3).
- CORS: API routes solo aceptan same-origin (Next.js default). Si se necesita CORS, allowlist explícita: `origin: "https://therapy.com.ar"`.
- `NODE_ENV=production` (Vercel default) → Next oculta stack traces.
- Pre-deploy script: `grep -rE "TODO|FIXME|XXX|debugger" src/` debe pasar.

### A06: Vulnerable Components — **APLICA (MEDIUM)**

**Mitigación**:
- `npm audit --production` en CI; bloquea deploy si hay HIGH/CRITICAL.
- `lockfile-lint` (ver M7) para supply chain.
- Renovate bot con auto-merge de PATCH, review manual de MINOR/MAJOR.
- Pin de GitHub Actions a SHA (recomendación al orquestador para git-agent): `uses: actions/checkout@8e8c483...` no `@v4`.

### A07: Identification & Auth Failures — **APLICA (HIGH)**

**Riesgos**:
- Brute force admin login.
- Session fixation.
- Password reset flow inseguro.

**Mitigación Better Auth**:
- Rate limit `POST /api/auth/sign-in/email` (5/15min/IP) — implementar con Upstash o Vercel KV (ver §5).
- Better Auth `cookiePrefix: "therapy"` para evitar colisión con otros sites en `*.vercel.app`.
- Password requirements: min 12 chars, mix de case+number+symbol (configurar en Better Auth `password.minLength: 12`).
- Lockout temporal post-10-fallos: campo `locked_until` en `user` table (custom field) + check en hook `before.signIn`.
- Password reset flow: tokens single-use con expiry 1h, invalidados tras uso.
- 2FA opcional para admin (Better Auth tiene plugin `twoFactor`) — recomendado en backlog.

### A08: Software & Data Integrity Failures — **APLICA (MEDIUM)**

**Mitigación**:
- `package-lock.json` commiteado y verificado con lockfile-lint.
- Webhooks de Resend (si se usan) verifican firma HMAC.
- Audit log inmutable: usar PostgreSQL row-level constraint para prevenir UPDATE/DELETE en `audit_log` (solo INSERT desde aplicación).

### A09: Security Logging & Monitoring Failures — **APLICA (HIGH)**

**Riesgos**:
- Sin logs de eventos de seguridad → ataques pasan inadvertidos.
- PII en logs (paradoja: necesitamos logging pero sin filtrar datos).

**Mitigación**:
- **Tabla `audit_log`** (schema en §6) con eventos críticos.
- Helper `safeLog()` que redacta PII keys.
- Vercel Log Drain → enviar logs a SIEM externo si el proyecto crece (no obligatorio en MVP).
- Alertas: si `audit_log` registra ≥10 `admin_login_failed` en 1h → trigger email a `ADMIN_EMAIL` (cron Vercel).

### A10: SSRF — **NO APLICA (LOW)**

El proyecto no hace fetch de URLs proporcionadas por usuarios. Mapas usan Leaflet+OSM con tiles hardcoded. Si se agrega feature que fetch URLs externos: whitelist de dominios + bloqueo de IPs internas (10.0.0.0/8, 169.254.169.254 metadata, etc).

---

## 3. Headers de seguridad — `vercel.json`

Bloque `headers` listo para `vercel.json` (raíz del repo):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
        { "key": "X-DNS-Prefetch-Control", "value": "on" },
        { "key": "X-XSS-Protection", "value": "0" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.neon.tech https://api.resend.com https://vitals.vercel-insights.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests" }
      ]
    },
    {
      "source": "/admin/:path*",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow, noarchive, nosnippet" },
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, private" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, private" },
        { "key": "X-Robots-Tag", "value": "noindex" }
      ]
    },
    {
      "source": "/api/admin/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, private, max-age=0" },
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" },
        { "key": "Pragma", "value": "no-cache" }
      ]
    },
    {
      "source": "/assets/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=604800, immutable" }
      ]
    },
    {
      "source": "/_next/static/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Notas críticas**:
- **CSP `script-src`** incluye `'unsafe-inline'` SOLO porque Next.js 15 con Tailwind 4 inyecta inline scripts. Si se logra mover a nonce-based, eliminar `'unsafe-inline'`.
- **CSP `connect-src`** incluye `*.neon.tech` (HTTP queries vía REST si se usa Neon Data API; si solo se usa pooler postgres directo desde server, podría removerse — verificar en Fase 3).
- **`X-XSS-Protection: 0`** — recomendación moderna (el header legacy puede crear vulnerabilidades; CSP es la defensa real).
- **HSTS preload** requiere registro en https://hstspreload.org/ post-deploy (apex domain).
- **`upgrade-insecure-requests`** fuerza HTTPS en cualquier subrequest HTTP.

---

## 4. Validaciones críticas — Zod schemas

### 4.1 — `POST /api/bookings` (público)

```ts
import { z } from "zod";

// Slots válidos según T35-ADMIN-CONFIG (Lun-Vie 09:00-19:00, intervalos 45min)
const VALID_TIMES = [
  "09:00","09:45","10:30","11:15","12:00","12:45",
  "13:30","14:15","15:00","15:45","16:30","17:15","18:00","18:45"
] as const;

// AR phone: +54 9 XX XXXX-XXXX (movil) o +54 XX XXXX-XXXX (fijo). Acepta variantes.
const AR_PHONE_REGEX = /^(\+?54)?[\s\-]?(9)?[\s\-]?(\d{2,4})[\s\-]?(\d{4})[\s\-]?(\d{4})$/;

// Nombre: solo letras Unicode (incluye acentos, ñ), espacios, guiones, apostrofes, puntos.
const NAME_REGEX = /^[\p{L}\s\-'.]{2,100}$/u;

const today = new Date(); today.setHours(0,0,0,0);
const minDate = new Date(today); minDate.setDate(minDate.getDate() + 1); // hoy+1
const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 60); // hoy+60

export const bookingSchema = z.object({
  patientName: z.string().regex(NAME_REGEX, "Nombre inválido").max(100),
  email: z.string().email("Email inválido").max(254).toLowerCase(),
  phone: z.string().regex(AR_PHONE_REGEX, "Teléfono AR inválido").max(20),
  serviceId: z.string().uuid("Servicio inválido"),
  date: z.coerce.date()
    .refine(d => d >= minDate, "Fecha debe ser hoy+1 o posterior")
    .refine(d => d <= maxDate, "Fecha máxima: hoy+60 días")
    .refine(d => d.getDay() !== 0 && d.getDay() !== 6, "Solo Lun-Vie"),
  time: z.enum(VALID_TIMES, { errorMap: () => ({ message: "Horario inválido" }) }),
  notes: z.string().max(500).optional()
    .transform(s => s?.replace(/<[^>]*>/g, "")), // strip cualquier tag HTML
  consent: z.literal(true, { errorMap: () => ({ message: "Debe aceptar los términos" }) }),
});

export type BookingInput = z.infer<typeof bookingSchema>;
```

**Validaciones server-side adicionales en handler**:
1. Verificar que `serviceId` existe y `is_active = true` en `services`.
2. Verificar disponibilidad: query `appointments` WHERE `date = X AND time = Y AND status IN ('pending','confirmed')` → si existe, 409 Conflict.
3. **Idempotencia**: índice único compuesto `(email, date, time)` previene duplicados aunque cliente haga doble-submit.
4. `duration_min` y `price` se LEEN de `services.id = serviceId` server-side, NO se confían del cliente.
5. Crear `appointment` + `audit_log` entry en una **misma transacción Drizzle** (`db.transaction`).

### 4.2 — `POST /api/appointments/cancel` (token público)

```ts
export const cancelSchema = z.object({
  token: z.string().min(20).max(500), // HMAC token
  reason: z.string().max(200).optional(),
});

// Handler:
// 1. Verificar HMAC: token = base64(HMAC-SHA256(appointmentId|expiresAt, APPOINTMENT_TOKEN_SECRET))
// 2. Comprobar expiresAt > now
// 3. Buscar appointment por id (extraído del payload del token)
// 4. Verificar appointment.status IN ('pending','confirmed') (no cancelable si ya 'completed' o 'cancelled')
// 5. UPDATE appointment SET status='cancelled' + INSERT audit_log (en transacción)
// 6. Trigger email Resend "cancellation"
```

**Generación del token al crear el appointment**:
```ts
import crypto from "node:crypto";

function generateCancelToken(appointmentId: string, expiresInDays = 60) {
  const expiresAt = Date.now() + expiresInDays * 86400_000;
  const payload = `${appointmentId}|${expiresAt}`;
  const sig = crypto
    .createHmac("sha256", process.env.APPOINTMENT_TOKEN_SECRET!)
    .update(payload)
    .digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

function verifyCancelToken(token: string): { appointmentId: string } | null {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  const payload = Buffer.from(payloadB64, "base64url").toString();
  const expected = crypto
    .createHmac("sha256", process.env.APPOINTMENT_TOKEN_SECRET!)
    .update(payload)
    .digest("base64url");
  // timing-safe compare
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [appointmentId, expiresAtStr] = payload.split("|");
  if (Date.now() > Number(expiresAtStr)) return null;
  return { appointmentId };
}
```

### 4.3 — `POST /api/auth/sign-in/email` (admin login)

Better Auth maneja la validación interna, pero **wrapper de rate limit**:
```ts
// Pseudo-código del handler de Better Auth con rate limit middleware
// (implementación real con Upstash Ratelimit en §5)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "rl:auth:signin",
});

const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
const { success, reset } = await ratelimit.limit(ip);
if (!success) {
  return NextResponse.json(
    { error: "Demasiados intentos. Intenta más tarde." },
    { status: 429, headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) } }
  );
}
// ... delegar a auth handler de Better Auth
```

### 4.4 — `GET /api/availability`

```ts
export const availabilitySchema = z.object({
  serviceId: z.string().uuid(),
  date: z.coerce.date()
    .refine(d => d >= new Date(), "Fecha pasada")
    .refine(d => {
      const max = new Date(); max.setDate(max.getDate() + 90);
      return d <= max;
    }, "Máximo 90 días futuros"),
  days: z.coerce.number().int().min(1).max(60).default(7),
});
```

### 4.5 — Endpoints admin

Todos los endpoints `/api/admin/*` empiezan con:
```ts
const user = await requireAdmin(); // throws 403 si no es admin
```

Pagination obligatoria:
```ts
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(25),
});
```

---

## 5. Rate Limiting — Plan de implementación

**Stack recomendado**: Upstash Ratelimit + Upstash Redis (Vercel Marketplace integration). Alternativa: Vercel KV (más caro, mismo pattern).

**Setup (T0-INFRA debería incluir)**:
```bash
npm i @upstash/ratelimit @upstash/redis
```

**Helper centralizado** `lib/rate-limit.ts`:
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const limiters = {
  bookingCreate: new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:booking", analytics: true,
  }),
  authSignIn: new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "rl:auth", analytics: true,
  }),
  availability: new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:avail", analytics: true,
  }),
  contact: new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:contact", analytics: true,
  }),
  cancelToken: new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "rl:cancel", analytics: true,
  }),
  adminWrite: new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "rl:admin", analytics: true,
  }),
};

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  // Validar formato IP básico (IPv4/IPv6) — si inválido, usar "unknown"
  return /^([0-9.]+|[0-9a-f:]+)$/i.test(ip) ? ip : "unknown";
}
```

**Tabla de rate limits**:

| Endpoint | Método | Límite | Ventana | Justificación |
|----------|--------|--------|---------|---------------|
| `/api/bookings` | POST | 3 | 1 hora | Reservas legítimas son raras. Bloquea mass-booking. |
| `/api/auth/sign-in/email` | POST | 5 | 15 min | Brute force protection. |
| `/api/auth/sign-up/*` | POST | 0 | — | Signup público DESHABILITADO (admin-only via seed). |
| `/api/availability` | GET | 30 | 1 min | Consulta común durante wizard de booking. |
| `/api/services` | GET | 60 | 1 min | Lectura de servicios — alta tolerancia. |
| `/api/contact` | POST | 3 | 1 hora | Si existe formulario contacto. |
| `/api/appointments/cancel` | POST | 10 | 1 hora | Por IP. Token HMAC ya filtra acceso. |
| `/api/appointments/reschedule` | POST | 10 | 1 hora | Idem cancel. |
| `/api/admin/*` | * | 60 | 1 min | Operaciones admin legítimas. |

**Por usuario autenticado** (admin): rate limit por `session.userId` además de IP (concatenar key).

**Response 429**:
```ts
return NextResponse.json(
  {
    error: "Rate limit exceeded",
    message: "Has realizado demasiadas solicitudes. Intenta más tarde.",
    retryAfter: Math.ceil((reset - Date.now()) / 1000),
  },
  {
    status: 429,
    headers: {
      "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(reset),
    },
  }
);
```

**Env vars adicionales**:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

## 6. Audit Log — Schema Drizzle

**Tabla**: `audit_log` (inmutable, append-only).

```ts
// db/schema/audit.ts
import { pgTable, uuid, varchar, jsonb, timestamp, text, index } from "drizzle-orm/pg-core";

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Actor (quién ejecutó la acción)
  actorType: varchar("actor_type", { length: 20 }).notNull(),
    // 'patient' | 'admin' | 'staff' | 'system' | 'anonymous'
  actorId: uuid("actor_id"),                           // FK soft a user.id si aplica
  actorEmail: varchar("actor_email", { length: 254 }), // snapshot del email al momento
  actorRole: varchar("actor_role", { length: 20 }),    // 'admin'|'staff' al momento del evento

  // Acción
  action: varchar("action", { length: 80 }).notNull(),
    // ver enum abajo
  entity: varchar("entity", { length: 40 }).notNull(),
    // 'appointment' | 'patient' | 'user' | 'service' | 'config' | 'session'
  entityId: varchar("entity_id", { length: 100 }),     // id del objeto afectado (UUID o 'N/A')

  // Contexto
  ipAddress: varchar("ip_address", { length: 45 }),    // IPv4/IPv6
  userAgent: text("user_agent"),                       // truncado a 500 chars en helper
  requestId: varchar("request_id", { length: 100 }),   // Vercel `x-vercel-id`

  // Metadata adicional (JSON — no PII)
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    // ej: { previousStatus: "pending", newStatus: "cancelled", reason: "patient request" }
    // PROHIBIDO incluir email, phone, password aquí — usar safeLog antes

  // Resultado
  status: varchar("status", { length: 20 }).notNull(), // 'success' | 'failure' | 'denied'
  errorCode: varchar("error_code", { length: 50 }),    // si status='failure'

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxActorEmail: index("idx_audit_actor_email").on(t.actorEmail),
  idxAction: index("idx_audit_action").on(t.action),
  idxEntity: index("idx_audit_entity").on(t.entity, t.entityId),
  idxCreatedAt: index("idx_audit_created_at").on(t.createdAt),
  idxIp: index("idx_audit_ip").on(t.ipAddress),
}));

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
```

**Constraint inmutabilidad** (migración SQL adicional):
```sql
-- Prohibir UPDATE y DELETE en audit_log (solo INSERT)
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit_log FROM CURRENT_USER;
-- Si app user no es PUBLIC, replicar para el role específico
```

**Enum de acciones** (usar TS const para autocompletado):
```ts
export const AuditAction = {
  // Appointments
  APPT_CREATED: "appointment.created",
  APPT_CONFIRMED: "appointment.confirmed",
  APPT_CANCELLED_BY_PATIENT: "appointment.cancelled_by_patient",
  APPT_CANCELLED_BY_ADMIN: "appointment.cancelled_by_admin",
  APPT_RESCHEDULED: "appointment.rescheduled",
  APPT_COMPLETED: "appointment.completed",
  APPT_NO_SHOW: "appointment.no_show",
  APPT_VIEWED_BY_ADMIN: "appointment.viewed_by_admin",

  // Patients
  PATIENT_CREATED: "patient.created",
  PATIENT_UPDATED: "patient.updated",
  PATIENT_VIEWED: "patient.viewed",
  PATIENT_DELETED: "patient.deleted",

  // Auth
  ADMIN_LOGIN_SUCCESS: "auth.admin_login_success",
  ADMIN_LOGIN_FAILED: "auth.admin_login_failed",
  ADMIN_LOGOUT: "auth.admin_logout",
  PASSWORD_CHANGED: "auth.password_changed",
  PASSWORD_RESET_REQUESTED: "auth.password_reset_requested",
  ACCOUNT_LOCKED: "auth.account_locked",

  // Config
  CONFIG_UPDATED: "config.updated",
  SERVICE_CREATED: "service.created",
  SERVICE_UPDATED: "service.updated",
  SERVICE_DEACTIVATED: "service.deactivated",
  BLOCKED_DATE_ADDED: "blocked_date.added",
  BLOCKED_DATE_REMOVED: "blocked_date.removed",

  // Security
  RATE_LIMIT_EXCEEDED: "security.rate_limit_exceeded",
  ACCESS_DENIED: "security.access_denied",
  SUSPICIOUS_ACTIVITY: "security.suspicious_activity",
} as const;
```

**Helper para escribir audit logs**:
```ts
// lib/audit.ts
import { db } from "@/db";
import { auditLog, AuditAction } from "@/db/schema/audit";
import { headers } from "next/headers";

const PII_KEYS = ["email","phone","password","token","secret","ssn","dni","cuit"];

function redactPII<T extends Record<string, unknown>>(obj: T): T {
  const clone = structuredClone(obj);
  for (const key of Object.keys(clone)) {
    if (PII_KEYS.some(k => key.toLowerCase().includes(k))) {
      (clone as any)[key] = "[REDACTED]";
    }
  }
  return clone;
}

export async function logAudit(entry: {
  actorType: "patient" | "admin" | "staff" | "system" | "anonymous";
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  status: "success" | "failure" | "denied";
  errorCode?: string;
}) {
  const h = await headers();
  const ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = h.get("user-agent")?.slice(0, 500);
  const requestId = h.get("x-vercel-id");

  await db.insert(auditLog).values({
    ...entry,
    metadata: entry.metadata ? redactPII(entry.metadata) : undefined,
    ipAddress,
    userAgent,
    requestId,
  });
}
```

**Retención**: 2 años (art. 33 LSC AR sobre conservación de registros comerciales). Cron mensual purga registros >730 días (excepto eventos `security.*` que se conservan 5 años).

---

## 7. Environment Variables

### Tabla completa

| Variable | Obligatoria | Tipo | Descripción | Cómo obtener |
|----------|-------------|------|-------------|--------------|
| `DATABASE_URL` | ✅ | Secret | Connection string Neon **pooled** (puerto 5432, `?sslmode=require&pgbouncer=true`) — usar para queries normales | Neon dashboard → Connection Details → Pooled connection. Vía **Vercel Marketplace integration** (auto-provisioned). |
| `DIRECT_URL` | ✅ | Secret | Connection string Neon **direct** (sin pooler) — solo para Drizzle migrations | Neon dashboard → Connection Details → Direct connection (puerto 5432, sin pgbouncer). |
| `BETTER_AUTH_SECRET` | ✅ | Secret | Secret para firmar sessions/tokens JWT internos. Mínimo 32 bytes random. | Generar local: `openssl rand -base64 32`. Rotar cada 6 meses. |
| `BETTER_AUTH_URL` | ✅ | Public-ish | URL absoluta de la app (sin slash final). En Vercel: usar `https://${VERCEL_PROJECT_PRODUCTION_URL}` o domain custom. | Hardcodear `https://therapy.com.ar` en prod. En preview, usar `process.env.VERCEL_URL`. |
| `APPOINTMENT_TOKEN_SECRET` | ✅ | Secret | HMAC secret para tokens de cancelación/reschedule. Independiente de `BETTER_AUTH_SECRET` para rotación separada. | `openssl rand -base64 32`. |
| `RESEND_API_KEY` | ✅ | Secret | API key Resend para envío transaccional. | Resend dashboard → API Keys → Create. Permission: `Sending Access` (no Full Access). |
| `RESEND_FROM_EMAIL` | ✅ | Public | Dirección verified de FROM. Ej: `Therapy <turnos@therapy.com.ar>`. Domain verified en Resend con DKIM/SPF. | Resend dashboard → Domains → Add → DNS records en registrador. |
| `ADMIN_EMAIL` | ✅ | Public | Email del admin del consultorio. Recibe notificaciones (nuevo turno, login fallido, lock account). | Definido por usuario (placeholder en T10-SEED-ADMIN). |
| `UPSTASH_REDIS_REST_URL` | ✅ | Public | URL REST de Upstash Redis (rate limiting). | Vercel Marketplace → Upstash → Create Database → auto-provisioned. |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Secret | Token REST. | Auto-provisioned junto con URL. |
| `NODE_ENV` | ✅ | Public | `production` en Vercel prod, `development` local, `test` en CI. | Vercel lo setea automáticamente; NO override manual. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public | URL canonical (para sitemap, JSON-LD, og:url). | Hardcodear `https://therapy.com.ar`. |
| `NEXT_PUBLIC_GA_ID` | ⚪ | Public | Google Analytics 4 measurement ID (opcional). | GA4 → Admin → Data Streams. |
| `LOG_LEVEL` | ⚪ | Public | `debug`/`info`/`warn`/`error` (default: `info` en prod, `debug` en dev). | Manual. |
| `RECAPTCHA_SECRET` | ⚪ | Secret | Si se agrega Cloudflare Turnstile post-MVP para anti-bot en booking form. | Cloudflare Turnstile dashboard. |

**Reglas de oro**:
1. **Ningún secret con prefix `NEXT_PUBLIC_`**. CI gate verifica.
2. **Vercel Marketplace > copy-paste manual**: Neon y Upstash deben provisionarse vía integration para rotación automática.
3. **`.env.local` en `.gitignore`** (Next.js default — verificar).
4. **`.env.example` commiteado** con valores fake o vacíos para documentación.
5. **Pre-deploy script** valida que todos los REQUIRED estén presentes:
   ```ts
   // scripts/check-env.ts
   const required = [
     "DATABASE_URL","DIRECT_URL","BETTER_AUTH_SECRET","BETTER_AUTH_URL",
     "APPOINTMENT_TOKEN_SECRET","RESEND_API_KEY","RESEND_FROM_EMAIL",
     "ADMIN_EMAIL","UPSTASH_REDIS_REST_URL","UPSTASH_REDIS_REST_TOKEN",
     "NEXT_PUBLIC_SITE_URL"
   ];
   const missing = required.filter(k => !process.env[k]);
   if (missing.length) {
     console.error("Missing env vars:", missing.join(", "));
     process.exit(1);
   }
   ```

### `.env.example`

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.gru1.aws.neon.tech/therapy?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.gru1.aws.neon.tech/therapy?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# Tokens (HMAC)
APPOINTMENT_TOKEN_SECRET="generate-with-openssl-rand-base64-32-different-from-above"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="Therapy <turnos@therapy.com.ar>"
ADMIN_EMAIL="admin@therapy.com.ar"

# Rate limiting (Upstash)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Public
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Optional
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
# LOG_LEVEL="info"
```

---

## 8. Checklist pre-deploy (Fase 4 / Fase 5)

Items que `reality-checker` y `deployer` deben verificar:

### Headers & Config
- [ ] `vercel.json` existe en raíz con bloque `headers` completo (§3).
- [ ] CSP probada con `securityheaders.com` → grade A o A+.
- [ ] HSTS preload registrado en https://hstspreload.org/ (post-deploy).
- [ ] DNS records DKIM/SPF/DMARC configurados (Resend dashboard).
- [ ] `robots.txt` con `Disallow: /admin/`, `Disallow: /api/`.

### Auth
- [ ] `proxy.ts` protege `/admin/*` y `/api/admin/*` server-side.
- [ ] Better Auth signup público DESHABILITADO (`signUp.enabled: false`).
- [ ] Admin seed (T10) ejecutado; password ≥ 12 chars.
- [ ] Rate limit en `/api/auth/sign-in/email` activo (test manual: 6 attempts → 429).
- [ ] Cookie `better-auth.session_token` con `HttpOnly`, `Secure`, `SameSite=Lax`.

### Booking flow
- [ ] Validación Zod en `POST /api/bookings`.
- [ ] Índice único `(email, date, time)` en `appointments` (T7-SCHEMA-APPTS).
- [ ] Token HMAC en email de cancelación (no UUID adivinable).
- [ ] Rate limit `/api/bookings` 3/h/IP probado.
- [ ] Idempotencia: doble-submit del form crea 1 sola appointment.

### Audit log
- [ ] Tabla `audit_log` migrada con índices.
- [ ] Constraint REVOKE UPDATE/DELETE aplicado.
- [ ] Helper `logAudit()` redacta PII.
- [ ] Eventos críticos disparan log: appointment.created, admin_login_success/failed, password_changed.

### Env vars
- [ ] `check-env.ts` pasa local y en Vercel.
- [ ] Ningún secret con prefix `NEXT_PUBLIC_`.
- [ ] Vercel Marketplace integrations: Neon + Upstash.

### Supply chain & build
- [ ] `npm audit --production` sin HIGH/CRITICAL.
- [ ] `npx lockfile-lint --allowed-hosts npm --allowed-schemes https: --type npm --path package-lock.json` pasa.
- [ ] Source maps NO accesibles: `curl https://therapy.com.ar/_next/static/chunks/main-*.js.map` → 404.
- [ ] `next.config.ts`: `productionBrowserSourceMaps: false`.

### QA visual / E2E (delegar a evidence-collector)
- [ ] Mixed Content: 0 warnings en DevTools en prod.
- [ ] Test E2E: signup admin BLOQUEADO (404/403 al intentar acceder a `/api/auth/sign-up`).
- [ ] Test E2E: paciente A no puede cancelar turno de paciente B (token inválido → 401).
- [ ] Test E2E: rate limit booking → 4ª request misma IP → 429.

---

## 9. Roadmap post-MVP (no obligatorio en Fase 5)

- 2FA admin (Better Auth `twoFactor` plugin).
- WAF (Vercel Firewall rules) para bloquear países sin tráfico legítimo.
- SIEM externo (Vercel Log Drain → Datadog/Better Stack).
- Penetration test externo (post-launch + 3 meses).
- GDPR-compliance opcional (export/delete account) si se expande a Europa.
- Monitoreo de DKIM/SPF/DMARC (https://dmarcian.com/).

---

## 10. Referencias técnicas

- **Better Auth docs**: https://better-auth.com/docs
- **Next.js 15 security headers**: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- **OWASP Top 10 (2021)**: https://owasp.org/Top10/
- **Upstash Ratelimit**: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
- **Drizzle security**: https://orm.drizzle.team/docs/sql (sql tag con placeholders)
- **`agent-protocol.md`** § 5: tab-nabbing, lockfile-lint, source maps
- **`better-auth-reference.md`** § "Better Auth + Supabase + Vercel" (aplicable a Neon con minor adaptations: postgres.js + transaction pooler 5432 + `prepare: false`)

---

**STATUS**: Spec completo. Listo para que backend-architect (Fase 3) implemente T8-AUTH-SERVER, T11-T17 API routes con guards, T43-SECURITY (audit log + rate limit + headers).
