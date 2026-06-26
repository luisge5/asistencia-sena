import { useEffect, useRef, useState } from 'react'
import { qrScannerService, type QrScanResult, type QrScannerConfig } from '../services/qrScannerService'

interface QRScannerProps {
  onScanSuccess: (result: QrScanResult) => void
  onScanError?: (error: string) => void
  config?: QrScannerConfig
  isActive?: boolean
}

export function QRScanner({
  onScanSuccess,
  onScanError,
  config,
  isActive = true,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerId = useRef(`qr-scanner-${Math.random().toString(36).slice(2, 9)}`).current

  useEffect(() => {
    const checkCamera = async () => {
      const result = await qrScannerService.checkCameraSupport()
      setHasPermission(result.ok)
      if (!result.ok && result.error) {
        setError(result.error.message)
      }
    }

    checkCamera()
  }, [])

  useEffect(() => {
    if (!isActive || !hasPermission) return

    const startScanner = async () => {
      setIsScanning(true)
      setError(null)

      const result = await qrScannerService.startScanner(
        scannerId,
        onScanSuccess,
        onScanError,
        config
      )

      if (!result.ok) {
        setError(result.error.message)
        setIsScanning(false)
      }
    }

    startScanner()

    return () => {
      qrScannerService.stopScanner()
      setIsScanning(false)
    }
  }, [isActive, hasPermission, scannerId, onScanSuccess, onScanError, config])

  if (hasPermission === null) {
    return (
      <div
        ref={containerRef}
        className="flex h-64 items-center justify-center rounded-2xl border-4 border-gray-200 bg-gray-50"
        style={{ borderWidth: '4px' }}
      >
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <p className="mt-3 text-sm text-[var(--color-text-light)]">Verificando cámara...</p>
        </div>
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div
        ref={containerRef}
        className="flex h-64 items-center justify-center rounded-2xl border-4 border-red-200 bg-red-50"
        style={{ borderWidth: '4px' }}
      >
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="mt-3 font-[var(--font-heading)] text-lg font-semibold text-red-700">
            Cámara no disponible
          </p>
          <p className="mt-1 text-sm text-red-600">
            {error || 'Permite el acceso a la cámara en tu navegador'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl border-4 border-gray-200 bg-black" style={{ borderWidth: '4px' }}>
      {/* Scanner Container */}
      <div id={scannerId} className="h-80 w-full" />

      {/* Scan Line Animation */}
      {isScanning && (
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 h-0.5 w-3/4 -translate-x-1/2 animate-[scan_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent"
            style={{
              boxShadow: '0 0 20px var(--color-primary), 0 0 40px var(--color-primary)',
            }}
          />
        </div>
      )}

      {/* Corner Markers */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-left */}
        <div className="absolute left-4 top-4 h-8 w-8 border-l-4 border-t-4 border-[var(--color-cta)]" />
        {/* Top-right */}
        <div className="absolute right-4 top-4 h-8 w-8 border-r-4 border-t-4 border-[var(--color-cta)]" />
        {/* Bottom-left */}
        <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-[var(--color-cta)]" />
        {/* Bottom-right */}
        <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-[var(--color-cta)]" />
      </div>

      {/* Status Overlay */}
      {!isScanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            <p className="mt-3 text-sm text-white">Iniciando cámara...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="mx-4 max-w-sm rounded-2xl border-3 border-red-400 bg-white p-6 text-center" style={{ borderWidth: '3px' }}>
            <svg className="mx-auto h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="mt-3 font-[var(--font-heading)] text-lg font-semibold text-[var(--color-text)]">
              Error al escanear
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-light)]">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
