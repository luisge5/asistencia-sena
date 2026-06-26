# ADR-005 · Locale es_CO obligatorio + Resumen con valores calculados (no fórmulas)

**Status:** Accepted · 2026-05-23 · supersede de aproximación inicial con `setFormula`

---

## Context

Durante el desarrollo del backend se descubrió un bug crítico: `Range.setFormula()` en una hoja con locale es_CO produce celdas con `#ERROR!`. La causa raíz es que Apps Script almacena las fórmulas literalmente con comas (US locale) aunque el código las envíe con punto y coma; el parser del sheet en es_CO no las reconoce y produce error de análisis de fórmula. Adicionalmente, hubo bug de timezone — `new Date(now.getFullYear(), ...)` lee componentes en TZ del runtime del script (UTC), no del sheet (Bogotá), corriendo la fecha un día [from: memoria `gotcha_apps_script_setformula_locale.md`].

Estos dos bugs juntos forzaron una decisión arquitectónica: ¿cómo construye el sistema valores derivados (% asistencia, faltantes hoy, última asistencia) en el Resumen?

Opciones:
- **Fórmulas en celdas (setFormula)** — la "natural" en Sheets
- **Valores calculados en JS y escritos con setValue** — la pragmática
- **Híbrido**: algunas celdas con fórmula, otras con valores
- **Cliente PWA calcula y muestra; sheet solo guarda raw data**

## Decision

**El backend Apps Script calcula los valores derivados en JavaScript y los escribe con `setValue()`. El Resumen no contiene fórmulas vivas — son valores estáticos refrescados por `refreshResumen()`.** El cliente PWA, además, calcula sus propias estadísticas (rachas, en riesgo, patrones de semana) directamente del raw data de `Asistencias`, sin depender del Resumen del sheet.

**Locale es_CO se trata como producto, no como localización futura:** `Utilities.formatDate(date, TIMEZONE, ...)` con `TIMEZONE = "America/Bogota"` se usa SIEMPRE que se serializa o parsea una fecha. `new Date(year, month, day)` está prohibido para construir fechas calendario — usar `bogotaMidnight()` helper que va vía `formatDate` + `parseDate`.

> **Decision summary:** sin fórmulas en Sheets (todo setValue); fechas siempre vía `formatDate(TIMEZONE)`; el dashboard del PWA calcula del raw, no del Resumen.

## Alternatives considered

### Alternativa A — Valores calculados en JS (elegida)

**Pros:**
- **Funciona en cualquier locale** sin pelearse con el parser de Sheets.
- **Tests más simples** — comparar números, no parsing de fórmulas.
- **Cliente PWA tiene más control** — puede calcular en frontend para feedback instantáneo.

**Cons:**
- **Resumen se vuelve "stale"** — refleja el estado al momento de la última `refreshResumen()`. Si alguien marca asistencia y nadie corre el refresh, el Resumen no actualiza solo. Mitigación: trigger Apps Script que corra `refreshResumen()` después de cada registrar (al final de `registrar()`).
- **Doble cálculo** — backend Y cliente recalculan. Para nuestros volúmenes (decenas de aprendices) no es problema.

**Rejection reason:** N/A — elegida.

### Alternativa B — Fórmulas con `setFormulaLocalized` o `setFormula(",")` cuidadosa

**Investigado y descartado.** `setFormulaLocalized` no existe como método de Range (solo `getFormulaLocalized` para lectura). `setFormula` con comas se almacena con comas literalmente y produce `#ERROR!` en es_CO. Sin opción.

**Rejection reason:** la API simplemente no soporta el caso.

### Alternativa C — Cliente PWA calcula todo; el Resumen del sheet ni existe

**Pros:** elimina ambigüedad sobre quién es la fuente del Resumen.

**Cons:** el usuario abre el sheet directamente a veces (es parte del valor) y querría ver KPIs ahí también. Borrar el Resumen reduce el valor del Sheets-as-UI.

**Rejection reason:** quita un punto de valor para el usuario.

## Rationale

**Drivers:**
1. **La API no permite fórmulas en es_CO sin bugs** — esto es objetivo, no preferencia.
2. **El cliente PWA es el primary UI** — el Resumen del sheet es secundario; basta con que se mantenga al día con refresh post-mark.
3. **Locale como decisión de producto** — declararlo explícitamente desde Fase 1 evita repetir el bug en cada nuevo endpoint.

## Consequences

