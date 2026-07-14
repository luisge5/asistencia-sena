import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  {
    path: '/', label: 'Hoy',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  },
  {
    path: '/scan', label: 'Escanear',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z" /><path d="M20 14v3" /><path d="M17 20h4" /><path d="M14 20v1" /></svg>,
  },
  {
    path: '/aprendices', label: 'Aprendices',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    path: '/historial', label: 'Histórico',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>,
  },
]

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="absolute bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-xl border-t border-border" aria-label="Navegación principal">
      <div className="flex items-stretch justify-around px-2 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              data-active={active}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl cursor-pointer"
            >
              <span className={`nav-icon transition-colors ${active ? 'text-primary' : 'text-muted-fg'}`}>
                {item.icon}
              </span>
              <span className={`nav-label text-[11px] font-medium transition-colors ${active ? 'text-primary font-semibold' : 'text-muted-fg'}`}>
                {item.label}
              </span>
              <span className={`nav-dot h-1 w-1 rounded-full bg-primary transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
