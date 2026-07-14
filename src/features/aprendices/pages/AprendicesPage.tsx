import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuscarAprendices } from '../hooks/useAprendices'
import { useAuthStore } from '@/stores/authStore'

export function AprendicesPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')

  const ficha = user?.ficha_asignada ?? 0

  const { data: result, isLoading } = useBuscarAprendices({
    ficha,
    search: search || undefined,
    estado: filtroEstado || undefined,
  })

  const aprendices = result?.ok ? result.data : []

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="view-enter px-5 pt-5 pb-6 space-y-4">
      <div className="sticky top-0 -mx-5 px-5 pt-1 pb-3 bg-background z-10">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-fg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            inputMode="search"
            placeholder="Buscar por nombre o ficha"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl pl-11 pr-4 bg-surface border border-border text-sm placeholder:text-muted-fg/70 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40 transition"
          />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold tracking-tight">
          Padrón · {isLoading ? '...' : aprendices.length}
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 text-[11px]">
            {[
              { value: '', label: 'Todos' },
              { value: 'activo', label: 'Activos' },
              { value: 'inactivo', label: 'Inactivos' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFiltroEstado(filter.value)}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filtroEstado === filter.value
                    ? 'bg-primary text-on-primary'
                    : 'text-muted-fg hover:bg-muted'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/aprendices/carnets"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-soft transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 15h0" /><path d="M11 15h6" /><circle cx="8.5" cy="10.5" r="2" /><path d="M15 8h2" />
              </svg>
              <span>Carnets</span>
            </Link>
            <Link
              to="/aprendices/importar"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-soft transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Nuevo</span>
            </Link>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : aprendices.length === 0 ? (
        <div className="text-center text-muted-fg text-sm py-10">
          {search ? `Sin resultados para "${search}"` : 'No hay aprendices registrados'}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface border border-border divide-y divide-border overflow-hidden">
          {aprendices.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <div className="shrink-0 w-11 h-11 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-fg">
                {getInitials(a.nombre, a.apellido)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{a.nombre} {a.apellido}</div>
                <div className="text-[11px] text-muted-fg tabular-nums">{a.ficha} · {a.tipo_documento}: {a.documento}</div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                a.estado === 'activo'
                  ? 'text-state-presente bg-state-presente-bg'
                  : 'text-state-ausente bg-state-ausente-bg'
              }`}>
                {a.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
