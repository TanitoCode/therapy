'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Sobre Nosotros', href: '/#nosotros' },
  { label: 'Contacto', href: '/#contacto' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[280px] border-l border-[var(--border-color-subtle)] bg-[var(--bg-canvas)] px-0"
        aria-label="Navegación principal"
      >
        <nav className="flex flex-col px-6 pt-8">
          <p className="mb-6 font-[family-name:var(--font-fraunces)] text-xs tracking-[0.15em] text-[var(--text-tertiary)] uppercase">
            Menú
          </p>

          <ul className="flex flex-col gap-1" role="list">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href.replace('/#', '/'))
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={[
                      'flex items-center py-3 text-base transition-colors duration-200',
                      'font-[family-name:var(--font-plus-jakarta)] font-medium',
                      'border-b border-[var(--border-color-subtle)]',
                      isActive
                        ? 'text-[var(--color-terracota)]'
                        : 'text-[var(--text-primary)] hover:text-[var(--color-terracota)]',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-8">
            <Link
              href="/turnos"
              onClick={() => setOpen(false)}
              className="block w-full rounded-[var(--radius-base)] bg-[var(--color-terracota)] px-6 py-3 text-center font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold tracking-wide text-[var(--text-on-accent)] transition-colors duration-200 hover:bg-[var(--color-terracota-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracota)]"
            >
              Reservar Turno
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
