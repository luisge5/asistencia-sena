---
backlog_version: 2
generated: 2026-05-23
  last_updated: 2026-07-14 (Sprint S-06 en progreso)
current_sprint: S-06 (Realtime + Push)
owner: jjzoto (single dev)
totals:
   todo: 0
   wip: 0
   blocked: 0
   done: 33
  deferred: 0
  cancelled: 0
phase: 1
stack:
  frontend: React 19 + TypeScript + Vite 6
  styling: Tailwind CSS 4
  state: Zustand 5
  data: TanStack Query 5
  backend: InsForge (PostgreSQL + Auth + Realtime)
  pwa: vite-plugin-pwa
  testing: Vitest + Playwright
  ci: GitHub Actions
  deploy: Vercel
---

# Backlog · Asistencia SENA

> **Living document.** Este archivo se actualiza automáticamente después de cada tarea completada.
> Ver §"Refresh protocol" al final para las reglas que lo mantienen vivo.

---

## At a glance · sprint S-05

**Sprint goal:** Lighthouse CI, accesibilidad, deploy a producción.

**Sprint window:** 2026-06-23 → 2026-07-07 (2 semanas)

| Lane                        | Stories | Notas                                      |     |
| --------------------------- | ------- | ------------------------------------------ | --- |
| 🟢 Now (este sprint)       | 4       | S-05-001 a S-05-004                        |     |
| ⚪ Later (cola)              | 2       | Realtime sync, push notifications          |     |
| 🔴 Blocked                  | 0       | —                                          |     |
| ✅ Completed (Sprint S-01)  | 15      | Setup + Core                               |     |
| ✅ Completed (Sprint S-02)  | 8       | Auth + Core Features                       |     |
| ✅ Completed (Sprint S-03)  | 5       | QR + Import + Historial                    |     |
| ✅ Completed (Sprint S-04)  | 4       | Undo + Toast + Visual + Tests             |     |

---

## Completed · Sprint S-01 (Setup + Core)

> ✅ Sprint completado exitosamente

- [x] **S-01-001: Scaffold proyecto (Vite + React + TS)** — 2026-06-11
- [x] **S-01-002: Configurar Tailwind CSS 4** — 2026-06-11
- [x] **S-01-003: Configurar vite-plugin-pwa** — 2026-06-11
- [x] **S-01-004: Configurar InsForge SDK** — 2026-06-11
- [x] **S-01-005: Tipos TypeScript globales** — 2026-06-11
- [x] **S-01-006: Configurar absolute imports (@/)** — 2026-06-11
- [x] **S-01-007: Layout principal (Header + Nav + Main)** — 2026-06-11
- [x] **S-01-008: Router con rutas básicas** — 2026-06-11
- [x] **S-01-009: Zustand store (auth slice)** — 2026-06-11
- [x] **S-01-010: TanStack Query provider** — 2026-06-11
- [x] **S-01-011: GitHub Actions CI** — 2026-06-11
- [x] **S-01-012: Vercel deploy config** — 2026-06-11
- [x] **S-01-013: UI/UX Design System (Claymorphism)** — 2026-06-12
- [x] **S-01-014: InsForge MCP configurado** — 2026-06-12
- [x] **S-01-015: Limpieza y organización del proyecto** — 2026-06-12

---

## Completed · Sprint S-02 (Auth + Core Features)

> ✅ Sprint completado exitosamente

- [x] **S-02-001: Crear tablas en InsForge** — 2026-06-18
- [x] **S-02-002: Implementar autenticación con InsForge Auth** — 2026-06-12
- [x] **S-02-003: Página de Login** — 2026-06-12
- [x] **S-02-004: Dashboard principal (Vista "Hoy")** — 2026-06-12
- [x] **S-02-005: Servicio de Asistencia (CRUD con InsForge)** — 2026-06-12
- [x] **S-02-006: Componente de Marca Rápida (P/T/J)** — 2026-06-12
- [x] **S-02-007: Página de Aprendices** — 2026-06-12
- [x] **S-02-008: Protección de rutas y roles** — 2026-06-12

---

## Completed · Sprint S-03 (QR + Import + Historial)

> ✅ Sprint completado exitosamente

