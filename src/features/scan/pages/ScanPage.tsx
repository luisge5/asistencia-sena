import { useState, useCallback, useRef, useEffect } from 'react'
import { QRScanner } from '../components/QRScanner'
import { qrScannerService, type QrScanResult } from '../services/qrScannerService'
import { useMarkAttendance } from '../hooks/useMarkAttendance'
import { useAuthStore } from '@/stores/authStore'
import { usePushNotifications } from '@/shared/hooks/usePushNotifications'
import { insforge } from '@/lib/insforge'
import { useToastStore } from '@/shared/stores/toastStore'
import type { Aprendice } from '@/types'

export function ScanPage() {
  const [lastAprendiz, setLastAprendiz] = useState<Aprendice | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const lastScanRef = useRef(0)
  const processingRef = useRef(false)

  const user = useAuthStore((state) => state.user)
  const { addToast } = useToastStore()
  const { sendNotification } = usePushNotifications()
  const { asistencia, error: markError, markAttendance, clearResult: clearMark } = useMarkAttendance({
    instructorId: user?.id || '',
    ficha: user?.ficha_asignada || 0,
    centro: user?.centro || '',
  })

  useEffect(() => {
    if (asistencia && lastAprendiz) {
      const timer = setTimeout(() => {
        setLastAprendiz(null)
        clearMark()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [asistencia, lastAprendiz, clearMark])

  const handleScanSuccess = useCallback(async (result: QrScanResult) => {
    const now = Date.now()
    if (now - lastScanRef.current < 500) return
    if (processingRef.current) return
    lastScanRef.current = now
    processingRef.current = true

    setLookupError(null)
    setLastAprendiz(null)
    clearMark()
    setIsProcessing(true)

    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }

    const decodedText = result.decodedText

    const documento = decodedText.startsWith('SENA:')
      ? decodedText.slice(5).trim()
      : (() => {
          const parsed = qrScannerService.parseQrData(decodedText)
          return parsed.ok ? parsed.data.documento || parsed.data.doc || parsed.data.raw : decodedText
        })()

    if (!documento) {
      setLookupError('No se pudo leer el documento')
      setIsProcessing(false)
      processingRef.current = false
      return
    }

    try {
      const isSenaQr = decodedText.startsWith('SENA:')
      let query = insforge.database
        .from('aprendices')
        .select('id,nombre,apellido,documento,ficha,centro')
        .eq('documento', documento)

      if (!isSenaQr && user?.ficha_asignada) {
        query = query.eq('ficha', user.ficha_asignada)
      }

      const { data: aprendices } = await query.limit(1).single()

      if (!aprendices) {
        setLookupError('Aprendiz no encontrado')
        setIsProcessing(false)
        processingRef.current = false
        return
      }

      const aprendiz = aprendices as unknown as Aprendice
      setLastAprendiz(aprendiz)

      const result = await markAttendance(aprendiz.id, 'P')

      setIsProcessing(false)
      processingRef.current = false

      if (result.ok) {
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 30, 50])
        }
        addToast({
          message: `✓ ${aprendiz.nombre} ${aprendiz.apellido}`,
          type: 'success',
          duration: 2000,
        })
        sendNotification(
          'Asistencia',
          `${aprendiz.nombre} ${aprendiz.apellido} — Presente`,
          '/'
        )
      } else {
        addToast({
          message: 'Error al registrar',
          type: 'error',
        })
      }
    } catch {
      setLookupError('Error al buscar aprendiz')
      setIsProcessing(false)
      processingRef.current = false
    }
  }, [user, markAttendance, addToast, sendNotification, clearMark])

  const handleScanError = useCallback(() => {}, [])

  return (
    <div className="view-enter px-5 pt-5 pb-6 space-y-5">
      <section className="relative aspect-square rounded-3xl overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(120% 60% at 50% 0%, #1E293B 0%, #0F172A 60%)' }} />
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] max-w-[220px] aspect-square pointer-events-none">
          <div className="absolute inset-0 scanner-frame" />
          <div className="scan-line absolute left-2 right-2 top-2 h-px bg-accent-soft shadow-[0_0_12px_2px_rgba(2,132,199,0.6)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-12 bg-gradient-to-t from-primary to-transparent pointer-events-none">
          <div className="text-on-primary text-sm font-medium text-center">Apunta al QR del aprendiz</div>
        </div>
      </section>

      {isProcessing && (
        <section className="rounded-2xl bg-surface border border-border p-4 text-center view-enter">
          <div className="inline-flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-fg">Registrando...</span>
          </div>
        </section>
      )}

      {lookupError && (
        <section className="rounded-2xl bg-surface border border-border p-4 view-enter">
          <div className="text-center">
            <div className="font-medium text-sm text-state-ausente">{lookupError}</div>
          </div>
        </section>
      )}

      {markError && (
        <section className="rounded-2xl bg-surface border border-border p-4 view-enter">
          <div className="rounded-lg bg-state-ausente-bg text-state-ausente text-sm p-3 text-center">{markError}</div>
        </section>
      )}

      {asistencia && lastAprendiz && (
        <section className="rounded-2xl bg-state-presente-bg border border-state-presente/20 p-4 text-center view-enter">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-state-presente">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-semibold text-state-presente">Registrado</span>
          </div>
          <div className="font-semibold text-sm">{lastAprendiz.nombre} {lastAprendiz.apellido}</div>
          <div className="text-xs text-muted-fg tabular-nums mt-1">{asistencia.hora_entrada}</div>
        </section>
      )}

      {!isProcessing && !lookupError && !markError && !asistencia && (
        <section className="rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-fg mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z" /><path d="M20 14v3" /><path d="M17 20h4" /><path d="M14 20v1" />
            </svg>
          </div>
          <div className="text-sm font-medium">Sin lecturas</div>
          <div className="text-xs text-muted-fg mt-1">Apunta al QR para registrar</div>
        </section>
      )}
    </div>
  )
}
