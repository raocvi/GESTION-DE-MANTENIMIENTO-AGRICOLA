import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTechnicianById } from '@modules/M07_technicians/actions'
import { formatDate } from '@core/lib/utils'
import { ChevronLeft, HardHat, ClipboardList } from 'lucide-react'

export const metadata: Metadata = { title: 'Técnico — AgroMaint Pro' }

const WO_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: 'Nueva', cls: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'En ejecución', cls: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Cerrada', cls: 'bg-emerald-100 text-emerald-700' },
}

export default async function TechnicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tech = await getTechnicianById(resolvedParams.id)
  if (!tech) notFound()

  const tasks = tech.tasks || []
  const uniqueWorkOrdersMap = new Map()
  tasks.forEach((t: any) => {
    if (t.workOrder) uniqueWorkOrdersMap.set(t.workOrder.id, t.workOrder)
  })
  const workOrders = Array.from(uniqueWorkOrdersMap.values()) as any[]

  const active = workOrders.filter(w => !['closed','cancelled'].includes(w.status)).length
  const completed = workOrders.filter(w => w.status === 'closed').length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/tecnicos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Técnicos
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-2xl font-bold">
            {tech.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{tech.name}</h1>
            <p className="text-slate-500">{tech.position ?? 'Técnico de Campo'} · Nivel: {tech.level}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Información de Contacto</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Teléfono</p>
                <p className="font-medium text-slate-900">{tech.phone || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{tech.email || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-slate-500">Nivel de Formación</p>
                <p className="font-medium text-slate-900">{tech.educationLevel || 'No registrado'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              {(() => {
                try {
                  const specs = JSON.parse(tech.specialty || '[]');
                  if (!Array.isArray(specs) || specs.length === 0) return <p className="text-sm text-slate-400">Sin especialidades registradas</p>;
                  return specs.map((s: string, i: number) => <span key={i} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{s}</span>);
                } catch {
                  return <p className="text-sm text-slate-400">Error al leer especialidades</p>;
                }
              })()}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Certificaciones</h2>
            <ul className="space-y-2">
              {(() => {
                try {
                  const certs = JSON.parse(tech.certifications || '[]');
                  if (!Array.isArray(certs) || certs.length === 0) return <p className="text-sm text-slate-400">Sin certificaciones registradas</p>;
                  return certs.map((c: string, i: number) => <li key={i} className="text-sm font-medium text-slate-700 before:content-['•'] before:mr-2 before:text-blue-500">{c}</li>);
                } catch {
                  return <p className="text-sm text-slate-400">Error al leer certificaciones</p>;
                }
              })()}
            </ul>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Cursos Realizados</h2>
            <ul className="space-y-2">
              {(() => {
                try {
                  const courses = JSON.parse(tech.courses || '[]');
                  if (!Array.isArray(courses) || courses.length === 0) return <p className="text-sm text-slate-400">Sin cursos registrados</p>;
                  return courses.map((c: string, i: number) => <li key={i} className="text-sm font-medium text-slate-700 before:content-['•'] before:mr-2 before:text-blue-500">{c}</li>);
                } catch {
                  return <p className="text-sm text-slate-400">Error al leer cursos</p>;
                }
              })()}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[['OTs totales', workOrders.length, 'text-slate-900'], ['Activas', active, 'text-amber-600'], ['Completadas', completed, 'text-emerald-600']].map(([l, v, c]) => (
              <div key={String(l)} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <p className={`text-3xl font-bold ${c}`}>{String(v)}</p>
                <p className="text-xs text-slate-500 mt-1">{String(l)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Órdenes Asignadas</h2>
            </div>
            {workOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Sin órdenes asignadas</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {workOrders.map((wo: any) => {
                  const ws = WO_STATUS[wo.status] ?? { label: wo.status, cls: 'bg-slate-100 text-slate-700' }
                  return (
                    <Link key={wo.id} href={`/ordenes/${wo.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{wo.number}</p>
                        <p className="text-xs text-slate-500">{wo.asset?.internalCode} · {wo.client?.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ws.cls}`}>{ws.label}</span>
                        <span className="text-xs text-slate-400">{formatDate(wo.scheduledDate)}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
