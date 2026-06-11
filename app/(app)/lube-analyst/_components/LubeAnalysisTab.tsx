'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'
import { TrendingUp, BarChart2, ChevronRight, X, Info, ArrowUpRight } from 'lucide-react'
import type { ScatterPoint, LimitData } from '@/modules/M12_lube_analyst/actions'

// ─── Config ───

export const VARS_BY_COMPONENT: Record<string, { key: string; label: string; unit: string }[]> = {
  motor: [
    { key: 'ironFe',     label: 'Hierro (Fe)',       unit: 'ppm'      },
    { key: 'copperCu',   label: 'Cobre (Cu)',         unit: 'ppm'      },
    { key: 'siliconSi',  label: 'Silicio (Si)',        unit: 'ppm'      },
    { key: 'pqIndex',    label: 'PQ Index',            unit: 'PQI'      },
    { key: 'tbn',        label: 'TBN',                 unit: 'mgKOH/g'  },
    { key: 'viscosity40',label: 'Viscosidad 40°C',     unit: 'cSt'      },
    { key: 'waterPct',   label: 'Agua',                unit: '%'        },
    { key: 'oxidation',  label: 'Oxidación',           unit: 'abs/cm'   },
    { key: 'fuelPct',    label: 'Dilución Combustible',unit: '%'        },
    { key: 'soot',       label: 'Hollín',              unit: '%'        },
  ],
  transmission: [
    { key: 'ironFe',     label: 'Hierro (Fe)',         unit: 'ppm'  },
    { key: 'copperCu',   label: 'Cobre (Cu)',           unit: 'ppm'  },
    { key: 'aluminumAl', label: 'Aluminio (Al)',        unit: 'ppm'  },
    { key: 'siliconSi',  label: 'Silicio (Si)',          unit: 'ppm'  },
    { key: 'pqIndex',    label: 'PQ Index',              unit: 'PQI'  },
    { key: 'viscosity40',label: 'Viscosidad 40°C',       unit: 'cSt'  },
    { key: 'waterPct',   label: 'Agua',                  unit: '%'    },
  ],
  hydraulic: [
    { key: 'ironFe',     label: 'Hierro (Fe)',         unit: 'ppm'      },
    { key: 'copperCu',   label: 'Cobre (Cu)',           unit: 'ppm'      },
    { key: 'siliconSi',  label: 'Silicio (Si)',          unit: 'ppm'      },
    { key: 'pqIndex',    label: 'PQ Index',              unit: 'PQI'      },
    { key: 'viscosity40',label: 'Viscosidad 40°C',       unit: 'cSt'      },
    { key: 'waterPct',   label: 'Agua',                  unit: '%'        },
    { key: 'oxidation',  label: 'Oxidación',             unit: 'abs/cm'   },
  ],
  differential: [
    { key: 'ironFe',     label: 'Hierro (Fe)',         unit: 'ppm'  },
    { key: 'copperCu',   label: 'Cobre (Cu)',           unit: 'ppm'  },
    { key: 'pqIndex',    label: 'PQ Index',              unit: 'PQI'  },
    { key: 'siliconSi',  label: 'Silicio (Si)',          unit: 'ppm'  },
    { key: 'waterPct',   label: 'Agua',                  unit: '%'    },
  ],
  final_drive: [
    { key: 'ironFe',     label: 'Hierro (Fe)',         unit: 'ppm'  },
    { key: 'copperCu',   label: 'Cobre (Cu)',           unit: 'ppm'  },
    { key: 'leadPb',     label: 'Plomo (Pb)',           unit: 'ppm'  },
    { key: 'pqIndex',    label: 'PQ Index',              unit: 'PQI'  },
    { key: 'siliconSi',  label: 'Silicio (Si)',          unit: 'ppm'  },
    { key: 'waterPct',   label: 'Agua',                  unit: '%'    },
  ],
}

const COMPONENT_LABELS: Record<string, string> = {
  motor: 'Motor', transmission: 'Transmisión', hydraulic: 'Hidráulico',
  differential: 'Diferencial', final_drive: 'Mandos Finales',
}

