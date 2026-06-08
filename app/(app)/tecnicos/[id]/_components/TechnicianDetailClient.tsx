'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ChevronLeft, 
  HardHat, 
  ClipboardList, 
  FolderKanban, 
  Clock, 
  TrendingUp, 
  Edit, 
  Phone, 
  Mail, 
  BookOpen, 
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { formatDate } from '@core/lib/utils'

const LEVEL_MAP: Record<string, { label: string; cls: string }> = {
  junior:     { label: 'Junior',      cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
  mid:        { label: 'Intermedio',  cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  senior:     { label: 'Senior',      cls: 'bg-violet-50 text-violet-750 border border-violet-200' },
  specialist: { label: 'Especialista',cls: 'bg-amber-50 text-amber-750 border border-amber-200' },
}

interface TechnicianDetailClientProps {
  tech: any
}

export function TechnicianDetailClient({ tech }: TechnicianDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'orders'>('tasks')

  const levelInfo = LEVEL_MAP[tech.level ?? 'junior'] ?? LEVEL_MAP.junior

  // Parse lists stored as JSON strings
  const specialtyList = useMemo(() => {
    try {
      return JSON.parse(tech.specialty || '[]')
    } catch {
      return []
    }
  }, [tech.specialty])

  const certificationsList = useMemo(() => {
    try {
      return JSON.parse(tech.certifications || '[]')
    } catch {
      return []
    }
  }, [tech.certifications])

  const coursesList = useMemo(() => {
    try {
      return JSON.parse(tech.courses || '[]')
    } catch {
      return []
    }
  }, [tech.courses])

  // Extract tasks and compute unique work orders
  const tasks = useMemo(() => tech.tasks || [], [tech.tasks])

  const workOrders = useMemo(() => {
    const map = new Map()
    tasks.forEach((t: any) => {
      if (t.workOrder) {
        map.set(t.workOrder.id, t.workOrder)
      }
    })
    return Array.from(map.values())
  }, [tasks])

  // Differentiate between Projects (corrective OTs) and other Work Orders
  const projects = useMemo(() => {
    return workOrders.filter(wo => wo.type === 'corrective')
  }, [workOrders])

  const standardOrders = useMemo(() => {
    return workOrders.filter(wo => wo.type !== 'corrective')
  }, [workOrders])

  // Calculate individual indicators (KPIs)
  const stats = useMemo(() => {
    const totalTasksCount = tasks.length
    const completedTasksCount = tasks.filter((t: any) => t.status === 'completed' || t.progress === 100).length
    const pendingTasksCount = totalTasksCount - completedTasksCount

    const totalHours = tasks.reduce((sum: number, t: any) => sum + (t.actualHours || 0), 0)

    const activeProjectsCount = projects.filter(p => !['closed', 'cancelled'].includes(p.status)).length

    const activeTasks = tasks.filter((t: any) => t.status !== 'completed' && t.progress < 100)
    const avgProgress = activeTasks.length > 0
      ? activeTasks.reduce((sum: number, t: any) => sum + (t.progress || 0), 0) / activeTasks.length
      : 0

    return {
      totalTasksCount,
      completedTasksCount,
      pendingTasksCount,
      totalHours,
      activeProjectsCount,
      avgProgress
    }
  }, [tasks, projects])

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/tecnicos" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-650 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0052cc] text-white text-xl font-black shadow-md shadow-blue-600/10 shrink-0">
            {tech.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-800 leading-tight">{tech.name}</h1>
              {tech.internalCode && (
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
                  {tech.internalCode}
                </span>
              )}
              {levelInfo && (
                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${levelInfo.cls}`}>
                  {levelInfo.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-450 mt-0.5 font-bold uppercase tracking-wider">
              {tech.position || 'Técnico de Campo'} · Años de Exp: {tech.yearsOfExperience || 0}
            </p>
          </div>
        </div>

        <Link
          href={`/tecnicos/${tech.id}/editar`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
        >
          <Edit className="h-4 w-4" /> Editar Perfil
        </Link>
      </div>

      {/* METRICS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Proyectos Activos */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">PROYECTOS ACTIVOS</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-[#0052cc]">{stats.activeProjectsCount}</span>
              <span className="text-xs text-slate-400 font-bold ml-1">En ejecución</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#0052cc]">
            <FolderKanban size={20} />
          </div>
        </div>

        {/* KPI 2: Tareas Pendientes */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">TAREAS PENDIENTES</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-amber-600">{stats.pendingTasksCount}</span>
              <span className="text-xs text-slate-400 font-bold ml-1">De {stats.totalTasksCount} totales</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <ClipboardList size={20} />
          </div>
        </div>

        {/* KPI 3: Horas Laboradas */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">HORAS REALES</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-[#10b981]">{Math.round(stats.totalHours)}h</span>
              <span className="text-xs text-slate-400 font-bold ml-1">Registradas</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-[#10b981]">
            <Clock size={20} />
          </div>
        </div>

        {/* KPI 4: Progreso Promedio Actividades */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">PROGRESO PROM.</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-indigo-700">{Math.round(stats.avgProgress)}%</span>
              <span className="text-xs text-slate-400 font-bold ml-1">Tareas activas</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-650">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Profile Info */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Card 1: Contact Info */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Información del Perfil</h3>
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Teléfono</p>
                <p className="font-bold text-slate-700">{tech.phone || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Correo Electrónico</p>
                <p className="font-bold text-slate-700 truncate">{tech.email || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Nivel de Formación</p>
                <p className="font-bold text-slate-700">{tech.educationLevel || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Años de Experiencia</p>
                <p className="font-bold text-slate-700">{tech.yearsOfExperience || 0} años de servicio</p>
              </div>
            </div>
          </div>

          {/* Card 2: Specialties */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Especialidades</h3>
            <div className="flex flex-wrap gap-1.5">
              {specialtyList.length > 0 ? (
                specialtyList.map((item: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center rounded-lg bg-blue-50/50 border border-blue-100/30 px-2.5 py-1 text-xs font-bold text-[#0052cc]">
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Sin especialidades registradas</p>
              )}
            </div>
          </div>

          {/* Card 3: Courses */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" /> Cursos Realizados
            </h3>
            {coursesList.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {coursesList.map((item: string, idx: number) => (
                  <li key={idx} className="font-bold text-slate-700 flex items-start gap-2 before:content-['•'] before:text-blue-600 before:font-bold">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin cursos registrados</p>
            )}
          </div>

          {/* Card 4: Certifications */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#10b981]" /> Certificaciones
            </h3>
            {certificationsList.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {certificationsList.map((item: string, idx: number) => (
                  <li key={idx} className="font-bold text-slate-700 flex items-start gap-2 before:content-['•'] before:text-[#10b981] before:font-bold">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin certificaciones registradas</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Listings */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Tab Selector */}
          <div className="inline-flex rounded-xl border border-slate-200/60 bg-slate-100/80 p-1 shadow-sm text-xs select-none self-start">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tasks' ? 'bg-white text-[#0052cc] shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Tareas / Actividades ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'projects' ? 'bg-white text-[#0052cc] shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderKanban className="w-4 h-4" /> Proyectos ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'bg-white text-[#0052cc] shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" /> Órdenes OTs ({standardOrders.length})
            </button>
          </div>

          {/* Tab Content 1: Tareas / Actividades */}
          {activeTab === 'tasks' && (
            <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Actividades del Técnico</h3>
              </div>
              {tasks.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-650">Sin actividades asignadas</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{task.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{task.description || 'Sin descripción'}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          task.status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {task.status === 'completed' ? 'Completado' : 'Pendiente'}
                        </span>
                      </div>
                      
                      {/* Task parent work order info */}
                      {task.workOrder && (
                        <div className="flex justify-between items-center text-xs mt-1 bg-slate-50 border border-slate-100 p-2 rounded-lg">
                          <div>
                            <span className="text-slate-400 font-medium">Asociado a: </span>
                            <Link href={`/ordenes/${task.workOrder.id}`} className="font-bold text-[#0052cc] hover:underline">
                              {task.workOrder.number}
                            </Link>
                            <span className="text-slate-500 font-bold ml-1.5">{task.workOrder.title}</span>
                          </div>
                          {task.workOrder.dueDate && (
                            <span className="text-slate-400 font-medium">Límite: {formatDate(task.workOrder.dueDate)}</span>
                          )}
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="mt-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                          <span>Progreso de actividad</span>
                          <span>{task.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                            style={{ width: `${task.progress || 0}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content 2: Proyectos */}
          {activeTab === 'projects' && (
            <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Proyectos de Reparación Mayor</h3>
              </div>
              {projects.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-650">Sin proyectos correctivos asignados</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {projects.map((proj: any) => (
                    <Link href={`/proyectos/${proj.id}`} key={proj.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors block">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-[#0052cc] hover:underline">{proj.number}</h4>
                          <h5 className="text-xs font-bold text-slate-700 mt-0.5">{proj.title}</h5>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0052cc] border border-blue-100">
                          {proj.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">Cliente: </span>
                          <span className="font-bold">{proj.client?.name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Equipo: </span>
                          <span className="font-bold">{proj.asset?.internalCode || 'N/A'}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content 3: Órdenes */}
          {activeTab === 'orders' && (
            <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Órdenes de Mantenimiento Preventivo</h3>
              </div>
              {standardOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-650">Sin órdenes preventivas asignadas</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {standardOrders.map((ord: any) => (
                    <Link href={`/ordenes/${ord.id}`} key={ord.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors block">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-[#0052cc] hover:underline">{ord.number}</h4>
                          <h5 className="text-xs font-bold text-slate-700 mt-0.5">{ord.title}</h5>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {ord.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">Cliente: </span>
                          <span className="font-bold">{ord.client?.name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Programada: </span>
                          <span className="font-bold">{formatDate(ord.scheduledDate)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
