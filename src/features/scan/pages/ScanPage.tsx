import { useState, useCallback } from 'react'
import { QRScanner } from '../components/QRScanner'
import { qrScannerService, type QrScanResult } from '../services/qrScannerService'
import { useQrLookup } from '../hooks/useQrLookup'
import { useMarkAttendance } from '../hooks/useMarkAttendance'
import { useAuthStore } from '@/stores/authStore'

interface ScanResult {
  decodedText: string
  data?: Record<string, string>
  timestamp: Date
}

export function ScanPage() {
  const [isActive, setIsActive] = useState(true)
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedEstado, setSelectedEstado] = useState<'P' | 'T' | 'J'>('P')
  
  const user = useAuthStore((state) => state.user)
  const { aprendice, isLoading: isLookingUp, error: lookupError, lookupByDocument, clearResult: clearLookup } = useQrLookup()
  const { asistencia, isLoading: isMarking, error: markError, markAttendance, clearResult: clearMark } = useMarkAttendance({
    instructorId: user?.id || '',
    ficha: user?.ficha_asignada || 0,
    centro: user?.centro || '',
  })

  const handleScanSuccess = useCallback(async (result: QrScanResult) => {
    const parsed = qrScannerService.parseQrData(result.decodedText)
    const scanResult: ScanResult = {
      decodedText: result.decodedText,
      data: parsed.ok ? parsed.data : undefined,
      timestamp: new Date(),
    }

    setLastResult(scanResult)
    setShowResult(true)
    setIsActive(false)

    if ('vibrate' in navigator) {
      navigator.vibrate(200)
    }

    // Try to look up student by document number
    const documento = parsed.ok ? parsed.data.documento || parsed.data.doc || parsed.data.raw : result.decodedText
    if (documento) {
      await lookupByDocument(documento)
    }
  }, [lookupByDocument])

  const handleScanError = useCallback((_error: string) => {
    // Silent - scanning continues
  }, [])

  const handleMarkAttendance = async () => {
    if (!aprendice) return

    const result = await markAttendance(aprendice.id, selectedEstado)
    if (result.ok) {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    }
  }

  const handleResume = () => {
    setShowResult(false)
    setLastResult(null)
    clearLookup()
    clearMark()
    setSelectedEstado('P')
    setIsActive(true)
  }

  const handleClose = () => {
    setIsActive(false)
    setShowResult(false)
    clearLookup()
    clearMark()
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          Escanear Código QR
        </h1>
        <p className="mt-1 text-[var(--color-text-light)]">
          Apunta la cámara al código QR del aprendiz
        </p>
      </div>

      {/* Scanner */}
      <div className="relative">
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          isActive={isActive}
        />

        {/* Scanner Controls */}
        {isActive && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="rounded-full border-3 border-white/30 bg-black/50 px-4 py-2 backdrop-blur-sm" style={{ borderWidth: '3px' }}>
              <p className="text-xs font-medium text-white">
                Escaneando... Mantén estable la cámara
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Scan Result Modal */}
      {showResult && lastResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-[var(--color-primary)] bg-white"
            style={{
              boxShadow: 'inset -3px -3px 12px rgba(0, 0, 0, 0.1), 6px 6px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Result Header */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-4 text-center">
              {aprendice ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h3 className="mt-2 font-[var(--font-heading)] text-xl font-bold text-white">
                    {aprendice.nombre} {aprendice.apellido}
                  </h3>
                  <p className="text-sm text-white/80">
                    Doc: {aprendice.documento}
                  </p>
                </>
              ) : isLookingUp ? (
                <>
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
                  <h3 className="mt-2 font-[var(--font-heading)] text-xl font-bold text-white">
                    Buscando aprendiz...
                  </h3>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 font-[var(--font-heading)] text-xl font-bold text-white">
                    Código Detectado
                  </h3>
                </>
              )}
            </div>

            {/* Result Content */}
            <div className="p-6">
              {lookupError ? (
                <div className="rounded-xl border-3 border-red-200 bg-red-50 p-4" style={{ borderWidth: '3px' }}>
                  <p className="text-sm font-medium text-red-700">{lookupError}</p>
                  <p className="mt-1 text-xs text-red-600">Código: {lastResult.decodedText}</p>
                </div>
              ) : aprendice ? (
                <div className="space-y-4">
                  {/* Student Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between rounded-lg border-3 border-gray-200 bg-gray-50 px-3 py-2" style={{ borderWidth: '3px' }}>
                      <span className="text-xs font-medium text-[var(--color-text-light)]">Ficha:</span>
                      <span className="text-xs font-semibold text-[var(--color-text)]">{aprendice.ficha}</span>
                    </div>
                    <div className="flex justify-between rounded-lg border-3 border-gray-200 bg-gray-50 px-3 py-2" style={{ borderWidth: '3px' }}>
                      <span className="text-xs font-medium text-[var(--color-text-light)]">Estado:</span>
                      <span className={`text-xs font-semibold ${aprendice.estado === 'activo' ? 'text-green-600' : 'text-red-600'}`}>
                        {aprendice.estado}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Status Selection */}
                  {!isMarking && !asistencia && (
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-light)] mb-2">Marcar como:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setSelectedEstado('P')}
                          className={`cursor-pointer rounded-xl border-3 py-2 text-sm font-bold transition-all ${
                            selectedEstado === 'P'
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                          }`}
                          style={{ borderWidth: '3px' }}
                        >
                          Presente
                        </button>
                        <button
                          onClick={() => setSelectedEstado('T')}
                          className={`cursor-pointer rounded-xl border-3 py-2 text-sm font-bold transition-all ${
                            selectedEstado === 'T'
                              ? 'border-yellow-500 bg-yellow-500 text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-yellow-300'
                          }`}
                          style={{ borderWidth: '3px' }}
                        >
                          Tarde
                        </button>
                        <button
                          onClick={() => setSelectedEstado('J')}
                          className={`cursor-pointer rounded-xl border-3 py-2 text-sm font-bold transition-all ${
                            selectedEstado === 'J'
                              ? 'border-orange-500 bg-orange-500 text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
                          }`}
                          style={{ borderWidth: '3px' }}
                        >
                          Justificado
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Marking Loading */}
                  {isMarking && (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
                      <span className="ml-2 text-sm text-[var(--color-text-light)]">Registrando asistencia...</span>
                    </div>
                  )}

                  {/* Mark Error */}
                  {markError && (
                    <div className="rounded-xl border-3 border-red-200 bg-red-50 p-3" style={{ borderWidth: '3px' }}>
                      <p className="text-sm text-red-600">{markError}</p>
                    </div>
                  )}

                  {/* Success */}
                  {asistencia && (
                    <div className="rounded-xl border-3 border-green-200 bg-green-50 p-3" style={{ borderWidth: '3px' }}>
                      <p className="flex items-center gap-1 text-sm font-medium text-green-700">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Asistencia registrada
                      </p>
                      <p className="text-xs text-green-600">
                        {asistencia.estado === 'P' ? 'Presente' : asistencia.estado === 'T' ? 'Tarde' : 'Justificado'} - {asistencia.hora_entrada}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-light)]">Código escaneado:</p>
                    <p className="mt-1 rounded-xl border-3 border-gray-200 bg-gray-50 p-3 font-mono text-sm break-all" style={{ borderWidth: '3px' }}>
                      {lastResult.decodedText}
                    </p>
                  </div>

                  {lastResult.data && Object.keys(lastResult.data).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text-light)]">Datos parseados:</p>
                      <div className="mt-1 space-y-1">
                        {Object.entries(lastResult.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between rounded-lg border-3 border-gray-200 bg-gray-50 px-3 py-2" style={{ borderWidth: '3px' }}>
                            <span className="text-xs font-medium text-[var(--color-text-light)]">{key}:</span>
                            <span className="text-xs font-semibold text-[var(--color-text)]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-[var(--color-text-light)]">Hora:</p>
                <p className="mt-1 text-sm text-[var(--color-text)]">
                  {lastResult.timestamp.toLocaleTimeString('es-CO')}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {aprendice && !asistencia && !isMarking && (
                  <button
                    onClick={handleMarkAttendance}
                    className="cursor-pointer rounded-xl border-3 border-green-500 bg-green-500 py-3 font-[var(--font-heading)] text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg active:scale-95"
                    style={{ borderWidth: '3px' }}
                  >
                    Registrar
                  </button>
                )}
                <button
                  onClick={handleResume}
                  className={`cursor-pointer rounded-xl border-3 border-[var(--color-primary)] bg-[var(--color-primary)] py-3 font-[var(--font-heading)] text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-95 ${!aprendice || asistencia ? 'col-span-2' : ''}`}
                  style={{ borderWidth: '3px' }}
                >
                  Escanear Otro
                </button>
                <button
                  onClick={handleClose}
                  className="cursor-pointer rounded-xl border-3 border-gray-300 bg-white py-3 font-[var(--font-heading)] text-sm font-bold text-[var(--color-text-light)] shadow-md transition-all duration-200 hover:border-gray-400 hover:shadow-lg active:scale-95"
                  style={{ borderWidth: '3px' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        className="rounded-2xl border-3 border-[var(--color-info)] bg-blue-50 p-4"
        style={{ borderWidth: '3px' }}
      >
        <h4 className="font-[var(--font-heading)] text-sm font-bold text-[var(--color-text)]">
          Instrucciones
        </h4>
        <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-light)]">
          <li>1. Permite el acceso a la cámara cuando el navegador lo solicite</li>
          <li>2. Apunta la cámara al código QR del aprendiz</li>
          <li>3. Mantén la cámara estable y bien iluminada</li>
          <li>4. El código se detectará automáticamente</li>
          <li>5. Selecciona el estado y registra la asistencia</li>
        </ul>
      </div>
    </div>
  )
}
