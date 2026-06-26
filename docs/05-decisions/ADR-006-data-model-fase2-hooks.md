# ADR-006 · Modelo de datos con hooks para Fase 2 (multi-instructor + multi-ficha)

**Status:** Accepted · 2026-05-23

---

## Context

Fase 1 es single-instructor + single-ficha. El sheet `asistencia.1` tiene 1 pestaña `Aprendices` con el padrón y 1 pestaña `Asistencias` con el log de marcas. Esto funciona para Fase 1, pero Fase 2 (multi-instructor + multi-ficha + coordinador con vista consolidada) y Fase 3 (posible vista de aprendiz + integración SENA institucional) tienen requerimientos que afectan el modelo de datos. La decisión: **¿qué hooks dejamos en el modelo de Fase 1 para que Fase 2/3 no requieran reescritura?**

Constraints: el sheet vivo del usuario no se debe romper; agregar columnas vacías es barato pero quita legibilidad; cambiar el sheet en Fase 2 (agregar columnas) sí es viable pero implica downtime / data migration.

## Decision

**Agregamos 2 columnas en `Asistencias` y 1 columna en `Aprendices` desde Fase 1**, aunque solo se llenen con valores default en Fase 1. Esto permite que Fase 2 active features sin renombrar/migrar:

**Aprendices** (padrón):
- `ficha`, `nombre`, `documento`, `foto_url`, `activo` (existentes)
- `grupo` (NUEVO — string, default `"default"`) → permite Fase 2 agrupar aprendices por ficha curso (varios grupos en un sheet)

**Asistencias** (log):
- `fecha`, `hora`, `ficha`, `nombre`, `estado` (existentes)
- `instructor_id` (NUEVO — string, default `"primary"`) → permite Fase 2 distinguir cuál instructor marcó (varios instructores sobre el mismo padrón)
- `marca_id` (NUEVO — string, default UUID generado server-side) → idempotencia y undo posterior; clave única estable

`Resumen` no cambia estructura (sigue siendo dashboard cliente).

> **Decision summary:** 3 columnas reservadas desde Fase 1 (`grupo`, `instructor_id`, `marca_id`) con valores default; Fase 2 los rellena con valores reales sin migrar.

## Alternatives considered

### Alternativa A — Agregar columnas hoy con defaults (elegida)

**Pros:**
- **Fase 2 cero-migración** — solo cambia el código que las llena.
- **Idempotencia** (`marca_id`) habilita undo robusto desde Fase 1.
- **Audit trail** (`instructor_id` aunque sea fijo) prepara reportes Fase 2.

**Cons:**
- **Columnas vacías molestan visualmente** al usuario que abre el sheet.
- **Si Fase 2 nunca llega** (riesgo bajo dada la trayectoria), las columnas son ruido permanente.

**Rejection reason:** N/A — elegida.

### Alternativa B — Esperar a Fase 2 y migrar entonces

**Pros:** sheet más limpio hoy.

**Cons:**
- Migrar 1000+ filas históricas + cambiar el código + redeployar requiere ventana de mantenimiento.
- Pierde idempotencia en Fase 1 (sin `marca_id`, undo es heurístico: "borra última fila para esa ficha hoy").

**Rejection reason:** la regla de oro del pipeline: "diferir bien" requiere hooks; sin hooks Fase 2 = reescritura. Migrar histórico de un sheet vivo es exactamente el tipo de fricción que queremos evitar.

### Alternativa C — Modelo separado para multi-tenant (un sheet por instructor)

**Pros:** simplicidad por instructor.

**Cons:** sin vista cross-instructor para coordinador (Fase 2 requirement central) → tendría que sincronizar N sheets a un sheet maestro = complejidad.

**Rejection reason:** rompe la premisa de Fase 2 (vista consolidada).

### Alternativa D — Migrar todo a Supabase ahora "por si acaso"

**Pros:** modelo relacional limpio.

**Cons:** ADR-003 ya rechaza migración prematura.

