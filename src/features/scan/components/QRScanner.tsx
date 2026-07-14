import { useEffect, useRef, useState } from 'react'
import { qrScannerService, type QrScanResult, type QrScannerConfig } from '../services/qrScannerService'

interface QRScannerProps {
  onScanSuccess: (result: QrScanResult) => void
  onScanError?: (error: string) => void
  config?: QrScannerConfig
}

export function QRScanner({
  onScanSuccess,
  onScanError,
  config,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerId = useRef(`qr-scanner-${Math.random().toString(36).slice(2, 9)}`).current

  useEffect(() => {
    let mounted = true

    const start = async () => {
      setIsScanning(true)
      const result = await qrScannerService.startScanner(
        scannerId,
        onScanSuccess,
        onScanError,
        config
      )

      if (!mounted) return

      if (!result.ok) {
        setError(result.error.message)
        setIsScanning(false)
      }
    }

    start()

    return () => {
      mounted = false
      qrScannerService.stopScanner()
    }
  }, [scannerId, onScanSuccess, onScanError, config])

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-primary">
        <div className="text-center px-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-on-primary/10 flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-on-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-base font-semibold text-on-primary">Error al escanear</p>
          <p className="text-sm text-on-primary/60 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="absolute inset-0 bg-primary">
      <div id={scannerId} className="w-full h-full" />
      {!isScanning && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/80">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-white border-t-transparent" />
            <p className="mt-3 text-sm font-medium text-on-primary/70">Iniciando cámara...</p>
          </div>
        </div>
      )}
    </div>
  )
}
