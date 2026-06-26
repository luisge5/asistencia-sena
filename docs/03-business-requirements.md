# Business Requirements Document — STUB · skipped intencionalmente

**Versión:** 1.0
**Fecha:** 2026-05-23
**Estado:** ⚪ Skipped por decisión de scope

---

## Por qué se omite

Un BRD existe para justificar a stakeholders financieros / leadership por qué la inversión vale la pena (ROI, KPIs financieros, presupuesto, headcount). En este proyecto **no aplica**:

- **Sin presupuesto** — el proyecto vive en tier $0 (Apps Script + Sheets + Vercel free) [from: 00-project-brief.md §8].
- **Sin equipo** — un solo dev (el usuario mismo), por tanto no hay headcount, salarios, ni resource plan que decidir [from: 00-project-brief.md §8].
- **Sin stakeholder financiero externo** — el "ROI" del usuario es personal (su tiempo, su interés en ayudar a aprendices), no contable.
- **Sin necesidad de convencer a leadership** — el usuario es el único decisor.

Hacer un BRD aquí sería rellenar tablas con `[OPEN: N/A]` en cada celda — pollution. Es más honesto skipear con esta explicación.

## KPIs sí relevantes (sin estructura formal de BRD)

Aunque no haya BRD formal, sí hay 3 KPIs que el sistema debe poder medir para saber si está funcionando — viven en el PRD §5 como NFR de observabilidad:

1. **Tiempo promedio por sesión de registro** (objetivo: < 30 segundos por sesión completa, medido del primer escaneo al último).
2. **# de aprendices detectados en riesgo que NO terminaron desertando** (lagging metric — el verdadero éxito; revisable trimestralmente).
3. **Uptime efectivo del backend Apps Script** (objetivo: ≥99% en horario de aula 07:00-17:00 Bogotá; medible vía Apps Script execution logs).

Estos no son KPIs de negocio (revenue, growth, retención de clientes pagos). Son KPIs operativos del producto. Los KPIs comerciales no aplican.

## Cuándo proceder con BRD real

- Si el sistema se ofrece a una institución (SENA o privada) con contrato/licencia → BRD formal con ROI institucional.
- Si se forma un equipo > 1 persona y hay decisiones de presupuesto → BRD para alinear stakeholders.
- Si se busca financiación externa (improbable en este proyecto) → BRD + caso de negocio.

## Cómo completarlo más adelante

Invocar `/business-requirements` cuando proceda. La salida iría a este archivo reemplazando el stub.

## Referencias

- Brief §6, §8 — explicación del scope
- PRD §5 (observability) — donde sí viven los KPIs operativos
