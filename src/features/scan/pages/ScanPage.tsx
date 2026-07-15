import { useState, useCallback, useRef } from 'react'
import { QRScanner } from '../components/QRScanner'
import { qrScannerService, type QrScanResult } from '../services/qrScannerService'
import { useMarkAttendance } from '../hooks/useMarkAttendance'
import { useAuthStore } from '@/stores/authStore'
import { usePushNotifications } from '@/shared/hooks/usePushNotifications'
import { insforge } from '@/lib/insforge'
import { useToastStore } from '@/shared/stores/toastStore'
import type { Aprendice } from '@/types'

export function ScanPage() {
  const [scannedAprendiz, setScannedAprendiz] = useState<Aprendice | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const lastScanRef = useRef(0)

  const user = useAuthStore((state) => state.user)
  const { addToast } = useToastStore()
  const { sendNotification } = usePushNotifications()
  const { asistencia, isLoading: isMarking, error: markError, markAttendance, clearResult: clearMark } = useMarkAttendance({
    instructorId: user?.id || '',
    ficha: user?.ficha_asignada || 0,
    centro: user?.centro || '',
  })

  const doAutoMark = useCallback(async (aprendiz: Aprendice) => {
    const result = await markAttendance(aprendiz.id, 'P')
    if (result.ok) {
      addToast({
        message: `✓ ${aprendiz.nombre} ${aprendiz.apellido} — Presente`,
        type: 'success',
      })
      sendNotification(
        'Asistencia Registrada',
        `${aprendiz.nombre} ${aprendiz.apellido} marcado como presente`,
        '/'
      )
    }
  }, [markAttendance, addToast, sendNotification])

  const handleScanSuccess = useCallback(async (result: QrScanResult) => {
    const now = Date.now()
    if (now - lastScanRef.current < 800) return
    lastScanRef.current = now

    setLookupError(null)
    setScannedAprendiz(null)

    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    const decodedText = result.decodedText

    const documento = decodedText.startsWith('SENA:')
      ? decodedText.slice(5).trim()
      : (() => {
          const parsed = qrScannerService.parseQrData(decodedText)
          return parsed.ok ? parsed.data.documento || parsed.data.doc || parsed.data.raw : decodedText
        })()

    if (documento) {
      try {
        const isSenaQr = decodedText.startsWith('SENA:')
        let query = insforge.database
          .from('aprendices')
          .select('*')
          .eq('documento', documento)

        if (!isSenaQr && user?.ficha_asignada) {
          query = query.eq('ficha', user.ficha_asignada)
        }

        const { data: aprendices } = await query.limit(1)

        if (aprendices && aprendices.length > 0) {
          const aprendiz = aprendices[0] as unknown as Aprendice

          if (isSenaQr) {
            await doAutoMark(aprendiz)
            setScannedAprendiz(null)
            clearMark()
            return
          }

          setScannedAprendiz(aprendiz)
        } else {
          setLookupError('Aprendiz no encontrado')
        }
      } catch {
        setLookupError('Error al buscar aprendiz')
      }
    }
  }, [user, doAutoMark, clearMark])

  const handleScanError = useCallback(() => {
    // silent
  }, [])

  const handleMark = async (estado: 'P' | 'T' | 'J') => {
    if (!scannedAprendiz) return
    const result = await markAttendance(scannedAprendiz.id, estado)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
    if (result.ok) {
      const estadoLabel = estado === 'P' ? 'Presente' : estado === 'T' ? 'Tarde' : 'Justificado'
      addToast({
        message: `✓ ${scannedAprendiz.nombre} ${scannedAprendiz.apellido} — ${estadoLabel}`,
        type: 'success',
      })
      sendNotification(
        'Asistencia Registrada',
        `${scannedAprendiz.nombre} ${scannedAprendiz.apellido} marcado como ${estadoLabel}`,
        '/'
      )
    } else {
      addToast({
        message: 'Error al registrar asistencia',
        type: 'error',
      })
    }
  }

  const handleContinue = () => {
    setScannedAprendiz(null)
    setLookupError(null)
    clearMark()
  }

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

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
          <div className="text-on-primary text-sm font-medium text-center">Apunta al QR de la ficha</div>
        </div>
      </section>

      {scannedAprendiz || lookupError ? (
        <section className="rounded-2xl bg-surface border border-border overflow-hidden view-enter">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-fg">
              {lookupError ? 'Error de lectura' : 'Última lectura'}
            </div>
          </div>

          {lookupError ? (
            <div className="p-4 text-center">
              <div className="font-medium text-sm text-state-ausente">{lookupError}</div>
              <button
                onClick={handleContinue}
                className="mt-3 h-11 px-6 rounded-xl bg-primary text-on-primary text-sm font-semibold active:scale-[0.98] transition-transform cursor-pointer"
              >
                Escanear otro
              </button>
            </div>
          ) : scannedAprendiz && !asistencia && (
            <>
              <div className="p-4 flex items-center gap-4">
                <div className="shrink-0 w-14 h-14 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-fg">
                  {getInitials(scannedAprendiz.nombre, scannedAprendiz.apellido)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px] truncate">{scannedAprendiz.nombre} {scannedAprendiz.apellido}</div>
                  <div className="text-xs text-muted-fg tabular-nums">{scannedAprendiz.ficha} · doc {scannedAprendiz.documento}</div>
                </div>
              </div>
              <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleMark('P')}
                  disabled={isMarking}
                  className="h-12 rounded-xl bg-state-presente text-white font-semibold text-sm active:scale-[0.98] transition flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[11px]">Presente</span>
                </button>
                <button
                  onClick={() => handleMark('T')}
                  disabled={isMarking}
                  className="h-12 rounded-xl bg-state-tarde text-white font-semibold text-sm active:scale-[0.98] transition flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-[11px]">Tarde</span>
                </button>
                <button
                  onClick={() => handleMark('J')}
                  disabled={isMarking}
                  className="h-12 rounded-xl bg-state-justificado text-white font-semibold text-sm active:scale-[0.98] transition flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="text-[11px]">Justificado</span>
                </button>
              </div>
            </>
          )}

          {isMarking && (
            <div className="px-4 pb-4 text-center text-sm text-muted-fg">Registrando asistencia...</div>
          )}

          {markError && (
            <div className="px-4 pb-4">
              <div className="rounded-lg bg-state-ausente-bg text-state-ausente text-sm p-3">{markError}</div>
              <button
                onClick={handleContinue}
                className="mt-3 w-full h-11 rounded-xl border border-border bg-surface text-sm font-medium text-muted-fg hover:bg-muted transition-colors cursor-pointer"
              >
                Escanear otro
              </button>
            </div>
          )}

          {asistencia && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-state-presente-bg text-state-presente text-sm font-semibold mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Asistencia registrada
              </div>
              <div className="text-xs text-muted-fg mb-3">
                {asistencia.estado === 'P' ? 'Presente' : asistencia.estado === 'T' ? 'Tarde' : 'Justificado'} — {asistencia.hora_entrada}
              </div>
              <button
                onClick={handleContinue}
                className="w-full h-11 rounded-xl bg-primary text-on-primary text-sm font-semibold active:scale-[0.98] transition-transform cursor-pointer"
              >
                Escanear otro
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-fg mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z" /><path d="M20 14v3" /><path d="M17 20h4" /><path d="M14 20v1" />
            </svg>
          </div>
          <div className="text-sm font-medium">Sin lecturas todavía</div>
          <div className="text-xs text-muted-fg mt-1 leading-relaxed">Apunta la cámara al código QR<br />del aprendiz para registrar</div>
        </section>
      )}
    </div>
  )
}


