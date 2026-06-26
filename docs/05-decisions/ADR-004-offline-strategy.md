# ADR-004 · Estrategia offline: localStorage queue + service worker shell cache + UI optimista

**Status:** Accepted · 2026-05-23

---

## Context

El WiFi del aula es notoriamente inestable [from: PRD §2 persona 1 pain point + conversación 2026-05-22]. Sin estrategia offline, el instructor pierde marcas cuando la red cae, lo cual rompe la promesa de "siempre funciona" y lo lleva de vuelta a la planilla de papel — el peor desenlace posible.

Opciones para implementar offline:

- **localStorage queue + UI optimista**: el cliente trata cada marca como exitosa de inmediato, la guarda en localStorage, e intenta enviarla al backend cuando hay red.
- **Service Worker Background Sync API**: la marca queda registrada, el SW reintenta el envío cuando hay red en background sin que la app esté abierta.
- **IndexedDB + sync engine** (PouchDB, RxDB, Dexie + Sync): base de datos local con motor de sync hacia el backend.
- **WebSockets + reconexión**: cliente abierto mantiene conexión persistente, las marcas viajan cuando se conecta.

Constraints: simplicidad (un solo dev), Fase 1 single-user (sin sync conflict resolution complejo), funciona en iOS Safari (Background Sync API solo está en Chrome), volumen pequeño (decenas de marcas/día, no miles).

## Decision

**Combinación de 3 capas:**

1. **Shell cache via Service Worker** — el HTML, CSS, JS, íconos quedan cacheados; la app abre sin red.
2. **localStorage queue para marcas pendientes** — cada marca se guarda local con timestamp; UI optimista (toast "Presente" inmediato).
3. **Sync al volver online** — un loop revisa `navigator.onLine` + ping cada 30s; cuando hay red, envía las marcas pendientes en orden FIFO al backend.

NO usamos Background Sync API (no funciona en iOS Safari) ni IndexedDB (overkill para nuestro volumen).

> **Decision summary:** SW para shell, localStorage para marcas pendientes, sync foreground al detectar red.

## Alternatives considered

### Alternativa A — localStorage queue + foreground sync (elegida)

**Descripción:** marcas pendientes en `localStorage["pending_marks"]` como array de objetos `{ficha, estado, timestamp_local, retry_count, status}`. Cuando online, loop intenta enviar uno a uno con backoff.

**Pros:**
- **Funciona en todos los navegadores** (localStorage es universal).
- **Implementación simple** — 50 líneas de JS.
- **Debuggeable** — el usuario puede abrir DevTools y ver la cola.
- **El timestamp local prevalece** sobre el de sincronización (la marca quedó al momento de tocar, no cuando se sincronizó).

**Cons:**
- **No background sync de verdad** — si la app se cierra con marcas pendientes y el usuario no la reabre durante días, las marcas no se envían.
- **Mitigación:** notificación al reabrir "tienes X marcas pendientes desde hace N días, sincronizando ahora".
- **localStorage tiene límite ~5MB** — más que suficiente para nuestro volumen pero hay que limpiar después de sync.

**Rejection reason:** N/A — elegida.

### Alternativa B — Service Worker Background Sync API

**Pros:** sync ocurre incluso con app cerrada (Chrome lo despierta cuando hay red).

**Cons:** **no soportado en iOS Safari** — rompe la promesa multi-plataforma.

**Rejection reason:** rompe iOS. Fase 2 puede traer un usuario iOS (coordinador con iPhone).

### Alternativa C — IndexedDB + PouchDB/Dexie

**Pros:** base de datos local robusta, queries complejas, sync engine maduro.

**Cons:** **complejidad masiva** para nuestro volumen. PouchDB son ~200KB en sí. Setup de sync con backend no-CouchDB requiere adapter custom.

**Rejection reason:** sobre-engineering. localStorage cubre el caso al 100% con 1% del código.

### Alternativa D — WebSockets

**Pros:** menor latencia online, server push.

**Cons:** Apps Script no soporta WebSockets nativos. Requeriría proxy intermedio. Complejidad enorme sin beneficio para single-instructor.

**Rejection reason:** incompatible con backend ADR-003.

## Rationale

**Drivers:**

1. **Compatibilidad multi-plataforma** > sofisticación. Background Sync sería más limpio pero perdemos iOS.
2. **Complejidad sostenible** — un solo dev no mantiene PouchDB.
3. **Volumen pequeño** — decenas de marcas/día, no necesitamos engine de sync industrial.
4. **UI optimista** es lo que el usuario percibe — la cola interna es invisible si está bien hecha.

## Consequences

