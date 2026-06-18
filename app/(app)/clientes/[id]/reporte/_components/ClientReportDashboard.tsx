'use client'

import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, AreaChart, Area,
} from 'recharts'
import {
  Tractor, ClipboardList, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, TrendingDown, DollarSign, Wrench,
  Download, Calendar, BarChart3, Activity,
} from 'lucide-react'
import { generateClientReportHTML } from './reportHtmlExporter'

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportData = {
  client: { id: string; name: string; sector?: string | null; cropType?: string | null; [key: string]: unknown }
  generatedAt: string
  period: { from: string; to: string }
  kpis: {
    totalAssets: number; operativeAssets: number
    totalWOs: number; closedWOs: number
    preventiveCount: number; correctiveCount: number
    preventiveRatio: number; avgAvailability: number
    totalDowntimeHours: number; totalCost: number
    totalLaborCost: number; totalPartsCost: number
  }
  monthlyTrend: { month: string; preventive: number; corrective: number; inspection: number; other: number; cost: number }[]
  byType: Record<string, number>
  topComponents: { comp: string; count: number }[]
  byFailureMode: Record<string, number>
  assetMetrics: {
    id: string; code: string; name: string; category: string; model: string
    currentHours: number; operativeStatus: string
    woCount: number; correctiveCount: number; failureCount: number
    totalDowntime: number; totalCost: number; availPct: number
    mtbf: number | null; mttr: number | null
  }[]
  ganttWOs: {
    id: string; number: string; title: string; type: string; status: string; priority: string
    assetCode: string; techName: string
    startDate: string | Date; endDate: string | Date
    progress: number; estimatedHours: number | null; actualHours: number | null
  }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  preventive: '#10b981', corrective: '#f43f5e', inspection: '#3b82f6',
  predictive: '#8b5cf6', lubrication: '#f59e0b', other: '#64748b',
}
const TYPE_LABEL: Record<string, string> = {
  preventive: 'Preventivo', corrective: 'Correctivo', inspection: 'Inspección',
  predictive: 'Predictivo', lubrication: 'Lubricación', other: 'Otro',
}
const STATUS_COLORS: Record<string, string> = {
  operative: '#10b981', maintenance: '#f59e0b', out_of_service: '#f43f5e',
}
const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'blue', trend }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string
  color?: 'blue' | 'emerald' | 'rose' | 'amber' | 'violet'
  trend?: 'up' | 'down' | 'neutral'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600', amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        {trend && (
          trend === 'up' ? <TrendingUp className="h-4 w-4 text-emerald-500" />
          : trend === 'down' ? <TrendingDown className="h-4 w-4 text-rose-500" />
          : null
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Availability Gauge ───────────────────────────────────────────────────────
function AvailabilityGauge({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#f43f5e'
  const data = [{ value: pct, fill: color }, { value: 100 - pct, fill: '#f1f5f9' }]
  return (
    <div className="relative flex items-center justify-center">
      <RadialBarChart width={160} height={90} cx={80} cy={80} innerRadius={55} outerRadius={75}
        startAngle={180} endAngle={0} data={data} barSize={12}>
        <RadialBar dataKey="value" cornerRadius={6} background={false} />
      </RadialBarChart>
      <div className="absolute bottom-1 text-center">
        <p className="text-2xl font-bold" style={{ color }}>{pct}%</p>
        <p className="text-[10px] text-slate-500">Disponibilidad</p>
      </div>
    </div>
  )
}

// ─── Gantt Section ────────────────────────────────────────────────────────────
function GanttSection({ ganttWOs }: { ganttWOs: ReportData['ganttWOs'] }) {
  const [filter, setFilter] = useState<string>('all')
  const filtered = filter === 'all' ? ganttWOs : ganttWOs.filter(w => w.type === filter)

  if (filtered.length === 0) return (
    <p className="text-center text-sm text-slate-400 py-8">Sin actividades con fechas programadas</p>
  )

  const allDates = filtered.flatMap(w => [new Date(w.startDate), new Date(w.endDate)])
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
  minDate.setDate(minDate.getDate() - 1)
  maxDate.setDate(maxDate.getDate() + 2)
  const totalDays = Math.max(1, Math.round((maxDate.getTime() - minDate.getTime()) / 86400000))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayPct = Math.max(0, Math.min(100, ((today.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100))

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','preventive','corrective','inspection','predictive'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filter === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {t === 'all' ? 'Todas' : TYPE_LABEL[t] ?? t}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {filtered.slice(0, 25).map(wo => {
            const start = new Date(wo.startDate); start.setHours(0,0,0,0)
            const end = new Date(wo.endDate); end.setHours(0,0,0,0)
            const leftPct = Math.max(0, ((start.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100)
            const widthPct = Math.max(0.5, ((end.getTime() - start.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100)
            const color = TYPE_COLORS[wo.type] ?? '#64748b'
            const isDelayed = wo.status !== 'closed' && end < today
            return (
              <div key={wo.id} className="flex items-center gap-3 mb-1.5 group">
                <div className="w-48 shrink-0 text-right pr-2">
                  <p className="text-[11px] font-medium text-slate-700 truncate">{wo.assetCode}: {wo.title}</p>
                  <p className="text-[9px] text-slate-400 truncate">{wo.techName}</p>
                </div>
                <div className="flex-1 relative h-7 bg-slate-100 rounded-full overflow-hidden">
                  {/* Today line */}
                  <div className="absolute top-0 bottom-0 w-px bg-blue-400 z-10" style={{ left: `${todayPct}%` }} />
                  {/* Bar */}
                  <div
                    className="absolute top-1 bottom-1 rounded-full flex items-center px-2 overflow-hidden transition-all"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      background: isDelayed ? '#fda4af' : `${color}33`,
                      border: `1.5px solid ${isDelayed ? '#f43f5e' : color}`,
                    }}
                  >
                    {/* Progress fill */}
                    <div className="absolute inset-y-0 left-0 rounded-full opacity-70"
                      style={{ width: `${wo.progress}%`, background: isDelayed ? '#f43f5e' : color }} />
                    <span className="relative text-[9px] font-bold z-10 truncate"
                      style={{ color: isDelayed ? '#9f1239' : color === '#f43f5e' ? '#9f1239' : '#1e293b' }}>
                      {wo.progress}% · {wo.number}
                    </span>
                  </div>
                </div>
                {isDelayed && <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />}
              </div>
            )
          })}
          {/* X axis dates */}
          <div className="flex mt-2 ml-[192px] border-t border-slate-200 pt-1">
            <div className="flex-1 relative h-4">
              {Array.from({ length: 5 }, (_, i) => {
                const d = new Date(minDate.getTime() + (i / 4) * (maxDate.getTime() - minDate.getTime()))
                return (
                  <span key={i} className="absolute text-[9px] text-slate-400 transform -translate-x-1/2"
                    style={{ left: `${(i / 4) * 100}%` }}>
                    {d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function ClientReportDashboard({ data }: { data: ReportData }) {
  const { kpis, monthlyTrend, byType, topComponents, byFailureMode, assetMetrics, ganttWOs, client } = data
  const [downloading, setDownloading] = useState(false)

  const pieData = Object.entries(byType).map(([type, count]) => ({
    name: TYPE_LABEL[type] ?? type, value: count, color: TYPE_COLORS[type] ?? '#64748b',
  }))

  const failureData = Object.entries(byFailureMode)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([mode, count]) => ({ mode: mode.replace('_', ' '), count }))

  async function handleExport() {
    setDownloading(true)
    try {
      const html = generateClientReportHTML(data)
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Reporte_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const periodLabel = `${new Date(data.period.from).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })} — ${new Date(data.period.to).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Calendar className="h-3.5 w-3.5" /> Período: {periodLabel}
          </div>
          <p className="text-sm text-slate-500">
            Generado el {new Date(data.generatedAt).toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
        <button onClick={handleExport} disabled={downloading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md disabled:opacity-60 transition-all">
          <Download className="h-4 w-4" />
          {downloading ? 'Generando...' : 'Descargar Informe HTML'}
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={Tractor}       label="Equipos Activos"      value={`${kpis.operativeAssets}/${kpis.totalAssets}`}  color="blue"    sub="Operativos / Total" />
        <KpiCard icon={ClipboardList} label="OTs (12 meses)"       value={kpis.totalWOs}       color="violet" sub={`${kpis.closedWOs} cerradas`} />
        <KpiCard icon={CheckCircle2}  label="Ratio Preventivo"     value={`${kpis.preventiveRatio}%`} color={kpis.preventiveRatio >= 60 ? 'emerald' : 'amber'} sub={`${kpis.preventiveCount} prev / ${kpis.correctiveCount} corr`} trend={kpis.preventiveRatio >= 60 ? 'up' : 'down'} />
        <KpiCard icon={Activity}      label="Disponibilidad Prom." value={`${kpis.avgAvailability}%`} color={kpis.avgAvailability >= 85 ? 'emerald' : kpis.avgAvailability >= 70 ? 'amber' : 'rose'} trend={kpis.avgAvailability >= 85 ? 'up' : 'down'} />
        <KpiCard icon={Clock}         label="H. Parada Totales"    value={`${kpis.totalDowntimeHours}h`} color="rose" sub="Tiempo acumulado" />
        <KpiCard icon={DollarSign}    label="Costo Mantenimiento"  value={fmt.format(kpis.totalCost)} color="amber" sub={`M.O: ${fmt.format(kpis.totalLaborCost)}`} />
      </div>

      {/* Row 1: Monthly trend + Pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="chart-card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900">Tendencia Mensual de OTs</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyTrend} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="preventive" name="Preventivo" stackId="a" fill={TYPE_COLORS.preventive} radius={[0,0,0,0]} />
              <Bar dataKey="corrective" name="Correctivo" stackId="a" fill={TYPE_COLORS.corrective} />
              <Bar dataKey="inspection" name="Inspección" stackId="a" fill={TYPE_COLORS.inspection} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card flex flex-col items-center">
          <h3 className="font-semibold text-slate-900 mb-4 self-start">Distribución por Tipo</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number, n: string) => [`${v} OTs`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[10px] text-slate-500">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Availability per asset */}
      <div className="chart-card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Disponibilidad y Paradas por Equipo</h3>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(200, assetMetrics.length * 32)}>
          <BarChart data={assetMetrics} layout="vertical" margin={{ left: 80, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
            <YAxis type="category" dataKey="code" tick={{ fontSize: 10, fill: '#64748b' }} width={75} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }}
              formatter={(v: number, n: string) => [n === 'availPct' ? `${v}%` : `${v}h`, n === 'availPct' ? 'Disponibilidad' : 'Parada']} />
            <Bar dataKey="availPct" name="Disponibilidad" radius={[0,4,4,0]}
              fill="#10b981"
              label={{ position: 'right', fontSize: 10, fill: '#475569', formatter: (v: number) => `${v}%` }}>
              {assetMetrics.map((a, i) => (
                <Cell key={i} fill={a.availPct >= 90 ? '#10b981' : a.availPct >= 75 ? '#f59e0b' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Cost trend + Top components */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="chart-card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" /> Costo Mensual de Mantenimiento
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [fmt.format(v), 'Costo']} />
              <Area type="monotone" dataKey="cost" stroke="#3b82f6" fill="url(#costGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-slate-500" /> Top Componentes con Intervenciones
          </h3>
          {topComponents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos de componentes</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topComponents} layout="vertical" margin={{ left: 100, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="comp" tick={{ fontSize: 9, fill: '#64748b' }} width={95} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" name="Intervenciones" fill="#8b5cf6" radius={[0,4,4,0]}
                  label={{ position: 'right', fontSize: 10, fill: '#475569' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 4: Failure modes + Asset metrics table */}
      {failureData.length > 0 && (
        <div className="chart-card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" /> Modos de Falla Identificados
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={failureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mode" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="count" name="Frecuencia" fill="#f43f5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Asset metrics table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Tractor className="h-4 w-4 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Indicadores por Equipo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Equipo</th>
                <th className="px-4 py-3 text-left">Modelo</th>
                <th className="px-4 py-3 text-right">Horómetro</th>
                <th className="px-4 py-3 text-right">OTs</th>
                <th className="px-4 py-3 text-right">H. Parada</th>
                <th className="px-4 py-3 text-right">Disponibilidad</th>
                <th className="px-4 py-3 text-right">MTBF</th>
                <th className="px-4 py-3 text-right">MTTR</th>
                <th className="px-4 py-3 text-right">Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assetMetrics.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{a.code}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{a.name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{a.model}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{a.currentHours.toFixed(0)}h</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-slate-700">{a.woCount}</span>
                    {a.correctiveCount > 0 && <span className="text-[10px] text-rose-500 ml-1">({a.correctiveCount} corr)</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={a.totalDowntime > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'}>
                      {a.totalDowntime}h
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${a.availPct}%`,
                          background: a.availPct >= 90 ? '#10b981' : a.availPct >= 75 ? '#f59e0b' : '#f43f5e',
                        }} />
                      </div>
                      <span className={`font-bold text-xs ${a.availPct >= 90 ? 'text-emerald-600' : a.availPct >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {a.availPct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 text-xs">{a.mtbf != null ? `${a.mtbf}h` : '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-600 text-xs">{a.mttr != null ? `${a.mttr}h` : '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-700 text-xs font-medium">{a.totalCost > 0 ? fmt.format(a.totalCost) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gantt section */}
      <div className="chart-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Cronograma de Actividades</h3>
          <span className="ml-auto text-xs text-slate-400">Línea azul = hoy · Rojo = retrasado</span>
        </div>
        <GanttSection ganttWOs={ganttWOs} />
      </div>
    </div>
  )
}
