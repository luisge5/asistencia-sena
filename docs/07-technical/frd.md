# Functional Requirements Document (FRD) · Asistencia SENA · Fase 1

**Versión:** 1.0
**Fecha:** 2026-05-23

Decomposición funcional de cada FR del PRD en funciones (Fn) implementables. Cada Fn lleva inputs, outputs, comportamiento, errores, idempotencia, concurrencia, performance budget, test scenarios.

---

## Fn-001 · `scanQRCode()` — parent FR-001

**Trigger:** usuario en vista `#scan` con cámara abierta → `BarcodeDetector` detecta un patrón QR válido en el frame.
**Inputs:** stream de video (cámara), `BarcodeDetector` instance.
**Preconditions:** permiso de cámara concedido; `BarcodeDetector` o `html5-qrcode` disponible.
**Algorithm:**
1. Capturar el `raw_value` del QR detectado.
2. Validar formato: número entero entre 100,000 y 99,999,999 (rango de fichas SENA típicas) — descartar otros.
3. Vibrar 50ms (`navigator.vibrate(50)`).
4. Llamar `Fn-002 lookupAprendiz(ficha)`.
5. Si éxito → render tarjeta resultado en SCR-002.
6. Si "no encontrado" → render estado de error con CTA.
7. Pausar `BarcodeDetector` durante 2 segundos para evitar re-scan del mismo QR.
**Outputs:** UI actualizada (tarjeta resultado), evento `scan_complete`.
**Postconditions:** scanner pausado 2s; resultado visible.
**Side effects:** vibration, evento analytics, posible request HTTP a backend (vía Fn-002).
**Error cases:**
- EC-001-A · QR con valor no numérico → ignorar silenciosamente (continuar escaneando).
- EC-001-B · QR válido pero ficha no en padrón → mostrar "Ficha no encontrada".
- EC-001-C · `BarcodeDetector` lanza excepción → fallback a `html5-qrcode`.
**Idempotency:** sí — escanear el mismo QR dos veces es seguro (la marca no se duplica gracias a Fn-005).
**Concurrency:** N/A (UI single-thread).
**Performance budget:** ≤500ms desde detección a tarjeta visible.
**Test scenarios:**
- Happy: QR válido + ficha existente → tarjeta aparece.
- Unhappy A: QR válido + ficha no existente → mensaje "no encontrada".
- Unhappy B: QR de otro formato (URL, vCard, etc.) → ignorado.
- Unhappy C: `BarcodeDetector` no disponible → fallback funciona.

## Fn-002 · `lookupAprendiz(ficha)` — parent FR-001, FR-002

**Trigger:** llamada de Fn-001 (scan) o desde búsqueda en SCR-003.
**Inputs:** `ficha: string`.
**Preconditions:** endpoint configurado en settings.
**Algorithm:**
1. Si offline → buscar en `localStorage["cache_padron"]` y retornar si hit.
2. Si online → `GET ${ENDPOINT}?accion=consultar&num=${ficha}`.
3. Parsear respuesta JSON.
4. Si `{ok:true, encontrado:true, activo:true}` → retornar `aprendiz`.
5. Si `{ok:true, encontrado:false}` → retornar `null`.
6. Si `{ok:true, encontrado:true, activo:false}` → retornar `{...aprendiz, _inactive: true}`.
7. Si network error → retry 1 vez con 1s delay; si falla, throw NetworkError.
**Outputs:** `aprendiz` object o `null`.
**Postconditions:** cache de aprendiz actualizado si fue lookup exitoso.
**Side effects:** HTTP request, cache write.
**Error cases:**
- EC-002-A · Network timeout (5s) → throw.
- EC-002-B · Backend retorna `{ok:false, error:"..."}` → throw con mensaje.
**Idempotency:** trivialmente idempotente (read-only).
**Performance budget:** online ≤500ms; cache hit ≤5ms.
**Test scenarios:** happy, no encontrada, inactivo, network timeout.

## Fn-003 · `markAttendance(ficha, estado)` — parent FR-005

**Trigger:** usuario toca botón de estado (P/T/J) tras scan o en lista.
**Inputs:** `ficha: string`, `estado: "Presente"|"Tarde"|"Justificado"|"Ausente"`.
**Preconditions:** ficha existe en padrón; estado válido.
**Algorithm:**
1. Generar `marca_id = crypto.randomUUID()` (client-side).
2. Capturar `timestamp_local = new Date().toISOString()` en TZ Bogotá.
3. Crear objeto `marca = {ficha, estado, timestamp_local, marca_id}`.
4. UI optimista: actualizar `HOY` local + render.
5. Mostrar toast verde "<estado> · <nombre> · deshacer".
6. Vibrar 100ms.
7. Almacenar `marca` en `localStorage["pending_marks"]`.
8. Trigger Fn-009 sync (no bloqueante).
9. Establecer `LAST_ACTION = {marca, previous_state}` para undo.
**Outputs:** UI actualizada; toast visible.
**Postconditions:** marca en cola local; UI refleja el cambio.
**Side effects:** localStorage write, vibration, toast, posible HTTP request.
**Error cases:**
- EC-003-A · localStorage lleno → fallar gracefully + alerta al usuario.
- EC-003-B · Backend rechaza al sincronizar → marca queda con flag `failed` + notif al usuario.
**Idempotency:** garantizada server-side por `marca_id` (UUID único). Re-enviar la misma marca dos veces es no-op.
**Concurrency:** N/A.
**Performance budget:** ≤80ms tap a feedback visible (UI optimista).
**Test scenarios:**
- Happy online · marca + sync inmediato.
- Happy offline · marca + queued + sync al volver.
- Unhappy · backend rechaza por validación → flag failed.
- Unhappy · sync de marca duplicada (mismo UUID) → backend retorna ok, no duplica.

