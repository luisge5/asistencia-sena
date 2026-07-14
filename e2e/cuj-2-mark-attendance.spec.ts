import { test, expect } from '@playwright/test'
import { setupAuth } from './helpers'

test.describe('CUJ-2: Marcar asistencia', () => {

  test.beforeEach(async ({ page }) => {
    await setupAuth(page)
  })

  test('muestra el dashboard con los elementos principales', async ({ page }) => {
    await expect(page.getByText('Asistencia hoy')).toBeVisible()
    await expect(page.getByText('Faltan por marcar')).toBeVisible()
  })

  test('muestra los contadores de asistencia', async ({ page }) => {
    await expect(page.getByText(/0% asistencia/)).toBeVisible()
    await expect(page.getByText('Todos marcados')).toBeVisible()
  })
})
