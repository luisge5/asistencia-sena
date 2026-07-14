import { useRef, useState, useCallback } from 'react'

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraOn(true)
    } catch {
      setError('No se pudo acceder a la cámara')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsCameraOn(false)
  }, [])

  const capture = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    stopCamera()
    onCapture(dataUrl)
  }, [stopCamera, onCapture])

  return (
    <div className="space-y-3">
      {!isCameraOn ? (
        <button
          onClick={startCamera}
          className="w-full h-12 rounded-xl bg-accent text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>Tomar foto</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={capture}
              className="flex-1 h-10 rounded-xl bg-accent text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
            >
              Capturar
            </button>
            <button
              onClick={stopCamera}
              className="h-10 px-4 rounded-xl border border-border text-sm font-medium text-muted-fg hover:bg-muted transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-state-ausente-bg text-state-ausente text-sm p-3">{error}</div>
      )}
    </div>
  )
}
