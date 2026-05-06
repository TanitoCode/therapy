export default function TurnosLoading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 680 }}>
        {/* Step indicator skeleton */}
        <div
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: 40,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === 1 ? 'var(--color-terracota)' : 'var(--bg-tertiary)',
              }}
            />
          ))}
        </div>

        {/* Card skeleton */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
          }}
        >
          <div
            style={{
              height: 24,
              width: 200,
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 4,
              marginBottom: '2rem',
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 120,
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
