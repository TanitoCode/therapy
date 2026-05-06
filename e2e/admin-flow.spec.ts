import { test, expect } from '@playwright/test'

/**
 * E2E: Admin flow
 * Requires: running Next.js server + seeded admin user in DB
 * Env vars needed: PLAYWRIGHT_ADMIN_EMAIL, PLAYWRIGHT_ADMIN_PASSWORD
 * Run: npx playwright test e2e/admin-flow.spec.ts
 */

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? 'admin@test.com'
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? 'test-password-123'

// Shared login helper
async function loginAsAdmin(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/contraseña|password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /iniciar sesión|ingresar/i }).click()
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10_000 })
}

test.describe('Admin auth', () => {
  test('unauthenticated access to /admin redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByRole('heading', { name: /therapy/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /iniciar|ingresar/i })).toBeVisible()
  })

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/contraseña|password/i).fill('wrong-password')
    await page.getByRole('button', { name: /iniciar|ingresar/i }).click()
    // Should stay on login page and show error
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5_000 })
  })
})

test.describe('Admin dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('dashboard loads with KPI cards', async ({ page }) => {
    await expect(page.getByText(/turnos hoy/i)).toBeVisible()
    await expect(page.getByText(/semana/i)).toBeVisible()
  })

  test('sidebar navigation is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /pacientes/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /servicios/i })).toBeVisible()
  })

  test('user menu opens on click', async ({ page }) => {
    const userMenu = page.getByRole('button', { name: /menú de usuario/i })
    await userMenu.click()
    await expect(page.getByRole('menuitem', { name: /cerrar sesión/i })).toBeVisible()
  })
})

test.describe('Admin pacientes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('patient list renders with search input', async ({ page }) => {
    await page.goto('/admin/pacientes')
    await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible()
    await expect(page.getByRole('searchbox')).toBeVisible()
  })

  test('search debounces and filters results', async ({ page }) => {
    await page.goto('/admin/pacientes')
    const search = page.getByRole('searchbox')
    await search.fill('Juan')
    // Wait for debounce (400ms) + network
    await page.waitForTimeout(600)
    // Table should have updated (even if 0 results)
    await expect(page.locator('table, [data-empty]')).toBeVisible()
  })
})

test.describe('Admin servicios', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('services list loads', async ({ page }) => {
    await page.goto('/admin/servicios')
    await expect(page.getByRole('heading', { name: /servicios/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nuevo servicio/i })).toBeVisible()
  })

  test('new service dialog opens', async ({ page }) => {
    await page.goto('/admin/servicios')
    await page.getByRole('button', { name: /nuevo servicio/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: /nuevo servicio/i })).toBeVisible()
  })

  test('new service dialog closes on cancel', async ({ page }) => {
    await page.goto('/admin/servicios')
    await page.getByRole('button', { name: /nuevo servicio/i }).click()
    await page.getByRole('button', { name: /cancelar/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('service form validates required fields', async ({ page }) => {
    await page.goto('/admin/servicios')
    await page.getByRole('button', { name: /nuevo servicio/i }).click()
    // Submit without filling required fields
    await page.getByRole('button', { name: /crear servicio/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible() // should stay open
    // Validation error should appear
    await expect(page.getByText(/al menos 2 caracteres/i)).toBeVisible()
  })
})

test.describe('Admin bloqueos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('blocked slots page loads', async ({ page }) => {
    await page.goto('/admin/bloqueos')
    await expect(page.getByRole('heading', { name: /bloqueos/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nuevo bloqueo/i })).toBeVisible()
  })
})

test.describe('Admin configuracion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('configuration page loads with form sections', async ({ page }) => {
    await page.goto('/admin/configuracion')
    await expect(page.getByRole('heading', { name: /configuración/i })).toBeVisible()
    await expect(page.getByText(/datos de contacto/i)).toBeVisible()
    await expect(page.getByText(/horario laboral/i)).toBeVisible()
  })

  test('save button persists config to localStorage', async ({ page }) => {
    await page.goto('/admin/configuracion')
    await page.getByLabel(/dirección/i).fill('Av. Test 123')
    await page.getByRole('button', { name: /guardar cambios/i }).click()
    // Toast should confirm save
    await expect(page.getByText(/guardad[ao]/i)).toBeVisible({ timeout: 3_000 })
    // Reload and verify persistence
    await page.reload()
    await expect(page.getByLabel(/dirección/i)).toHaveValue('Av. Test 123')
  })
})

test.describe('Admin logout', () => {
  test('logout redirects to login', async ({ page }) => {
    await loginAsAdmin(page)
    const userMenu = page.getByRole('button', { name: /menú de usuario/i })
    await userMenu.click()
    await page.getByRole('menuitem', { name: /cerrar sesión/i }).click()
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 })
  })
})