const STATUS_COLOR: Record<string, string> = {
  normal: '#10b981', caution: '#f59e0b', critical: '#ef4444', condemned: '#7c3aed',
}

// ─── Linear regression ───

function linearRegression(pts: { x: number; y: number }[]) {
  const n = pts.length
  if (n < 2) return null
  const sumX = pts.reduce((s, p) => s + p.x, 0)
  const sumY = pts.reduce((s, p) => s + p.y, 0)
  const sumXY = pts.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = pts.reduce((s, p) => s + p.x * p.x, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

function computeStats(values: number[]) {
  if (values.length === 0) return null
  const n = values.length
  const avg = values.reduce((s, v) => s + v, 0) / n
  const sorted = [...values].sort((a, b) => a - b)
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / n
  const stddev = Math.sqrt(variance)
  return { n, avg, median, stddev, min: sorted[0], max: sorted[n - 1], p25: sorted[Math.floor(n * 0.25)], p75: sorted[Math.floor(n * 0.75)] }
}

// ─── Custom tooltip ───

function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-[12px] min-w-[160px]">
      <p className="font-bold text-slate-700 mb-1">{d.assetCode} — {d.assetName}</p>
      <p className="text-slate-400 text-[10px] mb-2">{d.clientName}</p>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Horómetro</span>
        <span className="font-bold text-slate-700">{Math.round(d.x)}h</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Valor</span>
        <span className="font-bold" style={{ color: STATUS_COLOR[d.status] }}>{d.y?.toFixed(2)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Estado</span>
        <span className="font-semibold capitalize" style={{ color: STATUS_COLOR[d.status] }}>{d.status}</span>
      </div>
      <p className="text-[10px] text-slate-300 mt-1.5">{new Date(d.sampleDate).toLocaleDateString('es-CO')}</p>
    </div>
  )
}

// ─── Props ───

interface Props {
  points: ScatterPoint[]
  limits: LimitData[]
  clients: { id: string; name: string }[]
  assets: { id: string; code: string; name: string; clientId: string }[]
}

// ─── Main component ───

export function LubeAnalysisTab({ points, limits, clients, assets }: Props) {
  const [selectedClientId, setSelectedClientId] = useState<string>('all')
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectedComponentType, setSelectedComponentType] = useState('motor')
  const [selectedVariable, setSelectedVariable] = useState('ironFe')
  const [highlightedAssetId, setHighlightedAssetId] = useState<string | null>(null)

  const varsMeta = VARS_BY_COMPONENT[selectedComponentType] ?? VARS_BY_COMPONENT.motor
  const currentVarMeta = varsMeta.find(v => v.key === selectedVariable) ?? varsMeta[0]

  // Filter assets for selector
  const filteredAssets = useMemo(() =>
    assets.filter(a => selectedClientId === 'all' || a.clientId === selectedClientId),
    [assets, selectedClientId]
  )

  // Filter scatter points
  const filteredPoints = useMemo(() => {
    return points.filter(p => {
      if (p.componentType !== selectedComponentType) return false
      if (selectedClientId !== 'all' && p.clientId !== selectedClientId) return false
      if (selectedAssetId && p.assetId !== selectedAssetId) return false
      const val = (p as any)[selectedVariable]
      return val !== null && val !== undefined && !isNaN(val)
    })
  }, [points, selectedComponentType, selectedClientId, selectedAssetId, selectedVariable])

  // Build scatter chart data
  const scatterData = useMemo(() =>
    filteredPoints.map(p => ({
      x: p.equipmentHours,
      y: (p as any)[selectedVariable] as number,
      assetId: p.assetId,
      assetCode: p.assetCode,
      assetName: p.assetName,
      clientId: p.clientId,
      clientName: p.clientName,
      status: p.status,
      sampleDate: p.sampleDate,
    })),
    [filteredPoints, selectedVariable]
  )

  // Trend line
  const trendLine = useMemo(() => {
    const reg = linearRegression(scatterData.map(p => ({ x: p.x, y: p.y })))
    if (!reg || scatterData.length < 2) return []
    const xs = scatterData.map(p => p.x)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    return [
      { x: minX, trendY: reg.slope * minX + reg.intercept },
      { x: maxX, trendY: reg.slope * maxX + reg.intercept },
    ]
  }, [scatterData])

  // Stats
  const stats = useMemo(() =>
    computeStats(scatterData.map(p => p.y)),
    [scatterData]
  )

  // Limits for current component+variable
  const currentLimits = useMemo(() =>
    limits.find(l => l.componentType === selectedComponentType && l.variable === selectedVariable) ?? null,
    [limits, selectedComponentType, selectedVariable]
  )

  // Severity counts
  const severityCounts = useMemo(() => ({
    normal: scatterData.filter(p => p.status === 'normal').length,
    caution: scatterData.filter(p => p.status === 'caution').length,
    critical: scatterData.filter(p => p.status === 'critical' || p.status === 'condemned').length,
  }), [scatterData])

  // Handle point click
  function handlePointClick(data: any) {
    if (!data?.activePayload?.[0]) return
    const point = data.activePayload[0].payload
    if (point?.assetId) {
      setHighlightedAssetId(point.assetId)
      setSelectedAssetId(point.assetId)
    }
  }

  // When component type changes, reset variable to first available
  function handleComponentChange(ct: string) {
    setSelectedComponentType(ct)
    setSelectedVariable(VARS_BY_COMPONENT[ct]?.[0]?.key ?? 'ironFe')
  }

  // Breadcrumb label
  const scopeLabel = selectedAssetId
    ? assets.find(a => a.id === selectedAssetId)?.code ?? selectedAssetId
    : selectedClientId !== 'all'
    ? clients.find(c => c.id === selectedClientId)?.name ?? selectedClientId
    : 'Toda la flota'

  return (
    <div className="space-y-5">
      {/* ── Selector bar ── */}
      <div className="chart-card p-4">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Scope */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Empresa</label>
            <select
              value={selectedClientId}
              onChange={e => { setSelectedClientId(e.target.value); setSelectedAssetId(null); setHighlightedAssetId(null) }}
              className="text-[13px] font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 outline-none"
            >
              <option value="all">Toda la flota</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Asset — only when client is selected */}
          {selectedClientId !== 'all' && (
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Equipo</label>
              <select
                value={selectedAssetId ?? ''}
                onChange={e => { setSelectedAssetId(e.target.value || null); setHighlightedAssetId(e.target.value || null) }}
                className="text-[13px] font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 outline-none"
              >
                <option value="">Todos los equipos</option>
                {filteredAssets.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
              </select>
            </div>
          )}

          {/* Component type */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Componente</label>
            <div className="flex gap-1">
              {Object.entries(COMPONENT_LABELS).map(([ct, label]) => (
                <button
                  key={ct}
                  onClick={() => handleComponentChange(ct)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                    selectedComponentType === ct
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Variable */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Variable</label>
            <select
              value={selectedVariable}
              onChange={e => setSelectedVariable(e.target.value)}
              className="text-[13px] font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 outline-none"
            >
              {varsMeta.map(v => (
                <option key={v.key} value={v.key}>{v.label} ({v.unit})</option>
              ))}
            </select>
          </div>

          {/* Clear asset filter */}
          {selectedAssetId && (
            <button
              onClick={() => { setSelectedAssetId(null); setHighlightedAssetId(null) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-semibold transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar equipo
            </button>
          )}
        </div>

        {/* Breadcrumb context */}
        <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
          <BarChart2 className="h-3.5 w-3.5" />
          <span className="font-semibold text-slate-600">{scopeLabel}</span>
          <ChevronRight className="h-3 w-3" />
          <span>{COMPONENT_LABELS[selectedComponentType]}</span>
          <ChevronRight className="h-3 w-3" />
          <span>{currentVarMeta?.label} ({currentVarMeta?.unit})</span>
          <span className="ml-2 text-slate-300">|</span>
          <span>{scatterData.length} muestras</span>
        </div>
      </div>

      {/* ── Main scatter + stats ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

        {/* Scatter chart — 3 cols */}
        <div className="xl:col-span-3 chart-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-bold text-slate-700">
                {currentVarMeta?.label} vs Horómetro — {COMPONENT_LABELS[selectedComponentType]}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Diagrama de dispersión · línea de tendencia · límites de alarma
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Normal ({severityCounts.normal})</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Precaución ({severityCounts.caution})</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Crítico ({severityCounts.critical})</span>
            </div>
          </div>

          {scatterData.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-slate-400 text-[13px]">
              Sin datos para los filtros seleccionados
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart onClick={handlePointClick} style={{ cursor: 'pointer' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={['auto', 'auto']}
                  tickFormatter={v => `${Math.round(v)}h`}
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Horómetro (h)', position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: '#94a3b8' } }}
                  height={40}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: currentVarMeta?.unit, angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 10, fill: '#94a3b8' } }}
                  width={50}
                  domain={(() => {
                    if (scatterData.length === 0) return ['auto', 'auto']
                    const vals = scatterData.map(p => p.y)
                    let lo = Math.min(...vals)
                    let hi = Math.max(...vals)
                    if (currentLimits) {
                      if (currentLimits.condemnedMax) hi = Math.max(hi, currentLimits.condemnedMax)
                      else hi = Math.max(hi, currentLimits.criticalMax)
                      if (currentLimits.condemnedMin != null) lo = Math.min(lo, currentLimits.condemnedMin)
                      else if (currentLimits.criticalMin != null) lo = Math.min(lo, currentLimits.criticalMin)
                    }
                    const pad = (hi - lo) * 0.15 || hi * 0.15 || 5
                    return [Math.max(0, lo - pad), hi + pad]
                  })()}
                />
                <Tooltip content={<ScatterTooltip />} cursor={false} />

                {/* Limit reference lines — upper bounds */}
                {currentLimits && (
                  <>
                    {/* Upper bounds */}
                    {currentLimits.normalMax < 999 && (
                      <ReferenceLine
                        y={currentLimits.normalMax}
                        stroke="#10b981" strokeDasharray="5 3" strokeWidth={1.5}
                        label={{ value: `Norm.máx ${currentLimits.normalMax}`, position: 'insideTopRight', style: { fontSize: 8, fill: '#10b981' } }}
                      />
                    )}
                    {currentLimits.cautionMax < 999 && (
                      <ReferenceLine
                        y={currentLimits.cautionMax}
                        stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
                        label={{ value: `Prec.máx ${currentLimits.cautionMax}`, position: 'insideTopRight', style: { fontSize: 8, fill: '#f59e0b' } }}
                      />
                    )}
                    {currentLimits.criticalMax < 999 && (
                      <ReferenceLine
                        y={currentLimits.criticalMax}
                        stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2}
                        label={{ value: `Crit.máx ${currentLimits.criticalMax}`, position: 'insideTopRight', style: { fontSize: 8, fill: '#ef4444' } }}
                      />
                    )}
                    {currentLimits.condemnedMax && currentLimits.condemnedMax < 999 && (
                      <ReferenceLine
                        y={currentLimits.condemnedMax}
                        stroke="#7c3aed" strokeDasharray="4 2" strokeWidth={2}
                        label={{ value: `Cond.máx ${currentLimits.condemnedMax}`, position: 'insideTopRight', style: { fontSize: 8, fill: '#7c3aed' } }}
                      />
                    )}
                    {/* Lower bounds (range variables: viscosity, TBN) */}
                    {currentLimits.normalMin != null && (
                      <ReferenceLine
                        y={currentLimits.normalMin}
                        stroke="#10b981" strokeDasharray="5 3" strokeWidth={1.5}
                        label={{ value: `Norm.mín ${currentLimits.normalMin}`, position: 'insideBottomRight', style: { fontSize: 8, fill: '#10b981' } }}
                      />
                    )}
                    {currentLimits.cautionMin != null && (
                      <ReferenceLine
                        y={currentLimits.cautionMin}
                        stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
                        label={{ value: `Prec.mín ${currentLimits.cautionMin}`, position: 'insideBottomRight', style: { fontSize: 8, fill: '#f59e0b' } }}
                      />
                    )}
                    {currentLimits.criticalMin != null && (
                      <ReferenceLine
                        y={currentLimits.criticalMin}
                        stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2}
                        label={{ value: `Crit.mín ${currentLimits.criticalMin}`, position: 'insideBottomRight', style: { fontSize: 8, fill: '#ef4444' } }}
                      />
                    )}
                    {currentLimits.condemnedMin != null && (
                      <ReferenceLine
                        y={currentLimits.condemnedMin}
                        stroke="#7c3aed" strokeDasharray="4 2" strokeWidth={2}
                        label={{ value: `Cond.mín ${currentLimits.condemnedMin}`, position: 'insideBottomRight', style: { fontSize: 8, fill: '#7c3aed' } }}
                      />
                    )}
                  </>
                )}

                {/* Trend line */}
                {trendLine.length === 2 && (
                  <Line
                    data={trendLine}
                    dataKey="trendY"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="0"
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    isAnimationActive={false}
                  />
                )}

                {/* Scatter points */}
                <Scatter
                  data={scatterData}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props
                    const isHighlighted = payload.assetId === highlightedAssetId
                    const color = STATUS_COLOR[payload.status] ?? '#10b981'
                    return (
                      <circle
                        cx={cx} cy={cy}
                        r={isHighlighted ? 7 : 4}
                        fill={color}
                        fillOpacity={isHighlighted ? 1 : 0.7}
                        stroke={isHighlighted ? '#1e293b' : color}
                        strokeWidth={isHighlighted ? 2 : 0.5}
                        style={{ transition: 'r 0.15s, opacity 0.15s', cursor: 'pointer' }}
                        onClick={() => { setHighlightedAssetId(payload.assetId); setSelectedAssetId(payload.assetId) }}
                      />
                    )
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* Trend legend */}
          {trendLine.length === 2 && stats && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-6 bg-indigo-500 rounded" />
                Tendencia lineal
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              <span>
                {trendLine[1].trendY > trendLine[0].trendY
                  ? `↑ Incremento de ${(trendLine[1].trendY - trendLine[0].trendY).toFixed(1)} ${currentVarMeta?.unit} a lo largo de la flota`
                  : `↓ Tendencia descendente de ${Math.abs(trendLine[1].trendY - trendLine[0].trendY).toFixed(1)} ${currentVarMeta?.unit}`
                }
              </span>
            </div>
          )}
        </div>

        {/* Stats panel — 1 col */}
        <div className="chart-card p-5 space-y-4">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Estadísticas</p>
          {stats ? (
            <>
              <div className="space-y-3">
                {[
                  { label: 'Muestras (N)', value: stats.n, bold: true },
                  { label: 'Promedio', value: stats.avg.toFixed(2) + ` ${currentVarMeta?.unit}` },
                  { label: 'Mediana', value: stats.median.toFixed(2) + ` ${currentVarMeta?.unit}` },
                  { label: 'Desv. estándar', value: '±' + stats.stddev.toFixed(2) },
                  { label: 'Mínimo', value: stats.min.toFixed(2) },
                  { label: 'P25', value: stats.p25.toFixed(2) },
                  { label: 'P75', value: stats.p75.toFixed(2) },
                  { label: 'Máximo', value: stats.max.toFixed(2) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">{row.label}</span>
                    <span className={`text-[12px] ${row.bold ? 'font-extrabold text-slate-800 num' : 'font-semibold text-slate-600 num'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Severity distribution mini bar */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 mb-2">DISTRIBUCIÓN</p>
                {[
                  { label: 'Normal', count: severityCounts.normal, color: '#10b981' },
                  { label: 'Precaución', count: severityCounts.caution, color: '#f59e0b' },
                  { label: 'Crítico', count: severityCounts.critical, color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="mb-2">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span style={{ color: s.color }} className="font-semibold">{s.label}</span>
                      <span className="text-slate-500">{s.count} ({Math.round(s.count / (scatterData.length || 1) * 100)}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full" style={{ width: `${s.count / (scatterData.length || 1) * 100}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Limits reference */}
              {currentLimits && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 mb-2">LÍMITES</p>
                  <div className="space-y-1.5 text-[10px]">
                    {/* Show range (min–max) or just upper bound */}
                    {[
                      { label: 'Normal',       color: '#10b981', max: currentLimits.normalMax,    min: currentLimits.normalMin    },
                      { label: 'Precaución',   color: '#f59e0b', max: currentLimits.cautionMax,   min: currentLimits.cautionMin   },
                      { label: 'Crítico',      color: '#ef4444', max: currentLimits.criticalMax,  min: currentLimits.criticalMin  },
                      { label: 'Condenatorio', color: '#7c3aed', max: currentLimits.condemnedMax, min: currentLimits.condemnedMin },
                    ].filter(r => r.max != null && r.max < 999).map(r => (
                      <div key={r.label} className="flex justify-between items-center">
                        <span style={{ color: r.color }} className="font-semibold">{r.label}</span>
                        <span className="font-bold text-slate-600">
                          {r.min != null ? `${r.min}–${r.max}` : `≤ ${r.max}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-[12px] text-slate-400">Sin datos</p>
          )}
        </div>
      </div>

      {/* ── Highlighted asset panel ── */}
      {highlightedAssetId && (
        <div className="chart-card border-l-4 border-blue-500 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="text-[13px] font-bold text-slate-700">
                Equipo seleccionado: {assets.find(a => a.id === highlightedAssetId)?.code ?? '—'}
                <span className="text-slate-400 font-normal ml-2">
                  {assets.find(a => a.id === highlightedAssetId)?.name}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/lube-analyst/${highlightedAssetId}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors"
              >
                Ver análisis completo
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => { setHighlightedAssetId(null); setSelectedAssetId(null) }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mini summary of points from this asset */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {scatterData
              .filter(p => p.assetId === highlightedAssetId)
              .map((p, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-400 mb-1">{new Date(p.sampleDate).toLocaleDateString('es-CO')}</p>
                  <p className="num text-[18px] font-extrabold" style={{ color: STATUS_COLOR[p.status] }}>
                    {p.y.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-slate-400">{currentVarMeta?.unit} · {Math.round(p.x)}h</p>
                  <span
                    className="text-[9px] font-bold capitalize px-1.5 py-0.5 rounded-full"
                    style={{ background: STATUS_COLOR[p.status] + '20', color: STATUS_COLOR[p.status] }}
                  >
                    {p.status}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ── Variable grid — all variables for current component+scope ── */}
      <div className="chart-card p-5">
        <p className="text-[13px] font-bold text-slate-700 mb-4">
          Resumen de todas las variables — {COMPONENT_LABELS[selectedComponentType]}
          <span className="text-[11px] font-normal text-slate-400 ml-2">({scopeLabel})</span>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {varsMeta.map(v => {
            const varPoints = filteredPoints
              .filter(p => (p as any)[v.key] !== null)
              .map(p => (p as any)[v.key] as number)

            if (varPoints.length === 0) return null
            const avg = varPoints.reduce((s, x) => s + x, 0) / varPoints.length
            const max = Math.max(...varPoints)
            const lim = limits.find(l => l.componentType === selectedComponentType && l.variable === v.key)
            const avgStatus = lim
              ? max >= lim.criticalMax ? 'critical'
                : avg >= lim.cautionMax ? 'caution'
                : 'normal'
              : 'normal'

            return (
              <button
                key={v.key}
                onClick={() => setSelectedVariable(v.key)}
                className={`p-3 rounded-xl border text-left transition-all hover:shadow-md ${
                  selectedVariable === v.key
                    ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">{v.label}</p>
                <p
                  className="num text-[20px] font-extrabold leading-none"
                  style={{ color: STATUS_COLOR[avgStatus] }}
                >
                  {avg.toFixed(1)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">avg · máx {max.toFixed(1)} {v.unit}</p>
                <p className="text-[10px] text-slate-300">{varPoints.length} muestras</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
