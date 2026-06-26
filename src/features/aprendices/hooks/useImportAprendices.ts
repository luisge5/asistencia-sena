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

    const { data: parsedData } = result.data
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

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const result = await aprendicesService.crearAprendice({
        nombre: item.nombre,
        apellido: item.apellido,
        documento: item.documento,
        tipo_documento: item.tipo_documento,
        ficha: item.ficha,
        centro: item.centro,
        estado: item.estado,
      })

      if (result.ok) {
        successCount++
      } else {
        errorCount++
      }

      setImportProgress(Math.round(((i + 1) / data.length) * 100))
    }

    if (errorCount === 0) {
      setImportResult({ ok: true, data: undefined })
    } else {
      setImportResult({
        ok: false,
        error: new Error(`${errorCount} registros fallaron, ${successCount} importados exitosamente`),
      })
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