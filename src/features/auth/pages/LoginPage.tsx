import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { insforge } from '@/lib/insforge'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemoLogin = async (rol: 'instructor' | 'aprendiz') => {
    setDemoLoading(true)
    
    try {
      await insforge.auth.signOut()
    } catch {
      // Ignore sign out errors
    }
    
    localStorage.clear()

    const demoUser = rol === 'instructor' ? {
      id: 'demo-instructor-001',
      email: 'instructor.demo@sena.edu.co',
      nombre: 'Carlos',
      apellido: 'Rodriguez',
      rol: 'instructor' as const,
      ficha_asignada: 2774266,
      centro: 'Centro de Tecnología - Bogotá',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } : {
      id: 'demo-aprendiz-001',
      email: 'aprendiz.demo@sena.edu.co',
      nombre: 'Maria',
      apellido: 'Lopez',
      rol: 'instructor' as const,
      ficha_asignada: 2774266,
      centro: 'Centro de Tecnología - Bogotá',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    login(demoUser)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-primary-soft p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white px-8 py-10 shadow-xl shadow-primary/20">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Asistencia SENA</h1>
            <p className="mt-1 text-sm text-slate-500">Gestión de asistencia para instructores</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleDemoLogin('instructor')}
              disabled={demoLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {demoLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
              Entrar como Instructor
            </button>

            <button
              onClick={() => handleDemoLogin('aprendiz')}
              disabled={demoLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-primary px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-50 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Entrar como Aprendiz
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Modo demo: acceso directo sin autenticación
          </p>
        </div>
      </div>
    </div>
  )
}
