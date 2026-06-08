'use client'

import { useState, useRef, useTransition, useMemo } from 'react'
import { format, differenceInDays, addDays, min, max, isToday, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import { updateTaskDetails, toggleProjectSubtask, createProjectSubtask } from '@modules/M04_work_orders/actions'
import {
  CheckCircle2, Circle, Clock, User, ChevronRight, ChevronDown,
  Maximize2, Minimize2, Calendar, X, Plus, ChevronLeft,
  Edit3, Info, Check, Sliders, AlertTriangle, Zap
} from 'lucide-react'

interface Technician { id: string; name: string; email?: string | null }
interface Subtask    { id: string; name: string; isCompleted: boolean }
interface Task {
  id: string; name: string
  startDate: Date | string | null; endDate: Date | string | null
  progress: number; status: string
  technician?: { name: string } | null; technicianId?: string | null
  estimatedHours?: number | null; notes?: string | null
  subtasks?: Subtask[]
}

// ── Color de barra según progreso / estado ─────────────────────────────────────
function barStyle(task: Task): { bg: string; fill: string; text: string } {
  if (task.progress === 100 || task.status === 'completed')
    return { bg: 'bg-emerald-500', fill: 'bg-emerald-300/40', text: 'text-white' }
  if (task.status === 'paused')
    return { bg: 'bg-orange-400', fill: 'bg-orange-200/40', text: 'text-white' }
  if ((task.endDate && isBefore(new Date(task.endDate), new Date())) && task.progress < 100)
    return { bg: 'bg-rose-500',  fill: 'bg-rose-300/40',   text: 'text-white' }
  if (task.progress > 0)
    return { bg: 'bg-blue-500',  fill: 'bg-blue-300/40',   text: 'text-white' }
  return   { bg: 'bg-slate-400', fill: 'bg-slate-200/40',  text: 'text-white' }
}

// ── Label del input ────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{children}</p>
}

function inputCls(extra = '') {
  return `w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all shadow-sm ${extra}`
}

