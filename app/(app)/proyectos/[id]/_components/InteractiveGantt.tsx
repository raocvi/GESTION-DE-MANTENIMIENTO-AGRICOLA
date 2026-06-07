'use client'

import { useState, useRef, useTransition } from 'react'
import { format, differenceInDays, addDays, min, max } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  updateTaskDetails, 
  toggleProjectSubtask, 
  createProjectSubtask 
} from '@modules/M04_work_orders/actions'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  ChevronRight, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  Calendar, 
  X, 
  Plus, 
  ChevronLeft, 
  Edit3, 
  Info,
  Sliders,
  Check
} from 'lucide-react'

interface Technician {
  id: string
  name: string
  email?: string | null
}

interface Subtask {
  id: string
  name: string
  isCompleted: boolean
}

interface Task {
  id: string
  name: string
  startDate: Date | string | null
  endDate: Date | string | null
  progress: number
  technician?: { name: string } | null
  technicianId?: string | null
  status: string
  estimatedHours?: number | null
  notes?: string | null
  subtasks?: Subtask[]
}

export function InteractiveGantt({ 
  tasks: initialTasks, 
  technicians 
}: { 
  tasks: Task[]
  technicians: Technician[] 
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState<'days' | 'weeks'>('days')
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // States for Edit Modal Form
  const [editName, setEditName] = useState('')
  const [editTechId, setEditTechId] = useState('')
  const [editProgress, setEditProgress] = useState(0)
  const [editStatus, setEditStatus] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [editHours, setEditHours] = useState(0)
  const [editNotes, setEditNotes] = useState('')
  const [newSubtaskName, setNewSubtaskName] = useState('')
  
  const [isPending, startTransition] = useTransition()
  const timelineRef = useRef<HTMLDivElement>(null)

  const toggleTask = (id: string) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Scroll controls for timeline
  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250
      timelineRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!tasks.length) return <p className="text-sm text-slate-500">No hay actividades definidas.</p>

  const validStarts = tasks
    .map(t => t.startDate ? new Date(t.startDate) : null)
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    
  const validEnds = tasks
    .map(t => t.endDate ? new Date(t.endDate) : null)
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
  
  if (!validStarts.length || !validEnds.length) {
    return <p className="text-sm text-slate-500">No hay fechas válidas para graficar el Gantt.</p>
  }

  const projectStart = min(validStarts)
  const projectEnd = max(validEnds)
  
  // Set margin depending on zoom
  const marginDaysBefore = zoom === 'days' ? -2 : -7
  const marginDaysAfter = zoom === 'days' ? 7 : 14
  
  const chartStart = addDays(projectStart, marginDaysBefore)
  const chartEnd = addDays(projectEnd, marginDaysAfter)
  const totalDays = Math.max(1, differenceInDays(chartEnd, chartStart))

  // Grid sizing parameters
  const dayWidth = zoom === 'days' ? 42 : 12 // px per day

  // Render Time scale Header columns
  const headerCols = []
  if (zoom === 'days') {
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = addDays(chartStart, i)
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
      headerCols.push(
        <div 
          key={i} 
          className={`flex-none text-center border-l border-slate-200/60 flex flex-col justify-between select-none ${isWeekend ? 'bg-slate-50/50' : ''}`}
          style={{ width: `${dayWidth}px` }}
        >
          <span className="text-[9px] text-slate-400 font-semibold uppercase pt-1">
            {format(currentDate, 'E', { locale: es }).substring(0, 1)}
          </span>
          <span className="text-xs font-semibold text-slate-600 pb-1">
            {format(currentDate, 'd')}
          </span>
        </div>
      )
    }
  } else {
    // Weeks view
    for (let i = 0; i <= totalDays; i += 7) {
      const currentDate = addDays(chartStart, i)
      headerCols.push(
        <div 
          key={i} 
          className="flex-none border-l border-slate-200/60 p-1 flex flex-col justify-end select-none"
          style={{ width: `${dayWidth * 7}px` }}
        >
          <span className="text-[10px] font-semibold text-slate-500">
            Sem. {format(currentDate, 'w')}
          </span>
          <span className="text-[9px] text-slate-400">
            {format(currentDate, 'd MMM', { locale: es })}
          </span>
        </div>
      )
    }
  }

  // Grid background columns
  const bgCols = []
  if (zoom === 'days') {
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = addDays(chartStart, i)
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
      bgCols.push(
        <div 
          key={`bg-${i}`} 
          className={`flex-none border-l border-slate-100 h-full ${isWeekend ? 'bg-slate-50/40' : ''}`}
          style={{ width: `${dayWidth}px` }}
        />
      )
    }
  } else {
    for (let i = 0; i <= totalDays; i += 7) {
      bgCols.push(
        <div 
          key={`bg-${i}`} 
          className="flex-none border-l border-slate-100 h-full"
          style={{ width: `${dayWidth * 7}px` }}
        />
      )
    }
  }

  // Open Details/Edit Modal
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

  // Save changes via Server Action
  const handleSaveChanges = () => {
    if (!selectedTask) return

    startTransition(async () => {
      try {
        const updated = await updateTaskDetails(selectedTask.id, {
          name: editName,
          technicianId: editTechId || null,
          progress: editProgress,
          status: editStatus,
          startDate: editStartDate ? new Date(editStartDate) : null,
          endDate: editEndDate ? new Date(editEndDate) : null,
          estimatedHours: editHours,
          notes: editNotes
        })

        // Update local state
        setTasks(prev => prev.map(t => {
          if (t.id === selectedTask.id) {
            const assignedTech = technicians.find(tc => tc.id === editTechId)
            return {
              ...t,
              name: editName,
              technicianId: editTechId || null,
              technician: assignedTech ? { name: assignedTech.name } : null,
              progress: editProgress,
              status: editStatus,
              startDate: editStartDate ? new Date(editStartDate) : null,
              endDate: editEndDate ? new Date(editEndDate) : null,
              estimatedHours: editHours,
              notes: editNotes
            }
          }
          return t
        }))
        
        setSelectedTask(null)
      } catch (err) {
        console.error("Error saving task details:", err)
      }
    })
  }

  // Handle local toggle of subtask
  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    try {
      await toggleProjectSubtask(subtaskId, isCompleted)
      
      // Update local state
      setTasks(prev => prev.map(t => {
        if (t.subtasks?.some(st => st.id === subtaskId)) {
          const updatedSubtasks = t.subtasks.map(st => 
            st.id === subtaskId ? { ...st, isCompleted } : st
          )
          
          // Auto calculate progress based on subtasks if user completes them
          const completedCount = updatedSubtasks.filter(st => st.isCompleted).length
          const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100)
          
          return {
            ...t,
            subtasks: updatedSubtasks,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : t.status
          }
        }
        return t
      }))

      // Update selectedTask subtasks if open
      if (selectedTask) {
        setSelectedTask(prev => {
          if (!prev || !prev.subtasks) return prev
          const updatedSubtasks = prev.subtasks.map(st => 
            st.id === subtaskId ? { ...st, isCompleted } : st
          )
          const completedCount = updatedSubtasks.filter(st => st.isCompleted).length
          const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100)
          setEditProgress(newProgress)
          return {
            ...prev,
            subtasks: updatedSubtasks,
            progress: newProgress
          }
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle adding new subtask
  const handleAddSubtask = async () => {
    if (!selectedTask || !newSubtaskName.trim()) return

    try {
      const newSt = await createProjectSubtask({
        taskId: selectedTask.id,
        name: newSubtaskName.trim()
      })

      const finalSt = {
        id: newSt.id,
        name: newSt.name,
        isCompleted: newSt.isCompleted
      }

      // Update local tasks
      setTasks(prev => prev.map(t => {
        if (t.id === selectedTask.id) {
          const updatedSubtasks = [...(t.subtasks || []), finalSt]
          return {
            ...t,
            subtasks: updatedSubtasks
          }
        }
        return t
      }))

      // Update selectedTask modal view
      setSelectedTask(prev => {
        if (!prev) return prev
        return {
          ...prev,
          subtasks: [...(prev.subtasks || []), finalSt]
        }
      })

      setNewSubtaskName('')
    } catch (err) {
      console.error(err)
    }
  }

  const ganttContent = (
    <div className="flex flex-col h-full bg-white">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 gap-4">
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm text-xs">
            <button 
              onClick={() => setZoom('days')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${zoom === 'days' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Vista Días
            </button>
            <button 
              onClick={() => setZoom('weeks')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${zoom === 'weeks' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Vista Semanas
            </button>
          </div>

          {/* Timeline scroll buttons */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button 
              onClick={() => scrollTimeline('left')}
              className="p-1.5 rounded-md hover:bg-slate-200 border border-slate-200 bg-white shadow-sm transition-colors"
              title="Desplazar izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button 
              onClick={() => scrollTimeline('right')}
              className="p-1.5 rounded-md hover:bg-slate-200 border border-slate-200 bg-white shadow-sm transition-colors"
              title="Desplazar derecha"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Haz clic en cualquier barra o actividad para editarla.
          </span>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" /> Salir Pantalla Completa
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" /> Ventana Completa
              </>
            )}
          </button>
        </div>
      </div>

      {/* TABLE & TIMELINE CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Task Details */}
        <div className="w-[380px] shrink-0 border-r border-slate-200 flex flex-col bg-white select-none">
          {/* Header */}
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50/50">
            <span className="font-semibold text-slate-700 text-sm">Detalle de Actividad</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Progreso</span>
          </div>
          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {tasks.map(task => {
              const isCompleted = task.progress === 100
              const isExpanded = expandedTasks[task.id]

              return (
                <div key={task.id} className="flex flex-col hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center min-h-[56px] px-3 gap-2">
                    {/* Collapsible toggle */}
                    <button 
                      onClick={() => toggleTask(task.id)} 
                      className="text-slate-400 hover:text-slate-700 focus:outline-none shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {/* Task details */}
                    <div 
                      onClick={() => openEditModal(task)}
                      className="flex-1 min-w-0 cursor-pointer pr-2"
                    >
                      <h4 className="text-xs font-semibold text-slate-800 truncate" title={task.name}>
                        {task.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <User className="w-2.5 h-2.5" /> {task.technician?.name || 'Sin asignar'}
                      </p>
                    </div>

                    {/* Edit button */}
                    <button 
                      onClick={() => openEditModal(task)}
                      className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
                      title="Editar actividad"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Progress Badge */}
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md shrink-0 w-11 text-center select-none ${
                      isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.progress}%
                    </span>
                  </div>

                  {/* Expanded Subtasks */}
                  {isExpanded && (
                    <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100/60 divide-y divide-slate-100/50">
                      {task.subtasks && task.subtasks.length > 0 ? (
                        task.subtasks.map(st => (
                          <div 
                            key={st.id} 
                            onClick={() => handleToggleSubtask(st.id, !st.isCompleted)}
                            className="flex items-center gap-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                          >
                            {st.isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-blue-500 shrink-0" />
                            )}
                            <span className={`truncate ${st.isCompleted ? 'line-through text-slate-400' : ''}`}>
                              {st.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 py-1 flex items-center gap-1">
                          <Info className="w-3 h-3" /> No hay subtareas registradas.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Timeline Gantt */}
        <div 
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative flex flex-col bg-white"
        >
          {/* Header */}
          <div className="h-14 border-b border-slate-200 flex bg-slate-50/50 shrink-0 min-w-max">
            {headerCols}
          </div>

          {/* Timeline Grid & Bars */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-w-max relative select-none">
            {/* Background Grid columns */}
            <div className="absolute inset-y-0 left-0 flex pointer-events-none z-0">
              {bgCols}
            </div>

            {/* Rows */}
            {tasks.map(task => {
              const startDate = task.startDate ? new Date(task.startDate) : null
              const endDate = task.endDate ? new Date(task.endDate) : null
              
              let widthPx = 0
              let startPx = 0

              if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const startOffset = Math.max(0, differenceInDays(startDate, chartStart))
                const duration = Math.max(1, differenceInDays(endDate, startDate))
                startPx = startOffset * dayWidth
                widthPx = duration * dayWidth
              }

              const isCompleted = task.progress === 100
              const barColor = isCompleted 
                ? 'from-emerald-400 to-emerald-500 border-emerald-600/60 shadow-emerald-100 text-emerald-800' 
                : 'from-blue-500 to-indigo-500 border-blue-600/60 shadow-blue-100 text-blue-800'
                
              const isExpanded = expandedTasks[task.id]

              return (
                <div key={task.id} className="relative flex flex-col">
                  {/* Main Gantt Row */}
                  <div className="h-[56px] relative flex items-center z-10">
                    {/* Gantt Bar */}
                    {widthPx > 0 ? (
                      <div 
                        onClick={() => openEditModal(task)}
                        className={`absolute h-8 rounded-lg shadow-sm border bg-gradient-to-r ${barColor} opacity-90 hover:opacity-100 transition-all flex items-center justify-start overflow-hidden hover:shadow-md hover:scale-[1.01] cursor-pointer`}
                        style={{ left: `${startPx}px`, width: `${widthPx}px` }}
                      >
                        {/* Progress fill */}
                        <div 
                          className="h-full bg-white/20 border-r border-white/10" 
                          style={{ width: `${task.progress}%` }} 
                        />
                        {/* Progress tag inside bar if it fits */}
                        {widthPx > 50 && (
                          <span className="absolute left-2.5 text-[10px] font-bold text-white drop-shadow-sm select-none truncate">
                            {task.progress}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <div 
                        onClick={() => openEditModal(task)}
                        className="absolute left-4 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-semibold cursor-pointer flex items-center gap-1 hover:bg-slate-200"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Sin rango de fechas
                      </div>
                    )}
                  </div>

                  {/* Spacer for expanded subtasks list to match heights with left panel */}
                  {isExpanded && (
                    <div 
                      className="bg-slate-50/20 border-t border-slate-100/30"
                      style={{ 
                        height: `${Math.max(34, (task.subtasks?.length || 1) * 32)}px` 
                      }}
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

  return (
    <>
      {/* STANDARD INLINE VIEW */}
      <div className="w-full h-[520px] overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
        {ganttContent}
      </div>

      {/* FULLSCREEN DASHBOARD MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-full max-w-[94vw] h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            {/* Fullscreen Header banner */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Maximize2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Modo Pantalla Completa: Gantt Interactivo</h3>
                  <p className="text-xs text-slate-400">Cronograma general de actividades y seguimiento de proyectos</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Render Gantt inside fullscreen dialog */}
            <div className="flex-1 overflow-hidden">
              {ganttContent}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY DETAIL & EDITING MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Detalle de Actividad</h3>
                  <p className="text-xs text-slate-500">Configuración, fechas y progreso del cronograma</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
              
              {/* Task name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre de la Actividad</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 text-sm shadow-sm transition-all"
                />
              </div>

              {/* Grid: Dates, Technician, Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Fecha Inicio
                  </label>
                  <input 
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-sm shadow-sm transition-all"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Fecha Fin
                  </label>
                  <input 
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-sm shadow-sm transition-all"
                  />
                </div>

                {/* Technician assignment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Técnico Encargado
                  </label>
                  <select
                    value={editTechId}
                    onChange={(e) => setEditTechId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-sm bg-white shadow-sm transition-all"
                  >
                    <option value="">Sin Asignar</option>
                    {technicians.map(tc => (
                      <option key={tc.id} value={tc.id}>{tc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-sm bg-white shadow-sm transition-all"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="skipped">Omitido</option>
                  </select>
                </div>

                {/* Hours estimated */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Horas Estimadas
                  </label>
                  <input 
                    type="number"
                    min="0"
                    value={editHours}
                    onChange={(e) => setEditHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-sm shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Progress Bar slider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Porcentaje de Progreso</label>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    editProgress === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {editProgress}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Subtasks Hierarchy section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Subtareas / Checklist</span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {selectedTask.subtasks ? selectedTask.subtasks.filter(s => s.isCompleted).length : 0} de {selectedTask.subtasks?.length || 0} completadas
                  </span>
                </label>
                
                {/* List of subtasks */}
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm bg-white max-h-48 overflow-y-auto">
                  {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                    selectedTask.subtasks.map(st => (
                      <div 
                        key={st.id} 
                        onClick={() => handleToggleSubtask(st.id, !st.isCompleted)}
                        className="flex items-center justify-between p-3 hover:bg-slate-50/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {st.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 hover:text-blue-500 shrink-0" />
                          )}
                          <span className={`text-xs font-medium truncate ${st.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {st.name}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No hay subtareas para esta actividad
                    </div>
                  )}
                </div>

                {/* Add new subtask form inline */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Escribe una nueva subtarea..."
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') handleAddSubtask() }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 shadow-sm transition-all"
                  />
                  <button 
                    onClick={handleAddSubtask}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-all hover:scale-[1.02]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notas de Campo</label>
                <textarea 
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Detalles sobre fallas, observaciones del técnico o comentarios adicionales..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-xs shadow-sm transition-all resize-none"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-100 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Guardar Cambios
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
