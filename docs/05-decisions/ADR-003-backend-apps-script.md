# ADR-003 · Mantener Google Apps Script + Sheets como backend (no migrar a Supabase/Firebase/custom)

**Status:** Accepted · 2026-05-23

---

## Context

El backend actual es Google Apps Script desplegado como Web App, con persistencia en Google Sheets (`asistencia.1`). Tiene un endpoint `doGet` con acciones `consultar / registrar / contar` que el App Inventor ya consume. En la migración a PWA (ADR-001) hay que decidir si conviene **mantener** este backend o **migrar** a uno más estándar.

Opciones:
- **Apps Script + Sheets** (status quo)
- **Supabase** (Postgres + Auth + Realtime, free tier 500MB DB + 2GB transferencia)
- **Firebase** (Firestore + Auth, free tier generoso)
- **Cloudflare Workers + D1 SQLite**
- **Vercel Functions + Postgres Neon**

Constraints: $0 hosting/operación, sin cuenta de developer paga, el usuario quiere seguir viendo y editando los datos directamente desde Google Sheets (familiar), no quiere aprender SQL ni configurar bases de datos, un solo dev.

## Decision

**Mantenemos Google Apps Script + Google Sheets como backend de Fase 1, sin cambios estructurales.** Extendemos el `merged.gs` existente con nuevos endpoints (`listaPadron`, `listaHoy`, `stats`, `undo`, `export`) y mantenemos `Aprendices` + `Asistencias` + `Resumen` como las 3 pestañas del sheet.

> **Decision summary:** Apps Script + Sheets, ya funciona, $0, el usuario lo ve familiar. Migración futura solo si Fase 2 lo exige.

## Alternatives considered

### Alternativa A — Apps Script + Sheets (elegida)

**Pros:**
- **Ya funciona** — código `merged.gs` operativo en producción.
- **$0 reales** — Google da 90 segundos/día de ejecución en cuenta gratuita; con 1 instructor + ~30 marcas/día estamos a 10% de ese límite.
- **El usuario ve los datos directamente en su Drive** — sin abstracción de "base de datos".
- **No requiere migración** — el dato actual sigue funcionando.
- **Backup automático** — Google maneja redundancia.
- **Versionado del código** dentro del Apps Script project (no manual).
- **Permisos** delegados a Google (no gestionamos sesiones).

**Cons:**
- **Timeout 6 minutos por ejecución** — limitante en operaciones masivas (export grande, refresh con muchos cálculos).
- **90 segundos/día** en cuenta consumer (suficiente para Fase 1, pero comienza a apretar en Fase 2 con varios instructores).
- **Cold start** del Apps Script ~1-2s — primer request lento si llevaba rato inactivo.
- **Sin webhooks reales** — el cliente debe polling para detectar cambios (no afecta Fase 1 single-instructor).
- **API no estándar** — `?accion=X&num=Y` no es REST canónico (no es problema funcional, pero rompe convenciones).
- **El locale es_CO ya nos dió un bug** con `setFormula` — debe manejarse con cuidado [from: memory `gotcha_apps_script_setformula_locale.md`, ADR-005].

**Rejection reason:** N/A — elegida.

**Cuándo revisaríamos:** si Fase 2 exige (a) ≥10 instructores con concurrencia real, (b) realtime entre dispositivos, (c) push notifications nativas, (d) límites de Apps Script se vuelven dolorosos.

### Alternativa B — Supabase (Postgres + RLS + Realtime)

**Pros:**
- API SQL estándar, RLS robusta para multi-tenant Fase 2.
- Realtime nativo (cambios propagados a clientes via WebSocket).
- Auth integrada (Google/email/etc) — útil para Fase 2.

**Cons:**
- **Migración no trivial** — habría que escribir scripts de import del sheet a Postgres + dual-write durante transición.
- **El usuario pierde la vista directa de Google Sheets** — habría que dar UI extra para edición manual o exportar a sheet sincronizado.
- **Free tier 500MB DB** — generoso pero un día se acaba; tier siguiente $25/mes.
- **Curva de aprendizaje** del usuario y del dev: SQL, RLS policies, migrations, Supabase CLI.
- **Aumenta complejidad operativa** sin justificar el cambio en Fase 1 single-instructor.

**Rejection reason:** beneficios solo aplican cuando hay concurrencia / multi-instructor / realtime — Fase 2+, no Fase 1. Migrar antes de necesitarlo es over-engineering.

**Cuándo revisaríamos:** Fase 2 con ≥3 instructores + necesidad de realtime entre coordinador y instructores. Supabase es el siguiente paso natural.

### Alternativa C — Firebase / Firestore

**Pros:**
- Realtime nativo, free tier amplio.
- Push notifications integradas.

**Cons:**
- Modelo NoSQL menos familiar para reportes tabulares (queries de "% asistencia por aprendiz" requieren agregación cliente o cloud functions).
- Lock-in fuerte a Google (peor que Sheets — Sheets al menos permite export trivial).
- Free tier limitante con muchos reads/writes.

**Rejection reason:** modelo de datos peor para nuestro caso (reportes tabulares).

### Alternativa D — Cloudflare Workers + D1 SQLite

**Pros:**
- Edge functions ultra-rápidas.
- SQLite serverless, free tier generoso.

**Cons:**
- Sin UI familiar (no sheet visible al usuario).
- Stack más técnico que Apps Script para un solo dev.

