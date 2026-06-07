import type { Metadata } from 'next'
import Link from 'next/link'
import { createMaintenancePlan } from '@modules/M05_maintenance_plans/actions'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Nuevo Plan — AgroMaint Pro' }

export default function NewPlanPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link href="/planes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Planes de Mantenimiento
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nuevo Plan de Mantenimiento</h1>
      </div>
      <form action={createMaintenancePlan} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del plan *</label>
          <input name="name" required placeholder="Plan Preventivo A9900 — Temporada 2026" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea name="description" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <select name="category" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="preventive">Preventivo</option>
              <option value="predictive">Predictivo</option>
              <option value="conditional">Condicional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unidad de medida</label>
            <select name="baseIntervalType" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="hours">Horas (horómetro)</option>
              <option value="days">Días</option>
              <option value="months">Meses</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Crear Plan</button>
          <Link href="/planes" className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
