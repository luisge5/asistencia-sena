# Product Requirements Document · Asistencia SENA · v1 (PWA · Fase 1)

**Versión:** 1.0
**Fecha:** 2026-05-23
**Cubre:** Fase 1 (MVP PWA) a profundidad de acceptance criteria. Fase 2 y 3 referenciadas a nivel de intención + gate.

---

## 1. Overview

Asistencia SENA Fase 1 es una **PWA mobile-first** que reemplaza al cliente Android (App Inventor) existente, conservando el backend Google Apps Script y la fuente de verdad en Google Sheets. Aporta sobre el cliente actual: (a) cuatro estados de asistencia en lugar de solo "Presente" hardcoded, (b) dashboard analítico con detección de rachas y aprendices en riesgo, (c) instalación instantánea sin Play Store / sin APK, (d) modo offline con cola de marcas, (e) undo de la última acción [from: 01-product-vision.md §6 principios].

El "WHAT" de este PRD es la versión navegable del prototipo `prototipo-pwa.html`: 5 vistas (Hoy / Escanear / Aprendices / Histórico / Ajustes) sobre la misma estructura de sheet con dos pestañas (`Aprendices` padrón, `Asistencias` log). El "WHY" está en el PVD; el "HOW" en ADRs + Design Doc + SRD/FRD.

Este documento cubre **solo Fase 1**. Fase 2 (multi-ficha + coordinador) y Fase 3 (vista de aprendiz + integración SENA) tienen intención y gate definidos en §8 pero **sin features specs** — eso sería ficción [from: SKILL.md §Phase-depth policy].

## 2. User personas

### Persona 1 — Instructor titular (primaria · diseño se optimiza para esta)

**Nombre arquetípico:** Luis Gómez · 42 años · instructor SENA ADSI (Análisis y Desarrollo de Sistemas) en regional La Guajira [ASSUMPTION: persona inferida del contexto del usuario real "jjzoto@gmail.com" + arquetipo SENA La Guajira; nombre ficticio].

**Daily context:** dicta una ficha de 25-30 aprendices, jornada mañana (07:00-12:00), aula con WiFi institucional ocasionalmente inestable. Carga su propio Android mid-range (Samsung A-series o equivalente, Chrome instalado). No tiene asistente. Antes de la app digital, llenaba planilla de papel y la entregaba al final del trimestre.

**Primary goals:**
1. Registrar asistencia diaria en menos de 30 segundos por aula completa, sin interrumpir el inicio de la sesión.
2. Detectar tempranamente a aprendices con riesgo de deserción para intervenir personalmente (llamar, citar, reportar a coordinación).
3. Generar el reporte trimestral de asistencia que pide el coordinador sin trabajo manual adicional.

**Pain points actuales:**
1. La planilla de papel se pierde, se moja, no se puede consultar fuera del aula.
2. No se ve quién lleva días faltando porque cada fecha es una columna nueva y nadie revisa todo el trimestre seguido.
3. Consolidar el reporte final implica contar a mano fila por fila.
4. La app actual (App Inventor) requiere el Companion encendido cada mañana — fricción que hace que algunos días simplemente no la use.

**Tech literacy:** Media. Sabe usar Google Sheets, WhatsApp, navegar Drive, instalar apps. No sabe (ni quiere saber) qué es Apps Script, qué es una API, qué es un service worker.

**Decision-making power:** Alta dentro de su aula; nula a nivel institucional (el SENA decide qué sistema oficial usar).

**Frequency of use:** Diario al inicio de la sesión (1 vez/día), + revisión rápida 1-2 veces por semana del dashboard para detectar rachas.

**Devices/contexts:** Android personal en el aula. Eventualmente revisa el sheet desde su laptop en casa.

**Anti-personas — para quién NO diseñamos:**
- **No** diseñamos para un administrador SENA institucional (esa es eventualmente Fase 3+ y otra persona distinta).
- **No** diseñamos para el aprendiz (eventualmente Fase 3, vista de autoconsulta — pero NO ahora).
- **No** diseñamos para instructores con > 100 aprendices simultáneos (escala enterprise, no es Fase 1).

### Persona 2 — Coordinador académico (secundaria · Fase 2)

**Nombre arquetípico:** Maritza Rojas · 50 años · coordinadora académica regional · supervisa 8 instructores y ~250 aprendices.

[PHASE-DEFERRED: Fase 2 — persona se mantiene en outline pero no se diseñan features específicas para ella en Fase 1. Vista consolidada de fichas, alertas push, exports cross-ficha → todo Fase 2 al cumplir el gate. El hook arquitectónico que reserva esta extensibilidad: columna `instructor_id` en Asistencias desde Fase 1 (ver ADR-006).]

### Persona 3 — Aprendiz (terciaria · Fase 3)

[PHASE-DEFERRED: Fase 3 — vista de autoconsulta del aprendiz. Hook reservado: columna `documento` en Aprendices permite búsqueda futura por documento del aprendiz, sin tener que renombrar nada. Ver ADR-006.]

## 3. User stories (high-level)

Cubren la persona primaria (Instructor) en Fase 1. Cada una se descompone en historias del Backlog.

