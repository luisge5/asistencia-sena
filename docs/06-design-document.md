# Design Document · Asistencia SENA PWA · Fase 1

**Versión:** 1.0
**Fecha:** 2026-05-23

---

## 1. Design system summary

**Filosofía**: mobile-first, alto contraste, premium minimal, "no AI slop". El usuario debe sentir que está usando una herramienta profesional, no un prototipo educativo. Inspiración: estilo Stripe / Linear / Vercel — confianza visual sin decoración innecesaria [from: prototipo-pwa.html, ui-ux-pro-max design-system query].

### 1.1 Tokens de color

| Rol | Hex | CSS | Uso |
|---|---|---|---|
| `primary` | `#0F172A` | `--color-primary` | Navy oscuro. Acciones primarias, hero card, ícono app, top bar bg accent. |
| `primary-soft` | `#1E293B` | `--color-primary-soft` | Gradient secundario del hero. |
| `on-primary` | `#FFFFFF` | `--color-on-primary` | Texto / íconos sobre primary. |
| `accent` | `#0369A1` | `--color-accent` | Acentos informativos, botón "Simular escaneo", links activos. |
| `accent-soft` | `#0284C7` | `--color-accent-soft` | Hover / variante. |
| `background` | `#F8FAFC` | `--color-background` | Background app frame (slate-50). |
| `surface` | `#FFFFFF` | `--color-surface` | Cards, inputs. |
| `foreground` | `#020617` | `--color-foreground` | Texto primario. |
| `muted` | `#E8ECF1` | `--color-muted` | Bg de pills neutros, secciones tonales. |
| `muted-fg` | `#64748B` | `--color-muted-fg` | Texto secundario (subtítulos, captions). |
| `border` | `#E2E8F0` | `--color-border` | Bordes de cards, inputs, divisores. |

**Status colors** (estados de asistencia):
- `state-presente`: `#16A34A` · bg `#DCFCE7` (verde)
- `state-tarde`: `#D97706` · bg `#FEF3C7` (naranja)
- `state-justificado`: `#0369A1` · bg `#DBEAFE` (azul)
- `state-ausente`: `#DC2626` · bg `#FEE2E2` (rojo)

Cada estado tiene par fg+bg con contraste WCAG AA garantizado (≥4.5:1 fg sobre bg).

### 1.2 Typography

- **Fuente única:** Inter (Google Fonts). Pesos: 400 / 500 / 600 / 700 / 800.
- **Tracking apretado en headings:** `letter-spacing: -0.04em` para títulos grandes — da la sensación premium / tech-forward (estilo Linear).
- **Escala**:
  | Token | Tamaño | Uso |
  |---|---|---|
  | `text-[10px]` | 10px | Captions diminutos (categorías de chips) |
  | `text-[11px]` | 11px | Labels, captions, footnotes |
  | `text-xs` (12px) | 12px | Metadatos en filas (ficha + hora) |
  | `text-[13px]` | 13px | Body en tablas densas |
  | `text-sm` (14px) | 14px | Body normal en cards |
  | `text-base` (16px) | 16px | Body en formularios + section titles |
  | `text-lg / xl` | 18-20px | (no usado en mobile) |
  | `text-2xl / 4xl / 5xl` | 24-48px | Hero numbers (contador asistencia, %) |
- **`tabular-nums`** OBLIGATORIO en cualquier número (fichas, conteos, %, hora) — evita layout shift al cambiar dígitos.

### 1.3 Spacing & layout

- **Sistema:** múltiplos de 4px (Tailwind default).
- **Card padding:** `p-4` (16px) interno; `p-5` o `p-6` para hero cards.
- **Gap entre secciones:** `space-y-5` (20px).
- **Gap entre rows en lista:** divider `divide-y divide-border` (sin gap entre filas; el divisor da estructura).
- **Touch targets:** mínimo 36×36px para íconos secundarios, 44×44px para primarios, 48×48px para CTAs.

### 1.4 Radii

- `rounded-md` (6px) — pills, badges
- `rounded-lg` (8px) — botones inline (P/T/J en lista)
- `rounded-xl` (12px) — botones primarios, inputs
- `rounded-2xl` (16px) — cards de lista (faltantes, padrón, sesiones)
- `rounded-3xl` (24px) — hero card, viewfinder del scanner

### 1.5 Elevation

