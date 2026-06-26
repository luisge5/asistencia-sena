# ADR-001 · Construir Fase 1 como PWA, no como app nativa Android

**Status:** Accepted · 2026-05-23
**Cubre:** decisión sobre tecnología de cliente para Fase 1 (reemplazo del App Inventor existente)

---

## Context

El cliente actual (Asistencia-fixed.aia compilado en MIT App Inventor) funciona pero su ciclo de uso impone fricciones que están haciendo que el instructor no abra la app diariamente: (1) requiere el **MIT AI2 Companion** encendido en un PC en la misma WiFi para correr en modo "live preview" diariamente; (2) compilar el APK es manual, sin pipeline, y requiere desinstalar/reinstalar el APK previo cada vez; (3) Play Store no es una opción (cuenta de developer paga + sometimiento a review process); (4) instalación por "fuentes desconocidas" pide permisos extra cada vez en Android moderno, hostil para usuario no técnico; (5) el modelo solo soporta Android — si en Fase 2 hay un instructor con iPhone, todo se vuelve a empezar [from: GUIA-ANDROID.md §pre-requisitos + conversación 2026-05-22].

Las opciones disponibles para reemplazarlo son:

- **PWA** (Progressive Web App)
- **App nativa Android (Kotlin / React Native / Flutter)**
- **App híbrida (Capacitor / Cordova / Ionic)**
- **Quedarse en App Inventor** (status quo)

Las constraints en juego: presupuesto $0 (sin cuenta de developer Play Store, sin servicios pagos), un solo dev (el usuario), distribución sin store, soporte multi-plataforma futuro (iPhone en Fase 2), instalación sin fricción.

## Decision

**Construimos Fase 1 como Progressive Web App (PWA).** El cliente se sirve desde Vercel free tier en HTTPS, incluye `manifest.json` + `service-worker.js` que permiten instalación en pantalla de inicio sin Play Store. El backend Apps Script no cambia.

> **Decision summary:** PWA en Vercel free, instalable, offline-capable, multi-plataforma (Android + iOS + desktop) sin store.

## Alternatives considered

### Alternativa A — PWA (elegida)

**Descripción:** sitio web HTML/CSS/JS estático en Vercel con manifest + service worker. Instalable vía "Agregar a pantalla de inicio" en Chrome (Android), Safari (iOS), Edge (desktop).

**Pros:**
- $0 hosting (Vercel free: 100GB bandwidth/mes, HTTPS automático).
- Instalación sin Play Store / sin APK / sin fuentes desconocidas — un link y un toque "agregar a inicio".
- Multi-plataforma desde el día uno (Android Chrome + iOS Safari + desktop browser).
- Iteración rápida: cambio en código → `vercel --prod` → en 60s está en producción para todos los usuarios sin desinstalar/reinstalar nada.
- Service worker permite offline real y caching del shell.
- Cámara nativa del browser vía `BarcodeDetector` API (Chrome Android desde 88+; iOS via `html5-qrcode` fallback).
- No vendor lock-in: el código es HTML/JS portable; hosting cambiable a GitHub Pages / Netlify / Cloudflare Pages sin reescribir.

**Cons:**
- iOS Safari tiene soporte PWA parcial: el prompt de instalación no es automático (el usuario debe ir a Compartir → Agregar a pantalla); service worker tiene límites (no background sync de verdad en iOS).
- `BarcodeDetector` no está en iOS Safari hasta v17+ — fallback `html5-qrcode` agrega ~50KB.
- Limitaciones de UI: animaciones complejas, gestos avanzados o acceso a APIs nativas profundas (NFC, BLE) no aplican.
- Algunos usuarios desconfían de "abrir un link" vs "instalar una app" — fricción percibida aunque técnica sea menor.

**Rejection reason:** N/A — esta es la opción elegida.

**Cuándo revisaríamos esta elección:** si en Fase 2/3 se necesitan APIs nativas (notificaciones push críticas en iOS, NFC para carnets, integración con sistema operativo profundo), reconsiderar híbrida o nativa.

### Alternativa B — App nativa Android (Kotlin)

**Descripción:** app Kotlin compilada a APK, distribuida vía Play Store (con cuenta de developer paga, $25 single payment) o sideload.

**Pros:**
- Performance nativa y acceso completo a APIs Android.
- Distribución profesional vía Play Store.
- Modelo de actualización gestionado por el OS.

