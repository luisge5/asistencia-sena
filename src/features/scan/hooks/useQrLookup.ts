import { useState } from 'react'
import { aprendicesService } from '@/features/aprendices/services/aprendicesService'
import type { Aprendice, Result } from '@/types'

interface QrLookupResult {
  aprendice: Aprendice | null
  isLoading: boolean
  error: string | null
  lookupByDocument: (documento: string) => Promise<Result<Aprendice>>
  clearResult: () => void
}

export function useQrLookup(): QrLookupResult {
  const [aprendice, setAprendice] = useState<Aprendice | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookupByDocument = async (documento: string): Promise<Result<Aprendice>> => {
    setIsLoading(true)
    setError(null)
    setAprendice(null)

    const result = await aprendicesService.buscarAprendicePorDocumento(documento)

    if (result.ok) {
      setAprendice(result.data)
      setIsLoading(false)
      return result
    } else {
      const errorMessage = result.error?.message || 'Aprendiz no encontrado'
      setError(errorMessage)
      setIsLoading(false)
      return result
    }
  }

  const clearResult = () => {
    setAprendice(null)
    setError(null)
    setIsLoading(false)
  }

  return {
    aprendice,
    isLoading,
    error,
    lookupByDocument,
    clearResult,
  }
}