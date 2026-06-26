import type { Page } from '@playwright/test'

export async function setupAuth(page: Page) {
  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '48acae3d-5ff5-4bc0-a979-8e3321756c04',
          email: 'instructor@sena.edu.co',
          emailVerified: true,
          profile: { name: 'Instructor SENA' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    })
  })

  await page.route('**/rest/v1/user_roles*', async (route) => {
    const url = route.request().url()
    if (url.includes('select=rol')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          rol: 'instructor',
          ficha_asignada: 2857520,
          centro: 'Centro Regional Bogotá',
        }]),
      })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    }
  })

  await page.route('**/rest/v1/aprendices*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route('**/rest/v1/asistencias*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')
}
