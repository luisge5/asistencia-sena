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
  P: { label: 'Presente', shortLabel: 'P', activeBg: 'bg-green-500', activeText: 'text-white', inactiveBg: 'bg-white', inactiveText: 'text-green-600', inactiveBorder: 'border-green-200', hoverBg: 'hover:bg-green-50' },
  T: { label: 'Tarde', shortLabel: 'T', activeBg: 'bg-amber-500', activeText: 'text-white', inactiveBg: 'bg-white', inactiveText: 'text-amber-600', inactiveBorder: 'border-amber-200', hoverBg: 'hover:bg-amber-50' },
  J: { label: 'Justificado', shortLabel: 'J', activeBg: 'bg-orange-500', activeText: 'text-white', inactiveBg: 'bg-white', inactiveText: 'text-orange-600', inactiveBorder: 'border-orange-200', hoverBg: 'hover:bg-orange-50' },
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
        <span className="text-sm font-medium text-slate-500">
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
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? `${config.activeBg} ${config.activeText} border-transparent`
                  : `${config.inactiveBg} ${config.inactiveText} ${config.inactiveBorder} ${config.hoverBg}`
              } ${isMarking ? 'pointer-events-none opacity-70' : ''}`}
              title={config.label}
            >
              {config.shortLabel}
            </button>
          )
        })}
      </div>

      {/* Undo Toast */}
      {showUndo && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-md">
          <span className="text-xs text-slate-500">Marcado</span>
          <button
            onClick={handleUndo}
            className="cursor-pointer text-xs font-semibold text-indigo-600 hover:underline"
          >
            Deshacer
          </button>
        </div>
      )}
    </div>
  )
}