**Rejection reason:** mismo razonamiento que ADR-003.

## Rationale

**Drivers:**
1. **"Diferir bien ≠ diferir y rezar"** [from: PVD §6.5 principio + SKILL.md §Phase-depth policy]. Cada `[PHASE-DEFERRED]` debe tener hook arquitectónico — sin las columnas, Fase 2 sería reescritura.
2. **Costo marginal de 3 columnas con default es trivial** (5 min de código, 0 de mantenimiento ongoing).
3. **`marca_id` ya da valor en Fase 1** — undo robusto + idempotencia al re-sincronizar offline.

## Consequences

### Positive
- Fase 2 puede activar multi-instructor y multi-ficha **sin migración de datos**.
- Idempotencia desde Fase 1 robustece offline sync.
- Audit trail preparado.

### Negative
- 3 columnas extra al abrir el sheet — feo pero soportable.
- `marca_id` necesita generarse en backend (`Utilities.getUuid()`) — extra trabajo del Apps Script en cada `registrar()`.

### Neutral
- El cliente PWA puede ignorar las columnas extra en Fase 1 sin problema.

### Risks
- **Riesgo:** alguien edita el sheet manualmente y se pierden los defaults → registros sin `marca_id`. **Indicador:** queries que asumen `marca_id` no null fallan. **Mitigación:** backend tolera `marca_id` faltante (no falla), pero el undo robusto solo funciona para marcas creadas por el sistema.

## Implicaciones cross-fase

| Fase | Comportamiento | Hook que existe HOY | Qué la bloquearía |
|---|---|---|---|
| **Fase 1** | `grupo="default"`, `instructor_id="primary"`, `marca_id` generado en cada registrar. | Las 3 columnas existen y se llenan. | No agregar las columnas → Fase 2 requiere ALTER del sheet (que en Sheets es manual y pesado en sheets con muchas filas). |
| **Fase 2** | `grupo` con nombre real del curso (e.g., "ADSI-mañana"); `instructor_id` con identificador real (e.g., email del instructor); `marca_id` ya existía. | El backend ya admite parámetros opcionales en `registrar?grupo=X&instructor_id=Y`. | Hardcodear `grupo` o `instructor_id` en el cliente PWA. |
| **Fase 3** | Si se integra con sistema SENA, los IDs pueden mapearse al sistema institucional (e.g., `instructor_id = email institucional SENA`). | Strings flexibles, sin restricción de formato → cualquier ID externo se acepta. | — |

[PHASE-DEFERRED: filas con valores no-default — Fase 2 a deliberar al cumplir gate; hook hoy son las 3 columnas reservadas.]

## Validation plan

- **Leading:** revisar tras 1 mes en aula que las columnas extra no causen confusión / problemas al usuario.
- **Lagging:** cuando se haga el primer registrar Fase 2 con `instructor_id` real, validar que ese registro convive bien con los `"primary"` previos en queries.

## Implementation notes

- En `setupSheet()` agregar las 3 columnas con sus encabezados.
- En `registrar()` generar `marca_id = Utilities.getUuid()` y siempre llenarlo.
- Defaults para `grupo` y `instructor_id` se establecen en `merged.gs` como constantes:
  ```js
  const DEFAULT_GRUPO = "default";
  const DEFAULT_INSTRUCTOR_ID = "primary";
  ```
- El endpoint `?accion=registrar` acepta params opcionales `&grupo=...&instructor_id=...` que si no se pasan usan defaults.
- En PWA Fase 1, el cliente NO los pasa → defaults aplican → comportamiento idéntico a antes.
- En Fase 2, el cliente PWA configura `instructor_id` en localStorage al login del coordinador / instructor → se pasa en cada request.

## References

- ADR-003 — backend Apps Script (no migra a SQL en Fase 1).
- `01-product-vision.md` §6.5 — principio "diferir bien".
- `04-product-requirements.md` §8 — fases y gates.
- `07-technical/data-model.md` §Future-proofing — donde se detalla el schema con las columnas reservadas.
