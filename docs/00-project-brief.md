# Project Brief · Asistencia SENA

**Versión:** 1.0 (regenerada por autonomous-docs-pipeline)
**Fecha:** 2026-05-23
**Documento estable** · referencia canónica para el resto de la suite.

---

## 1. One-line description

**Asistencia SENA** es una aplicación de registro de asistencia para instructores del SENA (Servicio Nacional de Aprendizaje, Colombia) que reemplaza la planilla en papel mediante escaneo de QR + un panel analítico de riesgo de deserción [from: conversación 2026-05-22/23, plan PWA §sketch].

## 2. Problem

Los instructores del SENA deben registrar manualmente la asistencia de cada aprendiz en planilla física al inicio de cada sesión. Este proceso (a) consume 5-10 minutos por sesión, (b) no genera reportes consolidados sin trabajo adicional, (c) no permite detectar tempranamente patrones de deserción (rachas consecutivas de inasistencia, % de asistencia por debajo del umbral SENA de 80%), y (d) no se sincroniza entre instructores que comparten grupo. La consecuencia operativa es que problemas de deserción se detectan tarde — cuando ya hay un aprendiz en riesgo de sanción o exclusión [from: contexto conversacional + escenario SENA].

## 3. Users / Personas

- **Instructor titular** (persona primaria): docente SENA que dicta una o más fichas. Necesita registrar asistencia diaria rápidamente y ver de un vistazo quién está en riesgo. Edad típica 30-55 años, alfabetización digital media, usa Android mid-range [from: conversación].
- **Coordinador académico** (persona secundaria, Fase 2+): jefe de área que necesita consolidar asistencia de múltiples fichas para reportes a la dirección regional. Hoy lo hace pidiendo planillas a cada instructor [ASSUMPTION: rol estándar SENA — `[OPEN: confirmar nomenclatura exacta del rol]`].
- **Aprendiz** (persona terciaria, lectura): podría ver su propia asistencia en una versión futura. Hoy no es usuario directo del sistema. [PHASE-DEFERRED: Fase 3 — vista de aprendiz a deliberar].

## 4. Domain

Educación técnica/tecnológica formal — SENA Colombia. Regulación: el SENA exige asistencia mínima del 80% para aprobar competencias; aprendices con inasistencias justificadas pueden recuperar; inasistencias injustificadas acumuladas llevan a desescolarización. Esto convierte la detección temprana en un valor crítico, no en un nice-to-have [ASSUMPTION: regla 80% inferida del estándar SENA público; `[OPEN: verificar % exacto del reglamento académico vigente]`].

## 5. Geographic / cultural scope

Colombia, todas las regionales SENA. Español como idioma único en MVP. Timezone única `America/Bogota` (UTC-5, sin DST) — esta es una decisión técnica relevante [from: ADR-001 forward-ref, decisión existente en `merged.gs` constante `TIMEZONE`].

## 6. Business model (one paragraph)

Herramienta interna sin modelo comercial directo. No hay cobro, no hay suscripción, no hay publicidad. El "valor" es operativo: ahorra tiempo al instructor, reduce errores de planilla y previene desescolarizaciones por detección tardía. En consecuencia se omiten Market Study y BRD — ver stubs respectivos [from: scope decision].

## 7. Tech stack (one paragraph)

**Backend**: Google Apps Script desplegado como Web App, persistencia en Google Sheets (`asistencia.1`, ID `1QAbakTBpfWI4ecyOYJTlMer1WIEY9qqSlrl82UM61ww`) [from: `merged.gs` constante SS_ID]. **Cliente actual**: app Android compilada desde MIT App Inventor (`Asistencia-fixed.aia`) — funcional pero limitada [from: GUIA-ANDROID.md]. **Cliente Fase 1 (en migración)**: PWA HTML+Tailwind sobre el mismo backend Apps Script, hosteada en Vercel free tier [from: prototipo-pwa.html, conversación 2026-05-23]. Stack detallado en Engineering Guide.

## 8. Constraints

- **Presupuesto $0** — todas las piezas deben correr en tiers gratuitos (Apps Script, Google Sheets, Vercel free) [from: constraint conversacional].
- **Sin equipo de desarrollo** — un solo dev (el usuario), por tanto la complejidad debe ser sostenible solo [from: scope].
- **Locale es_CO obligatorio** — el sheet usa separador `;` y zona horaria Bogotá; cualquier código que escriba fórmulas debe respetarlo (ya hay un gotcha conocido con `setFormula`) [from: ADR-005 forward-ref, gotcha capturado en memoria].
- **Sin Play Store / sin APK** — la migración a PWA es justamente para evitar la fricción del ciclo APK + instalación + permisos [from: conversación; razón explícita].
- **Compatible con celulares Android mid-range** — la app la usa el instructor desde su propio dispositivo personal, no hay hardware provisto [from: conversación].

## 9. Phases / horizon

- **Fase 1 (deliberada · en curso)** — PWA con dashboard analítico, 4 estados de asistencia (Presente / Tarde / Justificado / Ausente), undo, búsqueda, histórico. **Gate de salida**: instructor del usuario lo usa en aula real por 2 semanas sin reportar bugs bloqueantes.
- **Fase 2** — Multi-grupo (varias fichas por instructor) + alertas push para coordinador cuando un aprendiz cruza umbral de riesgo. **Gate de entrada**: Fase 1 estable + ≥1 instructor adicional pidiendo el sistema.
- **Fase 3** — Vista de aprendiz (autoconsulta de su asistencia) + integración con sistema institucional SENA si lo permiten (out of our control).

Solo Fase 1 se detalla a profundidad. Fase 2/3 viven en PRD §8 con gates medibles y en ADRs como análisis cross-fase. [PHASE-DEFERRED: Fase 2/3 — features y pantallas a deliberar al cumplir gates].

## 10. References

- `~/.claude/projects/.../memory/project_asistencia.md` — contexto persistido del proyecto
- `~/.claude/projects/.../memory/gotcha_apps_script_setformula_locale.md` — gotcha de `setFormula` en es_CO (relevante para ADR-005)
- `merged.gs` — código del backend actual (10,200 líneas comentadas)
- `prototipo-pwa.html` — prototipo de Fase 1 con 5 vistas
- `GUIA-ANDROID.md` — guía actual de uso del cliente Android viejo (será reemplazada por la PWA)
- `usuarios-prueba.html` — página de QRs de prueba
- Conversación 2026-05-22/23 con el usuario sobre el flujo de uso real
