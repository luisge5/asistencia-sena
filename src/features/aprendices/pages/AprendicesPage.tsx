import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuscarAprendices } from '../hooks/useAprendices'
import { useAuthStore } from '@/stores/authStore'
import { SkeletonList } from '@/features/hoy/components/SkeletonCard'

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
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            Aprendices
          </h1>
          <p className="mt-1 text-[var(--color-text-light)]">
            Ficha: {ficha}
          </p>
        </div>
        <Link
          to="/aprendices/importar"
          className="cursor-pointer rounded-xl border-3 border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 font-[var(--font-heading)] text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-95"
          style={{ borderWidth: '3px' }}
        >
          + Importar
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border-4 border-gray-200 bg-white px-4 py-3 pl-12 font-[var(--font-body)] text-[var(--color-text)] shadow-md transition-all duration-200 focus:border-[var(--color-primary)] focus:outline-none focus:shadow-lg"
            style={{ borderWidth: '4px' }}
          />
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroEstado('')}
            className={`rounded-xl border-3 px-4 py-2 text-sm font-bold transition-all duration-200 ${
              filtroEstado === ''
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md'
                : 'cursor-pointer border-gray-200 bg-white text-[var(--color-text-light)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
            }`}
            style={{ borderWidth: '3px' }}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroEstado('activo')}
            className={`rounded-xl border-3 px-4 py-2 text-sm font-bold transition-all duration-200 ${
              filtroEstado === 'activo'
                ? 'border-green-500 bg-green-500 text-white shadow-md'
                : 'cursor-pointer border-gray-200 bg-white text-[var(--color-text-light)] hover:border-green-300 hover:text-green-600'
            }`}
            style={{ borderWidth: '3px' }}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltroEstado('inactivo')}
            className={`rounded-xl border-3 px-4 py-2 text-sm font-bold transition-all duration-200 ${
              filtroEstado === 'inactivo'
                ? 'border-red-500 bg-red-500 text-white shadow-md'
                : 'cursor-pointer border-gray-200 bg-white text-[var(--color-text-light)] hover:border-red-300 hover:text-red-600'
            }`}
            style={{ borderWidth: '3px' }}
          >
            Inactivos
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <SkeletonList />
        ) : !aprendices || aprendices.length === 0 ? (
          <div
            className="rounded-2xl border-4 border-gray-200 bg-white p-8 text-center"
            style={{
              boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="mt-4 font-[var(--font-heading)] text-lg font-semibold text-[var(--color-text)]">
              No se encontraron aprendices
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-light)]">
              {search ? 'Intenta con otro término de búsqueda' : 'No hay aprendices registrados en esta ficha'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-text-light)]">
              {aprendices.length} aprendiz{aprendices.length !== 1 ? 'es' : ''} encontrado{aprendices.length !== 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {aprendices.map((aprendiz) => (
                <div
                  key={aprendiz.id}
                  className="group overflow-hidden rounded-2xl border-4 border-gray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-3 border-[var(--color-primary-light)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] font-[var(--font-heading)] text-lg font-bold text-white shadow-md">
                      {getInitials(aprendiz.nombre, aprendiz.apellido)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-[var(--font-heading)] text-base font-semibold text-[var(--color-text)]">
                        {aprendiz.nombre} {aprendiz.apellido}
                      </h3>
                      <p className="text-sm text-[var(--color-text-light)]">
                        {aprendiz.tipo_documento}: {aprendiz.documento}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            aprendiz.estado === 'activo'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {aprendiz.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
