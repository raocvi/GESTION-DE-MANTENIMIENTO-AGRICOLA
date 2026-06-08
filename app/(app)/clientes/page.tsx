import type { Metadata } from 'next'
import Link from 'next/link'
import { getClients } from '@modules/M06_clients/actions'
import { Building2, Plus, MapPin, Phone, Mail, Tractor, CheckCircle2, ArrowRight, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Clientes — AgroMaint Pro' }

// Identifica si un cliente es ingenio azucarero
function esIngenio(name: string) {
  return (
    name.startsWith('Ingenio') ||
    name.startsWith('Incauca') ||
    name.startsWith('Riopaila Castilla') ||
    name.startsWith('Central Tumaco')
  )
}

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams
  const rawClients = await getClients(search)

  // Ingenios primero (orden alfabético dentro de cada grupo)
  const clients = [...rawClients].sort((a, b) => {
    const aI = esIngenio(a.name) ? 0 : 1
    const bI = esIngenio(b.name) ? 0 : 1
    if (aI !== bI) return aI - bI
    return a.name.localeCompare(b.name, 'es')
  })

  const ingenios  = clients.filter(c => esIngenio(c.name))
  const palmeros  = clients.filter(c => !esIngenio(c.name))

  const totalAssets     = clients.reduce((s, c) => s + c.assets.length, 0)
  const operativeAssets = clients.reduce((s, c) => s + c.assets.filter((a: any) => a.operativeStatus === 'operative').length, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-md shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clientes</h1>
            <p className="text-sm text-slate-400 mt-0.5">{clients.length} clientes registrados</p>
          </div>
        </div>
        <Link
          href="/clientes/nuevo"
          className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Link>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clientes',      value: clients.length, color: 'text-blue-600',    bg: 'bg-blue-50',    dot: 'bg-blue-500' },
          { label: 'Ingenios Azucareros', value: ingenios.length, color: 'text-amber-700',  bg: 'bg-amber-50',   dot: 'bg-amber-500' },
          { label: 'Palmicultores',       value: palmeros.length, color: 'text-emerald-700',bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
          { label: 'Equipos Operativos',  value: operativeAssets,color: 'text-indigo-600',  bg: 'bg-indigo-50',  dot: 'bg-indigo-500' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-2 ${kpi.bg}`}>
              <div className={`w-2 h-2 rounded-full ${kpi.dot}`} />
            </div>
            <div className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <form method="GET" className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            name="search" defaultValue={search}
            placeholder="Buscar nombre, ciudad, contacto..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <button type="submit" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 transition-all">
          Buscar
        </button>
      </form>

      {/* ── Contenido ── */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <p className="font-bold text-slate-600">No hay clientes registrados</p>
          <p className="text-sm text-slate-400 mt-1">Crea el primer cliente para comenzar</p>
          <Link href="/clientes/nuevo" className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90">
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* ── Grupo: Ingenios Azucareros ── */}
          {ingenios.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-amber-700">Ingenios Azucareros</span>
                  <span className="text-xs font-bold text-amber-400">{ingenios.length}</span>
                </div>
                <div className="flex-1 h-px bg-amber-100" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ingenios.map(client => (
                  <ClientCard key={client.id} client={client} tipo="ingenio" />
                ))}
              </div>
            </div>
          )}

          {/* ── Grupo: Palmicultores ── */}
          {palmeros.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-700">Palmicultores</span>
                  <span className="text-xs font-bold text-emerald-400">{palmeros.length}</span>
                </div>
                <div className="flex-1 h-px bg-emerald-100" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {palmeros.map(client => (
                  <ClientCard key={client.id} client={client} tipo="palmicultor" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Card de cliente ────────────────────────────────────────────────────────────
function ClientCard({ client, tipo }: { client: any; tipo: 'ingenio' | 'palmicultor' }) {
  const operative   = client.assets.filter((a: any) => a.operativeStatus === 'operative').length
  const totalAssets = client.assets.length
  const pct         = totalAssets > 0 ? Math.round((operative / totalAssets) * 100) : 0

  const avatarGradient = tipo === 'ingenio'
    ? 'from-amber-500 to-orange-600'
    : 'from-emerald-500 to-teal-600'

  const tipoBadge = tipo === 'ingenio'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-100 text-emerald-700'

  const barColor = tipo === 'ingenio' ? '#f59e0b' : '#10b981'

  return (
    <Link
      href={`/clientes/${client.id}`}
      className="group chart-card p-5 block transition-all hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarGradient} text-white text-base font-black shadow-md`}>
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug flex-1 min-w-0">
              {client.name}
            </p>
            <span className={`shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 ${tipoBadge}`}>
              {tipo === 'ingenio' ? 'Ingenio' : 'Palma'}
            </span>
          </div>
          {(client.city || client.department) && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              {[client.city, client.department].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-all group-hover:translate-x-1 shrink-0 mt-1" />
      </div>

      {/* Contact */}
      <div className="mt-4 space-y-1.5">
        {client.contactName && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
              {client.contactName.charAt(0)}
            </div>
            {client.contactName}
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone className="h-3 w-3 shrink-0" /> {client.phone}
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
      </div>

      {/* Assets bar */}
      <div className="mt-4 pt-4 border-t border-slate-50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Tractor className="h-3 w-3" />
            {totalAssets} equipo{totalAssets !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1 font-bold" style={{ color: barColor }}>
            <CheckCircle2 className="h-3 w-3" />
            {operative} operativo{operative !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      </div>
    </Link>
  )
}