## Fn-004 · `undoLastMark()` — parent FR-006

**Trigger:** usuario toca "deshacer" en toast (3s window).
**Inputs:** ninguno (lee `LAST_ACTION`).
**Preconditions:** `LAST_ACTION` definido y dentro del window.
**Algorithm:**
1. Si `LAST_ACTION.marca` aún en `pending_marks` (no sincronizada) → removerla; estado revierte; toast confirmación.
2. Si ya sincronizada → `GET ${ENDPOINT}?accion=undo&marca_id=${id}`.
3. En éxito → revertir `HOY` local al `previous_state`.
4. Limpiar `LAST_ACTION`.
**Outputs:** UI revertida; toast "deshecho".
**Postconditions:** estado vuelve al previo; ninguna marca afectada en backend.
**Side effects:** HTTP request (si ya sincronizada); localStorage write.
**Error cases:**
- EC-004-A · Backend ya no encuentra la marca → toast "no se pudo deshacer".
- EC-004-B · Network falla durante undo → marca queda pendiente de undo, retry.
**Idempotency:** server-side: undo del mismo `marca_id` dos veces es no-op.
**Performance budget:** ≤500ms online; ≤50ms offline.
**Test scenarios:** undo de marca local (no sincronizada); undo de marca sincronizada; undo dos veces seguidas (segundo es no-op).

## Fn-005 · `registrarBackend({ficha, estado, timestamp_local, marca_id})` — parent FR-005, server-side

**Trigger:** request HTTP `?accion=registrar`.
**Inputs:** params query: `num`, `estado`, `marca_id`, `timestamp_local`, opcional `instructor_id`, `grupo`.
**Preconditions:** params completos y válidos.
**Algorithm (Apps Script):**
1. Validar `num` ≥6 dígitos, `estado` en lista válida, `marca_id` UUID-ish.
2. Llamar `consultar(num)` interno.
3. Si no encontrado → retornar `{ok:true, registrado:false, motivo:"Ficha no encontrada"}`.
4. Si inactivo → retornar `{ok:true, registrado:false, motivo:"Aprendiz inactivo"}`.
5. Buscar fila existente en `Asistencias` con `marca_id == provided` → si existe, no-op (idempotencia).
6. Buscar fila existente para `(ficha, fecha_de_timestamp_local, instructor_id)` → si existe, UPDATE estado; si no, INSERT.
7. Si INSERT: row = `[bogotaMidnight(ts), ts, ficha, nombre, estado, grupo, instructor_id, marca_id]`.
8. `setNumberFormat` por celda recién creada.
9. Llamar `refreshResumen()` (post-mark hook).
10. Retornar `{ok:true, registrado:true, ficha, nombre, ..., marcaTemporal}`.
**Outputs:** JSON.
**Side effects:** escritura al sheet, refresh del Resumen.
**Error cases:**
- EC-005-A · Estado inválido → `{ok:false, error:"estado inválido"}`.
- EC-005-B · Sheet no accesible → `{ok:false, error:"sheet bloqueado"}`.
**Idempotency:** garantizada por `marca_id`.
**Concurrency:** Apps Script serializa requests del mismo proyecto → no race condition entre marcas concurrentes del mismo usuario.
**Performance budget:** ≤1.5s p95 incluyendo refresh.
**Test scenarios:**
- Happy nuevo → INSERT.
- Happy cambio de estado → UPDATE.
- Idempotente · misma marca_id 2x → no-op.
- Unhappy · ficha no encontrada.
- Unhappy · aprendiz inactivo.

## Fn-006 · `computeStats()` — parent FR-008

**Trigger:** carga de vista `#historico`.
**Inputs:** desde backend `?accion=stats&dias=10` retorna array de aprendices con sus métricas.
**Preconditions:** padrón + historial accesibles.
**Algorithm (backend Apps Script):**
1. Leer todas filas de `Asistencias` con `fecha >= today - 10 días`.
2. Agrupar por `ficha`.
3. Para cada ficha:
   - `total_dias` = días lectivos en periodo (excluye festivos / sábados / domingos si aplica).
   - `presente` = count de `Presente`.
   - `tarde` = count de `Tarde`.
   - `justificado` = count de `Justificado`.
   - `ausente` = count de `Ausente`.
   - `dias_validos` = `total_dias - justificado`.
   - `pct` = `(presente + tarde) / dias_validos * 100`, rounded.
   - `racha_actual` = consecutive `Ausente` contando desde el día más reciente.
   - `racha_max` = longest streak de `Ausente`.
   - `ausencias_disco` = `ausente - racha_actual`.
   - `en_riesgo` = `pct < 80 || racha_actual >= 3`.
