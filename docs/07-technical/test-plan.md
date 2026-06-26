# Test Plan · Asistencia SENA · Fase 1

**Versión:** 1.0
**Fecha:** 2026-05-23

---

## 1. Testing pyramid

| Nivel | Cantidad estimada | Herramienta |
|---|---|---|
| Unit (helpers JS cliente) | ~15 tests | Vitest (`[OPEN: confirmar Vitest vs Jest]`) |
| Unit (Apps Script helpers) | ~10 tests | clasp + función custom `runTests()` que invoca y compara |
| Integration (cliente ↔ backend con sheet de test) | ~8 tests | Playwright contra un sheet de testing |
| E2E (PWA real en device) | 5 critical journeys | Playwright + sheet de testing |
| Manual QA | checklist pre-release | Documentado debajo |

## 2. Coverage targets

- **Helpers críticos** (cálculos de stats, normalize, bogotaMidnight): 100% line coverage.
- **Vistas cliente** (render functions): smoke tests verifican no-throw + estructura.
- **Endpoints backend**: cada uno con happy + 2 unhappy paths.

## 3. Critical user journeys (E2E)

Las 5 journeys que MUST pasar en cualquier release:

### CUJ-1 · Setup inicial + primer marcado

1. Abrir PWA fresh (sin localStorage).
2. Configurar endpoint + ficha en modal de bienvenida.
3. Navegar a Hoy → ver padrón con 0 marcas.
4. Tocar Escanear → permitir cámara → escanear QR de aprendiz de test → ver tarjeta.
5. Tocar "Presente" → ver toast.
6. Volver a Hoy → ver aprendiz en "Ya marcados", hero `1/8 · 12.5%`.

**Pass criteria:** todos los pasos completan; estado del sheet refleja la marca con fecha/hora correctas en TZ Bogotá.

### CUJ-2 · Marcar masivamente desde la lista (sin escanear)

1. Abrir Hoy con padrón cargado.
2. Tocar botón inline P (Presente) en 3 aprendices.
3. Verificar que cada uno se mueve a "Ya marcados" con timestamp respectivo.
4. Hero card actualiza `3/8 · 37.5%`.

**Pass criteria:** 3 filas creadas en `Asistencias`; UI consistente.

### CUJ-3 · Undo

1. Marcar a un aprendiz como "Tarde" desde escaneo.
2. Toast aparece.
3. Tocar "deshacer" en el toast.
4. Verificar fila eliminada del sheet y UI revierte.

**Pass criteria:** sheet no tiene la fila; toast confirma deshecho.

### CUJ-4 · Offline + sync

1. App online con padrón cargado.
2. Cortar red (DevTools → Network Offline).
3. Marcar a 3 aprendices.
4. Banner naranja "Offline · 3 pendientes".
5. Restaurar red.
6. Verificar 3 toasts de sync exitoso; banner desaparece; sheet tiene las 3 marcas con timestamp ORIGINAL (no el de sync).

**Pass criteria:** timestamps en sheet coinciden con los del momento de marcar offline, no del momento de sync.

### CUJ-5 · Dashboard de riesgo

1. Cargar histórico de 10 días con datos sintéticos (1 aprendiz con racha 6, 1 con 3, resto sanos).
2. Abrir Histórico.
3. Verificar sección "Atención requerida · 2".
4. Verificar tabla detalle ordenable.
5. Verificar gráfica de patrones de semana.

**Pass criteria:** los 2 aprendices en riesgo aparecen en el orden esperado (mayor racha primero); pct correcto; gráfica muestra mejor/peor día con colores correctos.

## 4. QA checklist pre-release

### Funcional
- [ ] PWA instala en Chrome Android (prompt aparece tras 2 visitas).
- [ ] PWA instala en iOS Safari vía "Compartir → A pantalla inicio".
- [ ] Escaneo QR funciona con cámara real (no simulación).
- [ ] Marcas se reflejan en sheet en <2s online.
- [ ] Modo offline encola marcas; sincroniza al volver red.
- [ ] Undo funciona dentro de 3s.
- [ ] Búsqueda en padrón normaliza acentos.
- [ ] Histórico calcula racha y % correctamente.
- [ ] Export CSV descarga archivo válido.

### Accesibilidad
- [ ] Lighthouse Accessibility ≥95.
- [ ] TalkBack lee correctamente la vista Hoy + Escanear.
- [ ] Contraste de todos los pares fg/bg verificado.
- [ ] `prefers-reduced-motion` desactiva animaciones.

### Performance
- [ ] Lighthouse Performance ≥90.
- [ ] FCP ≤1.5s en 3G simulado.
- [ ] TTI ≤2.5s.

### Compatibilidad
- [ ] Chrome Android 110+.
- [ ] Safari iOS 16+.
- [ ] Edge Desktop.
- [ ] Firefox best-effort.

### Locale
- [ ] Todas las fechas en formato `dd/MM/yyyy`.
- [ ] TZ Bogotá en todas las celdas y respuestas JSON.
- [ ] Sin texto en inglés (excepto labels técnicos en console).

## 5. Performance test plan

- **Carga inicial:** medir con Lighthouse CI cada deploy a Vercel. Falla el build si Performance < 85.
- **Latencia backend:** test manual con `curl -w "%{time_total}"` a cada endpoint, target p95 < 1.5s.
- **Carga del cliente:** simular 30 marcas en 5 min para asegurar que no hay leaks de memoria ni degradación.

## 6. Security test plan

- **CSP:** verificar headers en producción con `curl -I`.
- **HTTPS:** Vercel garantiza, verificar.
- **XSS:** input de búsqueda no se inyecta como HTML (escapado via textContent, no innerHTML).
- **Endpoint exposure:** confirmar que el endpoint Apps Script no expone datos del sheet sin el query param `accion` válido.
- **localStorage clearing:** verificar que en modo incógnito el banner advierte.

## 7. Locale-specific tests (es_CO)

**Crítico — capturado del gotcha histórico:**
- [ ] Marcar una asistencia a las 22:00 Bogotá (≈03:00 UTC del día siguiente) → fila en `Asistencias.fecha` debe mostrar el día Bogotá, NO el día UTC.
- [ ] `Resumen.B3` Fecha de consulta = día actual Bogotá.
- [ ] Última asistencia registrada en Resumen muestra timestamp en TZ Bogotá.
- [ ] No hay celdas con `#ERROR!` en ninguna pestaña.
- [ ] Si setupSheet se ejecuta dos veces, sheet queda consistente.

## 8. Test data

Sheet de testing separado del sheet de producción del usuario. ID `[OPEN: crear sheet de testing en Drive del dev]`.

Padrón de testing:
- 8 aprendices con QRs imprimibles.
- 2 inactivos (para test de "Aprendiz inactivo").
- Historia sintética 10-30 días con patrones controlados.

## Cross-references

- `srd.md`, `frd.md`, `api-spec.md`, `data-model.md`.
- Backlog E1.7 — historias de implementación de tests.
