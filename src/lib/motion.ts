import type { Variants } from 'framer-motion'

const EASE_PRIMARY = [0.16, 1, 0.3, 1] as const
const EASE_SPRING = [0.34, 1.38, 0.64, 1] as const

// fadeIn — para contenido que aparece sin movimiento
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: EASE_PRIMARY } },
}

// slideUp — para headlines y secciones hero
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_PRIMARY } },
}

// slideIn — para cards que entran desde el lado
export const slideIn: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_PRIMARY } },
}

// stagger — para containers con hijos animados
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

// cardHoverLift — para cards en hover
export const cardHoverLift = {
  rest: { y: 0, boxShadow: '0 2px 8px rgba(28,25,23,0.06)' },
  hover: {
    y: -4,
    boxShadow: '0 10px 30px rgba(28,25,23,0.12)',
    transition: { duration: 0.35, ease: EASE_PRIMARY },
  },
}

// revealText — para texto que revela de abajo hacia arriba (con overflow: hidden en el padre)
export const revealText: Variants = {
  hidden: { y: '100%' },
  visible: { y: '0%', transition: { duration: 0.9, ease: EASE_PRIMARY } },
}

// navBlur — para header sticky
export const navBlur = {
  transparent: { backgroundColor: 'rgba(250,248,245,0)', backdropFilter: 'blur(0px)' },
  scrolled: {
    backgroundColor: 'rgba(250,248,245,0.85)',
    backdropFilter: 'blur(12px)',
    transition: { duration: 0.35 },
  },
}

// slotPulse — para slots de turno disponibles
export const slotPulse: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.4, ease: EASE_SPRING },
  },
}
