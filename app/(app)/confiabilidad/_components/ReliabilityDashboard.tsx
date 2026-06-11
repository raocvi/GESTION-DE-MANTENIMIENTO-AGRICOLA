"use client"

/**
 * Dashboard interactivo de Confiabilidad — estilo PowerBI.
 * KPIs gerenciales + rankings de falla + comparativos + estándares.
 * Hover PowerBI: cursor={false}, solo el elemento coloreado se resalta.
 */

import React, { useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid,
} from 'recharts'
import {
  Gauge, Timer, CheckCircle2, AlertTriangle, Clock, TrendingDown,
  Wrench, Factory, Package, CalendarClock,
} from 'lucide-react'
import type {
  ReliabilityKpis, MachineFailureRanking, SystemFailureRanking,
  PartFailureRanking, CompanyComparison, RepairStandard,
} from '@/modules/M11_reliability/actions'

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  kpis: ReliabilityKpis
  machines: MachineFailureRanking[]
  systems: SystemFailureRanking[]
  parts: PartFailureRanking[]
  companies: CompanyComparison[]
  stdBrand: RepairStandard[]
  stdCategory: RepairStandard[]
  upcoming: Array<{
    id: string; title: string; system: string | null; intervalLabel: string | null
    dueHours: number | null; status: string; hoursRemaining: number
    assetName: string; internalCode: string | null; clientName: string; currentHours: number
  }>
}

const fmtCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

// ─── KPI Card ────────────────────────────────────────────────────────────────

