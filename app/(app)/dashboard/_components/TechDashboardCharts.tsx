'use client'

import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { differenceInDays } from 'date-fns'
import { Info } from 'lucide-react'

const BAR_COLORS  = ['#7c3aed', '#0052cc', '#059669', '#d97706', '#e11d48']
const PIE_COLORS  = ['#0052cc', '#7c3aed', '#059669', '#d97706', '#e11d48', '#06b6d4']
const PROD_COLORS = { Completadas: '#10b981', Retrasadas: '#f43f5e' }

// ── Tooltip limpio ──
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-lg text-xs pointer-events-none">
      {label && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-black text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="chart-card">
      <div className="px-5 pt-5 pb-3 border-b border-slate-50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">{title}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ── Barras con hover PowerBI: solo la barra coloreada cambia ──
function PBIBar({ data, dataKey, layout = 'vert', colors, labelFmt, multiKeys }: {
  data: any[]; dataKey?: string; layout?: 'vert' | 'hori'
  colors: string[]; labelFmt?: (v: any) => string
  multiKeys?: Array<{ key: string; color: string }>
}) {
  const [hov, setHov] = useState<number | null>(null)

  const cellStyle = (i: number) => ({
    filter: hov === i ? 'brightness(1.15)' : 'none',
    opacity: hov !== null && hov !== i ? 0.3 : 1,
    transition: 'filter 0.12s, opacity 0.12s',
  })

  if (layout === 'hori') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} width={80} />
          <Tooltip cursor={false} content={<ChartTooltip />} />
          {multiKeys ? (
            multiKeys.map(mk => (
              <Bar key={mk.key} dataKey={mk.key} fill={mk.color} radius={[0, 4, 4, 0]} barSize={10}
                onMouseEnter={(_, i) => setHov(i)} onMouseLeave={() => setHov(null)}
              >
                {data.map((_, i) => <Cell key={i} style={cellStyle(i)} />)}
              </Bar>
            ))
          ) : (
            <Bar dataKey={dataKey!} radius={[0, 4, 4, 0]} barSize={16}
              onMouseEnter={(_, i) => setHov(i)} onMouseLeave={() => setHov(null)}
              label={labelFmt ? { position: 'right', fill: '#475569', fontSize: 10, fontWeight: 700, dx: 4, formatter: labelFmt } : undefined}
            >
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} style={cellStyle(i)} />)}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Vertical
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
        <YAxis hide />
        <Tooltip cursor={false} content={<ChartTooltip />} />
        {multiKeys ? (
          <>
            <Legend verticalAlign="top" height={24} iconSize={6} wrapperStyle={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }} />
            {multiKeys.map(mk => (
              <Bar key={mk.key} dataKey={mk.key} fill={mk.color} radius={[4, 4, 0, 0]} barSize={10}
                onMouseEnter={(_, i) => setHov(i)} onMouseLeave={() => setHov(null)}
              >
                {/* fill explícito requerido — sin él las barras agrupadas quedan transparentes en Recharts */}
                {data.map((_, i) => <Cell key={i} fill={mk.color} style={cellStyle(i)} />)}
              </Bar>
            ))}
          </>
        ) : (
          <Bar dataKey={dataKey!} radius={[4, 4, 0, 0]} barSize={24}
            onMouseEnter={(_, i) => setHov(i)} onMouseLeave={() => setHov(null)}
            label={labelFmt ? { position: 'top', fill: '#475569', fontSize: 10, fontWeight: 700, dy: -4, formatter: labelFmt } : undefined}
          >
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} style={cellStyle(i)} />)}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Donut con hover PowerBI: solo el segmento coloreado cambia ──
function PBIDonut({ data, colors, centerLabel }: {
  data: Array<{ name: string; value: number; percentage: number }>
  colors: string[]; centerLabel?: string
}) {
  const [hov, setHov] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={48} outerRadius={72}
              paddingAngle={2} dataKey="value" stroke="none"
              activeShape={undefined}
              onMouseEnter={(_, i) => setHov(i)}
              onMouseLeave={() => setHov(null)}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]}
                  style={{
                    filter: hov === i ? 'brightness(1.18)' : 'none',
                    opacity: hov !== null && hov !== i ? 0.25 : 1,
                    transform: hov === i ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: '50% 50%',
                    transition: 'filter 0.12s, opacity 0.12s, transform 0.12s',
                    cursor: 'default',
                  }}
                />
              ))}
            </Pie>
            <Tooltip cursor={false} content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerLabel && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{centerLabel}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 min-w-[130px]">
        {data.map((item, i) => (
          <div key={item.name} className={`flex items-center justify-between text-[11px] transition-opacity ${hov !== null && hov !== i ? 'opacity-30' : 'opacity-100'}`}>
            <div className="flex items-center gap-1.5 truncate max-w-[90px]">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
              <span className="text-slate-600 font-medium truncate">{item.name}</span>
            </div>
            <span className="font-black text-slate-800 ml-1">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TechDashboardCharts({ orders }: { orders: any[] }) {
  const now = useMemo(() => new Date(), [])

  const mttrData = useMemo(() => {
    const m: Record<string, { t: number; n: number }> = {}
    orders.filter(o => o.status === 'closed' && o.closedAt).forEach(o => {
      const name = o.assignedTo?.name?.split(' ').slice(0, 2).join(' ')
      if (!name) return
      const d = Math.max(1, differenceInDays(new Date(o.closedAt), o.startedAt ? new Date(o.startedAt) : new Date(o.createdAt)))
      if (!m[name]) m[name] = { t: 0, n: 0 }
      m[name].t += d; m[name].n++
    })
    return Object.entries(m).map(([name, d]) => ({ name, dias: parseFloat((d.t / d.n).toFixed(1)) })).sort((a, b) => b.dias - a.dias).slice(0, 5)
  }, [orders])

  const workloadData = useMemo(() => {
    const c: Record<string, number> = {}
    orders.filter(o => o.status !== 'closed' && o.status !== 'completed').forEach(o => {
      const n = o.assignedTo?.name?.split(' ').slice(0, 2).join(' ')
      if (n) c[n] = (c[n] || 0) + 1
    })
    const total = Object.values(c).reduce((a, b) => a + b, 0) || 1
    return Object.entries(c).map(([name, v]) => ({ name, value: v, percentage: Math.round((v / total) * 100) })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [orders])

  const productivityData = useMemo(() => {
    const s: Record<string, { completadas: number; retrasadas: number }> = {}
    orders.forEach(o => {
      const n = o.assignedTo?.name?.split(' ').slice(0, 2).join(' ')
      if (!n) return
      if (!s[n]) s[n] = { completadas: 0, retrasadas: 0 }
      if (o.status === 'closed' || o.status === 'completed') s[n].completadas++
      if (o.dueDate) {
        const due = new Date(o.dueDate)
        const end = (o.status === 'closed' || o.status === 'completed') ? (o.closedAt ? new Date(o.closedAt) : new Date(o.createdAt)) : now
        if (differenceInDays(end, due) > 0) s[n].retrasadas++
      }
    })
    return Object.entries(s).map(([name, d]) => ({ name, Completadas: d.completadas, Retrasadas: d.retrasadas })).sort((a, b) => b.Completadas - a.Completadas).slice(0, 5)
  }, [orders, now])

  const hoursData = useMemo(() => {
    const h: Record<string, number> = {}
    orders.forEach(o => { const n = o.assignedTo?.name?.split(' ').slice(0, 2).join(' '); if (n && o.actualHours) h[n] = (h[n] || 0) + o.actualHours })
    return Object.entries(h).map(([name, horas]) => ({ name, horas: parseFloat(horas.toFixed(1)) })).sort((a, b) => b.horas - a.horas).slice(0, 5)
  }, [orders])

  const empty = <div className="h-full flex items-center justify-center text-xs text-slate-300"><Info className="h-4 w-4 mr-1" />Sin datos</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="MTTR por Técnico" description="Días promedio de resolución (órdenes cerradas)">
          <div className="h-[190px]">
            {mttrData.length > 0
              ? <PBIBar data={mttrData} dataKey="dias" layout="vert" colors={BAR_COLORS} labelFmt={(v) => `${v}d`} />
              : empty}
          </div>
        </ChartCard>

        <ChartCard title="Distribución de Carga Activa" description="% de órdenes activas por técnico">
          {workloadData.length > 0
            ? <PBIDonut data={workloadData} colors={PIE_COLORS} centerLabel="Carga" />
            : <div className="h-[190px] flex items-center justify-center text-xs text-slate-300"><Info className="h-4 w-4 mr-1" />Sin datos</div>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Productividad del Personal" description="Completadas vs Retrasadas por técnico">
          <div className="h-[190px]">
            {productivityData.length > 0
              ? <PBIBar data={productivityData} layout="vert" colors={[]} multiKeys={[
                  { key: 'Completadas', color: PROD_COLORS.Completadas },
                  { key: 'Retrasadas',  color: PROD_COLORS.Retrasadas },
                ]} />
              : empty}
          </div>
        </ChartCard>

        <ChartCard title="Horas Laboradas Acumuladas" description="Total de horas reales registradas">
          <div className="h-[190px]">
            {hoursData.length > 0
              ? <PBIBar data={hoursData} dataKey="horas" layout="hori" colors={['#7c3aed','#6d28d9','#5b21b6','#4c1d95','#3730a3']} labelFmt={(v) => `${v}h`} />
              : empty}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
