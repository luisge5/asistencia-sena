# Software Requirements Specification (SRD) · Asistencia SENA · Fase 1

**Versión:** 1.0
**Fecha:** 2026-05-23

---

## 1. System overview

```
┌───────────────────────────────────────────────┐
│  CLIENTE (PWA)                                │
│  ┌─────────────────────────────────────────┐  │
│  │  Vistas: Hoy / Scan / Aprendices /      │  │
│  │  Histórico / Ajustes                    │  │
│  ├─────────────────────────────────────────┤  │
│  │  Estado: localStorage (cache padrón,    │  │
│  │  cola offline, settings)                │  │
│  ├─────────────────────────────────────────┤  │
│  │  Service Worker: shell cache, offline   │  │
│  │  detection                              │  │
│  └─────────────────────────────────────────┘  │
│         │                                     │
│         │ HTTPS                               │
│         ▼                                     │
└───────────────────────────────────────────────┘
┌───────────────────────────────────────────────┐
│  BACKEND (Google Apps Script Web App)         │
│  ┌─────────────────────────────────────────┐  │
│  │  doGet → router por ?accion=X           │  │
│  │  Acciones: consultar, registrar,        │  │
│  │  contar, listaPadron (nuevo),           │  │
│  │  listaHoy (nuevo), stats (nuevo),       │  │
│  │  undo (nuevo), export (nuevo)           │  │
│  ├─────────────────────────────────────────┤  │
│  │  Helpers: bogotaMidnight, formatDate,   │  │
│  │  driveFotoDirecta, getSheet, findCol    │  │
│  ├─────────────────────────────────────────┤  │
│  │  refreshResumen (post-mark hook)        │  │
│  └─────────────────────────────────────────┘  │
│         │                                     │
│         │ SpreadsheetApp.openById             │
│         ▼                                     │
└───────────────────────────────────────────────┘
┌───────────────────────────────────────────────┐
│  PERSISTENCIA (Google Sheets `asistencia.1`)  │
│  ┌─────────────────────────────────────────┐  │
│  │  Pestaña Aprendices  (padrón)            │  │
│  │  Pestaña Asistencias (log de marcas)     │  │
│  │  Pestaña Resumen     (KPIs refrescados)  │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
        ▲
        │ (acceso directo Drive del usuario para edición manual)
        │
   USUARIO (instructor)
```

## 2. Architecture style

**Modular monolito sobre serverless gestionado.** El backend es un solo script (`merged.gs`) con funciones bien delimitadas (no microservicios). El cliente es una SPA mono-página (un solo `index.html`). Apps Script + Sheets ya gestionan escalado, redundancia y backup — no hay infraestructura que mantener.

## 3. Subsistemas

### 3.1 Cliente PWA

**Responsabilidad:** renderizar UI, capturar input, calcular dashboards localmente, sincronizar con backend.

**Interfaces:**
- Hacia backend: HTTPS GET a endpoint `script.google.com/macros/s/.../exec?accion=X`.
- Hacia browser APIs: `BarcodeDetector`, `getUserMedia`, `Notification`, `localStorage`, `navigator.onLine`, `serviceWorker`.

