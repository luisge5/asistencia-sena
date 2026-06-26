-- ============================================
-- Asistencia SENA - Database Schema
-- InsForge PostgreSQL (Simplified)
-- ============================================

-- Eliminar tablas si existen (en orden inverso por dependencias)
DROP TRIGGER IF EXISTS update_asistencias_updated_at ON asistencias;
DROP TRIGGER IF EXISTS update_aprendices_updated_at ON aprendices;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_fichas_updated_at ON fichas;
DROP TRIGGER IF EXISTS update_centros_updated_at ON centros;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS asistencias;
DROP TABLE IF EXISTS aprendices;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS fichas;
DROP TABLE IF EXISTS centros;

-- ============================================
-- 1. TABLA: centros (Training Centers)
-- ============================================
CREATE TABLE centros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  direccion TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TABLA: fichas (Training Groups)
-- ============================================
CREATE TABLE fichas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  programa TEXT NOT NULL,
  centro TEXT NOT NULL,
  instructor_id UUID,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada', 'suspendida')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABLA: user_roles (User Roles + RBAC)
-- ============================================
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'coordinator', 'instructor')),
  ficha_asignada INTEGER,
  centro TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 4. TABLA: aprendices (Students)
-- ============================================
CREATE TABLE aprendices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  documento TEXT NOT NULL,
  tipo_documento TEXT NOT NULL DEFAULT 'cc' CHECK (tipo_documento IN ('cc', 'ti', 'ce', 'pasaporte')),
  ficha INTEGER NOT NULL,
  centro TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'retirado', 'graduado', 'suspendido')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABLA: asistencias (Attendance Records)
-- ============================================
CREATE TABLE asistencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aprendiz_id UUID NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TIME,
  hora_salida TIME,
  estado TEXT NOT NULL CHECK (estado IN ('P', 'T', 'J', 'F')),
  instructor_id UUID NOT NULL,
  ficha INTEGER NOT NULL,
  centro TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_fichas_instructor ON fichas(instructor_id);
CREATE INDEX idx_fichas_centro ON fichas(centro);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_rol ON user_roles(rol);
CREATE INDEX idx_aprendices_ficha ON aprendices(ficha);
CREATE INDEX idx_aprendices_documento ON aprendices(documento);
CREATE INDEX idx_aprendices_centro ON aprendices(centro);
CREATE INDEX idx_asistencias_aprendiz ON asistencias(aprendiz_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX idx_asistencias_instructor ON asistencias(instructor_id);
CREATE INDEX idx_asistencias_ficha ON asistencias(ficha);
CREATE INDEX idx_asistencias_estado ON asistencias(estado);
CREATE INDEX idx_asistencias_fecha_ficha ON asistencias(fecha, ficha);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_centros_updated_at BEFORE UPDATE ON centros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fichas_updated_at BEFORE UPDATE ON fichas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aprendices_updated_at BEFORE UPDATE ON aprendices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asistencias_updated_at BEFORE UPDATE ON asistencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES (Simplified - without auth.uid)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE centros ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE aprendices ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: Permisos generales (temporal)
-- ============================================

-- Permitir todo a authenticated users (ajustar después)
CREATE POLICY "allow_all_centros" ON centros FOR ALL USING (true);
CREATE POLICY "allow_all_fichas" ON fichas FOR ALL USING (true);
CREATE POLICY "allow_all_user_roles" ON user_roles FOR ALL USING (true);
CREATE POLICY "allow_all_aprendices" ON aprendices FOR ALL USING (true);
CREATE POLICY "allow_all_asistencias" ON asistencias FOR ALL USING (true);

-- ============================================
-- GRANTS (InsForge maneja permisos vía API)
-- ============================================
-- Los grants se manejan internamente por InsForge
-- No es necesario crear roles manualmente
