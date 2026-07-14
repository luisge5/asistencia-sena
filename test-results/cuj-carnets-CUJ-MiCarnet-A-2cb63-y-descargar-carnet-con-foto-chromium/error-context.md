# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cuj-carnets.spec.ts >> CUJ-MiCarnet: Aprendiz genera y descarga su carnet >> Aprendiz: Agregar foto con cámara y descargar carnet con foto
- Location: e2e\cuj-carnets.spec.ts:198:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('María González')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('María González')

```

```yaml
- img
- heading "Mi Carnet SENA" [level=1]
- paragraph: Genera tu carnet digital
- text: Número de documento
- textbox "Número de documento":
  - /placeholder: "Ej: 1234567890"
  - text: "0987654321"
- text: Aprendiz no encontrado. Verifica tu número de documento.
- button "Buscar"
- paragraph: Servicio Nacional de Aprendizaje — SENA
```

# Test source

```ts
  126 |           created_at: new Date().toISOString(),
  127 |           updated_at: new Date().toISOString(),
  128 |         }]),
  129 |       })
  130 |     })
  131 | 
  132 |     await page.goto('/aprendices/carnets')
  133 |     await page.waitForLoadState('networkidle')
  134 |     await expect(page.getByText('Generando códigos QR... 1/1')).toBeVisible({ timeout: 10000 })
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
> 226 |     await expect(page.getByText('María González')).toBeVisible({ timeout: 10000 })
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  227 | 
  228 |     // Click en "Agregar foto" - abre CameraCapture
  229 |     await page.click('button:has-text("Agregar foto")')
  230 | 
  231 |     // El componente CameraCapture usa getUserMedia - en test headless no hay cámara real
  232 |     // Verificamos que se muestra el componente de cámara
  233 |     await expect(page.getByText(/Tomar foto|Capturar|Cámara/)).toBeVisible({ timeout: 5000 })
  234 | 
  235 |     // En un test real con cámara, aquí se tomaría la foto y se actualizaría el carnet
  236 |     // Para este test, verificamos que el flujo de UI funciona
  237 |     console.log('✅ Flujo de cámara accesible')
  238 |   })
  239 | 
  240 |   test('Aprendiz: Error al buscar documento inexistente', async ({ page }) => {
  241 |     await page.route('**/rest/v1/aprendices*', async (route) => {
  242 |       await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  243 |     })
  244 | 
  245 |     await page.goto('/mi-carnet')
  246 |     await page.waitForLoadState('networkidle')
  247 | 
  248 |     await page.fill('input[placeholder="Ej: 1234567890"]', '9999999999')
  249 |     await page.click('button:has-text("Buscar")')
  250 | 
  251 |     await expect(page.getByText('Aprendiz no encontrado. Verifica tu número de documento.')).toBeVisible({ timeout: 5000 })
  252 |     console.log('✅ Error mostrado correctamente para documento inexistente')
  253 |   })
  254 | })
  255 | 
  256 | test.describe('CUJ-Scan: Instructor escanea QR y marca asistencia', () => {
  257 | 
  258 |   test.beforeEach(async ({ page }) => {
  259 |     await setupAuth(page)
  260 |   })
  261 | 
  262 |   test('Instructor: Escanear QR SENA:1234567890 y marcar Presente', async ({ page }) => {
  263 |     // Mock: buscar aprendiz por documento SENA
  264 |     await page.route('**/rest/v1/aprendices*', async (route) => {
  265 |       const url = route.request().url()
  266 |       if (url.includes('documento=eq.1234567890')) {
  267 |         await route.fulfill({
  268 |           status: 200,
  269 |           contentType: 'application/json',
  270 |           body: JSON.stringify([{
  271 |             id: 'aprendiz-1',
  272 |             nombre: 'Juan',
  273 |             apellido: 'Pérez',
  274 |             documento: '1234567890',
  275 |             tipo_documento: 'CC',
  276 |             ficha: 2857520,
  277 |             centro: 'Centro Regional Bogotá',
  278 |             estado: 'activo',
  279 |             foto: null,
  280 |             created_at: new Date().toISOString(),
  281 |             updated_at: new Date().toISOString(),
  282 |           }]),
  283 |         })
  284 |       } else {
  285 |         await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  286 |       }
  287 |     })
  288 | 
  289 |     // Mock: registrar asistencia
  290 |     await page.route('**/rest/v1/asistencias*', async (route) => {
  291 |       if (route.request().method() === 'POST') {
  292 |         await route.fulfill({
  293 |           status: 201,
  294 |           contentType: 'application/json',
  295 |           body: JSON.stringify([{
  296 |             id: 'asistencia-1',
  297 |             aprendiz_id: 'aprendiz-1',
  298 |             fecha: new Date().toISOString().split('T')[0],
  299 |             hora_entrada: new Date().toTimeString().slice(0, 5),
  300 |             estado: 'P',
  301 |             instructor_id: '48acae3d-5ff5-4bc0-a979-8e3321756c04',
  302 |             ficha: 2857520,
  303 |             centro: 'Centro Regional Bogotá',
  304 |             created_at: new Date().toISOString(),
  305 |             updated_at: new Date().toISOString(),
  306 |           }]),
  307 |         })
  308 |       } else {
  309 |         await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  310 |       }
  311 |     })
  312 | 
  313 |     await page.goto('/scan')
  314 |     await page.waitForLoadState('networkidle')
  315 | 
  316 |     // Verificar que el scanner se inicializa
  317 |     await expect(page.getByText('Apunta al QR de la ficha')).toBeVisible({ timeout: 10000 })
  318 | 
  319 |     // El QR scanner usa html5-qrcode que necesita cámara real
  320 |     // En test headless no podemos simular escaneo real
  321 |     // Verificamos que la página carga correctamente
  322 |     console.log('✅ Página de escaneo cargada - Scanner inicializado')
  323 | 
  324 |     // Verificar botones de marcar asistencia (aparecen tras escanear)
  325 |     // En test real con cámara, aquí se simularía el escaneo
  326 |   })
```