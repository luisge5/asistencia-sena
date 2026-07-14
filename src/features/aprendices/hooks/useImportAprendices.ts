import { useState } from 'react'
import { importService, type AprendiceImport } from '../services/importService'
import { aprendicesService } from '../services/aprendicesService'
import type { Result } from '@/types'

interface UseImportAprendicesResult {
  file: File | null
  data: AprendiceImport[]
  errors: string[]
  warnings: string[]
  isLoading: boolean
  isImporting: boolean
  importProgress: number
  importResult: Result<void> | null
  setFile: (file: File | null) => void
  parseFile: () => Promise<void>
  importData: () => Promise<void>
  clearResult: () => void
}

export function useImportAprendices(): UseImportAprendicesResult {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<AprendiceImport[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<Result<void> | null>(null)

  const parseFile = async () => {
    if (!file) return

    setIsLoading(true)
    setErrors([])
    setWarnings([])
    setData([])

    const result = await importService.parseExcelFile(file)

    if (!result.ok) {
      setErrors([result.error.message])
      setIsLoading(false)
      return
    }

    const { data: parsedData, missingColumns } = result.data

    if (missingColumns.length > 0) {
      setErrors([`Columnas requeridas no encontradas en el archivo: ${missingColumns.join(', ')}. Verifica los encabezados.`])
      setIsLoading(false)
      return
    }

    const validation = importService.validateData(parsedData)

    setErrors(validation.errors)
    setWarnings(validation.warnings)

    if (validation.isValid) {
      const normalizedData = importService.normalizeData(parsedData)
      setData(normalizedData)
    }

    setIsLoading(false)
  }

  const importData = async () => {
    if (data.length === 0) return

    setIsImporting(true)
    setImportProgress(0)
    setImportResult(null)

    const items = data.map(item => ({
      nombre: item.nombre,
      apellido: item.apellido,
      documento: item.documento,
      tipo_documento: item.tipo_documento,
      ficha: item.ficha,
      estado: item.estado,
    }))

    const result = await aprendicesService.importarAprendices(items)

    setImportProgress(100)

    if (result.ok) {
      const { success, skipped } = result.data
      const msg = skipped > 0
        ? `${success} importados, ${skipped} duplicados omitidos`
        : `${data.length} aprendices importados correctamente`
      setImportResult({ ok: true, data: msg as unknown as void })
    } else {
      setImportResult(result)
    }

    setIsImporting(false)
  }

  const clearResult = () => {
    setFile(null)
    setData([])
    setErrors([])
    setWarnings([])
    setImportResult(null)
    setImportProgress(0)
  }

  return {
    file,
    data,
    errors,
    warnings,
    isLoading,
    isImporting,
    importProgress,
    importResult,
    setFile,
    parseFile,
    importData,
    clearResult,
  }
}