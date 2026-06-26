import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

test.describe('CUJ-5: Ver estadísticas', () => {

  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('navega a la página de estadísticas', async ({ page }) => {
    await page.goto('/estadisticas')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: 'Estadísticas' }).first()).toBeVisible()
  })
})
