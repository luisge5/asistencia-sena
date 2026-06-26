import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LogoutPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleLogout = async () => {
      await signOut()
      navigate('/login', { replace: true })
    }

    handleLogout()
  }, [signOut, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
    </div>
  )
}
