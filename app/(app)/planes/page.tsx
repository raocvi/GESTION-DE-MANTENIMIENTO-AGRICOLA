import type { Metadata } from 'next'
import Link from 'next/link'
import { getMaintenancePlans } from '@modules/M05_maintenance_plans/actions'
import { Wrench, Plus, Clock, CheckCircle, ChevronRight, AlertCircle, BookOpen } from 'lucide-react'

export const metadata: Metadata = { title: 'Planes de Mantenimiento — AgroMaint Pro' }

const PLAN_A9900 = [
  { interval: '10 h',   color: 'from-emerald-500 to-teal-600',  badge: 'bg-emerald-100 text-emerald-700', tasks: ['Revisar nivel aceite motor', 'Revisar nivel líquido refrigerante', 'Limpiar pre-filtro aire', 'Verificar sistema hidráulico'] },
  { interval: '50 h',   color: 'from-blue-500 to-indigo-600',   badge: 'bg-blue-100 text-blue-700',      tasks: ['Engrasar articulaciones y cojinetes', 'Revisar tensión correas', 'Limpiar filtro aire cabina'] },
  { interval: '250 h',  color: 'from-amber-500 to-orange-600',  badge: 'bg-amber-100 text-amber-700',    tasks: ['Cambio aceite motor (Shell Rimula R4 15W-40 - 30L)', 'Cambio filtro aceite motor', 'Cambio filtro combustible primario y secundario', 'Revisar sistema de frenos', 'Limpiar radiador'] },
  { interval: '500 h',  color: 'from-violet-500 to-purple-600', badge: 'bg-violet-100 text-violet-700',  tasks: ['Cambio aceite transmisión (Shell Spirax S4 ATF HDX - 42L)', 'Cambio aceite eje diferencial', 'Cambio filtro hidráulico retorno', 'Ajuste válvulas motor', 'Revisar baterías y sistema eléctrico'] },
  { interval: '1000 h', color: 'from-rose-500 to-pink-600',     badge: 'bg-rose-100 text-rose-700',      tasks: ['Cambio aceite sistema hidráulico', 'Cambio filtros hidráulicos completos', 'Inspección general motor', 'Cambio refrigerante (Shell Glycoshell AF -37)', 'Inspeccionar correas dentadas', 'Revisar inyectores combustible'] },
  { interval: '2000 h', color: 'from-slate-600 to-slate-800',   badge: 'bg-slate-100 text-slate-700',    tasks: ['Cambio aceite reductores de ruedas (Shell Spirax S4 ATF HDX)', 'Overhaul sistema de cosecha', 'Inspección toboganes y cóncavos', 'Calibración sistema electrónico AFS'] },
]

export default async function MaintenancePlansPage() {
  const plans = await getMaintenancePlans()

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-md shrink-0">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Planes de Mantenimiento</h1>
            <p className="text-sm text-slate-400 mt-0.5">Mantenimiento preventivo según fabricante CASE IH</p>
          </div>
        </div>
        <Link
          href="/planes/nuevo"
          className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Nuevo Plan
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Intervalos Definidos', value: PLAN_A9900.length, color: 'text-blue-600' },
          { label: 'Tareas Totales', value: PLAN_A9900.reduce((s, p) => s + p.tasks.length, 0), color: 'text-violet-600' },
          { label: 'Planes en DB', value: plans.length, color: 'text-emerald-600' },
          { label: 'Equipos Cubiertos', value: '3', color: 'text-amber-600' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Reference label */}
      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3">
        <BookOpen className="h-5 w-5 text-blue-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-blue-900">Plan Preventivo CASE IH A9900 — Referencia Oficial del Fabricante</p>
          <p className="text-xs text-blue-600 mt-0.5">Basado en el Manual de Operador y Mantenimiento A9900. Haz clic en cualquier intervalo para crear una OT.</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">Oficial</span>
      </div>

      {/* Plan grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PLAN_A9900.map((item, idx) => (
          <div key={item.interval} className="chart-card overflow-hidden animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
            {/* Card header with gradient */}
            <div className={`bg-gradient-to-r ${item.color} px-5 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">{item.interval}</p>
                    <p className="text-xs text-white/70 font-medium">Intervalo de servicio</p>
                  </div>
                </div>
                <span className="rounded-xl bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {item.tasks.length} tareas
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-4">
              <ul className="space-y-2">
                {item.tasks.map((task, ti) => (
                  <li key={ti} className="flex items-start gap-2.5 text-sm text-slate-600 group/task">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-slate-300 group-hover/task:text-emerald-500 transition-colors" />
                    <span className="leading-snug">{task}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/ordenes/nueva?type=preventive&title=Mantenimiento+${item.interval.replace(' ', '+')}+A9900`}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                Crear OT para este intervalo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* DB plans */}
      {plans.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-slate-400" />
            Planes Personalizados en Base de Datos
          </h2>
          <div className="chart-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre del Plan</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan: any) => (
                  <tr key={plan.id}>
                    <td className="font-semibold text-slate-800">{plan.name}</td>
                    <td><span className="status-pill bg-blue-100 text-blue-700">{plan.planType}</span></td>
                    <td><span className={`status-pill ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{plan.isActive ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <Link href={`/planes/${plan.id}`} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
                        Ver <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
