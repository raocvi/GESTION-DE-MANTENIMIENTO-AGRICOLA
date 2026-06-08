import type { Metadata } from 'next'
import Link from 'next/link'
import { getTechnicians } from '@modules/M07_technicians/actions'
import { HardHat, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Técnicos — AgroMaint Pro' }

const LEVEL_MAP: Record<string, { label: string; cls: string }> = {
  junior:     { label: 'Junior',      cls: 'bg-slate-100 text-slate-600' },
  mid:        { label: 'Intermedio',  cls: 'bg-blue-100 text-blue-700' },
  senior:     { label: 'Senior',      cls: 'bg-violet-100 text-violet-700' },
  specialist: { label: 'Especialista',cls: 'bg-amber-100 text-amber-700' },
}

export default async function TechniciansPage() {
  const technicians = await getTechnicians()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Técnicos</h1>
          <p className="text-sm text-slate-500">{technicians.length} técnicos activos</p>
        </div>
        <Link href="/tecnicos/nuevo" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nuevo Técnico
        </Link>
      </div>
      {technicians.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400">
          <HardHat className="h-12 w-12 mb-3" />
          <p className="font-medium">No hay técnicos registrados</p>
          <Link href="/tecnicos/nuevo" className="mt-3 text-sm text-blue-600 hover:underline">Registrar primer técnico</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {technicians.map((tech: any) => {
            const level = LEVEL_MAP[tech.level ?? 'junior'] ?? LEVEL_MAP.junior
            const activeWOs = new Set((tech.tasks || []).map((t: any) => t.workOrder?.id).filter(Boolean)).size
            return (
              <Link key={tech.id} href={`/tecnicos/${tech.id}`} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-lg font-bold">
                    {tech.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600">{tech.name}</p>
                      {tech.internalCode && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-650">
                          {tech.internalCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {tech.position ?? 'Técnico de Campo'}
                      {tech.yearsOfExperience ? ` · ${tech.yearsOfExperience} años exp` : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${level.cls}`}>{level.label}</span>
                  <span className={`text-xs font-medium ${activeWOs > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {activeWOs} OT{activeWOs !== 1 ? 's' : ''} activa{activeWOs !== 1 ? 's' : ''}
                  </span>
                </div>
                {tech.phone && <p className="mt-2 text-xs text-slate-500">📞 {tech.phone}</p>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
