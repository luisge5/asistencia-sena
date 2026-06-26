import { useAuthStore } from '@/stores/authStore'

export function Header() {
  const { user } = useAuthStore()

  const initials = user
    ? `${(user.nombre || '')[0]}${(user.apellido || '')[0]}`.toUpperCase()
    : '?'

  return (
    <header
      className="border-b-3 border-[var(--color-primary-dark)] text-white"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
      }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md" aria-hidden="true">
              <span className="font-[var(--font-heading)] text-xl font-bold text-[var(--color-primary)]">S</span>
            </div>
            <div>
              <h1 className="font-[var(--font-heading)] text-lg font-bold">Asistencia SENA</h1>
              <p className="text-sm text-white/80">Sistema de Asistencia</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.nombre ?? 'Instructor'}</p>
              <p className="text-xs text-white/80">Ficha: {user?.ficha_asignada ?? '—'}</p>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 font-[var(--font-heading)] text-sm font-bold shadow-md"
              aria-label={user ? `${user.nombre} ${user.apellido}` : 'Instructor'}
              role="img"
            >
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
