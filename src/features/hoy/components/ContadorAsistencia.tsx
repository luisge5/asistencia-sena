interface ContadorAsistenciaProps {
  presentes: number
  tarde: number
  justificados: number
  faltantes: number
  isLoading?: boolean
}

export function ContadorAsistencia({
  presentes,
  tarde,
  justificados,
  faltantes,
  isLoading = false,
}: ContadorAsistenciaProps) {
  const total = presentes + tarde + justificados + faltantes

  const counters = [
    {
      label: 'Presentes',
      value: presentes,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
    },
    {
      label: 'Tarde',
      value: tarde,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
    },
    {
      label: 'Justificados',
      value: justificados,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300',
    },
    {
      label: 'Faltantes',
      value: faltantes,
      color: 'bg-red-500',
      lightColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border-4 border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--color-text)]">
          Resumen de Hoy
        </h2>
        <span className="rounded-full border-2 border-[var(--color-primary-light)] bg-[var(--color-primary)] px-3 py-1 text-sm font-bold text-white">
          {total} total
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counters.map((counter) => (
          <div
            key={counter.label}
            className={`group relative overflow-hidden rounded-2xl border-4 ${counter.borderColor} p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
              boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className={`absolute -right-2 -top-2 h-8 w-8 rounded-full ${counter.color} opacity-20 transition-transform duration-300 group-hover:scale-150`} />
            <p className={`font-[var(--font-heading)] text-3xl font-bold ${counter.textColor}`}>
              {counter.value}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-text-light)]">
              {counter.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
