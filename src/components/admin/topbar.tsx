'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, ChevronDown, LogOut, User } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'

interface TopbarProps {
  userName: string
  userEmail: string
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  async function handleLogout() {
    setDropdownOpen(false)
    await authClient.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      <header
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-base)',
          }}
          className="lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Spacer (desktop: takes the sidebar space via CSS) */}
        <div className="hidden lg:block" />

        {/* User dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label={`Menú de usuario: ${userName}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.625rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-base)',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              transition: 'background-color 0.15s',
            }}
            className="hover:bg-[var(--bg-secondary)]"
          >
            {/* Avatar */}
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'var(--color-terracota)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}
              aria-hidden
            >
              {initials || <User size={12} />}
            </span>
            <span className="hidden sm:block" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </span>
            <ChevronDown
              size={14}
              style={{
                color: 'var(--text-tertiary)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 39 }}
                onClick={() => setDropdownOpen(false)}
                aria-hidden
              />
              {/* Menu */}
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  minWidth: 200,
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
                  zIndex: 40,
                  overflow: 'hidden',
                  padding: '4px',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px 6px',
                    borderBottom: '1px solid var(--border-color-subtle)',
                    marginBottom: 4,
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {userName}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                    {userEmail}
                  </p>
                </div>
                <button
                  role="menuitem"
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-error)',
                    borderRadius: 'var(--radius-base)',
                    textAlign: 'left',
                    transition: 'background-color 0.15s',
                  }}
                  className="hover:bg-[var(--color-error-bg)]"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" style={{ padding: 0, width: 260 }}>
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
          </SheetHeader>
          <Sidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
