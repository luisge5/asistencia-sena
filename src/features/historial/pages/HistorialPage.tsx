import { useState } from 'react'
import { useHistorial } from '../hooks/useHistorial'
import { useBuscarAprendices } from '@/features/aprendices/hooks/useAprendices'
import { useAuthStore } from '@/stores/authStore'

export function HistorialPage() {
  const { user } = useAuthStore()
  const ficha = user?.ficha_asignada ?? 0

  const {
    asistencias,
    isLoading,
    error,
    filters,
    setFilters,
    exportToCSV,
  } = useHistorial()

  const { data: aprendicesResult } = useBuscarAprendices({ ficha })
  const aprendices = aprendicesResult?.ok ? aprendicesResult.data : []

  const [sortBy, setSortBy] = useState<'riesgo' | 'asistencia' | 'racha'>('riesgo')

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  const computeLearnerStats = (aprendizId: string) => {
    const records = asistencias.filter(a => a.aprendiz_id === aprendizId)
    const total = records.length
    const presente = records.filter(r => r.estado === 'P').length
    const tarde = records.filter(r => r.estado === 'T').length
    const justificado = records.filter(r => r.estado === 'J').length
    const ausente = records.filter(r => r.estado === 'F').length
    const asistio = presente + tarde
    const dias_validos = total - justificado
    const pct = dias_validos > 0 ? Math.round((asistio / dias_validos) * 100) : 100

    let rachaAusente = 0
    for (let i = records.length - 1; i >= 0; i--) {
      if (records[i].estado === 'F') rachaAusente++
      else break
    }

    const ausenciasDiscontinuas = ausente - rachaAusente
    const enRiesgo = pct < 80 || rachaAusente >= 3

    return { total, presente, tarde, justificado, ausente, pct, rachaAusente, ausenciasDiscontinuas, enRiesgo, dias_validos, asistio }
  }

  let lista = aprendices.map(a => ({
    ...a,
    stats: computeLearnerStats(a.id),
  }))

  if (sortBy === 'riesgo') lista.sort((x, y) => (y.stats.rachaAusente - x.stats.rachaAusente) || (x.stats.pct - y.stats.pct))
  if (sortBy === 'asistencia') lista.sort((x, y) => y.stats.pct - x.stats.pct)
  if (sortBy === 'racha') lista.sort((x, y) => y.stats.rachaAusente - x.stats.rachaAusente)

  const enRiesgo = lista.filter(a => a.stats.enRiesgo).sort(
    (x, y) => y.stats.rachaAusente - x.stats.rachaAusente || x.stats.pct - y.stats.pct
  )

  const pctPromedio = lista.length
    ? Math.round(lista.reduce((s, x) => s + x.stats.pct, 0) / lista.length)
    : 0

  const groupStats = {
    pct_promedio: pctPromedio,
    en_riesgo: enRiesgo.length,
    total_ausencias: lista.reduce((s, x) => s + x.stats.ausente, 0),
    total_tardes: lista.reduce((s, x) => s + x.stats.tarde, 0),
    perfectos: lista.filter(x => x.stats.pct === 100).length,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    const diasSemana = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    const dia = diasSemana[date.getDay()]
    return `${dia} · ${date.getDate()} ${date.toLocaleDateString('es-CO', { month: 'short' })}`
  }

  const sessionStats = () => {
    const byDate: Record<string, { P: number; T: number; J: number; F: number }> = {}
    asistencias.forEach(a => {
      if (!byDate[a.fecha]) byDate[a.fecha] = { P: 0, T: 0, J: 0, F: 0 }
      if (byDate[a.fecha][a.estado as keyof typeof byDate[string]] !== undefined) {
        byDate[a.fecha][a.estado as keyof typeof byDate[string]]++
      }
    })
    return Object.entries(byDate)
      .map(([fecha, stats]) => ({
        fecha,
        label: formatDate(fecha),
        ...stats,
        total: stats.P + stats.T + stats.J + stats.F,
      }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 5)
  }

  const sessions = sessionStats()

  if (isLoading) {
    return (
      <div className="px-5 pt-5 pb-6 space-y-5">
        <div className="rounded-3xl bg-surface border border-border p-5 animate-pulse h-40" />
        <div className="rounded-2xl bg-surface border border-border p-5 animate-pulse h-32" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-5 pt-5 pb-6">
        <div className="rounded-lg bg-state-ausente-bg text-state-ausente text-sm p-4">{error}</div>
      </div>
    )
  }

  return (
    <div className="view-enter px-5 pt-5 pb-6 space-y-5">
      <section className="rounded-3xl bg-surface border border-border p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-fg">Asistencia del grupo</div>
            <div className="flex items-end gap-2 mt-2">
              <div className="text-5xl font-bold tracking-[-0.04em] leading-none tabular-nums">
                {groupStats.pct_promedio}<span className="text-muted-fg/40 text-2xl font-medium">%</span>
              </div>
            </div>
            <div className="text-xs text-muted-fg mt-1.5">últimos {filters.fechaInicio} a {filters.fechaFin}</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-5">
          <div>
            <div className="text-xl font-bold tabular-nums">{groupStats.en_riesgo}</div>
            <div className="text-[10px] text-muted-fg leading-tight">en riesgo</div>
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums">{groupStats.total_ausencias}</div>
            <div className="text-[10px] text-muted-fg leading-tight">ausencias</div>
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums">{groupStats.total_tardes}</div>
            <div className="text-[10px] text-muted-fg leading-tight">tardes</div>
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-state-presente">{groupStats.perfectos}</div>
            <div className="text-[10px] text-muted-fg leading-tight">perfectos</div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-fg">Filtrar por fecha</h3>
        <button
          onClick={exportToCSV}
          disabled={asistencias.length === 0}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-soft transition-colors disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>CSV</span>
        </button>
      </div>
      <div className="flex gap-3">
        <input
          type="date"
          value={filters.fechaInicio}
          onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
          className="flex-1 h-10 rounded-xl bg-surface border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
        <input
          type="date"
          value={filters.fechaFin}
          onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
          className="flex-1 h-10 rounded-xl bg-surface border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {enRiesgo.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 className="text-base font-semibold tracking-tight">Atención requerida · {enRiesgo.length}</h2>
          </div>
          <div className="space-y-2">
            {enRiesgo.slice(0, 3).map((a) => (
              <div key={a.id} className="relative rounded-2xl bg-surface border border-state-ausente/30 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-state-ausente" />
                <div className="p-4 pl-5 flex items-center gap-3">
                  <div className="shrink-0 w-11 h-11 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-fg">
                    {getInitials(a.nombre, a.apellido)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{a.nombre} {a.apellido}</div>
                    <div className="text-[11px] text-muted-fg tabular-nums mt-0.5">{a.ficha}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold tabular-nums ${a.stats.pct < 80 ? 'text-state-ausente' : 'text-state-tarde'}`}>
                      {a.stats.pct}%
                    </div>
                    <div className="text-[10px] text-muted-fg">asistencia</div>
                  </div>
                </div>
                <div className="px-4 pl-5 pb-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className={`rounded-lg py-1.5 ${a.stats.rachaAusente > 0 ? 'bg-state-ausente-bg text-state-ausente font-semibold' : 'bg-muted/60 text-muted-fg'}`}>
                    <div className="tabular-nums text-sm leading-none">{a.stats.rachaAusente || '—'}</div>
                    <div className="text-[9px] uppercase tracking-wider mt-0.5 font-medium">consec</div>
                  </div>
                  <div className="rounded-lg bg-muted/60 text-muted-fg py-1.5">
                    <div className="tabular-nums text-sm leading-none font-semibold text-foreground">{a.stats.ausenciasDiscontinuas || '—'}</div>
                    <div className="text-[9px] uppercase tracking-wider mt-0.5 font-medium">discontinuas</div>
                  </div>
                  <div className="rounded-lg bg-muted/60 text-muted-fg py-1.5">
                    <div className="tabular-nums text-sm leading-none font-semibold text-foreground">{a.stats.tarde}</div>
                    <div className="text-[9px] uppercase tracking-wider mt-0.5 font-medium">tardes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold tracking-tight">Detalle por aprendiz</h2>
          <div className="flex items-center gap-1 text-[11px]">
            {(['riesgo', 'asistencia', 'racha'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  sortBy === key ? 'bg-primary text-on-primary' : 'text-muted-fg hover:bg-muted'
                }`}
              >
                {key === 'riesgo' ? 'riesgo' : key === 'asistencia' ? '% asist' : 'racha'}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-surface border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-3 px-4 py-2 bg-muted/40 border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-fg">
            <div>Aprendiz</div>
            <div className="text-right w-12">Asist</div>
            <div className="text-right w-10">Cons</div>
            <div className="text-right w-10">Disc</div>
          </div>
          <div className="divide-y divide-border">
            {lista.map((a) => {
              const s = a.stats
              const pctColor = s.pct === 100 ? 'text-state-presente' : s.pct < 80 ? 'text-state-ausente' : 'text-foreground'
              return (
                <div key={a.id} className="grid grid-cols-[1fr,auto,auto,auto] gap-3 px-4 py-2.5 items-center hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-fg">
                      {getInitials(a.nombre, a.apellido)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate leading-tight">{a.nombre} {a.apellido}</div>
                      <div className="text-[10px] text-muted-fg tabular-nums leading-tight">{a.ficha}</div>
                    </div>
                  </div>
                  <div className={`text-right w-12 tabular-nums text-[13px] font-semibold ${pctColor}`}>{s.pct}%</div>
                  <div className={`text-right w-10 tabular-nums text-[13px] ${s.rachaAusente >= 3 ? 'text-state-ausente font-semibold' : s.rachaAusente > 0 ? 'text-state-tarde font-medium' : 'text-muted-fg/50'}`}>
                    {s.rachaAusente || '—'}
                  </div>
                  <div className={`text-right w-10 tabular-nums text-[13px] ${s.ausenciasDiscontinuas > 0 ? 'text-foreground font-medium' : 'text-muted-fg/50'}`}>
                    {s.ausenciasDiscontinuas || '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="text-[10px] text-muted-fg mt-2 px-1 leading-relaxed">
          <span className="font-medium text-foreground">Cons</span> = días consecutivos faltando hasta hoy ·
          <span className="font-medium text-foreground"> Disc</span> = ausencias discontinuas en el periodo
        </div>
      </section>

      {sessions.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-semibold tracking-tight">Sesiones recientes</h2>
          </div>
          <div className="rounded-2xl bg-surface border border-border divide-y divide-border overflow-hidden">
            {sessions.map((s) => {
              const pct = s.total ? Math.round(((s.P + s.T) / s.total) * 100) : 0
              return (
                <div key={s.fecha} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{s.label}</div>
                    <div className="text-[10px] text-muted-fg mt-0.5 tabular-nums">
                      {s.P}P · {s.T}T · {s.J}J · {s.F}A
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums">{isNaN(pct) ? 0 : pct}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {asistencias.length === 0 && (
        <div className="text-center text-muted-fg text-sm py-10">
          No hay registros de asistencia en el período seleccionado
        </div>
      )}
    </div>
  )
}
