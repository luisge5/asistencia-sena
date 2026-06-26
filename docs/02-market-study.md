# Market Study — STUB · skipped intencionalmente

**Versión:** 1.0
**Fecha:** 2026-05-23
**Estado:** ⚪ Skipped por decisión de scope (no por falta de información)

---

## Por qué se omite

El proyecto **Asistencia SENA** es una herramienta interna del instructor, sin modelo comercial: no se cobra, no se vende, no se compite por cuota de mercado. No hay TAM/SAM/SOM significativo, no hay competidores comerciales relevantes, no hay precios a comparar, no hay GTM. Las preguntas que un Market Study responde (tamaño de mercado, posicionamiento competitivo, pricing, unit economics) no aplican al producto en este momento [from: 00-project-brief.md §6, 01-product-vision.md §4-5].

Esta decisión se revisa si:

- **El sistema crece más allá de un instructor individual** y se vuelve oferta a otras instituciones educativas o al SENA institucional. En ese caso correspondería un Market Study real con análisis de Sofia Plus, planillas digitales comerciales, sistemas LMS con módulo de asistencia (Moodle, Canvas), apps comerciales para profesores (Additio, Idoceo, Class Dojo, TeacherKit) [ASSUMPTION: ecosistema competitivo conocido para apps de profesor; no investigado a fondo en este run].
- **El usuario decide monetizarlo** (poco probable dado el contexto — herramienta personal).
- **Un coordinador o regional SENA expresa interés institucional** y abre la posibilidad de oferta formal.

## OPEN items deferidos al usuario (si en algún momento procede el Market Study)

Si en el futuro se decide hacer Market Study completo, las preguntas a responder son:

- `[OPEN: ¿hay datos públicos sobre tasas de deserción SENA por regional/programa que cuantifiquen el problema?]`
- `[OPEN: ¿qué proporción de instructores SENA usa herramientas digitales (incluso informales como Excel) para asistencia hoy?]`
- `[OPEN: ¿el SENA institucional tiene un módulo oficial de asistencia digital? ¿qué cobertura tiene?]`
- `[OPEN: si se ofreciera al SENA como herramienta institucional, ¿bajo qué modelo (donación, licencia, integración a Sofia Plus)?]`
- `[OPEN: si se ofreciera a otras instituciones educativas técnicas/tecnológicas privadas, ¿precio?, ¿modelo SaaS por aula/por institución?]`

## Cómo completarlo más adelante

Cuando proceda, invocar el skill `/market-study` con el contexto bundle existente + lo investigado. La salida iría a este mismo archivo, reemplazando el stub.

## Referencias

- Brief §6 — explicación del scope
- PVD §4-5 — diferenciación y valor (lo más cercano a competitive positioning que existe hoy)
