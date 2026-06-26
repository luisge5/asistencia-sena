import { insforge } from '@/lib/insforge'
import type { Result, Asistencia } from '@/types'

export interface RegistrarAsistenciaParams {
  aprendiz_id: string
  fecha: string
  hora_entrada: string
  estado: 'P' | 'T' | 'J' | 'F'
  instructor_id: string
  ficha: number
  centro: string
}

interface ActualizarAsistenciaParams {
  id: string
  hora_salida?: string
  estado?: 'P' | 'T' | 'J' | 'F'
}

export const asistenciaService = {
  async registrarAsistencia(params: RegistrarAsistenciaParams): Promise<Result<Asistencia>> {
    const { data, error } = await insforge.database
      .from('asistencias')
      .insert({
        aprendiz_id: params.aprendiz_id,
        fecha: params.fecha,
        hora_entrada: params.hora_entrada,
        estado: params.estado,
        instructor_id: params.instructor_id,
        ficha: params.ficha,
        centro: params.centro,
      })
      .select()
      .single()

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data }
  },

  async actualizarAsistencia(params: ActualizarAsistenciaParams): Promise<Result<Asistencia>> {
    const updateData: Record<string, unknown> = {}
    
    if (params.hora_salida !== undefined) {
      updateData.hora_salida = params.hora_salida
    }
    if (params.estado !== undefined) {
      updateData.estado = params.estado
    }

    const { data, error } = await insforge.database
      .from('asistencias')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data }
  },

  async obtenerAsistenciasHoy(ficha: number, fecha: string): Promise<Result<Asistencia[]>> {
    const { data, error } = await insforge.database
      .from('asistencias')
      .select('*')
      .eq('ficha', ficha)
      .eq('fecha', fecha)
      .order('created_at', { ascending: false })

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: data ?? [] }
  },

  async obtenerAsistenciasPorAprendiz(aprendiz_id: string): Promise<Result<Asistencia[]>> {
    const { data, error } = await insforge.database
      .from('asistencias')
      .select('*')
      .eq('aprendiz_id', aprendiz_id)
      .order('fecha', { ascending: false })
      .limit(30)

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: data ?? [] }
  },

  async eliminarAsistencia(id: string): Promise<Result<void>> {
    const { error } = await insforge.database
      .from('asistencias')
      .delete()
      .eq('id', id)

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: undefined }
  },

  async obtenerHistorial(ficha: number, fechaInicio: string, fechaFin: string): Promise<Result<Asistencia[]>> {
    const { data, error } = await insforge.database
      .from('asistencias')
      .select('*')
      .eq('ficha', ficha)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: data ?? [] }
  },
}
