# API Specification · Asistencia SENA Backend (Apps Script Web App)

**Versión:** 1.0
**Fecha:** 2026-05-23
**Base URL:** `https://script.google.com/macros/s/<deployment-id>/exec`

Endpoint único `doGet(e)` con routing por query param `accion`. Todos los endpoints retornan JSON.

---

## Convenciones globales

- **Method:** todos GET (Apps Script `doGet`); body en query string.
- **Auth:** ninguno en Fase 1; URL pública (security through obscurity).
- **Response envelope:** `{ok: boolean, ...}`; en error: `{ok: false, error: "<msg>"}`.
- **Encoding:** UTF-8.
- **Locale:** `America/Bogota` para todas las fechas.
- **Idempotencia:** endpoints de escritura aceptan `marca_id` (UUID) — reenviar mismo `marca_id` es no-op.

---

## `?accion=consultar&num=<ficha>`

**Lee datos de un aprendiz por ficha.**

**Request:**
```
GET /exec?accion=consultar&num=31145789
```

**Response 200 (encontrado activo):**
```json
{
  "ok": true,
  "encontrado": true,
  "ficha": "31145789",
  "nombre": "Luis Gerardo Gómez",
  "documento": "80123456",
  "foto": "https://drive.google.com/uc?export=view&id=1Cc_sxmhRWtsNTkjUbVDLw4COOF-UfaF5",
  "activo": true,
  "grupo": "default"
}
```

**Response 200 (no encontrado):**
```json
{"ok": true, "encontrado": false, "ficha": "31145789"}
```

**Response 200 (inactivo):**
```json
{"ok": true, "encontrado": true, "activo": false, "ficha": "31145789", "nombre": "..."}
```

**Errors:**
- `{ok: false, error: "Falta pestaña Aprendices"}` — sheet mal configurado.
- `{ok: false, error: "Header 'ficha' no encontrado"}` — columna desaparecida.

**Status:** ✅ implementado en `merged.gs` con campo `grupo` agregado (ADR-006).

---

## `?accion=registrar&num=<ficha>&estado=<estado>&marca_id=<uuid>&timestamp_local=<iso>&instructor_id=<id>&grupo=<g>`

**Registra una marca de asistencia.**

**Request:**
```
GET /exec?accion=registrar&num=31145789&estado=Presente&marca_id=abc-123&timestamp_local=2026-05-23T07:42:15-05:00
```

Params:
- `num` (required) — ficha.
- `estado` (optional, default `"Presente"`) — uno de `Presente|Tarde|Justificado|Ausente`.
- `marca_id` (optional, recomendado) — UUID. Si no se envía, server genera uno.
- `timestamp_local` (optional, default `now` server-side) — ISO 8601 con TZ. Útil para sync de marcas offline (preserva el momento real).
- `instructor_id` (optional, default `"primary"`) — Fase 2 hook.
- `grupo` (optional, default `"default"`) — Fase 2 hook.

**Response 200 (registrado nuevo):**
```json
{
  "ok": true,
  "registrado": true,
  "ficha": "31145789",
  "nombre": "Luis Gerardo Gómez",
  "documento": "80123456",
  "foto": "https://drive.google.com/uc?export=view&id=...",
  "marcaTemporal": "23/05/2026 07:42:15",
  "marca_id": "abc-123",
  "operation": "insert"
}
```

**Response 200 (update — ya existía marca para este ficha+fecha+instructor):**
```json
{
  ...,
  "operation": "update",
  "previous_estado": "Tarde"
}
```

**Response 200 (idempotente — mismo marca_id):**
```json
{..., "operation": "noop"}
```

**Response 200 (rechazada — no encontrada o inactiva):**
```json
{"ok": true, "registrado": false, "motivo": "Ficha no encontrada", "ficha": "99999999"}
```

**Errors:**
- `{ok: false, error: "estado inválido"}`.
- `{ok: false, error: "Falta pestaña Asistencias"}`.

**Status:** parcialmente implementado en `merged.gs`. **Nuevos params a agregar:** `estado`, `marca_id`, `timestamp_local`, `instructor_id`, `grupo`. **Nueva lógica:** idempotencia por `marca_id` + update por `(ficha, fecha, instructor_id)`. Backlog E1.1.4.

