# Product Vision · Asistencia SENA

**Versión:** 1.0
**Fecha:** 2026-05-23
**Documento durable** · este es el "norte" que sobrevive a cambios de stack o features.

---

## 1. Vision statement

> **Que ningún aprendiz SENA deserte por inasistencia que pudo verse a tiempo.**

Una sola línea, horizonte 5 años. El producto no existe para automatizar planillas — existe para que la deserción detectable se vea con suficiente antelación para actuar.

## 2. Mission statement

> **Asistencia SENA convierte el registro de asistencia diaria en una señal de riesgo accionable** — visible al instructor en su celular en menos de 30 segundos por sesión.

Misión presente, no aspiracional. Es lo que el producto hace HOY (o cuando Fase 1 esté terminada).

## 3. Problem space

El SENA, como sistema educativo técnico/tecnológico colombiano de mayor escala (millones de aprendices), tiene un problema operativo invisible pero crítico: **la deserción ocurre antes de la sanción formal, pero la planilla de papel no la muestra hasta que ya es tarde**.

El flujo típico del problema:
1. Aprendiz falta 1 día — el instructor lo ve, no actúa porque "una vez no es nada"
2. Aprendiz falta otro día (días discontinuos) — el instructor no lo ata mentalmente con el primero
3. Aprendiz falta 3, 4, 5 días seguidos (racha consecutiva) — el instructor empieza a notar, pero el aprendiz ya está fuera mentalmente
4. Aprendiz cruza umbral SENA del 80% de asistencia — sanción inminente
5. Aprendiz es desescolarizado

En cada paso hubo una oportunidad de intervención. La planilla de papel **acumula datos pero no produce señal**. Una aplicación que muestre rachas, ausencias discontinuas y % de asistencia en tiempo real convierte cada uno de esos pasos en una alerta.

El problema secundario es operativo: el instructor pierde 5-10 minutos por sesión en planilla manual + 1-2 horas semanales en consolidar reportes que pide el coordinador. Recuperar ese tiempo no es accesorio, es justamente el cambio de comportamiento que habilita usar la nueva señal — si el flujo es más rápido, el instructor lo usa diario, lo que requiere para que las señales tengan datos frescos [ASSUMPTION: tiempos basados en el flujo descrito por el usuario en conversación + estimación razonable de planilla manual].

## 4. Value proposition

| Para... | El valor único es... | Diferente de... |
|---|---|---|
| **Instructor SENA** | Registro de asistencia en <30s por sesión + alertas de riesgo en pantalla principal | una planilla de papel (acumula pero no señaliza) o un Excel local (sin acceso desde el aula) |
| **Coordinador académico** (Fase 2) | Vista consolidada de múltiples fichas + alerta automática cuando un aprendiz cruza umbral | pedir planillas a cada instructor y consolidar a mano |
| **Aprendiz** (Fase 3) | Autoconsulta de su asistencia y % vigente — saber dónde está parado antes del cierre del trimestre | adivinar / preguntar al instructor / esperar al sistema institucional |

La propuesta de valor central no es "registrar asistencia" — eso es commodity. El valor único es **convertir la asistencia en una señal accionable de riesgo** con tiempo suficiente para intervenir.

## 5. Differentiation — what we are NOT

Decir claramente lo que el producto NO es importa tanto como lo que es:

- **No es un sistema institucional SENA.** No reemplaza Sofia Plus ni la plataforma oficial. No emite documentos certificados. Es un complemento del instructor, no del sistema [from: scope].
- **No es un sistema multi-instructor en Fase 1.** Un instructor, una ficha, un sheet. La consolidación cross-ficha es Fase 2 [from: scope decision].
- **No es un sistema de gestión académica completo.** No maneja notas, no maneja currículo, no maneja matrículas. Solo asistencia [from: scope].
- **No reemplaza al instructor en la decisión de qué hacer con un aprendiz en riesgo.** El producto señala, el humano decide e interviene. No hay "kick" automático, no hay reporte automático a coordinación en Fase 1 [from: design intent].
- **No es una herramienta de control de empleados.** Aunque el patrón técnico podría extenderse, el dominio es educativo: el aprendiz no es empleado, las consecuencias son académicas (recuperación, plan de mejora), no laborales.
- **No es una app de Play Store con onboarding pagado.** PWA gratis, sin instalación binaria, sin store. Si un instructor quiere usarla, abre el link [from: ADR-001 forward-ref].

## 6. Strategic principles

Cinco principios inmutables. Decisiones de feature/diseño futuras deben citar al menos uno de éstos:

### 6.1 La señal manda sobre el registro

