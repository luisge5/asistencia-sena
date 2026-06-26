import { useState } from 'react'
import { asistenciaService, type RegistrarAsistenciaParams } from '@/features/asistencias/services/asistenciaService'
import type { Asistencia, Result } from '@/types'

interface UseMarkAttendanceParams {
  instructorId: string
  ficha: number
  centro: string
}

interface MarkAttendanceResult {
  asistencia: Asistencia | null
  isLoading: boolean
  error: string | null
  markAttendance: (aprendizId: string, estado: 'P' | 'T' | 'J') => Promise<Result<Asistencia>>
  clearResult: () => void
}

export function useMarkAttendance({ instructorId, ficha, centro }: UseMarkAttendanceParams): MarkAttendanceResult {
  const [asistencia, setAsistencia] = useState<Asistencia | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const markAttendance = async (aprendizId: string, estado: 'P' | 'T' | 'J'): Promise<Result<Asistencia>> => {
    setIsLoading(true)
    setError(null)
    setAsistencia(null)

    const now = new Date()
    const fecha = now.toISOString().split('T')[0]
    const horaEntrada = now.toLocaleTimeString('es-CO', { hour12: false })

    const params: RegistrarAsistenciaParams = {
      aprendiz_id: aprendizId,
      fecha,
      hora_entrada: horaEntrada,
      estado,
      instructor_id: instructorId,
      ficha,
      centro,
    }

    const result = await asistenciaService.registrarAsistencia(params)

    if (result.ok) {
      setAsistencia(result.data)
      setIsLoading(false)
      return result
    } else {
      const errorMessage = result.error?.message || 'Error al registrar asistencia'
      setError(errorMessage)
      setIsLoading(false)
      return result
    }
  }

  const clearResult = () => {
    setAsistencia(null)
    setError(null)
    setIsLoading(false)
  }

  return {
    asistencia,
    isLoading,
    error,
    markAttendance,
    clearResult,
  }
}