import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface Props {
  patientName: string
  serviceName: string
  startAt: Date
  confirmationToken: string
  cancelToken: string
  appUrl: string
}

const dateLabel = (d: Date) =>
  d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  })

const timeLabel = (d: Date) =>
  d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })

export default function BookingConfirmation({
  patientName,
  serviceName,
  startAt,
  confirmationToken,
  cancelToken,
  appUrl,
}: Props) {
  const confirmUrl = `${appUrl}/turnos/confirmar/${confirmationToken}`
  const cancelUrl = `${appUrl}/turnos/cancelar/${cancelToken}`

  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Tu turno está reservado — {serviceName} el {dateLabel(startAt)}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Kinesiología</Heading>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Heading style={h1}>Tu turno fue reservado</Heading>
            <Text style={text}>
              Hola <strong>{patientName}</strong>, recibimos tu solicitud de turno.
              Confirmá tu asistencia con el botón de abajo.
            </Text>

            {/* Appointment card */}
            <Section style={card}>
              <Text style={cardLabel}>Servicio</Text>
              <Text style={cardValue}>{serviceName}</Text>
              <Hr style={cardDivider} />
              <Text style={cardLabel}>Fecha y hora</Text>
              <Text style={cardValue}>
                {dateLabel(startAt)} a las {timeLabel(startAt)}
              </Text>
            </Section>

            <Section style={btnWrap}>
              <Button style={btnPrimary} href={confirmUrl}>
                Confirmar asistencia
              </Button>
            </Section>

            <Text style={textSm}>
              Si no podés asistir, podés{' '}
              <Link href={cancelUrl} style={linkStyle}>
                cancelar tu turno aquí
              </Link>
              . Este enlace es válido por 30 días.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              Este email fue enviado porque realizaste una reserva en nuestro consultorio.
              Si no fuiste vos, ignorá este mensaje.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

BookingConfirmation.PreviewProps = {
  patientName: 'Lucía Gómez',
  serviceName: 'Kinesiología Deportiva',
  startAt: new Date('2026-05-15T10:00:00-03:00'),
  confirmationToken: 'tok-confirm-preview',
  cancelToken: 'tok-cancel-preview',
  appUrl: 'http://localhost:3000',
} satisfies Props

// ─── Styles ───────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#f5f0eb',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: '32px 16px',
}
const container: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  backgroundColor: '#faf8f5',
  borderRadius: 12,
  overflow: 'hidden',
}
const header: React.CSSProperties = {
  backgroundColor: '#2a1f14',
  padding: '24px 32px',
}
const logo: React.CSSProperties = {
  color: '#d4a96a',
  fontSize: 20,
  fontWeight: 400,
  letterSpacing: '0.1em',
  margin: 0,
  textTransform: 'uppercase' as const,
}
const content: React.CSSProperties = {
  padding: '32px 32px 24px',
}
const h1: React.CSSProperties = {
  color: '#2a1f14',
  fontSize: 24,
  fontWeight: 400,
  lineHeight: '1.3',
  margin: '0 0 16px',
}
const text: React.CSSProperties = {
  color: '#5c4a38',
  fontSize: 15,
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const textSm: React.CSSProperties = {
  ...text,
  fontSize: 13,
  color: '#7a6654',
}
const card: React.CSSProperties = {
  backgroundColor: '#f0e8df',
  borderRadius: 8,
  padding: '20px 24px',
  marginBottom: 24,
}
const cardLabel: React.CSSProperties = {
  color: '#9c7f65',
  fontSize: 11,
  fontFamily: 'system-ui, sans-serif',
  letterSpacing: '0.08em',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
}
const cardValue: React.CSSProperties = {
  color: '#2a1f14',
  fontSize: 15,
  margin: '0 0 12px',
  fontWeight: 600,
}
const cardDivider: React.CSSProperties = {
  borderColor: '#d4c4b4',
  margin: '12px 0',
}
const btnWrap: React.CSSProperties = {
  marginBottom: 16,
}
const btnPrimary: React.CSSProperties = {
  backgroundColor: '#c17b3c',
  borderRadius: 8,
  color: '#fff',
  display: 'inline-block',
  fontSize: 15,
  fontFamily: 'system-ui, sans-serif',
  fontWeight: 600,
  padding: '12px 28px',
  textDecoration: 'none',
}
const linkStyle: React.CSSProperties = {
  color: '#c17b3c',
}
const divider: React.CSSProperties = {
  borderColor: '#e0d5c8',
  margin: 0,
}
const footer: React.CSSProperties = {
  padding: '20px 32px',
}
const footerText: React.CSSProperties = {
  color: '#b5a496',
  fontSize: 12,
  fontFamily: 'system-ui, sans-serif',
  lineHeight: '1.5',
  margin: 0,
}
