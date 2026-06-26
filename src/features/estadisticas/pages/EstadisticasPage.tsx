import { useEstadisticas } from '../hooks/useEstadisticas'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function EstadisticasPage() {
  const {
    isLoading,
    error,
    estadisticas,
    tendenciaSemanal,
    aprendicesEnRiesgo,
    topPerformers,
  } = useEstadisticas()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        <span className="ml-3 text-[var(--color-text-light)]">Cargando estadísticas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border-3 border-red-200 bg-red-50 p-4"
        style={{ borderWidth: '3px' }}
      >
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          Estadísticas
        </h1>
        <p className="mt-1 text-[var(--color-text-light)]">
          Análisis de asistencia de tu ficha
        </p>
      </div>

      {/* Overview Cards */}
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

      {/* Weekly Trend Chart */}
      <div
        className="rounded-2xl border-4 border-gray-200 bg-white p-4"
        style={{
          boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h4 className="font-[var(--font-heading)] text-sm font-bold text-[var(--color-text)]">
          Tendencia Semanal
        </h4>
        {tendenciaSemanal.length > 0 ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendenciaSemanal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Asistencia']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '3px solid #e5e7eb',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="porcentaje"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-[var(--color-text-light)]">
            No hay datos suficientes para mostrar la tendencia
          </p>
        )}
      </div>

      {/* Top Performers */}
      <div
        className="rounded-2xl border-4 border-gray-200 bg-white p-4"
        style={{
          boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h4 className="font-[var(--font-heading)] text-sm font-bold text-[var(--color-text)]">
          🏆 Mejores Asistentes
        </h4>
        {topPerformers.length > 0 ? (
          <div className="mt-4 space-y-3">
            {topPerformers.map((aprendiz, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border-3 border-gray-200 bg-gray-50 px-4 py-3"
                style={{ borderWidth: '3px' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {aprendiz.nombre} {aprendiz.apellido}
                    </p>
                    <p className="text-xs text-[var(--color-text-light)]">
                      Doc: {aprendiz.documento}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  {aprendiz.porcentaje}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-[var(--color-text-light)]">
            No hay datos de asistencia disponibles
          </p>
        )}
      </div>

      {/* Students at Risk */}
      <div
        className="rounded-2xl border-4 border-gray-200 bg-white p-4"
        style={{
          boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h4 className="font-[var(--font-heading)] text-sm font-bold text-[var(--color-text)]">
          ⚠️ Aprendices en Riesgo
        </h4>
        {aprendicesEnRiesgo.length > 0 ? (
          <div className="mt-4 space-y-3">
            {aprendicesEnRiesgo.map((aprendiz, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border-3 border-red-200 bg-red-50 px-4 py-3"
                style={{ borderWidth: '3px' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {aprendiz.nombre} {aprendiz.apellido}
                    </p>
                    <p className="text-xs text-[var(--color-text-light)]">
                      Doc: {aprendiz.documento}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">
                    {aprendiz.faltas} faltas
                  </p>
                  <p className="text-xs text-red-500">
                    {aprendiz.inasistencias} inasistencias
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border-3 border-green-200 bg-green-50 p-4 text-center" style={{ borderWidth: '3px' }}>
            <p className="text-sm font-medium text-green-700">
              ✓ No hay aprendices en riesgo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}