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

const DEFAULT_VALUES = {
  tipo_documento: 'cc',
  ficha: 0,
  centro: '',
  estado: 'activo',
}

function splitFullName(fullName: string): { nombre: string; apellido: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { nombre: parts[0], apellido: '' }
  if (parts.length === 2) return { nombre: parts[0], apellido: parts[1] }
  const mid = Math.ceil(parts.length / 2)
  return {
    nombre: parts.slice(0, mid).join(' '),
    apellido: parts.slice(mid).join(' '),
  }
}

const ESTADO_MAP: Record<string, string> = {
  'en formacion': 'activo',
  certificado: 'graduado',
  'retiro voluntario': 'retirado',
  cancelado: 'suspendido',
  aplazado: 'suspendido',
  condicionado: 'activo',
  induccion: 'activo',
  trasladado: 'retirado',
  'por certificar': 'activo',
}

const HEADER_ALIASES: Record<string, string> = {
  aprendiz: 'aprendiz_raw',
  aprendices: 'aprendiz_raw',
  nombre: 'nombre',
  nombres: 'nombre',
  name: 'nombre',
  apellido: 'apellido',
  apellidos: 'apellido',
  documento: 'documento',
  doc: 'documento',
  documentoidentidad: 'documento',
  identificación: 'documento',
  identificacion: 'documento',
  id: 'documento',
  'n° documento': 'documento',
  'no. documento': 'documento',
  'no documento': 'documento',
  'número de documento': 'documento',
  'numero de documento': 'documento',
  tipo_documento: 'tipo_documento',
  tipo_doc: 'tipo_documento',
  tipodoc: 'tipo_documento',
  'tipo de documento': 'tipo_documento',
  ficha: 'ficha',
  grupo: 'ficha',
  centro: 'centro',
  estado: 'estado',
}

export const importService = {
  async parseExcelFile(file: File): Promise<Result<{ headers: string[], data: AprendiceImport[], missingColumns: string[] }>> {
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

      const rawHeaders = (jsonData[0] as string[]).map(h => String(h).trim())
      const headers = rawHeaders.map(h => HEADER_ALIASES[h.toLowerCase().trim()] || h.toLowerCase().trim())

      const hasDocumento = headers.some(h => h === 'documento')
      const missingColumns: string[] = []
      if (!headers.some(h => h === 'nombre' || h === 'aprendiz_raw')) missingColumns.push('nombre/apellido')
      if (!hasDocumento) missingColumns.push('documento')

      const rows = jsonData.slice(1) as unknown[][]

      const data: AprendiceImport[] = rows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map((row) => {
          const record: Record<string, unknown> = {}
          headers.forEach((header, i) => {
            record[header] = row[i]
          })

          const { nombre, apellido } = record.aprendiz_raw
            ? splitFullName(String(record.aprendiz_raw))
            : {
                nombre: String(record.nombre || '').trim(),
                apellido: String(record.apellido || '').trim(),
              }

          return {
            nombre,
            apellido,
            documento: String(record.documento || '').trim(),
            tipo_documento: String(record.tipo_documento || DEFAULT_VALUES.tipo_documento).trim().toLowerCase().replace(/^ppt$/, 'pasaporte'),
            ficha: Number(record.ficha || DEFAULT_VALUES.ficha),
            centro: String(record.centro || DEFAULT_VALUES.centro).trim(),
            estado: ESTADO_MAP[String(record.estado || '').trim().toLowerCase()] || DEFAULT_VALUES.estado,
          }
        })
        .filter(item => item.nombre && item.apellido)

      return { ok: true, data: { headers, data, missingColumns } }
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

      if (!item.documento) {
        errors.push(`Fila ${rowNum}: Falta el número de documento (requerido para generar QR)`)
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
        const mapped = ESTADO_MAP[item.estado]
        if (mapped) {
          warnings.push(`Fila ${rowNum}: Estado SENA '${item.estado}' mapeado a '${mapped}'`)
        } else {
          warnings.push(`Fila ${rowNum}: Estado no válido (${item.estado}), se usará 'activo'`)
        }
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
      estado: ['activo', 'retirado', 'graduado', 'suspendido'].includes(item.estado) ? item.estado : (ESTADO_MAP[item.estado] || 'activo'),
    }))
  },
}
