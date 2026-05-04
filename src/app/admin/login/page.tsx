'use client'

export default function AdminLoginPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>
        Admin Login
      </p>
    </main>
  )
}
