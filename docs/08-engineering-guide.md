# Engineering Guide · Asistencia SENA

**Versión:** 1.0
**Fecha:** 2026-05-23
**Audiencia:** dev (uno solo en Fase 1; este doc es onboarding para devs futuros).

---

## 1. Stack summary

| Capa | Tech | Razón | Cita |
|---|---|---|---|
| **Cliente** | HTML + Tailwind CDN + Vanilla JS | Zero build, deploy rápido | ADR-002 |
| **PWA infra** | manifest.json + service-worker.js custom | Instalación + offline | ADR-001, FR-011, FR-013 |
| **Hosting cliente** | Vercel free tier | HTTPS gratis, deploy desde Git | ADR-001 |
| **Backend** | Google Apps Script Web App | Backend ya funcional, $0 | ADR-003 |
| **Persistencia** | Google Sheets | El sheet ES el storage; el usuario también lo abre directo | ADR-003 |
| **Fonts** | Inter via Google Fonts | Premium minimal | Design Doc §1.2 |
| **Icons** | Lucide-style inline SVG | Consistencia, sin emoji | Design Doc §1.6 |

## 2. Project structure

```
asistencia/
├── public/                         # Vercel sirve esto en raíz
│   ├── index.html                  # PWA single-page
│   ├── manifest.json               # PWA install metadata
│   ├── sw.js                       # service worker
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── apps-script/
│   └── merged.gs                   # backend (copia local del Apps Script)
├── docs/                           # documentación (esta suite)
│   ├── 00-project-brief.md
│   ├── ... (todos los demás)
│   └── DOCUMENTATION-STATUS.md
├── tests/                          # Playwright tests (Fase 1.5)
│   └── e2e/
│       ├── cuj-1-setup.spec.ts
│       └── ...
├── usuarios-prueba.html            # página de QRs para test manual
├── prototipo-pwa.html              # prototipo histórico (referencia)
├── README.md                       # quick-start del proyecto
└── .gitignore
```

## 3. Setup / onboarding (a un dev nuevo)

### 3.1 Pre-requisitos

- Node.js ≥18 (solo para `vercel-cli` y opcional Playwright)
- Git
- Cuenta Google (para Apps Script)
- Editor con Tailwind language server (VS Code + extensión "Tailwind CSS IntelliSense")
- Chrome para testing PWA

### 3.2 Setup local

```bash
git clone <repo>
cd asistencia
# Servir local con cualquier server estático
python -m http.server 8000 --directory public
# O con vercel-cli
npx vercel dev
```

Abre `http://localhost:8000` → debe cargar la PWA.

### 3.3 Setup Apps Script

1. Ir a https://script.google.com → "Compartido conmigo" → "proyecto Asistencia".
2. Si no tienes acceso, pedirle al usuario (jjzoto@gmail.com) que comparta el proyecto.
3. El código actual está en `merged.gs` dentro del proyecto Apps Script.
4. Para mantener `apps-script/merged.gs` local sincronizado: ver §3.4 Workflow.

### 3.4 Workflow de edición backend

**Opción A (recomendada):** clasp.
```bash
npm install -g @google/clasp
clasp login
clasp clone <script-id>
# editas merged.gs local, luego:
clasp push
clasp deploy --description "feat: nuevo endpoint X"
```

**Opción B (sin clasp):** push manual vía Playwright (documentado en memoria `workflow_push_apps_script_via_playwright.md` — receta con localStorage + Monaco API que ya probamos en este proyecto).

### 3.5 Setup PWA testing

```bash
# Servir localmente con HTTPS para que SW funcione
npx vercel dev
# Probar instalación en Chrome Android:
# 1. Conectar Android via USB con USB debugging
# 2. chrome://inspect en el desktop
# 3. Forward port 3000
# 4. Abrir en Chrome Android → "Add to home screen"
```

## 4. Coding conventions

### 4.1 JavaScript

