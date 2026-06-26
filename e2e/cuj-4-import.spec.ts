import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

test.describe('CUJ-4: Importar aprendices', () => {

  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('navega a la página de importación', async ({ page }) => {
    await page.goto('/aprendices/importar')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1').filter({ hasText: 'Importar' }).first()).toBeVisible()
  })
})
