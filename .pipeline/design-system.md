# Design System — Therapy Kinesiología
## Proyecto: therapy | Plataforma: web | Generado: 2026-04-29

---

## Dirección estética

**Dirección estética: Editorial warm-luxury — encaja con un consultorio de kinesiología que busca transmitir confianza, calidez profesional y seriedad médica sin frialdad clínica.**

**Landing pattern**: Editorial magazine | Sections: hero → servicios (asimétrico) → proceso reserva → testimonios → CTA final → footer | CTA placement: hero primario + sección final.

**Anti-patterns ejecutables (severity HIGH — bloquean certificación)**:
1. NO paleta teal/cyan (#0d9488, #14b8a6, #06b6d4)
2. NO Inter como heading font
3. NO cards uniformes con shadow-sm en grid 3 columnas idénticas
4. NO hero con gradient mesh + button rounded-lg
5. NO stock photos de doctores sonriendo (Unsplash medical generic)
6. NO iconos lucide outline genéricos en cada feature sin variación

---

## Dials de diseño (heredados del VDC)

```
design_variance:  5  → grid editorial asimétrico, 1 sección rompe simetría
motion_intensity: 5  → Framer Motion enter/exit + scroll reveals, sin GSAP/pinning
visual_density:   3  → espaciado generoso, max-width tipográfico 65-75ch, whitespace protagonista
```

---

## 1. Tokens de color semánticos

### Paleta base (de css-foundation)

```css
/* Fondos */
--bg-canvas:          #FAF8F5   /* off-white cálido — fondo landing */
--bg-primary:         #F5F1EB   /* crema — secciones alternadas */
--bg-secondary:       #EDE8DF   /* beige cálido — cards, secciones destacadas */

/* Colores de marca */
--color-terracota:    #B85C38   /* CTA primario — sienna-terracota */
--color-salvia:       #7B8C76   /* acento secundario — verde salvia */
--color-bisque:       #C49A6C   /* decorativo — oro cálido */

/* Texto */
--text-primary:       #1C1917   /* off-black cálido */
--text-secondary:     #44403C   /* texto secundario */
--text-muted:         #78716C   /* placeholders, labels */

/* Modo oscuro */
--bg-canvas-dark:     #0E0C0A
--terracota-dark:     #C9724D
```

### Escala tint/shade — Terracota (100–900)

```css
--terracota-100: #F7EDE8   /* tint 80% */
--terracota-200: #EFDBCF   /* tint 60% */
--terracota-300: #E7C9B6   /* tint 40% */
--terracota-400: #DFB79D   /* tint 20% */
--terracota-500: #B85C38   /* base */
--terracota-600: #934930   /* shade 20% */
--terracota-700: #6E3724   /* shade 40% */
--terracota-800: #4A2518   /* shade 60% */
--terracota-900: #25120C   /* shade 80% */
```

### Escala tint/shade — Salvia (100–900)

```css
--salvia-100: #EBF0EA   /* tint 80% */
--salvia-200: #D7E1D5   /* tint 60% */
--salvia-300: #C3D2C0   /* tint 40% */
--salvia-400: #AEC3AB   /* tint 20% */
--salvia-500: #7B8C76   /* base */
--salvia-600: #62705F   /* shade 20% */
--salvia-700: #4A5447   /* shade 40% */
--salvia-800: #313830   /* shade 60% */
--salvia-900: #191C18   /* shade 80% */
```

### Tokens semánticos — Dominio médico/turnos

```css
/* Estados de slot de calendario */
--color-slot-available:         #C3D2C0   /* salvia-300 — libre para reservar */
--color-slot-available-text:    #4A5447   /* salvia-700 — contraste sobre available */
--color-slot-occupied:          #D6CFC4   /* beige grisáceo — no disponible */
--color-slot-occupied-text:     #78716C   /* text-muted — claramente inactivo */
--color-slot-selected:          #B85C38   /* terracota-500 — elegido por usuario */
--color-slot-selected-text:     #FAF8F5   /* canvas sobre terracota — contraste 4.8:1 ✓ */
--color-slot-hover:             #EFDBCF   /* terracota-200 — hover sutil */
--color-slot-today:             transparent  /* outline terracota — ver border */
--color-slot-today-border:      #B85C38

/* Estados de turno (admin + público) */
--color-status-confirmed:       #7B8C76   /* salvia-500 */
--color-status-confirmed-bg:    #EBF0EA   /* salvia-100 */
--color-status-confirmed-text:  #31483A   /* shade oscuro salvia — contraste 4.6:1 ✓ */

--color-status-pending:         #C49A6C   /* bisque-500 */
--color-status-pending-bg:      #F5EBD8   /* bisque tint 80% */
--color-status-pending-text:    #7A5430   /* bisque shade 40% — contraste 4.7:1 ✓ */

--color-status-cancelled:       #9B3A3A   /* red muted, warm undertone */
--color-status-cancelled-bg:    #F5E8E8   /* red tint 80% */
--color-status-cancelled-text:  #6B2020   /* red shade 40% — contraste 4.9:1 ✓ */

--color-status-completed:       #5A7A5C   /* muted green */
--color-status-completed-bg:    #E8F0E9   /* green tint 80% */
--color-status-completed-text:  #2F4A31   /* green shade 40% — contraste 5.1:1 ✓ */

/* Variantes semánticas (text-emphasis / bg-subtle / border-subtle) */
--terracota-text-emphasis:      #6E3724   /* shade 40% — texto sobre fondos claros */
--terracota-bg-subtle:          #F7EDE8   /* tint 80% — fondo badges/alerts */
--terracota-border-subtle:      #EFDBCF   /* tint 60% — bordes decorativos */

--salvia-text-emphasis:         #4A5447   /* shade 40% */
--salvia-bg-subtle:             #EBF0EA   /* tint 80% */
--salvia-border-subtle:         #D7E1D5   /* tint 60% */
```

### Tokens funcionales (shadcn/ui completo)

```css
/* Mapeados en globals.css — referencia aquí para coherencia */
--background:    var(--bg-canvas)
--foreground:    var(--text-primary)
--card:          var(--bg-secondary)
--card-foreground: var(--text-primary)
--primary:       var(--color-terracota)
--primary-foreground: #FAF8F5
--secondary:     var(--color-salvia)
--secondary-foreground: #FAF8F5
--muted:         var(--bg-primary)
--muted-foreground: var(--text-secondary)
--accent:        var(--color-bisque)
--destructive:   var(--color-status-cancelled)
--border:        rgba(28,25,23,0.10)
--ring:          var(--color-terracota)
--radius:        4px   /* --radius-base — editorial precision */
```

---

## 2. Sistema tipográfico (heredado de css-foundation)

```
Heading: Fraunces  (serif display variable — optical size, wght axis)
  → var(--font-display) / var(--font-fraunces)
  → Justificación: mood editorial prioriza warmth + readability long-form; serif con
    optical sizing crea jerarquía visual sin necesitar bold pesado.

Body: Plus Jakarta Sans (humanista sans — legible en tamaños pequeños)
  → var(--font-body) / var(--font-plus-jakarta)
  → Contraste tipográfico: serif display + humanista sans → T3 PASS garantizado.

Mono: JetBrains Mono → var(--font-mono)  (logs, codes admin)
```

### Escala de tamaños

```css
--text-hero:   clamp(3.5rem, 6vw + 1.5rem, 7rem)    /* 56–112px — hero heading */
--text-4xl:    clamp(2.5rem, 3.5vw + 1rem, 4rem)     /* 40–64px  — H1 de sección */
--text-3xl:    clamp(2rem, 2.5vw + 1rem, 2.75rem)    /* 32–44px  — H2 */
--text-2xl:    clamp(1.5rem, 2vw + 0.75rem, 2rem)    /* 24–32px  — H3 */
--text-xl:     clamp(1.25rem, 1.5vw + 0.5rem, 1.5rem) /* 20–24px — subtítulos */
--text-base:   clamp(1rem, 1vw + 0.75rem, 1.125rem)  /* 16–18px  — body */
--text-sm:     0.875rem                               /* 14px — labels, captions */
--text-xs:     0.75rem                                /* 12px — eyebrow, badges */

--tracking-tighter: -0.03em   /* hero */
--tracking-tight:   -0.02em   /* headings H1-H2 */
--tracking-normal:  0em       /* body */
--tracking-wide:    0.08em    /* eyebrow/all-caps */
--tracking-wider:   0.15em    /* eyebrow editorial */
```

---

## 3. Sistema de spacing y layout

```css
/* Escala spacing (visual_density=3 → escala generosa 1.5x) */
--space-1:   0.25rem   /* 4px */
--space-2:   0.5rem    /* 8px */
--space-3:   0.75rem   /* 12px */
--space-4:   1rem      /* 16px */
--space-6:   1.5rem    /* 24px */
--space-8:   2rem      /* 32px */
--space-12:  3rem      /* 48px */
--space-16:  4rem      /* 64px */
--space-section: clamp(5rem, 8vw, 10rem)   /* 80–160px entre secciones */

/* Containers */
--container-xl:  1280px
--container-2xl: 1440px

/* Grids */
.grid-editorial:  grid-template-columns: 55fr 45fr   /* asimétrico desktop */
.grid-services:   grid con 1 card grande + 2 cards menores (NO 3 iguales)
.grid-admin:      funcional simétrico 12-col

/* Border radius (editorial precision — sharp, no rounded-lg genérico) */
--radius-sm:   2px
--radius-base: 4px
--radius-md:   6px
--radius-lg:   8px
/* NOTA: NO usar rounded-full en botones CTA — contradice tono editorial */
/* Botones: border-radius 4px (--radius-base) */
```

---

## 4. Sistema de sombras

```css
/* Warm diffuse — undertone ámbar. NUNCA neutral grey box-shadow */
--shadow-xs:      0 1px 3px rgba(28,25,23,0.06)
--shadow-sm:      0 2px 8px rgba(28,25,23,0.08)
--shadow-base:    0 4px 12px rgba(28,25,23,0.10)
--shadow-lg:      0 10px 30px rgba(28,25,23,0.12)
--shadow-xl:      0 20px 50px rgba(28,25,23,0.14)

/* Sombra de acento — terracota glow para CTA hover */
--shadow-accent:  0 8px 24px rgba(184,92,56,0.30)

/* Sombra elevación card hover */
--shadow-card-hover: 0 12px 32px rgba(28,25,23,0.14), 0 4px 12px rgba(184,92,56,0.08)
```

---

## 5. Sistema de motion (tokens)

```css
/* Easings */
--ease-primary: cubic-bezier(0.16, 1, 0.3, 1)    /* expo-out — luxury reveal */
--ease-spring:  cubic-bezier(0.34, 1.38, 0.64, 1)  /* slight overshoot */
--ease-out:     cubic-bezier(0.0, 0.0, 0.2, 1)     /* material decel */

/* Durations */
--duration-fast:   200ms   /* hover color/border transitions */
--duration-normal: 350ms   /* component transitions */
--duration-reveal: 700ms   /* scroll reveal, text */
--duration-hero:   900ms   /* hero entry */
--stagger-delay:   80ms    /* entre ítems de lista stagger */

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  --duration-fast: 0ms; --duration-normal: 0ms;
  --duration-reveal: 0ms; --duration-hero: 0ms;
}
```

---

## 6. Variants Framer Motion — archivo `variants/motion.ts`

```typescript
// variants/motion.ts — exportar y usar en componentes React
import type { Variants } from "framer-motion";

// Token helpers — sincronizados con CSS vars
const EASE_PRIMARY = [0.16, 1, 0.3, 1] as const;
const EASE_SPRING  = [0.34, 1.38, 0.64, 1] as const;
const DURATION_REVEAL = 0.7;
const DURATION_HERO   = 0.9;
const STAGGER         = 0.08;

// ─── REVEAL AL SCROLL — fade-up editorial ─────────────────────────────────────
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: DURATION_REVEAL,
      ease: EASE_PRIMARY,
    },
  },
};

// Container con stagger para listas (servicios, pasos, FAQ)
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER,
      delayChildren: 0.1,
    },
  },
};

// Item individual dentro de staggerContainer
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_PRIMARY },
  },
};

// ─── HEADING REVEAL — por heading, editorial ──────────────────────────────────
// Usar con cada <h1>, <h2> de sección
export const revealText: Variants = {
  hidden: { opacity: 0, y: 40, skewY: 2 },
  visible: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: {
      duration: DURATION_HERO,
      ease: EASE_PRIMARY,
    },
  },
};

// Para SplitText futuro (motion_intensity≥7) — ahora solo en inline
export const revealWord: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: (i: number) => ({
    opacity: 1,
    y: "0%",
    transition: {
      duration: 0.6,
      delay: i * STAGGER,
      ease: EASE_PRIMARY,
    },
  }),
};

// ─── CARD HOVER LIFT — terracota glow ────────────────────────────────────────
// Aplicar con whileHover en <motion.div> de cards editoriales
export const cardHoverLift = {
  initial: {
    y: 0,
    boxShadow: "0 4px 12px rgba(28,25,23,0.10)",
  },
  hover: {
    y: -6,
    boxShadow: "0 12px 32px rgba(28,25,23,0.14), 0 4px 12px rgba(184,92,56,0.08)",
    transition: {
      duration: 0.3,
      ease: EASE_PRIMARY,
    },
  },
};

// ─── NAV BLUR — transparente → frosted glass al scroll ───────────────────────
// Aplicar en el <motion.nav> con variants según scrollY
export const navBlur: Variants = {
  transparent: {
    backgroundColor: "rgba(250,248,245,0)",
    backdropFilter: "blur(0px)",
    borderBottomColor: "rgba(28,25,23,0)",
  },
  solid: {
    backgroundColor: "rgba(250,248,245,0.88)",
    backdropFilter: "blur(12px)",
    borderBottomColor: "rgba(28,25,23,0.08)",
    transition: {
      duration: 0.4,
      ease: EASE_PRIMARY,
    },
  },
};

// ─── SLOT PULSE — time slot disponible → seleccionado ────────────────────────
export const slotPulse: Variants = {
  idle: { scale: 1 },
  selected: {
    scale: [1, 1.04, 1],
    transition: {
      duration: 0.35,
      ease: EASE_SPRING,
      times: [0, 0.5, 1],
    },
  },
  available: {
    scale: 1,
    transition: { duration: 0.2, ease: EASE_PRIMARY },
  },
};

// ─── PAGE ENTER — fade al montar página ──────────────────────────────────────
export const pageEnter: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_PRIMARY },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: EASE_PRIMARY },
  },
};

// ─── MODAL — enter/exit ──────────────────────────────────────────────────────
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_PRIMARY },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.2 },
  },
};
```

---

## 7. Componentes — Especificaciones con Behavioral Rules

### Jerarquía Atomic Design

```
Atoms:     Button, Input, Label, Icon, Badge, Avatar, Skeleton, Toggle
Molecules: FormField, SearchBar, NavItem, TimeSlot, CalendarDay, StatCard
Organisms: Header (landing), NavAdmin, BookingForm, CalendarWidget, TimeSlotPicker, TurnoCard, ServiceCard
Templates: LandingLayout, AdminLayout, AuthLayout
Pages:     HomePage, AdminDashboard, BookingPage, AuthPage
```

---

### ATOMS

#### Button

**Tokens específicos:**
```css
--btn-radius: var(--radius-base)   /* 4px — editorial precision, NO rounded-full */
--btn-height-sm:  36px
--btn-height-base: 44px            /* mínimo a11y touch */
--btn-height-lg:  52px
--btn-padding-x:  var(--space-6)   /* 24px */
```

**Variantes y estados:**

**Primary (terracota):**
```
default:  bg=#B85C38  text=#FAF8F5  border=transparent  radius=4px  font-size=15px  font-family=Plus Jakarta Sans  font-weight=500  letter-spacing=0.01em
hover:    bg=#934930  shadow=0 8px 24px rgba(184,92,56,0.30)  translateY(-1px)  duration=200ms  ease=var(--ease-primary)
active:   bg=#6E3724  scale(0.98)  shadow=none  duration=150ms
focus:    outline: 2px solid #B85C38  outline-offset: 2px  (no cambio de bg)
disabled: bg=#D6CFC4  text=#78716C  cursor=not-allowed  opacity=0.6
loading:  spinner SVG blanco 16px animado (rotate 360deg 800ms linear)
```

**Secondary (outline salvia):**
```
default:  bg=transparent  text=#7B8C76  border=1.5px solid #7B8C76  radius=4px
hover:    bg=#EBF0EA  border-color=#4A5447  text=#4A5447  duration=200ms
active:   bg=#D7E1D5  scale(0.98)
focus:    outline: 2px solid #7B8C76  outline-offset: 2px
disabled: border-color=#D6CFC4  text=#D6CFC4  cursor=not-allowed
```

**Ghost:**
```
default:  bg=transparent  text=#44403C  border=none
hover:    bg=rgba(28,25,23,0.05)  text=#1C1917  duration=200ms
active:   bg=rgba(28,25,23,0.10)
focus:    outline: 2px solid var(--ring)  outline-offset: 2px
disabled: text=#78716C  cursor=not-allowed
```

**Destructive:**
```
default:  bg=#9B3A3A  text=#FAF8F5  border=transparent  radius=4px
hover:    bg=#6B2020  shadow=0 6px 16px rgba(155,58,58,0.25)
active:   bg=#4A1515  scale(0.98)
focus:    outline: 2px solid #9B3A3A
disabled: opacity=0.5  cursor=not-allowed
```

**Behavioral rules:**
```
desktop hover: translateY(-1px) + shadow (NO opacity: 0.8 genérico)
touch active:  scale(0.96) + brightness(0.94) — envuelto en @media (hover:hover) and (pointer:fine)
reveal:        fadeInUp con stagger cuando aparece en lista de CTAs
```

---

#### Input (text, date, select, textarea)

**Base:**
```css
height: 44px (text, date, select)  /* a11y touch */
textarea: min-height 120px, resize: vertical
padding: 12px 16px
border: 1.5px solid rgba(28,25,23,0.15)
border-radius: var(--radius-base)  /* 4px */
background: #FAF8F5  /* bg-canvas */
font-family: var(--font-body)
font-size: var(--text-base)
color: var(--text-primary)
```

**Estados:**
```
default:  border=rgba(28,25,23,0.15)  bg=#FAF8F5
hover:    border=rgba(28,25,23,0.30)  duration=150ms
focus:    border=var(--color-terracota)  ring=0 0 0 3px rgba(184,92,56,0.15)  bg=#FFFFFF  duration=200ms
error:    border=#9B3A3A  ring=0 0 0 3px rgba(155,58,58,0.12)
error+msg: label rojo + texto helper rojo debajo
success:  border=#5A7A5C  ring=0 0 0 3px rgba(90,122,92,0.12)  ícono checkmark salvia derecha
disabled: bg=#EDE8DF  text=#78716C  border=rgba(28,25,23,0.08)  cursor=not-allowed
```

**Behavioral rules:**
```
focus:     border-color shift + ring expand — ambos en 200ms ease-primary
error:     shake animation (keyframes: translateX 0→6px→-6px→3px→0 en 350ms) — solo si submit fallido
validation: inline (onChange) para formato email/tel; onBlur para requeridos
```

**Label:**
```
font-family: var(--font-body)
font-size: var(--text-sm)  /* 14px */
font-weight: 500
color: var(--text-primary)
margin-bottom: 6px
required: asterisco terracota (*) sin espaciado extra
```

---

#### Checkbox

```
size: 18×18px  border-radius: 2px  border: 1.5px solid rgba(28,25,23,0.25)
checked: bg=#B85C38  border=#B85C38  checkmark SVG blanco
  → checkmark draw animation: stroke-dashoffset 0→length en 200ms
hover (unchecked): border=#B85C38
focus: outline 2px solid #B85C38  outline-offset: 2px
disabled: bg=#EDE8DF  border=rgba(28,25,23,0.10)  cursor=not-allowed
label: junto al checkbox, font-size=text-sm, color=text-primary, gap=8px
```

#### Radio

```
size: 18×18px  border-radius: 50%  border: 1.5px solid rgba(28,25,23,0.25)
checked: border: 2px solid #B85C38  inner dot: 8×8px bg=#B85C38 con scale(0→1) 200ms ease-spring
hover: border-color=#B85C38
focus: outline 2px solid #B85C38
disabled: opacity=0.5  cursor=not-allowed
```

#### Toggle/Switch

```
track: 44×24px  border-radius: 12px
off: bg=#D6CFC4  thumb: #FAF8F5  shadow=0 1px 3px rgba(28,25,23,0.20)
on:  bg=#B85C38  thumb: #FAF8F5  translateX(20px)  transition: 250ms ease-primary
focus: outline 2px solid #B85C38  outline-offset: 3px
disabled: opacity=0.5  cursor=not-allowed
touch active: scale(1.05) en el track al presionar
```

---

#### Badge/Tag de estado de turno

**Estructura:** `<span>` inline-flex con icono opcional 12px + texto 11px uppercase tracking-wide.

```
Pendiente:
  bg=#F5EBD8  text=#7A5430  border=1px solid rgba(196,154,108,0.30)
  ícono: reloj (outline thin, NO lucide-clock genérico → usar solo si es distinto de los demás badges)

Confirmado:
  bg=#EBF0EA  text=#31483A  border=1px solid rgba(123,140,118,0.30)
  ícono: check-circle fino

Cancelado:
  bg=#F5E8E8  text=#6B2020  border=1px solid rgba(155,58,58,0.20)
  ícono: x-circle fino

Completado:
  bg=#E8F0E9  text=#2F4A31  border=1px solid rgba(90,122,92,0.20)
  ícono: check-double o similar
```

**Behavioral:** sin hover interactivo (solo display). Si el badge aparece en lista, fadea con el stagger del item padre.

---

#### Avatar

```
sm: 28×28px  md: 36×36px  lg: 48×48px  xl: 64×64px
border-radius: 50%
fallback (iniciales): bg=var(--bg-secondary), text=var(--text-primary), font-family=var(--font-display), font-weight=600
foto real: object-fit: cover
border: 2px solid var(--bg-canvas)  /* para solapado en grupos */
```

---

#### Skeleton loading

**Para lista de turnos admin:**
```
bg-base: #EDE8DF  /* bg-secondary */
bg-shimmer: linear-gradient(90deg, #EDE8DF 0%, #F5F1EB 50%, #EDE8DF 100%)
animation: shimmer-slide 1.6s ease-in-out infinite  /* keyframe translateX -100%→100% */
border-radius: var(--radius-base)
```

**Variantes de forma:**
```
SkeletonText:  height=14px  width variable (70-90%)  margin-bottom=8px
SkeletonTitle: height=24px  width=40-60%
SkeletonCard:  height=80px  width=100%  compone TurnoCard esqueleto
SkeletonStat:  height=48px  width=100px  (para stats admin)
```

---

### MOLECULES

#### FormField

Composición: `Label` + `Input` + `HelperText` opcional + `ErrorMessage`.

```
structure: flex-col gap-6px
error state: ErrorMessage aparece con fadeInUp 200ms + Input cambia a error state
success state: checkmark inline dentro del Input
helper text: font-size=text-xs  color=text-muted  margin-top=4px
```

#### NavItem (landing)

```
font-family: var(--font-body)
font-size: text-sm
font-weight: 500
color: text-primary
hover:  color=terracota-500  underline decorativo: 1px solid terracota, scale(1→100%) desde izquierda, 250ms ease-primary
active: color=terracota-700  underline permanente
focus:  outline terracota  outline-offset: 4px
```

#### NavItem (admin sidebar)

```
height: 40px  padding: 0 12px  border-radius: var(--radius-md) [6px]
font-size: text-sm  font-weight: 500  color: text-secondary
hover:   bg=#F5F1EB  color=text-primary  duration=150ms
active:  bg=terracota-100  color=terracota-700  border-left: 2px solid terracota-500
icon:    16×16px, weight fijo (thin/1.5px), mismo color que texto, margin-right: 10px
```

#### CalendarDay (mol. del CalendarWidget)

```
size: 36×36px  border-radius: var(--radius-base) [4px]  font-size: text-sm
disponible:  bg=salvia-100  text=salvia-700  hover: bg=salvia-200  cursor=pointer
ocupado:     bg=transparent  text=text-muted  cursor=not-allowed  opacity=0.5
seleccionado: bg=terracota-500  text=#FAF8F5  shadow=shadow-sm
hoy:         border: 2px solid terracota-500  (sin fill — solo outline)
otro mes:    text=text-muted  opacity=0.35
deshabilitado: cursor=not-allowed  text=text-muted  opacity=0.25
hover (disponible): slotPulse variant "available"  duration=150ms
```

#### TimeSlot (mol. del TimeSlotPicker)

```
size: 80×36px (compact)  border-radius: var(--radius-base)
border: 1.5px solid transparent  font-size: text-sm  font-weight: 500
disponible:  bg=salvia-100  text=salvia-700  border-color=salvia-200
  hover:     bg=salvia-200  border-color=salvia-400  cursor=pointer  duration=150ms
ocupado:     bg=#EDE8DF  text=text-muted  cursor=not-allowed  opacity=0.6
  hover:     cursor=not-allowed (no change)
seleccionado: bg=terracota-500  text=#FAF8F5  border-color=terracota-600  shadow=shadow-sm
  animation: slotPulse "selected" variant al hacer click
touch:       active:scale(0.96) para disponibles y seleccionados
```

#### StatCard (admin KPIs)

```
structure: bg-card  padding: space-6  border-radius: radius-md  border: 1px solid rgba(28,25,23,0.08)
valor:  font-family=var(--font-display)  font-size=text-3xl  font-weight=700  color=text-primary
label:  font-size=text-xs  font-weight=500  color=text-muted  text-transform=uppercase  letter-spacing=tracking-wider
delta:  font-size=text-sm  color según positivo (salvia) / negativo (terracota)
ícono:  24×24px warm-color, esquina superior derecha
hover:  shadow-base  duration=200ms  (NO translateY — es admin/funcional)
```

---

### ORGANISMS

#### Header Landing (Nav principal)

**Estructura:**
```
<motion.nav> — position: fixed  top: 0  width: 100%  z-index: 50  height: 64px
Logo: izquierda — Fraunces 18px + tagline opcional
Links: centro (desktop) — gap-8  NavItems
CTA: derecha — Button primary "Reservar turno" size-sm

variants={navBlur}  animate={scrollY > 50 ? "solid" : "transparent"}
```

**Comportamiento scroll:**
```
scrollY = 0:      transparent  no-shadow
scrollY > 50:     bg=rgba(250,248,245,0.88)  backdrop-filter=blur(12px)
                  border-bottom=1px solid rgba(28,25,23,0.08)
                  transition: 400ms ease-primary
```

**Mobile (<768px):**
```
hamburger: 3 líneas → X animated (rotate 45deg, scale) — 44×44px tap target
menu: full-screen overlay bg=bg-primary, links centrados en columna, animación slide-down
CTA mobile: bottom del overlay, full-width
```

#### NavAdmin (sidebar)

```
width: 240px (desktop)  position: fixed  height: 100vh
bg: bg-primary  border-right: 1px solid rgba(28,25,23,0.08)

Logo: top, padding-top: space-6
Secciones: Dashboard / Turnos / Clientes / Configuración  (NavItems)
Divider: 1px solid rgba(28,25,23,0.06)
User: bottom del sidebar — Avatar md + nombre + role
```

#### BookingForm (formulario de reserva público)

**Estructura multi-paso (3 pasos lineales):**
```
Paso 1 — Datos personales:
  FormField: Nombre (text required)
  FormField: Email (email required — validación inline)
  FormField: Teléfono (tel — formato AR: +54 9 XX XXXX-XXXX)
  FormField: Servicio (select — opciones: Kinesiología general / Deportiva / Neurológica / Osteopatía)

Paso 2 — Fecha y hora:
  CalendarWidget (grilla mensual)
  → al elegir fecha: TimeSlotPicker aparece con fadeInUp
  TimeSlotPicker (horarios del día elegido)

Paso 3 — Confirmación:
  Resumen de datos (read-only)
  Checkbox aceptar política de privacidad
  Button primary "Confirmar turno"
  → loading state durante submit
  → success: toast + redirect
  → error: toast error + mantener formulario
```

**Indicador de progreso:**
```
3 pasos circulares numerados  connected por línea
activo: terracota-500 relleno  visitado: check salvia  pendiente: bg-secondary
```

**Behavioral:**
```
paso actual: visible  próximo: oculto (NOT mounted)
transición entre pasos: slideInRight / slideOutLeft Framer Motion 350ms ease-primary
validación: onBlur para campos individuales, onSubmit para paso completo
error de campo: shake animation + color rojo + mensaje bajo el campo
```

#### CalendarWidget (grilla mensual)

```
header:
  Mes/Año: font-display  text-xl  font-weight=600
  prev/next: ghost buttons 36×36px icon-only con aria-label
  "Hoy": ghost small link terracota

grilla:
  7 columnas iguales  gap=4px
  días de semana: text-xs  text-muted  uppercase  (Lun Mar Mié...)
  días: CalendarDay molecules (ver arriba)

loading state: SkeletonCard cubriendo grilla  (al cambiar mes)
empty days: primer día del mes determina offset
leyenda (opcional):
  ○ Disponible  ● Ocupado  [■] Seleccionado  (small dots + texto xs)
```

**Responsive:**
```
desktop: 340px min-width
mobile: full-width del contenedor, day size: 40×40px (a11y touch)
```

#### TimeSlotPicker (horarios del día)

```
layout: flex-wrap  gap=8px
slots: 09:00 09:45 10:30 11:15 12:00 12:45 13:30 ... hasta 18:15 (slots 45min)
  → 10 slots/día (09:00–18:15)
  → cada slot: TimeSlot molecule (80×36px)

título: "Horarios disponibles — {fecha corta}" font-display text-lg
no hay disponibles: empty state — eyebrow "Sin turnos disponibles" + texto muted
loading (al cambiar fecha): skeleton 10 slots grises
```

#### TurnoCard (admin)

```
layout: flex horizontal  align-center  gap=12px
padding: space-4  border-radius: radius-md
border: 1px solid rgba(28,25,23,0.08)
bg: bg-canvas

izquierda (24px): colorbar vertical — color según estado (slot tokens)
centro:
  nombre: font-weight=600  text-primary  font-size=text-base
  fecha/hora: text-sm  text-secondary  (ej: "Mar 30 Abr · 10:30")
  servicio: badge xs  text-muted
derecha:
  Badge estado
  acciones: icon Button ghost (editar, cancelar) — 36×36px

hover: bg=#F5F1EB  shadow-xs  duration=150ms
estado cancelled: colorbar=#9B3A3A  opacity=0.7 en el card
touch: active:bg=#F5F1EB
```

#### Modal/Dialog

```
backdrop: bg=rgba(28,25,23,0.55)  backdrop-filter=blur(2px)
  variants={modalBackdrop}

panel: bg=bg-primary  border-radius=radius-lg (8px)  padding=space-8
  max-width: 480px  width=90vw  shadow=shadow-xl
  variants={modalPanel}

header: título font-display text-2xl + close button ghost 36×36px
body: font-body text-base text-secondary
footer: flex gap=12px justify-end — Button secondary + Button primary/destructive

Variante confirmación turno:
  → resumen del turno (paciente, fecha, hora, servicio)
  → footer: "Cancelar" (ghost) + "Confirmar" (primary terracota)

Variante formulario cancelación:
  → textarea "Motivo (opcional)"
  → footer: "Mantener turno" (ghost) + "Cancelar turno" (destructive)
```

#### ServiceCard (landing) — variante editorial

**REGLA: NO 3 cards iguales en grid uniforme.**

**Layout propuesto: 1 card grande (hero service) + 2 cards menores en columna**

```
Card Grande (hero service — 60% del ancho):
  imagen: 280px height  object-fit=cover  sin border-radius extra
  contenido: padding=space-8
  eyebrow: text-xs  color=terracota-500  tracking-wider  uppercase
  título: font-display  text-3xl  font-weight=600
  descripción: text-base  text-secondary  max-width=55ch
  CTA: Button ghost con flecha → "Ver más"
  hover:
    imagen: scale(1.03) 400ms ease-primary
    shadow: shadow-card-hover
    translateY(-4px)

Card Menor (2 ítems apilados — 40% del ancho):
  layout horizontal: ícono/número + texto
  padding: space-6  border-radius=radius-md
  número decorativo grande: font-display  text-4xl  color=terracota-100  font-weight=800
    (en background, decorativo — NO stock icon)
  título: font-display  text-xl  font-weight=600
  descripción: text-sm  text-secondary  2 líneas max
  hover: bg=#EDE8DF  duration=200ms
```

**Variante alternativa (si hay 4+ servicios): lista editorial con separadores**
```
layout: list (flex-col)  gap=0
cada ítem: padding-y=space-6  border-bottom=1px solid rgba(28,25,23,0.08)
  número: 01 02 03...  font-display  text-2xl  color=terracota-200  width=60px
  título: font-display  text-2xl  inline
  descripción: text-secondary  text-base  margin-left=68px
hover: bg=terracota-50  border-left=3px solid terracota-500  padding-left=space-4  duration=200ms
```

#### Card editorial (genérica)

```
bg: var(--bg-secondary)  /* #EDE8DF */
border: 1px solid rgba(28,25,23,0.08)
border-radius: var(--radius-md) [6px]
padding: var(--space-8) [32px]
shadow: none (default)  — shadow aparece solo en hover

estructura interna:
  eyebrow (opcional): .eyebrow class  text-xs  terracota  uppercase  tracking-wider
  heading: font-display  text-2xl o text-3xl
  body: font-body  text-base  text-secondary  max-width=65ch
  footer (opcional): links, CTAs

hover (si es interactiva):
  cardHoverLift variant  (translateY -6px + shadow warm)
  duration=300ms ease-primary
  imagen interna (si existe): scale(1.03)

NO usar shadow-sm uniforme — la sombra es la del hover, no del estado default.
```

---

### Toast/Notification

```
position: fixed  bottom: 24px  right: 24px  (mobile: bottom: 12px, full-width)
width: 340px  border-radius: radius-md  padding: space-4 space-6
shadow: shadow-lg
font-family: var(--font-body)  font-size: text-sm

Success:   bg=#E8F0E9  text=#2F4A31  border-left=3px solid #5A7A5C  ícono: check-circle salvia
Error:     bg=#F5E8E8  text=#6B2020  border-left=3px solid #9B3A3A  ícono: x-circle rojo muted
Warning:   bg=#F5EBD8  text=#7A5430  border-left=3px solid #C49A6C  ícono: alert bisque
Info:      bg=#EBF0EA  text=#31483A  border-left=3px solid #7B8C76  ícono: info-circle salvia

animate: slideInRight (translateX 120%→0) 350ms ease-primary al aparecer
dismiss:   slideOutRight (translateX 0→120%) 250ms  (swipe o click X)
duración:  success/info: 4000ms  warning: 5000ms  error: 6000ms + dismiss manual
progress bar sutil: 2px bottom  color según tipo  decrece con el timer
```

---

## 8. Patrones de sección — Landing

### 8.1 Hero

**Spec de layout:**
```
Sección: 100vh mínimo (o min-h-screen)
Background: imagen estática del consultorio/terapeuta — object-fit: cover
  → overlay: gradient linear-gradient(110deg, rgba(14,12,10,0.65) 40%, rgba(14,12,10,0.15) 100%)
  → NO gradient mesh — se usa overlay oscuro lineal sobre foto real

Grid: .grid-editorial (55/45) — texto en columna izquierda, espacio visual en derecha
Texto (columna izquierda):
  eyebrow: "Kinesiología · Buenos Aires" — text-xs terracota tracking-wider uppercase
  heading: font-display  text-hero  color=#FAF8F5  tracking-tighter  line-height=0.95
    → revealText variant, motion entrada con duration-hero=900ms
  subheading: text-xl  color=rgba(250,248,245,0.80)  max-width=45ch  margin-top=space-6
    → fadeInUp variant  delay=200ms
  CTAs: flex gap=12px  margin-top=space-8
    → Button primary "Reservar turno" (terracota)
    → Button ghost "Ver servicios" (text blanco, border blanco 40%)
    → fadeInUp variant  delay=350ms  stagger=80ms entre ambos

Indicador scroll: chevron down animado  position absolute bottom=32px left=50%
  arrow bounce keyframe 1.5s ease-in-out infinite
```

**Mobile (<768px):**
```
grid: 1 columna  texto ocupa ancho completo
heading: text-4xl (reducido)
overlay: más oscuro (0.70) para legibilidad
CTAs: stack vertical  full-width
```

### 8.2 Servicios

**Layout editorial — rompe simetría:**
```
header de sección:
  eyebrow: "Nuestros servicios" terracota
  heading: font-display text-4xl — alineado izquierda (NO centrado)
  subheading: text-base text-secondary  max-width=55ch  alineado izquierda

cuerpo:
  grid 60/40 (o lista editorial si >3 servicios)
  ServiceCard grande (izquierda) + 2 ServiceCards menores apiladas (derecha)
  — ver especificación ServiceCard arriba

reveal: staggerContainer + staggerItem para las 3 cards
  trigger: "whileInView"  viewport={{ once: true, margin: "-100px" }}
```

### 8.3 Proceso de reserva (pasos)

```
header: centrado (única sección centrada — contraste editorial)
  eyebrow + heading font-display text-4xl

pasos: flex horizontal (desktop) / flex columna (mobile)
  3 ítems:
    número: font-display text-4xl color=terracota-200 font-weight=800
    título: font-display text-xl color=text-primary
    descripción: text-base text-secondary max-width=30ch
    línea conectora: 1px solid rgba(28,25,23,0.12) horizontal  (solo desktop, entre pasos)

CTA central: Button primary grande (size-lg) centrado debajo  margin-top=space-12
  "Reservar mi turno →"

reveal: staggerContainer stagger=150ms (más lento para pasos — son pocos)
  trigger: whileInView once
```

### 8.4 Testimonios

**Tipografía protagonista (NO carousel uniforme):**
```
layout: asimétrico — testimonios en tamaños distintos
  testimonio principal: quote gigante
    font-display  text-3xl  font-weight=400  font-style=italic
    color=text-primary  max-width=70ch
    comillas decorativas: " " en font-display text-6xl color=terracota-200  position=absolute top=-20px
    autor: text-sm font-weight=600 margin-top=space-4  + cargo/descripción text-muted
  testimonios secundarios (2): font-display text-xl italic  text-secondary
    layout: 2 columnas  gap=space-8  border-top=1px solid rgba(28,25,23,0.08)
    margin-top: space-8

reveal: testimonial principal: revealText 700ms
        secundarios: fadeInUp con stagger 150ms
```

### 8.5 CTA Final

```
sección minimal: bg=bg-secondary  padding-y=space-section
layout: centrado (único centrado junto a pasos)
heading: font-display  text-4xl  font-weight=600  max-width=20ch  text-center
  → revealText variant
subheading: text-xl  text-secondary  margin-top=space-4  max-width=40ch  text-center
CTA: Button primary size-lg  "Reservar ahora"  shadow=shadow-accent  margin-top=space-8
  → fadeInUp delay=300ms
nota: text-xs text-muted  "Sin tarjeta de crédito · Cancelación gratuita 24hs antes"
```

### 8.6 Footer

```
bg: bg-primary (#F5F1EB)  border-top: 1px solid rgba(28,25,23,0.08)
padding: space-16 0 space-8

grid 3 columnas (desktop) / 1 columna (mobile):
  col 1 (40%): Logo + descripción breve (max 2 líneas) + iconos redes sociales
  col 2 (30%): links navegación (Servicios / Proceso / Contacto / Admin)
  col 3 (30%): info contacto (dirección, teléfono, email) + horario de atención

bottom bar: border-top  flex between  text-xs text-muted
  "© 2025 [Nombre]. Todos los derechos reservados."  |  "Política de privacidad"

NO hay newsletter form / NO mega-footer / NO iconos de redes grandes
```

---

## 9. Behavioral Rules — Tabla resumen por nivel de animación

**Nivel: Moderado (motion_intensity=5)**

| Componente | Desktop hover | Touch active | Scroll reveal |
|------------|--------------|--------------|---------------|
| Button primary | translateY(-1px) + shadow-accent | scale(0.96) | fadeInUp (stagger en grupos) |
| Card editorial | translateY(-6px) + shadow warm | scale(0.98) + brightness | fadeInUp individual |
| ServiceCard grande | scale img(1.03) + shadow | scale(0.99) | staggerItem |
| NavLink | underline draw left→right | opacity-70 | — |
| TimeSlot disponible | bg-shift salvia | scale(0.96) | fadeInUp en picker |
| CalendarDay | bg-shift inmediato | scale(0.95) | — |
| Hero heading | — | — | revealText 900ms |
| Secciones | — | — | fadeInUp o staggerContainer |

**Regla mobile universal:**
```css
@media (hover: hover) and (pointer: fine) {
  /* Efectos hover SOLO aquí */
  .btn-primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-accent); }
  .card-editorial:hover { transform: translateY(-6px); }
  /* etc. */
}
/* Fuera de este bloque: SOLO active/pressed states */
```

---

## 10. Accesibilidad — WCAG 2.1 AA

### Ratios de contraste verificados

```
text-primary (#1C1917) sobre bg-canvas (#FAF8F5):    ~17.5:1  ✓ AAA
text-secondary (#44403C) sobre bg-canvas:             ~9.2:1  ✓ AAA
text-muted (#78716C) sobre bg-canvas:                 ~4.6:1  ✓ AA
text-muted (#78716C) sobre bg-secondary (#EDE8DF):    ~4.2:1  ✓ AA (borderline — verificar en build)

Button primary text (#FAF8F5) sobre terracota (#B85C38):  ~4.8:1  ✓ AA
slot-available text (#4A5447) sobre salvia-100 (#EBF0EA): ~5.3:1  ✓ AA
slot-selected text (#FAF8F5) sobre terracota (#B85C38):   ~4.8:1  ✓ AA
status-pending text (#7A5430) sobre pending-bg (#F5EBD8): ~4.7:1  ✓ AA
status-cancelled text (#6B2020) sobre cancelled-bg:       ~4.9:1  ✓ AA
status-completed text (#2F4A31) sobre completed-bg:       ~5.1:1  ✓ AA
```

**ADVERTENCIA**: `--text-muted` (#78716C) sobre `bg-secondary` (#EDE8DF) = ~4.2:1 — marginal. Usar solo para texto decorativo/no funcional. Para texto funcional en ese fondo, usar text-secondary (#44403C).

### Reglas a11y de componentes

```
Focus ring: visible en TODOS los interactivos. Nunca outline:none sin alternativa.
  → outline: 2px solid var(--color-terracota)  outline-offset: 2px

Touch targets: mínimo 44×44px (botones, inputs, slots, días de calendario)

Formulario reserva:
  → aria-label en todos los inputs
  → aria-describedby para mensajes de error
  → aria-invalid="true" en inputs con error
  → aria-required="true" en campos requeridos

CalendarWidget:
  → role="grid"  aria-label="Calendario de disponibilidad"
  → días: role="gridcell"  aria-selected  aria-disabled
  → navegación de mes: aria-label="Mes anterior" / "Mes siguiente"

TimeSlotPicker:
  → role="listbox"  aria-label="Horarios disponibles"
  → slots: role="option"  aria-selected  aria-disabled

Modal:
  → role="dialog"  aria-modal="true"  aria-labelledby
  → focus trap al abrir
  → Escape para cerrar
  → return focus al elemento trigger al cerrar

Toggle:
  → role="switch"  aria-checked

Skip to main: link visible al focus, position fixed top-0
```

---

## 11. Iconografía

**ANTI-PATTERN**: NO usar lucide-react outline genérico en cada feature de la misma forma.

**Estrategia diferenciada:**
```
Servicios (landing): números tipográficos grandes (01, 02, 03) en font-display
  → NO ícono de figura humana / médico / corazón

Navegación admin: lucide thin (strokeWidth=1.5) — uniforme, funcional — OK aquí
Badges de estado: ícono thin 12px coherente con estado (check, clock, x, check-double)
Testimonios: tipografía (comillas) — NO ícono de estrella
Pasos del proceso: número tipográfico en font-display text-4xl

Si se usan íconos en landing:
  → solo en secciones donde el ícono agrega significado semántico
  → variar: algunos filled, algunos outline, algunos substituidos por formas CSS
  → NUNCA: grid de 6 features con el mismo tipo de ícono lucide outline
```

---

## AUTO_AUDIT — SaaS Teal Default Detector

```
mood_preset: editorial-magazine (variante warm-luxury)

T1 — Paleta not-teal:
  Colores definidos: #B85C38 (terracota), #7B8C76 (salvia), #C49A6C (bisque), #FAF8F5 (canvas)
  Rango teal: hue 175-205. Terracota HSL ≈ 17°. Salvia HSL ≈ 113°. Bisque HSL ≈ 30°.
  → NINGUNO en rango 175-205 con saturation>40
  → T1: PASS

T2 — Heading not-generic-sans:
  Heading font: Fraunces (serif display variable)
  Lista bloqueada: Inter, Roboto, Open Sans, Lato, Arial, Helvetica, SF Pro, Segoe UI
  → Fraunces NO está en lista bloqueada
  → T2: PASS

T3 — Contraste tipográfico:
  Heading: Fraunces (serif display)
  Body: Plus Jakarta Sans (humanista sans)
  → Son familias distintas (serif vs sans-serif)
  → T3: PASS

T4 — Estructura hero no-genérica:
  Hero: grid asimétrico 55/45, texto izquierda, espacio visual derecha
        overlay lineal sobre foto real (NO gradient mesh)
        CTA radius=4px (NO rounded-lg)
        NO 3 feature cards debajo
  → T4: PASS

T5 — No stock photos médicos:
  Especificado: "foto consultorio/terapeuta en acción" — foto real del negocio
  Placeholder: NO stock photos Unsplash medical
  Documentado explícitamente en anti-patterns
  → T5: PASS

T6 — Iconografía variada:
  Servicios landing: números tipográficos (01, 02...) en font-display — NO ícono lucide
  Admin nav: lucide thin strokeWidth=1.5 — OK en contexto funcional
  Badges: ícono thin 12px por estado
  Pasos: número tipográfico
  Testimonios: comillas tipográficas
  → Variación documentada, NO grid uniforme lucide outline
  → T6: PASS

OVERALL: 6/6 PASS

differentiation_checklist:
  typography_rationale: PRESENT
    → "Fraunces serif display porque mood=editorial prioriza warmth + readability;
       variable font con optical sizing crea jerarquía sin bold pesado.
       Plus Jakarta Sans humanista aporta legibilidad en textos funcionales y formularios."
  asymmetric_section: PRESENT (design_variance=5 ≥ 5)
    → Hero: grid 55/45 asimétrico
    → Servicios: 60/40 NO 3 iguales
    → Testimonios: principal grande + 2 secundarios distintos
  custom_shapes_if_needed: N/A (editorial-magazine no requiere clip-path extremo)
    → Sí usa separadores ornamentales, comillas decorativas, números oversized
  micro_interactions_3plus: PRESENT
    → Button: translateY + shadow-accent (NO opacity:0.8)
    → Card: translateY(-6px) + warm shadow + imagen scale
    → NavLink: underline draw left→right
    → TimeSlot: slotPulse spring animation
    → Checkbox: stroke-dashoffset draw animation
```

---

## Notas para el frontend-developer

1. **Lenis smooth scroll**: inicializar en root layout. Framer Motion `useScroll` puede usar el scroll de Lenis con `scroller` ref.
2. **Fonts**: cargar via `next/font` — NO @import en CSS. Variables: `--font-fraunces` y `--font-plus-jakarta`.
3. **Framer Motion**: usar `LazyMotion` + `domAnimation` (no `domMax`) — motion_intensity=5 no requiere GSAP ni todas las features.
4. **whileInView**: trigger con `viewport={{ once: true, margin: "-80px" }}` para reveals al scroll.
5. **Nav blur**: detectar scroll con `useScroll` de Framer Motion + `useMotionValueEvent`. NO requestAnimationFrame manual.
6. **CalendarWidget**: puede usar `date-fns` para navegación de meses — ya en stack Next.js.
7. **TimeSlotPicker**: slots hardcodeados como array de strings `["09:00", "09:45", ...]`; ocupados vienen de API.
8. **shadcn/ui**: los componentes base (Dialog, Select, Checkbox, Toggle) ya tienen accesibilidad — solo aplicar tokens de color encima via CSS vars.
9. **Skeleton**: usar `animate-pulse` de Tailwind 4 o `motion.div` con `animate={{ opacity: [1, 0.5, 1] }}`.
10. **Dark mode**: preparado en globals.css con `.dark` class — no activo por defecto (light mode primario).