**Rejection reason:** stack más opinado, sin beneficio claro vs Apps Script en este punto.

### Alternativa E — Vercel Functions + Postgres Neon

**Pros:** todo en Vercel (cliente PWA + backend funciones).

**Cons:** Vercel free tier no incluye DB; Neon free es 500MB pero requiere conexión gestionada; complejidad de auth.

**Rejection reason:** misma razón que Supabase pero menos integrado.

## Rationale

**Drivers de decisión:**

1. **No fix what isn't broken.** El backend actual funciona, ya tiene seguridad establecida (acceso público pero URL no expuesta), ya tiene 1 mes de uso real con el App Inventor sin issues. Migrar gratis no es gratis — es 1-2 semanas del único dev.
2. **El usuario quiere ver los datos en Sheets.** Quitarle eso introduce fricción donde antes había confort.
3. **Fase 1 single-instructor no estresa los límites** de Apps Script. Los límites no son hipotéticos — son medibles. Si en Fase 2 los rompemos, ahí migramos con datos concretos.
4. **Diferir bien**: la migración futura a Supabase tiene un hook arquitectónico: el cliente PWA habla con un endpoint vía HTTP — el cliente no sabe si detrás hay Apps Script o Postgres. Cambiar el backend en Fase 2 NO requiere reescribir el cliente.

## Consequences

### Positive
- **Zero migration cost** en Fase 1.
- **Continuidad operativa** — el sheet vivo sigue siendo el sheet vivo.
- **Backup gratis** vía Google.
- **El usuario sigue revisando manualmente cuando quiere** (workflow conocido).
- **Cliente PWA queda abstraído** del backend por el contrato HTTP — facilita migración futura.

### Negative
- **Apps Script no es ideal para reportes complejos** — exports masivos (CSV de 1 año, ~7,500 filas) podrían acercarse al timeout de 6 min en cuenta consumer. Mitigación: paginación / queries con offset+limit.
- **No hay realtime** — Fase 2 coordinator querría ver marcas de instructores en tiempo real; no aplica Fase 1 pero es un techo conocido.
- **Auth es "security through obscurity"** — el endpoint público no escala a Fase 2 multi-tenant. Se aborda en ADR-006.
- **Locale es_CO requiere cuidado en cada nuevo endpoint** — riesgo de repetir el bug de `setFormula` (ya mitigado en ADR-005).

### Neutral
- El backend sigue siendo "el sheet del usuario" — pertenece a su Drive, no a un servicio externo. Eso es positivo para data ownership, neutro para escalabilidad.

### Risks
- **Riesgo:** Apps Script free tier reduce más los límites (ya hubo cambios históricos). **Indicador:** dashboard de Google "Apps Script quotas" cae <50% disponible diario. **Mitigación:** Workspace upgrade $5/mes habilita 6h/día — pero ese es el momento de migrar.
- **Riesgo:** Cold start crece en producción (no hay SLA). **Indicador:** latencia p95 de marcado > 2s consistente. **Mitigación:** keep-alive ping cada 5 min — pero esto consume quota, evaluar.

## Implicaciones cross-fase

| Fase | Comportamiento | Hook HOY | Qué la bloquearía si se hace mal |
|---|---|---|---|
| **Fase 1** | Apps Script + Sheets, 1 instructor, 1 sheet. | Cliente PWA habla por HTTP a un endpoint configurable en localStorage. | Hardcodear URL en código → cualquier migración futura requiere build nuevo del cliente. |
| **Fase 2** | Posible migración a Supabase. Cliente PWA cambia solo el endpoint en settings; los contratos HTTP (`?accion=X&num=Y` → response JSON) se mantienen o el cliente añade lógica de adaptador. | El cliente NO accede al sheet directamente (siempre vía endpoint) → 100% del backend es reemplazable. | Bypass del endpoint para leer sheet directo desde cliente → lock-in al sheet. |
| **Fase 3** | Backend definitivo según escala (probablemente Supabase). El "sheet" se vuelve un export read-only del backend si el usuario lo quiere. | El modelo de datos (Aprendiz, Asistencia) ya pensado para SQL en data-model.md §Future-proofing. | — |

[PHASE-DEFERRED: migración de backend — Fase 2 a deliberar al cumplir gate; hook hoy es contract HTTP estable y endpoint configurable.]

## Validation plan

- **Leading:** quota usage diaria de Apps Script. Si pasa de 50%, alerta.
- **Lagging:** latencia p95 mensual. Si supera 2s sustained, considerar migración.
- **Review trigger:** Fase 2 entrando + ≥3 instructores + ≥1 reporte de "espera mucho" del usuario real.

## Implementation notes

- Mantener `SS_ID` como constante única en `merged.gs`.
- Cada nuevo endpoint sigue el patrón `?accion=X&...` y retorna `{ok: bool, ...}`.
- `merged.gs` se actualiza vía editor de Apps Script (ya hay un flujo establecido con Playwright para automatizar push si quisiéramos).
- Cada nuevo endpoint que escriba al sheet debe respetar el gotcha de `setFormula` documentado en ADR-005.

## References

- `merged.gs` — código backend actual.
- `01-product-vision.md` §6.4 — principio "backend Google es activo, cliente desechable".
- Memory `project_asistencia.md`, `gotcha_apps_script_setformula_locale.md`.
- `04-product-requirements.md` §5 — NFRs que este backend cumple.
