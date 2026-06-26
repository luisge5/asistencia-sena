import { Html5Qrcode } from 'html5-qrcode'
import type { Result } from '@/types'

export interface QrScanResult {
  decodedText: string
  format?: string
}

export interface QrScannerConfig {
  fps?: number
  qrbox?: { width: number; height: number }
  aspectRatio?: number
  disableFlip?: boolean
}

const defaultConfig: QrScannerConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  disableFlip: false,
}

let html5QrcodeInstance: Html5Qrcode | null = null

export const qrScannerService = {
  async checkCameraSupport(): Promise<Result<boolean>> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { ok: false, error: new Error('Camera not supported in this browser') }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      return { ok: true, data: true }
    } catch {
      return { ok: false, error: new Error('Camera permission denied') }
    }
  },

  async startScanner(
    elementId: string,
    onScanSuccess: (result: QrScanResult) => void,
    onScanError?: (error: string) => void,
    config?: QrScannerConfig
  ): Promise<Result<void>> {
    try {
      if (html5QrcodeInstance) {
        await html5QrcodeInstance.stop().catch(() => {})
        html5QrcodeInstance.clear()
      }

      html5QrcodeInstance = new Html5Qrcode(elementId)
      const mergedConfig = { ...defaultConfig, ...config }

      await html5QrcodeInstance.start(
        { facingMode: 'environment' },
        {
          fps: mergedConfig.fps,
          qrbox: mergedConfig.qrbox,
          aspectRatio: mergedConfig.aspectRatio,
          disableFlip: mergedConfig.disableFlip,
        },
        (decodedText) => {
          onScanSuccess({
            decodedText,
            format: 'QR_CODE',
          })
        },
        (errorMessage) => {
          if (onScanError) {
            onScanError(errorMessage)
          }
        }
      )

      return { ok: true, data: undefined }
    } catch (error) {
      return { ok: false, error: error as Error }
    }
  },

  async stopScanner(): Promise<Result<void>> {
    try {
      if (html5QrcodeInstance) {
        await html5QrcodeInstance.stop()
        html5QrcodeInstance.clear()
        html5QrcodeInstance = null
      }
      return { ok: true, data: undefined }
    } catch (error) {
      html5QrcodeInstance = null
      return { ok: false, error: error as Error }
    }
  },

  async pauseScanner(): Promise<Result<void>> {
    try {
      if (html5QrcodeInstance) {
        await html5QrcodeInstance.pause(true)
      }
      return { ok: true, data: undefined }
    } catch (error) {
      return { ok: false, error: error as Error }
    }
  },

  async resumeScanner(): Promise<Result<void>> {
    try {
      if (html5QrcodeInstance) {
        html5QrcodeInstance.resume()
      }
      return { ok: true, data: undefined }
    } catch (error) {
      return { ok: false, error: error as Error }
    }
  },

  isScannerRunning(): boolean {
    return html5QrcodeInstance !== null
  },

  parseQrData(decodedText: string): Result<Record<string, string>> {
    const hasEquals = decodedText.includes('=')
    if (!hasEquals) {
      return { ok: true, data: { raw: decodedText } }
    }

    try {
      const params = new URLSearchParams(decodedText.includes('?') ? decodedText.split('?')[1] : decodedText)
      const data: Record<string, string> = {}
      params.forEach((value, key) => {
        data[key] = value
      })

      if (Object.keys(data).length === 0) {
        return { ok: true, data: { raw: decodedText } }
      }

      return { ok: true, data }
    } catch {
      return { ok: true, data: { raw: decodedText } }
    }
  },
}
