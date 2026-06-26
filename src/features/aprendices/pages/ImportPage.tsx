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
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          Importar Aprendices
        </h1>
        <p className="mt-1 text-[var(--color-text-light)]">
          Importa masivamente aprendices desde un archivo Excel
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`rounded-2xl border-3 border-dashed p-8 text-center transition-colors ${
          file
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : 'border-gray-300 bg-gray-50 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
        }`}
        style={{ borderWidth: '3px' }}
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <span className="text-3xl">📄</span>
            </div>
            <div>
              <p className="font-[var(--font-heading)] text-lg font-semibold text-[var(--color-text)]">
                {file.name}
              </p>
              <p className="text-sm text-[var(--color-text-light)]">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={parseFile}
                disabled={isLoading}
                className="cursor-pointer rounded-xl border-3 border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-2 font-[var(--font-heading)] text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ borderWidth: '3px' }}
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
                className="cursor-pointer rounded-xl border-3 border-gray-300 bg-white px-6 py-2 font-[var(--font-heading)] text-sm font-bold text-[var(--color-text-light)] shadow-md transition-all hover:border-gray-400 hover:shadow-lg active:scale-95"
                style={{ borderWidth: '3px' }}
              >
                Cambiar Archivo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <span className="text-3xl">📁</span>
            </div>
            <div>
              <p className="font-[var(--font-heading)] text-lg font-semibold text-[var(--color-text)]">
                Arrastra un archivo Excel aquí
              </p>
              <p className="text-sm text-[var(--color-text-light)]">
                o haz clic para seleccionar
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-3 border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-2 font-[var(--font-heading)] text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-95"
              style={{ borderWidth: '3px' }}
            >
              Seleccionar Archivo
            </button>
            <p className="text-xs text-[var(--color-text-light)]">
              Formatos soportados: .xlsx, .xls, .csv
            </p>
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-2xl border-3 border-red-200 bg-red-50 p-4" style={{ borderWidth: '3px' }}>
          <h4 className="font-[var(--font-heading)] text-sm font-bold text-red-700">
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
        <div className="rounded-2xl border-3 border-yellow-200 bg-yellow-50 p-4" style={{ borderWidth: '3px' }}>
          <h4 className="font-[var(--font-heading)] text-sm font-bold text-yellow-700">
            Advertencias
          </h4>
          <ul className="mt-2 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-xs text-yellow-600">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Preview */}
      {data.length > 0 && !importResult && (
        <div className="rounded-2xl border-3 border-[var(--color-primary)] bg-white p-4" style={{ borderWidth: '3px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-[var(--font-heading)] text-sm font-bold text-[var(--color-text)]">
                Vista previa
              </h4>
              <p className="text-xs text-[var(--color-text-light)]">
                {data.length} aprendices encontrados
              </p>
            </div>
            <button
              onClick={importData}
              disabled={isImporting}
              className="cursor-pointer rounded-xl border-3 border-green-500 bg-green-500 px-6 py-2 font-[var(--font-heading)] text-sm font-bold text-white shadow-md transition-all hover:bg-green-600 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderWidth: '3px' }}
            >
              {isImporting ? `Importando... ${importProgress}%` : 'Importar Todos'}
            </button>
          </div>

          {/* Preview Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 font-semibold text-[var(--color-text)]">Nombre</th>
                  <th className="pb-2 font-semibold text-[var(--color-text)]">Apellido</th>
                  <th className="pb-2 font-semibold text-[var(--color-text)]">Documento</th>
                  <th className="pb-2 font-semibold text-[var(--color-text)]">Ficha</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 text-[var(--color-text)]">{item.nombre}</td>
                    <td className="py-2 text-[var(--color-text)]">{item.apellido}</td>
                    <td className="py-2 text-[var(--color-text)]">{item.documento}</td>
                    <td className="py-2 text-[var(--color-text)]">{item.ficha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <p className="mt-2 text-center text-xs text-[var(--color-text-light)]">
                ... y {data.length - 5} más
              </p>
            )}
          </div>

          {/* Import Progress */}
          {isImporting && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
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
          className={`rounded-2xl border-3 p-4 ${
            importResult.ok
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
          style={{ borderWidth: '3px' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {importResult.ok ? '✓' : '✗'}
            </span>
            <div>
              <h4 className="font-[var(--font-heading)] text-sm font-bold text-[var(--color-text)]">
                {importResult.ok ? 'Importación exitosa' : 'Error en la importación'}
              </h4>
              <p className="text-xs text-[var(--color-text-light)]">
                {importResult.ok
                  ? `${data.length} aprendices importados correctamente`
                  : importResult.error?.message}
              </p>
            </div>
          </div>
          <button
            onClick={clearResult}
            className="mt-4 cursor-pointer rounded-xl border-3 border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-2 font-[var(--font-heading)] text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-95"
            style={{ borderWidth: '3px' }}
          >
            Importar Otro Archivo
          </button>
        </div>
      )}

      {/* Instructions */}
      <div
        className="rounded-2xl border-3 border-[var(--color-info)] bg-blue-50 p-4"
        style={{ borderWidth: '3px' }}
      >
        <h4 className="font-[var(--font-heading)] text-sm font-bold text-[var(--color-text)]">
          Formato del archivo
        </h4>
        <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-light)]">
          <li>• Columnas requeridas: <strong>nombre</strong>, <strong>apellido</strong>, <strong>documento</strong></li>
          <li>• Columnas opcionales: tipo_documento (cc/ti/ce/pasaporte), ficha, centro, estado</li>
          <li>• La primera fila debe contener los encabezados</li>
          <li>• Los documentos duplicados se marcarán como advertencia</li>
          <li>• Formatos soportados: .xlsx, .xls, .csv</li>
        </ul>
      </div>
    </div>
  )
}