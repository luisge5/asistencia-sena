# Metodolog�a de Trabajo con Agente de Programaci�n
## Sistema Reutilizable para Cualquier Proyecto

---

## INSTRUCCIONES DE USO

1. Copia este archivo a la ra�z de tu proyecto
2. Sigue las fases en orden
3. Copia y pega cada prompt cuando llegues a esa fase
4. Personaliza los [PLACEHOLDERS] seg�n tu proyecto

---

## FASE 0: CONTEXTO INICIAL
### Para empezar un proyecto nuevo

**Prompt 0.1 � Definir proyecto:**
`
Estoy creando un proyecto llamado [NOMBRE_PROYECTO].

**Meta:** [DESCRIBE EN 1-2 ORACIONES QUE HACE EL PROYECTO]

**Restricciones:**
- Presupuesto: [CANTIDAD o "gratis"]
- Equipo: [N personas, roles]
- Dispositivos: [m�vil, desktop, ambos]
- Idioma: [espa�ol, ingl�s, etc.]
- Locale: [pa�s, zona horaria]
- Formato fecha: [dd/MM/yyyy, MM/dd/yyyy, etc.]

**Archivos existentes:**
[LISTA DE ARCHIVOS O "ninguno"]

Por favor analiza esto y dime qu� stack recomiendas y por qu�.
`

---

## FASE 1: AN�LISIS
### Para entender c�digo o proyecto existente

**Prompt 1.1 � Analizar proyecto:**
`
Analiza el proyecto actual en esta carpeta.

**Quiero saber:**
1. Qu� hace este proyecto
2. Qu� tecnolog�a usa
3. Qu� archivos son importantes
4. Qu� problemas o deudas t�cnicas ves
5. Qu� se puede mejorar

Lee los archivos principales y dame un resumen ejecutivo.
`

**Prompt 1.2 � Analizar un archivo espec�fico:**
`
Lee el archivo [RUTA_ARCHIVO] y expl�came:
1. Qu� hace
2. C�mo funciona
3. Qu� patrones usa
4. Qu� problemas tiene
5. C�mo se puede mejorar
`

**Prompt 1.3 � Buscar algo espec�fico:**
`
Busca en el proyecto c�mo se maneja [FUNCIONALIDAD].

Ejemplos:
- autenticaci�n de usuarios
- manejo de errores
- caching
- base de datos
- routing

Dime d�nde est�, c�mo funciona y si est� bien implementado.
`

---

## FASE 2: ARQUITECTURA Y STACK
### Para decidir tecnolog�as

**Prompt 2.1 � Comparar tecnolog�as:**
`
Necesito elegir entre [TECNOLOG�A_A] y [TECNOLOG�A_B] para [PROP�SITO].

**Contexto del proyecto:**
- [CONTEXTO]

**Factores importantes:**
- [FACTOR_1]
- [FACTOR_2]
- [FACTOR_3]

Compara ambas opciones con tabla de pros/contras y recomienda una.
`

**Prompt 2.2 � Definir arquitectura:**
`
Dise�a la arquitectura para un proyecto de [TIPO].

**Stack elegido:**
- Frontend: [STACK]
- Backend: [STACK]
- Base de datos: [STACK]
- Otros: [TOOLS]

**Requisitos:**
- [REQUISITO_1]
- [REQUISITO_2]
- [REQUISITO_3]

**Quiero:**
1. Estructura de carpetas
2. Patrones a usar
3. Flujo de datos
4. Diagrama ASCII si es posible
`

**Prompt 2.3 � Documentar decisi�n (ADR):**
`
Crea un ADR (Architecture Decision Record) para la decisi�n:

**Decisi�n:** [QU� SE DECIDI�]
**Contexto:** [POR QU� SE DECIDI�]
**Alternativas:** [QU� SE CONSIDER�]
**Consecuencias:** [QU� IMPACTA]

Formato ADR est�ndar.
`

---

## FASE 3: DISE�O DETALLADO
### Para planificar componentes

**Prompt 3.1 � Dise�ar base de datos:**
`
Dise�a el esquema de base de datos para [PROYECTO].

**Entidades principales:**
- [ENTIDAD_1]: [campos]
- [ENTIDAD_2]: [campos]
- [ENTIDAD_3]: [campos]

**Relaciones:**
- [RELACI�N_1]
- [RELACI�N_2]

**Requisitos:**
- [REQUISITO_1]
- [REQUISITO_2]

Dime: tablas, columnas, tipos, relaciones, �ndices.
`

**Prompt 3.2 � Dise�ar API:**
`
Dise�a la API REST para [PROYECTO].

**Recursos:**
- [RECURSO_1]
- [RECURSO_2]

**Operaciones necesarias:**
- CRUD completo para cada recurso
- [OTRAS OPERACIONES]

**Autenticaci�n:** [TIPO]

Dime: endpoints, m�todos, request/response, errores.
`