**Sin shadows agresivas.** Solo:
- Hero card: gradient navy + glow radial sutil (no shadow).
- Toast: `shadow-2xl` para destacar sobre cualquier vista.
- App frame en desktop: shadow grande dimensional (mockup phone-like).
- Cards estándar: `border border-border` solo (sin shadow) — la separación es por borde no por sombra. Esto es deliberadamente "menos AI-slop".

### 1.6 Iconography

- **Familia única:** Lucide-style inline SVGs (no íconos font, no emojis).
- **Stroke-width:** 2 para íconos de UI, 2.5 para íconos compactos (chip de estado), 3 para íconos pequeños/agresivos (check de presente).
- **Tamaño:** 14px (chip), 16-18px (botón inline), 20-22px (nav), 18px (input/search).
- **Color:** heredan `currentColor` para teñirse según contexto.

### 1.7 Motion

- **Transiciones default:** 220ms ease-out (entrada vista), 100-150ms para hover/active.
- **Animación scan-line:** 2.2s ease-in-out alternate (suave, no agresiva).
- **Active state:** `scale-95` o `scale-[0.98]` en tap (feedback táctil).
- **Respeta `prefers-reduced-motion`:** [OPEN-implementation — agregar override CSS].

## 2. Navigation architecture

```
app-frame (root)
├── top-bar (sticky, height 56px)
│   ├── logo + título + subtítulo contextual
│   └── botón Ajustes (gear icon)
├── main (scroll área, padding-bottom para no chocar con bottom-nav)
│   └── view (cambia según hash: #hoy | #scan | #aprendices | #historico | #ajustes)
└── bottom-nav (sticky, height ~70px con safe-area)
    ├── Hoy
    ├── Escanear
    ├── Aprendices
    └── Histórico
```

**Routing:** por `location.hash` (sin librería). `#hoy` es default. La bottom-nav tiene 4 items (siguiendo `bottom-nav-limit` del UX guide); Ajustes está accesible desde el ícono de gear en la top-bar (no en la bottom-nav).

**Modal vs full-screen:** todo es full-screen view en Fase 1 (no hay modales). Toasts aparecen al fondo cerca de la bottom-nav.

**Back behavior:** las vistas son hermanas — no hay jerarquía. Botón back del navegador navega entre vistas previamente visitadas (hash navigation funciona naturalmente).

**Deep-link:** sí. URL `https://.../#hoy` abre directo en Hoy. `https://.../#scan` abre Escanear, etc.

## 3. Screen inventory

| ID | Name | Purpose | Phase | FR primary | Status |
|---|---|---|---|---|---|
| SCR-001 | Hoy (Dashboard del día) | Vista de entrada · contador + faltantes + ya marcados | MVP | FR-007, FR-003 | ✅ prototipo validado |
| SCR-002 | Escanear (Scanner) | Cámara + viewfinder + tarjeta resultado + 3 botones de estado | MVP | FR-001, FR-005 | ✅ prototipo validado |
| SCR-003 | Aprendices (Padrón) | Lista con buscador + estado del día · permite marcar a mano | MVP | FR-002 | ✅ prototipo validado |
| SCR-004 | Histórico (Dashboard analítico) | KPIs · en riesgo · tabla detalle · patrones semana · sesiones | MVP | FR-008 | ✅ prototipo validado |
| SCR-005 | Ajustes (Settings) | Endpoint · ficha · umbral horario · toggles offline/vibrar | MVP | FR-010 | ✅ prototipo validado |
| SCR-006 | Toast (overlay) | Confirmación + undo de marca | MVP | FR-006 | ✅ prototipo validado |
| SCR-007 | Detalle de aprendiz | Modal con historial individual del aprendiz | Fase 1.5 | FR-002+ | [PHASE-DEFERRED: Fase 1.5] |
| SCR-008 | Login coordinador | Selector de instructor/curso para coordinador | Fase 2 | — | [PHASE-DEFERRED: Fase 2] |
| SCR-009 | Vista aprendiz | Autoconsulta del aprendiz | Fase 3 | — | [PHASE-DEFERRED: Fase 3] |

Solo las pantallas MVP (SCR-001 a SCR-006) se especifican a profundidad. SCR-007/008/009 quedan deliberadamente sin specs hasta que se cumpla su gate.

## 4. Per-screen specifications