### Positive
- App **siempre abre** (SW cachea shell) incluso sin red.
- Marcado se siente **instantáneo** (UI optimista).
- Marcas no se pierden en caídas de red transitorias.
- Implementación **simple y mantenible**.

### Negative
- **Marcas no se envían con app cerrada.** Si el instructor marca offline y no reabre la app en días, los datos quedan local hasta reapertura. **Mitigación:** banner persistente "X marcas pendientes" al abrir.
- **Sin conflict resolution sofisticado** — si dos dispositivos del mismo instructor (Fase 1 no aplica) marcaran lo mismo offline, el sync de ambos crea filas duplicadas. **Mitigación:** idempotencia en backend por `(ficha, fecha)` — si ya existe marca para esa combinación, actualiza en lugar de duplicar.
- **localStorage es síncrono** — operaciones grandes (clear) pueden bloquear el main thread. **Mitigación:** mantener queue pequeña, limpiar tras sync.

### Neutral
- Service worker introduce su propia complejidad (cache invalidation, update flow) pero esa la pagamos en ADR-001 ya.

### Risks
- **Riesgo:** modo incógnito / browser privacy → localStorage limitado o vaciado al cerrar. **Indicador:** marcas se pierden entre sesiones. **Mitigación:** detección de incógnito + banner "datos no persistirán entre sesiones".
- **Riesgo:** usuario tiene 50 marcas pendientes y al sincronizar el backend rechaza alguna por validación → estado intermedio. **Mitigación:** marcar las fallidas con flag `failed` y notificar.

## Implicaciones cross-fase

| Fase | Comportamiento | Hook HOY | Qué la bloquearía |
|---|---|---|---|
| **Fase 1** | SW shell + localStorage queue. | Cada marca lleva `timestamp_local` desde Fase 1 — esto es lo que la hace funcionar al sincronizar respetando el orden temporal real. | No incluir timestamp local → al sincronizar a deshora, todas se ven como "ahora" y se pierden las horas reales. |
| **Fase 2** | Multi-instructor: cada uno con su propia cola local. Backend con idempotencia (`ficha, fecha, instructor_id`). | Idempotencia ya en Fase 1 → Fase 2 solo agrega `instructor_id` al composite key. | Hardcodear el composite key en `(ficha, fecha)` solo. |
| **Fase 3** | Posible cambio a IndexedDB + sync engine si volumen sube; o migración a Background Sync si iOS Safari lo soporta. | El contrato "qué se sincroniza" está bien definido por endpoint `?accion=registrar` → cambiar el mecanismo interno no toca el contrato externo. | — |

[PHASE-DEFERRED: motor de sync más sofisticado — Fase 3 si volumen crece; hook hoy es el contrato HTTP idempotente.]

## Validation plan

- **Leading:** evento `offline_mode_entered` por sesión. Si > 30% sesiones experimentan offline, el problema es real.
- **Lagging:** evento `offline_sync_failed` por marca. Si > 5% de marcas fallan al sincronizar, hay un bug.
- **Review trigger:** Fase 2 entrando + reporte de marcas pérdidas / duplicadas.

## Implementation notes

- **localStorage schema:**
  ```js
  // localStorage["pending_marks"]
  [
    {
      ficha: "31145789",
      estado: "Presente",
      timestamp_local: "2026-05-23T07:42:15-05:00",  // ISO con TZ Bogotá
      created_at: 1716461535000,
      retry_count: 0,
      status: "pending" | "failed",
      error_msg: ""
    }
  ]
  ```
- **Sync loop:** cada 30s O cuando `online` event dispara → procesar cola FIFO con `Promise.all` o secuencial.
- **Idempotencia backend:** `registrar(ficha, estado, timestamp_local)` debe (a) si existe fila para `(ficha, fecha-de-timestamp_local)` → UPDATE; (b) si no → INSERT con el timestamp local provisto.
- **Service worker:**
  ```js
  // sw.js
  const CACHE_VERSION = '2026-05-23-1';
  const CACHE_NAME = `asistencia-shell-${CACHE_VERSION}`;
  self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll([
      '/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png',
      'https://cdn.tailwindcss.com/3.4.1' // pinned version
    ])));
  });
  self.addEventListener('fetch', e => {
    // network-first para datos, cache-first para shell
  });
  ```

## References

- ADR-001, ADR-003 — establecen PWA + Apps Script contexto.
- PRD §FR-013 — modo offline + cola.
- `01-product-vision.md` §6.2 — principio "velocidad" (offline = velocidad percibida).
- Memory `project_asistencia.md` — contexto del entorno aula.
