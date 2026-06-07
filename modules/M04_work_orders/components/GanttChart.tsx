'use client'

import { useState } from 'react'
import { format, differenceInDays, addDays, isBefore, isAfter, max, min } from 'date-fns'
import { es } from 'date-fns/locale'

interface Task {
  id: string
  name: string
  startDate: Date | null
  endDate: Date | null
  progress: number
  technician?: { name: string } | null
  status: string
}

export function GanttChart({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <p className="text-sm text-slate-500">No hay actividades definidas.</p>

  // Determinar el rango total del proyecto
  const validStarts = tasks
    .map(t => t.startDate ? new Date(t.startDate) : null)
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    
  const validEnds = tasks
    .map(t => t.endDate ? new Date(t.endDate) : null)
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
  
  if (!validStarts.length || !validEnds.length) {
    return <p className="text-sm text-slate-500">No hay fechas válidas suficientes para graficar el Gantt.</p>
  }

  const projectStart = min(validStarts)
  const projectEnd = max(validEnds)
  
  // Agregar un margen visual
  const chartStart = addDays(projectStart, -2)
  const chartEnd = addDays(projectEnd, 5)
  const totalDays = Math.max(1, differenceInDays(chartEnd, chartStart))

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[800px] p-4">
        {/* Cabecera del Gantt */}
        <div className="flex border-b border-slate-200 pb-2 mb-4">
          <div className="w-1/3 font-medium text-slate-700 text-sm">Actividad</div>
          <div className="w-2/3 relative flex">
            {/* Etiquetas de días/meses */}
            {Array.from({ length: totalDays + 1 }).map((_, i) => {
              const currentDate = addDays(chartStart, i)
              // Mostrar fecha cada 3 días o si es inicio/fin para no amontonar
              const showDate = i % 3 === 0 || i === 0 || i === totalDays
              return (
                <div key={i} className="flex-1 text-[10px] text-slate-400 border-l border-slate-100 pl-1 h-6 relative">
                  {showDate && <span className="absolute -top-3">{format(currentDate, 'd MMM', { locale: es })}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Filas de Tareas */}
        <div className="relative flex flex-col gap-4 pt-2">
          {/* Grid lines (background) */}
          <div className="absolute inset-0 flex pointer-events-none z-0" style={{ marginLeft: '33.333333%' }}>
            {Array.from({ length: totalDays + 1 }).map((_, i) => (
              <div key={i} className="flex-1 border-l border-slate-100/60 h-full"></div>
            ))}
          </div>

          {tasks.map(task => {
            if (!task.startDate || !task.endDate) return null
            
            const startDate = new Date(task.startDate)
            const endDate = new Date(task.endDate)
            
            // Skip invalid dates to prevent NaN rendering issues
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null
            
            const startOffset = differenceInDays(startDate, chartStart)
            const duration = differenceInDays(endDate, startDate) || 1
            const startPercentage = Math.max(0, (startOffset / totalDays) * 100)
            const widthPercentage = Math.min(100 - startPercentage, (duration / totalDays) * 100)

            const isCompleted = task.progress === 100
            const barColor = isCompleted 
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 border-emerald-600' 
              : 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-600'

            return (
              <div key={task.id} className="flex items-center text-sm group relative z-10">
                <div className="w-1/3 pr-4 truncate">
                  <p className="font-medium text-slate-800 truncate">{task.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{task.technician?.name || 'Sin asignar'}</p>
                </div>
                <div className="w-2/3 relative h-10 rounded flex items-center hover:bg-slate-50/50 transition-colors">
                  {/* Barra del Gantt */}
                  <div
                    className={`absolute h-7 rounded-md shadow-sm border ${barColor} opacity-90 group-hover:opacity-100 transition-all flex items-center justify-start overflow-hidden hover:shadow-md hover:scale-[1.01] cursor-pointer`}
                    style={{ left: `${startPercentage}%`, width: `${widthPercentage}%` }}
                    title={`${task.name} (${task.progress}%)`}
                  >
                    {/* Indicador de Progreso Interno */}
                    <div 
                      className="h-full bg-white/30 relative" 
                      style={{ width: `${task.progress}%` }} 
                    >
                      <div className="absolute inset-y-0 right-0 w-1 bg-white/50" />
                    </div>
                  </div>
                  
                  {/* Etiqueta de Porcentaje (flotante) */}
                  <span 
                    className="absolute text-[11px] font-bold text-slate-700 bg-white shadow-sm border border-slate-200 px-1.5 py-0.5 rounded-md transition-all z-20"
                    style={{ left: `${Math.min(95, startPercentage + widthPercentage + 1)}%` }}
                  >
                    {task.progress}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