- [x] **S-03-001: Escaneo de código QR** — 2026-06-18
- [x] **S-03-002: Importación masiva de aprendices (Excel)** — 2026-06-18
- [x] **S-03-003: Vista Histórico de asistencia** — 2026-06-18
- [x] **S-03-004: Estadísticas y reportes** — 2026-06-18
- [x] **S-03-005: Modo offline + queue** — 2026-06-18

---

## Now · current sprint (S-05)

> Stories que vamos a trabajar este sprint. Owner: jjzoto.

### S-05-001: Lighthouse CI — presupuesto de performance
**Status:** `done`
**Estimation:** M
**Parent epic:** E5.1 — CI/CD Quality

**Acceptance criteria:**
- [ ] Lighthouse ejecutándose en CI (GitHub Actions)
- [ ] Presupuesto de performance (score ≥ 90)
- [ ] Reporte visible en PRs

---

### S-05-002: Accesibilidad — ARIA, focus, contraste, labels
**Status:** `done`
**Estimation:** M
**Parent epic:** E5.2 — Accesibilidad

**Acceptance criteria:**
- [ ] Roles ARIA en componentes interactivos
- [ ] Focus visible en todos los elementos
- [ ] Contraste suficiente en textos
- [ ] Labels descriptivos en iconos SVG
- [ ] Skip-to-content link

---

### S-05-003: Deploy a Vercel
**Status:** `done`
**Estimation:** S
**Parent epic:** E5.3 — Deploy

**Acceptance criteria:**
- [ ] Repo conectado a Vercel
- [ ] Deploy automático en main
- [ ] App funcionando en producción

---

### S-05-004: Validación responsive en Android real
**Status:** `done`
**Completed:** 2026-07-14
**Estimation:** S
**Parent epic:** E5.4 — QA

**Acceptance criteria:**
- [x] Probar en dispositivo Android físico
- [x] Ajustar layout si es necesario
- [x] Verificar escáner QR en móvil

---

## Now · current sprint (S-06)

> Stories que vamos a trabajar este sprint. Owner: jjzoto.

### S-06-001: Realtime sync — suscripción a cambios en tiempo real vía WebSockets
**Status:** `done`
**Completed:** 2026-07-14
**Estimation:** M
**Parent epic:** E6.1 — Realtime

**Acceptance criteria:**
- [x] Hook useRealtime implementado
- [x] DashboardPage actualiza en tiempo real
- [x] Documentación SQL trigger creada
- [x] Build sin errores TypeScript

---

### S-06-002: Push notifications — notificaciones cuando instructor marca asistencia
**Status:** `done`
**Completed:** 2026-07-14
**Estimation:** M
**Parent epic:** E6.2 — Push Notifications

**Acceptance criteria:**
- [x] Solicitar permiso de notificaciones
- [x] Registrar subscription en backend
- [x] Enviar notificación cuando se marca asistencia
- [x] Manejar notificación en background

---

> ✅ Sprint S-06 completado exitosamente

---

## Blocked

> Stories que cannot progress until something external resolves.

(none)

---

## Discovered work

> Stories que surgieron durante implementación o uso real, no en el PRD original.

- ✅ **S-05-005: Rediseño UI profesional** — 2026-07-01
  Rediseño completo siguiendo `docs/referencia/prototipo-pwa.html`:
  - Phone-frame layout (max-w-420px en desktop)
  - Bottom navigation (4 tabs, icon+label+dot)
  - Top bar sticky con backdrop-blur
  - Hero card dark gradient con progress bar
  - Dashboard: faltantes con icon buttons + marcados con pills
  - QR scanner: viewfinder con scanner-frame corners + scan-line
  - Historial→Analytics dashboard con KPIs, riesgo, tabla, patrones
  - Paleta: primary #0F172A, accent #0369A1, estados semánticos
  - Tipografía Inter, SVGs Lucide
  - Toast dark inline (bg-primary, undo link)
  - Login gradient primary, logo SVG checkmark
  - Aprendices: search + avatar list + filter tabs
  - /estadisticas redirect → /historial
  - Build limpio sin errores TS

---

## Epics

> Strategic groupings. Phase 1 (deliberated) fully decomposed.

### Epic E2.1 — Backend: schema InsForge
**Goal:** Crear tablas y políticas RLS en InsForge.
**Stories:** S-02-001
**Status:** ✅ done