// ──────────────────────────────────────────────────────────────────────────────
export function InteractiveGantt({ tasks: initialTasks, technicians }: { tasks: Task[]; technicians: Technician[] }) {
  const [tasks, setTasks]             = useState<Task[]>(initialTasks)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom]               = useState<'days' | 'weeks'>('days')
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [selectedTask, setSelectedTask]   = useState<Task | null>(null)
  const [hoveredBar, setHoveredBar]       = useState<string | null>(null)

  const [editName, setEditName]           = useState('')
  const [editTechId, setEditTechId]       = useState('')
  const [editProgress, setEditProgress]   = useState(0)
  const [editStatus, setEditStatus]       = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate]     = useState('')
  const [editHours, setEditHours]         = useState(0)
  const [editNotes, setEditNotes]         = useState('')
  const [newSubtaskName, setNewSubtaskName] = useState('')

  const [isPending, startTransition] = useTransition()
  const timelineRef = useRef<HTMLDivElement>(null)

  const toggleTask = (id: string) =>
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }))

  const scrollTimeline = (dir: 'left' | 'right') => {
    timelineRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  // ── Date calculations ─────────────────────────────────────────────────────
  const { chartStart, chartEnd, totalDays, dayWidth } = useMemo(() => {
    const validStarts = tasks.map(t => t.startDate ? new Date(t.startDate) : null).filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    const validEnds   = tasks.map(t => t.endDate   ? new Date(t.endDate)   : null).filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    if (!validStarts.length || !validEnds.length) return { chartStart: new Date(), chartEnd: new Date(), totalDays: 30, dayWidth: 40 }
    const pStart = min(validStarts)
    const pEnd   = max(validEnds)
    const start  = addDays(pStart, zoom === 'days' ? -2 : -7)
    const end    = addDays(pEnd,   zoom === 'days' ?  7 : 14)
    return { chartStart: start, chartEnd: end, totalDays: Math.max(1, differenceInDays(end, start)), dayWidth: zoom === 'days' ? 44 : 12 }
  }, [tasks, zoom])

  // ── Today offset ──────────────────────────────────────────────────────────
  const todayOffset = useMemo(() => {
    const d = differenceInDays(new Date(), chartStart)
    if (d < 0 || d > totalDays) return null
    return d * dayWidth
  }, [chartStart, totalDays, dayWidth])

  // ── Header columns ────────────────────────────────────────────────────────
  const headerCols = useMemo(() => {
    const cols = []
    if (zoom === 'days') {
      for (let i = 0; i <= totalDays; i++) {
        const d   = addDays(chartStart, i)
        const isW = d.getDay() === 0 || d.getDay() === 6
        const isTd = isToday(d)
        cols.push(
          <div key={i} className={`flex-none flex flex-col items-center justify-center border-l select-none ${isW ? 'border-slate-100 bg-slate-50/60' : 'border-slate-100'} ${isTd ? 'bg-blue-50' : ''}`}
            style={{ width: dayWidth }}>
            <span className={`text-[9px] font-bold uppercase ${isTd ? 'text-blue-600' : isW ? 'text-slate-300' : 'text-slate-400'}`}>
              {format(d, 'E', { locale: es }).substring(0, 1)}
            </span>
            <span className={`text-[11px] font-black ${isTd ? 'text-blue-600' : isW ? 'text-slate-400' : 'text-slate-600'}`}>
              {format(d, 'd')}
            </span>
          </div>
        )
      }
    } else {
      for (let i = 0; i <= totalDays; i += 7) {
        const d = addDays(chartStart, i)
        cols.push(
          <div key={i} className="flex-none border-l border-slate-100 flex flex-col justify-center px-2 select-none"
            style={{ width: dayWidth * 7 }}>
            <span className="text-[10px] font-bold text-slate-500">Sem {format(d, 'w')}</span>
            <span className="text-[9px] text-slate-400">{format(d, 'd MMM', { locale: es })}</span>
          </div>
        )
      }
    }
    return cols
  }, [chartStart, totalDays, dayWidth, zoom])

  // ── Background cols ───────────────────────────────────────────────────────
  const bgCols = useMemo(() => {
    const cols = []
    if (zoom === 'days') {
      for (let i = 0; i <= totalDays; i++) {
        const d = addDays(chartStart, i)
        const isW = d.getDay() === 0 || d.getDay() === 6
        cols.push(<div key={i} className={`flex-none border-l border-slate-50 h-full ${isW ? 'bg-slate-50/40' : ''}`} style={{ width: dayWidth }} />)
      }
    } else {
      for (let i = 0; i <= totalDays; i += 7) {
        cols.push(<div key={i} className="flex-none border-l border-slate-50 h-full" style={{ width: dayWidth * 7 }} />)
      }
    }
    return cols
  }, [chartStart, totalDays, dayWidth, zoom])

  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-300 mb-3">
          <Calendar className="h-6 w-6" />
        </div>
        <p className="text-sm font-bold text-slate-500">Sin actividades definidas</p>
        <p className="text-xs text-slate-400 mt-1">Agrega actividades para ver el cronograma</p>
      </div>
    )
  }

  const openEditModal = (task: Task) => {
    setSelectedTask(task)
    setEditName(task.name)
    setEditTechId(task.technicianId || '')
    setEditProgress(task.progress || 0)
    setEditStatus(task.status || 'pending')
    setEditStartDate(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '')
    setEditEndDate(task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '')
    setEditHours(task.estimatedHours || 0)
    setEditNotes(task.notes || '')
    setNewSubtaskName('')
  }

  const handleSaveChanges = () => {
    if (!selectedTask) return
    startTransition(async () => {
      try {
        await updateTaskDetails(selectedTask.id, {
          name: editName, technicianId: editTechId || null,
          progress: editProgress, status: editStatus,
          startDate: editStartDate ? new Date(editStartDate) : null,
          endDate:   editEndDate   ? new Date(editEndDate)   : null,
          estimatedHours: editHours, notes: editNotes,
        })
        setTasks(prev => prev.map(t => {
          if (t.id !== selectedTask.id) return t
          const assignedTech = technicians.find(tc => tc.id === editTechId)
          return {
            ...t, name: editName, technicianId: editTechId || null,
            technician: assignedTech ? { name: assignedTech.name } : null,
            progress: editProgress, status: editStatus,
            startDate: editStartDate ? new Date(editStartDate) : null,
            endDate:   editEndDate   ? new Date(editEndDate)   : null,
            estimatedHours: editHours, notes: editNotes,
          }
        }))
        setSelectedTask(null)
      } catch (err) { console.error(err) }
    })
  }

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    try {
      await toggleProjectSubtask(subtaskId, isCompleted)
      const update = (list: Subtask[]) => {
        const updated = list.map(st => st.id === subtaskId ? { ...st, isCompleted } : st)
        return { updated, progress: Math.round((updated.filter(s => s.isCompleted).length / updated.length) * 100) }
      }
      setTasks(prev => prev.map(t => {
        if (!t.subtasks?.some(s => s.id === subtaskId)) return t
        const { updated, progress } = update(t.subtasks)
        return { ...t, subtasks: updated, progress, status: progress === 100 ? 'completed' : t.status }
      }))
      if (selectedTask?.subtasks) {
        const { updated, progress } = update(selectedTask.subtasks)
        setSelectedTask(prev => prev ? { ...prev, subtasks: updated, progress } : prev)
        setEditProgress(progress)
      }
    } catch (err) { console.error(err) }
  }

  const handleAddSubtask = async () => {
    if (!selectedTask || !newSubtaskName.trim()) return
    try {
      const newSt = await createProjectSubtask({ taskId: selectedTask.id, name: newSubtaskName.trim() })
      const st = { id: newSt.id, name: newSt.name, isCompleted: newSt.isCompleted }
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, subtasks: [...(t.subtasks || []), st] } : t))
      setSelectedTask(prev => prev ? { ...prev, subtasks: [...(prev.subtasks || []), st] } : prev)
      setNewSubtaskName('')
    } catch (err) { console.error(err) }
  }

  // ── Gantt content ─────────────────────────────────────────────────────────
  const ganttContent = (
    <div className="flex flex-col h-full bg-white">

      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5 shadow-sm">
            {(['days', 'weeks'] as const).map(z => (
              <button key={z} onClick={() => setZoom(z)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${zoom === z ? 'gradient-brand text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {z === 'days' ? 'Días' : 'Semanas'}
              </button>
            ))}
          </div>
          {/* Scroll */}
          <div className="flex gap-1 border-l border-slate-200 pl-2">
            {(['left','right'] as const).map(d => (
              <button key={d} onClick={() => scrollTimeline(d)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
                {d === 'left' ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400">
            <Info className="h-3 w-3" /> Clic en barra para editar
          </p>
          {/* Leyenda */}
          <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-emerald-500 inline-block" /> Completado</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-blue-500 inline-block" /> En progreso</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-slate-400 inline-block" /> Pendiente</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm bg-rose-500 inline-block" /> Retrasado</span>
          </div>
          <button onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
            {isFullscreen ? <><Minimize2 className="h-3.5 w-3.5" /> Salir</> : <><Maximize2 className="h-3.5 w-3.5" /> Pantalla completa</>}
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-[320px] shrink-0 flex flex-col border-r border-slate-100 bg-white">
          {/* Header */}
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/60 shrink-0">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Actividad</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Avance</span>
          </div>
          {/* Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {tasks.map(task => {
              const isCompleted = task.progress === 100
              const isExpanded  = expandedTasks[task.id]
              const isOverdue   = task.endDate && isBefore(new Date(task.endDate), new Date()) && !isCompleted
              const { bg } = barStyle(task)

              return (
                <div key={task.id} className="flex flex-col">
                  <div className="flex items-center min-h-[56px] px-3 gap-2 hover:bg-slate-50/60 transition-colors">
                    {/* Expand toggle */}
                    <button onClick={() => toggleTask(task.id)}
                      className="text-slate-300 hover:text-slate-600 transition-colors shrink-0">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {/* Status dot */}
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${bg}`} />

                    {/* Name + tech */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditModal(task)}>
                      <p className={`text-xs font-bold truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {task.name}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <User className="h-2.5 w-2.5" />
                        {task.technician?.name || 'Sin asignar'}
                        {isOverdue && <span className="ml-1 text-rose-500 flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" /> Retrasado</span>}
                      </p>
                    </div>

                    {/* Edit btn */}
                    <button onClick={() => openEditModal(task)}
                      className="h-6 w-6 flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-blue-600 transition-all shrink-0">
                      <Edit3 className="h-3 w-3" />
                    </button>

                    {/* Progress badge */}
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg shrink-0 min-w-[36px] text-center ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                      {task.progress}%
                    </span>
                  </div>

                  {/* Subtasks */}
                  {isExpanded && (
                    <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100/60 divide-y divide-slate-100/40">
                      {task.subtasks?.length ? task.subtasks.map(st => (
                        <div key={st.id} onClick={() => handleToggleSubtask(st.id, !st.isCompleted)}
                          className="flex items-center gap-2 py-1.5 text-xs cursor-pointer hover:bg-slate-100/60 rounded-lg px-1 transition-colors">
                          {st.isCompleted
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            : <Circle className="h-3.5 w-3.5 text-slate-300 hover:text-blue-500 shrink-0" />}
                          <span className={`truncate font-medium ${st.isCompleted ? 'line-through text-slate-400' : 'text-slate-600'}`}>{st.name}</span>
                        </div>
                      )) : (
                        <p className="text-[10px] text-slate-400 py-1.5 px-1">Sin subtareas registradas.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Timeline */}
        <div ref={timelineRef} className="flex-1 overflow-x-auto overflow-y-hidden flex flex-col bg-white relative">

          {/* Timeline header */}
          <div className="h-14 border-b border-slate-100 flex bg-slate-50/60 shrink-0 min-w-max">
            {headerCols}
          </div>

          {/* Timeline rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 min-w-max relative select-none">
            {/* BG grid */}
            <div className="absolute inset-y-0 left-0 flex pointer-events-none z-0">
              {bgCols}
            </div>

            {/* Today marker */}
            {todayOffset !== null && (
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: todayOffset }}
              >
                <div className="w-[2px] h-full bg-blue-500/50" />
                <div className="absolute -top-0 -left-3 bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm whitespace-nowrap">
                  HOY
                </div>
              </div>
            )}

            {/* Task rows */}
            {tasks.map(task => {
              const startDate = task.startDate ? new Date(task.startDate) : null
              const endDate   = task.endDate   ? new Date(task.endDate)   : null
              let startPx = 0, widthPx = 0

              if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const offset   = Math.max(0, differenceInDays(startDate, chartStart))
                const duration = Math.max(1, differenceInDays(endDate, startDate))
                startPx = offset * dayWidth
                widthPx = duration * dayWidth
              }

              const { bg, fill } = barStyle(task)
              const isExpanded = expandedTasks[task.id]
              const isHovered  = hoveredBar === task.id

              return (
                <div key={task.id} className="relative flex flex-col">
                  <div className="h-[56px] relative flex items-center z-10">
                    {widthPx > 0 ? (
                      <div
                        onClick={() => openEditModal(task)}
                        onMouseEnter={() => setHoveredBar(task.id)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className={`absolute h-7 rounded-lg cursor-pointer transition-all duration-150 flex items-center overflow-hidden
                          ${bg} ${isHovered ? 'shadow-lg scale-[1.01] opacity-100 ring-2 ring-white ring-offset-1' : 'shadow-sm opacity-90'}`}
                        style={{ left: startPx, width: widthPx }}
                      >
                        {/* Progress fill overlay */}
                        <div
                          className={`absolute left-0 top-0 h-full rounded-l-lg ${fill} border-r border-white/20 transition-all`}
                          style={{ width: `${task.progress}%` }}
                        />
                        {/* Label */}
                        {widthPx > 48 && (
                          <span className="relative z-10 px-2.5 text-[10px] font-black text-white drop-shadow-sm truncate select-none">
                            {task.progress}%
                            {widthPx > 100 && ` · ${task.name.split(' ').slice(0, 3).join(' ')}`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => openEditModal(task)}
                        className="absolute left-4 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-slate-300 bg-white text-[10px] font-semibold text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all"
                      >
                        <Calendar className="h-3 w-3" /> Sin fechas — clic para editar
                      </button>
                    )}
                  </div>

                  {/* Spacer for subtask expansion */}
                  {isExpanded && (
                    <div
                      className="bg-slate-50/20 border-t border-slate-50"
                      style={{ height: Math.max(34, (task.subtasks?.length || 1) * 32) }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inline view */}
      <div className="w-full h-[520px] overflow-hidden">
        {ganttContent}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-fade-in" style={{ background: 'rgba(15,28,46,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-[96vw] h-[92vh] rounded-2xl overflow-hidden flex flex-col shadow-modal border border-white/10">
            {/* Dark header */}
            <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{ background: 'var(--sidebar-bg)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-brand">
                  <Maximize2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Cronograma — Pantalla Completa</p>
                  <p className="text-[10px] text-slate-400">Diagrama de Gantt interactivo</p>
                </div>
              </div>
              <button onClick={() => setIsFullscreen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              {ganttContent}
            </div>
          </div>
        </div>
      )}

      {/* Task edit modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(15,28,46,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl overflow-hidden animate-fade-in border border-slate-100">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand">
                  <Sliders className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Editar Actividad</p>
                  <p className="text-[11px] text-slate-400">Fechas, progreso, subtareas y notas</p>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-5 max-h-[70vh] overflow-y-auto space-y-5">

              {/* Nombre */}
              <div>
                <FieldLabel>Nombre de la Actividad</FieldLabel>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className={inputCls('font-bold')} />
              </div>

              {/* Grid fechas + tech + status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Fecha Inicio</FieldLabel>
                  <input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} className={inputCls()} />
                </div>
                <div>
                  <FieldLabel>Fecha Fin</FieldLabel>
                  <input type="date" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} className={inputCls()} />
                </div>
                <div>
                  <FieldLabel>Técnico Encargado</FieldLabel>
                  <select value={editTechId} onChange={e => setEditTechId(e.target.value)} className={inputCls()}>
                    <option value="">Sin asignar</option>
                    {technicians.map(tc => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Estado</FieldLabel>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className={inputCls()}>
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="paused">Pausado</option>
                    <option value="skipped">Omitido</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Horas Estimadas</FieldLabel>
                  <input type="number" min={0} value={editHours} onChange={e => setEditHours(Number(e.target.value))} className={inputCls()} />
                </div>
              </div>

              {/* Progreso */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <FieldLabel>Porcentaje de Progreso</FieldLabel>
                  <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${editProgress === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {editProgress}%
                  </span>
                </div>
                <input type="range" min={0} max={100} step={5} value={editProgress}
                  onChange={e => setEditProgress(Number(e.target.value))}
                  className="w-full h-2 rounded-full bg-slate-200 appearance-none cursor-pointer accent-blue-600" />
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full gradient-brand rounded-full transition-all" style={{ width: `${editProgress}%` }} />
                </div>
              </div>

              {/* Subtareas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>Subtareas / Checklist</FieldLabel>
                  <span className="text-[10px] text-slate-400">
                    {selectedTask.subtasks?.filter(s => s.isCompleted).length ?? 0} / {selectedTask.subtasks?.length ?? 0} completadas
                  </span>
                </div>
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50 bg-white max-h-44 overflow-y-auto shadow-sm">
                  {selectedTask.subtasks?.length ? selectedTask.subtasks.map(st => (
                    <div key={st.id} onClick={() => handleToggleSubtask(st.id, !st.isCompleted)}
                      className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                      {st.isCompleted
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        : <Circle className="h-4 w-4 text-slate-300 hover:text-blue-500 shrink-0" />}
                      <span className={`text-xs font-medium truncate ${st.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>{st.name}</span>
                    </div>
                  )) : (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">
                      No hay subtareas para esta actividad
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <input type="text" placeholder="Nueva subtarea..." value={newSubtaskName}
                    onChange={e => setNewSubtaskName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask() }}
                    className={inputCls('flex-1 text-xs')} />
                  <button onClick={handleAddSubtask}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl gradient-brand text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all">
                    <Plus className="h-3.5 w-3.5" /> Añadir
                  </button>
                </div>
              </div>

              {/* Notas */}
              <div>
                <FieldLabel>Notas de Campo</FieldLabel>
                <textarea rows={3} value={editNotes} onChange={e => setEditNotes(e.target.value)}
                  placeholder="Observaciones del técnico, hallazgos, recomendaciones..."
                  className={inputCls('resize-none')} />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/80">
              <button onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
                Cancelar
              </button>
              <button onClick={handleSaveChanges} disabled={isPending}
                className="flex items-center gap-2 px-5 py-2 rounded-xl gradient-brand text-white text-sm font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:pointer-events-none">
                {isPending
                  ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                  : <><Check className="h-4 w-4" /> Guardar Cambios</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