---

## `?accion=contar`

**Cuenta registros del padrón y log.**

**Response 200:**
```json
{"ok": true, "aprendices": 8, "asistencias": 142}
```

**Status:** ✅ implementado.

---

## `?accion=listaPadron&grupo=<g>&instructor_id=<id>` (NUEVO)

**Retorna el padrón completo (filtrable por grupo / instructor).**

**Request:**
```
GET /exec?accion=listaPadron
```

**Response 200:**
```json
{
  "ok": true,
  "padron": [
    {"ficha": "31145789", "nombre": "Luis Gerardo Gómez", "documento": "80123456", "foto": "https://...", "activo": true, "grupo": "default"},
    ...
  ]
}
```

**Status:** **a implementar** Fase 1 — Backlog E1.2.1.

---

## `?accion=listaHoy&grupo=<g>&instructor_id=<id>` (NUEVO)

**Retorna padrón + estado de asistencia del día actual, en un solo round-trip.**

**Response 200:**
```json
{
  "ok": true,
  "fecha": "2026-05-23",
  "padron": [...],
  "asistencias_hoy": {
    "31145789": {"estado": "Presente", "hora": "07:02:14", "marca_id": "abc-..."},
    "465789": {"estado": "Tarde", "hora": "07:34:00", "marca_id": "def-..."}
  }
}
```

**Status:** **a implementar** Fase 1 — Backlog E1.3.1.

---

## `?accion=stats&dias=10&instructor_id=<id>` (NUEVO)

**Retorna estadísticas analíticas por aprendiz para los últimos N días lectivos.**

**Request:**
```
GET /exec?accion=stats&dias=10
```

**Response 200:**
```json
{
  "ok": true,
  "periodo": {"desde": "2026-05-12", "hasta": "2026-05-22", "dias_lectivos": 10},
  "grupo": [
    {
      "ficha": "31145789",
      "nombre": "Luis Gerardo Gómez",
      "total_dias": 10,
      "presente": 10, "tarde": 0, "justificado": 0, "ausente": 0,
      "dias_validos": 10,
      "pct": 100,
      "racha_actual": 0,
      "racha_max": 0,
      "ausencias_disco": 0,
      "en_riesgo": false
    },
    ...
  ],
  "patrones_semana": [
    {"dia": "lun", "pct": 73},
    {"dia": "mar", "pct": 75},
    ...
  ],
  "data_quality_warning": false
}
```

**Status:** **a implementar** Fase 1 — Backlog E1.3.5.

---

## `?accion=undo&marca_id=<uuid>` (NUEVO)

**Deshace una marca por su UUID.**

**Response 200:**
```json
{"ok": true, "deshecho": true, "marca_id": "abc-..."}
```

**Response 200 (no encontrada):**
```json
{"ok": true, "deshecho": false, "motivo": "Marca no encontrada"}
```

**Status:** **a implementar** Fase 1 — Backlog E1.1.5.

---

## `?accion=export&desde=<YYYY-MM-DD>&hasta=<YYYY-MM-DD>&instructor_id=<id>` (NUEVO)

**Exporta marcas como CSV.**

**Response 200:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename=asistencia-20260501-20260523.csv

fecha,ficha,nombre,estado,hora,instructor_id,grupo
23/05/2026,31145789,"Luis Gerardo Gómez",Presente,07:02:14,primary,default
...
```

**Errors:**
- Periodo > 1 año → `{ok: false, error: "Periodo demasiado largo"}`.

**Status:** **a implementar** Fase 1 — Backlog E1.3.6.

---

## Rate limits

Apps Script consumer:
- 90 segundos de ejecución total por día.
- 6 minutos de timeout por ejecución.
- 30 calls/segundo (no documentado oficialmente).

En Fase 1 single-instructor estos límites están a ~10% del techo.

## Cross-references

- `srd.md` — visión del sistema.
- `frd.md` — funciones que estos endpoints exponen.
- `data-model.md` — schemas de las pestañas.
- ADR-003 (backend), ADR-005 (locale), ADR-006 (hooks Fase 2).
