'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { createProjectActivity, createProjectSubtask, toggleProjectSubtask, updateTaskProgress } from '@modules/M04_work_orders/actions'
import { formatDate } from '@core/lib/utils'

export function ActivitiesManager({ project, tasks, users }: { project: any, tasks: any[], users: any[] }) {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({})

  // Group tasks by System -> Component
  const grouped: Record<string, Record<string, any[]>> = {}
  tasks.forEach(t => {
    const sys = t.system || 'General'
    const comp = t.component || 'General'
    if (!grouped[sys]) grouped[sys] = {}
    if (!grouped[sys][comp]) grouped[sys][comp] = []
    grouped[sys][comp].push(t)
  })

  const toggleSystem = (sys: string) => {
    setExpandedSystems(prev => ({ ...prev, [sys]: !prev[sys] }))
  }

  const SYSTEMS = [
    'Sistema Motor', 'Sistema Hidráulico', 'Sistema de Transmisión / Rodaje', 
    'Sistema Eléctrico / Electrónico', 'Sistema de Corte Base', 'Sistema de Alimentación', 
    'Sistema de Troceado', 'Sistema de Extracción', 'Sistema de Elevación', 'Cabina y Estructura'
  ]

  const handleCreateActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createProjectActivity({
      workOrderId: project.id,
      name: formData.get('name') as string,
      system: formData.get('system') as string,
      component: formData.get('component') as string,
      technicianId: formData.get('technicianId') as string || undefined,
      startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string) : undefined,
      endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string) : undefined,
    })
    setIsAddingTask(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">Actividades por Sistema</h3>
        <button onClick={() => setIsAddingTask(!isAddingTask)} className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100 flex items-center gap-1">
          <Plus className="w-4 h-4" /> {isAddingTask ? 'Cancelar' : 'Nueva Actividad'}
        </button>
      </div>

      {isAddingTask && (
        <form onSubmit={handleCreateActivity} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-4">
          <h4 className="font-medium text-slate-800">Registrar Nueva Actividad</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-slate-500 mb-1">Nombre de la Tarea/Actividad</label>
              <input required name="name" type="text" className="w-full border-slate-200 rounded-md shadow-sm" placeholder="Ej: Cambio de filtros" />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Sistema</label>
              <select required name="system" className="w-full border-slate-200 rounded-md shadow-sm">
                <option value="">Seleccionar sistema...</option>
                {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Componente específico</label>
              <input required name="component" type="text" className="w-full border-slate-200 rounded-md shadow-sm" placeholder="Ej: Bomba Principal" />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Técnico Asignado (Opcional)</label>
              <select name="technicianId" className="w-full border-slate-200 rounded-md shadow-sm">
                <option value="">Sin asignar</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Fecha Inicio (Opcional)</label>
              <input name="startDate" type="date" className="w-full border-slate-200 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Fecha Fin (Opcional)</label>
              <input name="endDate" type="date" className="w-full border-slate-200 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Horas Estimadas</label>
              <input required name="/*estimatedHours*/" type="number" min="1" step="0.5" className="w-full border-slate-200 rounded-md shadow-sm" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
              Guardar Actividad
            </button>
          </div>
        </form>
      )}

      {Object.entries(grouped).map(([system, components]) => (
        <div key={system} className="border border-slate-200 rounded-lg overflow-hidden">
          <div 
            className="bg-slate-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100"
            onClick={() => toggleSystem(system)}
          >
            <span className="font-medium text-slate-800">{system}</span>
            {expandedSystems[system] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </div>
          
          {expandedSystems[system] && (
            <div className="p-4 space-y-6 bg-white">
              {Object.entries(components).map(([component, compTasks]) => (
                <div key={component}>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{component}</h4>
                  <div className="space-y-3">
                    {compTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TaskCard({ task }: { task: any }) {
  const [progress, setProgress] = useState(task.progress || 0)
  const isCompleted = progress === 100

  const handleProgressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    setProgress(val)
    await updateTaskProgress(task.id, val)
  }

  return (
    <div className="border border-slate-100 rounded-lg p-4 bg-white shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-slate-900">{task.name}</h4>
          <p className="text-xs text-slate-500 mt-1">Técnico: {task.technician?.name || 'Sin asignar'}</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="range" min="0" max="100" step="10" 
            value={progress} 
            onChange={handleProgressChange}
            className="w-24 accent-blue-600"
          />
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
            {progress}%
          </span>
        </div>
      </div>
      
      <div className="flex gap-4 text-xs text-slate-600 border-t border-slate-50 pt-2">
        <span>Inicio: {task.startDate ? formatDate(task.startDate) : '--'}</span>
        <span>Fin: {task.endDate ? formatDate(task.endDate) : '--'}</span>
        <span>Hrs Estimadas: {task.estimatedHours || 0}</span>
      </div>

      {/* Subtasks */}
      <div className="mt-2 pl-4 border-l-2 border-slate-100 space-y-1">
        {task.subtasks?.map((st: any) => (
          <div key={st.id} className="flex items-center gap-2 text-sm text-slate-700" onClick={() => toggleProjectSubtask(st.id, !st.isCompleted)}>
            {st.isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-500 cursor-pointer" /> : <Circle className="w-4 h-4 text-slate-300 cursor-pointer hover:text-blue-500" />}
            <span className={st.isCompleted ? 'line-through text-slate-400' : ''}>{st.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
