import { useState, useEffect } from 'react'
import { asistenciaService } from '@/features/asistencias/services/asistenciaService'
import { useAuthStore } from '@/stores/authStore'
import type { Asistencia } from '@/types'

interface HistorialFilters {
  fechaInicio: string
  fechaFin: string
}

interface UseHistorialResult {
  asistencias: Asistencia[]
  isLoading: boolean
  error: string | null
  filters: HistorialFilters
  setFilters: (filters: HistorialFilters) => void
  estadisticas: {
    total: number
    presentes: number
    tardes: number
    justificados: number
    faltantes: number
    porcentajeAsistencia: number
  }
  exportToCSV: () => void
}

export function useHistorial(): UseHistorialResult {
  const { user } = useAuthStore()
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<HistorialFilters>({
    fechaInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
  })

  const ficha = user?.ficha_asignada ?? 0

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!ficha) return

      setIsLoading(true)
      setError(null)

      const result = await asistenciaService.obtenerHistorial(
        ficha,
        filters.fechaInicio,
        filters.fechaFin
      )

      if (result.ok) {
        setAsistencias(result.data)
      } else {
        setError(result.error?.message || 'Error al cargar historial')
      }

      setIsLoading(false)
    }

    fetchHistorial()
  }, [ficha, filters.fechaInicio, filters.fechaFin])

  const estadisticas = {
    total: asistencias.length,
    presentes: asistencias.filter(a => a.estado === 'P').length,
    tardes: asistencias.filter(a => a.estado === 'T').length,
    justificados: asistencias.filter(a => a.estado === 'J').length,
    faltantes: asistencias.filter(a => a.estado === 'F').length,
    porcentajeAsistencia: asistencias.length > 0
      ? Math.round((asistencias.filter(a => a.estado === 'P' || a.estado === 'T' || a.estado === 'J').length / asistencias.length) * 100)
      : 0,
  }

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora Entrada', 'Hora Salida', 'Estado', 'Ficha']
    const rows = asistencias.map(a => [
      a.fecha,
      a.hora_entrada || '',
      a.hora_salida || '',
      a.estado === 'P' ? 'Presente' : a.estado === 'T' ? 'Tarde' : a.estado === 'J' ? 'Justificado' : 'Faltante',
      String(a.ficha),
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `asistencias_${filters.fechaInicio}_${filters.fechaFin}.csv`
    link.click()
  }

  return {
    asistencias,
    isLoading,
    error,
    filters,
    setFilters,
    estadisticas,
    exportToCSV,
  }
}