### SCR-001 · Hoy (Dashboard del día)

**Purpose:** Vista de entrada de la app. El instructor abre la app y en ≤2 segundos ve cuántos faltan + puede empezar a marcar.

**Persona context:** Instructor titular (PRD §2 persona 1) abre la app al inicio de la sesión (07:00 o cuando inicie su jornada). El contexto típico es el aula con luz natural, celular en mano, aprendices entrando.

**Layout description (top a bottom):**
1. **Top bar** (56px): logo + "Asistencia" + subtítulo `"Sábado 23 may · ficha 3145789"` + gear ajustes.
2. **Hero card** (~210px): navy gradient con glow azul radial; texto `"ASISTENCIA HOY"` overline + fecha completa + número grande `[presentes]/[total]` + `% asistencia` + progress bar blanco translúcido + 2 botones (Escanear ficha + Lista).
3. **Sección "Faltan por marcar"** (~variable según count): heading + contador `[N] de [Total]` + lista de cards con avatar (40px) + nombre + ficha + 3 botones inline (P/T/J).
4. **Sección "Ya marcados"**: heading + contador + lista (avatar + nombre + hora · ficha + pill de estado).
5. **Bottom nav** (sticky abajo).

**Components:**
- `HeroStatCard`: gradient + número + progress bar.
- `AprendizFaltanteRow`: avatar + nombre + ficha + 3 botones P/T/J inline.
- `AprendizMarcadoRow`: avatar + nombre + hora·ficha + pill de estado.
- `SectionHeader`: heading + contador.
- `EmptyState` (cuando faltan 0): círculo verde con check + "Todos marcados".

**Data needed:**
- `GET /endpoint?accion=listaHoy` → `{activos:[…], asistencias:{ficha:{estado,hora}}}` (un solo round-trip).
- Cache local (localStorage `cache_padron`, TTL 1h) para apertura offline.

**User interactions:**
- Tap "Escanear ficha" → navega `#scan`.
- Tap "Lista" → navega `#aprendices`.
- Tap botón P/T/J inline → marca + toast con undo + fila desaparece de "Faltan" y aparece en "Ya marcados".
- Pull-to-refresh → recarga `listaHoy`.
- Tap en una fila de "Ya marcados" → modal de detalle (Fase 1.5).

**States:**
- **Loading**: skeleton del hero card + 3 skeleton rows en "Faltan". Duración max 1.5s en 3G.
- **Empty (sin aprendices en padrón)**: pantalla con CTA "Agregar primer aprendiz" + link al sheet.
- **Empty (todos marcados)**: card verde "Todos marcados · 0 faltantes hoy" en lugar de lista vacía.
- **Error (backend caído)**: muestra cache local + banner amarillo "Datos pueden estar desactualizados · reintentar".
- **Partial/Stale (offline)**: banner naranja "Offline · X marcas pendientes" en topbar + UI normal funcionando sobre cache.

**Entry routes:** root (`#hoy`), default tras instalación PWA, después de "Atrás" desde cualquier vista.

**Exit routes:** tap bottom-nav (a Escanear / Aprendices / Histórico), tap gear (Ajustes), tap botones del hero (Escanear / Lista).

**Validation rules:** N/A (vista de lectura + tap actions).

**Edge cases:**
1. Padrón con 0 activos pero hay registros históricos: hero muestra `0/0`, sección "Ya marcados" oculta, sección "Faltan" oculta, mensaje "Agregar primer aprendiz".
2. Día sin sesión (festivo detectado por fecha): hero muestra "No hay sesión hoy" en lugar de números.
3. Más de 30 faltantes: lista scrolleable; CTA de scroll-to-top aparece al scrollear >2 pantallas.

**Accessibility notes:**
- Hero number tabular-nums + contraste 16:1.
- Cada botón inline P/T/J tiene aria-label explícito ("Marcar presente", etc.) además del ícono.
- Focus order: top-bar → hero CTAs → primera fila → siguientes filas → bottom-nav.

**Analytics events:**
- `view_hoy` al cargar.
- `mark_inline` cuando se toca un botón inline (con `estado`, `tipo: faltantes_inline`).

**Cross-references:** FR-007, FR-003 (PRD §4); ADR-003 (`listaHoy` endpoint nuevo); Backlog E1.3.

---

### SCR-002 · Escanear (Scanner)