**Prompt 3.3 � Dise�ar componentes UI:**
`
Dise�a los componentes UI para [PANTALLA/FUNCI�N].

**Funcionalidad:** [QU� HACE]
**Usuarios:** [QUI�N LO USA]
**Datos:** [QU� MUESTRA]

**Quiero:**
1. Lista de componentes
2. Jerarqu�a
3. Props de cada uno
4. Estados posibles
`

---

## FASE 4: BACKLOG Y PLANIFICACI�N
### Para organizar el trabajo

**Prompt 4.1 � Crear backlog completo:**
`
Crea un backlog completo para [PROYECTO].

**Alcance:**
- [M�DULO_1]
- [M�DULO_2]
- [M�DULO_3]

**Formato requerido:**
- �picas (grandes bloques)
- Historias de usuario (funcionalidades)
- Tareas (pasos concretos)
- Subtareas (detalles)

**Incluir:**
- Estimaci�n de esfuerzo (bajo/medio/alto)
- Prioridad (alta/media/baja)
- Dependencias

Organiza en sprints de 1-2 semanas.
`

**Prompt 4.2 � Planificar sprint:**
`
Planifica el Sprint [N�MERO] de este proyecto.

**Backlog disponible:**
[PEGA TAREAS DEL BACKLOG]

**Duraci�n:** [1-2 semanas]
**Equipo:** [N personas]
**Capacidad:** [horas disponibles]

**Selecciona tareas considerando:**
1. Prioridad
2. Dependencias
3. Balance de esfuerzo
4. Quick wins primero

Dime: tareas seleccionadas, orden, responsable, estimaci�n.
`

**Prompt 4.3 � Refinar historia de usuario:**
`
Refina esta historia de usuario:

**Original:** [HISTORIA]

**Quiero:**
1. Criterios de aceptaci�n claros
2. Subtareas detalladas
3. Estimaci�n de esfuerzo
4. Dependencias
5. Edge cases a considerar
`

---

## FASE 5: EJECUCI�N
### Para implementar c�digo

**Prompt 5.1 � Implementar funci�n:**
`
Implementa [FUNCI�N/COMPONENTE].

**Contexto:**
- Proyecto: [NOMBRE]
- Stack: [TECNOLOG�AS]
- Archivos relevantes: [RUTAS]

**Requisitos:**
1. [REQUISITO_1]
2. [REQUISITO_2]
3. [REQUISITO_3]

**Patrones a seguir:**
- [PATR�N]
- [CONVENCIONES]

**No hagas:**
- [LO QUE NO DEBES HACER]

Implementa con c�digo limpio y comenta lo necesario.
`

**Prompt 5.2 � Refactorizar c�digo:**
`
Refactoriza [ARCHIVO/FUNCI�N].

**Problemas actuales:**
- [PROBLEMA_1]
- [PROBLEMA_2]

**Objetivos:**
- [OBJETIVO_1]
- [OBJETIVO_2]

**Restricciones:**
- No romper funcionalidad existente
- Mantener compatibilidad con [COMPONENTES]
- Seguir patrones del proyecto

Dime qu� cambios har�as antes de hacerlos.
`

**Prompt 5.3 � Debuggear problema:**
`
Tengo un problema con [FUNCI�N/ARCHIVO].

**Error:**
[MENSAJE DE ERROR]

**Comportamiento esperado:** [QU� DEBER�A PASAR]
**Comportamiento actual:** [QU� PASA]

**Lo que ya intent�:**
- [INTENTO_1]
- [INTENTO_2]

**Contexto relevante:**
- [ARCHIVOS INVOLUCRADOS]
- [CAMBIOS RECIENTES]

Ay�dame a encontrar y resolver el problema.
`

**Prompt 5.4 � Escribir tests:**
`
Escribe tests para [FUNCI�N/COMPONENTE].

**Qu� testear:**
- [CASO_1]
- [CASO_2]
- [CASO_3]

**Framework:** [jest/vitest/etc.]

**Incluir:**
1. Happy path
2. Edge cases
3. Error handling
4. Casos l�mite

**Estilo:** [describe/it, etc.]
`

---

## FASE 6: TESTING Y QA
### Para verificar calidad

**Prompt 6.1 � Revisar c�digo:**
`
Revisa este c�digo para mejorar calidad:

[PEGA C�DIGO]

**Verifica:**
1. Errores l�gicos
2. Performance
3. Seguridad
4. Legibilidad
5. Patrones
6. Testing

Dame lista de issues priorizados.
`

**Prompt 6.2 � Crear suite de tests:**
`
Crea suite de tests para [M�DULO/FEATURE].

**Componentes a testear:**
- [COMPONENTE_1]
- [COMPONENTE_2]

**Tipos de tests:**
- Unit tests
- Integration tests
- [otros]

**Cobertura objetivo:** [80%, 90%, etc.]

**Herramientas:** [testing framework]
`

---

## FASE 7: DOCUMENTACI�N
### Para documentar el proyecto

