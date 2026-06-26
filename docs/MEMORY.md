# Memoria del Proyecto — Asistencia SENA
## Archivo de Memoria Persistente

---

## INSTRUCCIONES PARA NUEVAS SESIONES

1. **Lee este archivo primero** — Contiene el estado actual del proyecto
2. **Lee `CONTEXTO-PROYECTO.md`** — Información completa del proyecto
3. **Lee `METODOLOGIA-AGENTE.md`** — Prompts pre-preparados
4. **Continúa desde donde se quedó** — El estado está documentado aquí

---

## ÚLTIMA ACTUALIZACIÓN

| Campo                       | Valor                          |
| --------------------------- | ------------------------------ |
| **Fecha**                   | 2026-06-23                     |
| **Sprint actual**           | S-05 (Lighthouse CI + Accesibilidad + Deploy) |
| **Estado**                  | 🟢 En progreso                 |
| **Última tarea completada** | —                               |
| **Próximo sprint**          | S-06 (Realtime + Push)         |

---

## PROGRESO GENERAL

### Fases Completadas
- Fase 0: Contexto inicial
- Fase 1: Análisis del proyecto
- Fase 2: Arquitectura y stack
- Fase 3: Diseño detallado
- Fase 4: Backlog y planificación
- Fase 5: Ejecución (Sprint S-01)
- Fase 6: Ejecución (Sprint S-02)
- Fase 7: Ejecución (Sprint S-03)
- Fase 8: Ejecución (Sprint S-04) ✅ Completo

### Archivos Creados
- [x] `METODOLOGIA-AGENTE.md` — Metodología con prompts
- [x] `CONTEXTO-PROYECTO.md` — Contexto rápido del proyecto
- [x] `MEMORY.md` — Este archivo
- [ ] `BACKLOG.md` — Pendiente de crear
- [ ] `CURSO-APRENDIZAJE.md` — Pendiente de crear

### Archivos del Proyecto (Sprint S-01)
- `package.json` — Configuración del proyecto
- `vite.config.ts` — Configuración de Vite + Tailwind + PWA
- `tsconfig.app.json` — Configuración de TypeScript
- `src/index.css` — Estilos con Tailwind CSS
- `src/main.tsx` — Entry point con Router + QueryClient
- `src/lib/insforge.ts` — Cliente InsForge
- `src/lib/query.ts` — Configuración TanStack Query
- `src/types/index.ts` — Tipos TypeScript globales
- `src/stores/authStore.ts` — Zustand auth store
- `src/shared/components/` — Componentes UI
- `src/routes/index.tsx` — Configuración de rutas
- `.github/workflows/ci.yml` — GitHub Actions CI
- `vercel.json` — Configuración de Vercel
- `.env.local` — Variables de entorno

### Archivos del Proyecto (Sprint S-02)
- `src/features/auth/services/authService.ts` — Servicio de autenticación InsForge
- `src/features/auth/hooks/useAuth.ts` — Hook de autenticación
- `src/features/auth/pages/LoginPage.tsx` — Página de login
- `src/features/auth/pages/LogoutPage.tsx` — Página de logout
- `src/shared/components/ProtectedRoute.tsx` — Componente de protección de rutas
- `src/features/hoy/pages/DashboardPage.tsx` — Página principal (Vista "Hoy")
- `src/features/hoy/components/ContadorAsistencia.tsx` — Contadores de asistencia
- `src/features/hoy/components/AprendizCard.tsx` — Tarjeta de aprendiz
- `src/features/hoy/components/SkeletonCard.tsx` — Skeleton para loading
- `src/features/asistencias/services/asistenciaService.ts` — Servicio de asistencia CRUD
- `src/features/asistencias/hooks/useAsistencia.ts` — Hooks de asistencia con TanStack Query
- `src/features/aprendices/services/aprendicesService.ts` — Servicio de aprendices CRUD
- `src/features/aprendices/hooks/useAprendices.ts` — Hooks de aprendices con TanStack Query
- `src/features/aprendices/pages/AprendicesPage.tsx` — Página de aprendices
- `src/shared/components/MarcaRapida.tsx` — Componente de marca rápida

### Archivos del Proyecto (Sprint S-03)
- `src/features/scan/services/qrScannerService.ts` — Servicio de escaneo QR
- `src/features/scan/components/QRScanner.tsx` — Componente de escáner QR
- `src/features/scan/pages/ScanPage.tsx` — Página de escaneo
- `src/features/scan/hooks/useQrLookup.ts` — Hook para buscar aprendiz por documento
- `src/features/scan/hooks/useMarkAttendance.ts` — Hook para marcar asistencia
- `src/features/aprendices/services/importService.ts` — Servicio de importación Excel
- `src/features/aprendices/hooks/useImportAprendices.ts` — Hook de importación
- `src/features/aprendices/pages/ImportPage.tsx` — Página de importación
- `src/features/historial/hooks/useHistorial.ts` — Hook de historial
- `src/features/historial/pages/HistorialPage.tsx` — Página de histórico
- `src/features/estadisticas/hooks/useEstadisticas.ts` — Hook de estadísticas
- `src/features/estadisticas/pages/EstadisticasPage.tsx` — Página de estadísticas
- `src/shared/hooks/useOffline.ts` — Hook de modo offline
- `src/shared/components/OfflineBanner.tsx` — Banner de offline

