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
  patientEmail: string
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

export default function AdminNewBooking({
  patientName,
  patientEmail,
  serviceName,
  startAt,
  appointmentId,
  appUrl,
}: Props) {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Nuevo turno — {patientName} · {serviceName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Admin — Nuevo turno</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Nuevo turno reservado</Heading>

            <Section style={card}>
              <Row label="Paciente" value={patientName} />
              <Row label="Email" value={patientEmail} />
              <Row label="Servicio" value={serviceName} />
              <Row label="Fecha" value={`${dateLabel(startAt)} a las ${timeLabel(startAt)}`} />
              <Row label="ID" value={appointmentId} mono />
            </Section>

            <Section style={btnWrap}>
              <Button style={btnPrimary} href={`${appUrl}/admin/dashboard`}>
                Ver en panel admin
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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <Text style={rowLabel}>{label}</Text>
      <Text style={mono ? { ...rowValue, fontFamily: 'monospace', fontSize: 13 } : rowValue}>
        {value}
      </Text>
    </>
  )
}

AdminNewBooking.PreviewProps = {
  patientName: 'Lucía Gómez',
  patientEmail: 'lucia@example.com',
  serviceName: 'Kinesiología Deportiva',
  startAt: new Date('2026-05-15T10:00:00-03:00'),
  appointmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  appUrl: 'http://localhost:3000',
} satisfies Props

const body: React.CSSProperties = { backgroundColor: '#f0f0f0', fontFamily: 'system-ui,sans-serif', margin: 0, padding: '32px 16px' }
const container: React.CSSProperties = { maxWidth: 560, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden' }
const header: React.CSSProperties = { backgroundColor: '#1a3a2a', padding: '20px 28px' }
const logo: React.CSSProperties = { color: '#7ec8a0', fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: '0.05em' }
const content: React.CSSProperties = { padding: '28px 28px 20px' }
const h1: React.CSSProperties = { color: '#111827', fontSize: 20, fontWeight: 600, margin: '0 0 20px' }
const card: React.CSSProperties = { backgroundColor: '#f9fafb', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }
const rowLabel: React.CSSProperties = { color: '#6b7280', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' as const, margin: '8px 0 2px' }
const rowValue: React.CSSProperties = { color: '#111827', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }
const btnWrap: React.CSSProperties = { marginBottom: 8 }
const btnPrimary: React.CSSProperties = { backgroundColor: '#166534', borderRadius: 6, color: '#fff', display: 'inline-block', fontSize: 14, fontWeight: 600, padding: '10px 24px', textDecoration: 'none' }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: 0 }
const footer: React.CSSProperties = { padding: '16px 28px' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: 12, margin: 0 }