### Positive
- **Eliminó el bug `#ERROR!`** que rompía Resumen.
- **Eliminó el bug de fecha** corrida un día.
- **Stack consistente**: cualquier valor derivado se calcula en JS, no en fórmula.

### Negative
- **El Resumen no se actualiza solo** cuando alguien marca asistencia. Hay que invocar `refreshResumen()` manualmente o desde `registrar()`. Mitigación implementada: `applyTimezoneFix` y `refreshResumen` exportadas como funciones del Apps Script.
- **Dos lugares con lógica de cálculo** (backend `refreshResumen`, cliente PWA en vista Histórico). Drift posible si se modifica una sin la otra. Mitigación: el cliente NO depende del Resumen — calcula del raw — esto reduce riesgo de drift.
- **Locale hardcoded a es_CO** — si en Fase 3 alguien usa el sistema en Perú, hay que sacar `TIMEZONE` a config.

### Neutral
- El `Resumen` del sheet sigue existiendo como "vista para abrir el sheet" — su rol cambió de "fuente de verdad de KPIs" a "última foto refrescada".

### Risks
- **Riesgo:** alguien añade nuevo endpoint sin usar el helper `bogotaMidnight` o sin formatDate explícito → bug TZ reaparece. **Mitigación:** lint manual (¿hay alguno?) o convención + comments en `merged.gs`. Crear `bogotaMidnight()` y `bogotaFormatDate()` como helpers obligatorios.
- **Riesgo:** el usuario abre el sheet y se confunde porque el Resumen no refleja lo último. **Mitigación:** automatizar `refreshResumen()` al final de `registrar()` (ya hecho); también desde el cliente PWA tras sync offline.

## Implicaciones cross-fase

| Fase | Comportamiento | Hook HOY | Qué la bloquearía |
|---|---|---|---|
| **Fase 1** | Locale es_CO hardcoded como constante. setValue para todo. | `TIMEZONE` y `bogotaMidnight` como constantes/funciones globales del Apps Script. | Nuevos endpoints que no usen las funciones helper → reintroducen bug. |
| **Fase 2** | Mismo locale (todos los instructores en Colombia en Fase 2). | — | — |
| **Fase 3** | Posible expansión fuera de Colombia → sacar `TIMEZONE` a config per-tenant. | El sheet sigue siendo el del usuario → su TZ se puede leer de `ss.getSpreadsheetTimeZone()`. | Hardcodear más TZ stuff sin centralizar. |

[PHASE-DEFERRED: i18n / multi-locale — Fase 3.]

## Validation plan

- **Leading:** dentro de Apps Script, asegurarse que CADA nuevo endpoint corre tests con un sheet en es_CO antes de release.
- **Lagging:** reporte de usuario "veo #ERROR" o "la fecha está mal" → blocker, hot-fix inmediato.
- **Review trigger:** cualquier intento de añadir fórmulas al sheet — debe pasar code review explícitamente.

## Implementation notes

- **Helpers obligatorios** en `merged.gs`:
  ```js
  const TIMEZONE = "America/Bogota";
  function bogotaMidnight(date) {
    var ymd = Utilities.formatDate(date, TIMEZONE, "yyyy-MM-dd");
    return Utilities.parseDate(ymd, TIMEZONE, "yyyy-MM-dd");
  }
  function bogotaFormatDate(date, fmt) {
    return Utilities.formatDate(date, TIMEZONE, fmt);
  }
  ```
- **Reglas para nuevos endpoints:**
  - Toda fecha que se escribe al sheet pasa por `bogotaMidnight()` (para columna `fecha`) o `now` directo para `hora` (con `setNumberFormat("HH:mm:ss")` per-row).
  - Toda fecha que se serializa a respuesta JSON pasa por `bogotaFormatDate()`.
  - Nunca usar `new Date(y, m, d)` para construir fecha calendario.
- **Comportamiento de `setSpreadsheetTimeZone(TIMEZONE)`** en `setupSheet` y `applyTimezoneFix` — asegura que el display del sheet también esté en Bogotá.
- **`refreshResumen()`** calcula todo en JS y escribe con setValue. Llamada desde `setupSheet()` al final + opcionalmente desde `registrar()` (trade-off: latencia de cada marca aumenta ~0.5s).

## References

- Memory `gotcha_apps_script_setformula_locale.md` — el bug que motivó esta ADR.
- `merged.gs` — implementación actual con todas las decisiones aplicadas.
- ADR-003 — backend Apps Script.
- `07-technical/api-spec.md` — endpoints que respetan estas reglas.
