import type { Metadata } from 'next'
import Link from 'next/link'
import { createAsset } from '@modules/M03_assets/actions'
import { db } from '@core/lib/db'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Nuevo Activo — AgroMaint Pro' }

export default async function NewAssetPage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const resolvedParams = await searchParams
  const [brands, categories, clients] = await Promise.all([
    db.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    db.assetCategory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    db.client.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  ])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/activos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Equipos y Activos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Registrar Nuevo Equipo</h1>
      </div>
      <form action={createAsset} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código Interno *</label>
            <input name="internalCode" required placeholder="A9900-01" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Descripción *</label>
            <input name="name" required placeholder="Cosechadora de Caña A9900" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
            <select name="brandId" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Seleccionar...</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <select name="categoryId" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Seleccionar...</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Número de Serie (VIN)</label>
            <input name="serialNumber" placeholder="SN123456789" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Año de Fabricación</label>
            <input name="year" type="number" placeholder="2022" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Horómetro Inicial</label>
            <input name="currentHours" type="number" step="0.1" placeholder="0.0" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado Operativo</label>
            <select name="operativeStatus" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="operative">Operativo</option>
              <option value="maintenance">En mantenimiento</option>
              <option value="out_of_service">Fuera de servicio</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Asignar a Cliente (Opcional)</label>
            <select name="clientId" defaultValue={resolvedParams.clientId} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Flota Interna (Sin asignar)</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Guardar Equipo</button>
          <Link href="/activos" className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
