import { useState } from 'react'

type EstadoAsistencia = 'P' | 'T' | 'J'

interface MarcaRapidaProps {
  aprendizId: string
  nombreAprendiz: string
  estadoActual: EstadoAsistencia | null
  onMarcar: (aprendizId: string, estado: EstadoAsistencia) => void
  isMarking?: boolean
}

const estadoConfig = {
  P: {
    label: 'Presente',
    shortLabel: 'P',
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-400',
    hoverColor: 'hover:bg-green-50',
    gradient: 'from-green-500 to-green-600',
  },
  T: {
    label: 'Tarde',
    shortLabel: 'T',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
    hoverColor: 'hover:bg-amber-50',
    gradient: 'from-amber-500 to-amber-600',
  },
  J: {
    label: 'Justificado',
    shortLabel: 'J',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-400',
    hoverColor: 'hover:bg-orange-50',
    gradient: 'from-orange-500 to-orange-600',
  },
}

export function MarcaRapida({
  aprendizId,
  nombreAprendiz,
  estadoActual,
  onMarcar,
  isMarking = false,
}: MarcaRapidaProps) {
  const [showUndo, setShowUndo] = useState(false)
  const [lastEstado, setLastEstado] = useState<EstadoAsistencia | null>(null)

  const handleMarcar = (estado: EstadoAsistencia) => {
    setLastEstado(estadoActual)
    onMarcar(aprendizId, estado)
    setShowUndo(true)

    setTimeout(() => {
      setShowUndo(false)
    }, 5000)
  }

  const handleUndo = () => {
    if (lastEstado !== null) {
      onMarcar(aprendizId, lastEstado)
    }
    setShowUndo(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--color-text-light)]">
          {nombreAprendiz}
        </span>
      </div>

      <div className="flex gap-2">
        {(Object.keys(estadoConfig) as EstadoAsistencia[]).map((estado) => {
          const config = estadoConfig[estado]
          const isActive = estadoActual === estado

          return (
            <button
              key={estado}
              onClick={() => handleMarcar(estado)}
              disabled={isMarking}
              className={`relative flex h-12 w-12 items-center justify-center rounded-xl border-3 font-[var(--font-heading)] text-sm font-bold transition-all duration-200 ${
                isActive
                  ? `border-transparent bg-gradient-to-br ${config.gradient} text-white shadow-lg`
                  : `cursor-pointer border-gray-200 bg-white ${config.textColor} ${config.hoverColor} hover:shadow-md active:scale-95`
              } ${isMarking ? 'pointer-events-none opacity-70' : ''}`}
              style={{ borderWidth: '3px' }}
              title={config.label}
            >
              {config.shortLabel}
              {isActive && (
                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white shadow-sm" />
              )}
            </button>
          )
        })}
      </div>

      {/* Undo Toast */}
      {showUndo && (
        <div className="flex items-center gap-2 rounded-xl border-3 border-gray-200 bg-white p-2 shadow-lg" style={{ borderWidth: '3px' }}>
          <span className="text-xs text-[var(--color-text-light)]">Marcado</span>
          <button
            onClick={handleUndo}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline"
          >
            Deshacer
          </button>
        </div>
      )}
    </div>
  )
}
