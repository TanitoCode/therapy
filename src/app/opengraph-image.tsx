import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Therapy — Kinesiología Buenos Aires'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F5',
          padding: '80px',
        }}
      >
        {/* Decorative bar */}
        <div
          style={{
            width: 64,
            height: 3,
            backgroundColor: '#B85C38',
            marginBottom: 40,
          }}
        />

        <p
          style={{
            fontSize: 80,
            fontWeight: 400,
            color: '#1C1917',
            letterSpacing: '-2px',
            margin: 0,
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          Therapy
        </p>
        <p
          style={{
            fontSize: 28,
            color: '#78716C',
            margin: '16px 0 0',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Kinesiología · Buenos Aires
        </p>

        <div
          style={{
            width: 64,
            height: 1,
            backgroundColor: '#D4CEC5',
            marginTop: 40,
            marginBottom: 24,
          }}
        />

        <p
          style={{
            fontSize: 22,
            color: '#B85C38',
            margin: 0,
            textAlign: 'center',
          }}
        >
          Reservá tu turno online
        </p>
      </div>
    ),
    { ...size },
  )
}