1. **US-001** — Como instructor, quiero ver al abrir la app cuántos aprendices ya marqué hoy y cuántos faltan, para saber dónde voy en la sesión.
2. **US-002** — Como instructor, quiero escanear el QR de un aprendiz y marcarlo Presente en 2 toques, para ser rápido al inicio de la sesión.
3. **US-003** — Como instructor, quiero marcar a un aprendiz como Tarde / Justificado / Ausente sin escanear, para los casos donde no traen carnet o ya estoy llenando a mano.
4. **US-004** — Como instructor, quiero deshacer mi última marca, porque me equivoco a veces (confusión entre dos aprendices, presioné el botón equivocado).
5. **US-005** — Como instructor, quiero ver una lista de los aprendices que faltan por marcar, con botones rápidos por estado, para terminar la sesión sin escanear uno por uno cuando ya conozco al grupo.
6. **US-006** — Como instructor, quiero ver el padrón completo de mis aprendices con foto, búsqueda y estado del día, para identificar rápidamente a alguien que llegó tarde.
7. **US-007** — Como instructor, quiero un dashboard analítico que me muestre quiénes están en riesgo (racha de inasistencias o % bajo del umbral SENA), para intervenir antes de que sea muy tarde.
8. **US-008** — Como instructor, quiero ver el histórico de mis sesiones recientes con % de asistencia por día y patrones de la semana (qué día se ausentan más), para entender comportamientos del grupo.
9. **US-009** — Como instructor, quiero que la app funcione sin internet temporalmente y sincronice cuando vuelve la red, porque el WiFi del aula a veces se cae.
10. **US-010** — Como instructor, quiero instalar la app en mi pantalla de inicio como cualquier otra app, sin Play Store ni APK, para no depender del Companion.
11. **US-011** — Como instructor, quiero exportar el histórico a CSV, para entregar el reporte trimestral al coordinador sin reescribir datos.
12. **US-012** — Como instructor, quiero configurar el umbral horario que separa "Presente" de "Tarde", porque cada jornada empieza diferente.
13. **US-013** — Como instructor, quiero que mi sesión y datos sigan vivos aunque cierre la app y la vuelva a abrir, sin volver a configurar nada.

## 4. Features (functional requirements)

Features Fase 1 agrupadas por área. Cada feature lleva los 12 sub-fields obligatorios.

### Área A — Registro de asistencia

#### FR-001 · Escanear QR de ficha

**Descripción:** El usuario abre la vista Escanear, apunta la cámara del celular al QR impreso en el carnet o pantalla de un aprendiz, y el sistema lee el código (que contiene el número de ficha), busca al aprendiz en el padrón, y presenta su tarjeta con foto + datos + 3 botones de estado. El uso primario está al inicio de la sesión cuando los aprendices llegan secuencialmente [from: prototipo §VIEWS.scan].

**User-facing behavior:** El instructor toca "Escanear" en el bottom nav → la cámara se abre full-screen con un marco guía y línea de scan animada → apunta al QR del aprendiz → al detectar el QR el sistema vibra el cel brevemente y muestra una tarjeta con la foto del aprendiz, ficha, documento y 3 botones grandes (Presente verde · Tarde naranja · Justificado azul) → el instructor toca uno → toast verde aparece confirmando la marca con opción "deshacer" durante 3 segundos.

`[example — illustrative]` Maria llega tarde a la sesión de Luis. Luis está en la vista Hoy. Toca el botón Escanear, apunta la cámara al carnet de Maria, la cámara detecta `120544` en el QR, sale la tarjeta con foto de Maria, Luis toca el botón naranja "Tarde", el toast confirma y Maria queda registrada como Tarde a las 07:34. Tiempo total: ~8 segundos.

**Acceptance criteria:**
- [ ] AC-001-1 · La vista Escanear pide permiso de cámara al primer uso; si se deniega muestra fallback a búsqueda por ficha.
- [ ] AC-001-2 · Al detectar un QR con un número que existe en `Aprendices`, la tarjeta de resultado aparece en ≤500ms.
- [ ] AC-001-3 · Al detectar un QR con un número que NO existe en `Aprendices`, el sistema muestra error "Ficha no encontrada" con un botón "agregar nuevo aprendiz" (Fase 1.5) o "cancelar".
- [ ] AC-001-4 · Los 3 botones de estado son ≥48×48dp (touch target estándar Android).
- [ ] AC-001-5 · Tras marcar, el sistema NO cierra la cámara automáticamente — espera a que el instructor toque "siguiente" para escanear otro QR (evita re-escaneo accidental del mismo QR).

**Edge cases:**
- EC-001-1 · QR borroso / mal impreso / con reflejos: el escáner reintenta hasta 3 segundos y luego sugiere búsqueda manual.
- EC-001-2 · Aprendiz ya marcado hoy: la tarjeta muestra el estado actual + opción de cambiarlo (mismo flow que primer marcado).
- EC-001-3 · Conexión perdida en el momento del marcado: la marca se encola en localStorage; el toast muestra "marcado offline · se sincronizará".

**Error states:**
- ES-001-1 · Sin permiso de cámara: pantalla con botón "habilitar permiso" + fallback a búsqueda por ficha en el textbox.
- ES-001-2 · Cámara ocupada por otra app: mensaje "cierra la otra app que usa cámara" + reintentar.
- ES-001-3 · Backend caído: marca se encola, toast informa "registrado localmente, sincroniza cuando vuelva la red".

**Dependencies:** FR-002 (búsqueda por ficha como fallback), FR-005 (marcar estado), FR-013 (offline queue). External: cámara del dispositivo, BarcodeDetector API (Chrome Android) o `html5-qrcode` (fallback iOS).

**Priority:** Must.

**Priority rationale:** Es el flujo primario de uso. Sin esta feature la app se reduce a una planilla digital genérica — perdería el diferencial de velocidad [from: PVD §6.2 principio "velocidad del registro"].

**Cross-references:**
- ADR-001 (PWA vs APK) — explica por qué se puede usar cámara nativa del navegador
- ADR-004 (offline strategy) — explica el encolamiento
- Design Doc §SCR-002 (pantalla Escanear)
- Backlog Epic E1.1 (registro de asistencia)

**Metrics:**
- Evento `scan_complete` con props `{result: "ok" | "not_found" | "cancelled", duration_ms}`.
- Tasa de éxito objetivo: ≥95% de escaneos terminan con marca registrada.

---

#### FR-002 · Buscar aprendiz por ficha o nombre

**Descripción:** En la vista Aprendices, un campo de búsqueda permite filtrar el padrón por número de ficha o por nombre (substring, case-insensitive, normaliza acentos). Cada resultado muestra avatar + datos + estado del día (pill) o botón "Marcar" si aún no se ha marcado [from: prototipo §VIEWS.aprendices].

