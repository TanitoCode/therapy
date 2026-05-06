# Troubleshooting — Therapy

Problemas comunes y sus soluciones.

---

## Emails no llegan

### El paciente no recibe el email de confirmación

1. Verificar que `RESEND_API_KEY` está configurada correctamente en Vercel (Settings → Environment Variables).
2. Verificar que el dominio del email del remitente esté verificado en el dashboard de Resend.
3. Revisar los logs de Resend para ver si el email fue enviado: `https://resend.com/emails`.
4. Pedir al paciente que revise carpeta de spam.

### Los recordatorios diarios no se envían

El cron `/api/cron/reminders` corre a las 9:00 UTC-3 (mediodía Argentina). Verificar:
1. Que `CRON_SECRET` esté configurado en Vercel.
2. En Vercel → proyecto → Cron Jobs: que el cron esté listado y sin errores.
3. En Vercel → Logs → filtrar por `/api/cron/reminders`.

Si el cron fue disparado pero no envió emails, puede ser que no haya turnos para el día siguiente.

---

## Login falla

### "Credenciales incorrectas" con credenciales correctas

1. Verificar que `BETTER_AUTH_SECRET` es el mismo valor en todos los environments (no cambiar en producción sin invalidar sesiones existentes).
2. Verificar que el usuario existe en la base de datos:
   ```sql
   SELECT * FROM "user" WHERE email = 'tu@email.com';
   ```
3. Si el usuario no existe, crear uno nuevo:
   ```bash
   npm run seed:admin
   ```

### La sesión se cierra inmediatamente después de login

Esto puede ocurrir si `BETTER_AUTH_URL` no coincide con la URL real del deployment. El valor debe ser la URL exacta (con `https://` y sin trailing slash).

### Loop de redirección entre `/admin/login` y `/admin/dashboard`

Causa: cookies de sesión corruptas o `DATABASE_URL` configurado incorrectamente.

Solución:
1. Borrar cookies del navegador para el dominio.
2. Verificar `DATABASE_URL` en Vercel (debe usar Transaction Pooler de Neon, puerto 6543).
3. Verificar que las tablas de Better Auth existan:
   ```bash
   npm run migrate
   ```

---

## Conexión a la base de datos

### Error "connection refused" o "connection timeout"

1. Verificar que `DATABASE_URL` usa el **Transaction Pooler** de Neon (puerto 6543), no el direct connection (puerto 5432).
2. En el dashboard de Neon, verificar que el proyecto esté activo (no suspendido por inactividad).
3. Verificar que la IP de Vercel no esté bloqueada en las reglas de Neon (por defecto permite todas).

### Error "prepared statement does not exist"

Ocurre cuando se usa un connection pooler incompatible con prepared statements. Asegurarse de que `DATABASE_URL` apunta al Transaction Pooler de Neon y que la configuración de Drizzle incluye `prepare: false`:

```ts
// src/db/index.ts
const client = postgres(process.env.DATABASE_URL!, { prepare: false })
```

### Las migraciones fallan

```bash
# Ver estado actual de las migraciones
npm run db:studio

# Re-aplicar migraciones desde cero (¡BORRA todos los datos!)
# Solo en desarrollo
npx drizzle-kit push
```

En producción, nunca usar `drizzle-kit push` — siempre `npm run db:migrate`.

---

## Errores de build

### Error de TypeScript en el build de Vercel

Ejecutar localmente para ver el error exacto:
```bash
npm run build
```

Los errores de tipo se muestran en la consola. Resolverlos antes de hacer push.

### "Module not found" en Vercel pero funciona local

1. Verificar que el módulo está en `dependencies` (no `devDependencies`) en `package.json`.
2. Verificar que no hay imports con rutas relativas incorrectas (usar siempre `@/` para imports internos).

---

## Vercel

### El deployment no está tomando los env vars nuevos

Los env vars en Vercel requieren un nuevo deployment para aplicarse. Después de agregar o modificar una variable, hacer un nuevo deploy:
```bash
vercel deploy --scope tanitos-projects
```

### El cron no aparece en Vercel

Verificar que `vercel.json` tiene la sección `crons` y que el deployment fue exitoso. Los crons solo funcionan en el plan Pro de Vercel.

### "Function timeout" en logs de Vercel

Las funciones en Vercel tienen un timeout de 300 segundos por defecto. Si una operación de base de datos tarda más, hay un problema de performance — revisar los índices de las tablas más consultadas.

---

## Rate limiting

### Usuarios reciben error 429 ("Demasiadas solicitudes")

El endpoint de disponibilidad tiene un límite de 30 requests por minuto por IP. Si un usuario legítimo lo está recibiendo:

1. Si Upstash Redis está caído, el sistema usa un fallback en memoria (menos preciso pero funcional).
2. Si el problema persiste, el límite puede ajustarse en `src/app/api/availability/route.ts`:
   ```ts
   const { success: allowed } = await checkRateLimit(`availability:${ip}`, 30, 60_000)
   // Cambiar 30 por un número mayor
   ```

---

## Datos y backups

### Restaurar datos de un backup de Neon

Neon guarda backups automáticos. Desde el dashboard de Neon:
1. Ir al proyecto → Branches → main
2. Seleccionar "Restore" → elegir punto en el tiempo
3. Neon crea un branch nuevo con el estado restaurado — verificar antes de mergear a main

### Exportar datos de pacientes

```bash
# Conectarse a la DB y exportar
npx drizzle-kit studio
```

Desde Drizzle Studio se pueden exportar tablas a CSV.
