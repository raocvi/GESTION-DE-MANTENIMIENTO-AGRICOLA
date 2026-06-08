'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, CheckCircle2, Circle, Wrench, Clock, User, CalendarDays, AlertTriangle } from 'lucide-react'
import { createProjectActivity, createProjectSubtask, toggleProjectSubtask, updateTaskProgress } from '@modules/M04_work_orders/actions'
import { formatDate } from '@core/lib/utils'

const SYSTEMS = [
  'Sistema Motor', 'Sistema Hidráulico', 'Sistema de Transmisión / Rodaje',
  'Sistema Eléctrico / Electrónico', 'Sistema de Corte Base', 'Sistema de Alimentación',
  'Sistema de Troceado', 'Sistema de Extracción', 'Sistema de Elevación', 'Cabina y Estructura',
]

const SYSTEM_COLORS: Record<string, string> = {
  'Sistema Motor':                     'from-red-500 to-rose-600',
  'Sistema Hidráulico':                'from-blue-500 to-indigo-600',
  'Sistema de Transmisión / Rodaje':   'from-violet-500 to-purple-600',
  'Sistema Eléctrico / Electrónico':   'from-amber-500 to-orange-600',
  'Sistema de Corte Base':             'from-emerald-500 to-teal-600',
  'Sistema de Alimentación':           'from-cyan-500 to-blue-600',
  'Sistema de Troceado':               'from-lime-500 to-green-600',
  'Sistema de Extracción':             'from-slate-500 to-slate-700',
  'Sistema de Elevación':              'from-pink-500 to-rose-600',
  'Cabina y Estructura':               'from-orange-500 to-amber-600',
}

function inputCls(extra = '') {
  return `w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all shadow-sm ${extra}`
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{children}</label>
}