**User-facing behavior:** Instructor toca tab Aprendices → ve el padrón completo de 8+ aprendices → toca el campo "Buscar" → el teclado se abre → escribe "Pedro" → la lista se filtra a aprendices cuyo nombre o ficha contengan "Pedro" → toca "Marcar" en la fila de Pedro Luis Gómez → toast verde confirma "Presente · Pedro" + undo.

`[example — illustrative]` Luis está en clase, ve a Pedro entrando. Va a la app, toca Aprendices, escribe "Pe", aparece Pedro Luis Gómez, toca el botón "Marcar" oscuro al lado de su nombre. Tiempo: ~5 segundos sin necesidad de escanear.

**Acceptance criteria:**
- [ ] AC-002-1 · El input de búsqueda es sticky en el tope al hacer scroll.
- [ ] AC-002-2 · La búsqueda filtra en vivo (en cada keystroke), debounce 80-120ms.
- [ ] AC-002-3 · La búsqueda normaliza acentos: "Maria" matchea "María".
- [ ] AC-002-4 · Si no hay resultados, muestra "Sin resultados para '<query>'" en lugar de lista vacía silenciosa.
- [ ] AC-002-5 · Los aprendices ya marcados muestran pill de estado; los no marcados muestran botón "Marcar" (default Presente — tap-marcar como Presente directo).
- [ ] AC-002-6 · El padrón se ordena alfabéticamente por nombre por default; ordenamiento alternativo por ficha disponible vía settings (Fase 1.5).

**Edge cases:**
- EC-002-1 · Padrón con > 100 aprendices (no Fase 1, pero el diseño debe escalar): virtualización de lista si lista > 50.
- EC-002-2 · Query con solo espacios: tratado como vacío, muestra lista completa.
- EC-002-3 · Aprendices marcados como "activo=NO" en sheet (inactivos): no aparecen en padrón por default [from: `merged.gs` consultar() ya filtra esto].

**Error states:**
- ES-002-1 · Backend no responde al cargar padrón: muestra padrón cacheado en localStorage + toast "Datos pueden estar desactualizados".
- ES-002-2 · Padrón vacío (sheet recién creado sin aprendices): pantalla con "Aún no hay aprendices · agregar primero" + link a sheet.

**Dependencies:** Backend endpoint `?accion=listaPadron` (nuevo — ver API spec), localStorage cache.

**Priority:** Must.

**Priority rationale:** Es el fallback obligatorio cuando el escáner no funciona (QR roto, sin carnet, sin permiso de cámara). Sin esta feature la app falla cuando falla la cámara [from: PVD §6.2].

**Cross-references:**
- FR-001 (escaneo · alternativa primaria)
- FR-005 (marcar estado)
- ADR-003 (cache local)
- Design Doc §SCR-003 (pantalla Aprendices)
- Backlog E1.2

**Metrics:**
- Evento `search_query` con `{query_length, results_count, selected_result_index}`.
- Tasa de uso búsqueda vs escaneo: objetivo 60% escaneo / 40% búsqueda (la búsqueda nunca debería ser >60% — si lo es, el escaneo está roto).

---

#### FR-003 · Marcar con un toque desde la lista de faltantes (vista Hoy)

**Descripción:** En la vista Hoy, los aprendices que faltan por marcar aparecen en una sección con avatars y **3 botones de acción inline (P/T/J)** a la derecha de cada nombre. Un solo toque marca al aprendiz y la fila desaparece de "Faltan" y aparece en "Ya marcados" [from: prototipo §VIEWS.hoy].

**User-facing behavior:** Instructor abre la app → vista Hoy → ve "Faltan por marcar · 5 de 8" con cards de los 5 faltantes → al lado de cada nombre hay 3 botones (verde check, naranja reloj, azul escudo) → toca el verde en la fila de Andrés → toast "Presente · Andrés" + undo → la card de Andrés se mueve a la sección "Ya marcados" con pill verde y la hora "07:42".

**Acceptance criteria:**
- [ ] AC-003-1 · Los 3 botones inline son ≥36×36px cada uno (visualmente compactos pero touch-safe).
- [ ] AC-003-2 · Cada botón muestra el color del estado correspondiente (verde / naranja / azul).
- [ ] AC-003-3 · El touch produce feedback visual <100ms (scale 0.95 en active state).
- [ ] AC-003-4 · Al marcar, la fila se anima fuera de "Faltan" con duración 220ms y aparece en "Ya marcados" sin interrupción.
- [ ] AC-003-5 · La sección "Ya marcados" lista las marcas en orden cronológico (más reciente arriba).
- [ ] AC-003-6 · Si el usuario marca todos, "Faltan" se reemplaza por una pantalla de "Todos marcados" con un check verde.

**Edge cases:**
- EC-003-1 · El instructor toca dos botones de la misma fila en rápida sucesión (cambio de opinión): solo el último toca cuenta.
- EC-003-2 · Más de 30 faltantes en pantalla: la lista es scrolleable, padron limit OK.
- EC-003-3 · Estado "Ausente" no aparece como botón inline (los 3 botones son P/T/J — Ausente es por exclusión: quien no haya sido marcado al final del día queda Ausente implícito si esa configuración está activa) [ASSUMPTION: regla "Ausente implícito al cierre del día" mencionada en conversación; `[OPEN: confirmar si Ausente se marca manualmente o por exclusión al cierre]`].

**Error states:**
- ES-003-1 · Backend rechaza la marca: toast rojo "no se pudo registrar · reintentar" + auto-retry 3 veces con backoff.
- ES-003-2 · Marca enviada pero respuesta perdida: idempotencia del backend garantiza no-duplicado (ver ADR-005 cross-fase).

**Dependencies:** FR-005 (mecanismo de marcar), FR-006 (undo).

**Priority:** Must.

