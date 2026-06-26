# Data Model · Asistencia SENA

**Versión:** 1.0
**Fecha:** 2026-05-23

Persistencia: Google Sheets `asistencia.1` (ID `1QAbakTBpfWI4ecyOYJTlMer1WIEY9qqSlrl82UM61ww`). Tres pestañas: `Aprendices`, `Asistencias`, `Resumen`.

---

## Entity inventory

| Entity | Storage | Type | Purpose |
|---|---|---|---|
| Aprendiz | Pestaña `Aprendices` | Padrón (1 fila por aprendiz activo o inactivo) | Identidad y metadatos del estudiante |
| Asistencia | Pestaña `Asistencias` | Log append-only (1 fila por marca) | Evento de asistencia |
| Resumen | Pestaña `Resumen` | Calculado (1 fila por KPI) | KPIs refrescados — vista para abrir el sheet |
| Settings | localStorage cliente | Singleton | Configuración del cliente PWA |
| PendingMark | localStorage cliente | Queue | Cola de marcas offline |

---

## Entity: Aprendiz

**Pestaña:** `Aprendices`
**PK:** `ficha`
**Mutability:** mutable (alta/baja de aprendices, cambio de activo, foto).

| Columna | Letra | Tipo | Constraints | Notas |
|---|---|---|---|---|
| `ficha` | A | string | required, unique, regex `^\d{6,8}$` | Identificador único del aprendiz (no del grupo); número impreso en QR del carnet |
| `nombre` | B | string | required, max 100 chars | Nombre completo en orden natural (Nombres Apellidos) |
| `documento` | C | string | optional, max 12 chars | Número de documento de identidad. PII — Ley 1581/2012 Colombia |
| `foto_url` | D | string (URL) | optional | URL pública de Drive (`uc?export=view&id=...`); `merged.gs` convierte URLs `view?usp=sharing` automáticamente |
| `activo` | E | enum `SI` \| `NO` | required, default `SI` | Aprendices con `NO` no aparecen en padrón ni se pueden marcar |
| `grupo` | F | string | optional, default `"default"` | Fase 2 hook — agrupar aprendices del padrón por curso/jornada (ADR-006) |

**Indexes:** solo `ficha` es referenciada por `Asistencias.ficha` — efectivamente un índice por columna A.

**Relationships:**
- 1 Aprendiz → N Asistencias (FK `Asistencia.ficha` → `Aprendiz.ficha`).

**Validation:**
- `activo` columna E tiene data validation lista `SI/NO` (configurada en `merged.gs` setupSheet).
- `ficha` debe ser único — validación manual (Sheets no impone unique constraint).

**Sample data:**
```
ficha,nombre,documento,foto_url,activo,grupo
31145789,Luis Gerardo Gómez,80123456,https://drive.google.com/uc?export=view&id=1Cc_sxmhRWtsNTkjUbVDLw4COOF-UfaF5,SI,default
465789,Pedro Luis Gómez,80234567,https://drive.google.com/uc?export=view&id=1-02Ri33Jbb_l2ZHovRU0z7xjljjcO0b4,SI,default
789003,Camilo Daniel Escudero,80345678,https://drive.google.com/uc?export=view&id=12EHMqU7rhzYEMUiSDyhe7GQtqX37phi-,SI,default
```

---

## Entity: Asistencia

**Pestaña:** `Asistencias`
**PK compuesta:** `(ficha, fecha, instructor_id)` — una fila por día/aprendiz/instructor. Cambio de estado → UPDATE, no INSERT (ADR-005).
**Alternative PK:** `marca_id` (UUID único per evento) → utilizado para idempotencia y undo (ADR-006).
**Mutability:** append-mostly; updates en cambio de estado del mismo día; deletes solo vía undo.

| Columna | Letra | Tipo | Constraints | Notas |
|---|---|---|---|---|
| `fecha` | A | Date | required, format `dd/MM/yyyy`, TZ Bogotá | Día calendario (medianoche Bogotá). Construido vía `bogotaMidnight(now)` (ADR-005) |
| `hora` | B | Date (time portion) | required, format `HH:mm:ss`, TZ Bogotá | Timestamp completo del momento de marcar. Sheet display formateado por column |
| `ficha` | C | string | required, FK `Aprendices.ficha` | Aprendiz marcado |
| `nombre` | D | string | redundante con FK | Cached para queries rápidos sin join |
| `estado` | E | enum | required, validation list `Presente|Tarde|Justificado|Ausente` | Estado de asistencia |
| `grupo` | F | string | required, default `"default"` | Fase 2 hook |
| `instructor_id` | G | string | required, default `"primary"` | Fase 2 hook — quién marcó |
| `marca_id` | H | string (UUID) | required, unique | Generado server-side (`Utilities.getUuid()`) o cliente-side (`crypto.randomUUID()`); habilita idempotencia y undo |

