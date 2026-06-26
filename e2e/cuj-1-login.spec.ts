import { test, expect } from '@playwright/test'

test.describe('CUJ-1: Login exitoso', () => {

  test('muestra la página de login con los elementos correctos', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveTitle(/Asistencia/)
    await expect(page.getByText('Asistencia SENA')).toBeVisible()
    await expect(page.getByText('Iniciar sesión con Google')).toBeVisible()
  })

  test('redirige a login cuando no hay autenticación', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('redirige a login al acceder a rutas protegidas', async ({ page }) => {
    const rutas = ['/scan', '/aprendices', '/historial', '/estadisticas']
    for (const ruta of rutas) {
      await page.goto(ruta)
      await page.waitForURL(/\/login/, { timeout: 5000 })
      expect(page.url()).toContain('/login')
    }
  })
})
