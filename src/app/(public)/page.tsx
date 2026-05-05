import { Hero } from '@/components/public/hero'
import { Services } from '@/components/public/services'
import { About } from '@/components/public/about'
import { Testimonials } from '@/components/public/testimonials'
import { Faq } from '@/components/public/faq'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <Testimonials />
      <Faq />
      {/* T22: Contacto + Mapa */}
    </>
  )
}