**Priority rationale:** Es el patrón de uso esperado para el 60-80% de los aprendices ya conocidos por el instructor. Sin esta feature la app obliga a escanear cada uno, lo cual rompe el objetivo de velocidad [from: PVD §6.2; principio Fase 1].

**Cross-references:**
- FR-005, FR-006
- Design Doc §SCR-001 (vista Hoy)
- ADR-002 (PWA stack — Tailwind + vanilla JS)
- Backlog E1.1

**Metrics:**
- Evento `mark_inline` con `{state, ficha_hash, source: "hoy_inline_button"}`.
- Tasa de marcado via inline vs escaneo vs búsqueda: objetivo inline ≥40% en estado estable.

---

#### FR-005 · Asignar estado de asistencia (Presente / Tarde / Justificado / Ausente)

**Descripción:** Cuatro estados predefinidos. Cada marca de asistencia almacena el estado en la columna `estado` de `Asistencias`. "Presente" es el default cuando se usa el botón "Marcar" sin más selección [from: prototipo §ESTADOS].

**User-facing behavior:** El estado se elige en uno de 3 contextos: (a) tras escaneo de QR — 3 botones grandes (Presente/Tarde/Justificado); (b) inline en vista Hoy — 3 botones pequeños mismas opciones; (c) en vista Aprendices con botón "Marcar" — marca Presente directo. "Ausente" se aplica por defecto al cierre del día a quien no haya sido marcado, o manualmente con swipe en la lista (Fase 1.5).

**Acceptance criteria:**
- [ ] AC-005-1 · Los 4 estados son: `Presente`, `Tarde`, `Justificado`, `Ausente` (string exacto, con tilde, mayúscula inicial) — coincide con la validación del sheet [from: `merged.gs` `estadoValidation`].
- [ ] AC-005-2 · El color asociado es: Presente=verde `#16A34A`, Tarde=naranja `#D97706`, Justificado=azul `#0369A1`, Ausente=rojo `#DC2626`.
- [ ] AC-005-3 · El sheet rechaza cualquier valor fuera de los 4 (data validation existente del Sheet).
- [ ] AC-005-4 · Cambiar el estado de un aprendiz ya marcado actualiza la fila (no crea fila nueva) — idempotencia por ficha + fecha.

**Edge cases:**
- EC-005-1 · Aprendiz inactivo (`activo=NO` en padrón): no se le puede marcar; el backend rechaza con motivo "Aprendiz inactivo" [from: `merged.gs` registrar() línea ~102].
- EC-005-2 · Misma ficha registrada por dos instructores en el mismo día (Fase 2 multi-instructor): última marca gana, ambas quedan en audit log [PHASE-DEFERRED: Fase 2].
- EC-005-3 · Cambio de estado de Presente a Ausente: típicamente un error del instructor — el undo en lugar de cambio de estado es preferible. UI debe disuadir o pedir confirmación.

**Error states:**
- ES-005-1 · Valor inválido enviado (debería ser imposible desde UI): backend retorna `{ok:false, error:"estado inválido"}`.

**Dependencies:** Backend `?accion=registrar` extendido con parámetro `estado` (hoy hardcoded "Presente" — ver ADR-005).

**Priority:** Must.

**Priority rationale:** Sin los 4 estados se pierde el diferencial vs la app actual (App Inventor solo registra Presente hardcoded). Tarde / Justificado son necesarios para reportes precisos al coordinador [from: GUIA-ANDROID.md sección "Mapeo de datos" muestra el hardcoded actual].

**Cross-references:**
- FR-001, FR-002, FR-003
- ADR-005 (extender API registrar)
- Data Model §entity Asistencia
- Backlog E1.1

**Metrics:**
- Distribución de estados: % Presente / % Tarde / % Justificado / % Ausente diario.

---

#### FR-006 · Deshacer última marca

**Descripción:** Cada marca generada vía la app produce un toast con botón "deshacer" durante 3 segundos. Tras este toast, la única forma de revertir es ir al sheet directamente o re-marcar [from: prototipo §LAST_ACTION].

**Acceptance criteria:**
- [ ] AC-006-1 · El toast aparece dentro de 100ms tras la marca.
- [ ] AC-006-2 · El botón "deshacer" tiene contraste WCAG AA contra el fondo del toast.
- [ ] AC-006-3 · Tras los 3 segundos sin interacción, el toast desaparece y el undo ya no está disponible desde la UI.
- [ ] AC-006-4 · Undo revierte: si la marca era nueva → borra la fila de Asistencias; si era cambio de estado → restaura el estado previo.
- [ ] AC-006-5 · Undo funciona offline (revertir desde la cola local antes de que se sincronice).

**Edge cases:**
- EC-006-1 · Usuario marca rápido 5 aprendices seguidos: solo el último marcado es deshacible (modelo simple, no pila multi-undo en Fase 1).
- EC-006-2 · Undo después de que la marca ya se sincronizó al backend: backend recibe endpoint `?accion=undo&num=X&fecha=YYYY-MM-DD` que borra la fila más reciente para esa combinación.

**Error states:**
- ES-006-1 · Undo falla por red caída: marca queda pendiente, toast rojo "no se pudo deshacer · reintenta más tarde". El usuario puede ir al sheet manualmente.

**Dependencies:** FR-005, backend `?accion=undo` (nuevo).

**Priority:** Must.

**Priority rationale:** El error humano al marcar 30 aprendices en 5 minutos es inevitable. Sin undo el instructor desconfía del sistema y vuelve a la planilla de papel [from: feedback conversacional sobre fricción de la app actual].

**Cross-references:**
- FR-001, FR-003, FR-005
- ADR-005 (API extension)
- Backlog E1.1.4

**Metrics:**
- Evento `undo_used` con `{seconds_after_mark}`.
- Tasa de undo: objetivo <5% de las marcas usan undo (si supera 10%, hay un problema de UX en el flujo de marcado).

