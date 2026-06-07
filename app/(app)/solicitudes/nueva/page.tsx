import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRequest, getClientsAndAssets } from '@modules/M10_service_requests/actions'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Nueva Solicitud — AgroMaint Pro' }

export default async function NewServiceRequestPage() {
  const { clients, assets } = await getClientsAndAssets()
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link href="/solicitudes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Solicitudes
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nueva Solicitud de Servicio</h1>
      </div>
      <form action={createServiceRequest} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
          <input name="title" required placeholder="Falla en sistema hidráulico" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea name="description" rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select name="serviceType" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="corrective">Correctivo</option>
              <option value="preventive">Preventivo</option>
              <option value="warranty">Garantía</option>
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
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
          <select name="clientId" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">Sin cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Equipo</label>
          <select name="assetId" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">Sin equipo</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.internalCode} — {a.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Enviar Solicitud</button>
          <Link href="/solicitudes" className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
