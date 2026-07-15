import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const { isAuthenticated, isLoading, error, signInWithGoogle, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const [demoLoading, setDemoLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleDemoLogin = (rol: 'instructor' | 'aprendiz') => {
    setDemoLoading(true)
    
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

    setTimeout(() => {
      login(demoUser)
      navigate('/', { replace: true })
    }, 500)
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

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{error}</p>
              <button
                onClick={clearError}
                className="mt-1 text-xs font-medium text-red-600 underline"
              >
                Cerrar
              </button>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => handleDemoLogin('instructor')}
              disabled={isLoading || demoLoading}
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
              disabled={isLoading || demoLoading}
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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400">o</span>
              </div>
            </div>

            <button
              onClick={signInWithGoogle}
              disabled={isLoading || demoLoading}
              aria-label="Iniciar sesión con Google"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Iniciar sesión con Google
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
