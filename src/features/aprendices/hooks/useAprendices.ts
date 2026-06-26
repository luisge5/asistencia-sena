import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aprendicesService } from '../services/aprendicesService'
import type { CrearAprendiceParams } from '../services/aprendicesService'

interface BuscarAprendicesParams {
  ficha: number
  search?: string
  estado?: string
  limit?: number
  offset?: number
}

export function useBuscarAprendices(params: BuscarAprendicesParams) {
  return useQuery({
    queryKey: ['aprendices', 'buscar', params.ficha, params.search, params.estado, params.limit, params.offset],
    queryFn: async () => {
      console.log('Buscando aprendices con ficha:', params.ficha)
      const result = await aprendicesService.buscarAprendices(params)
      console.log('Resultado:', result)
      return result
    },
    enabled: !!params.ficha,
  })
}

export function useAprendice(id: string) {
  return useQuery({
    queryKey: ['aprendices', id],
    queryFn: () => aprendicesService.obtenerAprendicePorId(id),
    enabled: !!id,
  })
}

export function useContarAprendices(ficha: number) {
  return useQuery({
    queryKey: ['aprendices', 'count', ficha],
    queryFn: () => aprendicesService.contarAprendicesPorFicha(ficha),
    enabled: !!ficha,
  })
}

export function useCrearAprendice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CrearAprendiceParams) => aprendicesService.crearAprendice(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['aprendices', 'buscar', variables.ficha],
      })
      queryClient.invalidateQueries({
        queryKey: ['aprendices', 'count', variables.ficha],
      })
    },
  })
}

export function useActualizarAprendice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { id: string } & CrearAprendiceParams) =>
      aprendicesService.actualizarAprendice(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['aprendices'],
      })
    },
  })
}

export function useEliminarAprendice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => aprendicesService.eliminarAprendice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['aprendices'],
      })
    },
  })
}