// ── Individual task card ──────────────────────────────────────────────────────
function TaskCard({ task }: { task: any }) {
  const [progress, setProgress] = useState(task.progress || 0)
  const [expanded, setExpanded] = useState(false)
  const isCompleted = progress === 100
  const isOverdue   = task.endDate && new Date(task.endDate) < new Date() && !isCompleted

  const handleProgressChange = async (val: number) => {
    setProgress(val)
    await updateTaskProgress(task.id, val)
  }

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${isCompleted ? 'border-emerald-100 bg-emerald-50/30' : isOverdue ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100 bg-white'}`}>

      {/* Progress header bar */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Task header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {task.name}
              </p>
              {isOverdue && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-lg">
                  <AlertTriangle className="h-2.5 w-2.5" /> Retrasado
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Completado
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
              {task.technician?.name && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {task.technician.name}
                </span>
              )}
              {task.estimatedHours > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {task.estimatedHours}h estimadas
                </span>
              )}
              {task.startDate && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(task.startDate)} → {task.endDate ? formatDate(task.endDate) : '?'}
                </span>
              )}
            </div>
          </div>

          {/* Progress control */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-sm font-black ${isCompleted ? 'text-emerald-600' : isOverdue ? 'text-rose-600' : 'text-blue-600'}`}>
              {progress}%
            </span>
            <input
              type="range" min={0} max={100} step={10} value={progress}
              onChange={e => handleProgressChange(Number(e.target.value))}
              className="w-24 h-1.5 rounded-full bg-slate-200 appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Subtasks toggle */}
        {task.subtasks?.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              {task.subtasks.filter((s: any) => s.isCompleted).length}/{task.subtasks.length} subtareas
            </button>
            {expanded && (
              <div className="mt-2 pl-3 border-l-2 border-slate-100 space-y-1">
                {task.subtasks.map((st: any) => (
                  <div
                    key={st.id}
                    onClick={() => toggleProjectSubtask(st.id, !st.isCompleted)}
                    className="flex items-center gap-2 py-1 text-xs text-slate-600 cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    {st.isCompleted
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      : <Circle className="h-3.5 w-3.5 text-slate-300 hover:text-blue-500 shrink-0" />}
                    <span className={st.isCompleted ? 'line-through text-slate-400' : ''}>{st.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ActivitiesManager({ project, tasks, users }: { project: any; tasks: any[]; users: any[] }) {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)

  const grouped: Record<string, Record<string, any[]>> = {}
  tasks.forEach(t => {
    const sys  = t.system    || 'General'
    const comp = t.component || 'General'
    if (!grouped[sys])       grouped[sys] = {}
    if (!grouped[sys][comp]) grouped[sys][comp] = []
    grouped[sys][comp].push(t)
  })

  const toggleSystem = (sys: string) =>
    setExpandedSystems(prev => ({ ...prev, [sys]: !prev[sys] }))

  const handleCreateActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const fd = new FormData(e.currentTarget)
    await createProjectActivity({
      workOrderId:  project.id,
      name:         fd.get('name') as string,
      system:       fd.get('system') as string,
      component:    fd.get('component') as string,
      technicianId: fd.get('technicianId') as string || undefined,
      startDate:    fd.get('startDate') ? new Date(fd.get('startDate') as string) : undefined,
      endDate:      fd.get('endDate')   ? new Date(fd.get('endDate')   as string) : undefined,
    })
    setIsSaving(false)
    setIsAddingTask(false)
  }

  const systemCount = Object.keys(grouped).length
  const completedTasks = tasks.filter(t => t.progress === 100).length

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900">Actividades por Sistema</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedTasks}/{tasks.length} completadas · {systemCount} sistema{systemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            isAddingTask
              ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              : 'gradient-brand text-white shadow-md hover:opacity-90'
          }`}
        >
          <Plus className="h-4 w-4" />
          {isAddingTask ? 'Cancelar' : 'Nueva Actividad'}
        </button>
      </div>

      {/* Form nueva actividad */}
      {isAddingTask && (
        <form onSubmit={handleCreateActivity} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-4 animate-fade-in">
          <p className="text-xs font-black uppercase tracking-widest text-blue-700 mb-1">Registrar Nueva Actividad</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FieldLabel>Nombre de la Actividad *</FieldLabel>
              <input required name="name" type="text" placeholder="Ej: Cambio de filtro hidráulico principal" className={inputCls()} />
            </div>
            <div>
              <FieldLabel>Sistema *</FieldLabel>
              <select required name="system" className={inputCls()}>
                <option value="">Seleccionar sistema...</option>
                {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Componente *</FieldLabel>
              <input required name="component" type="text" placeholder="Ej: Bomba hidráulica principal" className={inputCls()} />
            </div>
            <div>
              <FieldLabel>Técnico Asignado</FieldLabel>
              <select name="technicianId" className={inputCls()}>
                <option value="">Sin asignar</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Horas Estimadas</FieldLabel>
              <input name="estimatedHours" type="number" min={0} step={0.5} placeholder="0" className={inputCls()} />
            </div>
            <div>
              <FieldLabel>Fecha Inicio</FieldLabel>
              <input name="startDate" type="date" className={inputCls()} />
            </div>
            <div>
              <FieldLabel>Fecha Fin</FieldLabel>
              <input name="endDate" type="date" className={inputCls()} />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50">
              {isSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="h-4 w-4" />}
              {isSaving ? 'Guardando...' : 'Guardar Actividad'}
            </button>
          </div>
        </form>
      )}

      {/* Lista por sistemas */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <Wrench className="h-8 w-8 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-500">Sin actividades registradas</p>
          <p className="text-xs text-slate-400 mt-1">Agrega actividades para organizar el trabajo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([system, components]) => {
            const systemTasks  = Object.values(components).flat()
            const done         = systemTasks.filter(t => t.progress === 100).length
            const pct          = systemTasks.length > 0 ? Math.round((done / systemTasks.length) * 100) : 0
            const gradient     = SYSTEM_COLORS[system] || 'from-slate-500 to-slate-700'
            const isExpanded   = expandedSystems[system]

            return (
              <div key={system} className="chart-card overflow-hidden">
                {/* System header */}
                <button
                  type="button"
                  onClick={() => toggleSystem(system)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors text-left"
                >
                  {/* Gradient dot */}
                  <div className={`h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <Wrench className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{system}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{done}/{systemTasks.length} · {pct}%</p>
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-50 pt-4 space-y-5 animate-fade-in">
                    {Object.entries(components).map(([component, compTasks]) => (
                      <div key={component}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                          <span className="h-px flex-1 bg-slate-100" />
                          {component}
                          <span className="h-px flex-1 bg-slate-100" />
                        </p>
                        <div className="space-y-2">
                          {compTasks.map((task: any) => <TaskCard key={task.id} task={task} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