### Área B — Dashboard analítico y alertas de riesgo

#### FR-007 · Dashboard "Hoy" — contador + lista de faltantes

**Descripción:** Vista principal de la app. Hero card con `X/Y aprendices presentes hoy` y % de asistencia, lista de faltantes con quick actions, sección de "ya marcados" con horario [from: prototipo §VIEWS.hoy].

**Acceptance criteria:**
- [ ] AC-007-1 · La hero card muestra `[presentes + tardes] / [total activos]` y `% asistencia`.
- [ ] AC-007-2 · Progress bar visual del % asistencia.
- [ ] AC-007-3 · Botones primarios "Escanear ficha" + "Lista" debajo del hero.
- [ ] AC-007-4 · Lista de faltantes con avatar + nombre + ficha + 3 botones inline P/T/J.
- [ ] AC-007-5 · Si faltan 0, mostrar pantalla "Todos marcados" en lugar de lista vacía.

**Edge cases:**
- EC-007-1 · Día sin sesión (fin de semana / festivo): mostrar "No hay sesión hoy" en lugar de "Faltan 30 de 30" alarmante.
- EC-007-2 · Padrón vacío: hero card muestra `0/0` + CTA "Agregar aprendices".
- EC-007-3 · TODAS las marcas son `Justificado`: porcentaje cuenta como 100% asistencia (los justificados NO penalizan).

**Error states:**
- ES-007-1 · Datos cacheados antiguos (>24h): banner amarillo "Datos pueden estar desactualizados, deslizar para refrescar".

**Dependencies:** FR-002 (datos del padrón), FR-005 (estados marcados), backend `?accion=listaHoy` (nuevo agregado).

**Priority:** Must. Rationale: pantalla de entrada — sin ella la app no tiene "primer momento de valor" [from: PVD §6.1 principio "señal manda"].

**Cross-references:** FR-003, FR-008, Design Doc §SCR-001, Backlog E1.3, ADR-003.

**Metrics:** Evento `dashboard_view` por sesión; tiempo promedio en la vista.

---

#### FR-008 · Dashboard analítico — rachas + en riesgo + patrones semanales

**Descripción:** Vista Histórico contiene un dashboard analítico con: (a) asistencia del grupo en últimos 10 días lectivos, (b) **lista de aprendices en riesgo** (racha consecutiva ≥3 días O % asistencia <80%), (c) tabla por aprendiz con `% asist · racha consecutiva actual · ausencias discontinuas · tardes`, (d) gráfica de % por día de la semana destacando mejor/peor día [from: prototipo §VIEWS.historico].

**Acceptance criteria:**
- [ ] AC-008-1 · "En riesgo" lista aprendices con `racha_actual ≥ 3` O `% asistencia < 80%`.
- [ ] AC-008-2 · Cada card "en riesgo" muestra: avatar + nombre + ficha + `% asistencia` + 3 chips `CONSEC · DISCONTINUAS · TARDES`.
- [ ] AC-008-3 · Chip "CONSEC" en rojo si ≥3; en naranja si 1-2; en gris guion si 0.
- [ ] AC-008-4 · Tabla detalle ordenable por riesgo / % asist / racha.
- [ ] AC-008-5 · Gráfica de semana (5 barras lun-vie) con el mejor día en verde y el peor en rojo.

**Edge cases:**
- EC-008-1 · Aprendiz nuevo (<5 días de historia): no aparece en "en riesgo" porque la muestra es insuficiente. Banner explicativo.
- EC-008-2 · Periodo con solo festivos / sin sesiones: gráfica de semana vacía con mensaje "Sin datos en este periodo".
- EC-008-3 · Aprendiz con 100% justificadas (todas sus inasistencias justificadas): % asistencia = 100%, no en riesgo.

**Error states:**
- ES-008-1 · Cálculo falla por datos corruptos: muestra fallback "No se pudieron calcular las estadísticas" + link al sheet.

**Dependencies:** Backend endpoint `?accion=stats` (nuevo) que retorna `{aprendiz, pct, racha_actual, racha_max, discontinuas, tardes}` por cada uno.

**Priority:** Must.

**Priority rationale:** Es la diferenciación central del producto vs cualquier registro de asistencia genérico. Sin esta feature la app es solo planilla digital [from: PVD §1 vision statement explícita sobre detección temprana].

**Cross-references:**
- FR-005 (estados — base de los cálculos)
- ADR-006 (datos durables — `instructor_id` para Fase 2)
- Design Doc §SCR-005 (vista Histórico)
- Backlog E1.3.5

**Metrics:**
- Evento `risk_alert_shown` cuando un aprendiz aparece por primera vez en "en riesgo".
- Lagging metric (semestral): aprendices alertados que NO terminaron desertando.

---

#### FR-009 · Exportar histórico a CSV

**Descripción:** Botón "Exportar CSV" en vista Histórico que descarga un archivo CSV con todas las marcas del periodo seleccionado, formato `fecha,ficha,nombre,estado,hora` [from: prototipo §VIEWS.historico botón CSV].

**Acceptance criteria:**
- [ ] AC-009-1 · El CSV usa separador `,` (no `;`) — estándar internacional.
- [ ] AC-009-2 · El nombre del archivo es `asistencia-<YYYYMMDD>-<YYYYMMDD>.csv`.
- [ ] AC-009-3 · El usuario puede elegir rango de fechas antes de exportar (default: últimos 30 días).
- [ ] AC-009-4 · El CSV se descarga directamente al storage del dispositivo (Android/iOS native download).

**Edge cases:**
- EC-009-1 · Periodo sin datos: descarga un CSV con solo la fila de encabezado.
- EC-009-2 · Periodo muy largo (>1 año, >5,000 filas): warning + confirmación antes de generar.

**Error states:** ES-009-1 · Falla la generación del backend: mensaje + retry.

**Dependencies:** Backend `?accion=export&desde=...&hasta=...`.