**Indexes:** ninguno explícito (Sheets no soporta); búsquedas vía `getDataRange().getValues()` iterando.

**Conditional formatting (Sheet UI):**
- `Presente` → bg verde claro `#C8E6C9`, fg verde oscuro `#1B5E20`.
- `Tarde` → bg naranja `#FFE0B2`, fg `#E65100`.
- `Justificado` → bg azul claro `#DBEAFE`, fg `#0369A1`.
- `Ausente` → bg rojo claro `#FFCDD2`, fg `#B71C1C`.

**Sample row:**
```
fecha       hora        ficha     nombre               estado     grupo    instructor_id  marca_id
22/05/2026  07:02:14    31145789  Luis Gerardo Gómez   Presente   default  primary        f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**FSM (estado lifecycle):**

```
       (nuevo registro)
            │
            ▼
        Presente ────► Tarde ────► Justificado
            ▲           ▲              ▲
            │           │              │
            └─── (cambio de estado dentro del mismo día) ──┘
                                                          │
                                                          ▼
                                                       Ausente
                                                          │
                                                          ▼
                                                    [undo] → fila eliminada
```

Cualquier estado puede transicionar a cualquier otro mientras estemos en el mismo día calendario; tras cambiar día, la marca queda "frozen" salvo manualmente desde el sheet.

**Edge cases:**
- Fila con marca_id null (legacy / editada manualmente): tolerada por backend, no participa en undo.
- Misma ficha + fecha + instructor_id duplicada (legacy / bug): backend resuelve por última fila (mayor row index).
- `nombre` desincronizado del padrón (alguien editó manualmente): `consultar` siempre lee del padrón fresco; `Asistencias.nombre` es solo cached.

---

## Entity: Resumen

**Pestaña:** `Resumen`
**PK:** N/A (es un dashboard, no tabla).
**Mutability:** sobreescrita por `refreshResumen()`. NO contiene fórmulas (ADR-005).

| Celda | Label | Tipo | Computación |
|---|---|---|---|
| A1 | `RESUMEN DE ASISTENCIA` | string | Header literal |
| A3 / B3 | Fecha de consulta | string | `Utilities.formatDate(now, TIMEZONE, "dd/MM/yyyy")` |
| A5 / B5 | Aprendices activos | number | `count(Aprendices where activo=SI)` |
| A6 / B6 | Total aprendices | number | `count(Aprendices)` |
| A8 / B8 | Asistencias HOY | number | `count(Asistencias where fecha=today AND estado in (Presente,Tarde))` |
| A9 / B9 | Faltantes HOY | number | `Aprendices_activos - Asistencias_HOY` |
| A11 / B11 | Última asistencia registrada | string | timestamp formateado de la última fila de Asistencias, o `"sin registros"` |

---

## Entity: Settings (cliente)

**Storage:** `localStorage`
**Schema:**
```typescript
{
  endpoint: string;            // URL del Apps Script Web App
  ficha_curso: string;         // identificador del curso (mostrado en topbar)
  umbral_tarde: string;        // "HH:mm" — hora a partir de la cual cuenta como Tarde
  vibrar_al_escanear: boolean; // default true
  modo_offline: boolean;       // default true
  instructor_id?: string;      // Fase 2
  grupo?: string;              // Fase 2
}
```

---

## Entity: PendingMark (cliente, queue offline)

**Storage:** `localStorage["pending_marks"]` (array JSON).
**Schema:**
```typescript
{
  ficha: string;
  estado: "Presente" | "Tarde" | "Justificado" | "Ausente";
  timestamp_local: string;     // ISO 8601 con offset Bogotá
  created_at: number;          // Date.now() para ordering
  marca_id: string;            // UUID generado en el cliente
  retry_count: number;         // veces que falló al sincronizar
  status: "pending" | "failed";
  error_msg: string;
}
```

Limpieza: tras sync exitoso, item se remueve del array.

---

## Migration strategy

**Fase 0 → Fase 1:**
- Sheet ya tiene pestañas Aprendices y Asistencias con columnas básicas.
- Migración:
  1. Backup del sheet actual.
  2. Agregar columnas `grupo`, `instructor_id`, `marca_id` (ya con defaults). `applyTimezoneFix` extendido para esto. **Migración no-destructiva.**
  3. Para filas históricas: `grupo="default"`, `instructor_id="primary"`, `marca_id=Utilities.getUuid()`.
  4. Re-deploy Apps Script con nuevos endpoints.

**Fase 1 → Fase 2:**
- `instructor_id` empieza a llevar valores reales (email del instructor).
- Endpoints existentes admiten `instructor_id` ya — solo cambia el cliente para pasarlo.
- Cero migración de datos históricos (los `"primary"` quedan como audit trail del periodo Fase 1).

## Future-proofing — hooks anticipados

Algunas estructuras que NO se construyen hoy pero el modelo prevé:

### Fase 2 — pestaña `Coordinadores` (anticipada, NO se construye Fase 1)

```sql
-- PSEUDO-DDL · NO se construye hoy
-- [PHASE-DEFERRED: Fase 2 — DDL completo a deliberar al cumplir gate]
CREATE TABLE coordinadores (
  id TEXT PRIMARY KEY,           -- email institucional
  nombre TEXT NOT NULL,
  fichas_asignadas TEXT[],       -- array de fichas/grupos que supervisa
  fecha_alta TIMESTAMPTZ DEFAULT NOW()
);
```

### Fase 2 — pestaña `Instructores`

```sql
-- PSEUDO-DDL · NO se construye hoy
-- [PHASE-DEFERRED: Fase 2]
CREATE TABLE instructores (
  id TEXT PRIMARY KEY,           -- email institucional, mismo que Asistencias.instructor_id
  nombre TEXT NOT NULL,
  grupos TEXT[],                 -- grupos asignados
  coordinador_id TEXT REFERENCES coordinadores(id)
);
```

### Fase 3 — vista de aprendiz: tabla `Aprendiz_session_tokens`

```sql
-- PSEUDO-DDL · NO se construye hoy
-- [PHASE-DEFERRED: Fase 3 — vista de aprendiz, autenticación liviana]
CREATE TABLE aprendiz_tokens (
  token TEXT PRIMARY KEY,        -- random string
  ficha TEXT NOT NULL,           -- FK a Aprendices
  documento TEXT NOT NULL,       -- segundo factor light: documento del aprendiz
  expires_at TIMESTAMPTZ NOT NULL
);
```

### Fase 3 — Posible migración a Postgres (Supabase) si Apps Script no escala

Modelo relacional limpio (no pseudo-Sheets):
```sql
-- [PHASE-DEFERRED: Fase 3 — migración a Supabase si proceda]
CREATE TABLE aprendices (
  ficha TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  documento TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  grupo TEXT DEFAULT 'default',
  instructor_id TEXT REFERENCES instructores(id)
);

CREATE TABLE asistencias (
  marca_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha TEXT NOT NULL REFERENCES aprendices(ficha),
  fecha DATE NOT NULL,
  hora TIMESTAMPTZ NOT NULL,
  estado TEXT CHECK (estado IN ('Presente','Tarde','Justificado','Ausente')),
  grupo TEXT DEFAULT 'default',
  instructor_id TEXT NOT NULL,
  UNIQUE (ficha, fecha, instructor_id)
);

CREATE INDEX idx_asistencias_fecha ON asistencias(fecha DESC);
CREATE INDEX idx_asistencias_ficha ON asistencias(ficha);
```

**Hooks Fase 1 que habilitan esta migración:**
- `marca_id` UUID ya en uso → mapeo directo a `marca_id UUID PRIMARY KEY`.
- `fecha`, `hora`, `estado`, `instructor_id`, `grupo` ya en columnas → mapeo 1:1.
- Constraint `UNIQUE (ficha, fecha, instructor_id)` ya se respeta por convención Fase 1.

## Cross-references

- ADR-005 (locale + sin fórmulas)
- ADR-006 (data model hooks Fase 2)
- `api-spec.md`
- `merged.gs` — implementación actual
