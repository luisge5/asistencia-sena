# ADR-002 · Stack del cliente: HTML + Tailwind CDN + Vanilla JS (sin framework)

**Status:** Accepted · 2026-05-23

---

## Context

Decidido en ADR-001 que el cliente será PWA, queda la decisión del **stack interno** del cliente. Las opciones canónicas para PWA son:

- **Vanilla JS** + HTML + Tailwind via CDN
- **React** (Create React App / Vite + Tailwind)
- **Vue 3** (Vite + Tailwind)
- **Svelte** (SvelteKit)
- **HTMX** (server-rendered, sprinkles de JS)
- **Next.js** / **Nuxt** (frameworks full-stack — overkill aquí)

Constraints: un solo dev, complejidad sostenible, deploy a Vercel sin pipeline complejo, bundle inicial ≤200KB gzip, sin secret build configs, posibilidad de migrar a framework después sin reescribir el código de negocio [from: PRD §5.1, ADR-001].

Tamaño del proyecto: 5 vistas + routing por hash + ~13 features + offline cache. No es trivial, pero no requiere SSR, state management complejo (Redux/Pinia), o ecosistema de componentes pesado.

## Decision

**HTML + Tailwind via CDN + Vanilla JavaScript** en un solo archivo `index.html` con routing por hash, sin build step, sin transpilación, sin bundler.

> **Decision summary:** un solo `index.html` autocontenido con Tailwind CDN; deploy = subir archivo a Vercel; zero build pipeline.

## Alternatives considered

### Alternativa A — Vanilla + Tailwind CDN (elegida)

**Descripción:** un archivo `index.html`, Tailwind via `<script src="https://cdn.tailwindcss.com">`, JavaScript inline con módulos ES si crece. Routing por `location.hash`. Service worker como segundo archivo `sw.js`.

**Pros:**
- **Zero build step** — abrir el archivo en navegador funciona. Deploy = subir el archivo.
- **Iteración tiempo-real**: cambio en código → F5 — sin watch, sin HMR ya configurado.
- **Bundle inicial mínimo** — solo el HTML + Tailwind CDN (~30KB gzip de Tailwind + 50KB de la app = 80KB total target).
- **Sin framework lock-in** — el código sobrevive a cambios de moda.
- **Transferible** a React/Vue después si el proyecto crece — los componentes son funciones que retornan HTML strings, no hay arquitectura propietaria.
- **Curva cero** — el dev sabe HTML/JS, no necesita aprender un nuevo framework.

**Cons:**
- **Sin reactividad declarativa** — re-render manual con `render()` cada vez que cambia estado. Funciona para 5 vistas, no escala bien a 50.
- **Sin componentes con state local** — pasar props como parámetros funciona pero es verboso si la jerarquía crece.
- **Tailwind CDN tiene un warning oficial** "not for production" pero en proyectos de este tamaño es perfectamente válido — sin tree-shaking pero el JIT del navegador es muy bueno.
- **Sin TypeScript** — type safety queda en revisión manual + JSDoc opcional.
- **Cache-busting** del CDN de Tailwind no está bajo nuestro control — si cambian el bundle, podríamos romper en versiones nuevas.

**Rejection reason:** N/A — elegida.

**Cuándo revisaríamos:** si la app crece a >10 vistas, >2,000 líneas de JS, o múltiples developers, migrar a Vite + Vue/React + Tailwind con build step.

### Alternativa B — Vite + Vue 3 + Tailwind

**Pros:** reactividad declarativa, single-file components, ecosistema maduro, tree-shaking del Tailwind, TypeScript fácil.

**Cons:**
- Build step necesario — agrega Vite dev server + producción config.
- Bundle inicial más grande (~80KB Vue runtime).
- Sobrearquitectura para 5 vistas.
- Aprendizaje de Vue para el dev si no lo sabe.

**Rejection reason:** complejidad agregada sin valor en Fase 1. Sería overkill ahora; migración futura si crece.

### Alternativa C — Vite + React + Tailwind

**Pros:** ecosistema más grande, comunidad amplia, integración natural con Vercel.

**Cons:**
- Igual que Vue + más weight del runtime (~140KB React + ReactDOM).
- JSX requiere build step.

**Rejection reason:** mismo razonamiento que Vue.

### Alternativa D — HTMX + servidor que sirve fragmentos

**Pros:** lógica en backend (Apps Script), cliente minimalista.

**Cons:**
- Apps Script no es ideal sirviendo HTML fragments en frío (cold start lento).
- Cada acción requiere round-trip de servidor — incompatible con offline mode.

