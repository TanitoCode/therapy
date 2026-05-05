'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { contactSchema, type ContactInput } from '@/lib/validators/contact'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// Leaflet requires browser APIs — no SSR
const Map = dynamic(() => import('@/components/public/map').then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-[var(--radius-base)] bg-[var(--bg-tertiary)]" />
  ),
})

const EASE = [0.16, 1, 0.3, 1] as const

const CONTACT_INFO = [
  {
    label: 'Dirección',
    value: 'Buenos Aires, Argentina',
    href: undefined,
  },
  {
    label: 'Teléfono',
    value: '+54 11 0000-0000',
    href: 'tel:+541100000000',
  },
  {
    label: 'Email',
    value: 'turnos@therapy-kinesio.com.ar',
    href: 'mailto:turnos@therapy-kinesio.com.ar',
  },
  {
    label: 'WhatsApp',
    value: 'Escribinos por WhatsApp',
    href: 'https://wa.me/5491100000000',
  },
]

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactInput) {
    setStatus('loading')
    setServerError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Error al enviar el mensaje')
      }

      setStatus('success')
      reset()
    } catch (err) {
      setStatus('error')
      setServerError(err instanceof Error ? err.message : 'Error inesperado')
    }
  }

  return (
    <section
      id="contacto"
      aria-labelledby="contact-heading"
      className="bg-[var(--bg-canvas)] px-6 py-[clamp(5rem,8vw,10rem)] lg:px-8"
    >
      <div className="mx-auto max-w-[1280px]">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-14"
        >
          <p className="mb-4 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.15em] text-[var(--color-bisque)] uppercase">
            Contacto
          </p>
          <h2
            id="contact-heading"
            className="font-[family-name:var(--font-fraunces)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--text-emphasis)]"
            style={{ fontSize: 'clamp(2.5rem, 3.5vw + 1rem, 4rem)' }}
          >
            Estamos para escucharte.
          </h2>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">

          {/* ── Left: form ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {status === 'success' ? (
              <div className="flex flex-col gap-4 rounded-[var(--radius-base)] border border-[var(--color-success)] bg-[var(--color-success-bg)] px-8 py-10">
                <p className="font-[family-name:var(--font-fraunces)] text-2xl font-light text-[var(--color-success)]">
                  Mensaje enviado.
                </p>
                <p className="font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
                  Gracias por escribirnos. Te responderemos a la brevedad.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-2 self-start font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-terracota)] underline-offset-4 hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="contact-name"
                    className="font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
                  >
                    Nombre completo <span aria-hidden className="text-[var(--color-terracota)]">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p id="contact-name-error" role="alert" className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--color-error)]">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email + Phone (side by side on sm+) */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="contact-email"
                      className="font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
                    >
                      Email <span aria-hidden className="text-[var(--color-terracota)]">*</span>
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p id="contact-email-error" role="alert" className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--color-error)]">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="contact-phone"
                      className="font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
                    >
                      Teléfono <span className="text-[var(--text-tertiary)] font-normal">(opcional)</span>
                    </Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+54 11 ..."
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p id="contact-phone-error" role="alert" className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--color-error)]">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="contact-message"
                    className="font-[family-name:var(--font-plus-jakarta)] text-sm font-medium text-[var(--text-primary)]"
                  >
                    Mensaje <span aria-hidden className="text-[var(--color-terracota)]">*</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Contanos en qué podemos ayudarte..."
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className="resize-none"
                    {...register('message')}
                  />
                  {errors.message && (
                    <p id="contact-message-error" role="alert" className="font-[family-name:var(--font-plus-jakarta)] text-xs text-[var(--color-error)]">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <p role="alert" className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--color-error)]">
                    {serverError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="self-start bg-[var(--color-terracota)] font-[family-name:var(--font-plus-jakarta)] text-[var(--text-on-accent)] hover:bg-[var(--color-terracota-hover)] disabled:opacity-60"
                >
                  {status === 'loading' ? 'Enviando…' : 'Enviar mensaje'}
                </Button>
              </form>
            )}
          </motion.div>

          {/* ── Right: map + info ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="flex flex-col gap-8"
          >
            {/* Map */}
            <div
              className="h-72 overflow-hidden rounded-[var(--radius-base)] border border-[var(--border-color-subtle)] lg:h-80"
              aria-label="Mapa de ubicación del consultorio"
            >
              <Map className="h-full w-full" />
            </div>

            {/* Contact info */}
            <ul className="flex flex-col gap-4" role="list">
              {CONTACT_INFO.map(({ label, value, href }) => (
                <li key={label} className="flex flex-col gap-0.5">
                  <span className="font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.1em] text-[var(--text-tertiary)] uppercase">
                    {label}
                  </span>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--color-terracota)]"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="font-[family-name:var(--font-plus-jakarta)] text-sm text-[var(--text-secondary)]">
                      {value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
