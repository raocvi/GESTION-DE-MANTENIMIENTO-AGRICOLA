import type { Metadata } from 'next'
import Link from 'next/link'
import { getMaintenancePlans } from '@modules/M05_maintenance_plans/actions'
import { CalendarDays, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Planes de Mantenimiento — AgroMaint Pro' }

// Plan A9900 precargado basado en el manual CASE IH
const PLAN_A9900 = [
  { interval: '10 h', tasks: ['Revisar nivel aceite motor', 'Revisar nivel líquido refrigerante', 'Limpiar pre-filtro aire', 'Verificar sistema hidráulico'] },
  { interval: '50 h', tasks: ['Engrasar articulaciones y cojinetes', 'Revisar tensión correas', 'Limpiar filtro aire cabina'] },
  { interval: '250 h', tasks: ['Cambio aceite motor (Shell Rimula R4 15W-40 - 30L)', 'Cambio filtro aceite motor', 'Cambio filtro combustible primario y secundario', 'Revisar sistema de frenos', 'Limpiar radiador'] },
  { interval: '500 h', tasks: ['Cambio aceite transmisión (Shell Spirax S4 ATF HDX - 42L)', 'Cambio aceite eje diferencial', 'Cambio filtro hidráulico retorno', 'Ajuste válvulas motor', 'Revisar baterías y sistema eléctrico'] },
  { interval: '1000 h', tasks: ['Cambio aceite sistema hidráulico', 'Cambio filtros hidráulicos completos', 'Inspección general motor', 'Cambio refrigerante (Shell Glycoshell AF -37)', 'Inspeccionar correas dentadas', 'Revisar inyectores combustible'] },
  { interval: '2000 h', tasks: ['Cambio aceite reductores de ruedas (Shell Spirax S4 ATF HDX)', 'Overhaul sistema de cosecha', 'Inspección toboganes y cóncavos', 'Calibración sistema electrónico AFS'] },
]

export default async function MaintenancePlansPage() {
  const plans = await getMaintenancePlans()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planes de Mantenimiento</h1>
          <p className="text-sm text-slate-500">Mantenimiento preventivo según fabricante CASE IH</p>
        </div>
        <Link href="/planes/nuevo" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nuevo Plan
        </Link>
      </div>

      {/* Plan A9900 precargado */}
      <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <h2 className="font-bold text-blue-900">Plan Preventivo CASE IH A9900 — Según Manual Fabricante</h2>
          <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">Referencia Oficial</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PLAN_A9900.map(item => (
            <div key={item.interval} className="rounded-xl border border-blue-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-bold text-white">{item.interval}</span>
                <span className="text-xs text-slate-500">{item.tasks.length} tareas</span>
              </div>
              <ul className="space-y-1">
                {item.tasks.map(task => (
                  <li key={task} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {task}
                  </li>
                ))}
              </ul>
              <Link
                href={`/ordenes/nueva?type=preventive&title=Mantenimiento+${item.interval.replace(' ','+')}+A9900`}
                className="mt-3 block w-full rounded-lg border border-blue-300 py-1.5 text-center text-xs font-medium text-blue-700 hover:bg-blue-50"
              >
                Crear OT para este intervalo →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Planes personalizados */}
      {plans.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Planes Personalizados</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {plans.map(plan => (
              <Link key={plan.id} href={`/planes/${plan.id}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                {plan.description && <p className="mt-1 text-sm text-slate-500">{plan.description}</p>}
                <div className="mt-3 flex gap-3 text-xs text-slate-500">
                  <span>{plan.tasks.length} tareas</span>
                  <span>{plan.assets.length} equipos asignados</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
