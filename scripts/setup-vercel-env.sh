#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# setup-vercel-env.sh
# Configura las variables de entorno del proyecto en Vercel.
# Requiere: vercel CLI instalada y autenticada (vercel login)
# Uso: bash scripts/setup-vercel-env.sh
# ─────────────────────────────────────────────────────────────────

set -euo pipefail

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Therapy — Configuración de env vars en Vercel        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Este script agrega las variables de entorno al proyecto Vercel."
echo "Cada variable se cargará en los 3 entornos: production, preview, development."
echo ""

# ── Helper ────────────────────────────────────────────────────────
add_env() {
  local key="$1"
  local value="$2"
  local env="${3:-production,preview,development}"
  echo "  → $key"
  echo "$value" | vercel env add "$key" "$env" --force 2>/dev/null || \
    vercel env add "$key" "$env" <<< "$value"
}

# ── Requerir valores del usuario ──────────────────────────────────

prompt_secret() {
  local var="$1"
  local description="$2"
  local default_gen="$3"
  echo ""
  echo "▸ $var — $description"
  if [[ -n "$default_gen" ]]; then
    local generated
    generated=$(eval "$default_gen")
    echo "  (generado automáticamente: $generated)"
    echo "$generated"
  else
    read -r -s -p "  Valor (oculto): " value
    echo ""
    echo "$value"
  fi
}

# ── Database ──────────────────────────────────────────────────────
echo ""
echo "═══ Base de datos ════════════════════════════════════════════"
echo "Supabase Transaction Pooler: postgresql://postgres.XXX:[pw]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
read -r -p "DATABASE_URL: " DB_URL
vercel env add DATABASE_URL production,preview,development <<< "$DB_URL"
echo "  ✓ DATABASE_URL"

# ── Better Auth ───────────────────────────────────────────────────
echo ""
echo "═══ Autenticación ════════════════════════════════════════════"
AUTH_SECRET=$(openssl rand -base64 32)
echo "  Generando BETTER_AUTH_SECRET: $AUTH_SECRET"
vercel env add BETTER_AUTH_SECRET production,preview,development <<< "$AUTH_SECRET"
echo "  ✓ BETTER_AUTH_SECRET"

read -r -p "BETTER_AUTH_URL (ej: https://therapy.vercel.app): " AUTH_URL
vercel env add BETTER_AUTH_URL production <<< "$AUTH_URL"
vercel env add BETTER_AUTH_URL preview <<< "$AUTH_URL"
vercel env add BETTER_AUTH_URL development <<< "http://localhost:3000"
echo "  ✓ BETTER_AUTH_URL"

read -r -p "NEXT_PUBLIC_APP_URL (mismo que BETTER_AUTH_URL, ej: https://therapy.vercel.app): " APP_URL
vercel env add NEXT_PUBLIC_APP_URL production <<< "$APP_URL"
vercel env add NEXT_PUBLIC_APP_URL preview <<< "$APP_URL"
vercel env add NEXT_PUBLIC_APP_URL development <<< "http://localhost:3000"
echo "  ✓ NEXT_PUBLIC_APP_URL"

# ── Resend ────────────────────────────────────────────────────────
echo ""
echo "═══ Email (Resend) ═══════════════════════════════════════════"
echo "  Obtener en: https://resend.com/api-keys"
read -r -s -p "RESEND_API_KEY (re_...): " RESEND_KEY
echo ""
vercel env add RESEND_API_KEY production,preview,development <<< "$RESEND_KEY"
echo "  ✓ RESEND_API_KEY"

read -r -p "EMAIL_FROM (ej: Turnos <turnos@tudominio.com>): " EMAIL_FROM
vercel env add EMAIL_FROM production,preview,development <<< "$EMAIL_FROM"
echo "  ✓ EMAIL_FROM"

read -r -p "ADMIN_EMAIL (ej: admin@tudominio.com): " ADMIN_EMAIL
vercel env add ADMIN_EMAIL production,preview,development <<< "$ADMIN_EMAIL"
echo "  ✓ ADMIN_EMAIL"

# ── Cron ─────────────────────────────────────────────────────────
echo ""
echo "═══ Cron Jobs ════════════════════════════════════════════════"
CRON_SECRET=$(openssl rand -hex 32)
echo "  Generando CRON_SECRET: $CRON_SECRET"
vercel env add CRON_SECRET production,preview,development <<< "$CRON_SECRET"
echo "  ✓ CRON_SECRET"

# ── Upstash Redis (opcional) ──────────────────────────────────────
echo ""
echo "═══ Rate Limiting — Upstash Redis (OPCIONAL) ═════════════════"
read -r -p "¿Configurar Upstash Redis? [s/N]: " CONFIGURE_REDIS
if [[ "$CONFIGURE_REDIS" =~ ^[Ss]$ ]]; then
  read -r -p "UPSTASH_REDIS_REST_URL: " REDIS_URL
  vercel env add UPSTASH_REDIS_REST_URL production,preview,development <<< "$REDIS_URL"
  read -r -s -p "UPSTASH_REDIS_REST_TOKEN: " REDIS_TOKEN
  echo ""
  vercel env add UPSTASH_REDIS_REST_TOKEN production,preview,development <<< "$REDIS_TOKEN"
  echo "  ✓ Upstash Redis configurado"
else
  echo "  ⚠  Omitido — se usará rate limiting en memoria (OK para single-instance)"
fi

# ── Resumen ───────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅  Variables de entorno configuradas en Vercel."
echo ""
echo "Próximos pasos:"
echo "  1. vercel --prod          → despliegue a producción"
echo "  2. vercel                 → despliegue preview"
echo "  3. Ejecutar migraciones en producción:"
echo "     DATABASE_URL=\$PROD_URL npm run db:migrate"
echo "  4. Crear usuario admin:"
echo "     DATABASE_URL=\$PROD_URL npm run seed:admin"
echo ""
