import { useState, useEffect } from 'react'
import { asistenciaService } from '@/features/asistencias/services/asistenciaService'
import { useAuthStore } from '@/stores/authStore'
import type { Asistencia } from '@/types'

interface EstadisticasData {
  asistencias: Asistencia[]
  isLoading: boolean
  error: string | null
  estadisticas: {
    total: number
    presentes: number
    tardes: number
    justificados: number
    faltantes: number
    porcentajeAsistencia: number
  }
  tendenciaSemanal: {
    semana: string
    porcentaje: number
  }[]
  aprendicesEnRiesgo: {
    nombre: string
    apellido: string
    documento: string
    faltas: number
    inasistencias: number
  }[]
  topPerformers: {
    nombre: string
    apellido: string
    documento: string
    asistencias: number
    porcentaje: number
  }[]
}

export function useEstadisticas(): EstadisticasData {
  const { user } = useAuthStore()
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ficha = user?.ficha_asignada ?? 0

  useEffect(() => {
    const fetchEstadisticas = async () => {
      if (!ficha) return

      setIsLoading(true)
      setError(null)

      const fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const fechaFin = new Date().toISOString().split('T')[0]

      const result = await asistenciaService.obtenerHistorial(ficha, fechaInicio, fechaFin)

      if (result.ok) {
        setAsistencias(result.data)
      } else {
        setError(result.error?.message || 'Error al cargar estadísticas')
      }

      setIsLoading(false)
    }

    fetchEstadisticas()
  }, [ficha])

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

  const tendenciaSemanal = (() => {
    const semanas: Record<string, Asistencia[]> = {}
    asistencias.forEach(a => {
      const date = new Date(a.fecha + 'T00:00:00')
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())
      const key = startOfWeek.toISOString().split('T')[0]
      if (!semanas[key]) semanas[key] = []
      semanas[key].push(a)
    })

    return Object.entries(semanas)
      .map(([semana, asistenciasSemana]) => ({
        semana: new Date(semana + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
        porcentaje: asistenciasSemana.length > 0
          ? Math.round((asistenciasSemana.filter(a => a.estado === 'P' || a.estado === 'T' || a.estado === 'J').length / asistenciasSemana.length) * 100)
          : 0,
      }))
      .sort((a, b) => new Date(a.semana).getTime() - new Date(b.semana).getTime())
      .slice(-8)
  })()

  const aprendicesEnRiesgo = (() => {
    const conteo: Record<string, {
      nombre: string
      apellido: string
      documento: string
      faltas: number
      inasistencias: number
    }> = {}

    asistencias.forEach(a => {
      if (!conteo[a.aprendiz_id]) {
        conteo[a.aprendiz_id] = {
          nombre: '',
          apellido: '',
          documento: '',
          faltas: 0,
          inasistencias: 0,
        }
      }
      if (a.estado === 'F') {
        conteo[a.aprendiz_id].faltas++
        conteo[a.aprendiz_id].inasistencias++
      } else if (a.estado !== 'P') {
        conteo[a.aprendiz_id].inasistencias++
      }
    })

    return Object.values(conteo)
      .filter(a => a.inasistencias >= 3)
      .sort((a, b) => b.inasistencias - a.inasistencias)
      .slice(0, 5)
  })()

  const topPerformers = (() => {
    const conteo: Record<string, {
      nombre: string
      apellido: string
      documento: string
      asistencias: number
      total: number
    }> = {}

    asistencias.forEach(a => {
      if (!conteo[a.aprendiz_id]) {
        conteo[a.aprendiz_id] = {
          nombre: '',
          apellido: '',
          documento: '',
          asistencias: 0,
          total: 0,
        }
      }
      conteo[a.aprendiz_id].total++
      if (a.estado === 'P') {
        conteo[a.aprendiz_id].asistencias++
      }
    })

    return Object.values(conteo)
      .map(a => ({
        ...a,
        porcentaje: a.total > 0 ? Math.round((a.asistencias / a.total) * 100) : 0,
      }))
      .sort((a, b) => b.porcentaje - a.porcentaje)
      .slice(0, 5)
  })()

  return {
    asistencias,
    isLoading,
    error,
    estadisticas,
    tendenciaSemanal,
    aprendicesEnRiesgo,
    topPerformers,
  }
}