**Purpose:** Lectura de QR + marcado rápido con 3 estados visibles.

**Persona context:** Instructor en aula, aprendiz frente a él con carnet en mano, instructor apunta cámara al QR.

**Layout:**
1. Top bar (56px).
2. **Viewfinder** (aspect-square, navy bg + glow radial): contiene marco con esquinas blancas + línea de scan animada (azul con glow); texto "CÁMARA · VISTA PREVIA" en estado mock (real: feed de cámara); CTA "Apunta al QR de la ficha" + botón "Simular escaneo" (en prototipo · en producción: solo se activa cámara).
3. **Tarjeta de última lectura** (visible si hay scan reciente): header con "ÚLTIMA LECTURA" + pill estado actual (o "sin marcar"); body con avatar 56px + nombre 15px + ficha·doc; footer con 3 botones grandes (h-12, color por estado).
4. **Botón Undo** (visible si LAST_ACTION existe): "Deshacer última marca".
5. Bottom nav.

**Components:**
- `Viewfinder`: container + marco SVG + scan-line animado.
- `LastScanCard`: header + avatar + datos + 3 botones grandes.
- `UndoButton`: botón con ícono.

**Data needed:**
- Permission cámara (vía `getUserMedia` + `BarcodeDetector`).
- Al detectar QR: `GET /endpoint?accion=consultar&num=<ficha>` → datos aprendiz.

**User interactions:**
- App abre cámara automáticamente (request permission primera vez).
- QR detectado → vibrar 50ms + render tarjeta.
- Tap botón P / T / J → marca + toast + vibrar 100ms.
- Tap "deshacer" en toast (3s) → revierte.
- Tap "Simular escaneo" (DEV only) → escaneo aleatorio para QA sin cámara.

**States:**
- **Loading (cámara)**: viewfinder oscuro + "Solicitando permiso de cámara…".
- **Empty (sin scan)**: viewfinder activo + tarjeta de empty state "Sin lecturas todavía".
- **Error (permiso denegado)**: viewfinder con icono X + "Permiso de cámara denegado" + botón "Buscar por ficha" (fallback a SCR-003).
- **Success (scan exitoso)**: tarjeta con resultado.
- **Partial (ficha no en padrón)**: tarjeta roja "Ficha no encontrada" + botón "Agregar aprendiz" (Fase 1.5) o "OK".

**Entry routes:** desde bottom-nav, desde "Escanear ficha" en hero card de Hoy.

**Exit routes:** bottom-nav, marca exitosa lleva a feedback visual pero NO navega automáticamente (instructor sigue escaneando).

**Validation rules:** ficha escaneada debe existir en `Aprendices` y ser `activo=SI`.

**Edge cases:**
1. QR borroso → escáner reintenta 3s y sugiere búsqueda manual.
2. Mismo QR escaneado 2 veces → segundo scan muestra "Ya marcado hoy" con opción cambiar estado.
3. Aprendiz inactivo (`activo=NO`) → mensaje "Aprendiz inactivo" + razón.

**Accessibility:**
- Botones de estado con aria-label.
- Si reduced-motion: scan-line se reemplaza por texto fijo.
- Tarjeta de resultado anuncia "Aprendiz [nombre] detectado" en lectores de pantalla.

**Analytics:**
- `scan_complete` con `{result, duration_ms}`.
- `permission_denied` si aplica.

**Cross-references:** FR-001, FR-005, FR-006; ADR-001, ADR-004; Backlog E1.1.

---

### SCR-003 · Aprendices (Padrón)

**Purpose:** Ver el padrón completo del curso + buscar + marcar a mano.

**Persona context:** Instructor que conoce a sus aprendices y prefiere buscar por nombre que escanear.

**Layout:**
1. Top bar (subtítulo "8 aprendices · ficha 3145789").
2. **Search bar** (sticky bajo top-bar): input con ícono lupa + placeholder "Buscar por nombre o ficha".
3. **Header sección**: "Padrón · [count]" + botón "+ Nuevo" (Fase 1.5).
4. **Lista**: card con avatar 44px + nombre + ficha · doc + (pill estado si marcado | botón "Marcar" oscuro si no).
5. Bottom nav.

**Components:** `SearchInput`, `AprendizPadronRow` (avatar+datos+pill-o-marcar-button).

**Data needed:** `GET /endpoint?accion=listaPadron` + estado del día (cache local).