**Prompt 7.1 � Crear README:**
`
Crea README.md para este proyecto.

**Incluir:**
1. Descripci�n del proyecto
2. Stack tecnol�gico
3. Requisitos previos
4. Instalaci�n
5. Uso
6. Estructura del proyecto
7. Contribuir
8. Licencia

**Tono:** [profesional, casual, t�cnico]
**Idioma:** [espa�ol, ingl�s]
`

**Prompt 7.2 � Documentar API:**
`
Documenta la API de este proyecto.

**Formato:** [OpenAPI/Simple markdown]

**Incluir:**
1. Endpoints
2. M�todos
3. Par�metros
4. Request/Response
5. Errores
6. Ejemplos
`

**Prompt 7.3 � Crear gu�a de desarrollo:**
`
Crea gu�a de desarrollo para contribuidores.

**Incluir:**
1. Requisitos
2. Instalaci�n
3. Estructura
4. Convenciones
5. Proceso de desarrollo
6. Testing
7. Deployment
`

---

## FASE 8: DEPLOYMENT
### Para poner en producci�n

**Prompt 8.1 � Configurar CI/CD:**
`
Configura pipeline de CI/CD para [PROYECTO].

**Plataforma:** [GitHub Actions/GitLab CI/etc.]

**Stages:**
1. Build
2. Test
3. Lint
4. Deploy

**Ambientes:**
- [dev]
- [staging]
- [production]

**Servicio de deploy:** [Vercel/Netlify/AWS/etc.]
`

**Prompt 8.2 � Configurar monitoreo:**
`
Configura monitoreo para [PROYECTO].

**Qu� monitorear:**
- [M�TRICA_1]
- [M�TRICA_2]
- [M�TRICA_3]

**Herramientas:** [GRATUITAS]

**Alertas:**
- [CONDICI�N_1]
- [CONDICI�N_2]
`

---

## FASE 9: MANTENIMIENTO
### Para mantener el proyecto

**Prompt 9.1 � Revisar dependencias:**
`
Revisa las dependencias del proyecto.

**Quiero saber:**
1. Cu�les est�n desactualizadas
2. Cu�les tienen vulnerabilidades
3. Cu�les se pueden eliminar
4. Cu�les reemplazar

**Prioridad:** seguridad > estabilidad > features
`

**Prompt 9.2 � Optimizar performance:**
`
Optimiza el performance de [ARCHIVO/COMPONENTE].

**M�tricas actuales:**
- [M�TRICA_1]: [VALOR]
- [M�TRICA_2]: [VALOR]

**Objetivos:**
- [OBJETIVO_1]
- [OBJETIVO_2]

**Restricciones:**
- No romper funcionalidad
- Mantener legibilidad
`

---

## PLANTILLAS R�PIDAS

### Para empezar proyecto nuevo (copia y pega):
`
Proyecto: [NOMBRE]
Meta: [QU� HACE]
Stack: [TECNOLOG�AS]
Restricciones: [LIMITACIONES]
Archivos: [EXISTENTES]
`

### Para bug report:
`
Bug: [DESCRIPCI�N]
Esperado: [QU� DEBER�A PASAR]
Actual: [QU� PASA]
Pasos: [C�MO REPRODUCIR]
`

### Para nueva feature:
`
Feature: [NOMBRE]
Por qu�: [NECESIDAD]
C�mo: [IMPLEMENTACI�N]
Tests: [QU� TESTEAR]
`

---

## COMANDOS �TILES DEL AGENTE

| Comando | Uso |
|---------|-----|
| "Analiza esto" | Entender c�digo existente |
| "Dise�a la arquitectura" | Planificar estructura |
| "Compara X vs Y" | Tomar decisiones |
| "Crea backlog" | Organizar trabajo |
| "Implementa X" | Crear c�digo |
| "Refactoriza X" | Mejorar c�digo |
| "Escribe tests" | Testing |
| "Revisa calidad" | Code review |
| "Documenta X" | Crear docs |
| "Explica X" | Aprender |

---

## EJEMPLO DE USO COMPLETO

### Proyecto: "Mi Tienda Online"

1. **Fase 0:** Usar Prompt 0.1 para definir proyecto
2. **Fase 1:** Usar Prompt 1.1 para analizar si hay c�digo existente
3. **Fase 2:** Usar Prompt 2.1 para elegir entre React/Vue/Angular
4. **Fase 3:** Usar Prompt 3.1 para dise�ar base de datos
5. **Fase 4:** Usar Prompt 4.1 para crear backlog
6. **Fase 5:** Usar Prompt 5.1 para implementar cada feature
7. **Fase 6:** Usar Prompt 6.1 para revisar c�digo
8. **Fase 7:** Usar Prompt 7.1 para crear README
9. **Fase 8:** Usar Prompt 8.1 para configurar deploy
10. **Fase 9:** Usar Prompt 9.1 para mantener

---

*�ltima actualizaci�n: 2026*
