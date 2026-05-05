'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { MobileMenu } from './mobile-menu'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Sobre Nosotros', href: '/#nosotros' },
  { label: 'Contacto', href: '/#contacto' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.header
      role="banner"
      animate={scrolled ? 'scrolled' : 'transparent'}
      variants={{
        transparent: {
          backgroundColor: 'rgba(250,248,245,0)',
          backdropFilter: 'blur(0px)',
          borderBottomColor: 'rgba(212,206,197,0)',
        },
        scrolled: {
          backgroundColor: 'rgba(250,248,245,0.88)',
          backdropFilter: 'blur(14px)',
          borderBottomColor: 'rgba(212,206,197,0.6)',
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className="fixed top-0 right-0 left-0 z-50 border-b"
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link
          href="/"
          aria-label="Therapy — Página de inicio"
          className="group flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-terracota)]"
        >
          {/* Wordmark — editorial serif + sans pairing */}
          <span className="font-[family-name:var(--font-fraunces)] text-xl font-light tracking-[-0.02em] text-[var(--text-emphasis)] transition-opacity duration-200 group-hover:opacity-80">
            Therapy
          </span>
          <span
            aria-hidden
            className="h-4 w-px bg-[var(--border-color)] opacity-60"
          />
          <span className="font-[family-name:var(--font-plus-jakarta)] text-xs font-medium tracking-[0.08em] text-[var(--text-tertiary)] uppercase transition-opacity duration-200 group-hover:opacity-80">
            Kinesiología
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-8" role="list">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : false
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'font-[family-name:var(--font-plus-jakarta)] text-sm font-medium transition-colors duration-200',
                      'relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[var(--color-terracota)] after:transition-all after:duration-300 hover:after:w-full',
                      isActive
                        ? 'text-[var(--color-terracota)] after:w-full'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* CTA + Mobile trigger */}
        <div className="flex items-center gap-3">
          <Link
            href="/turnos"
            className="hidden rounded-[var(--radius-base)] bg-[var(--color-terracota)] px-5 py-2 font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--color-terracota-hover)] hover:shadow-[var(--shadow-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracota)] md:block"
          >
            Reservar Turno
          </Link>
          <MobileMenu />
        </div>
      </div>
    </motion.header>
  )
}
