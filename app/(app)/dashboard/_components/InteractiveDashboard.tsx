'use client'

import React, { useState, useMemo } from 'react'
import { 
  Tractor, 
  AlertTriangle, 
  TrendingUp, 
  ClipboardList, 
  X, 
  Building2, 
  DollarSign, 
  Users, 
  Clock, 
  Award,
  BarChart3
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

export function InteractiveDashboard({ 
  orders, 
  totalAssetsCount, 
  clientsList 
}: InteractiveDashboardProps) {
  // Navigation tabs: 'company' | 'client' | 'tech'
  const [activeTab, setActiveTab] = useState<'company' | 'client' | 'tech'>('company')

  // Cross-filtering States
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [delayedOnly, setDelayedOnly] = useState<boolean>(false)
  const [activeOnly, setActiveOnly] = useState<boolean>(false)

  const now = useMemo(() => new Date(), [])

  // Helper to check delay
  const isOrderDelayed = (o: any) => {
    if (o.status === 'closed' || o.status === 'completed') return false
    if (!o.dueDate) return false
    return new Date(o.dueDate) < now
  }

  // 1. Apply active cross-filters
  const filteredOrders = useMemo(() => {
    let result = [...orders]
    
    if (selectedType) {
      result = result.filter(o => o.type === selectedType)
    }
    if (selectedTech) {
      result = result.filter(o => o.assignedTo?.name === selectedTech)
    }
    if (delayedOnly) {
      result = result.filter(o => isOrderDelayed(o))
    }
    if (activeOnly) {
      result = result.filter(o => o.status !== 'closed' && o.status !== 'completed')
    }

    return result
  }, [orders, selectedType, selectedTech, delayedOnly, activeOnly, now])

  // 2. Metrics for Tab 1: Company
  const companyMetrics = useMemo(() => {
    const activeAssets = new Set(
      filteredOrders
        .filter(o => o.status !== 'closed' && o.status !== 'completed')
        .map(o => o.asset?.id)
        .filter(Boolean)
    )

    const delayedCount = filteredOrders.filter(o => isOrderDelayed(o)).length

    let totalDelayDays = 0
    let delayedOTsCount = 0

    filteredOrders.forEach(o => {
      if (!o.dueDate) return
      const dueDate = new Date(o.dueDate)
      let delay = 0
      
      if (o.status === 'closed' || o.status === 'completed') {
        const closedDate = o.closedAt ? new Date(o.closedAt) : new Date(o.createdAt)
        delay = differenceInDays(closedDate, dueDate)
      } else {
        delay = differenceInDays(now, dueDate)
      }

      if (delay > 0) {
        totalDelayDays += delay
        delayedOTsCount++
      }
    })

    const avgDelay = delayedOTsCount > 0 ? totalDelayDays / delayedOTsCount : 0

    return {
      activeAssetsCount: activeAssets.size,
      delayedCount,
      avgDelay,
      totalVolume: filteredOrders.length
    }
  }, [filteredOrders, now])

  // 3. Metrics for Tab 2: Clients
  const clientMetrics = useMemo(() => {
    const activeClients = new Set(filteredOrders.map(o => o.client?.id || o.clientId).filter(Boolean))
    const totalCost = filteredOrders.reduce((sum, o) => sum + (o.totalCost || 0), 0)
    
    // Find top client by volume
    const clientCounts: Record<string, number> = {}
    filteredOrders.forEach(o => {
      const name = o.client?.name || 'Interno / Genérico'
      clientCounts[name] = (clientCounts[name] || 0) + 1
    })
    const sortedClients = Object.entries(clientCounts).sort((a, b) => b[1] - a[1])
    const topClientName = sortedClients[0]?.[0]?.replace('Agropecuaria ', '') || 'Ninguno'

    return {
      activeClientsCount: activeClients.size,
      totalCost,
      topClientName
    }
  }, [filteredOrders])

  // 4. Metrics for Tab 3: Technicians
  const techMetrics = useMemo(() => {
    const activeTechs = new Set(filteredOrders.map(o => o.assignedTo?.id).filter(Boolean))
    const totalActualHours = filteredOrders.reduce((sum, o) => sum + (o.actualHours || 0), 0)
    
    // Calculate overall MTTR (closure time) in days
    const closed = filteredOrders.filter(o => o.status === 'closed' && o.closedAt)
    let totalMTTRDays = 0
    closed.forEach(o => {
      const start = o.startedAt ? new Date(o.startedAt) : new Date(o.createdAt)
      const end = new Date(o.closedAt)
      totalMTTRDays += Math.max(1, differenceInDays(end, start))
    })
    const avgMTTR = closed.length > 0 ? totalMTTRDays / closed.length : 0

    return {
      activeTechsCount: activeTechs.size,
      totalActualHours,
      avgMTTR,
      completedCount: closed.length
    }
  }, [filteredOrders])

  // Clear all filters
  const clearFilters = () => {
    setSelectedType(null)
    setSelectedTech(null)
    setDelayedOnly(false)
    setActiveOnly(false)
  }

  const hasActiveFilters = selectedType || selectedTech || delayedOnly || activeOnly

  return (
    <div className="space-y-4">
            {/* HEADER & TABS IN A SINGLE COMPACT ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-3 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Dashboard Gerencial</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Panel analítico de operaciones, indicadores de retraso y desempeño — IMECOL S.A.S.
          </p>
        </div>
        
        {/* Navigation Tabs Selector */}
        <div className="inline-flex rounded-xl border border-slate-200/60 bg-slate-100/80 p-1 shadow-sm text-xs select-none">
          <button 
            onClick={() => { setActiveTab('company'); clearFilters(); }}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'company' ? 'bg-white text-[#0052cc] shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            General Compañía
          </button>
          <button 
            onClick={() => { setActiveTab('client'); clearFilters(); }}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'client' ? 'bg-white text-[#0052cc] shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Por Empresa Cliente
          </button>
          <button 
            onClick={() => { setActiveTab('tech'); clearFilters(); }}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'tech' ? 'bg-white text-[#0052cc] shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Por Técnico
          </button>
        </div>
      </div>

      {/* ACTIVE FILTERS BREADCRUMBS */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-semibold text-blue-850 shadow-sm animate-fade-in">
          <span>Filtros activos:</span>
          {selectedType && (
            <span className="flex items-center gap-1 bg-white border border-blue-200 px-2 py-0.5 rounded-lg">
              Tipo: {selectedType === 'preventive' ? 'Preventivo' : selectedType === 'corrective' ? 'Correctivo' : 'Inspección'}
              <X className="w-3 h-3 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setSelectedType(null)} />
            </span>
          )}
          {selectedTech && (
            <span className="flex items-center gap-1 bg-white border border-blue-200 px-2 py-0.5 rounded-lg">
              Técnico: {selectedTech}
              <X className="w-3 h-3 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setSelectedTech(null)} />
            </span>
          )}
          {delayedOnly && (
            <span className="flex items-center gap-1 bg-white border border-rose-200 px-2 py-0.5 rounded-lg text-rose-700 bg-rose-50/50">
              Solo Retrasados
              <X className="w-3 h-3 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setDelayedOnly(false)} />
            </span>
          )}
          {activeOnly && (
            <span className="flex items-center gap-1 bg-white border border-blue-200 px-2 py-0.5 rounded-lg">
              Solo Activos
              <X className="w-3 h-3 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setActiveOnly(false)} />
            </span>
          )}
          <button 
            onClick={clearFilters}
            className="ml-auto bg-slate-900 text-white hover:bg-slate-800 px-3 py-1 rounded-lg text-[10px] transition-all hover:scale-[1.02]"
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* DYNAMIC METRIC CARDS BASED ON ACTIVE TAB */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {activeTab === 'company' && (
          <>
            {/* Card 1: EQUIPOS INTERVE            <div 
              onClick={() => { setActiveOnly(!activeOnly); setDelayedOnly(false); }}
              className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
                activeOnly ? 'border-[#0052cc] ring-2 ring-blue-500/10' : 'border-slate-200/60'
              }`}
            >
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">EQUIPOS INTERVENIDOS</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-[#0052cc]">{companyMetrics.activeAssetsCount}</span>
                  <span className="text-xs text-slate-450 font-bold ml-1">De {totalAssetsCount} equipos</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl transition-colors ${activeOnly ? 'bg-[#0052cc] text-white' : 'bg-blue-50 text-[#0052cc]'}`}>
                <Tractor size={20} />
              </div>
            </div>

            {/* Card 2: SERVICIOS RETRASADOS */}
            <div 
              onClick={() => { setDelayedOnly(!delayedOnly); setActiveOnly(false); }}
              className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
                delayedOnly ? 'border-rose-600 ring-2 ring-rose-500/10' : 'border-slate-200/60'
              }`}
            >
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">SERVICIOS RETRASADOS</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-rose-600">{companyMetrics.delayedCount}</span>
                  <span className="text-xs text-slate-455 font-bold ml-1">OTs vencidas</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl transition-colors ${delayedOnly ? 'bg-rose-650 text-white' : 'bg-red-50 text-rose-600'}`}>
                <AlertTriangle size={20} />
              </div>
            </div>

            {/* Card 3: PROMEDIO DE RETRASO */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">PROMEDIO DE RETRASO</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-amber-600">{companyMetrics.avgDelay.toFixed(1)}</span>
                  <span className="text-xs text-slate-450 font-bold ml-1">Días por OT</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <TrendingUp size={20} />
              </div>
            </div>

            {/* Card 4: VOLUMEN OPERATIVO */}
            <div 
              onClick={clearFilters}
              className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">VOLUMEN OPERATIVO</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-600">{companyMetrics.totalVolume}</span>
                  <span className="text-xs text-slate-455 font-bold ml-1">Servicios analizados</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <ClipboardList size={20} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'client' && (
          <>
            {/* Card 1: CLIENTES ACTIVOS */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">CLIENTES ACTIVOS</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-[#0052cc]">{clientMetrics.activeClientsCount}</span>
                  <span className="text-xs text-slate-450 font-bold ml-1">De {clientsList.length} clientes</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#0052cc]">
                <Building2 size={20} />
              </div>
            </div>

            {/* Card 2: CLIENTE PRINCIPAL */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">CLIENTE PRINCIPAL</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-sm font-black text-indigo-700 truncate max-w-[150px] inline-block" title={clientMetrics.topClientName}>
                    {clientMetrics.topClientName}
                  </span>
                  <span className="text-[10px] text-slate-455 font-bold ml-1">Mayor volumen</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-650">
                <Award size={20} />
              </div>
            </div>

            {/* Card 3: INVERSIÓN TOTAL */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">INVERSIÓN TOTAL</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-amber-600">
                    ${(clientMetrics.totalCost / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-xs text-slate-450 font-bold ml-1">COP en costos</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-650">
                <DollarSign size={20} />
              </div>
            </div>

            {/* Card 4: EQUIPOS EN SERVICIO */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">EQUIPOS EN SERVICIO</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-600">{companyMetrics.activeAssetsCount}</span>
                  <span className="text-xs text-slate-450 font-bold ml-1">Activos</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-650">
                <Tractor size={20} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'tech' && (
          <>
            {/* Card 1: TÉCNICOS ACTIVOS */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">TÉCNICOS ACTIVOS</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-[#0052cc]">{techMetrics.activeTechsCount}</span>
                  <span className="text-xs text-slate-450 font-bold ml-1">Asignados</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#0052cc]">
                <Users size={20} />
              </div>
            </div>

            {/* Card 2: TIEMPO DE CIERRE (MTTR) */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">TIEMPO DE CIERRE (MTTR)</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-indigo-700">
                    {techMetrics.avgMTTR.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-450 font-bold ml-1">Días promedio</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-650">
                <Clock size={20} />
              </div>
            </div>

            {/* Card 3: ÓRDENES CERRADAS */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">ÓRDENES CERRADAS</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-amber-600">{techMetrics.completedCount}</span>
                  <span className="text-xs text-slate-450 font-bold ml-1">Servicios</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-650">
                <Award size={20} />
              </div>
            </div>

            {/* Card 4: TOTAL HORAS REALES */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex items-center justify-between select-none">
              <div>
                <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-1.5">TOTAL HORAS REALES</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-600">
                    {Math.round(techMetrics.totalActualHours)}h
                  </span>
                  <span className="text-xs text-slate-450 font-bold ml-1">Registradas</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-650">
                <Clock size={20} />
              </div>
            </div>            </div>
          </>
        )}
      </div>

      {/* CHARTS CONTAINER RENDERED CONDITIONALLY */}
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
        
        {activeTab === 'client' && (
          <ClientDashboardCharts orders={filteredOrders} />
        )}
        
        {activeTab === 'tech' && (
          <TechDashboardCharts orders={filteredOrders} />
        )}
      </div>

    </div>
  )
}