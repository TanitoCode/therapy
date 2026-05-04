export default function HomePage() {
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
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: 'var(--text-emphasis)',
        }}
      >
        Therapy — Próximamente
      </h1>
    </main>
  )
}
