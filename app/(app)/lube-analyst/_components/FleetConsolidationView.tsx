'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ComposedChart, Line,
} from 'recharts'
import { getFleetConsolidation, type FleetConsolidationData, type FleetSamplePoint } from '@/modules/M12_lube_analyst/actions'
import { VAR_META } from '@/modules/M12_lube_analyst/expert-engine'
import { BarChart2, RefreshCw, Filter } from 'lucide-react'

interface Props {
  clients: { id: string; name: string }[]
}

const COMPONENT_TYPES = [
  { value: 'motor', label: 'Motor' },
  { value: 'transmission', label: 'Transmisión' },
  { value: 'hydraulic', label: 'Hidráulico' },
  { value: 'differential', label: 'Diferencial' },
  { value: 'final_drive', label: 'Mandos Finales' },
]

const VARIABLES_TO_SHOW: Array<keyof FleetSamplePoint> = [
  'ironFe', 'copperCu', 'siliconSi', 'aluminumAl', 'pqIndex',
  'tbn', 'viscosity40', 'waterPct', 'soot', 'oxidation',
]

const STATUS_DOT_COLORS: Record<string, string> = {
  normal: '#10b981',
  caution: '#f59e0b',
  critical: '#ef4444',
  condemned: '#7c3aed',
}

function linearTrend(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length < 2) return []
  const n = points.length
  const sx = points.reduce((s, p) => s + p.x, 0)
  const sy = points.reduce((s, p) => s + p.y, 0)
  const sx2 = points.reduce((s, p) => s + p.x * p.x, 0)
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0)
  const denom = n * sx2 - sx * sx
  if (denom === 0) return []
  const m = (n * sxy - sx * sy) / denom
  const b = (sy - m * sx) / n
  const minX = Math.min(...points.map(p => p.x))
  const maxX = Math.max(...points.map(p => p.x))
  return [{ x: minX, y: m * minX + b }, { x: maxX, y: m * maxX + b }]
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: Record<string, unknown> }>
  variable: string
}

function ChartTooltip({ active, payload, variable }: ChartTooltipProps) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload as unknown as FleetSamplePoint & { x: number; y: number }
  const val = d[variable as keyof FleetSamplePoint] as number | null
  const meta = VAR_META[variable]
  const statusColor = d.status ? STATUS_DOT_COLORS[d.status] : '#9ca3af'
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg text-[11px]">
      <p className="font-bold text-slate-700">{d.assetCode} — {d.assetName}</p>
      <p className="text-slate-500">{d.clientName}</p>
      <p className="text-slate-500">{d.componentName}</p>
      <div className="mt-1 border-t border-slate-100 pt-1">
        <p className="font-bold text-slate-800">{meta?.label ?? variable}: {val?.toFixed(2) ?? '—'} {meta?.unit ?? ''}</p>
        <p className="text-slate-500">{d.equipmentHours?.toFixed(0) ?? '—'} h equipo</p>
        {d.status && (
          <span
            className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: statusColor + '20', color: statusColor }}
          >{d.status.toUpperCase()}</span>
        )}
      </div>
    </div>
  )
}

