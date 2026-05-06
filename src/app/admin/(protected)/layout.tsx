import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { Sidebar } from '@/components/admin/sidebar'
import { Topbar } from '@/components/admin/topbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/admin/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/admin/login')
  }

  const userName = session.user.name ?? session.user.email
  const userEmail = session.user.email

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100dvh',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      {/* Desktop sidebar */}
      <aside
        aria-label="Navegación admin"
        className="hidden lg:flex"
        style={{
          width: 240,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100dvh',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%' }}>
          <Sidebar />
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar userName={userName} userEmail={userEmail} />
        <main
          id="main-content"
          style={{ flex: 1, padding: '1.5rem', maxWidth: '100%', overflowX: 'hidden' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
