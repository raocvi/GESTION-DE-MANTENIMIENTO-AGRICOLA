import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWorkOrderById } from '@modules/M04_work_orders/actions'
import { formatDate } from '@core/lib/utils'
import {
  ChevronLeft, FolderKanban, Calendar, CheckCircle2,
  Clock, Tractor, Building2, AlertTriangle, BarChart2, User
} from 'lucide-react'
import { InteractiveGantt } from './_components/InteractiveGantt'
import { db } from '@core/lib/db'

export const metadata: Metadata = { title: 'Proyecto — AgroMaint Pro' }

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  new:           { label: 'Nuevo',           cls: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400' },
  in_progress:   { label: 'En ejecución',    cls: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  assigned:      { label: 'Asignado',        cls: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
  paused:        { label: 'Pausado',         cls: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-500' },
  closed:        { label: 'Cerrado',         cls: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  completed:     { label: 'Completado',      cls: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  cancelled:     { label: 'Cancelado',       cls: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
  pending_parts: { label: 'Pend. repuestos', cls: 'bg-yellow-100 text-yellow-700',  dot: 'bg-yellow-500' },
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getWorkOrderById(id)
  if (!project || project.type !== 'corrective') notFound()

  const tasks = project.tasks || []
  const overallProgress = tasks.length > 0
    ? Math.round(tasks.reduce((s, t) => s + (t.progress || 0), 0) / tasks.length)
    : 0
  const completedTasks = tasks.filter(t => t.progress === 100).length
  const inProgressTasks = tasks.filter(t => t.progress > 0 && t.progress < 100).length
  const pendingTasks = tasks.filter(t => !t.progress || t.progress === 0).length
  const totalEstHours = tasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0)

  const technicians = await db.technician.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true },
  })

  const st = STATUS_CFG[project.status] ?? { label: project.status, cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
  const isDelayed = project.dueDate && new Date(project.dueDate) < new Date() && !['closed','completed','cancelled'].includes(project.status)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/proyectos" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{project.number}</p>
            <span className={`status-pill ${st.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            {isDelayed && (
              <span className="status-pill bg-red-100 text-red-700">
                <AlertTriangle className="h-3 w-3" /> Retrasado
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate">{project.title}</h1>
        </div>
      </div>

      {/* ── KPIs del proyecto ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Progreso Global</p>
              <span className={`text-3xl font-black ${overallProgress === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{overallProgress}%</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full gradient-brand rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
        <div className="kpi-card">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Completadas</p>
          <span className="text-3xl font-black text-emerald-600">{completedTasks}</span>
          <p className="text-xs text-slate-400 mt-1">de {tasks.length} tareas</p>
        </div>
        <div className="kpi-card">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">En Progreso</p>
          <span className="text-3xl font-black text-amber-600">{inProgressTasks}</span>
          <p className="text-xs text-slate-400 mt-1">{pendingTasks} pendientes</p>
        </div>
        <div className="kpi-card">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Horas Estimadas</p>
          <span className="text-3xl font-black text-violet-600">{totalEstHours}h</span>
          <p className="text-xs text-slate-400 mt-1">esfuerzo total</p>
        </div>
      </div>

      {/* ── Layout principal ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">

        {/* ── Sidebar: info ── */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="chart-card p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <FolderKanban className="h-3.5 w-3.5" /> Información del Proyecto
            </h2>
            <div className="space-y-4">
              {project.client && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Cliente
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{project.client.name}</p>
                </div>
              )}
              {project.asset && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                    <Tractor className="h-3 w-3" /> Equipo
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{project.asset.internalCode}</p>
                  <p className="text-xs text-slate-400">{project.asset.name}</p>
                </div>
              )}
              {project.assignedTo && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" /> Responsable
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{project.assignedTo.name}</p>
                </div>
              )}
              {(project.scheduledDate || project.dueDate) && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Fechas
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {project.scheduledDate && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Inicio planeado</span>
                        <span className="font-semibold text-slate-700">{formatDate(project.scheduledDate)}</span>
                      </div>
                    )}
                    {project.dueDate && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Fecha límite</span>
                        <span className={`font-semibold ${isDelayed ? 'text-red-600' : 'text-slate-700'}`}>
                          {formatDate(project.dueDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {project.description && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Descripción</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Task summary mini-chart */}
          {tasks.length > 0 && (
            <div className="chart-card p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Resumen de Tareas
              </h2>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Completadas', value: completedTasks,  color: '#10b981', bg: 'bg-emerald-50 text-emerald-700' },
                  { label: 'En progreso', value: inProgressTasks, color: '#f59e0b', bg: 'bg-amber-50 text-amber-700' },
                  { label: 'Pendientes',  value: pendingTasks,    color: '#94a3b8', bg: 'bg-slate-50 text-slate-600' },
                ].map(item => {
                  const pct = tasks.length > 0 ? Math.round((item.value / tasks.length) * 100) : 0
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">{item.label}</span>
                        <span className="font-bold text-slate-800">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Panel principal: Gantt ── */}
        <div className="lg:col-span-3">
          <div className="chart-card overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Cronograma de Actividades
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Diagrama de Gantt interactivo — clic en cualquier barra para editar
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Completado
                <span className="ml-2 h-2 w-2 rounded-full bg-blue-500 inline-block" /> En progreso
                <span className="ml-2 h-2 w-2 rounded-full bg-slate-300 inline-block" /> Pendiente
              </div>
            </div>
            <InteractiveGantt tasks={tasks} technicians={technicians} />
          </div>
        </div>
      </div>
    </div>
  )
}
