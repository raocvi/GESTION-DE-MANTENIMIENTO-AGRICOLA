'use client'

import React, { useMemo, useState, useCallback } from 'react'
import {
  PieChart, Pie, Cell, Sector, ResponsiveContainer, Tooltip,
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
const AREA_COLORS = { abiertas: '#3b82f6', cerradas: '#10b981' }
const BAR_COLORS  = ['#f43f5e', '#f97316', '#f59e0b', '#0052cc', '#8b5cf6']

const TYPE_LABELS: Record<string, string> = {
  preventive:    'Preventivo',     corrective:    'Correctivo',   inspection: 'Inspección',
  predictive:    'Predictivo',     warranty:      'Garantía',     emergency:  'Emergencia',
  campaign:      'Campaña',        predelivery:   'Alistamiento', seasonal_pre: 'Pretemporada',
  seasonal_post: 'Posttemporada',  daily_operator: 'Rev. Diaria',
}
const PRIO_LABELS: Record<string, string> = {
  critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja'
}

// ─────────────────────────────────────────────────────────
// Custom tooltip — limpio, sin bordes gruesos
// ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-lg text-xs font-semibold text-slate-700 pointer-events-none">
      {label && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color || p.fill }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-black text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Active shape para Pie/Donut — SOLO el segmento coloreado
// se expande 4px, sin ningún efecto de halo o fondo
// ─────────────────────────────────────────────────────────
const PiePowerBIShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius,
    startAngle, endAngle, fill,
    isActive,
  } = props

  // Cuando está activo: solo la porción coloreada crece 5px hacia afuera
  const r = isActive ? outerRadius + 5 : outerRadius
  const ri = isActive ? innerRadius - 2 : innerRadius

  return (
    <Sector
      cx={cx} cy={cy}
      innerRadius={ri}
      outerRadius={r}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke={isActive ? 'white' : 'none'}
      strokeWidth={isActive ? 1.5 : 0}
    />
  )
}

