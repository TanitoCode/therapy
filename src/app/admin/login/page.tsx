import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: 'Acceso — Therapy Admin',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session) redirect('/admin/dashboard')

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <LoginForm />

      <p
        style={{
          marginTop: '1.5rem',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-body)',
          textAlign: 'center',
        }}
      >
        Acceso restringido al personal autorizado
      </p>
    </main>
  )
}
