import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

test.describe('CUJ-2: Marcar asistencia', () => {

  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('muestra el dashboard con los elementos principales', async ({ page }) => {
    await expect(page.locator('text=Vista de Hoy')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Aprendices/i })).toBeVisible()
  })

  test('muestra los contadores de asistencia', async ({ page }) => {
    await expect(page.getByText('Presentes')).toBeVisible()
    await expect(page.getByText('Tarde')).toBeVisible()
  })
})