**Cons:**
- **Solo Android.** Para iPhone hay que reescribir todo o agregar iOS Swift en paralelo — duplica el esfuerzo.
- **Cuenta de developer Play Store $25 + tiempo de review** — el usuario no quiere pagar nada en Fase 1.
- **Pipeline de build** complejo para un solo dev (Gradle, signing, distribución alternativa).
- **Curva de aprendizaje Kotlin/Android SDK** para un dev que no es Android-native.
- **Iteración lenta**: cada cambio implica build APK + redistribución + usuario instala manualmente.

**Rejection reason:** el costo de aprendizaje + el lock-in a una plataforma + el costo de Play Store son todos cero-justificados para un MVP de un solo usuario / un solo instructor. PWA da el 90% del valor al 10% del costo.

**Cuándo revisaríamos:** si el producto pasa a tener 100+ instructores activos y el SENA institucional ofrece distribución vía su catálogo oficial, una app nativa o híbrida con presencia en store haría sentido.

### Alternativa C — Híbrida (Capacitor sobre la PWA)

**Descripción:** envolver la PWA en un wrapper Capacitor que la empaqueta como APK Android + IPA iOS, manteniendo el mismo código HTML/JS.

**Pros:**
- Reusa el código PWA al 100%.
- Permite acceso a algunas APIs nativas que PWA no tiene.
- Distribución vía store si se quiere.

**Cons:**
- Sigue exigiendo cuenta de developer Play Store.
- Agrega complejidad de pipeline de build.
- No resuelve nada que PWA no resuelva en Fase 1.
- Sigue siendo wrapper, no nativo de verdad — performance similar a PWA pura.

**Rejection reason:** complejidad agregada sin beneficio claro en Fase 1. Si en Fase 2 se necesita acceso a NFC o notificaciones push iOS de calidad, ahí sí entra Capacitor como migración natural desde PWA — pero solo cuando exista la necesidad concreta.

**Cuándo revisaríamos:** si en Fase 2 se necesita push iOS confiable o NFC, Capacitor es el siguiente paso natural y aprovecha el código PWA existente.

### Alternativa D — Quedarse en App Inventor (status quo)

**Pros:**
- Cero migración. Funciona hoy.
- Conocido por el usuario.

**Cons:**
- Todos los problemas que motivan este ADR siguen ahí: Companion fricción diaria, sin iOS, sin actualización gestionada, código en bloques difícil de mantener / iterar.

**Rejection reason:** el motivo de hacer esta migración es justamente que el status quo no es sostenible.

## Rationale

Los **drivers de decisión** que pesaron más:

1. **Distribución sin store / sin APK**: el usuario explícitamente no quiere pagar Play Store ni gestionar APKs. PWA es la única opción que cumple esto a $0.
2. **Multi-plataforma desde Fase 1**: aunque Fase 1 sea un solo instructor (Android), Fase 2 puede tener un coordinador con iPhone. Construir PWA gratis nos da iOS de regalo; construir Kotlin nos cuesta un proyecto entero.
3. **Iteración rápida del solo-dev**: deploy en 60s a producción es decisivo cuando uno mismo es el equipo. PWA permite esto naturalmente; Android nativo no.
4. **Offline y cámara cubiertos** por las APIs web modernas — los cons históricos de PWA ya no aplican para este caso de uso.

Los cons de PWA (iOS Safari quirks, `BarcodeDetector` fallback) son **costo aceptable** para Fase 1. Si en Fase 2 se vuelven dolorosos, Capacitor es la siguiente puerta sin reescribir el código.

## Consequences

### Positive
- **Iteración** en minutos en lugar de horas (deploy Vercel vs build APK + reinstall).
- **Distribución universal** vía URL — funciona en Android, iOS y desktop sin cambios.
- **$0 hosting** y $0 distribución durante toda Fase 1.
- **Instalación frictionless** — un toque "agregar a pantalla de inicio".
- **Code shape transferible**: el HTML/JS se puede mover a Capacitor (Fase 2) o a un framework (React/Vue) sin reescribir el backend.

### Negative
- **iOS Safari** tendrá experiencia ligeramente inferior (prompt de instalación manual, background sync limitado, cámara via fallback).
- **No estamos en Play Store** — algunos instructores podrían percibir "no es una app real" — barrera psicológica.
- **Service worker** introduce una capa de complejidad nueva (cache invalidation, update flow) que el equipo debe manejar.
- **Sin push notifications** en iOS confiables — si Fase 2 los necesita para coordinador, hay que migrar a Capacitor.

