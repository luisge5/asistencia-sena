import type { Aprendice } from '@/types'

type EstadoAsistencia = 'P' | 'T' | 'J' | 'F' | null

interface AprendizCardProps {
  aprendiz: Aprendice
  estadoActual: EstadoAsistencia
  onMarcar: (aprendizId: string, estado: EstadoAsistencia) => void
  isMarking?: boolean
}

const estadoConfig = {
  P: {
    label: 'Presente',
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-400',
  },
  T: {
    label: 'Tarde',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
  },
  J: {
    label: 'Justificado',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-400',
  },
  F: {
    label: 'Falta',
    color: 'bg-red-500',
    lightColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-400',
  },
}

export function AprendizCard({
  aprendiz,
  estadoActual,
  onMarcar,
  isMarking = false,
}: AprendizCardProps) {
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  const estado = estadoActual ? estadoConfig[estadoActual] : null

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-4 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        estado ? estado.borderColor : 'border-gray-200'
      } ${isMarking ? 'pointer-events-none opacity-70' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Status Badge */}
      {estado && (
        <div className={`absolute -right-1 -top-1 rounded-bl-xl rounded-tr-xl px-3 py-1 ${estado.color} text-xs font-bold text-white shadow-md`}>
          {estado.label}
        </div>
      )}

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
          {estado && (
            <p className={`mt-1 text-xs font-medium ${estado.textColor}`}>
              Estado: {estado.label}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Marcar asistencia">
        <button
          onClick={() => onMarcar(aprendiz.id, 'P')}
          disabled={isMarking || estadoActual === 'P'}
          aria-label={`Marcar a ${aprendiz.nombre} ${aprendiz.apellido} como Presente`}
          aria-pressed={estadoActual === 'P'}
          className={`rounded-xl border-3 py-2 text-sm font-bold transition-all duration-200 ${
            estadoActual === 'P'
              ? 'border-green-400 bg-green-500 text-white shadow-md'
              : 'cursor-pointer border-green-300 bg-white text-green-600 hover:bg-green-50 hover:shadow-md active:scale-95'
          }`}
          style={{ borderWidth: '3px' }}
        >
          P
        </button>
        <button
          onClick={() => onMarcar(aprendiz.id, 'T')}
          disabled={isMarking || estadoActual === 'T'}
          aria-label={`Marcar a ${aprendiz.nombre} ${aprendiz.apellido} como Tarde`}
          aria-pressed={estadoActual === 'T'}
          className={`rounded-xl border-3 py-2 text-sm font-bold transition-all duration-200 ${
            estadoActual === 'T'
              ? 'border-amber-400 bg-amber-500 text-white shadow-md'
              : 'cursor-pointer border-amber-300 bg-white text-amber-600 hover:bg-amber-50 hover:shadow-md active:scale-95'
          }`}
          style={{ borderWidth: '3px' }}
        >
          T
        </button>
        <button
          onClick={() => onMarcar(aprendiz.id, 'J')}
          disabled={isMarking || estadoActual === 'J'}
          aria-label={`Marcar a ${aprendiz.nombre} ${aprendiz.apellido} como Justificado`}
          aria-pressed={estadoActual === 'J'}
          className={`rounded-xl border-3 py-2 text-sm font-bold transition-all duration-200 ${
            estadoActual === 'J'
              ? 'border-orange-400 bg-orange-500 text-white shadow-md'
              : 'cursor-pointer border-orange-300 bg-white text-orange-600 hover:bg-orange-50 hover:shadow-md active:scale-95'
          }`}
          style={{ borderWidth: '3px' }}
        >
          J
        </button>
      </div>
    </div>
  )
}