**Rejection reason:** offline mode (FR-013) es Must y HTMX lo dificulta.

## Rationale

**Drivers principales:**

1. **Un solo dev** → cada minuto en configuración de build es minuto no invertido en features.
2. **Iteración** → cambio → F5 supera a cambio → wait → hot reload para un dev solo.
3. **Bundle size** → el target de ≤200KB gzip se cumple holgadamente con Tailwind CDN + vanilla.
4. **No vendor lock-in** → HTML+JS sobrevive a cualquier cambio de moda.

El argumento "tendrás que reescribir cuando crezcas" es real, pero solo se materializa si el proyecto realmente crece. La mayoría de proyectos personales mueren antes de necesitar Vue/React. Si este crece, la conversión es trivial: cada función `VIEWS.x = () => html` se vuelve un componente.

## Consequences

### Positive
- Cero pipeline de build, cero config files que mantener.
- Deploy en 60 segundos a Vercel.
- Bundle de < 100KB inicial.
- Tiempo de "primera línea de código a primera vista en pantalla" es minutos, no horas.
- Sin lock-in.

### Negative
- Re-render manual cuando cambia estado — boilerplate.
- Templates como strings de HTML — sin syntax highlighting decente en algunos editores, sin auto-completado.
- Tailwind CDN sin tree-shaking — bundle un poco más grande que el ideal pero aceptable para el tamaño actual.
- Si el proyecto crece, llegará un punto donde el vanilla duela y haya que migrar.

### Neutral
- Sin TypeScript — type safety queda en manual review.
- Sin testing framework por default — habría que decidir Jest/Vitest si se quieren tests JS.

### Risks
- **Riesgo:** Tailwind CDN deprecado o cambiado por upstream sin aviso → la app puede romperse cosméticamente. **Indicador:** Tailwind anuncia v5 con breaking changes. **Mitigación:** pin del CDN a versión específica (`https://cdn.tailwindcss.com/3.4.x`).
- **Riesgo:** la app crece más de lo esperado y queda con código spaghetti. **Indicador:** archivo único > 3,000 líneas. **Mitigación:** dividir en módulos JS importados (`<script type="module">`) ANTES de migrar a framework.

## Implicaciones cross-fase

| Fase | Comportamiento | Hook que existe HOY | Qué la bloquearía si se hace mal |
|---|---|---|---|
| **Fase 1** | 1 archivo, 5 vistas, vanilla. | Estructura `VIEWS.xxx = () => string` modular; cada vista es función independiente. | Si las vistas comparten estado mutable global sin disciplina, refactor Fase 2 dolerá. |
| **Fase 2** | Posible split a 2-3 archivos JS (módulos), agregar componentes para nuevas vistas (lista de fichas, dashboard coordinador). | Vistas ya están encapsuladas en `VIEWS.xxx`; estado en singletons mutables identificables (`HOY`, `SCAN_LAST`, etc.) → migrables a un estado central. | Mezclar lógica de negocio dentro de las funciones de render → re-render lento. |
| **Fase 3** | Migración a Vite + framework si la app crece > 10 vistas o se agrega vista de aprendiz separada. | Patrón `(state) => html` traducible directo a componentes Vue/React. | — |

[PHASE-DEFERRED: framework migration — Fase 2.5 / 3 a deliberar; hook hoy es el patrón funcional puro de VIEWS.]

## Validation plan

- **Leading:** archivos del proyecto (tras 4 semanas de Fase 1) — si el HTML sigue siendo manejable (<2,500 líneas), la decisión fue correcta.
- **Lagging:** tiempo de implementar feature nueva. Si una feature toma >50% más de lo que tomaría con framework por boilerplate, considerar migración.

## Implementation notes

- Pin de Tailwind: usar URL con versión específica, no `@latest`.
- Estructura del HTML: secciones bien comentadas (`<!-- TOP BAR -->`, `<!-- VIEW -->`, etc.).
- Estado global en variables `let` arriba del script — documentar cuáles son.
- Cada vista es función `VIEWS.<name> = () => stringHTML`.
- `render()` central que mete `VIEWS[active]()` en `#view`.
- Cuando una vista pase ~200 líneas, extraer a su propio archivo `js/views/<name>.js` con `<script type="module">`.

## References

- ADR-001 — decisión de PWA que crea este contexto.
- `prototipo-pwa.html` — prototipo construido con este stack (validación previa de la decisión).
- PRD §5.1 — performance targets que este stack cumple.
- PRD §FR-011 — instalación PWA (depende del bundle ligero).