**User interactions:**
- Tap search input → teclado se abre.
- Type → filtra en vivo (debounce ~100ms).
- Tap fila con pill → modal detalle (Fase 1.5).
- Tap "Marcar" → marca Presente + toast.
- Pull-to-refresh.

**States:**
- **Loading**: 8 skeleton rows.
- **Empty (sin aprendices)**: CTA "Agregar primer aprendiz".
- **Empty (sin resultados de búsqueda)**: "Sin resultados para '<query>'".
- **Error**: cache + banner.
- **Partial (offline)**: misma vista, banner offline.

**Entry routes:** bottom-nav, link "Lista" desde hero card de Hoy.

**Validation:** búsqueda case-insensitive + acentos normalizados.

**Edge cases:**
1. Query con solo espacios → muestra lista completa.
2. Aprendiz activo=NO → no aparece en padrón (filtrado).
3. >50 aprendices → virtualización (Fase 1.5).

**Accessibility:** input con label asociado; lista con role=list, rows con role=listitem.

**Analytics:** `search_query`, `mark_padron`.

**Cross-references:** FR-002, FR-005; Backlog E1.2.

---

### SCR-004 · Histórico (Dashboard analítico)

**Purpose:** Detección de riesgo + reporte rápido. El "valor diferencial" del producto vive aquí.

**Persona context:** Instructor revisa 1-2 veces por semana después de varias sesiones acumuladas, para identificar aprendices en racha de inasistencia.

**Layout (top a bottom):**
1. Top bar (subtítulo "Histórico de sesiones").
2. **Hero analítico**: card surface con "Asistencia del grupo" overline + `%` grande + delta vs semana anterior chip verde + 4 KPIs grid `en riesgo · ausencias · tardes · perfectos`.
3. **Sección "Atención requerida"** (si hay aprendices en riesgo): cards rojas con borde izquierdo, 1 por aprendiz, mostrando 3 chips `CONSEC · DISCONTINUAS · TARDES` + % asistencia.
4. **Sección "Detalle por aprendiz"**: tabla densa con búsqueda implícita (orden por riesgo default, opciones % asist / racha). Columnas: nombre+avatar+ficha · ASIST% · CONS · DISC.
5. **Sección "Patrones de la semana"**: card con barras lun-mar-mié-jue-vie + highlight mejor (verde) y peor (rojo) día.
6. **Sección "Sesiones recientes"**: lista compacta con fecha + counters P/T/J/A + % + chevron + botón "Exportar CSV".
7. Bottom nav.

**Components:** `HeroAnalyticsCard`, `EnRiesgoCard`, `DetalleTable`, `WeekPatternsCard`, `SesionRow`.

**Data needed:**
- `GET /endpoint?accion=stats` → array de `{ficha, pct, racha_actual, racha_max, ausencias_disco, tardes, en_riesgo}`.
- `GET /endpoint?accion=historico&dias=10` → array de sesiones.

**User interactions:**
- Tap orden riesgo/asist/racha → re-render tabla.
- Tap fila de tabla → modal detalle aprendiz (Fase 1.5).
- Tap sesión → vista de sesión completa (Fase 1.5).
- Tap "Exportar CSV" → modal de rango + descarga.

**States:**
- **Loading**: hero skeleton + 3 fake rows.
- **Empty (menos de 5 días de historia)**: banner "Acumula más datos para ver tendencias" + métricas parciales si las hay.
- **Error**: misma vista con datos cacheados + banner.
- **Partial (offline)**: vista sobre cache.

**Edge cases:**
1. Aprendiz con 100% justificadas: no aparece en riesgo (porque % asistencia se calcula sobre días no-justificados).
2. Sin sesiones en últimos 10 días: hero muestra "Sin sesiones recientes".
3. División por 0 (sin asistencias): % se muestra como "—" en lugar de NaN.

**Accessibility:**
- Tabla tiene aria-sort en cabeceras ordenables.
- Cards de riesgo anuncian "Atención requerida: [nombre]: [N] consecutivos" en SR.
- Colores no son la única señal — texto + íconos siempre acompañan.

**Analytics:** `view_historico`, `sort_changed`, `export_csv_initiated`.

**Cross-references:** FR-008, FR-009; ADR-006 (cálculos cross-fase); Backlog E1.3.5.

---

### SCR-005 · Ajustes (Settings)

