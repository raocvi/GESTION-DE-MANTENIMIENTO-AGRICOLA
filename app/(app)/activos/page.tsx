import type { Metadata } from 'next'
import Link from 'next/link'
import { StatusBadge } from '@core/components/ui/badge'
import { formatHours, formatDate } from '@core/lib/utils'
import { Tractor, Plus, Search, ArrowRight, Clock, AlertTriangle, CheckCircle2, Wrench, MapPin } from 'lucide-react'
import { getAssets } from '@modules/M03_assets/actions'

export const metadata: Metadata = {
  title: 'Equipos — AgroMaint Pro',
  description: 'Gestión de maquinaria agrícola CASE IH — IMECOL S.A.S.',
}

const displayAssets = [
  {
    id: '1',
    internalCode: 'A9900-001',
    name: 'Cosechadora CASE IH A9900',
    serialNumber: 'HAJ196810',
    model: 'A9900',
    brand: 'CASE IH',
    category: 'Cosechadora',
    operativeStatus: 'operative',
    statusLabel: 'Operativo',
    currentHours: 1248,
    year: 2022,
    client: 'Agropecuaria La Esperanza',
    city: 'Montería',
    department: 'Córdoba',
    lastService: new Date('2026-05-15'),
    nextService: 1500,
    criticality: 'critical',
  },
  {
    id: '2',
    internalCode: 'A9900-002',
    name: 'Cosechadora CASE IH A9900',
    serialNumber: 'HAJ196811',
    model: 'A9900',
    brand: 'CASE IH',
    category: 'Cosechadora',
    operativeStatus: 'maintenance',
    statusLabel: 'En mantenimiento',
    currentHours: 2105,
    year: 2021,
    client: 'Agropecuaria Los Llanos',
    city: 'Villavicencio',
    department: 'Meta',
    lastService: new Date('2026-06-01'),
    nextService: 2500,
    criticality: 'critical',
  },
  {
    id: '3',
    internalCode: 'A9900-003',
    name: 'Cosechadora CASE IH A9900',
    serialNumber: 'HAJ196812',
    model: 'A9900',
    brand: 'CASE IH',
    category: 'Cosechadora',
    operativeStatus: 'operative',
    statusLabel: 'Operativo',
    currentHours: 845,
    year: 2023,
    client: 'Hacienda Santa Rosa',
    city: 'Sincelejo',
    department: 'Sucre',
    lastService: new Date('2026-04-20'),
    nextService: 1000,
    criticality: 'critical',
  },
]

const OPERATIVE_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  operative:      { label: 'Operativo',         cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  maintenance:    { label: 'En Mantenimiento',  cls: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  out_of_service: { label: 'Fuera de Servicio', cls: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
  warranty:       { label: 'En Garantía',       cls: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  diagnosis:      { label: 'En Diagnóstico',    cls: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
}

export default async function AssetsPage() {
  const assets = await getAssets()
  const displayAssets = assets.length > 0 ? assets : displayAssets

  const operativeCount = displayAssets.filter(a => a.operativeStatus === 'operative').length
  const maintenanceCount = displayAssets.filter(a => a.operativeStatus === 'maintenance').length
  const criticalCount = displayAssets.filter(a => {
    const hrs = (a.nextService ?? 0) - (a.currentHours ?? 0)
    return hrs < 100
  }).length

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-md shrink-0">
            <Tractor className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Equipos / Flota</h1>
            <p className="text-sm text-slate-400 mt-0.5">{displayAssets.length} activos registrados — IMECOL S.A.S.</p>
          </div>
        </div>
        <Link
          href="/activos/nuevo"
          className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Nuevo Equipo
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-2 text-3xl font-black text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
            {operativeCount}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Operativos</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 text-3xl font-black text-amber-600">
            <Wrench className="h-6 w-6" />
            {maintenanceCount}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">En Mantenimiento</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 text-3xl font-black text-slate-700">
            <Tractor className="h-6 w-6 text-slate-400" />
            {displayAssets.length}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Total Activos</p>
        </div>
        <div className={`kpi-card ${criticalCount > 0 ? 'border-rose-200' : ''}`}>
          <div className={`flex items-center gap-2 text-3xl font-black ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
            {criticalCount > 0 && <AlertTriangle className="h-6 w-6" />}
            {criticalCount}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Críticos por Horas</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por código, serial, cliente..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        {['Todos', 'Operativo', 'Mantenimiento', 'Crítico'].map(f => (
          <button key={f} className={`filter-chip ${f === 'Todos' ? 'active' : ''}`}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="chart-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código / Equipo</th>
              <th>Estado</th>
              <th className="hidden md:table-cell">Cliente / Ubicación</th>
              <th className="text-right">Horómetro</th>
              <th className="hidden lg:table-cell text-right">Próx. Mant.</th>
              <th className="hidden md:table-cell">Último Serv.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayAssets.map((asset) => {
              const hoursToNext = (asset.nextService ?? 0) - (asset.currentHours ?? 0)
              const isOverdue  = hoursToNext <= 0
              const isCritical = hoursToNext > 0 && hoursToNext < 100
              const isWarning  = hoursToNext >= 100 && hoursToNext < 250
              const st = OPERATIVE_STATUS[asset.operativeStatus] || { label: asset.statusLabel, cls: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' }

              return (
                <tr key={asset.id} className={isOverdue ? 'bg-rose-50/30' : ''}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${st.cls} text-sm`}>
                        <Tractor className="h-4 w-4" />
                      </div>
                      <div>
                        <Link href={`/activos/${asset.id}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {asset.internalCode}
                        </Link>
                        <p className="text-xs text-slate-400">{asset.brand?.name} {asset.model?.name} · S/N {asset.serialNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </td>
                  <td className="hidden md:table-cell">
                    <p className="text-sm font-medium text-slate-700">{asset.client?.name || '—'}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {asset.client?.city || '—'}, {asset.client?.department || '—'}
                    </p>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono font-bold text-slate-700 text-sm">{formatHours(asset.currentHours)}</span>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell text-right">
                    <div className={`text-sm font-mono font-bold ${isOverdue ? 'text-rose-600' : isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-slate-600'}`}>
                      {formatHours(asset.nextService)}
                    </div>
                    <div className={`text-xs mt-0.5 font-bold flex items-center justify-end gap-1 ${isOverdue ? 'text-rose-600' : isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-slate-400'}`}>
                      {isOverdue && <AlertTriangle className="h-3 w-3" />}
                      {isOverdue ? 'VENCIDO' : `faltan ${hoursToNext}h`}
                    </div>
                  </td>
                  <td className="hidden md:table-cell text-xs text-slate-400">
                    {formatDate(asset.lastService)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link href={`/activos/${asset.id}`} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        Ver <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