- **ES2020+** features OK (browsers target ≥Chrome 110, Safari 16).
- **Vanilla, no transpilation.** Si necesitas algo que no está en ES2020, escríbelo plain.
- **Modules:** dentro de `<script type="module">` cuando el archivo crezca. Por ahora todo inline.
- **Funciones puras** preferidas: cada vista `VIEWS.x = (state) => htmlString`.
- **Estado mutable identificable** — variables `let` arriba del script, comentadas. Si la app crece, refactor a un estado central.
- **No frameworks** — no añadir React/Vue/jQuery sin re-abrir ADR-002.

### 4.2 HTML / Tailwind

- **Mobile-first** — clases sin prefix son para mobile, `md:` para tablet+, `lg:` para desktop.
- **No hardcoded hex** en HTML — usar tokens definidos en `tailwind.config` (sección `<script>tailwind.config = ...`).
- **Touch targets** mínimos: `min-h-[44px]` o `h-11` (44px) en botones primarios.
- **Accesibilidad obligatoria:**
  - `aria-label` en botones-solo-ícono.
  - `alt=""` en avatars (decorativos) o descriptivo si transmite info.
  - `role="alert"` o `aria-live="polite"` en toasts.

### 4.3 Naming

- **Variables JS:** camelCase.
- **Constantes globales:** UPPER_SNAKE_CASE (`APRENDICES`, `HOY`, `ICONS`).
- **Funciones:** camelCase, verbo + sustantivo (`marcarAsistencia`, `simularScan`).
- **CSS classes (custom):** kebab-case (`hero-card`, `scan-line`, `scanner-frame`).
- **Vistas:** `VIEWS.hoy`, `VIEWS.scan`, etc. (lowercase, matching the hash).

### 4.4 Apps Script (`merged.gs`)

- **Convenciones del archivo:** secciones con headers `// ===== Sección =====`.
- **Constantes** arriba: `SS_ID`, `TIMEZONE`, `APRENDICES_NAMES`, etc.
- **Funciones helper antes de lógica de negocio.**
- **Cada función de endpoint** retorna `{ok: bool, ...}` consistentemente.
- **Locale es_CO obligatorio** (ADR-005): nunca usar `new Date(y, m, d)` directo; usar `bogotaMidnight(now)`.
- **Idempotencia** vía `marca_id` en escrituras (ADR-006).

### 4.5 Comments

- **Comment the WHY, not the WHAT.** El código bien nombrado dice el QUÉ.
- **Citar ADRs** en comentarios para decisiones no obvias: `// Por qué setValue y no setFormula: ver ADR-005`.
- **TODOs** con autor + fecha: `// TODO(jose, 2026-05-23): extraer a helper cuando agreguemos Fase 2`.

## 5. Architecture patterns

### 5.1 Cliente — patrón funcional puro

```js
// Cada vista es una función pura del estado:
VIEWS.hoy = () => `
  <section>...</section>
`;
// render() invoca la vista activa según hash:
function render() {
  $('#view').innerHTML = VIEWS[active]();
}
```

**Beneficio:** sin reactividad implícita, sin re-render mágico. Cuando cambia estado, llamas `render()`.

### 5.2 Backend — single-file, multiple actions

```js
function doGet(e) {
  const accion = (e.parameter.accion || "registrar").toLowerCase();
  // Router por accion
  if (accion === "consultar") return jsonOut(consultar(...));
  // ...
}
```

**Beneficio:** un solo punto de entrada; agregar endpoint = agregar función + caso en router.

### 5.3 Offline-first interaction

```js
function marcar(ficha, estado) {
  // 1. UI optimista — el usuario ve el feedback inmediato
  HOY[ficha] = {estado, hora: ...};
  render();
  toast(`${estado} · ${nombre}`);
  // 2. Persistir en cola
  enqueueMark({ficha, estado, marca_id: ...});
  // 3. Sync no-bloqueante
  syncPendingMarks();
}
```