function VariableChart({
  variable, samples, limits, selectedAsset,
}: {
  variable: string
  samples: FleetSamplePoint[]
  limits: FleetConsolidationData['limits']
  selectedAsset: string | null
}) {
  const meta = VAR_META[variable]
  const lim = limits[variable]

  const points = useMemo(() =>
    samples
      .filter(s => s[variable as keyof FleetSamplePoint] != null && s.equipmentHours != null)
      .map(s => ({
        ...s,
        x: s.equipmentHours ?? 0,
        y: s[variable as keyof FleetSamplePoint] as number,
        opacity: selectedAsset && s.assetId !== selectedAsset ? 0.2 : 1,
      })),
    [samples, variable, selectedAsset]
  )

  const trendPoints = useMemo(() => linearTrend(points.map(p => ({ x: p.x, y: p.y }))), [points])

  if (points.length === 0) return (
    <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
      Sin datos
    </div>
  )

  // Group by asset for coloring
  const pointsByStatus = {
    normal: points.filter(p => p.status === 'normal'),
    caution: points.filter(p => p.status === 'caution'),
    critical: points.filter(p => p.status === 'critical'),
    condemned: points.filter(p => p.status === 'condemned'),
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <ComposedChart margin={{ top: 6, right: 8, bottom: 4, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="x"
          type="number"
          domain={['auto', 'auto']}
          tick={{ fontSize: 9, fill: '#94a3b8' }}
          label={{ value: 'h', position: 'insideBottomRight', offset: 0, fontSize: 9, fill: '#94a3b8' }}
        />
        <YAxis
          dataKey="y"
          type="number"
          domain={['auto', 'auto']}
          tick={{ fontSize: 9, fill: '#94a3b8' }}
          width={36}
        />
        <Tooltip content={<ChartTooltip variable={variable} />} cursor={false} />

        {/* Reference lines */}
        {lim?.cautionMax && (
          <ReferenceLine y={lim.cautionMax} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5}>
          </ReferenceLine>
        )}
        {lim?.criticalMax && (
          <ReferenceLine y={lim.criticalMax} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5}>
          </ReferenceLine>
        )}
        {lim?.cautionMin != null && (
          <ReferenceLine y={lim.cautionMin} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} />
        )}
        {lim?.criticalMin != null && (
          <ReferenceLine y={lim.criticalMin} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5} />
        )}

        {/* Scatter by status */}
        {Object.entries(pointsByStatus).map(([status, pts]) =>
          pts.length > 0 ? (
            <Scatter
              key={status}
              data={pts}
              fill={STATUS_DOT_COLORS[status]}
              fillOpacity={0.85}
              r={4}
            />
          ) : null
        )}

        {/* Trend line */}
        {trendPoints.length === 2 && (
          <Line
            data={trendPoints}
            dataKey="y"
            type="linear"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="6 3"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function FleetConsolidationView({ clients }: Props) {
  const [clientId, setClientId] = useState<string>('')
  const [compType, setCompType] = useState('motor')
  const [data, setData] = useState<FleetConsolidationData | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function load() {
    startTransition(async () => {
      const result = await getFleetConsolidation(clientId || undefined, compType)
      setData(result)
      setSelectedAsset(null)
    })
  }

  // Unique assets for legend/filter
  const assetList = useMemo(() => {
    if (!data) return []
    const map = new Map<string, { assetId: string; assetCode: string; assetName: string }>()
    for (const s of data.samples) {
      if (!map.has(s.assetId)) map.set(s.assetId, { assetId: s.assetId, assetCode: s.assetCode, assetName: s.assetName })
    }
    return Array.from(map.values())
  }, [data])

  const displayVars = useMemo(() => {
    if (!data) return VARIABLES_TO_SHOW
    return VARIABLES_TO_SHOW.filter(v => data.samples.some(s => s[v as keyof FleetSamplePoint] != null))
  }, [data])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Empresa</label>
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 focus:border-blue-400 focus:outline-none min-w-[200px]"
          >
            <option value="">Todas las empresas</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Componente</label>
          <select
            value={compType}
            onChange={e => setCompType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 focus:border-blue-400 focus:outline-none"
          >
            {COMPONENT_TYPES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={load}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[12px] font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Cargando...' : 'Consolidar'}
        </button>
      </div>

      {data && (
        <>
          {/* Summary */}
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
            <BarChart2 className="h-4 w-4 text-blue-500" />
            <span className="text-[12px] text-slate-600">
              <strong>{data.totalSamples}</strong> muestras ·{' '}
              <strong>{data.totalAssets}</strong> equipos ·{' '}
              {data.clientName ? <strong>{data.clientName}</strong> : <span>Todas las empresas</span>} ·{' '}
              {COMPONENT_TYPES.find(c => c.value === data.componentType)?.label ?? data.componentType}
            </span>

            {/* Asset filter chips */}
            <div className="ml-auto flex items-center gap-1.5 flex-wrap">
              <Filter className="h-3 w-3 text-slate-400" />
              <button
                onClick={() => setSelectedAsset(null)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors ${
                  selectedAsset === null ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                Todos
              </button>
              {assetList.map(a => (
                <button
                  key={a.assetId}
                  onClick={() => setSelectedAsset(prev => prev === a.assetId ? null : a.assetId)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors ${
                    selectedAsset === a.assetId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {a.assetCode}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            {Object.entries(STATUS_DOT_COLORS).map(([s, c]) => (
              <span key={s} className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            ))}
            <span className="flex items-center gap-1 ml-2">
              <span className="h-px w-6 bg-amber-400 border-dashed" style={{ borderTop: '2px dashed #f59e0b' }} />
              Límite precaución
            </span>
            <span className="flex items-center gap-1">
              <span className="h-px w-6" style={{ borderTop: '2px dashed #ef4444' }} />
              Límite crítico
            </span>
            <span className="flex items-center gap-1">
              <span className="h-px w-6" style={{ borderTop: '1.5px dashed #3b82f6' }} />
              Tendencia
            </span>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {displayVars.map(variable => {
              const meta = VAR_META[variable]
              const varSamples = data.samples.filter(s => s[variable as keyof FleetSamplePoint] != null)
              const hasCritical = varSamples.some(s => s.status === 'critical' || s.status === 'condemned')
              const hasCaution = varSamples.some(s => s.status === 'caution')
              return (
                <div key={variable} className={`rounded-xl border p-3 ${hasCritical ? 'border-red-200 bg-red-50/30' : hasCaution ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">{meta?.label ?? variable}</span>
                    <div className="flex items-center gap-1">
                      {hasCritical && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                      {hasCaution && !hasCritical && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                      <span className="text-[10px] text-slate-400">{meta?.unit ?? ''}</span>
                    </div>
                  </div>
                  <VariableChart
                    variable={variable}
                    samples={data.samples}
                    limits={data.limits}
                    selectedAsset={selectedAsset}
                  />
                </div>
              )
            })}
          </div>

          {displayVars.length === 0 && (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-[12px] text-slate-400">
              Sin datos de laboratorio para este componente/empresa
            </div>
          )}
        </>
      )}

      {!data && !isPending && (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200">
          <div className="text-center">
            <BarChart2 className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-[12px] text-slate-400">Selecciona empresa y componente, luego pulsa Consolidar</p>
          </div>
        </div>
      )}
    </div>
  )
}
