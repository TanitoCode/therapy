import type { Metadata } from 'next'
import { Hero } from '@/components/public/hero'
import { Services } from '@/components/public/services'
import { About } from '@/components/public/about'
import { Testimonials } from '@/components/public/testimonials'
import { Faq } from '@/components/public/faq'
import { Contact } from '@/components/public/contact'

export const metadata: Metadata = {
  title: 'Kinesiología y Fisioterapia en Buenos Aires — Therapy',
  description:
    'Consultorio de kinesiología con atención personalizada en Buenos Aires. Kinesiología deportiva, rehabilitación traumatológica y neurológica. Reservá tu turno online.',
  openGraph: {
    title: 'Kinesiología y Fisioterapia en Buenos Aires — Therapy',
    description:
      'Consultorio de kinesiología con atención personalizada en Buenos Aires. Reservá tu turno online.',
  },
}

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://therapy.vercel.app'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'MedicalBusiness'],
      '@id': `${APP_URL}/#business`,
      name: 'Therapy Kinesiología',
      description:
        'Consultorio de kinesiología y fisioterapia en Buenos Aires con atención personalizada.',
      url: APP_URL,
      telephone: '',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Buenos Aires',
        addressCountry: 'AR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -34.6037,
        longitude: -58.3816,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '19:00',
        },
      ],
      priceRange: '$$',
      currenciesAccepted: 'ARS',
      paymentAccepted: 'Cash, Credit Card, Debit Card',
      hasMap: `${APP_URL}/#mapa`,
      potentialAction: {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${APP_URL}/turnos`,
        },
        result: {
          '@type': 'Reservation',
          name: 'Turno de Kinesiología',
        },
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Services />
      <About />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  )
}
