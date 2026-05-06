import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface Props {
  patientName: string
  serviceName: string
  startAt: Date
  appointmentId: string
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

export default function AdminCancellation({
  patientName,
  serviceName,
  startAt,
  appointmentId,
  appUrl,
}: Props) {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Turno cancelado — {patientName} · {serviceName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Admin — Turno cancelado</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Un paciente canceló su turno</Heading>

            <Section style={card}>
              <Text style={rowLabel}>Paciente</Text>
              <Text style={rowValue}>{patientName}</Text>
              <Text style={rowLabel}>Servicio</Text>
              <Text style={rowValue}>{serviceName}</Text>
              <Text style={rowLabel}>Fecha cancelada</Text>
              <Text style={rowValue}>{dateLabel(startAt)} a las {timeLabel(startAt)}</Text>
              <Text style={rowLabel}>ID</Text>
              <Text style={{ ...rowValue, fontFamily: 'monospace', fontSize: 12 }}>{appointmentId}</Text>
            </Section>

            <Text style={text}>
              El slot quedó disponible para nuevas reservas.
            </Text>

            <Section style={btnWrap}>
              <Button style={btnPrimary} href={`${appUrl}/admin/dashboard`}>
                Ver calendario admin
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>Notificación automática — no respondas este email.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

AdminCancellation.PreviewProps = {
  patientName: 'Carlos Rodríguez',
  serviceName: 'Rehabilitación Traumatológica',
  startAt: new Date('2026-05-16T14:30:00-03:00'),
  appointmentId: 'f1e2d3c4-b5a6-7890-abcd-ef1234567890',
  appUrl: 'http://localhost:3000',
} satisfies Props

const body: React.CSSProperties = { backgroundColor: '#f0f0f0', fontFamily: 'system-ui,sans-serif', margin: 0, padding: '32px 16px' }
const container: React.CSSProperties = { maxWidth: 560, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden' }
const header: React.CSSProperties = { backgroundColor: '#7f1d1d', padding: '20px 28px' }
const logo: React.CSSProperties = { color: '#fca5a5', fontSize: 16, fontWeight: 600, margin: 0 }
const content: React.CSSProperties = { padding: '28px 28px 20px' }
const h1: React.CSSProperties = { color: '#111827', fontSize: 20, fontWeight: 600, margin: '0 0 20px' }
const card: React.CSSProperties = { backgroundColor: '#fef2f2', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }
const rowLabel: React.CSSProperties = { color: '#6b7280', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' as const, margin: '8px 0 2px' }
const rowValue: React.CSSProperties = { color: '#111827', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }
const text: React.CSSProperties = { color: '#374151', fontSize: 14, lineHeight: '1.6', margin: '0 0 16px' }
const btnWrap: React.CSSProperties = { marginBottom: 8 }
const btnPrimary: React.CSSProperties = { backgroundColor: '#991b1b', borderRadius: 6, color: '#fff', display: 'inline-block', fontSize: 14, fontWeight: 600, padding: '10px 24px', textDecoration: 'none' }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: 0 }
const footer: React.CSSProperties = { padding: '16px 28px' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: 12, margin: 0 }