**Dependencias:** Tailwind CDN (https://cdn.tailwindcss.com), Inter font (Google Fonts), opcional `html5-qrcode` para fallback iOS.

### 3.2 Backend Apps Script

**Responsabilidad:** routing de endpoints, lectura/escritura del sheet, idempotencia, agregaciones server-side.

**Interfaces:**
- HTTP: `doGet(e)` recibe params, retorna JSON.
- Sheets: `SpreadsheetApp.openById(SS_ID)`.
- Utilities: `Utilities.formatDate`, `Utilities.parseDate`, `Utilities.getUuid`.

**Dependencias:** Google Apps Script Runtime (V8), `SpreadsheetApp`, `Utilities`, `ContentService`, `Logger`.

### 3.3 Persistencia Sheets

**Responsabilidad:** almacenamiento durable de padrón + log + resumen.

**Interfaces:**
- Apps Script API (lectura/escritura via `SpreadsheetApp`).
- Google Sheets UI (lectura/escritura manual por usuario).

**Dependencias:** Google Workspace tier consumer (free).

## 4. External integrations

| Integración | Propósito | Tipo | SLA dependiente |
|---|---|---|---|
| Google Apps Script | Backend runtime | Servicio gestionado | 99.5% (estimado consumer) |
| Google Sheets | Persistencia | Servicio gestionado | 99.5% |
| Google Drive | Almacenamiento de fotos de aprendices (URLs) | CDN público | 99% |
| Vercel | Hosting PWA (HTTPS) | Servicio gestionado | 99.99% (free tier) |
| Google Fonts | Carga de Inter | CDN público | 99.99% |
| jsdelivr / cdn.tailwindcss.com | Carga de Tailwind | CDN público | 99.9% |

Sin integración a Sofia Plus / sistema SENA institucional en Fase 1.

## 5. Performance requirements

| Métrica | Target Fase 1 | Medición |
|---|---|---|
| First Contentful Paint (PWA cold) | ≤1.5s en 3G simulado | Lighthouse CI |
| Time to Interactive (vista Hoy) | ≤2.5s mid-range Android | Manual Lighthouse |
| Latencia visible de marcar (tap a feedback) | ≤300ms online · ≤80ms offline | RUM básico |
| Latencia backend endpoint p50 | ≤500ms | Apps Script execution log |
| Latencia backend endpoint p95 | ≤1.5s | Apps Script execution log |
| Throughput | 30 marcas/hora pico (1 instructor / 1 sesión) | — |
| Bundle inicial gzip | ≤200KB | `du -h dist/` |

## 6. Security requirements

- **HTTPS obligatorio** (provisto por Vercel + Apps Script doGet).
- **Sin authentication** en Fase 1 — endpoint público con URL no expuesta (security through obscurity). Riesgo aceptado documentado en ADR-006.
- **Sin secrets en cliente** — el endpoint URL es la única "credencial" y es público.
- **Sin PII expuesta innecesariamente** — el cliente recibe `nombre`, `ficha`, `documento`, `foto_url` (mismo que el sheet ya contiene). No hay export de información que no esté ya en el sheet del usuario.
- **CSP** (Content Security Policy) en HTML head: `default-src 'self' https://cdn.tailwindcss.com https://fonts.googleapis.com https://fonts.gstatic.com https://drive.google.com https://script.google.com`.
- **No CORS strict** — Apps Script doGet acepta cross-origin desde Vercel.

[OPEN: estrategia de auth para Fase 2 — JWT, Google Sign-In, magic links? Ver ADR-006 cross-fase].

## 7. Observability requirements

- **Logging cliente:** `console.log` + opcionalmente Sentry free tier `[OPEN-5 PRD]`.
- **Logging backend:** `Logger.log()` en cada acción crítica (registrar, undo, errors). Accesible via Apps Script "Ejecuciones" UI.
- **Metrics:**
  - Cliente: eventos en localStorage (`scan_complete`, `mark_inline`, `offline_mode`) + opcional Plausible analytics.
  - Backend: count de invocaciones por acción via Apps Script quotas dashboard.
- **Tracing:** N/A en Fase 1 (single-instructor, no distribuido).
- **Dashboards:** ninguno automatizado; el usuario revisa el sheet `Resumen` para validar.
- **Alertas:** ninguna automatizada; el usuario percibe degradaciones (lentitud) directamente.

## 8. Compliance

- **Ley 1581 de 2012 Colombia (Habeas Data)** — el sheet contiene PII (nombre, documento). En Fase 1 el usuario es el responsable del tratamiento; el sheet vive en su Drive personal; aplica exención de uso doméstico/personal de la ley.
- **WCAG 2.1 AA** target — verificado por Lighthouse + manual con TalkBack/VoiceOver.

[PHASE-DEFERRED: GDPR / política formal de privacidad — Fase 2 si se incorporan instructores adicionales; requiere consentimiento explícito y procesador de datos definido].

## 9. Future-proofing y hooks cross-fase

Ver ADR-006 para detalle. Resumen:
- Columnas `grupo`, `instructor_id`, `marca_id` reservadas desde Fase 1 con defaults.
- Endpoint config en localStorage → migrable backend sin redeploy cliente.
- Cálculos de dashboard duplicados (backend + cliente) → backend opcional para Fase 1.

## Cross-references

- ADR-001 (PWA), ADR-002 (stack), ADR-003 (backend), ADR-004 (offline), ADR-005 (locale), ADR-006 (data hooks).
- `api-spec.md` — contratos HTTP detallados.
- `data-model.md` — schemas + future-proofing.
- `test-plan.md` — coverage y journeys.