// ─────────────────────────────────────────────────────────
// Donut chart reutilizable con hover PowerBI-style
// ─────────────────────────────────────────────────────────
function PowerBIDonut({
  data,
  colors,
  innerLabel,
  subLabel,
  onClickSegment,
  selectedKey,
  keyField = 'key',
}: {
  data: Array<{ name: string; value: number; pct: number; [k: string]: any }>
  colors: string[]
  innerLabel?: React.ReactNode
  subLabel?: string
  onClickSegment?: (key: string | null) => void
  selectedKey?: string | null
  keyField?: string
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  return (
    <div className="relative h-[190px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={52} outerRadius={76}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            // Desactivamos el activeShape por defecto de Recharts
            activeShape={undefined}
            onMouseEnter={(_, index) => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={(entry, index) => {
              if (onClickSegment) {
                const key = entry[keyField]
                onClickSegment(selectedKey === key ? null : key)
              }
            }}
          >
            {data.map((entry, i) => {
              const isHovered  = hoverIndex === i
              const isSelected = selectedKey !== undefined && selectedKey !== null && selectedKey === entry[keyField]
              const isDimmed   = (selectedKey !== null && selectedKey !== undefined && !isSelected)
                               || (hoverIndex !== null && !isHovered && selectedKey === undefined)

              return (
                <Cell
                  key={`cell-${i}`}
                  fill={colors[i % colors.length]}
                  // PowerBI: solo cambia opacidad del segmento, nada más
                  opacity={isDimmed ? 0.25 : isHovered || isSelected ? 1 : 1}
                  // El "active shape" lo manejamos aquí expandiendo el radio via props custom
                  // Recharts pasa props de sector a Cell cuando está en activeIndex
                  style={{
                    cursor: onClickSegment ? 'pointer' : 'default',
                    filter: isHovered || isSelected
                      ? `brightness(1.12) drop-shadow(0 0 0 transparent)`
                      : 'none',
                    transform: isHovered
                      ? 'scale(1.04)'
                      : 'scale(1)',
                    transformOrigin: '50% 50%',
                    transition: 'transform 0.15s ease, opacity 0.15s ease, filter 0.15s ease',
                  }}
                />
              )
            })}
          </Pie>
          {/* cursor={false} elimina el rectángulo de fondo en hover */}
          <Tooltip
            cursor={false}
            content={<ChartTooltip />}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Centro del donut */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {innerLabel ?? (
          <span className="text-2xl font-black text-slate-800">
            {data.reduce((s, d) => s + d.value, 0)}
          </span>
        )}
        {subLabel && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{subLabel}</span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Bar chart con hover PowerBI-style
// ─────────────────────────────────────────────────────────
function PowerBIBar({
  data,
  dataKey,
  colors,
  layout = 'vertical-bars',
  onClickBar,
  selectedKey,
  keyField = 'name',
  labelFormatter,
}: {
  data: any[]
  dataKey: string
  colors: string[]
  layout?: 'vertical-bars' | 'horizontal-bars'
  onClickBar?: (key: string | null) => void
  selectedKey?: string | null
  keyField?: string
  labelFormatter?: (v: any) => string
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const isHori = layout === 'horizontal-bars'

  return (
    <ResponsiveContainer width="100%" height="100%">
      {isHori ? (
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis
            dataKey={keyField} type="category" axisLine={false} tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} width={80}
          />
          {/* cursor={false} = sin rectángulo de fondo al hacer hover */}
          <Tooltip cursor={false} content={<ChartTooltip />} />
          <Bar
            dataKey={dataKey}
            radius={[0, 4, 4, 0]}
            barSize={18}
            onMouseEnter={(_, index) => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={(entry, index) => {
              if (onClickBar) {
                const key = entry[keyField]
                onClickBar(selectedKey === key ? null : key)
              }
            }}
            label={labelFormatter ? { position: 'right', fill: '#7c3aed', fontSize: 10, fontWeight: 700, dx: 4, formatter: labelFormatter } : undefined}
          >
            {data.map((entry, i) => {
              const isHovered  = hoverIndex === i
              const isSelected = selectedKey !== null && selectedKey !== undefined && selectedKey === entry[keyField]
              const isDimmed   = (selectedKey !== null && selectedKey !== undefined && !isSelected)
                               || (hoverIndex !== null && !isHovered && selectedKey === undefined)
              return (
                <Cell
                  key={i}
                  fill={colors[i % colors.length]}
                  opacity={isDimmed ? 0.25 : 1}
                  style={{
                    cursor: onClickBar ? 'pointer' : 'default',
                    filter: isHovered ? 'brightness(1.15)' : 'none',
                    transition: 'filter 0.12s ease, opacity 0.12s ease',
                  }}
                />
              )
            })}
          </Bar>
        </BarChart>
      ) : (
        <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey={keyField} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
          <YAxis hide />
          {/* cursor={false} = sin rectángulo de fondo */}
          <Tooltip cursor={false} content={<ChartTooltip />} />
          <Bar
            dataKey={dataKey}
            radius={[4, 4, 0, 0]}
            barSize={28}
            onMouseEnter={(_, index) => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={(entry, index) => {
              if (onClickBar) {
                const key = entry[keyField]
                onClickBar(selectedKey === key ? null : key)
              }
            }}
            label={labelFormatter ? {
              position: 'top', fontSize: 10, fontWeight: 700, dy: -4,
              fill: colors[0], formatter: labelFormatter,
            } : undefined}
          >
            {data.map((entry, i) => {
              const isHovered  = hoverIndex === i
              const isSelected = selectedKey !== null && selectedKey !== undefined && selectedKey === entry[keyField]
              const isDimmed   = (selectedKey !== null && selectedKey !== undefined && !isSelected)
                               || (hoverIndex !== null && !isHovered && selectedKey === undefined)
              return (
                <Cell
                  key={i}
                  fill={colors[i % colors.length]}
                  opacity={isDimmed ? 0.25 : 1}
                  style={{
                    cursor: onClickBar ? 'pointer' : 'default',
                    // Solo la barra coloreada se ilumina, sin ningún fondo
                    filter: isHovered ? 'brightness(1.15)' : 'none',
                    transition: 'filter 0.12s ease, opacity 0.12s ease',
                  }}
                />
              )
            })}
          </Bar>
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}

// ─────────────────────────────────────────────────────────
// Card contenedor
// ─────────────────────────────────────────────────────────
function ChartCard({
  title, description, hint, children, className = ''
}: {
  title: string; description: string; hint?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-50">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        </div>
        {hint && (
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium shrink-0 mt-0.5">
            <Info className="h-3 w-3" /> {hint}
          </div>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function EmptyChart({ msg = 'Sin datos disponibles' }: { msg?: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-300">
      <Info className="h-5 w-5" />
      <p className="text-xs font-semibold">{msg}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────
interface DashboardChartsProps {
  orders: any[]
  selectedType: string | null
  onSelectType: (t: string | null) => void
  selectedTech: string | null
  onSelectTech: (t: string | null) => void
}

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────
export function DashboardCharts({
  orders, selectedType, onSelectType, selectedTech, onSelectTech
}: DashboardChartsProps) {

  // 1. Tipo (donut)
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach(o => { counts[o.type] = (counts[o.type] || 0) + 1 })
    const total = orders.length || 1
    return Object.entries(counts)
      .map(([type, value]) => ({ type, key: type, name: TYPE_LABELS[type] || type, value, pct: Math.round((value / total) * 100) }))
      .sort((a, b) => b.value - a.value)
  }, [orders])

  // 2. Retrasos por técnico (barras)
  const barData = useMemo(() => {
    const now = new Date()
    const map: Record<string, { total: number; fullName: string }> = {}
    orders.forEach(o => {
      if (!o.assignedTo?.name || !o.dueDate) return
      const due = new Date(o.dueDate)
      const end = (o.status === 'closed' || o.status === 'completed')
        ? (o.closedAt ? new Date(o.closedAt) : new Date(o.createdAt)) : now
      const delay = differenceInDays(end, due)
      if (delay > 0) {
        const k = o.assignedTo.name
        if (!map[k]) map[k] = { total: 0, fullName: k }
        map[k].total += delay
      }
    })
    return Object.entries(map)
      .map(([_, d]) => ({
        name: d.fullName.split(' ').slice(0, 2).join(' '),
        fullName: d.fullName,
        key: d.fullName,
        days: parseFloat(d.total.toFixed(1)),
      }))
      .sort((a, b) => b.days - a.days).slice(0, 5)
  }, [orders])

  // 3. Prioridad (donut)
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    orders.forEach(o => { const p = (o.priority || 'medium').toLowerCase(); counts[p] = (counts[p] || 0) + 1 })
    const total = orders.length || 1
    return Object.entries(counts).filter(([, v]) => v > 0)
      .map(([priority, value]) => ({ priority, key: priority, name: PRIO_LABELS[priority] || priority, value, pct: Math.round((value / total) * 100) }))
  }, [orders])

  // 4. Equipos con más correctivos (barras horizontales)
  const assetData = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.filter(o => o.type === 'corrective').forEach(o => {
      const code = o.asset?.internalCode || 'Sin Código'
      counts[code] = (counts[code] || 0) + 1
    })
    return Object.entries(counts)
      .map(([code, n]) => ({ code, key: code, Correctivas: n }))
      .sort((a, b) => b.Correctivas - a.Correctivas).slice(0, 5)
  }, [orders])

  // 5. Tendencia 6 meses (área)
  const trendData = useMemo(() => {
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const now = new Date()
    const data = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return { year: d.getFullYear(), month: d.getMonth(), name: `${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`, Abiertas: 0, Cerradas: 0 }
    })
    orders.forEach(o => {
      const c  = new Date(o.createdAt)
      const cl = o.closedAt ? new Date(o.closedAt) : null
      data.forEach(m => {
        if (c.getFullYear() === m.year && c.getMonth() === m.month) m.Abiertas++
        if (cl && cl.getFullYear() === m.year && cl.getMonth() === m.month) m.Cerradas++
      })
    })
    return data
  }, [orders])

  // 6. Estado (barras de progreso)
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

      {/* Fila 1: 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Chart 1 — Donut por Tipo (clickeable, PowerBI hover) */}
        <ChartCard title="Órdenes por Tipo" description="Clic en segmento para filtrar" hint="Interactivo">
          <PowerBIDonut
            data={pieData}
            colors={TYPE_COLORS}
            subLabel="órdenes"
            keyField="type"
            onClickSegment={onSelectType}
            selectedKey={selectedType}
          />
          <div className="flex flex-col gap-1 mt-3">
            {pieData.slice(0, 4).map((item, i) => (
              <button
                key={item.type}
                onClick={() => onSelectType(selectedType === item.type ? null : item.type)}
                className={`flex items-center justify-between text-[11px] rounded-lg px-2 py-1 w-full transition-all text-left ${
                  selectedType === item.type ? 'bg-blue-50 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-800">{item.value}</span>
                  <span className="text-slate-400 w-7 text-right">{item.pct}%</span>
                </div>
              </button>
            ))}
          </div>
        </ChartCard>

        {/* Chart 2 — Barras por Técnico (clickeable, PowerBI hover) */}
        <ChartCard title="Retrasos por Técnico" description="Días acumulados fuera de plazo" hint="Clic para filtrar">
          <div className="h-[290px]">
            {barData.length > 0 ? (
              <PowerBIBar
                data={barData}
                dataKey="days"
                colors={BAR_COLORS}
                keyField="name"
                onClickBar={(key) => {
                  if (!key) { onSelectTech(null); return }
                  const entry = barData.find(b => b.name === key)
                  onSelectTech(selectedTech === entry?.fullName ? null : entry?.fullName ?? null)
                }}
                selectedKey={barData.find(b => b.fullName === selectedTech)?.name ?? null}
                labelFormatter={(v: any) => `${v}d`}
              />
            ) : (
              <EmptyChart msg="No hay órdenes retrasadas" />
            )}
          </div>
        </ChartCard>

        {/* Chart 3 — Donut por Prioridad (PowerBI hover) */}
        <ChartCard title="Órdenes por Prioridad" description="Clasificación por severidad operativa">
          <PowerBIDonut
            data={priorityData}
            colors={priorityData.map(d => PRIO_COLORS[d.priority] || '#94a3b8')}
            subLabel="prioridad"
          />
          <div className="flex flex-col gap-1 mt-3">
            {priorityData.map((item) => (
              <div key={item.priority} className="flex items-center justify-between text-[11px] rounded-lg px-2 py-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PRIO_COLORS[item.priority] }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-800">{item.value}</span>
                  <span className="text-slate-400 w-7 text-right">{item.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Fila 2: tendencia + activos + estado */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Chart 4 — Área de tendencia (PowerBI: tooltip sin cursor rect) */}
        <ChartCard title="Tendencia de Servicios" description="Últimos 6 meses — abiertas vs cerradas" className="md:col-span-5">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={AREA_COLORS.abiertas} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={AREA_COLORS.abiertas} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={AREA_COLORS.cerradas} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={AREA_COLORS.cerradas} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                {/* cursor={false} = sin línea vertical de fondo */}
                <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 2' }} content={<ChartTooltip />} />
                <Legend verticalAlign="top" height={28} iconType="circle" iconSize={6}
                  wrapperStyle={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }} />
                <Area type="monotone" dataKey="Abiertas" stroke={AREA_COLORS.abiertas} strokeWidth={2} fill="url(#gradA)" />
                <Area type="monotone" dataKey="Cerradas" stroke={AREA_COLORS.cerradas} strokeWidth={2} fill="url(#gradC)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 5 — Barras horizontales de equipos críticos (PowerBI hover) */}
        <ChartCard title="Equipos Críticos" description="Top 5 por fallas correctivas" className="md:col-span-4">
          <div className="h-[220px]">
            {assetData.length > 0 ? (
              <PowerBIBar
                data={assetData}
                dataKey="Correctivas"
                colors={['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']}
                layout="horizontal-bars"
                keyField="code"
                labelFormatter={(v: any) => `${v}`}
              />
            ) : (
              <EmptyChart msg="No hay fallas registradas" />
            )}
          </div>
        </ChartCard>

        {/* Chart 6 — Barras de progreso por estado */}
        <ChartCard title="Por Estado" description="Distribución actual de estados" className="md:col-span-3">
          <div className="flex flex-col gap-2.5">
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
        </ChartCard>

      </div>
    </div>
  )
}
