import { useState, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useBuscarAprendices } from '../hooks/useAprendices'
import { CarnetCard } from '../components/CarnetCard'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function CarnetsPage() {
  const { user } = useAuthStore()
  const ficha = user?.ficha_asignada ?? 0

  const { data: result, isLoading } = useBuscarAprendices({ ficha })
  const aprendices = result?.ok ? result.data : []

  const [exporting, setExporting] = useState(false)
  const [readyCount, setReadyCount] = useState(0)

  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  const totalCards = aprendices.length
  const allReady = readyCount >= totalCards

  const onCardReady = useCallback(() => {
    setReadyCount((c) => c + 1)
  }, [])

  const downloadPNG = async (index: number) => {
    const el = cardsRef.current[index]
    if (!el) return

    const canvas = await html2canvas(el, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      useCORS: true,
      allowTaint: false,
    })

    const link = document.createElement('a')
    link.download = `carnet-${aprendices[index]?.documento || index}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const exportAllPDF = async () => {
    setExporting(true)

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const margin = 15
      const pageH = 297
      const usableW = 180
      let y = margin

      for (let i = 0; i < aprendices.length; i++) {
        const el = cardsRef.current[i]
        if (!el) continue

        const canvas = await html2canvas(el, {
          backgroundColor: '#FFFFFF',
          scale: 2,
          useCORS: true,
          allowTaint: false,
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const imgH = (canvas.height / canvas.width) * usableW

        if (y + imgH > pageH - margin && i > 0) {
          pdf.addPage()
          y = margin
        }

        pdf.addImage(imgData, 'JPEG', margin, y, usableW, imgH)
        y += imgH + 8
      }

      pdf.save(`carnets-ficha-${ficha}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="px-5 pt-5 pb-6 space-y-4">
        <div className="h-8 bg-muted rounded-lg animate-pulse w-40" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="view-enter px-5 pt-5 pb-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">
          Carnets · {aprendices.length}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportAllPDF}
            disabled={exporting || !allReady || aprendices.length === 0}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary text-on-primary text-xs font-semibold disabled:opacity-40 transition-opacity cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>{exporting ? 'Exportando...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {!allReady && (
        <div className="text-xs text-muted-fg">Generando códigos QR... {readyCount}/{totalCards}</div>
      )}

      {aprendices.length === 0 ? (
        <div className="text-center text-muted-fg text-sm py-10">
          No hay aprendices registrados en esta ficha
        </div>
      ) : (
        <div className="space-y-5">
          {aprendices.map((a, i) => (
            <div key={a.id} className="flex flex-col items-center gap-3">
              <div ref={(el) => { cardsRef.current[i] = el }}>
                <CarnetCard aprendiz={a} onReady={onCardReady} />
              </div>
              <button
                onClick={() => downloadPNG(i)}
                disabled={!allReady}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-soft transition-colors disabled:opacity-40 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Descargar PNG</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
