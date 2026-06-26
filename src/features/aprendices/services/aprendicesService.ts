import { insforge } from '@/lib/insforge'
import type { Result, Aprendice } from '@/types'

export interface CrearAprendiceParams {
  nombre: string
  apellido: string
  documento: string
  tipo_documento: string
  ficha: number
  centro: string
  estado?: string
}

interface ActualizarAprendiceParams extends CrearAprendiceParams {
  id: string
}

interface BuscarAprendicesParams {
  ficha: number
  search?: string
  estado?: string
  limit?: number
  offset?: number
}

export const aprendicesService = {
  async crearAprendice(params: CrearAprendiceParams): Promise<Result<Aprendice>> {
    const { data, error } = await insforge.database
      .from('aprendices')
      .insert({
        nombre: params.nombre,
        apellido: params.apellido,
        documento: params.documento,
        tipo_documento: params.tipo_documento,
        ficha: params.ficha,
        centro: params.centro,
        estado: params.estado ?? 'activo',
      })
      .select()
      .single()

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data }
  },

  async actualizarAprendice(params: ActualizarAprendiceParams): Promise<Result<Aprendice>> {
    const { id, ...updateData } = params

    const { data, error } = await insforge.database
      .from('aprendices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data }
  },

  async buscarAprendices(params: BuscarAprendicesParams): Promise<Result<Aprendice[]>> {
    let query = insforge.database
      .from('aprendices')
      .select('*')
      .eq('ficha', params.ficha)

    if (params.search) {
      query = query.or(`nombre.ilike.%${params.search}%,apellido.ilike.%${params.search}%,documento.ilike.%${params.search}%`)
    }

    if (params.estado) {
      query = query.eq('estado', params.estado)
    }

    query = query
      .order('apellido', { ascending: true })
      .order('nombre', { ascending: true })

    if (params.limit) {
      query = query.limit(params.limit)
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit ?? 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: data ?? [] }
  },

  async obtenerAprendicePorId(id: string): Promise<Result<Aprendice>> {
    const { data, error } = await insforge.database
      .from('aprendices')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data }
  },

  async eliminarAprendice(id: string): Promise<Result<void>> {
    const { error } = await insforge.database
      .from('aprendices')
      .delete()
      .eq('id', id)

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: undefined }
  },

  async contarAprendicesPorFicha(ficha: number): Promise<Result<number>> {
    const { count, error } = await insforge.database
      .from('aprendices')
      .select('*', { count: 'exact', head: true })
      .eq('ficha', ficha)
      .eq('estado', 'activo')

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: count ?? 0 }
  },

  async buscarAprendicePorDocumento(documento: string): Promise<Result<Aprendice>> {
    const { data, error } = await insforge.database
      .from('aprendices')
      .select('*')
      .eq('documento', documento)
      .single()

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data }
  },
}
