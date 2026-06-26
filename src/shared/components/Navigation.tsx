import { Link, useLocation } from 'react-router-dom'

const navItems = [
  {
    path: '/', label: 'Hoy',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
  },
  {
    path: '/scan', label: 'Escanear',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7V5a2 2 0 012-2h2M3 17v2a2 2 0 002 2h2M17 3h2a2 2 0 012 2v2M17 21h2a2 2 0 002-2v-2" /><path d="M7 12h10" /></svg>,
  },
  {
    path: '/aprendices', label: 'Aprendices',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  },
  {
    path: '/historial', label: 'Historial',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  },
  {
    path: '/estadisticas', label: 'Estadísticas',
    icon: <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav aria-label="Navegación principal" className="border-b border-[var(--color-border)] bg-white shadow-[var(--shadow-clay-sm)]">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary)]'
                    : 'text-[var(--color-text-light)] hover:bg-gray-100 hover:text-[var(--color-primary)]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