**Priority:** Should. Rationale: importante para el flujo trimestral del instructor pero no es lo primero al inicio de cada sesión.

**Cross-references:** FR-008, Backlog E1.3.6.

**Metrics:** Evento `export_csv` con `{date_range_days, rows_count}`.

### Área C — Configuración y operación

#### FR-010 · Configuración: endpoint, ficha del curso, umbrales

**Descripción:** Vista Ajustes con (a) URL del endpoint Apps Script (cambiable si se redeploya), (b) ficha del curso activa, (c) umbral horario que separa Presente/Tarde, (d) toggles `vibrar al escanear` y `modo offline` [from: prototipo §VIEWS.ajustes].

**Acceptance criteria:**
- [ ] AC-010-1 · Cambiar endpoint pide confirmación + valida que responda a `?accion=contar`.
- [ ] AC-010-2 · El umbral horario es un time picker (default `07:15`).
- [ ] AC-010-3 · Toggles son switches Material-style.
- [ ] AC-010-4 · Settings persisten en localStorage del navegador (no en el sheet).

**Edge cases:** EC-010-1 · Endpoint inválido: mensaje "no responde · revisa la URL".

**Error states:** ES-010-1 · localStorage no disponible (modo incógnito): banner "Ajustes no se guardarán entre sesiones".

**Dependencies:** localStorage browser API.

**Priority:** Must para endpoint y umbral (necesarios para que funcione el sistema); Should para toggles.

**Cross-references:** ADR-003, Design Doc §SCR-006, Backlog E1.4.

**Metrics:** Evento `setting_changed` con `{key, new_value}`.

---

#### FR-011 · Instalación PWA (add to home screen)

**Descripción:** La app debe ser instalable como PWA: cumple los criterios de Chrome (manifest.json, service worker, HTTPS, ícono ≥512px), muestra prompt nativo de instalación tras 2 visitas, y al instalarse aparece como ícono en pantalla de inicio sin chrome del navegador [from: PVD §6 principio "sin Play Store"; prototipo intent].

**Acceptance criteria:**
- [ ] AC-011-1 · `manifest.json` declara `name`, `short_name`, `start_url`, `display: standalone`, `theme_color: #0F172A`, `background_color: #F8FAFC`, íconos 192/512.
- [ ] AC-011-2 · `service-worker.js` cachea el shell de la app (HTML + Tailwind CDN + íconos).
- [ ] AC-011-3 · El prompt "agregar a pantalla de inicio" aparece tras 2 visitas a la app (default Chrome).
- [ ] AC-011-4 · Al instalar, el splash screen muestra el ícono y `background_color` mientras carga.
- [ ] AC-011-5 · Tras instalar, abre sin barra de navegación del browser (modo `standalone`).

**Edge cases:**
- EC-011-1 · iPhone Safari (no soporta prompt automático): mostrar instrucción "Compartir → Agregar a pantalla de inicio" si se detecta iOS.
- EC-011-2 · Browser desactualizado sin soporte PWA: mensaje "Para mejor experiencia, usa Chrome actualizado".

**Error states:** ES-011-1 · Service worker falla al registrarse: la app sigue funcionando online normalmente.

**Dependencies:** Hosting HTTPS (Vercel da esto), `manifest.json`, `service-worker.js`.

**Priority:** Must. Sin instalación PWA la promesa de "sin Play Store / sin Companion" se rompe [from: PVD §6 principio explícito].

**Cross-references:** ADR-001, ADR-002, Engineering Guide §deploy, Backlog E1.5.

**Metrics:** Evento `pwa_installed`; `pwa_install_prompt_outcome` con `{accepted: bool}`.

---

#### FR-013 · Modo offline + cola de marcas

**Descripción:** La app sigue funcionando sin red: las marcas se almacenan en localStorage en una cola pendiente, y cuando vuelve la red se envían al backend en orden FIFO. El usuario ve indicador "offline" en la app cuando aplica [from: PVD §6 principio + prototipo §settings].

**Acceptance criteria:**
- [ ] AC-013-1 · Detección de offline: `navigator.onLine` + ping al backend cada 30s.
- [ ] AC-013-2 · Cuando offline: las marcas se encolan en `localStorage["pending_marks"]`.
- [ ] AC-013-3 · Cada marca encolada lleva timestamp local — al sincronizar, ese timestamp prevalece sobre el tiempo del backend (porque la marca ocurrió en ese momento, no cuando se sincronizó).
- [ ] AC-013-4 · Banner naranja en topbar indica "Offline · X marcas pendientes" durante el modo.
- [ ] AC-013-5 · Al volver online: envío automático en orden, toast por cada éxito.
- [ ] AC-013-6 · Si una marca encolada falla al sincronizar (ficha no existe, etc.), queda en cola con flag `failed` y se notifica al usuario para revisar.

**Edge cases:**
- EC-013-1 · localStorage lleno (>5MB): vaciar las marcas ya sincronizadas, conservar solo pendientes; warning al usuario.
- EC-013-2 · Cambio de fecha mientras offline (cruzó medianoche con marcas pendientes): cada marca conserva la fecha en que ocurrió, no la fecha de sincronización.
- EC-013-3 · Usuario cierra la app con marcas pendientes: al reabrir las marcas siguen en cola.

**Error states:**
- ES-013-1 · Backend responde error en sincronización: retry con backoff exponencial 1s → 5s → 30s → 5min.
- ES-013-2 · localStorage no disponible: deshabilitar modo offline + warning explícito.

**Dependencies:** localStorage, `navigator.onLine`, service worker (para detección background).

**Priority:** Must.

**Priority rationale:** WiFi del aula es notoriamente inestable [from: persona §1]. Sin offline el instructor pierde marcas en cada caída de red y deja de usar el sistema. Es un must operativo, no un nice-to-have.

**Cross-references:** ADR-004 (offline strategy), Backlog E1.6, Design Doc §estados de cada pantalla.

