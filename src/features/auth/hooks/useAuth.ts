import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '../services/authService'
import { insforge } from '@/lib/insforge'

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, logout, setLoading, setError, clearError } =
    useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      if (user?.id?.startsWith('demo-')) {
        setLoading(false)
        return
      }

      setLoading(true)
      const result = await authService.getCurrentUser()

      if (result.ok && result.data) {
        const { data: roleData } = await insforge.database
          .from('user_roles')
          .select('rol, ficha_asignada, centro')
          .eq('user_id', result.data.id)
          .single()

        login({
          id: result.data.id,
          email: result.data.email,
          nombre: result.data.profile?.name ?? '',
          apellido: '',
          rol: roleData?.rol ?? 'instructor',
          ficha_asignada: roleData?.ficha_asignada,
          centro: roleData?.centro,
          created_at: result.data.createdAt,
          updated_at: result.data.updatedAt,
        })
      } else {
        logout()
      }

      setLoading(false)
    }

    initAuth()
  }, [login, logout, setLoading, user?.id])

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)

    const result = await authService.signInWithGoogle()

    if (!result.ok) {
      setError(result.error?.message ?? 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  const signOut = async () => {
    const result = await authService.signOut()

    if (result.ok) {
      logout()
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signInWithGoogle,
    signOut,
    clearError,
  }
}
