import type { Metadata } from 'next'
import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://therapy.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Kinesiología — Therapy Consultorio',
    template: '%s — Therapy Kinesiología',
  },
  description:
    'Consultorio de kinesiología y fisioterapia en Buenos Aires. Reservá tu turno online. Kinesiología deportiva, rehabilitación traumatológica y neurológica.',
  keywords: [
    'kinesiología',
    'fisioterapia',
    'rehabilitación',
    'Buenos Aires',
    'turnos online',
    'kinesiología deportiva',
    'neurorehabilitación',
  ],
  authors: [{ name: 'Therapy Consultorio' }],
  creator: 'Therapy Consultorio',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: APP_URL,
    siteName: 'Therapy Kinesiología',
    title: 'Kinesiología — Therapy Consultorio',
    description:
      'Consultorio de kinesiología y fisioterapia en Buenos Aires. Reservá tu turno online.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Therapy — Kinesiología Buenos Aires',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kinesiología — Therapy Consultorio',
    description:
      'Consultorio de kinesiología y fisioterapia en Buenos Aires. Reservá tu turno online.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Skip to content — accesibilidad */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--color-terracota)] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </>
  )
}
