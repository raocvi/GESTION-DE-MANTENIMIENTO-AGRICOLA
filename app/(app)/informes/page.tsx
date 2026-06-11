import Link from 'next/link'
import { FileBarChart, ChevronRight, Building2 } from 'lucide-react'
import { PageHeader } from '@core/components/shared/PageComponents'
import { db } from '@core/lib/db'

export const metadata = { title: 'Informes Gerenciales' }
export const dynamic = 'force-dynamic'

/** Selector de empresa para generar el informe gerencial. */
export default async function InformesPage() {
  const clients = await db.client.findMany({
    where: { isActive: true },
    select: {
      id: true, name: true, city: true, department: true,
      _count: { select: { assets: true, workOrders: true } },
    },
    orderBy: { name: 'asc' },
  })

  const esIngenio = (name: string) =>
    name.startsWith('Ingenio') ||
    ['Incauca', 'Riopaila Castilla', 'Central Tumaco'].some(k => name.startsWith(k))

  const sorted = [...clients].sort((a, b) => {
    const ai = esIngenio(a.name) ? 0 : 1
    const bi = esIngenio(b.name) ? 0 : 1
    return ai !== bi ? ai - bi : a.name.localeCompare(b.name)
  })

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={<FileBarChart className="h-5 w-5" />}
        title="Informes Gerenciales"
        description="Seleccione la empresa para generar su informe ejecutivo de avance de equipos"
        breadcrumb={[{ label: 'Análisis' }, { label: 'Informes' }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sorted.map(c => {
          const ingenio = esIngenio(c.name)
          return (
            <Link key={c.id} href={`/informes/${c.id}`}
              className="chart-card hover-lift p-4 flex items-center gap-3 group"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-black text-sm shadow-sm
                bg-gradient-to-br ${ingenio ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'}`}
              >
                {c.name.replace(/^Ingenio\s+/i, '').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800 truncate">{c.name}</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {c._count.assets} equipos · {c._count.workOrders} OTs · {c.city || '—'}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
