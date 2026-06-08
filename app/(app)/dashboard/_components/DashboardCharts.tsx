import React, { useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, Legend
} from 'recharts'
import { differenceInDays } from 'date-fns'
import { Info } from 'lucide-react'

// ── Palettes ──────────────────────────────────────────────
const TYPE_COLORS   = ['#0052cc', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899']
const PRIO_COLORS: Record<string, string> = {
  critical: '#f43f5e', high: '#f97316', medium: '#f59e0b', low: '#3b82f6'
}
const AREA_COLORS   = { abiertas: '#3b82f6', cerradas: '#10b981' }
const BAR_COLORS    = ['#f43f5e', '#f97316', '#f59e0b', '#0052cc', '#8b5cf6']

const TYPE_LABELS: Record<string, string> = {
  preventive:    'Preventivo',   corrective:    'Correctivo',   inspection: 'Inspección',
  predictive:    'Predictivo',   warranty:      'Garantía',      emergency:  'Emergencia',
  campaign:      'Campaña',      predelivery:   'Alistamiento', seasonal_pre: 'Pretemporada',
  seasonal_post: 'Posttemporada', daily_operator: 'Rev. Diaria',
}
const PRIO_LABELS: Record<string, string> = {
  critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja'
}

// ── Custom Tooltip ─────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-modal text-xs font-semibold text-slate-700">
      {label && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span>{p.name}:</span>
          <span className="font-black">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Chart Section Header ───────────────────────────────────
function ChartHeader({ title, description, hint }: { title: string; description: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-50">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">{title}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
      </div>
      {hint && (
        <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium mt-0.5 shrink-0">
          <Info className="h-3 w-3" /> {hint}
        </div>
      )}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────
function EmptyChart({ msg = 'Sin datos disponibles' }: { msg?: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-300">
      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
        <Info className="h-4 w-4" />
      </div>
      <p className="text-xs font-semibold">{msg}</p>
    </div>
  )
}

interface DashboardChartsProps {
  orders: any[]
  selectedType: string | null
  onSelectType: (t: string | null) => void
  selectedTech: string | null
  onSelectTech: (t: string | null) => void
}

export function DashboardCharts({ orders, selectedType, onSelectType, selectedTech, onSelectTech }: DashboardChartsProps) {

  // 1. Type distribution (donut)
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach(o => { counts[o.type] = (counts[o.type] || 0) + 1 })
    const total = orders.length || 1
    return Object.entries(counts)
      .map(([type, value]) => ({ type, name: TYPE_LABELS[type] || type, value, pct: Math.round((value / total) * 100) }))
      .sort((a, b) => b.value - a.value)
  }, [orders])

  // 2. Delay days by tech (bar)
  const barData = useMemo(() => {
    const now = new Date()
    const map: Record<string, { total: number; count: number; fullName: string }> = {}
    orders.forEach(o => {
      if (!o.assignedTo?.name || !o.dueDate) return
      const due = new Date(o.dueDate)
      const end = (o.status === 'closed' || o.status === 'completed')
        ? (o.closedAt ? new Date(o.closedAt) : new Date(o.createdAt)) : now
      const delay = differenceInDays(end, due)
      if (delay > 0) {
        const k = o.assignedTo.name
        if (!map[k]) map[k] = { total: 0, count: 0, fullName: k }
        map[k].total += delay; map[k].count++
      }
    })
    return Object.entries(map)
      .map(([_, d]) => ({ name: d.fullName.split(' ').slice(0, 2).join(' '), fullName: d.fullName, days: parseFloat(d.total.toFixed(1)) }))
      .sort((a, b) => b.days - a.days).slice(0, 5)
  }, [orders])

  // 3. Priority donut
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    orders.forEach(o => { const p = (o.priority || 'medium').toLowerCase(); counts[p] = (counts[p] || 0) + 1 })
    const total = orders.length || 1
    return Object.entries(counts).filter(([, v]) => v > 0)
      .map(([priority, value]) => ({ priority, name: PRIO_LABELS[priority] || priority, value, pct: Math.round((value / total) * 100) }))
  }, [orders])

  // 4. Top failing assets (horizontal bar)
  const assetData = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.filter(o => o.type === 'corrective').forEach(o => {
      const code = o.asset?.internalCode || 'Sin Código'
      counts[code] = (counts[code] || 0) + 1
    })
    return Object.entries(counts).map(([code, n]) => ({ code, Correctivas: n }))
      .sort((a, b) => b.Correctivas - a.Correctivas).slice(0, 5)
  }, [orders])

  // 5. 6-month trend (area)
  const trendData = useMemo(() => {
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const now = new Date()
    const data = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return { year: d.getFullYear(), month: d.getMonth(), name: `${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`, Abiertas: 0, Cerradas: 0 }
    })
    orders.forEach(o => {
      const c = new Date(o.createdAt), cl = o.closedAt ? new Date(o.closedAt) : null
      data.forEach(m => {
        if (c.getFullYear() === m.year && c.getMonth() === m.month) m.Abiertas++
        if (cl && cl.getFullYear() === m.year && cl.getMonth() === m.month) m.Cerradas++
      })
    })
    return data
  }, [orders])

  // 6. Status distribution (bar)
  const statusData = useMemo(() => {
    const STATUS_LABEL: Record<string, string> = {
      new: 'Nueva', in_progress: 'En ejecución', closed: 'Cerrada',
      assigned: 'Asignada', scheduled: 'Programada', paused: 'Pausada',
      pending_parts: 'Pend. repuestos', cancelled: 'Cancelada'
    }
    const counts: Record<string, number> = {}
    orders.forEach(o => { const k = STATUS_LABEL[o.status] || o.status; counts[k] = (counts[k] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6)
  }, [orders])

  return (
    <div className="space-y-4">

      {/* Row 1: Donut + Bar + Donut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Chart 1: Órdenes por Tipo */}
        <div className="chart-card">
          <ChartHeader title="Órdenes por Tipo" description="Distribución por categoría" hint="Clic = filtrar" />
          <div className="p-4">
            <div className="relative h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]}
                        onClick={() => onSelectType(selectedType === entry.type ? null : entry.type)}
                        className="cursor-pointer transition-all"
                        opacity={selectedType && selectedType !== entry.type ? 0.25 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">{orders.length}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">órdenes</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {pieData.slice(0, 4).map((item, i) => (
                <div
                  key={item.type}
                  className={`flex items-center justify-between text-[11px] rounded-lg px-2 py-1 cursor-pointer transition-all ${selectedType === item.type ? 'bg-blue-50 font-bold' : 'hover:bg-slate-50'}`}
                  onClick={() => onSelectType(selectedType === item.type ? null : item.type)}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.value}</span>
                    <span className="text-slate-400 w-7 text-right">{item.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Retrasos por Técnico */}
        <div className="chart-card">
          <ChartHeader title="Retrasos por Técnico" description="Días acumulados fuera de plazo" hint="Clic = filtrar" />
          <div className="p-4 h-[290px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} formatter={(v) => [`${v} días`, 'Retraso']} />
                  <Bar dataKey="days" radius={[4, 4, 0, 0]} barSize={28}
                    label={{ position: 'top', fill: '#f43f5e', fontSize: 10, fontWeight: 700, formatter: (v: any) => `${v}d`, dy: -4 }}
                  >
                    {barData.map((entry, i) => (
                      <Cell
                        key={i} fill={BAR_COLORS[i % BAR_COLORS.length]}
                        onClick={() => onSelectTech(selectedTech === entry.fullName ? null : entry.fullName)}
                        className="cursor-pointer transition-all"
                        opacity={selectedTech && selectedTech !== entry.fullName ? 0.25 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No hay órdenes retrasadas" />}
          </div>
        </div>

        {/* Chart 3: Prioridades */}
        <div className="chart-card">
          <ChartHeader title="Órdenes por Prioridad" description="Clasificación por severidad operativa" />
          <div className="p-4">
            <div className="relative h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={2} dataKey="value" stroke="none">
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={PRIO_COLORS[entry.priority] || '#94a3b8'} className="transition-all" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Prioridad</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {priorityData.map((item) => (
                <div key={item.priority} className="flex items-center justify-between text-[11px] rounded-lg px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: PRIO_COLORS[item.priority] }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.value}</span>
                    <span className="text-slate-400 w-7 text-right">{item.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Trend + Assets + Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Chart 4: Tendencia 6 meses */}
        <div className="chart-card md:col-span-5">
          <ChartHeader title="Tendencia de Servicios" description="Últimos 6 meses — órdenes abiertas vs cerradas" />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAbiertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AREA_COLORS.abiertas} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={AREA_COLORS.abiertas} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCerradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AREA_COLORS.cerradas} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={AREA_COLORS.cerradas} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={28} iconType="circle" iconSize={6}
                  wrapperStyle={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }} />
                <Area type="monotone" dataKey="Abiertas" stroke={AREA_COLORS.abiertas} strokeWidth={2} fill="url(#gradAbiertas)" />
                <Area type="monotone" dataKey="Cerradas" stroke={AREA_COLORS.cerradas} strokeWidth={2} fill="url(#gradCerradas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Equipos con más correctivos */}
        <div className="chart-card md:col-span-4">
          <ChartHeader title="Equipos Críticos" description="Top 5 por frecuencia de falla correctiva" />
          <div className="p-4 h-[240px]">
            {assetData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetData} layout="vertical" margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="code" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} width={80} />
                  <Tooltip content={<ChartTooltip />} formatter={(v) => [`${v}`, 'Correctivas']} />
                  <Bar dataKey="Correctivas" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={18}
                    label={{ position: 'right', fill: '#7c3aed', fontSize: 10, fontWeight: 700, dx: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No hay fallas registradas" />}
          </div>
        </div>

        {/* Chart 6: Distribución por estado */}
        <div className="chart-card md:col-span-3">
          <ChartHeader title="Por Estado" description="Distribución de estados actuales" />
          <div className="p-4">
            <div className="flex flex-col gap-2">
              {statusData.map((item, i) => {
                const max = statusData[0]?.value || 1
                const pct = Math.round((item.value / max) * 100)
                return (
                  <div key={item.name} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 truncate max-w-[120px]">{item.name}</span>
                      <span className="font-black text-slate-800">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: TYPE_COLORS[i % TYPE_COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
