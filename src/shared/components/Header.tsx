import { useNavigate } from 'react-router-dom'

export function Header() {
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-[-0.04em]">Asistencia</div>
            <div className="text-[11px] text-muted-fg">{today}</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/logout')}
          className="w-10 h-10 rounded-xl hover:bg-muted active:bg-muted transition-colors flex items-center justify-center text-muted-fg cursor-pointer"
          aria-label="Cerrar sesión"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  )
}
