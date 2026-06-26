import { useState, useEffect, useRef } from 'react'
import { ContadorAsistencia } from '../components/ContadorAsistencia'
import { AprendizCard } from '../components/AprendizCard'
import { SkeletonList } from '../components/SkeletonCard'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/shared/stores/toastStore'
import { insforge } from '@/lib/insforge'
import type { Aprendice, Asistencia } from '@/types'

type EstadoAsistencia = 'P' | 'T' | 'J' | 'F' | null

interface UndoEntry {
  aprendizId: string
  previousEstado: EstadoAsistencia
  recordId?: string
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [aprendices, setAprendices] = useState<Aprendice[]>([])
  const [asistenciasHoy, setAsistenciasHoy] = useState<Record<string, EstadoAsistencia>>({})
  const [isLoading, setIsLoading] = useState(true)
  const undoStack = useRef<UndoEntry[]>([])

  const ficha = user?.ficha_asignada ?? 0

  const estadoLabels: Record<string, string> = {
    P: 'Presente',
    T: 'Tarde',
    J: 'Justificado',
    F: 'Falta',
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!ficha) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data: aprendicesData } = await insforge.database
        .from('aprendices')
        .select('*')
        .eq('ficha', ficha)
        .eq('estado', 'activo')
        .order('apellido')

      const today = new Date().toISOString().split('T')[0]
      const { data: asistenciasData } = await insforge.database
        .from('asistencias')
        .select('*')
        .eq('ficha', ficha)
        .eq('fecha', today)

      if (aprendicesData) {
        setAprendices(aprendicesData)
      }

      if (asistenciasData) {
        const asistenciasMap: Record<string, EstadoAsistencia> = {}
        asistenciasData.forEach((a: Asistencia) => {
          asistenciasMap[a.aprendiz_id] = a.estado as EstadoAsistencia
        })
        setAsistenciasHoy(asistenciasMap)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [ficha])

  const handleUndo = async (entry: UndoEntry) => {
    setAsistenciasHoy((prev) => ({
      ...prev,
      [entry.aprendizId]: entry.previousEstado,
    }))

    if (entry.previousEstado === null && entry.recordId) {
      await insforge.database.from('asistencias').delete().eq('id', entry.recordId)
    } else if (entry.recordId && entry.previousEstado) {
      await insforge.database
        .from('asistencias')
        .update({ estado: entry.previousEstado })
        .eq('id', entry.recordId)
    }
  }

  const handleMarcar = async (aprendizId: string, estado: EstadoAsistencia) => {
    if (!user || !ficha) return

    const previousEstado = asistenciasHoy[aprendizId] ?? null

    if (previousEstado === estado) return

    setAsistenciasHoy((prev) => ({
      ...prev,
      [aprendizId]: estado,
    }))

    if (estado) {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toLocaleTimeString('es-CO', { hour12: false })

      const { data: existing } = await insforge.database
        .from('asistencias')
        .select('id')
        .eq('aprendiz_id', aprendizId)
        .eq('fecha', today)
        .maybeSingle()

      let recordId = existing?.id

      if (existing) {
        await insforge.database
          .from('asistencias')
          .update({ estado, hora_entrada: now })
          .eq('id', existing.id)
      } else {
        const { data: newRecord } = await insforge.database
          .from('asistencias')
          .insert({
            aprendiz_id: aprendizId,
            fecha: today,
            hora_entrada: now,
            estado: estado,
            instructor_id: user.id,
            ficha: ficha,
            centro: user.centro || '',
          })
          .select()
          .single()

        recordId = newRecord?.id
      }

      const entry: UndoEntry = { aprendizId, previousEstado, recordId }
      undoStack.current.push(entry)

      addToast({
        message: `Marcado como ${estadoLabels[estado]}`,
        type: 'success',
        action: {
          label: 'Deshacer',
          onClick: () => handleUndo(entry),
        },
      })
    }
  }

  const contarEstados = () => {
    const valores = Object.values(asistenciasHoy)
    return {
      presentes: valores.filter((v) => v === 'P').length,
      tarde: valores.filter((v) => v === 'T').length,
      justificados: valores.filter((v) => v === 'J').length,
      faltantes: aprendices.length - valores.filter((v) => v !== null).length,
    }
  }

  const estados = contarEstados()

  const getTodayString = () => {
    const today = new Date()
    return today.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
          Vista de Hoy
        </h1>
        <p className="mt-1 text-[var(--color-text-light)]">
          {getTodayString()}
        </p>
      </div>

      {/* Contadores */}
      <ContadorAsistencia
        presentes={estados.presentes}
        tarde={estados.tarde}
        justificados={estados.justificados}
        faltantes={estados.faltantes}
        isLoading={isLoading}
      />

      {/* Lista de aprendices */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--color-text)]">
            Aprendices ({aprendices.length})
          </h2>
          <p className="text-sm text-[var(--color-text-light)]">
            Ficha: {ficha}
          </p>
        </div>

        {isLoading ? (
          <SkeletonList />
        ) : aprendices.length === 0 ? (
          <div
            className="rounded-2xl border-4 border-gray-200 bg-white p-8 text-center"
            style={{
              boxShadow: 'inset -2px -2px 8px rgba(0, 0, 0, 0.08), 4px 4px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <p className="text-[var(--color-text-light)]">No hay aprendices activos en esta ficha</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aprendices.map((aprendiz) => (
              <AprendizCard
                key={aprendiz.id}
                aprendiz={aprendiz}
                estadoActual={asistenciasHoy[aprendiz.id] ?? null}
                onMarcar={handleMarcar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}