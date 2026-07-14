# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cuj-carnets.spec.ts >> CUJ-Carnets: Registro y descarga de carnets digitales >> Instructor: Descargar PNG individual de un carnet
- Location: e2e\cuj-carnets.spec.ts:110:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Generando códigos QR... 1/1')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Generando códigos QR... 1/1')

```

```yaml
- link "Saltar al contenido principal":
  - /url: "#main-content"
- banner:
  - text: Asistencia martes, 14 de julio
  - button "Cerrar sesión":
    - img
- main:
  - heading "Carnets · 0" [level=2]
  - button "PDF" [disabled]:
    - img
    - text: PDF
  - text: No hay aprendices registrados en esta ficha
- navigation "Navegación principal":
  - button "Hoy":
    - img
    - text: Hoy
  - button "Escanear":
    - img
    - text: Escanear
  - button "Aprendices":
    - img
    - text: Aprendices
  - button "Histórico":
    - img
    - text: Histórico
```

# Test source

```ts
  34  |             centro: 'Centro Regional Bogotá',
  35  |             estado: 'activo',
  36  |             foto: null,
  37  |             created_at: new Date().toISOString(),
  38  |             updated_at: new Date().toISOString(),
  39  |           },
  40  |         ]),
  41  |       })
  42  |     })
  43  | 
  44  |     await page.route('**/rest/v1/asistencias*', async (route) => {
  45  |       await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  46  |     })
  47  | 
  48  |     await page.route('**/rest/v1/user_roles*', async (route) => {
  49  |       await route.fulfill({
  50  |         status: 200,
  51  |         contentType: 'application/json',
  52  |         body: JSON.stringify([{
  53  |           rol: 'instructor',
  54  |           ficha_asignada: 2857520,
  55  |           centro: 'Centro Regional Bogotá',
  56  |         }]),
  57  |       })
  58  |     })
  59  | 
  60  |     await page.route('**/api/auth/refresh', async (route) => {
  61  |       await route.fulfill({
  62  |         status: 200,
  63  |         contentType: 'application/json',
  64  |         body: JSON.stringify({
  65  |           accessToken: 'mock-access-token',
  66  |           refreshToken: 'mock-refresh-token',
  67  |           user: {
  68  |             id: '48acae3d-5ff5-4bc0-a979-8e3321756c04',
  69  |             email: 'instructor@sena.edu.co',
  70  |             emailVerified: true,
  71  |             profile: { name: 'Instructor SENA' },
  72  |             createdAt: new Date().toISOString(),
  73  |             updatedAt: new Date().toISOString(),
  74  |           },
  75  |         }),
  76  |       })
  77  |     })
  78  | 
  79  |     await setupAuth(page)
  80  |   })
  81  | 
  82  |   test('Instructor: Ver carnets de la ficha y descargar PDF completo', async ({ page }) => {
  83  |     // Navegar a carnets
  84  |     await page.goto('/aprendices/carnets')
  85  |     await page.waitForLoadState('networkidle')
  86  | 
  87  |     // Verificar que cargan los carnets
  88  |     await expect(page.getByText('Carnets · 2')).toBeVisible()
  89  | 
  90  |     // Esperar a que se generen los QRs (el contador readyCount)
  91  |     await expect(page.getByText('Generando códigos QR... 2/2')).toBeVisible({ timeout: 10000 })
  92  | 
  93  |     // Verificar botón de descarga PNG individual
  94  |     const downloadPNGButtons = page.getByText('Descargar PNG')
  95  |     await expect(downloadPNGButtons.first()).toBeVisible()
  96  | 
  97  |     // Verificar botón de exportar PDF
  98  |     const pdfButton = page.getByRole('button', { name: /PDF/ })
  99  |     await expect(pdfButton).toBeVisible()
  100 |     await expect(pdfButton).toBeEnabled()
  101 | 
  102 |     // Test descarga PDF
  103 |     const downloadPromise = page.waitForEvent('download')
  104 |     await pdfButton.click()
  105 |     const download = await downloadPromise
  106 |     expect(download.suggestedFilename()).toContain('carnets-ficha-2857520.pdf')
  107 |     console.log('✅ PDF descargado:', download.suggestedFilename())
  108 |   })
  109 | 
  110 |   test('Instructor: Descargar PNG individual de un carnet', async ({ page }) => {
  111 |     await page.route('**/rest/v1/aprendices*', async (route) => {
  112 |       console.log('Intercepted aprendices request:', route.request().url())
  113 |       await route.fulfill({
  114 |         status: 200,
  115 |         contentType: 'application/json',
  116 |         body: JSON.stringify([{
  117 |           id: '1',
  118 |           nombre: 'Juan',
  119 |           apellido: 'Pérez',
  120 |           documento: '1234567890',
  121 |           tipo_documento: 'CC',
  122 |           ficha: 2857520,
  123 |           centro: 'Centro Regional Bogotá',
  124 |           estado: 'activo',
  125 |           foto: null,
  126 |           created_at: new Date().toISOString(),
  127 |           updated_at: new Date().toISOString(),
  128 |         }]),
  129 |       })
  130 |     })
  131 | 
  132 |     await page.goto('/aprendices/carnets')
  133 |     await page.waitForLoadState('networkidle')
> 134 |     await expect(page.getByText('Generando códigos QR... 1/1')).toBeVisible({ timeout: 10000 })
      |                                                                 ^ Error: expect(locator).toBeVisible() failed
  135 | 
  136 |     // Descargar PNG individual
  137 |     const downloadPromise = page.waitForEvent('download')
  138 |     await page.getByText('Descargar PNG').first().click()
  139 |     const download = await downloadPromise
  140 |     expect(download.suggestedFilename()).toContain('carnet-1234567890.png')
  141 |     console.log('✅ PNG individual descargado:', download.suggestedFilename())
  142 |   })
  143 | })
  144 | 
  145 | test.describe('CUJ-MiCarnet: Aprendiz genera y descarga su carnet', () => {
  146 | 
  147 |   test('Aprendiz: Buscar por documento, ver carnet y descargar PNG', async ({ page }) => {
  148 |     // Mock: buscar aprendiz por documento - interceptar llamadas a la API real
  149 |     await page.route('**/rest/v1/aprendices*', async (route) => {
  150 |       console.log('Intercepted aprendices request:', route.request().url())
  151 |       await route.fulfill({
  152 |         status: 200,
  153 |         contentType: 'application/json',
  154 |         body: JSON.stringify([{
  155 |           id: '1',
  156 |           nombre: 'Juan',
  157 |           apellido: 'Pérez',
  158 |           documento: '1234567890',
  159 |           tipo_documento: 'CC',
  160 |           ficha: 2857520,
  161 |           centro: 'Centro Regional Bogotá',
  162 |           estado: 'activo',
  163 |           foto: null,
  164 |           created_at: new Date().toISOString(),
  165 |           updated_at: new Date().toISOString(),
  166 |         }]),
  167 |       })
  168 |     })
  169 | 
  170 |     // Ir a /mi-carnet (página pública sin auth)
  171 |     await page.goto('/mi-carnet')
  172 |     await page.waitForLoadState('networkidle')
  173 | 
  174 |     // Verificar página de búsqueda
  175 |     await expect(page.getByText('Mi Carnet SENA')).toBeVisible()
  176 |     await expect(page.getByPlaceholder('Ej: 1234567890')).toBeVisible()
  177 | 
  178 |     // Ingresar documento y buscar
  179 |     await page.fill('input[placeholder="Ej: 1234567890"]', '1234567890')
  180 |     await page.click('button:has-text("Buscar")')
  181 | 
  182 |     // Esperar a que aparezca el carnet
  183 |     await expect(page.getByText('Juan Pérez')).toBeVisible({ timeout: 10000 })
  184 |     await expect(page.getByText('CC: 1234567890')).toBeVisible()
  185 |     await expect(page.getByText('Ficha 2857520')).toBeVisible()
  186 | 
  187 |     // Verificar que el carnet se renderizó (canvas QR)
  188 |     await expect(page.locator('canvas')).toBeVisible()
  189 | 
  190 |     // Descargar carnet
  191 |     const downloadPromise = page.waitForEvent('download')
  192 |     await page.click('button:has-text("Descargar carnet")')
  193 |     const download = await downloadPromise
  194 |     expect(download.suggestedFilename()).toContain('carnet-1234567890.png')
  195 |     console.log('✅ Carnet aprendiz descargado:', download.suggestedFilename())
  196 |   })
  197 | 
  198 |   test('Aprendiz: Agregar foto con cámara y descargar carnet con foto', async ({ page }) => {
  199 |     await page.route('**/rest/v1/aprendices*', async (route) => {
  200 |       console.log('Intercepted aprendices request:', route.request().url())
  201 |       await route.fulfill({
  202 |         status: 200,
  203 |         contentType: 'application/json',
  204 |         body: JSON.stringify([{
  205 |           id: '2',
  206 |           nombre: 'María',
  207 |           apellido: 'González',
  208 |           documento: '0987654321',
  209 |           tipo_documento: 'TI',
  210 |           ficha: 2857520,
  211 |           centro: 'Centro Regional Bogotá',
  212 |           estado: 'activo',
  213 |           foto: null,
  214 |           created_at: new Date().toISOString(),
  215 |           updated_at: new Date().toISOString(),
  216 |         }]),
  217 |       })
  218 |     })
  219 | 
  220 |     await page.goto('/mi-carnet')
  221 |     await page.waitForLoadState('networkidle')
  222 | 
  223 |     await page.fill('input[placeholder="Ej: 1234567890"]', '0987654321')
  224 |     await page.click('button:has-text("Buscar")')
  225 | 
  226 |     await expect(page.getByText('María González')).toBeVisible({ timeout: 10000 })
  227 | 
  228 |     // Click en "Agregar foto" - abre CameraCapture
  229 |     await page.click('button:has-text("Agregar foto")')
  230 | 
  231 |     // El componente CameraCapture usa getUserMedia - en test headless no hay cámara real
  232 |     // Verificamos que se muestra el componente de cámara
  233 |     await expect(page.getByText(/Tomar foto|Capturar|Cámara/)).toBeVisible({ timeout: 5000 })
  234 | 
```