**Purpose:** Configuración del sistema.

**Persona context:** Setup inicial (1 vez) + ajustes ocasionales.

**Layout:**
1. Top bar.
2. **Sección "CONEXIÓN"**: card con (a) Endpoint URL + dot verde "conectado" + link "cambiar"; (b) Ficha del curso + cambiar.
3. **Sección "PREFERENCIAS"**: card con (a) Umbral "Tarde" después de + time picker; (b) Toggle "Vibrar al escanear"; (c) Toggle "Modo offline".
4. **Sección "ACERCA DE"**: card con descripción + versión.
5. Bottom nav.

**Components:** `SettingsSection`, `SettingsRow` (label + value + cambiar), `TimePicker`, `Toggle`.

**Data needed:** localStorage para persistir + endpoint config inicial.

**User interactions:**
- Tap "cambiar endpoint" → modal con input + validación (ping `contar`).
- Tap time picker → native time input.
- Tap toggle → estado on/off.

**States:** todas las preferencias persisten al cambiar (localStorage).

**Edge cases:**
1. Endpoint inválido al cambiar → mensaje "no responde · revisa la URL" + no se guarda.
2. localStorage no disponible (incógnito) → banner "Ajustes no se guardarán".

**Accessibility:** toggles con role=switch + aria-checked.

**Cross-references:** FR-010; Backlog E1.4.

---

### SCR-006 · Toast (overlay)

**Purpose:** Feedback de acción + undo.

**Layout:** pill flotante centrada cerca del fondo (bottom-24), bg navy, texto blanco, "deshacer" si aplica.

**Estados:** entrada (fade-up 180ms), display (3s default), exit (fade-out).

**Cross-references:** FR-006; usado por SCR-001, SCR-002, SCR-003.

## 5. User flows

### Flow A — Marcar presencia masiva al inicio de sesión (HAPPY PATH)

1. Instructor abre la app desde pantalla de inicio (PWA installed).
2. App carga vista `#hoy` en <2s (cache + fetch fresh en background).
3. Hero card muestra `0/8 · 0%`. Lista de faltantes muestra los 8 aprendices.
4. Tap botón "Escanear ficha" en hero card → navega `#scan`.
5. Cámara se abre con marco scan visible.
6. Apunta al QR del aprendiz Luis (ficha 31145789).
7. App vibra 50ms + tarjeta aparece con foto + datos de Luis.
8. Tap botón verde "Presente" → vibra 100ms + toast verde "Presente · Luis · deshacer (3s)".
9. Instructor continúa: apunta al siguiente QR.
10. (Repite pasos 6-9 para los siguientes aprendices presentes).
11. Al terminar los escaneos, navega `#hoy` para ver resumen + marcar manualmente los que faltan.
12. Lista de faltantes ahora tiene 2 (los que no llegaron). Toca botón gris guion (Ausente — Fase 1.5) o deja sin marcar hasta cierre del día.

### Flow B — Recovery del error humano (UNHAPPY PATH)

1. Instructor escanea QR de Pedro pero accidentalmente toca "Tarde" cuando quiso "Presente".
2. Toast verde "Tarde · Pedro · deshacer" aparece.
3. En menos de 3 segundos, instructor toca "deshacer".
4. La marca se revierte (fila eliminada del sheet).
5. Tarjeta de scan se mantiene visible con los 3 botones.
6. Instructor toca el verde correcto "Presente".
7. Toast "Presente · Pedro · deshacer".

### Flow C — Detección de aprendiz en riesgo (DASHBOARD PATH)

1. Instructor abre la app un viernes después de una semana de uso.
2. Tap bottom-nav → "Histórico".
3. Vista carga: % grupo 72%, 4 en riesgo, banner rojo "Atención requerida · 4".
4. Card de Valentina Suárez en rojo muestra "40% asistencia · 6 CONSEC · 0 DISC".
5. Instructor reconoce que Valentina no ha venido toda la semana.
6. Tap en la card → (Fase 1.5: modal con detalle de Valentina). En Fase 1: card es informativa, instructor decide accionar fuera de la app (llamar, citar, reportar a coordinación).

### Flow D — Offline / WiFi caído (RECOVERY PATH)