**Metrics:** Evento `offline_mode_entered`, `offline_marks_queued`, `offline_sync_completed`.

## 5. Non-functional requirements

### 5.1 Performance

- **First Contentful Paint** ≤1.5s en 3G simulado (390ms RTT, 1.6Mbps), ≤500ms en WiFi `[OPEN: validar con Lighthouse]`.
- **Time to Interactive (vista Hoy)** ≤2.5s en mid-range Android (Snapdragon 6xx) `[OPEN: medir en device real]`.
- **Latencia de marcar** (tap a confirmación visible) ≤300ms online, ≤80ms offline (UI optimista).
- **Bundle inicial** ≤200KB gzip (Tailwind CDN incluido) — esto sí es target, no OPEN.
- **Medición:** Lighthouse CI en deploy + manual con Real User Monitoring básico vía `web-vitals` library.

### 5.2 Security

- **HTTPS obligatorio** — provisto por Vercel free tier.
- **Sin autenticación de usuario en Fase 1** — el endpoint Apps Script está como "Cualquier persona con el enlace" [from: GUIA-ANDROID.md §troubleshoot Error 1101]. Esto es un riesgo conocido y aceptado en Fase 1 para un solo instructor — `[OPEN: estrategia de auth para Fase 2 multi-instructor — ver ADR-006]`.
- **Sin PII sensible** — el sheet contiene nombre, ficha, documento. Documento sí es PII según LOPD Colombia. Mitigación: el sheet no se comparte; está en el Drive personal del usuario.
- **Sin secrets en cliente** — el endpoint URL es público pero el código GS server-side no expone tokens (no hay tokens). El SS_ID del sheet está en el código server-side, no en el cliente.

### 5.3 Privacy

- **PII inventory:** nombre completo, número de documento, número de ficha, foto (URL Drive).
- **Retention:** indefinida en Fase 1 (es el sheet del usuario, no hay política de borrado automático).
- **Right-to-deletion:** out of scope Fase 1 (`[OPEN: política para Fase 2 cuando haya múltiples instructores compartiendo datos]`).
- **Regulación aplicable:** Ley 1581 de 2012 Colombia (Habeas Data). En Fase 1 el usuario es el único responsable del tratamiento; no hay encargado externo (Google Sheets como herramienta personal del usuario está dentro del marco "uso doméstico/personal" que la ley exime).

### 5.4 Accessibility

- **WCAG 2.1 AA objetivo** en Fase 1, con foco en:
  - Contraste de texto ≥4.5:1 (verificado en prototipo: text-foreground sobre bg-surface = 16:1, etc.)
  - Touch targets ≥48×48dp en botones primarios
  - Soporte de `prefers-reduced-motion` (aún no implementado — agregar a Backlog)
  - aria-labels en botones-solo-ícono (settings gear, undo)
- **Lectores de pantalla:** test en TalkBack Android obligatorio antes de release.

### 5.5 Internationalization

- **Solo español** en Fase 1. Sin RTL, sin pluralización compleja.
- **Formato fechas** `dd/MM/yyyy`, formato horas `HH:mm:ss`, separador decimal `,` (es_CO).
- [PHASE-DEFERRED: Fase 3 — i18n si se ofrece fuera de Colombia. Hook: las strings de UI están centralizadas en un objeto `STRINGS` aunque hoy solo tenga `es`. Ver Engineering Guide.]

### 5.6 Observability

- **Logging cliente:** console + opcionalmente `[OPEN: integrar Sentry free tier para Fase 1.5? — decisión pendiente]`.
- **Logging backend Apps Script:** `Logger.log()` + acceso via Apps Script execution log UI. No hay alertas automáticas.
- **Métricas:** eventos en localStorage para análisis offline + opcionalmente enviar a `[OPEN: ¿analytics? Plausible/Umami?]`.
- **Dashboards:** ninguno automatizado en Fase 1 (el usuario revisa el sheet directamente para validar).

### 5.7 Reliability

- **SLO Fase 1:** ≥99% uptime efectivo en horario aula (07:00-17:00 Bogotá). Medido manualmente.
- **RTO:** 1 hora (si el backend cae, el usuario puede usar modo offline mientras se restaura).
- **RPO:** las marcas en cola local sobreviven hasta 7 días; tras eso, riesgo de pérdida si no se sincronizan.
- **Degradación:** modo offline + cache local permite operación parcial.

### 5.8 Compatibility

- **Browsers MVP:** Chrome Android ≥110, Safari iOS ≥16. Edge/Firefox best-effort.
- **OS:** Android 9+, iOS 16+.
- **Form factors:** mobile portrait primary; tablet portrait OK; landscape best-effort; desktop = phone-frame centrado.

### 5.9 Scalability

- **Padrón Fase 1:** hasta 50 aprendices por instructor (típico aula SENA).
- **Asistencias acumuladas:** ~50 aprendices × ~150 días lectivos/año = ~7,500 filas/año — manejable por Google Sheets (límite 5M filas) y por Apps Script (timeout 6 min).
- **Concurrentes:** 1 instructor Fase 1.
- [PHASE-DEFERRED: Fase 2 — concurrencia multi-instructor. Hook: columna `instructor_id` ya prevista en ADR-006.]

## 6. Out of scope (explicit)

**Out for Fase 1:**
1. **Multi-instructor / multi-ficha** — un solo instructor, una sola ficha por instalación.
2. **Vista de aprendiz** — el aprendiz no es usuario directo en Fase 1.
3. **Notificaciones push** al coordinador / aprendiz / instructor.
4. **Integración con sistema institucional SENA** (Sofia Plus, etc.).
5. **App nativa Android/iOS** — PWA only.
6. **Reportes formateados** (PDF, Word) — solo CSV en Fase 1.
7. **Login / cuentas de usuario** — endpoint público con security through obscurity (URL no compartida).

