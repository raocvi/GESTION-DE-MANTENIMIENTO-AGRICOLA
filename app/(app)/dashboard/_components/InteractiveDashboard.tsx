'use client'

import React, { useState, useMemo } from 'react'
import {
  Tractor, AlertTriangle, TrendingUp, ClipboardList,
  Building2, DollarSign, Users, Clock, Award, X,
  ChevronDown, Activity, Zap, Target, BarChart2
} from 'lucide-react'
import { DashboardCharts } from './DashboardCharts'
import { ClientDashboardCharts } from './ClientDashboardCharts'
import { TechDashboardCharts } from './TechDashboardCharts'
import { differenceInDays } from 'date-fns'

interface InteractiveDashboardProps {
  orders: any[]
  totalAssetsCount: number
  clientsList: any[]
}

const TABS = [
  { id: 'company', label: 'General Compañía', icon: Activity },
  { id: 'client',  label: 'Por Cliente',       icon: Building2 },
  { id: 'tech',    label: 'Por Técnico',        icon: Users },
] as const

type TabId = typeof TABS[number]['id']

function KpiCard({
  label, value, sub, icon: Icon, color = 'blue',
  active = false, onClick, animate = false
}: {
  label: string; value: React.ReactNode; sub?: string
  icon: React.ElementType; color?: 'blue' | 'red' | 'amber' | 'emerald' | 'violet' | 'indigo'
  active?: boolean; onClick?: () => void; animate?: boolean
}) {
  const colorMap = {
    blue:    { text: 'text-blue-600',    bg: 'bg-blue-50',    icon: '#0052cc', ring: '#bfdbfe' },
    red:     { text: 'text-rose-600',    bg: 'bg-rose-50',    icon: '#f43f5e', ring: '#fecdd3' },
    amber:   { text: 'text-amber-600',   bg: 'bg-amber-50',   icon: '#d97706', ring: '#fde68a' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', icon: '#059669', ring: '#a7f3d0' },
    violet:  { text: 'text-violet-600',  bg: 'bg-violet-50',  icon: '#7c3aed', ring: '#ddd6fe' },
    indigo:  { text: 'text-indigo-600',  bg: 'bg-indigo-50',  icon: '#4f46e5', ring: '#c7d2fe' },
  }
  const c = colorMap[color]

  return (
    <div
      onClick={onClick}
      className={`kpi-card ${onClick ? 'interactive' : ''} ${active ? 'active' : ''} ${animate ? 'animate-count-up' : ''}`}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all"
        style={{ background: active ? c.icon : 'transparent' }}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 truncate">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-black tracking-tight ${c.text}`}>{value}</span>
          </div>
          {sub && <p className="text-xs text-slate-400 font-medium mt-1">{sub}</p>}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ml-3 transition-all ${active ? '' : c.bg}`}
          style={active ? { background: c.icon } : {}}
        >
          <Icon className={`h-5 w-5 ${active ? 'text-white' : c.text}`} />
        </div>
      </div>

      {onClick && (
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-slate-300">
          <Zap className="h-2.5 w-2.5" />
          {active ? 'Filtro activo — clic para quitar' : 'Clic para filtrar dashboard'}
        </div>
      )}
    </div>
  )
}

export function InteractiveDashboard({ orders, totalAssetsCount, clientsList }: InteractiveDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('company')
  const [selectedType, setSelectedType]   = useState<string | null>(null)
  const [selectedTech, setSelectedTech]   = useState<string | null>(null)
  const [delayedOnly, setDelayedOnly]     = useState(false)
  const [activeOnly, setActiveOnly]       = useState(false)

  const now = useMemo(() => new Date(), [])

  const isOrderDelayed = (o: any) => {
    if (o.status === 'closed' || o.status === 'completed') return false
    return o.dueDate && new Date(o.dueDate) < now
  }

  const filteredOrders = useMemo(() => {
    let r = [...orders]
    if (selectedType) r = r.filter(o => o.type === selectedType)
    if (selectedTech) r = r.filter(o => o.assignedTo?.name === selectedTech)
    if (delayedOnly)  r = r.filter(o => isOrderDelayed(o))
    if (activeOnly)   r = r.filter(o => o.status !== 'closed' && o.status !== 'completed')
    return r
  }, [orders, selectedType, selectedTech, delayedOnly, activeOnly])

  const companyMetrics = useMemo(() => {
    const activeAssets = new Set(
      filteredOrders.filter(o => o.status !== 'closed' && o.status !== 'completed').map(o => o.asset?.id).filter(Boolean)
    ).size
    const delayedCount = filteredOrders.filter(isOrderDelayed).length
    let totalDelayDays = 0, delayedOTsCount = 0
    filteredOrders.forEach(o => {
      if (!o.dueDate) return
      const dueDate = new Date(o.dueDate)
      const endDate = (o.status === 'closed' || o.status === 'completed')
        ? (o.closedAt ? new Date(o.closedAt) : new Date(o.createdAt))
        : now
      const delay = differenceInDays(endDate, dueDate)
      if (delay > 0) { totalDelayDays += delay; delayedOTsCount++ }
    })
    return {
      activeAssetsCount: activeAssets, delayedCount,
      avgDelay: delayedOTsCount > 0 ? totalDelayDays / delayedOTsCount : 0,
      totalVolume: filteredOrders.length,
    }
  }, [filteredOrders])

  const clientMetrics = useMemo(() => {
    const activeClients = new Set(filteredOrders.map(o => o.client?.id || o.clientId).filter(Boolean)).size
    const totalCost = filteredOrders.reduce((s, o) => s + (o.totalCost || 0), 0)
    const clientCounts: Record<string, number> = {}
    filteredOrders.forEach(o => {
      const n = o.client?.name || 'Interno'
      clientCounts[n] = (clientCounts[n] || 0) + 1
    })
    const topClientName = Object.entries(clientCounts).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace('Agropecuaria ', '') || '—'
    return { activeClientsCount: activeClients, totalCost, topClientName }
  }, [filteredOrders])

  const techMetrics = useMemo(() => {
    const activeTechs = new Set(filteredOrders.map(o => o.assignedTo?.id).filter(Boolean)).size
    const totalActualHours = filteredOrders.reduce((s, o) => s + (o.actualHours || 0), 0)
    const closed = filteredOrders.filter(o => o.status === 'closed' && o.closedAt)
    const avgMTTR = closed.length > 0
      ? closed.reduce((s, o) => s + Math.max(1, differenceInDays(new Date(o.closedAt), o.startedAt ? new Date(o.startedAt) : new Date(o.createdAt))), 0) / closed.length
      : 0
    return { activeTechsCount: activeTechs, totalActualHours, avgMTTR, completedCount: closed.length }
  }, [filteredOrders])

  const clearFilters = () => { setSelectedType(null); setSelectedTech(null); setDelayedOnly(false); setActiveOnly(false) }
  const hasFilters = selectedType || selectedTech || delayedOnly || activeOnly

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-blue-600" />
            Dashboard Gerencial
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Panel analítico en tiempo real — IMECOL S.A.S.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); clearFilters() }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Active filter bar ── */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-100 animate-fade-in">
          <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
            <Target className="h-3.5 w-3.5" /> Filtros activos:
          </span>
          {selectedType && (
            <span className="filter-chip active">
              Tipo: {selectedType === 'preventive' ? 'Preventivo' : selectedType === 'corrective' ? 'Correctivo' : 'Inspección'}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedType(null)} />
            </span>
          )}
          {selectedTech && (
            <span className="filter-chip active">
              Técnico: {selectedTech}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedTech(null)} />
            </span>
          )}
          {delayedOnly && (
            <span className="filter-chip active !border-rose-200 !bg-rose-50 !text-rose-700">
              Solo retrasados
              <X className="h-3 w-3 cursor-pointer" onClick={() => setDelayedOnly(false)} />
            </span>
          )}
          {activeOnly && (
            <span className="filter-chip active">
              Solo activos
              <X className="h-3 w-3 cursor-pointer" onClick={() => setActiveOnly(false)} />
            </span>
          )}
          <button
            onClick={clearFilters}
            className="ml-auto text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {activeTab === 'company' && (<>
          <KpiCard
            label="Equipos Intervenidos"
            value={companyMetrics.activeAssetsCount}
            sub={`De ${totalAssetsCount} activos totales`}
            icon={Tractor} color="blue"
            active={activeOnly} onClick={() => { setActiveOnly(v => !v); setDelayedOnly(false) }}
          />
          <KpiCard
            label="Servicios Retrasados"
            value={companyMetrics.delayedCount}
            sub="OTs fuera de plazo"
            icon={AlertTriangle} color="red"
            active={delayedOnly} onClick={() => { setDelayedOnly(v => !v); setActiveOnly(false) }}
          />
          <KpiCard
            label="Promedio Retraso"
            value={`${companyMetrics.avgDelay.toFixed(1)}d`}
            sub="Días por orden"
            icon={TrendingUp} color="amber"
          />
          <KpiCard
            label="Volumen Operativo"
            value={companyMetrics.totalVolume}
            sub="Servicios analizados"
            icon={ClipboardList} color="emerald"
            onClick={clearFilters}
          />
        </>)}

        {activeTab === 'client' && (<>
          <KpiCard
            label="Clientes Activos"
            value={clientMetrics.activeClientsCount}
            sub={`De ${clientsList.length} clientes`}
            icon={Building2} color="blue"
          />
          <KpiCard
            label="Cliente Principal"
            value={<span className="text-xl">{clientMetrics.topClientName}</span>}
            sub="Mayor volumen de órdenes"
            icon={Award} color="indigo"
          />
          <KpiCard
            label="Inversión Total"
            value={`$${(clientMetrics.totalCost / 1_000_000).toFixed(1)}M`}
            sub="COP en mantenimiento"
            icon={DollarSign} color="amber"
          />
          <KpiCard
            label="Equipos en Servicio"
            value={companyMetrics.activeAssetsCount}
            sub="Activos con OT abierta"
            icon={Tractor} color="emerald"
          />
        </>)}

        {activeTab === 'tech' && (<>
          <KpiCard
            label="Técnicos Activos"
            value={techMetrics.activeTechsCount}
            sub="Con OTs asignadas"
            icon={Users} color="blue"
          />
          <KpiCard
            label="MTTR Promedio"
            value={`${techMetrics.avgMTTR.toFixed(1)}d`}
            sub="Días hasta cierre"
            icon={Clock} color="indigo"
          />
          <KpiCard
            label="Órdenes Cerradas"
            value={techMetrics.completedCount}
            sub="Servicios completados"
            icon={Award} color="amber"
          />
          <KpiCard
            label="Horas Registradas"
            value={`${Math.round(techMetrics.totalActualHours)}h`}
            sub="Tiempo real total"
            icon={Clock} color="emerald"
          />
        </>)}
      </div>

      {/* ── Charts ── */}
      <div className="animate-fade-in">
        {activeTab === 'company' && (
          <DashboardCharts
            orders={filteredOrders}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedTech={selectedTech}
            onSelectTech={setSelectedTech}
          />
        )}
        {activeTab === 'client' && <ClientDashboardCharts orders={filteredOrders} />}
        {activeTab === 'tech' && <TechDashboardCharts orders={filteredOrders} />}
      </div>
    </div>
  )
}
