'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend, ResponsiveContainer,
} from 'recharts'
import {
  Droplets, AlertTriangle, CheckCircle, XCircle, Zap,
  Filter, ChevronRight, TrendingUp, FlaskConical,
  Eye,
} from 'lucide-react'
import type {
  LubeKpis, ComponentRisk, ClientHealth,
  SystemBreakdown, FleetAnalysisData,
} from '@/modules/M12_lube_analyst/actions'

import { LubeAnalysisTab } from './LubeAnalysisTab'

// ─── Types ───
interface Props {
  kpis: LubeKpis
  topRisk: ComponentRisk[]
  clientHealth: ClientHealth[]
  systemBreakdown: SystemBreakdown[]
  criticalSummary: { total: number; requiresStop: number; requiresOilChange: number; byVariable: { variable: string; count: number }[] }
  assets: { id: string; name: string; code: string; currentHours: number; clientId: string; clientName: string; modelName: string; categoryName: string; totalComponents: number; criticalComponents: number; cautionComponents: number; worstStatus: string }[]
  analysisData: FleetAnalysisData
}

// ─── Helpers ───
const STATUS_COLOR: Record<string, string> = {
  normal: '#10b981',
  caution: '#f59e0b',
  critical: '#ef4444',
  condemned: '#7c3aed',
}
const STATUS_LABEL: Record<string, string> = {
  normal: 'Normal',
  caution: 'Precaución',
  critical: 'Crítico',
  condemned: 'Condenado',
}
const COMPONENT_LABEL: Record<string, string> = {
  motor: 'Motor',
  transmission: 'Transmisión',
  hydraulic: 'Hidráulico',
  differential: 'Diferencial',
  final_drive: 'Mandos Finales',
  brake_wet: 'Frenos Húmedos',
  reducer: 'Reductor',
}
const VAR_LABEL: Record<string, string> = {
  ironFe: 'Hierro (Fe)',
  copperCu: 'Cobre (Cu)',
  siliconSi: 'Silicio (Si)',
  pqIndex: 'PQ Index',
  tbn: 'TBN',
  waterPct: 'Agua (%)',
  glycolPpm: 'Glicol (ppm)',
  fuelPct: 'Combustible (%)',
  oxidation: 'Oxidación',
  soot: 'Hollín (%)',
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    caution: 'bg-amber-100 text-amber-700 border-amber-200',
    critical: 'bg-rose-100 text-rose-700 border-rose-200',
    condemned: 'bg-violet-100 text-violet-700 border-violet-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${colors[status] || colors.normal}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[status] || '#10b981' }} />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function KpiCard({ label, value, sub, color, icon: Icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ElementType }) {
  return (
    <div className="kpi-card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="num text-[2.2rem] font-extrabold text-slate-800 leading-none">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 font-medium">{sub}</p>}
    </div>
  )
}