function Kpi({ label, value, unit, icon, color, hint }: {
  label: string; value: string | number; unit?: string
  icon: React.ReactNode; color: string; hint?: string
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400 mb-2 truncate">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-[1.7rem] font-extrabold tracking-tight num leading-none ${color}`}>{value}</span>
            {unit && <span className="text-xs font-bold text-slate-400">{unit}</span>}
          </div>
          {hint && <p className="text-[10px] text-slate-400 font-medium mt-1.5">{hint}</p>}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── Gráfica de barras PowerBI ───────────────────────────────────────────────

function PBIBar({ data, dataKey, nameKey, color, height = 260, horizontal = false, fmt }: {
  data: any[]; dataKey: string; nameKey: string; color: string
  height?: number; horizontal?: boolean; fmt?: (v: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  if (!data.length) return <div className="flex items-center justify-center h-40 text-sm text-slate-400">Sin datos</div>

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 16, left: horizontal ? 8 : 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={nameKey} width={150} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={nameKey} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip
          cursor={false}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          formatter={(v: any) => [fmt ? fmt(Number(v)) : v, '']}
        />
        <Bar dataKey={dataKey} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={28}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={color}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                filter: hover === i ? 'brightness(1.15)' : 'none',
                opacity: hover === null || hover === i ? 1 : 0.45,
                transition: 'opacity 0.15s ease, filter 0.15s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Card de gráfica ─────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, icon, children, className = '' }: {
  title: string; subtitle?: string; icon?: React.ReactNode
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={`chart-card p-5 ${className}`}>
      <div className="flex items-center gap-2.5 mb-4">
        {icon && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">{icon}</div>}
        <div>
          <h3 className="text-[13px] font-extrabold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Dashboard principal ─────────────────────────────────────────────────────

export function ReliabilityDashboard({ kpis, machines, systems, parts, companies, stdBrand, stdCategory, upcoming }: Props) {
  const [tab, setTab] = useState<'fallas' | 'comparativo' | 'estandares' | 'programados'>('fallas')

  return (
    <div className="flex flex-col gap-5">

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi label="MTBF" value={kpis.mtbf.toLocaleString('es-CO')} unit="h" color="text-blue-700"
          icon={<Gauge className="h-4 w-4" />} hint="Horas medias entre fallas" />
        <Kpi label="MTTR" value={kpis.mttr.toLocaleString('es-CO')} unit="h" color="text-amber-700"
          icon={<Timer className="h-4 w-4" />} hint="Tiempo medio de reparación" />
        <Kpi label="Disponibilidad" value={`${kpis.availability}%`} color={kpis.availability >= 95 ? 'text-emerald-700' : 'text-rose-700'}
          icon={<CheckCircle2 className="h-4 w-4" />} hint="MTBF / (MTBF + MTTR)" />
        <Kpi label="Fallas Totales" value={kpis.totalFailures} color="text-rose-700"
          icon={<AlertTriangle className="h-4 w-4" />} hint="OTs correctivas + emergencias" />
        <Kpi label="Horas de Parada" value={kpis.totalDowntime.toLocaleString('es-CO')} unit="h" color="text-violet-700"
          icon={<Clock className="h-4 w-4" />} hint="Downtime acumulado" />
        <Kpi label="Tasa de Falla" value={kpis.failureRate} unit="/1000h" color="text-slate-700"
          icon={<TrendingDown className="h-4 w-4" />} hint={`Sobre ${kpis.totalOperatingHours.toLocaleString('es-CO')} h operadas`} />
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          ['fallas', 'Análisis de Fallas', <AlertTriangle key="i" className="h-3 w-3" />],
          ['comparativo', 'Comparativo Empresas', <Factory key="i" className="h-3 w-3" />],
          ['estandares', 'Estándares de Reparación', <Wrench key="i" className="h-3 w-3" />],
          ['programados', 'Próximos Mantenimientos', <CalendarClock key="i" className="h-3 w-3" />],
        ] as const).map(([key, label, icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`filter-chip ${tab === key ? 'active' : ''}`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Análisis de Fallas ─── */}
      {tab === 'fallas' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-fade-in">
          <ChartCard title="Máquinas que Más Fallan" subtitle="Número de fallas registradas por equipo" icon={<AlertTriangle className="h-4 w-4" />}>
            <PBIBar
              data={machines.slice(0, 10).map(m => ({ name: `${m.internalCode || m.assetName}`, fallas: m.failures }))}
              dataKey="fallas" nameKey="name" color="#f43f5e" horizontal height={300}
            />
          </ChartCard>

          <ChartCard title="Sistemas que Más Fallan" subtitle="Fallas por sistema / componente" icon={<Wrench className="h-4 w-4" />}>
            <PBIBar
              data={systems.slice(0, 10).map(s => ({ name: s.system.length > 28 ? s.system.slice(0, 28) + '…' : s.system, fallas: s.failures }))}
              dataKey="fallas" nameKey="name" color="#7c3aed" horizontal height={300}
            />
          </ChartCard>

          <ChartCard title="Repuestos Más Consumidos en Fallas" subtitle="Frecuencia de uso en OTs correctivas" icon={<Package className="h-4 w-4" />}>
            <PBIBar
              data={parts.slice(0, 10).map(p => ({ name: p.partName.length > 26 ? p.partName.slice(0, 26) + '…' : p.partName, usos: p.timesUsed }))}
              dataKey="usos" nameKey="name" color="#d97706" horizontal height={300}
            />
          </ChartCard>

          <ChartCard title="Detalle de Máquinas Críticas" subtitle="MTBF, MTTR y costo por equipo" icon={<Gauge className="h-4 w-4" />}>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="data-table">
                <thead>
                  <tr><th>Equipo</th><th>Cliente</th><th>Fallas</th><th>MTBF</th><th>MTTR</th><th>Costo</th></tr>
                </thead>
                <tbody>
                  {machines.slice(0, 8).map(m => (
                    <tr key={m.assetId}>
                      <td className="font-bold text-slate-800">{m.internalCode || m.assetName}</td>
                      <td className="text-[12px]">{m.clientName}</td>
                      <td><span className="badge bg-rose-50 text-rose-700">{m.failures}</span></td>
                      <td className="num">{m.mtbf.toLocaleString('es-CO')} h</td>
                      <td className="num">{m.mttr} h</td>
                      <td className="num text-[12px]">{fmtCOP(m.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ─── Tab: Comparativo Empresas ─── */}
      {tab === 'comparativo' && (
        <div className="flex flex-col gap-5 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <ChartCard title="Fallas por Empresa" subtitle="Total de eventos correctivos" icon={<Factory className="h-4 w-4" />}>
              <PBIBar
                data={companies.slice(0, 10).map(c => ({ name: c.clientName.length > 22 ? c.clientName.slice(0, 22) + '…' : c.clientName, fallas: c.failures }))}
                dataKey="fallas" nameKey="name" color="#0369a1" horizontal height={300}
              />
            </ChartCard>
            <ChartCard title="Costo Total por Empresa" subtitle="Inversión en mantenimiento (COP)" icon={<Factory className="h-4 w-4" />}>
              <PBIBar
                data={companies.slice(0, 10).map(c => ({ name: c.clientName.length > 22 ? c.clientName.slice(0, 22) + '…' : c.clientName, costo: c.totalCost }))}
                dataKey="costo" nameKey="name" color="#059669" horizontal height={300}
                fmt={(v) => fmtCOP(v)}
              />
            </ChartCard>
          </div>

          <ChartCard title="Tabla Comparativa entre Empresas" subtitle="Flota, confiabilidad, cumplimiento y costos" icon={<Factory className="h-4 w-4" />}>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="data-table">
                <thead>
                  <tr><th>Empresa</th><th>Equipos</th><th>OTs</th><th>Fallas</th><th>MTBF</th><th>MTTR</th><th>Disponib.</th><th>Cumplim.</th><th>Costo Total</th></tr>
                </thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.clientId}>
                      <td className="font-bold text-slate-800">{c.clientName}</td>
                      <td className="num">{c.assetCount}</td>
                      <td className="num">{c.totalOrders}</td>
                      <td><span className="badge bg-rose-50 text-rose-700">{c.failures}</span></td>
                      <td className="num">{c.mtbf.toLocaleString('es-CO')} h</td>
                      <td className="num">{c.mttr} h</td>
                      <td>
                        <span className={`badge ${c.availability >= 95 ? 'bg-emerald-50 text-emerald-700' : c.availability >= 90 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                          {c.availability}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${c.onTimeRate >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {c.onTimeRate}%
                        </span>
                      </td>
                      <td className="num text-[12px]">{fmtCOP(c.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ─── Tab: Estándares ─── */}
      {tab === 'estandares' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-fade-in">
          {[
            { title: 'Estándar por Marca', data: stdBrand },
            { title: 'Estándar por Tipo de Equipo', data: stdCategory },
          ].map(({ title, data }) => (
            <ChartCard key={title} title={title} subtitle="Horas promedio, P50, P90 y costo medio de reparación" icon={<Wrench className="h-4 w-4" />}>
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="data-table">
                  <thead>
                    <tr><th>Grupo</th><th>Reparac.</th><th>Prom.</th><th>P50</th><th>P90</th><th>Costo Prom.</th></tr>
                  </thead>
                  <tbody>
                    {data.map(s => (
                      <tr key={s.group}>
                        <td className="font-bold text-slate-800">{s.group}</td>
                        <td className="num">{s.orders}</td>
                        <td className="num">{s.avgRepairHours} h</td>
                        <td className="num">{s.p50RepairHours} h</td>
                        <td className="num text-amber-700 font-bold">{s.p90RepairHours} h</td>
                        <td className="num text-[12px]">{fmtCOP(s.avgCost)}</td>
                      </tr>
                    ))}
                    {!data.length && <tr><td colSpan={6} className="text-center text-slate-400 py-8">Sin datos suficientes</td></tr>}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          ))}
        </div>
      )}

      {/* ─── Tab: Próximos Mantenimientos ─── */}
      {tab === 'programados' && (
        <ChartCard title="Próximos Mantenimientos Programados" subtitle="Generados desde los planes oficiales Case IH por horómetro" icon={<CalendarClock className="h-4 w-4" />} className="animate-fade-in">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="data-table">
              <thead>
                <tr><th>Estado</th><th>Equipo</th><th>Cliente</th><th>Actividad</th><th>Sistema</th><th>Intervalo</th><th>Horóm. Actual</th><th>Próximo a</th><th>Restante</th></tr>
              </thead>
              <tbody>
                {upcoming.map(u => (
                  <tr key={u.id}>
                    <td>
                      <span className={`status-pill ${
                        u.status === 'overdue' ? 'bg-rose-50 text-rose-700'
                        : u.status === 'due_soon' ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'}`}
                      >
                        <span className={`status-dot ${u.status === 'overdue' ? 'bg-rose-500' : u.status === 'due_soon' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        {u.status === 'overdue' ? 'Vencido' : u.status === 'due_soon' ? 'Próximo' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="font-bold text-slate-800">{u.internalCode || u.assetName}</td>
                    <td className="text-[12px]">{u.clientName}</td>
                    <td className="text-[12px] max-w-[260px] truncate">{u.title}</td>
                    <td className="text-[11px] text-slate-500 max-w-[160px] truncate">{u.system}</td>
                    <td className="text-[11px]">{u.intervalLabel}</td>
                    <td className="num">{u.currentHours.toLocaleString('es-CO')} h</td>
                    <td className="num">{u.dueHours?.toLocaleString('es-CO')} h</td>
                    <td className={`num font-bold ${u.hoursRemaining < 0 ? 'text-rose-600' : u.hoursRemaining < 50 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {u.hoursRemaining < 0 ? `${Math.abs(u.hoursRemaining)} h vencido` : `${u.hoursRemaining} h`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  )
}
