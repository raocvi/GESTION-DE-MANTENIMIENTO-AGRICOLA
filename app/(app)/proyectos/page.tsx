import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@core/lib/db'
import { formatDate } from '@core/lib/utils'
import {
  FolderKanban, Plus, Clock, TrendingUp,
  Tractor, ChevronRight, AlertTriangle, CheckCircle2, BarChart2
} from 'lucide-react'

export const metadata: Metadata = { title: 'Proyectos — AgroMaint Pro' }

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  new:          { label: 'Nuevo',          cls: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400' },
  in_progress:  { label: 'En ejecución',   cls: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  assigned:     { label: 'Asignado',       cls: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
  paused:       { label: 'Pausado',        cls: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-500' },
  closed:       { label: 'Cerrado',        cls: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  completed:    { label: 'Completado',     cls: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  cancelled:    { label: 'Cancelado',      cls: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
  pending_parts:{ label: 'Pend. repuestos',cls: 'bg-yellow-100 text-yellow-700',  dot: 'bg-yellow-500' },
}

const PROGRESS_GRADIENT = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
]

export default async function ProjectsPage() {
  const projects = await db.workOrder.findMany({
    where: { type: 'corrective', isActive: true },
    include: { asset: true, client: true, tasks: true },
    orderBy: { createdAt: 'desc' },
  })

  projects.sort((a, b) => {
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
    if (a.status !== 'in_progress' && b.status === 'in_progress') return 1
    return 0
  })

  const active    = projects.filter(p => p.status === 'in_progress').length
  const completed = projects.filter(p => ['completed', 'closed'].includes(p.status)).length
  const paused    = projects.filter(p => p.status === 'paused').length
  const totalTasks = projects.reduce((s, p) => s + p.tasks.length, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-md shrink-0">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Proyectos</h1>
            <p className="text-sm text-slate-400 mt-0.5">Reparaciones mayores y mantenimientos correctivos</p>
          </div>
        </div>
        <Link
          href="/ordenes/nueva?type=corrective"
          className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Nuevo Proyecto
        </Link>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'En Ejecución',  value: active,      color: 'text-amber-600',   icon: <TrendingUp className="h-5 w-5" />,    bg: 'bg-amber-50' },
          { label: 'Completados',   value: completed,   color: 'text-emerald-600', icon: <CheckCircle2 className="h-5 w-5" />, bg: 'bg-emerald-50' },
          { label: 'Pausados',      value: paused,      color: 'text-orange-600',  icon: <AlertTriangle className="h-5 w-5" />,bg: 'bg-orange-50' },
          { label: 'Total Tareas',  value: totalTasks,  color: 'text-blue-600',    icon: <BarChart2 className="h-5 w-5" />,    bg: 'bg-blue-50' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{k.label}</p>
                <span className={`text-3xl font-black ${k.color}`}>{k.value}</span>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.bg} ${k.color}`}>
                {k.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lista de proyectos ── */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
            <FolderKanban className="h-8 w-8" />
          </div>
          <p className="font-bold text-slate-600">No hay proyectos registrados</p>
          <p className="text-sm text-slate-400 mt-1">Crea un proyecto desde una orden correctiva</p>
          <Link href="/ordenes/nueva?type=corrective" className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90">
            <Plus className="h-4 w-4" /> Nuevo Proyecto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project, idx) => {
            const progressSum    = project.tasks.reduce((s, t) => s + (t.progress || 0), 0)
            const overallProgress = project.tasks.length > 0 ? Math.round(progressSum / project.tasks.length) : 0
            const completedTasks  = project.tasks.filter(t => t.progress === 100).length
            const st = STATUS_CFG[project.status] ?? { label: project.status, cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
            const gradient = PROGRESS_GRADIENT[idx % PROGRESS_GRADIENT.length]
            const isDelayed = project.dueDate && new Date(project.dueDate) < new Date() && !['closed','completed','cancelled'].includes(project.status)

            return (
              <Link
                key={project.id}
                href={`/proyectos/${project.id}`}
                className="group chart-card overflow-hidden block transition-all hover:-translate-y-0.5"
              >
                {/* Header con gradiente */}
                <div className={`bg-gradient-to-r ${gradient} px-5 py-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        {project.number}
                      </p>
                      <h3 className="font-black text-white text-base leading-snug line-clamp-2 group-hover:text-white">
                        {project.title}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`status-pill ${st.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                      {isDelayed && (
                        <span className="status-pill bg-red-100 text-red-700 text-[9px]">
                          <AlertTriangle className="h-2.5 w-2.5" /> Retrasado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Cliente</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{project.client?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Equipo</p>
                      <div className="flex items-center gap-1.5">
                        <Tractor className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <p className="text-sm font-semibold text-slate-700 truncate">{project.asset?.internalCode || '—'}</p>
                      </div>
                    </div>
                    {project.scheduledDate && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Inicio</p>
                        <p className="text-xs text-slate-600">{formatDate(project.scheduledDate)}</p>
                      </div>
                    )}
                    {project.dueDate && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Vence</p>
                        <p className={`text-xs font-semibold ${isDelayed ? 'text-red-600' : 'text-slate-600'}`}>
                          {formatDate(project.dueDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{completedTasks}/{project.tasks.length} tareas</span>
                      </div>
                      <span className={`text-sm font-black ${overallProgress === 100 ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {overallProgress}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      {project.tasks.length > 0
                        ? `${project.tasks.length} actividad${project.tasks.length !== 1 ? 'es' : ''}`
                        : 'Sin actividades'}
                    </p>
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      Ver cronograma <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
