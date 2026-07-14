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

interface ImportarAprendicesParams {
  nombre: string
  apellido: string
  documento: string
  tipo_documento: string
  ficha: number
  estado: string
}

export const aprendicesService = {
  async importarAprendices(items: ImportarAprendicesParams[]): Promise<Result<{ success: number; skipped: number; errors: number }>> {
    let allExisting: string[] = []
    let offset = 0
    const PAGE = 1000

    while (true) {
      const { data, error } = await insforge.database
        .from('aprendices')
        .select('documento')
        .range(offset, offset + PAGE - 1)

      if (error) return { ok: false, error }
      if (!data || data.length === 0) break

      allExisting = allExisting.concat(data.map(d => d.documento))
      offset += PAGE
      if (data.length < PAGE) break
    }

    const existingSet = new Set(allExisting)
    const newItems = items.filter(item => !existingSet.has(item.documento))
    const skipped = items.length - newItems.length

    let success = 0
    let errors = 0
    const BATCH_SIZE = 100

    for (let i = 0; i < newItems.length; i += BATCH_SIZE) {
      const batch = newItems.slice(i, i + BATCH_SIZE)
      const { error } = await insforge.database
        .from('aprendices')
        .insert(batch)
        .select()

      if (error) {
        errors += batch.length
      } else {
        success += batch.length
      }
    }

    return { ok: true, data: { success, skipped, errors } }
  },

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
