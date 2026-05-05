'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FAQ as FAQ_DATA } from '@/lib/content'

const EASE = [0.16, 1, 0.3, 1] as const

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-[var(--bg-secondary)] px-6 py-[clamp(5rem,8vw,10rem)] lg:px-8"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-16 lg:grid-cols-[2fr_3fr] lg:items-start">

          {/* ── Left: section header (sticky on desktop) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="lg:sticky lg:top-24"
          >
            <p className="mb-4 font-[family-name:var(--font-plus-jakarta)] text-xs font-semibold tracking-[0.15em] text-[var(--color-bisque)] uppercase">
              Preguntas frecuentes
            </p>
            <h2
              id="faq-heading"
              className="font-[family-name:var(--font-fraunces)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--text-emphasis)]"
              style={{ fontSize: 'clamp(2.5rem, 3.5vw + 1rem, 4rem)' }}
            >
              Todo lo que<br />necesitás saber.
            </h2>
            <p className="mt-4 max-w-[36ch] font-[family-name:var(--font-plus-jakarta)] text-base leading-relaxed text-[var(--text-secondary)]">
              Si tu consulta no aparece aquí, escribinos por WhatsApp y te respondemos.
            </p>
          </motion.div>

          {/* ── Right: accordion ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQ_DATA.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-[var(--border-color-subtle)] first:border-t"
                >
                  <AccordionTrigger
                    className="py-5 text-left font-[family-name:var(--font-plus-jakarta)] text-base font-medium text-[var(--text-primary)] hover:text-[var(--color-terracota)] hover:no-underline [&[data-state=open]]:text-[var(--color-terracota)] [&>svg]:text-[var(--text-tertiary)] [&[data-state=open]>svg]:text-[var(--color-terracota)]"
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 font-[family-name:var(--font-plus-jakarta)] text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
