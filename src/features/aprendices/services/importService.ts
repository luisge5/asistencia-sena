import * as XLSX from 'xlsx'
import type { Result } from '@/types'

export interface AprendiceImport {
  nombre: string
  apellido: string
  documento: string
  tipo_documento: string
  ficha: number
  centro: string
  estado: string
}

interface ImportValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

const DEFAULT_VALUES: Partial<AprendiceImport> = {
  tipo_documento: 'cc',
  ficha: 0,
  centro: '',
  estado: 'activo',
}

export const importService = {
  async parseExcelFile(file: File): Promise<Result<{ headers: string[], data: AprendiceImport[] }>> {
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!firstSheet) {
        return { ok: false, error: new Error('El archivo no contiene hojas de cálculo') }
      }

      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
      if (jsonData.length < 2) {
        return { ok: false, error: new Error('El archivo está vacío o no tiene datos') }
      }

      const headers = (jsonData[0] as string[]).map(h => String(h).toLowerCase().trim())
      const rows = jsonData.slice(1) as unknown[][]

      const data: AprendiceImport[] = rows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row) => {
          const record: Record<string, unknown> = {}
          headers.forEach((header, i) => {
            record[header] = row[i]
          })

          return {
            nombre: String(record.nombre || '').trim(),
            apellido: String(record.apellido || '').trim(),
            documento: String(record.documento || record.doc || '').trim(),
            tipo_documento: String(record.tipo_documento || record.tipo_doc || DEFAULT_VALUES.tipo_documento).trim().toLowerCase(),
            ficha: Number(record.ficha || DEFAULT_VALUES.ficha),
            centro: String(record.centro || DEFAULT_VALUES.centro).trim(),
            estado: String(record.estado || DEFAULT_VALUES.estado).trim().toLowerCase(),
          }
        })
        .filter(item => item.nombre && item.apellido && item.documento)

      return { ok: true, data: { headers, data } }
    } catch (error) {
      return { ok: false, error: error as Error }
    }
  },

  validateData(data: AprendiceImport[]): ImportValidation {
    const errors: string[] = []
    const warnings: string[] = []
    const documentosVistos = new Set<string>()

    data.forEach((item, index) => {
      const rowNum = index + 2

      if (!item.nombre) {
        errors.push(`Fila ${rowNum}: Falta el campo 'nombre'`)
      }
      if (!item.apellido) {
        errors.push(`Fila ${rowNum}: Falta el campo 'apellido'`)
      }
      if (!item.documento) {
        errors.push(`Fila ${rowNum}: Falta el campo 'documento'`)
      }

      if (item.documento) {
        if (documentosVistos.has(item.documento)) {
          warnings.push(`Fila ${rowNum}: Documento duplicado (${item.documento})`)
        }
        documentosVistos.add(item.documento)
      }

      if (item.tipo_documento && !['cc', 'ti', 'ce', 'pasaporte'].includes(item.tipo_documento)) {
        warnings.push(`Fila ${rowNum}: Tipo de documento no válido (${item.tipo_documento}), se usará 'cc'`)
      }

      if (item.ficha && (isNaN(item.ficha) || item.ficha <= 0)) {
        warnings.push(`Fila ${rowNum}: Ficha no válida (${item.ficha}), se usará 0`)
      }

      if (item.estado && !['activo', 'retirado', 'graduado', 'suspendido'].includes(item.estado)) {
        warnings.push(`Fila ${rowNum}: Estado no válido (${item.estado}), se usará 'activo'`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  },

  normalizeData(data: AprendiceImport[]): AprendiceImport[] {
    return data.map(item => ({
      nombre: item.nombre.trim(),
      apellido: item.apellido.trim(),
      documento: item.documento.trim(),
      tipo_documento: ['cc', 'ti', 'ce', 'pasaporte'].includes(item.tipo_documento) ? item.tipo_documento : 'cc',
      ficha: isNaN(item.ficha) || item.ficha <= 0 ? 0 : item.ficha,
      centro: item.centro.trim(),
      estado: ['activo', 'retirado', 'graduado', 'suspendido'].includes(item.estado) ? item.estado : 'activo',
    }))
  },
}