"use client"

/**
 * Informe Gerencial ejecutivo — diseño print-friendly para enviar al cliente.
 * Secciones: portada/resumen, KPIs, estado de flota, proyectos con mini-Gantt,
 * fallas por sistema, próximos mantenimientos, pie corporativo IMECOL.
 */

import React from 'react'
import Link from 'next/link'
import {
  Printer, ArrowLeft, Gauge, Timer, CheckCircle2, AlertTriangle,
  Tractor, CalendarClock, Wrench, FileBarChart,
} from 'lucide-react'
import type { ReliabilityKpis, MachineFailureRanking, SystemFailureRanking } from '@/modules/M11_reliability/actions'

interface ProjectTask {
  id: string; name: string; progress: number; status: string
  startDate: string | null; endDate: string | null
}
interface Project {
  id: string; number: string; title: string; status: string
  scheduledDate: string | null; dueDate: string | null
  asset: { name: string; internalCode: string | null } | null
  tasks: ProjectTask[]
}

interface Props {
  client: { id: string; name: string; city: string | null; department: string | null; contactName: string | null; phone: string | null }
  kpis: ReliabilityKpis
  machines: MachineFailureRanking[]
  systems: SystemFailureRanking[]
  upcoming: Array<{
    id: string; title: string; system: string | null; intervalLabel: string | null
    dueHours: number | null; status: string; hoursRemaining: number
    assetName: string; internalCode: string | null; currentHours: number
  }>
  assets: Array<{
    id: string; name: string; internalCode: string | null; currentHours: number
    operativeStatus: string; criticality: string; model: { name: string } | null
  }>
  projects: Project[]
  generatedAt: string
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  operative:      { label: 'Operativo',       cls: 'bg-emerald-50 text-emerald-700' },
  maintenance:    { label: 'En Mantenimiento', cls: 'bg-amber-50 text-amber-700' },
  out_of_service: { label: 'Fuera de Servicio', cls: 'bg-rose-50 text-rose-700' },
  warranty:       { label: 'En Garantía',      cls: 'bg-blue-50 text-blue-700' },
  diagnosis:      { label: 'En Diagnóstico',   cls: 'bg-violet-50 text-violet-700' },
  pending_parts:  { label: 'Espera Repuestos', cls: 'bg-orange-50 text-orange-700' },
  retired:        { label: 'Dado de Baja',     cls: 'bg-slate-100 text-slate-500' },
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Mini Gantt: barras de progreso por tarea con escala temporal relativa */
function MiniGantt({ tasks }: { tasks: ProjectTask[] }) {
  const dated = tasks.filter(t => t.startDate && t.endDate)
  if (!dated.length) {
    // Fallback sin fechas: solo barras de progreso
    return (
      <div className="flex flex-col gap-1.5">
        {tasks.slice(0, 6).map(t => (
          <div key={t.id} className="flex items-center gap-2">
            <span className="w-44 truncate text-[10px] font-medium text-slate-500">{t.name}</span>
            <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${t.progress === 100 ? 'bg-emerald-500' : t.progress > 0 ? 'bg-blue-500' : 'bg-slate-300'}`}
                style={{ width: `${Math.max(t.progress, 2)}%` }}
              />
            </div>
            <span className="w-9 text-right text-[10px] font-bold num text-slate-600">{t.progress}%</span>
          </div>
        ))}
      </div>
    )
  }

  const min = Math.min(...dated.map(t => new Date(t.startDate!).getTime()))
  const max = Math.max(...dated.map(t => new Date(t.endDate!).getTime()))
  const span = Math.max(max - min, 1)
  const today = Date.now()
  const todayPct = today >= min && today <= max ? ((today - min) / span) * 100 : null

  return (
    <div className="relative flex flex-col gap-1.5">
      {todayPct !== null && (
        <div className="absolute top-0 bottom-0 w-px bg-blue-500 z-10" style={{ left: `calc(11rem + (100% - 11rem - 2.25rem) * ${todayPct / 100})` }} />
      )}
      {dated.slice(0, 8).map(t => {
        const s = new Date(t.startDate!).getTime()
        const e = new Date(t.endDate!).getTime()
        const left = ((s - min) / span) * 100
        const width = Math.max(((e - s) / span) * 100, 3)
        const isLate = t.progress < 100 && e < today
        return (
          <div key={t.id} className="flex items-center gap-2">
            <span className="w-44 truncate text-[10px] font-medium text-slate-500 shrink-0">{t.name}</span>
            <div className="relative flex-1 h-3.5 rounded bg-slate-50">
              <div
                className={`absolute top-0 h-full rounded ${
                  t.progress === 100 ? 'bg-emerald-400' : isLate ? 'bg-rose-400' : t.progress > 0 ? 'bg-blue-400' : 'bg-slate-300'
                }`}
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <div className="h-full rounded bg-black/15" style={{ width: `${100 - t.progress}%`, marginLeft: `${t.progress}%` }} />
              </div>
            </div>
            <span className="w-9 text-right text-[10px] font-bold num text-slate-600 shrink-0">{t.progress}%</span>
          </div>
        )
      })}
    </div>
  )
}

export function ManagerialReport({ client, kpis, machines, systems, upcoming, assets, projects, generatedAt }: Props) {
  const operative = assets.filter(a => a.operativeStatus === 'operative').length
  const fleetAvailability = assets.length ? Math.round((operative / assets.length) * 100) : 100
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.tasks.length ? p.tasks.reduce((x, t) => x + t.progress, 0) / p.tasks.length : 0), 0) / projects.length)
    : 0

  return (
    <div className="animate-fade-in max-w-5xl mx-auto print:max-w-none">

      {/* Toolbar — oculta al imprimir */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/informes" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a informes
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-[13px] font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.97]"
        >
          <Printer className="h-3.5 w-3.5" /> Imprimir / Exportar PDF
        </button>
      </div>

      {/* ─── Encabezado del informe ─── */}
      <div className="rounded-2xl overflow-hidden mb-6 shadow-card print:shadow-none print:rounded-none">
        <div className="gradient-brand px-8 py-7 text-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-200 mb-1">Informe Gerencial de Mantenimiento</p>
              <h1 className="text-2xl font-extrabold tracking-tight">{client.name}</h1>
              <p className="text-[12px] text-blue-100 font-medium mt-1">
                {client.city || ''}{client.department ? `, ${client.department}` : ''} · Contacto: {client.contactName || '—'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30">
                  <Tractor className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-[15px]">IMECOL S.A.S.</span>
              </div>
              <p className="text-[10px] text-blue-200 font-semibold">Distribuidor oficial CASE IH · AgroMaint Pro</p>
              <p className="text-[10px] text-blue-200">Generado: {fmtDate(generatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Resumen ejecutivo */}
        <div className="bg-white px-8 py-5 border-x border-b border-slate-100 print:border-slate-300">
          <p className="text-[13px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Resumen ejecutivo:</strong>{' '}
            Su flota de <strong>{assets.length} equipos</strong> presenta una disponibilidad del{' '}
            <strong className={fleetAvailability >= 90 ? 'text-emerald-600' : 'text-amber-600'}>{fleetAvailability}%</strong>{' '}
            ({operative} operativos). Se registran <strong>{kpis.totalFailures} eventos de falla</strong> con
            MTBF de <strong>{kpis.mtbf.toLocaleString('es-CO')} h</strong> y MTTR de <strong>{kpis.mttr} h</strong>.
            {projects.length > 0 && <> Los <strong>{projects.length} proyectos de reparación</strong> en curso tienen un avance promedio del <strong>{avgProgress}%</strong>.</>}
            {upcoming.filter(u => u.status === 'overdue').length > 0 && (
              <strong className="text-rose-600"> Atención: {upcoming.filter(u => u.status === 'overdue').length} mantenimientos vencidos requieren programación inmediata.</strong>
            )}
          </p>
        </div>
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Disponibilidad de Flota', value: `${fleetAvailability}%`, icon: <CheckCircle2 className="h-4 w-4" />, color: fleetAvailability >= 90 ? 'text-emerald-700' : 'text-amber-700', hint: `${operative} de ${assets.length} equipos operativos` },
          { label: 'MTBF', value: `${kpis.mtbf.toLocaleString('es-CO')} h`, icon: <Gauge className="h-4 w-4" />, color: 'text-blue-700', hint: 'Horas medias entre fallas' },
          { label: 'MTTR', value: `${kpis.mttr} h`, icon: <Timer className="h-4 w-4" />, color: 'text-amber-700', hint: 'Tiempo medio de reparación' },
          { label: 'Eventos de Falla', value: kpis.totalFailures, icon: <AlertTriangle className="h-4 w-4" />, color: 'text-rose-700', hint: `${kpis.totalDowntime.toLocaleString('es-CO')} h de parada total` },
        ].map(k => (
          <div key={k.label} className="kpi-card print:shadow-none print:border-slate-300">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400 mb-2">{k.label}</p>
                <div className={`text-2xl font-extrabold tracking-tight num ${k.color}`}>{k.value}</div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{k.hint}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Proyectos con Gantt ─── */}
      {projects.length > 0 && (
        <div className="chart-card p-6 mb-6 print:shadow-none print:border-slate-300">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><FileBarChart className="h-4 w-4" /></div>
            <div>
              <h2 className="text-[14px] font-extrabold text-slate-800 tracking-tight">Avance de Proyectos de Reparación</h2>
              <p className="text-[11px] text-slate-400 font-medium">Cronograma y porcentaje de avance por actividad — línea azul = hoy</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {projects.map(p => {
              const prog = p.tasks.length ? Math.round(p.tasks.reduce((s, t) => s + t.progress, 0) / p.tasks.length) : 0
              return (
                <div key={p.id} className="border border-slate-100 rounded-xl p-4 print:border-slate-300">
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">{p.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {p.number} · {p.asset?.internalCode || p.asset?.name || '—'} · Entrega: {fmtDate(p.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${prog === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${prog}%` }} />
                      </div>
                      <span className="text-[13px] font-extrabold num text-slate-700">{prog}%</span>
                    </div>
                  </div>
                  <MiniGantt tasks={p.tasks} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Estado de flota + Fallas por sistema ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:grid-cols-2">
        <div className="chart-card p-6 print:shadow-none print:border-slate-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Tractor className="h-4 w-4" /></div>
            <h2 className="text-[14px] font-extrabold text-slate-800 tracking-tight">Estado de la Flota</h2>
          </div>
          <table className="data-table">
            <thead><tr><th>Equipo</th><th>Modelo</th><th>Horóm.</th><th>Estado</th></tr></thead>
            <tbody>
              {assets.slice(0, 12).map(a => {
                const st = STATUS_LABEL[a.operativeStatus] || STATUS_LABEL.operative
                return (
                  <tr key={a.id}>
                    <td className="font-bold text-slate-800 text-[12px]">{a.internalCode || a.name}</td>
                    <td className="text-[11px]">{a.model?.name || '—'}</td>
                    <td className="num text-[12px]">{a.currentHours.toLocaleString('es-CO')} h</td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {assets.length > 12 && <p className="text-[10px] text-slate-400 mt-2 font-medium">+ {assets.length - 12} equipos adicionales</p>}
        </div>

        <div className="chart-card p-6 print:shadow-none print:border-slate-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Wrench className="h-4 w-4" /></div>
            <h2 className="text-[14px] font-extrabold text-slate-800 tracking-tight">Sistemas con Más Fallas</h2>
          </div>
          {systems.length ? (
            <div className="flex flex-col gap-2.5">
              {systems.map(s => {
                const maxF = systems[0].failures
                return (
                  <div key={s.system} className="flex items-center gap-2">
                    <span className="w-40 truncate text-[11px] font-semibold text-slate-600 shrink-0">{s.system}</span>
                    <div className="flex-1 h-4 rounded bg-slate-50 overflow-hidden">
                      <div className="h-full rounded bg-violet-400" style={{ width: `${(s.failures / maxF) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-[11px] font-extrabold num text-slate-700 shrink-0">{s.failures}</span>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-[12px] text-slate-400 py-6 text-center">Sin eventos de falla registrados</p>}

          {machines.length > 0 && (
            <>
              <div className="divider my-4" />
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Equipos críticos</p>
              {machines.slice(0, 4).map(m => (
                <div key={m.assetId} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-[12px] font-bold text-slate-700">{m.internalCode || m.assetName}</span>
                  <span className="text-[11px] text-slate-400">{m.failures} fallas · MTTR {m.mttr} h</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ─── Próximos mantenimientos ─── */}
      <div className="chart-card p-6 mb-6 print:shadow-none print:border-slate-300">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><CalendarClock className="h-4 w-4" /></div>
          <div>
            <h2 className="text-[14px] font-extrabold text-slate-800 tracking-tight">Próximos Mantenimientos Programados</h2>
            <p className="text-[11px] text-slate-400 font-medium">Según plan oficial Case IH y horómetro actual de cada equipo</p>
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Estado</th><th>Equipo</th><th>Actividad</th><th>Intervalo</th><th>Próximo a</th><th>Restante</th></tr></thead>
          <tbody>
            {upcoming.map(u => (
              <tr key={u.id}>
                <td>
                  <span className={`badge ${u.status === 'overdue' ? 'bg-rose-50 text-rose-700' : u.status === 'due_soon' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.status === 'overdue' ? 'Vencido' : u.status === 'due_soon' ? 'Próximo' : 'Programado'}
                  </span>
                </td>
                <td className="font-bold text-slate-800 text-[12px]">{u.internalCode || u.assetName}</td>
                <td className="text-[11px] max-w-[240px] truncate">{u.title}</td>
                <td className="text-[11px]">{u.intervalLabel}</td>
                <td className="num text-[12px]">{u.dueHours?.toLocaleString('es-CO')} h</td>
                <td className={`num font-bold text-[12px] ${u.hoursRemaining < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {u.hoursRemaining < 0 ? `Vencido ${Math.abs(u.hoursRemaining)} h` : `${u.hoursRemaining} h`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Pie ─── */}
      <div className="text-center pb-8 print:pb-0">
        <p className="text-[11px] text-slate-400 font-medium">
          IMECOL S.A.S. — Distribuidor oficial CASE IH en Colombia · Informe generado por AgroMaint Pro
        </p>
        <p className="text-[10px] text-slate-300 mt-0.5">
          Este informe es confidencial y para uso exclusivo de {client.name}
        </p>
      </div>
    </div>
  )
}
