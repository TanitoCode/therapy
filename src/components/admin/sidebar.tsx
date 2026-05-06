'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wrench,
  BanIcon,
  Settings,
  LogOut,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/turnos', label: 'Turnos', icon: CalendarDays },
  { href: '/admin/pacientes', label: 'Pacientes', icon: Users },
  { href: '/admin/servicios', label: 'Servicios', icon: Wrench },
  { href: '/admin/bloqueos', label: 'Bloqueos', icon: BanIcon },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await authClient.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav
      className="flex h-full flex-col"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '1.5rem 1.25rem 1.25rem',
          borderBottom: '1px solid var(--border-color-subtle)',
        }}
      >
        <Link
          href="/admin/dashboard"
          onClick={onClose}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--text-emphasis)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            textDecoration: 'none',
          }}
        >
          Therapy
          <span
            style={{
              display: 'block',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <ul role="list" style={{ flex: 1, padding: '0.75rem 0.5rem', listStyle: 'none', margin: 0 }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-base)',
                  marginBottom: '2px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-terracota)' : 'var(--text-secondary)',
                  backgroundColor: active ? 'var(--color-error-bg)' : 'transparent',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
                className={cn(
                  'group',
                  !active && 'hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                <Icon
                  size={16}
                  strokeWidth={active ? 2.5 : 1.75}
                  style={{ flexShrink: 0, color: active ? 'var(--color-terracota)' : 'inherit' }}
                />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Logout */}
      <div style={{ padding: '0.75rem 0.5rem', borderTop: '1px solid var(--border-color-subtle)' }}>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            width: '100%',
            padding: '0.5rem 0.875rem',
            borderRadius: 'var(--radius-base)',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            textAlign: 'left',
            transition: 'background-color 0.15s, color 0.15s',
          }}
          className="hover:bg-[var(--bg-secondary)] hover:text-[var(--color-error)]"
        >
          <LogOut size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