El propósito del producto no es capturar datos sino producir señales. Cada decisión de UI prioriza ver el riesgo (rachas, faltantes, % bajo umbral) sobre los datos crudos. Si una pantalla muestra una tabla cuando podría mostrar un indicador, está mal diseñada. **Aplicación concreta**: la vista "Hoy" pone faltantes con botones de acción al frente, no una lista alfabética del padrón [from: prototipo §vista #hoy].

### 6.2 Velocidad del registro > exhaustividad del registro

Un instructor que tarda más de 30 segundos por sesión dejará de usarlo. La velocidad gana sobre features. Por eso: 3 botones grandes inline en la lista de faltantes en lugar de una pantalla de "detalles del aprendiz" + 4 estados predefinidos en lugar de un campo libre [from: design intent prototipo].

### 6.3 Locale Colombia como decisión de producto, no de localización

`America/Bogota`, español, formato `dd/MM/yyyy`, separador `;` en Sheets. Esto no es internacionalización (futuro) — es la base del MVP. Cada bug que tuvimos sobre timezone (`fecha` corrido un día) o fórmulas (#ERROR con `setFormula`) viene de no respetar este principio [from: gotcha capturado].

### 6.4 El backend Google es activo, el cliente es desechable

El Sheet `asistencia.1` es la fuente de verdad. El cliente (App Inventor hoy, PWA mañana, otra cosa pasado mañana) es intercambiable. Cada decisión técnica del cliente debe minimizar lock-in y maximizar que el sheet sea utilizable también desde fuera de la app [from: architecture intent].

### 6.5 Diferir bien ≠ diferir y rezar

Fase 2/3 no se especifican como features, pero sí se reservan hooks arquitectónicos en Fase 1 (columna `instructor_id` aunque hoy solo haya uno; columna `grupo` aunque hoy solo haya un grupo). Los hooks no son código muerto — son la diferencia entre Fase 2 siendo un upgrade vs Fase 2 siendo una reescritura [from: SKILL.md §Phase-depth policy del pipeline].

## 7. Phased horizon

| Fase | Plazo | Esencia (no features — esencia) | Gate de entrada |
|---|---|---|---|
| **Fase 0** (ya hecho) | 2026-05 | Backend Apps Script funcional + cliente App Inventor "lo justo" | — |
| **Fase 1** (deliberada · MVP PWA) | 2026 Q3 | Reemplazo del cliente por PWA con dashboard analítico de riesgo y 4 estados | Backend estable (ya), prototipo validado en aula real |
| **Fase 2** (deferred) | 2026 Q4 / 2027 Q1 | Multi-ficha por instructor + role de coordinador con vista consolidada + alertas push | Fase 1 usada por ≥1 instructor en aula real durante ≥4 semanas SIN bugs bloqueantes + ≥1 instructor adicional pidiendo el sistema |
| **Fase 3** (deferred) | 2027+ | Vista de aprendiz (autoconsulta) + integración con sistema institucional SENA si lo permiten | Fase 2 con ≥3 fichas activas + interés/conversación formal con un coordinador SENA |

## 8. Success in 5 years

Imagen concreta de cómo se ve el éxito en 2031:

- **≥50 instructores SENA** usándolo en aula real (no un piloto académico), preferentemente en 2+ regionales [ASSUMPTION: estimación razonable para crecimiento orgánico boca-a-boca; sin marketing].
- **≥1,500 aprendices** con asistencia trackeada activamente vía el sistema [ASSUMPTION: 50 instructores × 30 aprendices promedio por ficha].
- **≥1 caso documentado** de un coordinador interviniendo proactivamente con un aprendiz por una alerta del sistema, donde ese aprendiz NO desertó. Esto es la prueba del valor; el resto es vanity.
- **El sistema sigue corriendo en tier gratis Google + Vercel** — el éxito no es escalar la infraestructura, es seguir resolviendo el problema con el mismo presupuesto $0.
- **Una decisión consciente sobre el siguiente paso**: o el sistema se cede al SENA institucional, o se mantiene como herramienta de instructor independiente, o se cierra porque el SENA institucional construyó algo equivalente. Cualquiera de los tres es un éxito si la decisión es consciente.

## 9. Elevator pitch

> "Soy instructor SENA. En lugar de planilla de papel, escaneo el QR de mis aprendices con el celular y la asistencia queda registrada en mi Google Sheet. La app me muestra en pantalla principal quién faltó hoy, quién lleva 3 días seguidos sin venir, y quién está por debajo del 80% de asistencia — así puedo intervenir antes de que se descuelguen del curso. Es gratis, vive en mi celular sin instalar nada del Play Store, y los datos son míos en mi Drive."

---

## Referencias cruzadas

- Brief → `00-project-brief.md`
- Por qué se omite Market Study → `02-market-study.md` (stub)
- Por qué se omite BRD → `03-business-requirements.md` (stub)
- Features que materializan esta visión → `04-product-requirements.md` §4
- Hooks arquitectónicos para Fase 2/3 → ADRs en `05-decisions/`
- Pantallas que rinden los principios estratégicos → `06-design-document.md`