### Epic E2.2 — Auth
**Goal:** Autenticación completa con InsForge.
**Stories:** S-02-002, S-02-003, S-02-008
**Status:** ✅ done

### Epic E2.3 — Dashboard
**Goal:** Vista principal funcional y atractiva.
**Stories:** S-02-004, S-02-006
**Status:** ✅ done

### Epic E2.4 — Data Layer
**Goal:** Servicios y hooks para datos.
**Stories:** S-02-005
**Status:** ✅ done

### Epic E2.5 — Aprendices
**Goal:** Gestión de aprendices.
**Stories:** S-02-007
**Status:** ✅ done

### Epic E3.1 — QR Scanner
**Goal:** Escaneo de código QR.
**Stories:** S-03-001
**Status:** ✅ done

### Epic E3.2 — Import
**Goal:** Importación masiva de datos.
**Stories:** S-03-002
**Status:** ✅ done

### Epic E3.3 — Historial
**Goal:** Histórico de asistencias.
**Stories:** S-03-003
**Status:** ✅ done

### Epic E3.4 — Analytics
**Goal:** Estadísticas y reportes.
**Stories:** S-03-004
**Status:** ✅ done

### Epic E3.5 — Offline
**Goal:** Modo offline funcional.
**Stories:** S-03-005
**Status:** ✅ done

### Epic E4.1 — Undo
**Goal:** Deshacer cambios de asistencia.
**Stories:** S-04-001
**Status:** ✅ done

### Epic E4.2 — Toast
**Goal:** Sistema de notificaciones.
**Stories:** S-04-002
**Status:** ✅ done

### Epic E4.3 — Visual
**Goal:** Pulir identidad visual.
**Stories:** S-04-003
**Status:** ✅ done

### Epic E4.4 — Testing
**Goal:** Tests E2E con Playwright.
**Stories:** S-04-004
**Status:** ✅ done

### Epic E6.1 — Realtime
**Goal:** Sincronización en tiempo real vía WebSockets.
**Stories:** S-06-001
**Status:** ✅ done

### Epic E6.2 — Push Notifications
**Goal:** Notificaciones push para actualizaciones de asistencia.
**Stories:** S-06-002
**Status:** ✅ done

---

## Working agreements

> Pactos del equipo (single dev por ahora).

1. **After every task:** Actualizar este archivo automáticamente (Status, Last touched, Acceptance criteria)
2. **Weekly (lunes):** Groom §Next y §Later, triage §Discovered work
3. **Stories blocked > 5 días** → revisión inmediata
4. **No "TBD" subtasks** — si no es concreto, no existe todavía
5. **Stories > 3 días estimados** → split antes de pasar a `wip`
6. **No story entra `wip` sin owner**

---

## Refresh protocol

> Cuándo y cómo se actualiza este archivo.

**On every task completion:**
- [x] Actualizar `Status:` a `done`
- [x] Agregar `Completed:` con fecha
- [x] Marcar acceptance criteria completados
- [x] Actualizar frontmatter `totals.done`
- [x] Actualizar `last_updated`

**On every new task started:**
- [ ] Actualizar `Status:` a `wip`
- [ ] Actualizar frontmatter `totals.wip`

**End of work session:**
- [ ] Actualizar `last_updated` en frontmatter

**Sprint planning:**
- [ ] Mover `Now → Completed` con fecha
- [ ] Mover `Next → Now` con owner
- [ ] Groom `Later → Next`

---

## Changelog

> Append-only. No editar historia.

- **2026-05-23** — Initial backlog generated (Apps Script version)
- **2026-06-11** — Sprint S-01 completado: Setup + Core (12 tareas)
- **2026-06-12** — Backlog actualizado v2: Nueva arquitectura InsForge + React + TypeScript
- **2026-07-01** — Rediseño UI profesional S-05-005 completado (ver Discovered work)
- **2026-07-14** — Sprint S-05 completado: Lighthouse CI + Accesibilidad + Deploy + Rediseño UI
- **2026-07-14** — Sprint S-06 completado: Realtime sync + Push notifications
- **2026-07-14** — MVP completado: Tests E2E, SQL Triggers, VAPID Keys, Deploy a Vercel
