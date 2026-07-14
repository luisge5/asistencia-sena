import { useState, useRef, useCallback } from 'react'
import { insforge } from '@/lib/insforge'
import { CarnetCard } from '../components/CarnetCard'
import { CameraCapture } from '../components/CameraCapture'
import html2canvas from 'html2canvas'
import type { Aprendice } from '@/types'

export function MiCarnetPage() {
  const [documento, setDocumento] = useState('')
  const [aprendiz, setAprendiz] = useState<Aprendice | null>(null)
  const [mostrarCamara, setMostrarCamara] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardReady, setCardReady] = useState(false)
  const carnetRef = useRef<HTMLDivElement>(null)

  const handleBuscar = useCallback(async () => {
    if (!documento.trim()) return
    setBuscando(true)
    setError(null)

    try {
      const { data, error: err } = await insforge.database
        .from('aprendices')
        .select('*')
        .eq('documento', documento.trim())
        .limit(1) as unknown as { data: Aprendice[] | null; error: unknown }

      if (err || !data || data.length === 0) {
        setError('Aprendiz no encontrado. Verifica tu número de documento.')
        return
      }

      setAprendiz(data[0])
    } catch {
      setError('Error al buscar. Intenta de nuevo.')
    } finally {
      setBuscando(false)
    }
  }, [documento])

  const handleCapture = useCallback((dataUrl: string) => {
    setAprendiz((prev) => prev ? { ...prev, foto: dataUrl } : null)
    setMostrarCamara(false)
  }, [])

  const handleDownload = useCallback(async () => {
    const el = carnetRef.current
    if (!el) return

    const canvas = await html2canvas(el, {
      backgroundColor: '#FFFFFF',
      scale: 3,
      useCORS: true,
      allowTaint: false,
    })

    const link = document.createElement('a')
    link.download = `carnet-${aprendiz?.documento || 'sena'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [aprendiz])

  const handleNuevo = useCallback(() => {
    setDocumento('')
    setAprendiz(null)
    setMostrarCamara(false)
    setError(null)
    setCardReady(false)
  }, [])

  const tieneFoto = !!aprendiz?.foto

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-soft flex items-start justify-center p-4 pt-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Mi Carnet SENA</h1>
          <p className="text-sm text-white/70 mt-1">Genera tu carnet digital</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-primary/30">
          {!aprendiz ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="doc" className="text-sm font-medium text-slate-700 block mb-1.5">
                  Número de documento
                </label>
                <input
                  id="doc"
                  type="text"
                  inputMode="numeric"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                  placeholder="Ej: 1234567890"
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleBuscar}
                disabled={buscando || !documento.trim()}
                className="w-full h-12 rounded-xl bg-accent text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 cursor-pointer"
              >
                {buscando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          ) : mostrarCamara ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-900">
                  {aprendiz.nombre} {aprendiz.apellido}
                </div>
                <div className="text-xs text-slate-500">
                  {aprendiz.tipo_documento?.toUpperCase()}: {aprendiz.documento}
                </div>
              </div>
              <CameraCapture onCapture={handleCapture} />
            </div>
          ) : (
            <div className="space-y-5">
              <div ref={carnetRef} className="flex justify-center">
                <CarnetCard aprendiz={aprendiz} onReady={() => setCardReady(true)} />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!cardReady}
                  className="w-full h-12 rounded-xl bg-accent text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Descargar carnet</span>
                </button>
                <button
                  onClick={() => setMostrarCamara(true)}
                  className="w-full h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {tieneFoto ? <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></> : <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>}
                  </svg>
                  <span>{tieneFoto ? 'Cambiar foto' : 'Agregar foto'}</span>
                </button>
                <button
                  onClick={handleNuevo}
                  className="w-full h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Generar otro carnet
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/50 mt-6">
          Servicio Nacional de Aprendizaje — SENA
        </p>
      </div>
    </div>
  )
}