**Out forever (a menos que cambie radicalmente el alcance):**
1. **Monetización** — herramienta personal/educativa gratuita.
2. **Notas/calificaciones académicas** — fuera del dominio del producto.
3. **Currículo/matrículas** — fuera del dominio.
4. **Substitución del sistema institucional SENA** — somos complemento, no reemplazo oficial.

## 7. Constraints

- **Tier $0** [from: Brief §8]
- **Stack Google Apps Script + Sheets + Vercel** [from: Brief §7]
- **Locale es_CO obligatorio** [from: Brief §8, ADR-005]
- **Un solo dev** [from: Brief §8]
- **Sin Play Store, sin APK** [from: PVD §6]

## 8. Phased rollout

| Fase | Objetivo | Alcance funcional | Gate de entrada | Criterios de salida | Riesgos |
|---|---|---|---|---|---|
| **Fase 0** ✓ | Backend funcional + app cliente AppInventor "lo justo" | doGet con consultar/registrar/contar; sheet con 2 pestañas | — (ya hecho) | (ya cerrado) | (n/a) |
| **Fase 1** ← MVP PWA · este PRD | Reemplazo del cliente por PWA con dashboard analítico | FR-001 a FR-013 (todas las arriba) | Backend estable + prototipo validado en aula real ≥1 sesión | Instructor del usuario lo usa diariamente por 2 semanas sin reportar bugs bloqueantes; ≥95% sesiones se completan en <30s | Servicio Worker en iOS Safari es flaky; modo offline complejo de validar sin condiciones reales |
| **Fase 2** (deferred) | Multi-ficha + coordinador | Multi-instancia: 1 instructor con N fichas; rol coordinador con vista cross-ficha; alertas push básicas | Fase 1 estable ≥4 semanas EN AULA REAL + ≥1 instructor adicional pidiendo el sistema explícitamente | [PHASE-DEFERRED: a deliberar al cumplir gate] | [PHASE-DEFERRED] |
| **Fase 3** (deferred) | Vista aprendiz + integración SENA | Vista de autoconsulta del aprendiz; conversación con SENA institucional sobre integración formal | Fase 2 con ≥3 fichas activas + interés/conversación formal con coordinador SENA regional | [PHASE-DEFERRED] | [PHASE-DEFERRED] |

## 9. Glossary

| Término | Definición | Ejemplo de uso | Primera aparición |
|---|---|---|---|
| **Aprendiz** | Estudiante de un programa SENA | "Maria es aprendiz de la ficha 3145789" | Brief §3 |
| **Ficha** | Identificador único de un grupo SENA + del aprendiz individualmente. **En este producto: el número del aprendiz** (no del grupo). | "31145789" identifica a Luis. | Brief §1 |
| **Instructor** | Docente SENA, persona primaria del producto | "El instructor abre la app" | PVD §5 |
| **Coordinador** | Jefe de área que supervisa varios instructores | persona secundaria Fase 2 | PVD §5 |
| **Padrón** | Lista maestra de aprendices activos de un instructor (pestaña `Aprendices` del sheet) | "El padrón tiene 8 aprendices" | FR-002 |
| **Racha consecutiva** | Días seguidos faltando contando desde el día más reciente hacia atrás | "Valentina lleva 6 días consecutivos faltando" | FR-008 |
| **Ausencias discontinuas** | Total de ausencias en el periodo que NO están en la racha consecutiva actual | "Ana tiene 3 discontinuas" | FR-008 |
| **En riesgo** | Aprendiz con `racha ≥ 3` O `% asistencia < 80%` | "4 aprendices en riesgo hoy" | FR-008 |
| **Umbral SENA** | Mínimo de asistencia exigido para aprobar (≈80%) | "Por debajo del umbral SENA" | PVD §3 |
| **Sesión** | Día lectivo de la ficha (no toda la sesión institucional SENA — solo un día) | "Asistencia de hoy en esta sesión" | FR-001 |
| **PWA** | Progressive Web App — sitio web instalable como app | "La PWA reemplaza la App Inventor" | Brief §7 |
| **Marca** | Una unidad de registro de asistencia (1 fila en `Asistencias`) | "Marcar a un aprendiz" | FR-005 |

## 10. Open questions

Aggregate de todos los OPEN en este doc. Ordenados por criticidad.

### 🔴 Blocking (bloquea Fase 1)

1. **[OPEN-1]** Verificar % exacto del umbral SENA del reglamento académico vigente (Brief §4, FR-008 AC-008-1) — **required for:** dashboard de riesgo correcto.
2. **[OPEN-2]** Confirmar nomenclatura exacta del rol "coordinador académico" (Brief §3, PRD §2 persona 2) — required for: vocabulario consistente desde ahora.
3. **[OPEN-3]** Estrategia de auth multi-instructor (PRD §5.2 security) — required for: Fase 2 architecture (ADR-006).

### 🟡 Warning (resolver antes de release Fase 1)

4. **[OPEN-4]** Confirmar si "Ausente" se marca manualmente o por exclusión al cierre del día (FR-003 EC-003-3) — required for: definir flujo de cierre del día.
5. **[OPEN-5]** Decisión Sentry / analytics / Plausible / nada (PRD §5.6 observability) — required for: medir SLO en Fase 1.
6. **[OPEN-6]** Política de retention / right-to-deletion para Fase 2 (PRD §5.3 privacy) — required for: Fase 2 con datos multi-instructor.

### 🟢 Info (resolver durante construcción)

7. **[OPEN-7]** Lighthouse / device real medición concreta (PRD §5.1 performance) — required for: validar AC de performance.
8. **[OPEN-8]** Test en TalkBack Android (PRD §5.4 accessibility) — required for: cierre de checklist accesibilidad.

---

## Cross-references

- Vision → `01-product-vision.md`
- ADRs que deciden HOW → `05-decisions/`
- Pantallas → `06-design-document.md`
- Backend técnico → `07-technical/srd.md` y `07-technical/api-spec.md`
- Implementación → `09-backlog.md`
