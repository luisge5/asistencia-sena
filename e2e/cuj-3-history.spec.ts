import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

test.describe('CUJ-3: Ver historial', () => {

  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('navega al historial desde el dashboard', async ({ page }) => {
    await page.goto('/historial')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Asistencia del grupo')).toBeVisible()
  })
})
