import type { Metadata } from 'next'
import Link from 'next/link'
import { getClients } from '@modules/M06_clients/actions'
import { Building2, Plus, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Clientes — AgroMaint Pro' }

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const resolvedParams = await searchParams;
  const clients = await getClients(resolvedParams.search)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">{clients.length} clientes activos</p>
        </div>
        <Link href="/clientes/nuevo" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Link>
      </div>
      <form method="GET" className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input name="search" defaultValue={resolvedParams.search} placeholder="Buscar nombre, ciudad, contacto..." className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Buscar</button>
      </form>
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400">
          <Building2 className="h-12 w-12 mb-3" />
          <p className="font-medium">No hay clientes registrados</p>
          <Link href="/clientes/nuevo" className="mt-3 text-sm text-blue-600 hover:underline">Registrar primer cliente</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map(client => {
            const operative = client.assets.filter(a => a.operativeStatus === 'operative').length
            return (
              <Link key={client.id} href={`/clientes/${client.id}`} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.city}, {client.department}</p>
                    </div>
                  </div>
                </div>
                {client.contactName && <p className="mt-3 text-sm text-slate-600">👤 {client.contactName}</p>}
                {client.phone && <p className="text-sm text-slate-500">📞 {client.phone}</p>}
                <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">{client.assets.length} equipo{client.assets.length !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-emerald-600">{operative} operativo{operative !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
