import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { asistenciaService } from '../services/asistenciaService'
import type { RegistrarAsistenciaParams } from '../services/asistenciaService'

export function useAsistenciasHoy(ficha: number, fecha: string) {
  return useQuery({
    queryKey: ['asistencias', 'hoy', ficha, fecha],
    queryFn: () => asistenciaService.obtenerAsistenciasHoy(ficha, fecha),
    enabled: !!ficha && !!fecha,
  })
}

export function useAsistenciasPorAprendiz(aprendizId: string) {
  return useQuery({
    queryKey: ['asistencias', 'aprendiz', aprendizId],
    queryFn: () => asistenciaService.obtenerAsistenciasPorAprendiz(aprendizId),
    enabled: !!aprendizId,
  })
}

export function useHistorial(ficha: number, fechaInicio: string, fechaFin: string) {
  return useQuery({
    queryKey: ['asistencias', 'historial', ficha, fechaInicio, fechaFin],
    queryFn: () => asistenciaService.obtenerHistorial(ficha, fechaInicio, fechaFin),
    enabled: !!ficha && !!fechaInicio && !!fechaFin,
  })
}

export function useRegistrarAsistencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: RegistrarAsistenciaParams) =>
      asistenciaService.registrarAsistencia(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['asistencias', 'hoy', variables.ficha],
      })
    },
  })
}

export function useActualizarAsistencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { id: string; hora_salida?: string; estado?: 'P' | 'T' | 'J' | 'F' }) =>
      asistenciaService.actualizarAsistencia(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['asistencias'],
      })
    },
  })
}

export function useEliminarAsistencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => asistenciaService.eliminarAsistencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['asistencias'],
      })
    },
  })
}
