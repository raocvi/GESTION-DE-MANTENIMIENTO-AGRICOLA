import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWorkOrderById } from '@modules/M04_work_orders/actions'
import { formatDate } from '@core/lib/utils'
import { ChevronLeft, FolderKanban, Wrench, Calendar, BarChart3 } from 'lucide-react'
import { InteractiveGantt } from './_components/InteractiveGantt'
import { db } from '@core/lib/db'

export const metadata: Metadata = { title: 'Detalle de Proyecto — AgroMaint Pro' }

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getWorkOrderById(resolvedParams.id)
  
  if (!project || project.type !== 'corrective') {
    notFound()
  }

  const tasks = project.tasks || []
  const progressSum = tasks.reduce((sum, t) => sum + (t.progress || 0), 0)
  const overallProgress = tasks.length > 0 ? Math.round(progressSum / tasks.length) : 0

  const technicians = await db.technician.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/proyectos" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 uppercase">
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-slate-500">{project.number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Panel Lateral: Info */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Resumen</h2>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Progreso Global</span>
                <span className="font-semibold text-slate-900">{overallProgress}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Cliente</dt>
                <dd className="font-medium text-slate-900">{project.client?.name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Equipo</dt>
                <dd className="font-medium text-slate-900">{project.asset?.internalCode} - {project.asset?.name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> Inicio Est.</dt>
                  <dd className="font-medium text-slate-900">{project.scheduledDate ? formatDate(project.scheduledDate) : '--'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> Fin Est.</dt>
                  <dd className="font-medium text-slate-900">{project.dueDate ? formatDate(project.dueDate) : '--'}</dd>
                </div>
              </div>
              <div>
                <dt className="text-slate-500">Descripción</dt>
                <dd className="text-slate-700 mt-1">{project.description || 'Sin descripción'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Panel Principal: Gantt y Tareas */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Gantt Chart Integrado */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><FolderKanban className="w-4 h-4"/> Cronograma y Actividades del Proyecto</h2>
            <InteractiveGantt tasks={tasks} technicians={technicians} />
          </div>

        </div>
      </div>
    </div>
  )
}
