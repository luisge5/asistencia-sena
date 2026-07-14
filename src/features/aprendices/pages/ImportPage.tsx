import { useRef } from 'react'
import { useImportAprendices } from '../hooks/useImportAprendices'

export function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
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
  } = useImportAprendices()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="fade-in mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-8 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Importar Aprendices
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Importa aprendices desde un archivo Excel
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
          file
            ? 'border-primary/30 bg-muted/50'
            : 'border-slate-200 bg-slate-50 hover:border-primary/30 hover:bg-muted/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:h-14 sm:w-14">
              <svg className="h-6 w-6 text-primary sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="truncate">
              <p className="text-base font-semibold text-slate-900 sm:text-lg">
                {file.name}
              </p>
              <p className="text-sm text-slate-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                onClick={parseFile}
                disabled={isLoading}
                className="w-full cursor-pointer rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isLoading ? 'Procesando...' : 'Procesar Archivo'}
              </button>
              <button
                onClick={() => {
                  setFile(null)
                  clearResult()
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
              >
                Cambiar Archivo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 sm:h-14 sm:w-14">
              <svg className="h-6 w-6 text-slate-400 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 sm:text-lg">
                Arrastra un archivo aquí
              </p>
              <p className="text-sm text-slate-500">
                o haz clic para seleccionar
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full cursor-pointer rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-soft sm:w-auto"
            >
              Seleccionar Archivo
            </button>
            <p className="text-xs text-slate-400">
              .xlsx, .xls, .csv
            </p>
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h4 className="text-sm font-semibold text-red-700">
            Errores de validación
          </h4>
          <ul className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-xs text-red-600">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="text-sm font-semibold text-amber-700">
            Advertencias
          </h4>
          <ul className="mt-2 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-xs text-amber-600">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Preview */}
      {data.length > 0 && !importResult && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Vista previa
              </h4>
              <p className="text-xs text-slate-500">
                {data.length} aprendices encontrados
              </p>
            </div>
            <button
              onClick={importData}
              disabled={isImporting}
              className="w-full cursor-pointer rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isImporting ? `Importando... ${importProgress}%` : 'Importar Todos'}
            </button>
          </div>

          {/* Preview Table */}
          <div className="mt-4 -mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="whitespace-nowrap pb-2 pr-3 font-semibold text-slate-900">Nombre</th>
                  <th className="whitespace-nowrap pb-2 pr-3 font-semibold text-slate-900">Apellido</th>
                  <th className="whitespace-nowrap pb-2 pr-3 font-semibold text-slate-900">Documento</th>
                  <th className="whitespace-nowrap pb-2 font-semibold text-slate-900">Ficha</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((item, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="whitespace-nowrap py-2 pr-3 text-slate-900">{item.nombre}</td>
                    <td className="whitespace-nowrap py-2 pr-3 text-slate-900">{item.apellido}</td>
                    <td className="whitespace-nowrap py-2 pr-3 text-slate-900">{item.documento}</td>
                    <td className="whitespace-nowrap py-2 text-slate-900">{item.ficha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <p className="mt-2 text-center text-xs text-slate-500">
                ... y {data.length - 5} más
              </p>
            )}
          </div>

          {/* Import Progress */}
          {isImporting && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div
          className={`rounded-xl border p-4 sm:p-5 ${
            importResult.ok
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <svg
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${importResult.ok ? 'text-green-600' : 'text-red-600'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {importResult.ok ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </>
              )}
            </svg>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900">
                {importResult.ok ? 'Importación exitosa' : 'Error en la importación'}
              </h4>
              <p className="break-words text-xs text-slate-500">
                {importResult.ok
                  ? (importResult.data as unknown as string)
                  : importResult.error?.message}
              </p>
            </div>
          </div>
          <button
            onClick={clearResult}
            className="mt-4 w-full cursor-pointer rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-soft"
          >
            Importar Otro Archivo
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h4 className="text-sm font-semibold text-slate-900">
          Formato del archivo
        </h4>
        <ul className="mt-2 space-y-1 text-xs text-slate-500">
          <li>• Requeridas: <strong>nombre</strong>, <strong>apellido</strong>, <strong>documento</strong></li>
          <li>• Opcionales: tipo_documento (cc/ti/ce/pasaporte), ficha, centro, estado</li>
          <li>• La primera fila debe tener los encabezados</li>
          <li>• Duplicados por documento se omiten automáticamente</li>
          <li>• Formatos: .xlsx, .xls, .csv</li>
        </ul>
      </div>
    </div>
  )
}