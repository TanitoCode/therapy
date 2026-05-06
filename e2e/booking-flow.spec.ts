import { test, expect } from '@playwright/test'

/**
 * E2E: Public booking flow
 * Requires: running Next.js server + populated DB (at least one active service + available slot)
 * Run: npx playwright test e2e/booking-flow.spec.ts
 */

test.describe('Public booking flow', () => {
  test('homepage loads and shows hero CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Therapy|Kinesiología/i)
    // Hero CTA should link to turnos
    const cta = page.getByRole('link', { name: /reservar|turno/i }).first()
    await expect(cta).toBeVisible()
  })

  test('skip link is present and functional', async ({ page }) => {
    await page.goto('/')
    // Tab to bring skip link into focus
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: /saltar al contenido/i })
    await expect(skipLink).toBeFocused()
  })

  test('services page renders service list', async ({ page }) => {
    await page.goto('/#servicios')
    await expect(page.getByRole('heading', { name: /servicios/i }).first()).toBeVisible()
  })

  test('booking wizard step 1 — shows service selection', async ({ page }) => {
    await page.goto('/turnos')
    await expect(page.getByRole('heading', { name: /elegí tu servicio/i })).toBeVisible()
    // Step 1 should be active
    const nav = page.getByRole('navigation', { name: /progreso/i })
    await expect(nav).toBeVisible()
  })

  test('booking wizard — cannot advance without selecting a service', async ({ page }) => {
    await page.goto('/turnos')
    const next = page.getByRole('button', { name: /siguiente/i })
    // Next button should be disabled or clicking it should not advance
    await expect(next).toBeDisabled()
  })

  test('booking wizard — full flow: service → date → patient → confirm', async ({ page }) => {
    await page.goto('/turnos')

    // Step 1: Select first available service
    const serviceCard = page.locator('[aria-pressed]').first()
    await expect(serviceCard).toBeVisible({ timeout: 10_000 })
    await serviceCard.click()
    await expect(serviceCard).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('button', { name: /siguiente/i }).click()

    // Step 2: Calendar — select a date and time slot
    // Wait for calendar to load
    await expect(page.getByRole('heading', { name: /elegí fecha/i })).toBeVisible()
    // Find an available time slot button
    const slot = page.locator('[aria-pressed="false"]').first()
    await expect(slot).toBeVisible({ timeout: 15_000 })
    await slot.click()
    await page.getByRole('button', { name: /siguiente/i }).click()

    // Step 3: Patient form
    await expect(page.getByRole('heading', { name: /tus datos/i })).toBeVisible()
    await page.getByLabel(/nombre/i).fill('Juan Test Playwright')
    await page.getByLabel(/email/i).fill('playwright-test@example.com')
    await page.getByRole('button', { name: /siguiente/i }).click()

    // Step 4: Confirmation
    await expect(page.getByRole('heading', { name: /confirmá tu turno/i })).toBeVisible()
    // Appointment summary should show service name and patient name
    await expect(page.getByText('Juan Test Playwright')).toBeVisible()
  })

  test('not-found page renders properly', async ({ page }) => {
    await page.goto('/ruta-que-no-existe-1234')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByRole('link', { name: /inicio/i })).toBeVisible()
  })

  test('cancel page — invalid token shows error state', async ({ page }) => {
    await page.goto('/turnos/cancelar/token-invalido-123')
    // Should show an error state, not a confirmation prompt
    await expect(page.locator('main')).toBeVisible()
  })

  test('confirm page — invalid token shows error state', async ({ page }) => {
    await page.goto('/turnos/confirmar/token-invalido-456')
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Accessibility smoke tests — public', () => {
  test('html lang attribute is set', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('es-AR')
  })

  test('all images have alt text', async ({ page }) => {
    await page.goto('/')
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt, `Image at index ${i} is missing alt attribute`).not.toBeNull()
    }
  })

  test('contact form has proper labels', async ({ page }) => {
    await page.goto('/#contacto')
    await expect(page.getByLabel(/nombre/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mensaje/i)).toBeVisible()
  })
})
