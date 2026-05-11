import Link from 'next/link'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Sobre Nosotros', href: '/#nosotros' },
  { label: 'Contacto', href: '/#contacto' },
  { label: 'Reservar Turno', href: '/turnos' },
]

const CONTACT = {
  address: 'Buenos Aires, Argentina',
  phone: '+54 11 0000-0000',
  email: 'turnos@therapy-kinesio.com.ar',
  whatsapp: '5491100000000',
}

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/', icon: InstagramIcon },
  { label: 'Facebook', href: 'https://facebook.com/', icon: FacebookIcon },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      className="border-t border-[var(--border-color-subtle)] bg-[var(--bg-primary)]"
    >
      {/* Main grid */}
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Col 1 — Brand */}
          <div>
            <Link
              href="/"
              className="mb-4 inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-terracota)]"
              aria-label="Therapy — Página de inicio"
            >
              <Image
                src="/logoTherapy.png"
                alt="Therapy Kinesiología"
                height={40}
                width={160}
                className="h-10 w-auto"
              />
            </Link>

            <p className="mt-4 max-w-[28ch] font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
              Atención personalizada en kinesiología deportiva, neurológica y traumatológica en Buenos Aires.
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-base)] border border-[var(--border-color-subtle)] text-[var(--text-tertiary)] transition-all duration-200 hover:border-[var(--color-terracota)] hover:text-[var(--color-terracota)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-terracota)]"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Nav */}
          <nav aria-label="Mapa del sitio">
            <p className="mb-4 font-[family-name:var(--font-fraunces)] text-xs tracking-[0.15em] text-[var(--text-tertiary)] uppercase">
              Navegación
            </p>
            <ul className="flex flex-col gap-2" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--color-terracota)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3 — Contact */}
          <address className="not-italic">
            <p className="mb-4 font-[family-name:var(--font-fraunces)] text-xs tracking-[0.15em] text-[var(--text-tertiary)] uppercase">
              Contacto
            </p>
            <ul className="flex flex-col gap-3" role="list">
              <li className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                {CONTACT.address}
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                  className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--color-terracota)]"
                >
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--color-terracota)]"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--color-terracota)]"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" aria-hidden />
                  WhatsApp
                </a>
              </li>
            </ul>
          </address>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border-color-subtle)]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-6 py-5 lg:px-8 sm:flex-row">
          <p className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--text-tertiary)]">
            © {year} Therapy Kinesiología. Todos los derechos reservados.
          </p>
          <p className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--text-tertiary)]">
            Buenos Aires, Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ---- Inline SVG icons (no dependency on lucide for brand icons) ---- */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}
