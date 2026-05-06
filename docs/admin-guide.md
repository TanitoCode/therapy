# Manual de Administración — Therapy

Guía de uso del panel de administración para el profesional del consultorio.

---

## Acceso

Ingresar en `/admin/login` con el email y contraseña configurados durante el setup.

Si es el primer acceso, crear el usuario administrador con:
```bash
npm run seed:admin
```

El script solicita email y contraseña por consola. El email debe coincidir con `ADMIN_EMAIL` en el archivo `.env.local`.

---

## Dashboard

La pantalla principal muestra:

- **Turnos hoy** — cantidad de turnos programados para el día actual
- **Turnos esta semana** — total de la semana en curso
- **Pacientes activos** — pacientes con al menos un turno en los últimos 90 días
- **Próximos turnos** — lista de los siguientes turnos con estado (confirmado / pendiente)

Los datos se actualizan cada vez que se navega al dashboard.

---

## Gestión de turnos

### Ver turnos

Ir a **Turnos** en el menú lateral. La vista muestra todos los turnos ordenados por fecha.

Filtros disponibles:
- Por estado: pendiente / confirmado / cancelado
- Por rango de fecha
- Por paciente (búsqueda por nombre o DNI)

### Confirmar o cancelar un turno

Hacer clic en el turno → botón **Confirmar** o **Cancelar**.

Al cancelar, el sistema envía automáticamente un email de notificación al paciente (si tiene email registrado).

### Turnos creados por el paciente

Los pacientes reservan turnos desde `/turnos`. El turno queda en estado **pendiente** hasta que:
1. El paciente hace clic en el link de confirmación del email, o
2. El administrador confirma manualmente desde el panel

---

## Gestión de pacientes

### Ver ficha de un paciente

Ir a **Pacientes** → buscar por nombre, apellido o DNI → hacer clic en el paciente.

La ficha muestra:
- Datos personales (nombre, DNI, fecha de nacimiento, teléfono, email)
- Historial completo de turnos (con diagnóstico y notas por sesión)
- Fecha del primer y último turno

### Editar datos de un paciente

Desde la ficha del paciente → botón **Editar** → modificar los campos → **Guardar**.

### Agregar nota a un turno

En el historial de turnos → expandir el turno → campo **Notas clínicas** → escribir → **Guardar nota**.

Las notas no son visibles para el paciente.

---

## Servicios

### Ver servicios activos

Ir a **Servicios** en el menú lateral. Lista todos los servicios activos con nombre, duración y color de identificación.

### Agregar un nuevo servicio

Botón **Nuevo servicio** → completar:
- Nombre (requerido)
- Duración en minutos (requerido)
- Descripción (opcional)
- Color de identificación (selector visual)

Hacer clic en **Guardar**.

### Editar un servicio

Hacer clic en el servicio → editar campos → **Guardar**.

> Los cambios en duración afectan únicamente los turnos nuevos. Los turnos ya reservados mantienen la duración original.

### Desactivar un servicio

Hacer clic en el servicio → **Desactivar**.

El servicio deja de aparecer en el flujo de reserva público. Los turnos existentes no se ven afectados.

---

## Bloqueos de agenda

Los bloqueos impiden que los pacientes reserven turnos en horarios no disponibles (feriados, vacaciones, reuniones).

### Crear un bloqueo

Ir a **Bloqueos** → **Nuevo bloqueo** → completar:
- Fecha de inicio y fin
- Hora de inicio y fin (o marcar **Día completo**)
- Motivo (solo visible para el administrador)
- **Recurrente** — si es semanal (ej: almuerzo todos los miércoles)

### Eliminar un bloqueo

Hacer clic en el bloqueo → **Eliminar**.

---

## Configuración

Ir a **Configuración** en el menú lateral.

### Horario de atención

Definir los días y rangos horarios en que se pueden reservar turnos. Los horarios se guardan por día de la semana.

Ejemplo: Lunes–Viernes 8:00–20:00, Sábados 9:00–13:00.

### Duración del intervalo

Intervalo mínimo entre turnos en minutos. Determina los slots disponibles en el calendario.

Los cambios en configuración se aplican en tiempo real a las reservas nuevas.

---

## Logout

Menú superior derecho → **Cerrar sesión**.

La sesión expira automáticamente después de 30 días de inactividad.
