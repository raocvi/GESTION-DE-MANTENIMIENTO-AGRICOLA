'use client'

import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { differenceInDays } from 'date-fns'
import { Info } from 'lucide-react'

const BAR_COLORS = ['#0052cc', '#7c3aed', '#059669', '#d97706', '#e11d48']
const PIE_COLORS = ['#0052cc', '#7c3aed', '#059669', '#d97706', '#e11d48', '#06b6d4']

// ── Tooltip limpio, sin rectángulo de fondo ──
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

// ── Barra con hover PowerBI: solo el elemento coloreado cambia ──
function PBIBar({ data, dataKey, layout = 'hori', colors, labelFmt }: {
  data: any[]; dataKey: string; layout?: 'hori' | 'vert'; colors: string[]
  labelFmt?: (v: any) => string
}) {
  const [hov, setHov] = useState<number | null>(null)

  if (layout === 'hori') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} width={80} />
          {/* cursor={false} elimina el rect gris de fondo */}
          <Tooltip cursor={false} content={<ChartTooltip />} />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} barSize={16}
            onMouseEnter={(_, i) => setHov(i)} onMouseLeave={() => setHov(null)}
            label={labelFmt ? { position: 'right', fill: '#475569', fontSize: 10, fontWeight: 700, dx: 4, formatter: labelFmt } : undefined}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]}
                style={{
                  filter: hov === i ? 'brightness(1.15)' : hov !== null ? 'none' : 'none',
                  opacity: hov !== null && hov !== i ? 0.3 : 1,
                  transition: 'filter 0.12s, opacity 0.12s',
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
        <YAxis hide />
        {/* cursor={false} elimina el rect gris de fondo */}
        <Tooltip cursor={false} content={<ChartTooltip />} />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} barSize={24}
          onMouseEnter={(_, i) => setHov(i)} onMouseLeave={() => setHov(null)}
          label={labelFmt ? { position: 'top', fill: '#475569', fontSize: 10, fontWeight: 700, dy: -4, formatter: labelFmt } : undefined}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]}
              style={{
                filter: hov === i ? 'brightness(1.15)' : 'none',
                opacity: hov !== null && hov !== i ? 0.3 : 1,
                transition: 'filter 0.12s, opacity 0.12s',
              }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Donut con hover PowerBI: solo el segmento coloreado cambia ──
function PBIDonut({ data, colors, centerLabel }: {
  data: Array<{ name: string; value: number; pct?: number }>
  colors: string[]
  centerLabel?: string
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
                    // Solo el segmento coloreado se ilumina, sin halo ni fondo
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
            {/* cursor={false}: sin rectángulo de fondo en tooltip */}
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
            <span className="font-black text-slate-800 ml-1">{item.pct ?? item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ClientDashboardCharts({ orders }: { orders: any[] }) {
  const volumeData = useMemo(() => {
    const c: Record<string, number> = {}
    orders.forEach(o => { const n = (o.client?.name || 'Interno').replace('Agropecuaria ', ''); c[n] = (c[n] || 0) + 1 })
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [orders])

  const costData = useMemo(() => {
    const c: Record<string, number> = {}
    orders.forEach(o => { const n = (o.client?.name || 'Interno').replace('Agropecuaria ', ''); c[n] = (c[n] || 0) + (o.totalCost || 0) })
    const total = Object.values(c).reduce((a, b) => a + b, 0) || 1
    return Object.entries(c).map(([name, cost]) => ({ name, value: Math.round(cost), pct: Math.round((cost / total) * 100) })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [orders])

  const mttrData = useMemo(() => {
    const m: Record<string, { t: number; n: number }> = {}
    orders.filter(o => o.status === 'closed' && o.closedAt).forEach(o => {
      const name = (o.client?.name || 'Interno').replace('Agropecuaria ', '')
      const d = Math.max(1, differenceInDays(new Date(o.closedAt), o.startedAt ? new Date(o.startedAt) : new Date(o.createdAt)))
      if (!m[name]) m[name] = { t: 0, n: 0 }
      m[name].t += d; m[name].n++
    })
    return Object.entries(m).map(([name, d]) => ({ name, dias: parseFloat((d.t / d.n).toFixed(1)) })).sort((a, b) => b.dias - a.dias).slice(0, 5)
  }, [orders])

  const assetsData = useMemo(() => {
    const m: Record<string, Set<string>> = {}
    orders.forEach(o => { const n = (o.client?.name || 'Interno').replace('Agropecuaria ', ''); if (o.asset?.id) { if (!m[n]) m[n] = new Set(); m[n].add(o.asset.id) } })
    return Object.entries(m).map(([name, s]) => ({ name, equipos: s.size })).sort((a, b) => b.equipos - a.equipos).slice(0, 5)
  }, [orders])

  const empty = <div className="h-full flex items-center justify-center text-xs text-slate-300"><Info className="h-4 w-4 mr-1" />Sin datos</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Top 5 Clientes por Volumen" description="Clientes con más órdenes registradas">
          <div className="h-[190px]">
            {volumeData.length > 0 ? <PBIBar data={volumeData} dataKey="value" layout="hori" colors={BAR_COLORS} labelFmt={(v) => String(v)} /> : empty}
          </div>
        </ChartCard>

        <ChartCard title="Inversión por Cliente" description="Distribución porcentual de costos (COP)">
          {costData.length > 0
            ? <PBIDonut data={costData} colors={PIE_COLORS} centerLabel="Inversión" />
            : <div className="h-[190px] flex items-center justify-center text-xs text-slate-300"><Info className="h-4 w-4 mr-1" />Sin datos</div>}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="MTTR por Cliente" description="Promedio de días de resolución">
          <div className="h-[190px]">
            {mttrData.length > 0 ? <PBIBar data={mttrData} dataKey="dias" layout="vert" colors={BAR_COLORS} labelFmt={(v) => `${v}d`} /> : empty}
          </div>
        </ChartCard>

        <ChartCard title="Equipos en Operación" description="Maquinaria con OT activa por cliente">
          <div className="h-[190px]">
            {assetsData.length > 0 ? <PBIBar data={assetsData} dataKey="equipos" layout="hori" colors={['#059669','#0d9488','#0284c7','#7c3aed','#d97706']} labelFmt={(v) => String(v)} /> : empty}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
