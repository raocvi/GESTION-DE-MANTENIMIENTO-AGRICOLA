import type { Metadata } from 'next'
import Link from 'next/link'
import { getTechnicians } from '@modules/M07_technicians/actions'
import { HardHat, Plus, ClipboardCheck, Wrench, ArrowRight, Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Técnicos — AgroMaint Pro' }

const LEVEL_MAP: Record<string, { label: string; cls: string; dotCls: string }> = {
  junior:     { label: 'Junior',       cls: 'bg-slate-100 text-slate-600',   dotCls: 'bg-slate-400' },
  mid:        { label: 'Intermedio',   cls: 'bg-blue-100 text-blue-700',     dotCls: 'bg-blue-500' },
  senior:     { label: 'Senior',       cls: 'bg-violet-100 text-violet-700', dotCls: 'bg-violet-500' },
  specialist: { label: 'Especialista', cls: 'bg-amber-100 text-amber-700',   dotCls: 'bg-amber-500' },
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
]

export default async function TechniciansPage() {
  const technicians = await getTechnicians()

  const stats = {
    total: technicians.length,
    senior: technicians.filter((t: any) => t.level === 'senior' || t.level === 'specialist').length,
    withOrders: technicians.filter((t: any) => (t.tasks || []).length > 0).length,
    totalOrders: technicians.reduce((s: number, t: any) => s + new Set((t.tasks || []).map((tk: any) => tk.workOrder?.id).filter(Boolean)).size, 0),
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-md shrink-0">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Técnicos</h1>
            <p className="text-sm text-slate-400 mt-0.5">{technicians.length} técnicos en el sistema</p>
          </div>
        </div>
        <Link
          href="/tecnicos/nuevo"
          className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Nuevo Técnico
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Técnicos', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Senior / Especialistas', value: stats.senior, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Con OT Activas', value: stats.withOrders, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'OTs Asignadas', value: stats.totalOrders, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Grid / Empty */}
      {technicians.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
            <HardHat className="h-8 w-8" />
          </div>
          <p className="font-bold text-slate-600">No hay técnicos registrados</p>
          <Link href="/tecnicos/nuevo" className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90">
            <Plus className="h-4 w-4" /> Nuevo Técnico
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {technicians.map((tech: any, index: number) => {
            const level = LEVEL_MAP[tech.level ?? 'junior'] ?? LEVEL_MAP.junior
            const activeWOs = new Set((tech.tasks || []).map((t: any) => t.workOrder?.id).filter(Boolean)).size
            const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]

            return (
              <Link
                key={tech.id}
                href={`/tecnicos/${tech.id}`}
                className="group chart-card p-5 block transition-all hover:-translate-y-0.5"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3">
                  <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white text-lg font-black shadow-md`}>
                    {tech.name.charAt(0).toUpperCase()}
                    {(tech.level === 'specialist') && (
                      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                        <Star className="h-2.5 w-2.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{tech.name}</p>
                      {tech.internalCode && (
                        <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {tech.internalCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {tech.position ?? 'Técnico de Campo'}
                      {tech.yearsOfExperience ? ` · ${tech.yearsOfExperience} años` : ''}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-all group-hover:translate-x-1 shrink-0" />
                </div>

                {/* Level + Specialty */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`status-pill ${level.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${level.dotCls}`} />
                    {level.label}
                  </span>
                  {tech.specialty && (
                    <span className="status-pill bg-slate-50 text-slate-600">
                      <Wrench className="h-2.5 w-2.5" />
                      {tech.specialty}
                    </span>
                  )}
                </div>

                {/* Stats bar */}
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ClipboardCheck className="h-3.5 w-3.5 text-blue-400" />
                    <span className="font-bold text-slate-700">{activeWOs}</span>
                    OT{activeWOs !== 1 ? 's' : ''} asignada{activeWOs !== 1 ? 's' : ''}
                  </div>
                  {tech.city && (
                    <span className="text-xs text-slate-400">📍 {tech.city}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