4. Retornar array.
**Outputs:** JSON con array de stats por aprendiz.
**Side effects:** N/A (read-only).
**Error cases:**
- EC-006-A · Datos corruptos (fila con fecha inválida) → log y skip; respuesta marca `data_quality_warning: true`.
**Idempotency:** trivialmente idempotente.
**Performance budget:** ≤2s para padrón de 30 + 10 días.
**Test scenarios:**
- Aprendiz con 100% asistencia.
- Aprendiz con racha actual 5.
- Aprendiz con todas justificadas.
- Padrón con aprendiz nuevo (sin historia).

## Fn-007 · `refreshResumen()` — parent FR-007, server-side

**Trigger:** invocado al final de `registrar`, `applyTimezoneFix`, o manualmente.
**Inputs:** ninguno (lee sheet).
**Algorithm:**
1. Calcular: fecha hoy, # activos, # total, # asistencias hoy, # faltantes hoy, última marca.
2. Escribir a pestaña `Resumen` con `setValue` (no `setFormula` — ver ADR-005).
**Outputs:** sheet actualizado.
**Performance budget:** ≤1s.
**Idempotency:** sí (idempotente trivial — overwrite).
**Test scenarios:** sheet vacío, sheet con datos, sheet con muchas filas (~1000).

## Fn-008 · `searchPadron(query)` — parent FR-002

**Trigger:** usuario teclea en search input de SCR-003.
**Inputs:** `query: string`.
**Algorithm:**
1. Normalize: lowercase + NFD + remove diacritics + trim.
2. Filtrar `cache_padron` por `nombre.includes(qn) || ficha.includes(qn)`.
3. Retornar lista filtrada en orden alfabético.
**Outputs:** array de aprendices.
**Performance budget:** ≤50ms para padrón de 100.
**Idempotency:** trivial.
**Test scenarios:** query vacío → todos; query con acento → normaliza; query sin match → array vacío.

## Fn-009 · `syncPendingMarks()` — parent FR-013

**Trigger:** `online` event, ping periódico cada 30s, o post-mark trigger.
**Inputs:** `localStorage["pending_marks"]`.
**Algorithm:**
1. Si offline → return.
2. Si queue vacía → return.
3. Para cada `marca` en queue (FIFO):
   - POST a `?accion=registrar&num=...&marca_id=...&timestamp_local=...&estado=...`.
   - Si éxito → remove de queue.
   - Si falla por validación → marcar como `failed`; siguiente.
   - Si falla por red → break el loop (esperar próximo trigger).
4. Update banner de "pendientes".
**Outputs:** queue limpia (al menos parcialmente).
**Side effects:** HTTP requests, localStorage writes, UI banner update.
**Concurrency:** semáforo `is_syncing` para evitar reentrada.
**Performance budget:** procesa hasta 50 marcas en 30s.
**Test scenarios:**
- Queue de 1 marca · sync exitoso.
- Queue de 5 marcas · todas exitosas.
- Queue con 1 marca inválida → resto sigue, la inválida queda con flag.
- Re-trigger durante sync activo · semáforo previene reentrada.

## Fn-010 · `installPWA()` / `serviceWorker` — parent FR-011

**Trigger:** primera carga + cada update del SW.
**Algorithm:**
1. Registrar SW desde `sw.js`.
2. SW `install` event → cachear shell.
3. SW `fetch` event → estrategia "network-first" para data (`/exec?accion=...`), "cache-first" para shell.
4. SW `activate` event → limpiar caches viejos.
5. Cliente escucha `beforeinstallprompt` (Chrome) → guarda evento → renderiza botón "Instalar" si aplica.
6. Tap "Instalar" → prompt nativo → resultado guardado en analytics.
**Outputs:** PWA instalable + offline functional.
**Test scenarios:** install fresh, update SW, iOS no-prompt fallback.

## Fn-011 · `exportCSV(fechaDesde, fechaHasta)` — parent FR-009

**Trigger:** usuario toca "Exportar CSV" en SCR-004.
**Inputs:** rango de fechas.
**Algorithm:**
1. `GET ?accion=export&desde=YYYY-MM-DD&hasta=YYYY-MM-DD`.
2. Backend lee `Asistencias` filtrado, construye CSV en memoria con headers `fecha,ficha,nombre,estado,hora`.
3. Retorna como `text/csv` con `Content-Disposition: attachment; filename=asistencia-...csv`.
4. Cliente recibe → `Blob` → `URL.createObjectURL` → `<a download>` click.
**Performance budget:** ≤5s para 1 año (~7,500 filas).
**Test scenarios:**
- Periodo vacío · CSV con solo header.
- Periodo 1 mes · ~750 filas.
- Periodo 1 año · ~7,500 filas (cercano al timeout).

## Cross-references

- PRD `04-product-requirements.md` §4 — features parents.
- `api-spec.md` — contratos HTTP.
- `data-model.md` — schema de Asistencias.
- ADRs — decisiones que estas funciones materializan.
