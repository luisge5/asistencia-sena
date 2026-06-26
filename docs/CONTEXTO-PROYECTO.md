# Contexto del Proyecto — Asistencia SENA
## Archivo de Referencia Rápida para Nuevas Sesiones

---

## INSTRUCCIONES PARA NUEVAS SESIONES

1. Lee este archivo primero
2. Lee `METODOLOGIA-AGENTE.md` para prompts
3. Lee `docs/08-engineering-guide.md` para convenciones
4. Lee `docs/09-backlog.md` para tareas pendientes
5. Pregunta al usuario: "¿Qué sprint o tarea quieres continuar?"

---

## INFORMACIÓN DEL PROYECTO

| Campo | Valor |
|-------|-------|
| **Nombre** | Asistencia SENA |
| **Tipo** | PWA (Progressive Web App) |
| **Meta** | Reemplazar hojas de asistencia en papel para instructores SENA |
| **Usuario** | Instructor SENA (Android, gama media) |
| **Locale** | `America/Bogota` |
| **Idioma** | Español |
| **Formato fecha** | `dd/MM/yyyy` |

---

## STACK TECNOLÓGICO

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Frontend** | React + TypeScript | 19.x |
| **Build** | Vite | 6.x |
| **Estilos** | Tailwind CSS | 4.x |
| **Estado** | Zustand | 5.x |
| **Data fetching** | TanStack Query | 5.x |
| **Backend** | InsForge | - |
| **Base de datos** | PostgreSQL (InsForge) | - |
| **Auth** | InsForge Auth (Google OAuth) | - |
| **Realtime** | InsForge Realtime (WebSockets) | - |
| **PWA** | vite-plugin-pwa | - |
| **Testing** | Vitest + Playwright | - |
| **CI/CD** | GitHub Actions + Vercel | - |

---

## ARQUITECTURA

### Estructura de Carpetas
```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Autenticación
│   ├── hoy/           # Dashboard principal
│   ├── scan/          # Escaneo QR
│   ├── aprendices/    # Gestión de aprendices
│   ├── historial/     # Historial de asistencias
│   ├── estadisticas/ # Analytics y reportes
│   └── admin/         # Administración
├── shared/            # Componentes compartidos
│   ├── components/   # UI components
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utilidades
│   └── types/        # Tipos TypeScript
├── stores/            # Zustand stores
├── hooks/             # Global hooks
├── lib/               # Configuración
│   ├── insforge.ts   # Cliente InsForge
│   └── query.ts      # TanStack Query client
├── routes/            # React Router routes
└── main.tsx           # Entry point
```

### Patrones de Diseño
- **Feature-based**: Organización por funcionalidad
- **Absolute imports**: `@/` para rutas absolutas
- **Result<T,E>**: Manejo explícito de errores
- **Repository Pattern**: Acceso a datos abstraído
- **Custom Hooks**: Lógica reutilizable
- **Zustand slices**: Estado por feature

### RBAC (Role-Based Access Control)
```sql
-- Tabla de roles
user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  rol TEXT CHECK (rol IN ('admin', 'coordinator', 'instructor')),
  ficha_asignada INTEGER,  -- Solo para instructores
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Políticas RLS
-- admin: acceso total
-- coordinator: acceso a su centro
-- instructor: solo su ficha_asignada
```

---

## BACKEND: INSFORGE

### Configuración
```typescript
// src/lib/insforge.ts
import { InsForgeClient } from '@insforge/sdk'

export const insforge = new InsForgeClient({
  url: import.meta.env.VITE_INSFORGE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
})
```

### Tablas Principales
| Tabla | Descripción |
|-------|-------------|
| `aprendices` | Datos de aprendices |
| `asistencias` | Registros de asistencia |
| `fichas` | Fichas de formación |
| `user_roles` | Roles de usuario |
| `centros` | Centros de formación |

### Realtime
```typescript
// Suscribirse a cambios
insforge
  .channel('asistencias-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'asistencias'
  }, (payload) => {
    console.log('Cambio:', payload)
  })
  .subscribe()
```

---

## ESTADO ACTUAL

### Sprint Actual: S-01 (Setup + Core)
**Estado:** No iniciado

### Tareas del Sprint S-01
| ID | Tarea | Estado |
|----|-------|--------|
| S-01-001 | Scaffold proyecto (Vite + React + TS) | ⏳ Pendiente |
| S-01-002 | Configurar Tailwind CSS 4 | ⏳ Pendiente |
| S-01-003 | Configurar vite-plugin-pwa | ⏳ Pendiente |
| S-01-004 | Configurar InsForge SDK | ⏳ Pendiente |
| S-01-005 | Tipos TypeScript globales | ⏳ Pendiente |
| S-01-006 | Configurar absolute imports (`@/`) | ⏳ Pendiente |
| S-01-007 | Layout principal (Header + Nav + Main) | ⏳ Pendiente |
| S-01-008 | Router con rutas básicas | ⏳ Pendiente |
| S-01-009 | Zustand store (auth slice) | ⏳ Pendiente |
| S-01-010 | TanStack Query provider | ⏳ Pendiente |
| S-01-011 | GitHub Actions CI | ⏳ Pendiente |
| S-01-012 | Vercel deploy config | ⏳ Pendiente |

---

## CONVENCIONES

### Código
- **TypeScript estricto** — `strict: true`
- **Functional components** — Sin class components
- **Named exports** — Preferido sobre default exports
- **Absolute imports** — `@/components/...`
- **Sin comentarios** — Solo si se solicita
- **Clean code** — Funciones cortas, props simples

### Git
- **Commits atómicos** — Un cambio por commit
- **Conventional commits** — `feat:`, `fix:`, `refactor:`
- **Sin secrets** — Nunca comprometer credenciales

### Testing
- **Tests primero** — TDD cuando sea posible
- **Vitest** — Para unit tests
- **Playwright** — Para E2E tests
- **Cobertura** — Mínimo 80%

---

## ARCHIVOS IMPORTANTES

| Archivo | Propósito |
|---------|-----------|
| `METODOLOGIA-AGENTE.md` | Prompts pre-preparados |
| `CONTEXTO-PROYECTO.md` | Este archivo |
| `docs/08-engineering-guide.md` | Guía de ingeniería |
| `docs/09-backlog.md` | Backlog completo |
| `docs/07-technical/api-spec.md` | Especificación API |
| `docs/07-technical/data-model.md` | Modelo de datos |

---

## COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build

# Quality
npm run lint         # Verificar código
npm run typecheck    # Verificar tipos
npm run test         # Ejecutar tests
npm run test:e2e     # Ejecutar tests E2E

# Deployment
git push origin main # Deploy automático a Vercel
```

---

## VARIABLES DE ENTorno REQUERIDAS

```bash
# .env.local
VITE_INSFORGE_URL=https://api.insforge.dev
VITE_INSFORGE_ANON_KEY=tu-anon-key
VITE_INSFORGE_SERVICE_KEY=tu-service-key
```

---

## PRÓXIMOS PASOS

1. **Salir del modo plan** — Ya salimos
2. **Crear archivos基础** — package.json, vite.config.ts, tsconfig.json
3. **Instalar dependencias** — npm install
4. **Configurar Tailwind** — tailwind.config.js
5. **Crear estructura de carpetas** — src/features/...
6. **Implementar S-01-001** — Scaffold proyecto

---

## COMANDO RÁPIDO PARA EMPEZAR

Dime:
```
Continúa con S-01-001: Scaffold proyecto
```

Y empezaré a crear la estructura base del proyecto.

---

*Última actualización: 2026*
