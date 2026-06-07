import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@core/lib/db'
import { formatDate } from '@core/lib/utils'
import { FolderKanban, Plus, Clock, Wrench, TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: 'Proyectos — AgroMaint Pro' }

export default async function ProjectsPage() {
  // Fetch only corrective work orders (projects)
  const projects = await db.workOrder.findMany({
    where: { type: 'corrective', isActive: true },
    include: {
      asset: true,
      client: true,
      tasks: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  // Sort projects: active first, then by date
  projects.sort((a, b) => {
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
    if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
    return 0;
  });

  // Calcular indicadores generales
  const activeProjects = projects.filter(p => p.status === 'in_progress').length
  const completedProjects = projects.filter(p => p.status === 'completed' || p.status === 'closed').length
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proyectos</h1>
          <p className="text-sm text-slate-500">Gestión de reparaciones mayores y mantenimientos correctivos</p>
        </div>
        <Link href="/ordenes/nueva?type=corrective" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nuevo Proyecto
        </Link>
      </div>

      {/* Indicadores Globales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-2"><FolderKanban className="h-5 w-5" /><h3 className="font-semibold text-slate-700">Proyectos Activos</h3></div>
          <p className="text-2xl font-bold text-slate-900">{activeProjects}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-2"><TrendingUp className="h-5 w-5" /><h3 className="font-semibold text-slate-700">Proyectos Completados</h3></div>
          <p className="text-2xl font-bold text-slate-900">{completedProjects}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 mb-2"><Clock className="h-5 w-5" /><h3 className="font-semibold text-slate-700">Total Actividades</h3></div>
          <p className="text-2xl font-bold text-slate-900">{totalTasks}</p>
        </div>
      </div>

      {/* Listado de Proyectos */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400">
          <FolderKanban className="h-12 w-12 mb-3" />
          <p className="font-medium">No hay proyectos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map(project => {
            const progressSum = project.tasks.reduce((sum, t) => sum + (t.progress || 0), 0)
            const overallProgress = project.tasks.length > 0 ? Math.round(progressSum / project.tasks.length) : 0

            return (
              <Link key={project.id} href={`/proyectos/${project.id}`} className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{project.number}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Cliente</span>
                    <span className="font-medium truncate">{project.client?.name || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Equipo</span>
                    <span className="font-medium">{project.asset?.internalCode || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Progreso Global</span>
                    <span className="font-semibold text-slate-700">{overallProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-blue-600 transition-all" style={{ width: `${overallProgress}%` }} />
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