1. Instructor está marcando asistencia. WiFi del aula se cae.
2. Banner naranja aparece en topbar: "Offline · sincronizando cuando vuelva la red".
3. Instructor sigue marcando normalmente. Cada toque produce toast verde + marca queda en localStorage queue.
4. 15 minutos después, WiFi vuelve.
5. App detecta online → procesa cola en orden FIFO.
6. Toast verde por cada sync exitoso (sin bloquear al instructor).
7. Banner naranja desaparece.

## 6. Visual identity notes

**Tono de voz en copy:**
- Directo, sin formalismos: "Apunta al QR de la ficha" en lugar de "Por favor, oriente la cámara hacia el código QR".
- Frases cortas. Verbo + sustantivo.
- Sin abreviaturas obscuras. "Asistencia HOY" no "Asist. hoy".
- Errores son humanos, no técnicos: "no se pudo registrar" no "Error 500: Internal Server".

**Do / Don't en copy:**
- ✅ "Marcado · Luis"
- ❌ "Registro de asistencia procesado exitosamente"
- ✅ "Ficha no encontrada"
- ❌ "Error: el sistema no pudo localizar la ficha solicitada en la base de datos"
- ✅ "Sin lecturas todavía"
- ❌ "Aún no se han registrado lecturas de códigos QR"

**Photography / illustration:** sin fotos stock; íconos vectoriales monocromáticos; fotos solo cuando son los avatars de los aprendices reales (Drive URL).

**Iconografía:** Lucide-style outline para acciones, filled solo para chips de estado.

**Motion vocabulary:**
- Entrada de vista: fade-up 220ms ease-out.
- Hover: opacity / scale sutil 100-150ms.
- Active: scale-95 inmediato.
- Toast: fade-up 180ms.
- Scan-line: 2.2s alternate (única animación continua).

## 7. Accessibility notes

**Target:** WCAG 2.1 AA.

**Coverage:**
- Contraste fg/bg ≥4.5:1 en todo texto verificado (Tailwind slate-50 + slate-900 = 16:1).
- Touch targets ≥44px en botones primarios, ≥36px en inline.
- Keyboard navigation: Tab order = top-bar → contenido vertical → bottom-nav.
- Screen readers: cada botón con aria-label si solo tiene ícono.
- `prefers-reduced-motion`: scan-line se reemplaza por texto fijo; transiciones de vista van a 0ms.
- Color no es la única señal: pills siempre tienen ícono + texto + color.
- Form labels asociados con `for`/`id`.
- `aria-live="polite"` en toasts para que SR los anuncien.

**Test obligatorio antes de release:**
- TalkBack en Android.
- VoiceOver en iOS Safari (sample test).
- Lighthouse Accessibility score ≥95.

## 8. Responsive behavior

- **Mobile portrait (<420px)**: layout único; touch optimizado.
- **Tablet portrait (420-768px)**: app frame max-w-md centrado.
- **Desktop (>768px)**: app frame con phone shape (max-w-420 + shadow + border-radius 36px), bg slate-100 alrededor.
- **Landscape mobile**: usable pero no optimizado; layout se mantiene (no two-column). El uso primario es portrait.

## 9. Empty product / first-run experience

**First-run en device limpio (sin localStorage):**
1. PWA carga `#hoy`.
2. Detecta `localStorage["endpoint"]` vacío → modal de bienvenida.
3. Modal pide endpoint URL + ficha del curso.
4. Tras configurar → ping `contar` → si OK, guarda y carga `#hoy` normal.
5. Si no OK → mensaje + retry.

[OPEN: diseño detallado del modal de onboarding — Fase 1.5]

## 10. Deferred screens

- **SCR-007 · Detalle de aprendiz** [PHASE-DEFERRED: Fase 1.5 — modal con historial individual cuando se toca una fila de Padrón o Histórico. Gate: usuarios reales pidiéndolo tras 2 semanas Fase 1].
- **SCR-008 · Login coordinador** [PHASE-DEFERRED: Fase 2 — gate en PRD §8].
- **SCR-009 · Vista aprendiz** [PHASE-DEFERRED: Fase 3 — gate en PRD §8].

---

## Cross-references

- PRD: `04-product-requirements.md`
- ADRs: `05-decisions/`
- Prototipo navegable: `../prototipo-pwa.html`
- Backlog: `09-backlog.md` (cada screen tiene historias de implementación)
- API spec: `07-technical/api-spec.md` (endpoints consumidos por cada screen)