---

## DECISIONES CLAVE TOMADAS

| Decisión | Justificación |
|----------|---------------|
| **InsForge sobre Apps Script** | Real-time, auth, PostgreSQL, RBAC, sin cuotas |
| **Zustand sobre Context+useReducer** | ~1KB, selective re-render, persist middleware |
| **TanStack Query sobre manual fetch** | Caching, refetch, retry, optimistic updates |
| **Feature-based sobre layer-based** | Mejor organización, escalabilidad |
| **Result<T,E> sobre try/catch** | Consistente con backend, error handling explícito |

---

## TAREAS

> **Source of truth:** `docs/09-backlog.md`

### Sprint S-01
15 tareas completadas (ver backlog)

### Sprint S-02
8 tareas completadas (ver backlog)

### Sprint S-03
5 tareas completadas (ver backlog)

### Sprint S-04
4 tareas completadas (ver backlog)

### Sprints futuros
Ver backlog sección "Next" y "Later"

### UI/UX Design System (v2.5.0)
- Skill instalada en `.opencode/skills/ui-ux-pro-max/`
- Design system en `design-system/MASTER.md`
- Estilos Claymorphism en `design-system/assets/`

### InsForge Backend (v2.2.0)
- MCP configurado en `opencode.json`
- SDK en `src/lib/insforge.ts`
- Credenciales en `.env.local`
- Documentación en `AGENTS.md`

---

## NOTAS PARA FUTURAS SESIONES

### Al Iniciar Sesión
1. Lee `docs/09-backlog.md` para saber el estado actual
2. Pregunta: "¿Qué tarea quieres continuar?"
3. Si no hay preferencia, muestra opciones del sprint actual

### Durante la Sesión
- **ACTUALIZA EL BACKLOG AUTOMÁTICAMENTE** después de cada tarea (sin que te lo pidan)
- Actualiza este archivo al finalizar tareas
- Usa prompts de `METODOLOGIA-AGENTE.md`

### ⚠️ REGLA AUTOMÁTICA: ACTUALIZAR BACKLOG
**DESPUÉS DE CADA TAREA COMPLETADA, SIEMPRE:**
1. Abrir `docs/09-backlog.md`
2. Cambiar `Status:` de `todo` a `done`
3. Agregar `Completed:` con fecha
4. Marcar acceptance criteria completados
5. Actualizar `frontmatter totals.done`
6. Actualizar `last_updated`
7. **NO ESPERAR A QUE TE LO PIDAN - ES AUTOMÁTICO**

### Al Cerrar Sesión
- Actualiza este archivo con último estado
- Documenta pendientes
- Guarda aprendizajes relevantes

---

## ERRORES COMETIDOS (para evitar)

1. **No usar `<<` heredoc en PowerShell** — Usar `Set-Content` con `@"..."@`
2. **Verificar permisos antes de escribir** — Algunas rutas pueden estar restringidas
3. **No crear archivos sin confirmación** — Siempre preguntar primero
4. **npm install puede tardar** — Usar `--prefer-offline` o aumentar timeout
5. **No usar Move-Item con directorios existentes** — Usar Copy-Item -Recurse -Force

---

## APRENDIZAJES

### Del Usuario
- Prefiere prompts listos para copiar y pegar
- Quiere metodología reutilizable para otros proyectos
- Valora la documentación estructurada
- Trabaja de forma iterativa: planificar → ejecutar

### Del Proyecto
- SENA tiene restricciones específicas (Android, gama media)
- Google Sheets son fuente de verdad (SENA provee datos)
- InsForge permite RBAC via PostgreSQL RLS
- Realtime es crítico para actualizaciones en vivo

### Técnicos
- Tailwind CSS 4 se configura con `@tailwindcss/vite`
- vite-plugin-pwa maneja service workers automáticamente
- Zustand con `persist` middleware guarda en localStorage
- TanStack Query necesita `QueryClientProvider` en el árbol
- React Router v6 usa `createBrowserRouter` para rutas

---

## COMANDOS RÁPIDOS

### Para Empezar
```
Continúa con S-02-001: Implementar autenticación
```

### Para Ver Progreso
```
Muestra el estado del sprint actual
```

### Para Cambiar Tarea
```
Quiero trabajar en [TAREA ESPECÍFICA]
```

### Para Revisar
```
Revisa el código de [ARCHIVO]
```

### Para Ejecutar
```
npm run dev
```

---

*Última actualización: 2026-06-12 (Backlog actualizado v2, regla automática agregada)*
