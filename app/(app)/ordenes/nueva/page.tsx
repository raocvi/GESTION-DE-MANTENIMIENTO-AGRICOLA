import type { Metadata } from 'next'
import Link from 'next/link'
import { createWorkOrder, getAssetsClientsTechnicians } from '@modules/M04_work_orders/actions'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Nueva Orden de Trabajo — AgroMaint Pro' }

export default async function NewWorkOrderPage({ searchParams }: { searchParams: Promise<{ type?: string, title?: string, assetId?: string }> }) {
  const { assets, clients, technicians } = await getAssetsClientsTechnicians()
  const resolvedSearchParams = await searchParams
  
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/ordenes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Órdenes de Trabajo
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nueva Orden de Trabajo</h1>
      </div>
      <form action={createWorkOrder} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Título de la OT *</label>
            <input name="title" defaultValue={resolvedSearchParams.title} required placeholder="Mantenimiento 250h CASE IH" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de OT</label>
            <select name="type" defaultValue={resolvedSearchParams.type || 'corrective'} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="preventive">Preventivo</option>
              <option value="corrective">Correctivo</option>
              <option value="predictive">Predictivo</option>
              <option value="inspection">Inspección</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
            <select name="priority" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="low">Baja</option>
              <option value="medium" selected>Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
              <option value="stopped">Equipo Detenido (AOG)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Equipo (Activo)</label>
            <select name="assetId" defaultValue={resolvedSearchParams.assetId} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Seleccionar Equipo...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.internalCode} - {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Finca</label>
            <select name="clientId" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Interno (Sin Cliente)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Técnico Asignado</label>
            <select name="technicianId" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Sin Asignar</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Notas Iniciales</label>
            <textarea name="description" rows={3} placeholder="Detalles de la falla, síntomas reportados o tareas a ejecutar..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Generar OT</button>
          <Link href="/ordenes" className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
