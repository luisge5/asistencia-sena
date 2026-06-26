// Global TypeScript types for Asistencia SENA

// User roles
export type UserRole = 'admin' | 'coordinator' | 'instructor'

// User with role
export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  rol: UserRole
  ficha_asignada?: number
  centro?: string
  created_at: string
  updated_at: string
}

// Aprendice (student)
export interface Aprendice {
  id: string
  nombre: string
  apellido: string
  documento: string
  tipo_documento: string
  ficha: number
  centro: string
  estado: string
  created_at: string
  updated_at: string
}

// Asistencia (attendance)
export interface Asistencia {
  id: string
  aprendiz_id: string
  fecha: string
  hora_entrada: string
  hora_salida: string | null
  estado: string
  instructor_id: string
  ficha: number
  centro: string
  created_at: string
  updated_at: string
}

// Ficha (training group)
export interface Ficha {
  id: string
  numero: number
  nombre: string
  programa: string
  centro: string
  instructor_id: string
  estado: string
  created_at: string
  updated_at: string
}

// Centro (training center)
export interface Centro {
  id: string
  nombre: string
  codigo: string
  direccion: string
  telefono: string
  email: string
  estado: string
  created_at: string
  updated_at: string
}

// API Response types
export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E }

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Date formats
export const DATE_FORMATS = {
  display: 'dd/MM/yyyy',
  input: 'yyyy-MM-dd',
  api: "yyyy-MM-dd'T'HH:mm:ss'Z'",
} as const

// Locale
export const LOCALE = 'es-CO' as const
export const TIMEZONE = 'America/Bogota' as const

// App constants
export const APP_NAME = 'Asistencia SENA' as const
export const APP_VERSION = '0.1.0' as const

// Validation patterns
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  documento: /^\d{6,12}$/,
  phone: /^\d{10}$/,
} as const

// Error messages
export const ERRORS = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Correo electrónico inválido',
  INVALID_DOCUMENTO: 'Documento inválido (6-12 dígitos)',
  INVALID_PHONE: 'Teléfono inválido (10 dígitos)',
  NETWORK_ERROR: 'Error de conexión',
  UNAUTHORIZED: 'No autorizado',
  NOT_FOUND: 'No encontrado',
  SERVER_ERROR: 'Error del servidor',
} as const
