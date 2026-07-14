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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <span className="ml-2 text-sm text-slate-500">Cargando estadísticas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Estadísticas
        </h1>
        <p className="mt-1 text-slate-500">
          Análisis de asistencia de tu ficha
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Presentes', value: estadisticas.presentes, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'Tardes', value: estadisticas.tardes, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Justificados', value: estadisticas.justificados, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
          { label: 'Asistencia', value: `${estadisticas.porcentajeAsistencia}%`, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-lg border ${stat.border} ${stat.bg} p-4 text-center shadow-sm`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className={`mt-1 text-xs font-medium ${stat.color}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Trend Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900">
          Tendencia Semanal
        </h4>
        {tendenciaSemanal.length > 0 ? (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendenciaSemanal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semana" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Asistencia']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#0f172a' }}
                />
                <Area
                  type="monotone"
                  dataKey="porcentaje"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-slate-500">
            No hay datos suficientes para mostrar la tendencia
          </p>
        )}
      </div>

      {/* Top Performers */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900">
          Mejores Asistentes
        </h4>
        {topPerformers.length > 0 ? (
          <div className="mt-4 space-y-2">
            {topPerformers.map((aprendiz, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-slate-200 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {aprendiz.nombre} {aprendiz.apellido}
                    </p>
                    <p className="text-xs text-slate-500">
                      Doc: {aprendiz.documento}
                    </p>
                  </div>
                </div>
                <span className="rounded bg-green-100 px-2 py-0.5 text-sm font-semibold text-green-700">
                  {aprendiz.porcentaje}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-slate-500">
            No hay datos de asistencia disponibles
          </p>
        )}
      </div>

      {/* Students at Risk */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900">
          Aprendices en Riesgo
        </h4>
        {aprendicesEnRiesgo.length > 0 ? (
          <div className="mt-4 space-y-2">
            {aprendicesEnRiesgo.map((aprendiz, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {aprendiz.nombre} {aprendiz.apellido}
                    </p>
                    <p className="text-xs text-slate-500">
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
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm font-medium text-green-700">
                No hay aprendices en riesgo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}