### Neutral / informational
- El **backend no cambia** — Apps Script + Sheets sigue siendo la fuente de verdad. Esto es muy positivo (zero migration cost) pero significa que el ritmo del backend (Apps Script timeout 6 min, ejecuciones diarias 90 segundos en cuenta gratuita, etc.) limita la PWA tanto como limitaba al App Inventor [from: limitaciones Apps Script free].

### Risks
- **Riesgo A:** Service worker mal configurado → caching agresivo → usuarios ven versión vieja después de un deploy. **Indicador:** reportes de "no veo el cambio que hiciste". **Mitigación:** versionar el SW con timestamp y forzar update en deploy.
- **Riesgo B:** iOS Safari deja de soportar PWA install (Apple ha amenazado periódicamente). **Indicador:** noticias de WWDC + tracking de Safari release notes. **Mitigación:** Capacitor wrapper como Plan B documentado.

## Implicaciones cross-fase

| Fase | Comportamiento | Hook que debe existir HOY | Qué la bloquearía si se hace mal |
|---|---|---|---|
| **Fase 1** | PWA pura, single-instructor, single-tenant (1 sheet, 1 endpoint) | manifest.json + service-worker.js con versioning correcto desde el inicio | hardcodear el endpoint en HTML — debe estar en localStorage para que Fase 2 pueda cambiarlo sin redeploy |
| **Fase 2** | PWA multi-instructor: cada instructor configura su propio endpoint en Ajustes; mismo bundle de PWA sirve a varios | endpoint configurable en localStorage (ya está en prototipo §settings); ficha y `instructor_id` se persisten en settings | si Fase 1 hardcodea instructor_id implícitamente (asumiendo siempre el mismo), Fase 2 obliga a refactor |
| **Fase 3** | PWA con vista de aprendiz — posiblemente Capacitor para iOS push notifications a coordinador y aprendiz | UI debe estar separada por rol (instructor / aprendiz) aunque hoy solo instructor; el routing por hash con vistas separadas (ya en prototipo) facilita esto | si Fase 1 mezcla lógica de instructor en componentes "globales", Fase 3 requiere refactor profundo |

[PHASE-DEFERRED: Fase 2/3 — Capacitor wrap, push notifications nativas y vista de aprendiz a deliberar al cumplir gate; hook hoy: localStorage para endpoint/ficha + routing por hash.]

## Validation plan

- **Leading indicator (semanal):** ¿el usuario abrió la PWA en aula esta semana?, ¿al menos N veces? Si no abre, la fricción percibida es alta y debemos investigar.
- **Lagging indicator (mensual):** ¿el porcentaje de sesiones registradas via PWA vs planilla de papel está creciendo? Si no, la migración falla a pesar de la decisión técnica.
- **Review trigger:** si tras 4 semanas en aula real el instructor reporta ≥3 bugs bloqueantes inherentes al ser PWA (no a bugs nuestros), reconsiderar Capacitor o nativo.

## Implementation notes

- **Hosting:** Vercel free, deploy desde Git push o `vercel --prod`.
- **Manifest:** crear `public/manifest.json` con `name`, `short_name`, `start_url: "/"`, `display: "standalone"`, `theme_color: "#0F172A"`, íconos 192/512.
- **Service worker:** mínimo viable cachea `index.html`, Tailwind CDN, íconos. Versionado con timestamp (`const CACHE_VERSION = '2026-05-23-1'`).
- **HTTPS:** automático en Vercel.
- **Cámara:** intentar `BarcodeDetector` primero, fallback a `html5-qrcode` si no disponible.

## References

- `01-product-vision.md` §6 — principios (sin Play Store, principio "el backend Google es activo, el cliente es desechable").
- `04-product-requirements.md` §FR-011 (instalación PWA), §FR-013 (offline).
- `GUIA-ANDROID.md` — guía actual de App Inventor, evidencia de la fricción que motiva esta decisión.
- `prototipo-pwa.html` — prototipo navegable que materializa esta decisión.
- Memory `workflow_push_apps_script_via_playwright.md` — gotcha relacionado (el dev flow para Apps Script no afecta la PWA, son piezas separadas).
