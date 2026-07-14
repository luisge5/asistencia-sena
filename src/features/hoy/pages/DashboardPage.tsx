import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/shared/stores/toastStore'
import { useRealtimeAsistencias } from '@/shared/hooks/useRealtime'
import { insforge } from '@/lib/insforge'
import type { Aprendice, Asistencia } from '@/types'

type EstadoAsistencia = 'P' | 'T' | 'J' | 'F' | null

interface UndoEntry {
  aprendizId: string
  previousEstado: EstadoAsistencia
  recordId?: string
}

const estadoLabels: Record<string, string> = {
  P: 'Presente', T: 'Tarde', J: 'Justificado',
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [aprendices, setAprendices] = useState<Aprendice[]>([])
  const [asistenciasHoy, setAsistenciasHoy] = useState<Record<string, EstadoAsistencia>>({})
  const [isLoading, setIsLoading] = useState(true)
  const undoStack = useRef<UndoEntry[]>([])

  const ficha = user?.ficha_asignada ?? 0

  useRealtimeAsistencias(ficha, async (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const asistencia = payload.new
      if (asistencia) {
        setAsistenciasHoy((prev) => ({
          ...prev,
          [asistencia.aprendiz_id]: asistencia.estado as EstadoAsistencia,
        }))
      }
    } else if (payload.eventType === 'DELETE') {
      const asistencia = payload.old
      if (asistencia) {
        setAsistenciasHoy((prev) => {
          const next = { ...prev }
          delete next[asistencia.aprendiz_id]
          return next
        })
      }
    }
  })

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
        message: `Marcado como ${estadoLabels[estado] || estado}`,
        type: 'success',
        action: {
          label: 'Deshacer',
          onClick: () => handleUndo(entry),
        },
      })
    }
  }

  const valores = Object.values(asistenciasHoy)
  const presentes = valores.filter((v) => v === 'P' || v === 'T').length
  const total = aprendices.length
  const pct = total ? Math.round((presentes / total) * 100) : 0
  const faltan = aprendices.filter((a) => !asistenciasHoy[a.id])
  const marcados = Object.entries(asistenciasHoy)
    .map(([id, estado]) => {
      const a = aprendices.find((ap) => ap.id === id)
      return a ? { ...a, estado } : null
    })
    .filter(Boolean) as (Aprendice & { estado: string })[]

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  const getTodayString = () => {
    const today = new Date()
    return today.toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  const pillColors: Record<string, string> = {
    P: 'text-state-presente bg-state-presente-bg',
    T: 'text-state-tarde bg-state-tarde-bg',
    J: 'text-state-justificado bg-state-justificado-bg',
    F: 'text-state-ausente bg-state-ausente-bg',
  }

  const pillIcons: Record<string, React.ReactNode> = {
    P: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    T: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    J: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  }

  if (isLoading) {
    return (
      <div className="px-5 pt-5 pb-6 space-y-5">
        <div className="rounded-3xl bg-primary-soft p-6 animate-pulse h-48" />
        <div className="rounded-2xl bg-surface border border-border p-6 animate-pulse h-32" />
      </div>
    )
  }

  return (
    <div className="view-enter px-5 pt-5 pb-6 space-y-5">
      <section className="hero-card rounded-3xl p-6 text-on-primary">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-primary/60">Asistencia hoy</div>
            <div className="text-on-primary/80 text-sm mt-1">{getTodayString()}</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold tracking-[-0.04em] leading-none tabular-nums">
              {presentes}<span className="text-on-primary/40 font-medium text-2xl">/{total}</span>
            </div>
            <div className="text-on-primary/60 text-xs mt-1 font-medium">{pct}% asistencia</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-on-primary/15 overflow-hidden">
          <div className="h-full bg-on-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => navigate('/scan')}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-on-primary text-primary font-semibold text-sm active:scale-[0.98] transition-transform cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z" /><path d="M20 14v3" /><path d="M17 20h4" /><path d="M14 20v1" />
            </svg>
            <span>Escanear ficha</span>
          </button>
          <button
            onClick={() => navigate('/aprendices')}
            className="h-11 px-4 rounded-xl border border-on-primary/20 text-on-primary text-sm font-medium hover:bg-on-primary/10 transition-colors cursor-pointer"
          >
            Lista
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold tracking-tight">Faltan por marcar</h2>
          <span className="text-xs text-muted-fg tabular-nums font-medium">{faltan.length} de {total}</span>
        </div>
        {faltan.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-state-presente-bg text-state-presente mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="font-semibold text-sm">Todos marcados</div>
            <div className="text-muted-fg text-xs mt-1">0 faltantes hoy</div>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface border border-border divide-y divide-border overflow-hidden">
            {faltan.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-fg">
                  {getInitials(a.nombre, a.apellido)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.nombre} {a.apellido}</div>
                  <div className="text-[11px] text-muted-fg tabular-nums">{a.ficha}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMarcar(a.id, 'P')}
                    className="w-9 h-9 rounded-lg bg-state-presente-bg text-state-presente hover:brightness-95 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    title="Presente"
                    aria-label={`Marcar a ${a.nombre} como Presente`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMarcar(a.id, 'T')}
                    className="w-9 h-9 rounded-lg bg-state-tarde-bg text-state-tarde hover:brightness-95 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    title="Tarde"
                    aria-label={`Marcar a ${a.nombre} como Tarde`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMarcar(a.id, 'J')}
                    className="w-9 h-9 rounded-lg bg-state-justificado-bg text-state-justificado hover:brightness-95 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    title="Justificado"
                    aria-label={`Marcar a ${a.nombre} como Justificado`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {marcados.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-semibold tracking-tight">Ya marcados</h2>
            <span className="text-xs text-muted-fg font-medium tabular-nums">{marcados.length}</span>
          </div>
          <div className="rounded-2xl bg-surface border border-border divide-y divide-border overflow-hidden">
            {marcados.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-fg">
                  {getInitials(item.nombre, item.apellido)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.nombre} {item.apellido}</div>
                  <div className="text-[11px] text-muted-fg tabular-nums">{item.ficha}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${pillColors[item.estado] || ''}`}>
                  {pillIcons[item.estado]}
                  <span>{estadoLabels[item.estado] || item.estado}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