// ─── Main Dashboard ───
export function LubeDashboard({ kpis, topRisk, clientHealth, systemBreakdown, criticalSummary, assets, analysisData }: Props) {
  const [activeTab, setActiveTab] = useState<'executive' | 'fleet' | 'clients' | 'systems' | 'analysis'>('executive')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Severity donut data
  const severityData = [
    { name: 'Normal', value: kpis.normalCount, color: '#10b981' },
    { name: 'Precaución', value: kpis.cautionCount, color: '#f59e0b' },
    { name: 'Crítico', value: kpis.criticalCount, color: '#ef4444' },
    { name: 'Condenado', value: kpis.condemnedCount, color: '#7c3aed' },
  ].filter(d => d.value > 0)

  // Variable frequency chart
  const varData = criticalSummary.byVariable.map(v => ({
    variable: VAR_LABEL[v.variable] || v.variable,
    count: v.count,
  }))

  // System bar data
  const sysData = systemBreakdown.map(s => ({
    name: s.label,
    Normal: s.normal,
    Precaución: s.caution,
    Crítico: s.critical,
  }))

  // Filtered assets
  const filteredAssets = useMemo(() => assets.filter(a => {
    if (filterStatus !== 'all' && a.worstStatus !== filterStatus) return false
    if (filterType !== 'all') {
      if (filterType === 'harvester' && !a.categoryName.toLowerCase().includes('cosechadora')) return false
      if (filterType === 'tractor' && !a.categoryName.toLowerCase().includes('tractor')) return false
    }
    return true
  }), [assets, filterStatus, filterType])

  const TABS = [
    { id: 'executive', label: 'Ejecutivo' },
    { id: 'fleet', label: 'Flota' },
    { id: 'clients', label: 'Por Empresa' },
    { id: 'systems', label: 'Por Sistema' },
    { id: 'analysis', label: '📊 Análisis Estadístico' },
  ] as const

  return (
    <div className="space-y-5">
      {/* Tab selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100/70 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── EXECUTIVE TAB ─── */}
      {activeTab === 'executive' && (
        <div className="space-y-5">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <KpiCard label="Componentes" value={kpis.totalComponents} sub={`${kpis.totalSamples} muestras total`} color="#0369a1" icon={Droplets} />
            <KpiCard label="Estado Normal" value={`${kpis.normalPct}%`} sub={`${kpis.normalCount} componentes`} color="#10b981" icon={CheckCircle} />
            <KpiCard label="Precaución" value={kpis.cautionCount} sub={`${kpis.cautionPct}% del total`} color="#f59e0b" icon={AlertTriangle} />
            <KpiCard label="Críticos" value={kpis.criticalCount + kpis.condemnedCount} sub={`${kpis.criticalPct}% del total`} color="#ef4444" icon={XCircle} />
            <KpiCard label="Parada Urgente" value={kpis.criticalActions} sub="componentes condenados" color="#7c3aed" icon={Zap} />
            <KpiCard label="Recomendaciones" value={kpis.openRecommendations} sub="inspecciones pendientes" color="#0369a1" icon={FlaskConical} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Severity donut */}
            <div className="chart-card p-5">
              <p className="text-[13px] font-bold text-slate-700 mb-4">Distribución de Severidad</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    activeShape={undefined}
                  >
                    {severityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip cursor={false} formatter={(v: number) => [v, 'Componentes']} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Variables with most issues */}
            <div className="chart-card p-5">
              <p className="text-[13px] font-bold text-slate-700 mb-4">Variables Críticas Más Frecuentes</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={varData} layout="vertical" margin={{ left: 80, right: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="variable" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip cursor={false} />
                  <Bar dataKey="count" radius={4}>
                    {varData.map((_, i) => (
                      <Cell key={i} fill={['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#6366f1'][i % 8]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top risk components */}
            <div className="chart-card p-5">
              <p className="text-[13px] font-bold text-slate-700 mb-3">Componentes en Mayor Riesgo</p>
              <div className="space-y-2 overflow-y-auto max-h-[200px]">
                {topRisk.slice(0, 8).map(r => (
                  <Link key={r.componentId} href={`/lube-analyst/${r.assetId}`}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <span className="h-2 w-2 rounded-full shrink-0 mt-1.5" style={{ background: STATUS_COLOR[r.latestStatus] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-700 truncate">{r.assetCode} — {COMPONENT_LABEL[r.componentType] || r.componentType}</p>
                      <p className="text-[11px] text-slate-400 truncate">{r.clientName}</p>
                    </div>
                    <StatusBadge status={r.latestStatus} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* System breakdown bar */}
          <div className="chart-card p-5">
            <p className="text-[13px] font-bold text-slate-700 mb-4">Salud por Sistema Lubricado</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sysData} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip cursor={false} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Normal" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Precaución" fill="#f59e0b" stackId="a" />
                <Bar dataKey="Crítico" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── FLEET TAB ─── */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-500">Filtros:</span>
            {['all', 'normal', 'caution', 'critical'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                  filterStatus === s ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {s === 'all' ? 'Todos' : STATUS_LABEL[s]}
              </button>
            ))}
            <span className="text-slate-300">|</span>
            {['all', 'harvester', 'tractor'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                  filterType === t ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'harvester' ? 'Cosechadoras' : 'Tractores'}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-slate-400">{filteredAssets.length} equipos</span>
          </div>

          {/* Asset table */}
          <div className="chart-card overflow-hidden">
            <table className="data-table w-full text-[12px]">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">Código</th>
                  <th className="text-left px-4 py-3">Equipo</th>
                  <th className="text-left px-4 py-3">Empresa</th>
                  <th className="text-left px-4 py-3">Modelo</th>
                  <th className="text-right px-4 py-3">Horómetro</th>
                  <th className="text-center px-4 py-3">Componentes</th>
                  <th className="text-center px-4 py-3">Críticos</th>
                  <th className="text-center px-4 py-3">Estado</th>
                  <th className="text-center px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(a => (
                  <tr key={a.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-500">{a.code}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{a.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{a.clientName}</td>
                    <td className="px-4 py-2.5 text-slate-500">{a.modelName}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-600">{a.currentHours.toLocaleString()}h</td>
                    <td className="px-4 py-2.5 text-center text-slate-600">{a.totalComponents}</td>
                    <td className="px-4 py-2.5 text-center">
                      {a.criticalComponents > 0 ? (
                        <span className="font-bold text-rose-600">{a.criticalComponents}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center"><StatusBadge status={a.worstStatus} /></td>
                    <td className="px-4 py-2.5 text-center">
                      <Link href={`/lube-analyst/${a.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 text-[11px] font-semibold transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── CLIENTS TAB ─── */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Health bar chart */}
          <div className="chart-card p-5">
            <p className="text-[13px] font-bold text-slate-700 mb-4">Índice de Salud por Empresa (0–100)</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientHealth.slice(0, 15)} layout="vertical" margin={{ left: 160, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="clientName" tick={{ fontSize: 10 }} width={155} />
                <Tooltip cursor={false} formatter={(v: number) => [`${v}/100`, 'Índice de salud']} />
                <Bar dataKey="healthScore" radius={4}>
                  {clientHealth.slice(0, 15).map((c, i) => (
                    <Cell key={i} fill={c.healthScore >= 80 ? '#10b981' : c.healthScore >= 60 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Client cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {clientHealth.map(c => (
              <div key={c.clientId} className="chart-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[13px] font-bold text-slate-700 leading-tight">{c.clientName}</p>
                  <span
                    className="text-[18px] font-extrabold num"
                    style={{ color: c.healthScore >= 80 ? '#10b981' : c.healthScore >= 60 ? '#f59e0b' : '#ef4444' }}
                  >
                    {c.healthScore}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 mb-3">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${c.healthScore}%`,
                      background: c.healthScore >= 80 ? '#10b981' : c.healthScore >= 60 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-emerald-600 font-bold">{c.normalCount} normal</span>
                  <span className="text-amber-600 font-bold">{c.cautionCount} precaución</span>
                  <span className="text-rose-600 font-bold">{c.criticalCount} crítico</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">{c.topIssue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ANALYSIS TAB ─── */}
      {activeTab === 'analysis' && (
        <LubeAnalysisTab
          points={analysisData.points}
          limits={analysisData.limits}
          clients={analysisData.clients}
          assets={analysisData.assets}
        />
      )}

      {/* ─── SYSTEMS TAB ─── */}
      {activeTab === 'systems' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {systemBreakdown.map(sys => {
              const totalSys = sys.total || 1
              return (
                <div key={sys.componentType} className="chart-card p-5">
                  <p className="text-[14px] font-bold text-slate-700 mb-1">{sys.label}</p>
                  <p className="text-[11px] text-slate-400 mb-4">{sys.total} componentes monitoreados</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Normal', value: sys.normal, color: '#10b981' },
                      { label: 'Precaución', value: sys.caution, color: '#f59e0b' },
                      { label: 'Crítico', value: sys.critical, color: '#ef4444' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span style={{ color: item.color }}>{item.label}</span>
                          <span className="text-slate-500">{item.value} ({Math.round(item.value / totalSys * 100)}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${item.value / totalSys * 100}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Salud</span>
                    <span
                      className="text-[16px] font-extrabold num"
                      style={{ color: sys.critical / totalSys > 0.2 ? '#ef4444' : sys.caution / totalSys > 0.3 ? '#f59e0b' : '#10b981' }}
                    >
                      {Math.round(sys.normal / totalSys * 100)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