**Beneficio:** la app SIEMPRE responde rápido al usuario, independiente de la red.

### 5.4 Data fetching

- **Cache-first para padrón** (rara vez cambia). TTL 1h.
- **Network-first para listaHoy** (cambia cada marca). Fallback a cache si offline.
- **Stale-while-revalidate** opcional Fase 1.5.

## 6. Testing strategy

- **Unit (helpers):** Vitest para helpers JS críticos.
- **E2E (CUJs):** Playwright. Ver `test-plan.md` §3.
- **Manual QA:** checklist pre-release. Ver `test-plan.md` §4.
- **Apps Script unit:** función `runTests()` dentro de `merged.gs` que invoca cada endpoint con inputs sintéticos y compara.

## 7. DevOps

### 7.1 Branching strategy

**Trunk-based.** `main` es el branch único. Features en branches cortos (≤2 días), merge vía PR.

### 7.2 CI/CD

- **Cliente:** Vercel auto-deploys cada push a `main` → preview deploy con URL única; main → production.
- **Backend:** push manual con `clasp push` + `clasp deploy`.

**Lighthouse CI en cada PR** (configurar GitHub Action — `[OPEN: cuando se cree el repo]`).

### 7.3 Environments

| Env | URL | Backend |
|---|---|---|
| Local | `localhost:8000` | Apps Script dev URL (`/dev`) |
| Preview | `<branch>-asistencia-jjzoto.vercel.app` | Apps Script dev URL |
| Production | `asistencia.vercel.app` | Apps Script `/exec` URL |

### 7.4 Deploy procedure (Fase 1)

```bash
# Cliente
git push origin main
# → Vercel auto-deploy, espera notificación

# Backend (cambio en merged.gs)
clasp push
clasp deploy --description "feat: X"
# Si cambias la URL del deployment activo, también:
# Actualizar endpoint en Vercel env var ENDPOINT_PRODUCTION
```

## 8. Observability operations

- **Logs cliente:** `console.log` en dev; Sentry opcional Fase 1.5.
- **Logs backend:** Apps Script → Ejecuciones → ver últimas N invocaciones.
- **Dashboards:** ninguno en Fase 1; el sheet Resumen es el dashboard operativo. Lighthouse CI da el dashboard de performance.

## 9. Incident response

| Síntoma | Diagnóstico | Acción |
|---|---|---|
| Sheet con `#ERROR!` en Resumen | Bug locale es_CO — alguien usó `setFormula` | Revertir a versión anterior + corregir per ADR-005 |
| Marcas no aparecen en sheet | Apps Script timeout o quota exceeded | Revisar Apps Script "Ejecuciones" → si quota: esperar 24h o upgrade |
| PWA no instala | manifest.json roto o SW no registra | Validar `manifest.json` con Lighthouse + check console |
| Cámara no abre | Permiso denegado o no-HTTPS | Verificar HTTPS + reset permission browser |
| Latencia alta | Apps Script cold start | Si persiste, evaluar keep-alive ping (consume quota) |

## 10. Performance budgets

- **Bundle inicial** ≤200KB gzip — falla CI si supera.
- **FCP** ≤1.5s en 3G — Lighthouse CI threshold.
- **TTI** ≤2.5s — Lighthouse CI.
- **Backend p95** ≤1.5s — manual review semanal de execution logs.

## 11. Glossary

- **CUJ:** Critical User Journey
- **PWA:** Progressive Web App
- **SW:** Service Worker
- **FCP:** First Contentful Paint
- **TTI:** Time to Interactive
- **clasp:** Apps Script CLI tool
- **TZ Bogotá:** zona horaria `America/Bogota`, UTC-5 sin DST

## Cross-references

- ADRs `05-decisions/` — decisiones que justifican el stack.
- `prototipo-pwa.html` — referencia de implementación validada.
- Memory `workflow_push_apps_script_via_playwright.md`, `gotcha_apps_script_setformula_locale.md`.
