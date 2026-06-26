import { useHistorial } from '../hooks/useHistorial'

export function HistorialPage() {
  const {
    asistencias,
    isLoading,
    error,
    filters,
    setFilters,
    estadisticas,
    exportToCSV,
  } = useHistorial()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      P: 'bg-green-100 text-green-700',
      T: 'bg-yellow-100 text-yellow-700',
      J: 'bg-orange-100 text-orange-700',
      F: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      P: 'Presente',
      T: 'Tarde',
      J: 'Justificado',
      F: 'Faltante',
    }
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${styles[estado] || 'bg-gray-100 text-gray-700'}`}>
        {labels[estado] || estado}
      </span>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            Histórico de Asistencia
          </h1>
          <p className="mt-1 text-[var(--color-text-light)]">
            Revisa el historial de asistencias de tu ficha
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={asistencias.length === 0}
          className="cursor-pointer rounded-xl border-3 border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 font-[var(--font-heading)] text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderWidth: '3px' }}
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* Date Filters */}
      <div
        className="rounded-2xl border-4 border-gray-200 bg-white p-4"
        style={{
          boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h4 className="font-[var(--font-heading)] text-sm font-bold text-[var(--color-text)]">
          Filtrar por fecha
        </h4>
        <div className="mt-3 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-[var(--color-text-light)]">Desde</label>
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
              className="mt-1 w-full rounded-xl border-3 border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              style={{ borderWidth: '3px' }}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-[var(--color-text-light)]">Hasta</label>
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
              className="mt-1 w-full rounded-xl border-3 border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              style={{ borderWidth: '3px' }}
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          className="rounded-2xl border-4 border-green-200 bg-green-50 p-4 text-center"
          style={{
            boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.05), 4px 4px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <p className="font-[var(--font-heading)] text-3xl font-bold text-green-600">
            {estadisticas.presentes}
          </p>
          <p className="mt-1 text-xs font-medium text-green-700">Presentes</p>
        </div>
        <div
          className="rounded-2xl border-4 border-yellow-200 bg-yellow-50 p-4 text-center"
          style={{
            boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.05), 4px 4px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <p className="font-[var(--font-heading)] text-3xl font-bold text-yellow-600">
            {estadisticas.tardes}
          </p>
          <p className="mt-1 text-xs font-medium text-yellow-700">Tardes</p>
        </div>
        <div
          className="rounded-2xl border-4 border-orange-200 bg-orange-50 p-4 text-center"
          style={{
            boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.05), 4px 4px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <p className="font-[var(--font-heading)] text-3xl font-bold text-orange-600">
            {estadisticas.justificados}
          </p>
          <p className="mt-1 text-xs font-medium text-orange-700">Justificados</p>
        </div>
        <div
          className="rounded-2xl border-4 border-blue-200 bg-blue-50 p-4 text-center"
          style={{
            boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.05), 4px 4px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <p className="font-[var(--font-heading)] text-3xl font-bold text-blue-600">
            {estadisticas.porcentajeAsistencia}%
          </p>
          <p className="mt-1 text-xs font-medium text-blue-700">Asistencia</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <span className="ml-3 text-[var(--color-text-light)]">Cargando historial...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-2xl border-3 border-red-200 bg-red-50 p-4"
          style={{ borderWidth: '3px' }}
        >
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* History List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {asistencias.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-4 font-[var(--font-heading)] text-lg font-semibold text-[var(--color-text)]">
                No hay registros
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-light)]">
                No se encontraron asistencias en el rango seleccionado
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--color-text-light)]">
                {asistencias.length} registro{asistencias.length !== 1 ? 's' : ''}
              </p>

              <div className="overflow-hidden rounded-2xl border-4 border-gray-200 bg-white" style={{
                boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
              }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 font-semibold text-[var(--color-text)]">Fecha</th>
                        <th className="px-4 py-3 font-semibold text-[var(--color-text)]">Hora Entrada</th>
                        <th className="px-4 py-3 font-semibold text-[var(--color-text)]">Hora Salida</th>
                        <th className="px-4 py-3 font-semibold text-[var(--color-text)]">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asistencias.map((asistencia) => (
                        <tr key={asistencia.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 text-[var(--color-text)]">
                            {formatDate(asistencia.fecha)}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text)]">
                            {asistencia.hora_entrada || '-'}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text)]">
                            {asistencia.hora_salida || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {getEstadoBadge(asistencia.estado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}