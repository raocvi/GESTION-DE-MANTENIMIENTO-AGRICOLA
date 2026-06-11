'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, ResponsiveContainer,
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
    { key: 'viscosity40',label: 'Viscosidad 100°C',     unit: 'cSt'      },
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
    { key: 'viscosity40',label: 'Viscosidad 100°C',       unit: 'cSt'  },
    { key: 'waterPct',   label: 'Agua',                  unit: '%'    },
  ],
  hydraulic: [
    { key: 'ironFe',     label: 'Hierro (Fe)',         unit: 'ppm'      },
    { key: 'copperCu',   label: 'Cobre (Cu)',           unit: 'ppm'      },
    { key: 'siliconSi',  label: 'Silicio (Si)',          unit: 'ppm'      },
    { key: 'pqIndex',    label: 'PQ Index',              unit: 'PQI'      },
    { key: 'viscosity40',label: 'Viscosidad 100°C',       unit: 'cSt'      },
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

// ─── Math helpers ───

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

function getPointColor(y: number, limit: LimitData | null): string {
  if (!limit) return '#10b981'
  // Upper-bound variables (Fe, Cu, soot, oxidation, etc.)
  if (limit.criticalMax < 999) {
    if (y > limit.criticalMax) return '#7c3aed'   // violet — supera crítico
    if (y > limit.cautionMax)  return '#ef4444'   // red    — entre precaución y crítico
    if (y > limit.normalMax)   return '#eab308'   // yellow — entre normal y precaución
    return '#10b981'                               // green  — dentro de normal
  }
  // Lower-bound variables (viscosity, TBN)
  if (limit.criticalMin != null) {
    if (y < limit.criticalMin)                        return '#7c3aed'
    if (limit.cautionMin != null && y < limit.cautionMin) return '#ef4444'
    if (y < limit.normalMax)                          return '#eab308'
    return '#10b981'
  }
  return '#10b981'
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

interface ChartPoint {
  x: number
  y: number
  assetId: string
  assetCode: string
  assetName: string
  clientId: string
  clientName: string
  status: string
  sampleDate: string
  equipmentHours: number
  ironFe: number | null
  copperCu: number | null
  aluminumAl: number | null
  chromeCr: number | null
  tinSn: number | null
  siliconSi: number | null
  leadPb: number | null
  pqIndex: number | null
  tbn: number | null
  waterPct: number | null
  viscosity40: number | null
  oxidation: number | null
  fuelPct: number | null
  soot: number | null
  glycolPpm: number | null
}

function buildChartData(points: ScatterPoint[], varKey: string): ChartPoint[] {
  return points
    .filter(p => {
      const val = (p as any)[varKey]
      return p.oilHours > 0 && val !== null && val !== undefined && isFinite(val)
    })
    .map(p => ({
      x: p.oilHours,
      y: (p as any)[varKey] as number,
      assetId: p.assetId,
      assetCode: p.assetCode,
      assetName: p.assetName,
      clientId: p.clientId,
      clientName: p.clientName,
      status: p.status,
      sampleDate: p.sampleDate,
      equipmentHours: p.equipmentHours,
      ironFe: p.ironFe,
      copperCu: p.copperCu,
      aluminumAl: p.aluminumAl,
      chromeCr: p.chromeCr,
      tinSn: p.tinSn,
      siliconSi: p.siliconSi,
      leadPb: p.leadPb,
      pqIndex: p.pqIndex,
      tbn: p.tbn,
      waterPct: p.waterPct,
      viscosity40: p.viscosity40,
      oxidation: p.oxidation,
      fuelPct: p.fuelPct,
      soot: p.soot,
      glycolPpm: p.glycolPpm,
    }))
}

function buildTrendLine(data: { x: number; y: number }[]) {
  const reg = linearRegression(data.map(p => ({ x: p.x, y: p.y })))
  if (!reg || data.length < 2) return []
  const xs = data.map(p => p.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  return [
    { x: minX, trendY: reg.slope * minX + reg.intercept },
    { x: maxX, trendY: reg.slope * maxX + reg.intercept },
  ]
}

function buildYDomain(data: ChartPoint[], limit: LimitData | null): [number, number] {
  const vals = data.map(p => p.y).filter(v => isFinite(v))
  if (vals.length === 0) return [0, 100]
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  if (limit) {
    if (limit.condemnedMax != null && limit.condemnedMax < 999) hi = Math.max(hi, limit.condemnedMax)
    else if (limit.criticalMax < 999) hi = Math.max(hi, limit.criticalMax)
    if (limit.condemnedMin != null) lo = Math.min(lo, limit.condemnedMin)
    else if (limit.criticalMin != null) lo = Math.min(lo, limit.criticalMin)
  }
  const pad = Math.max((hi - lo) * 0.12, hi * 0.05, 0.5)
  return [Math.max(0, parseFloat((lo - pad).toFixed(3))), parseFloat((hi + pad).toFixed(3))]
}

// ─── Cross-variable helpers ───

interface CrossPoint {
  x: number; y: number
  assetId: string; assetCode: string; assetName: string; clientName: string; status: string; sampleDate: string
}

function pearsonR(data: CrossPoint[]): number | null {
  const n = data.length
  if (n < 3) return null
  const mx = data.reduce((s, p) => s + p.x, 0) / n
  const my = data.reduce((s, p) => s + p.y, 0) / n
  let num = 0, dx2 = 0, dy2 = 0
  for (const p of data) {
    const dx = p.x - mx, dy = p.y - my
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? null : Math.max(-1, Math.min(1, num / denom))
}

function rLabel(r: number): { text: string; color: string } {
  const a = Math.abs(r)
  if (a >= 0.99) return { text: `Correlación ${r > 0 ? 'positiva' : 'negativa'} perfecta`, color: r > 0 ? '#059669' : '#dc2626' }
  if (a >= 0.70) return { text: `Correlación ${r > 0 ? 'positiva' : 'negativa'} fuerte`, color: r > 0 ? '#059669' : '#dc2626' }
  if (a >= 0.30) return { text: `Correlación ${r > 0 ? 'positiva' : 'negativa'} moderada`, color: r > 0 ? '#ca8a04' : '#f97316' }
  return { text: 'Sin correlación lineal', color: '#94a3b8' }
}

function buildCrossData(points: ScatterPoint[], xKey: string, yKey: string): CrossPoint[] {
  return points.filter(p => {
    const x = (p as any)[xKey]; const y = (p as any)[yKey]
    return x != null && isFinite(x) && y != null && isFinite(y)
  }).map(p => ({
    x: (p as any)[xKey] as number, y: (p as any)[yKey] as number,
    assetId: p.assetId, assetCode: p.assetCode, assetName: p.assetName,
    clientName: p.clientName, status: p.status, sampleDate: p.sampleDate,
  }))
}

// ─── Tooltip (custom — bypasses Recharts axis hit detection) ───

interface HoveredPoint {
  point: ChartPoint
  relX: number
  relY: number
  unit: string
  limit: LimitData | null
  allLimits: LimitData[]
  yVarKey: string
}

const ANOMALY_VAR_MAP: Record<string, { label: string; unit: string }> = {
  ironFe: { label: 'Hierro (Fe)', unit: 'ppm' },
  copperCu: { label: 'Cobre (Cu)', unit: 'ppm' },
  leadPb: { label: 'Plomo (Pb)', unit: 'ppm' },
  tinSn: { label: 'Estaño (Sn)', unit: 'ppm' },
  chromeCr: { label: 'Cromo (Cr)', unit: 'ppm' },
  aluminumAl: { label: 'Aluminio (Al)', unit: 'ppm' },
  siliconSi: { label: 'Silicio (Si)', unit: 'ppm' },
  viscosity40: { label: 'Viscosidad 100°C', unit: 'cSt' },
  tbn: { label: 'TBN', unit: 'mgKOH/g' },
  oxidation: { label: 'Oxidación', unit: 'abs/cm' },
}

function getAnomalies(point: ChartPoint, limit: LimitData | null, allLimits: LimitData[], yVarKey: string): Array<{ label: string; value: number; unit: string; status: 'high' | 'low' }> {
  const anomalies: Array<{ label: string; value: number; unit: string; status: 'high' | 'low' }> = []
  const pointAboveLimit = limit && (point.y > limit.cautionMax || point.y > limit.criticalMax)

  if (!pointAboveLimit) return anomalies

  const checkVars = ['siliconSi', 'viscosity40', 'ironFe', 'copperCu', 'leadPb', 'tinSn', 'chromeCr', 'aluminumAl']

  for (const varKey of checkVars) {
    const val = (point as any)[varKey]
    if (val === null || val === undefined || !isFinite(val)) continue

    const varLimitObj = allLimits.find(l => l.variable === varKey && l.componentType === limit?.componentType)
    if (!varLimitObj) continue

    const meta = ANOMALY_VAR_MAP[varKey]
    if (!meta) continue

    const isHigh = varLimitObj.criticalMax < 999 && val > varLimitObj.cautionMax
    const isLow = varLimitObj.criticalMin != null && varLimitObj.cautionMin != null && val < varLimitObj.cautionMin

    if (isHigh) anomalies.push({ label: meta.label, value: val, unit: meta.unit, status: 'high' })
    if (isLow) anomalies.push({ label: meta.label, value: val, unit: meta.unit, status: 'low' })
  }

  return anomalies
}

function ScatterTooltipCard({ hovered }: { hovered: HoveredPoint }) {
  const d = hovered.point
  const anomalies = getAnomalies(d, hovered.limit, hovered.allLimits, hovered.yVarKey)

  return (
    <div
      style={{ position: 'absolute', left: hovered.relX + 10, top: hovered.relY + 10, pointerEvents: 'none', zIndex: 50 }}
      className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-[12px] min-w-[200px]"
    >
      <p className="font-bold text-slate-700 mb-1">{d.assetCode} — {d.assetName}</p>
      <p className="text-slate-400 text-[10px] mb-2">{d.clientName}</p>
      <div className="border-b border-slate-100 pb-2 mb-2 space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Vida aceite</span>
          <span className="font-bold text-slate-700">{Math.round(d.x)}h</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Valor</span>
          <span className="font-bold" style={{ color: STATUS_COLOR[d.status] }}>{d.y?.toFixed(2)} {hovered.unit}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Estado</span>
          <span className="font-semibold capitalize" style={{ color: STATUS_COLOR[d.status] }}>{d.status}</span>
        </div>
      </div>
      {anomalies.length > 0 && (
        <div className="pt-2 space-y-1">
          <p className="text-[10px] font-bold text-slate-600">Otras anomalías:</p>
          {anomalies.map((anom, i) => (
            <div key={i} className="flex justify-between gap-2 text-[11px]">
              <span className="text-slate-600">{anom.label}:</span>
              <span className={anom.status === 'high' ? 'font-bold text-red-600' : 'font-bold text-blue-600'}>
                {anom.value.toFixed(1)} {anom.unit}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-300 mt-2">{new Date(d.sampleDate).toLocaleDateString('es-CO')}</p>
    </div>
  )
}

// ─── Reusable scatter chart with limits + trend ───

interface VariableScatterProps {
  data: ChartPoint[]
  limit: LimitData | null
  allLimits: LimitData[]
  unit: string
  height: number
  compact?: boolean
  yVarKey: string
  onPointDoubleClick?: (assetId: string) => void
}

function VariableScatterChart({ data, limit, allLimits, unit, height, compact = false, yVarKey, onPointDoubleClick }: VariableScatterProps) {
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const trendLine = useMemo(() => buildTrendLine(data), [data])
  const yDomain = useMemo(() => buildYDomain(data, limit), [data, limit])

  if (data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-slate-400 text-[12px]">
        Sin datos
      </div>
    )
  }

  const fs = compact ? 9 : 10
  const labelFs = compact ? 8 : 9

  return (
    <div className="relative" ref={containerRef}>
      {hoveredPoint && <ScatterTooltipCard hovered={hoveredPoint} />}
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart margin={{ top: 8, right: compact ? 8 : 16, bottom: compact ? 4 : 12, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="x"
          type="number"
          domain={['dataMin - 20', 'dataMax + 20']}
          tickFormatter={v => `${Math.round(v)}h`}
          tick={{ fontSize: fs }}
          height={compact ? 22 : 36}
          label={compact ? undefined : { value: 'Vida del Aceite (h)', position: 'insideBottom', offset: -6, style: { fontSize: 10, fill: '#94a3b8' } }}
        />
        <YAxis
          type="number"
          domain={yDomain}
          allowDataOverflow={true}
          tick={{ fontSize: fs }}
          width={compact ? 38 : 48}
          label={compact ? undefined : { value: unit, angle: -90, position: 'insideLeft', offset: 12, style: { fontSize: 10, fill: '#94a3b8' } }}
        />


        {/* Trend line (dashed orange like Excel) */}
        {trendLine.length === 2 && (
          <Line
            data={trendLine}
            dataKey="trendY"
            stroke="#f97316"
            strokeWidth={compact ? 2 : 3}
            dot={false}
            activeDot={false}
            legendType="none"
            isAnimationActive={false}
          />
        )}

        {/* Scatter points — dataKey="y" is REQUIRED for ComposedChart */}
        <Scatter
          data={data}
          dataKey="y"
          isAnimationActive={false}
          shape={(props: any) => {
            const { cx, cy, payload } = props
            if (!isFinite(cx) || !isFinite(cy)) return <g />
            const color = getPointColor(payload.y, limit)
            return (
              <circle
                cx={cx} cy={cy}
                r={compact ? 3.5 : 4.5}
                fill={color}
                fillOpacity={0.75}
                stroke={color}
                strokeWidth={0.5}
                style={{ cursor: onPointDoubleClick ? 'pointer' : 'default' }}
                onDoubleClick={() => onPointDoubleClick?.(payload.assetId)}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (!rect) return
                  setHoveredPoint({ point: payload, relX: e.clientX - rect.left, relY: e.clientY - rect.top, unit, limit, allLimits, yVarKey })
                }}
                onMouseMove={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (!rect) return
                  setHoveredPoint({ point: payload, relX: e.clientX - rect.left, relY: e.clientY - rect.top, unit, limit, allLimits, yVarKey })
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            )
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>

    {/* ── CSS limit lines overlay (bypasses Recharts ReferenceLine bugs) ── */}
    {limit && (() => {
      const yAxisW = compact ? 38 : 48
      const rightM = compact ? 8 : 16
      const topM = 8
      const bottomM = (compact ? 4 : 12) + (compact ? 22 : 36)
      const plotH = height - topM - bottomM
      const [lo, hi] = yDomain
      const pct = (v: number) => `${((1 - (v - lo) / (hi - lo)) * 100).toFixed(3)}%`
      const lw = compact ? '1.5px' : '2px'
      const lhw = compact ? '2px' : '2.5px'

      const lines: { value: number; color: string; label: string; w: string }[] = []
      if (limit.normalMax < 999) lines.push({ value: limit.normalMax, color: '#059669', label: `Normal ${limit.normalMax}`, w: lw })
      if (limit.cautionMax < 999) lines.push({ value: limit.cautionMax, color: '#ca8a04', label: `Precaución ${limit.cautionMax}`, w: lw })
      if (limit.criticalMax < 999) lines.push({ value: limit.criticalMax, color: '#dc2626', label: `Crítico ${limit.criticalMax}`, w: lw })
      if (limit.criticalMin != null) lines.push({ value: limit.criticalMin, color: '#dc2626', label: `Crít. mín ${limit.criticalMin}`, w: lw })
      if (limit.cautionMin != null) lines.push({ value: limit.cautionMin, color: '#ca8a04', label: `Prec. mín ${limit.cautionMin}`, w: lw })

      return (
        <div style={{ position: 'absolute', top: topM, left: yAxisW, right: rightM, height: plotH, pointerEvents: 'none', overflow: 'visible' }}>
          {lines.filter(l => l.value >= lo && l.value <= hi).map(l => (
            <div key={l.label} style={{ position: 'absolute', top: pct(l.value), left: 0, right: 0 }}>
              <div style={{ borderTop: `${l.w} dashed ${l.color}`, width: '100%' }} />
              {!compact && (
                <span style={{ position: 'absolute', right: 2, top: -13, fontSize: 9, color: l.color, fontWeight: 700, background: 'rgba(255,255,255,0.85)', padding: '0 2px', borderRadius: 2 }}>
                  {l.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )
    })()}
    </div>
  )
}

// ─── Cross-variable scatter chart ───

interface CrossVarProps {
  data: CrossPoint[]
  xLabel: string; xUnit: string
  yLabel: string; yUnit: string
  yLimit: LimitData | null
  height?: number
}

function CrossVarChart({ data, xLabel, xUnit, yLabel, yUnit, yLimit, height = 240 }: CrossVarProps) {
  const [hovered, setHovered] = useState<{ point: CrossPoint; relX: number; relY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const yVals = data.map(p => p.y)
  const xVals = data.map(p => p.x)
  let yHi = yVals.length ? Math.max(...yVals) : 100
  let yLo = yVals.length ? Math.min(...yVals) : 0
  if (yLimit?.criticalMax && yLimit.criticalMax < 999) yHi = Math.max(yHi, yLimit.criticalMax)
  const yPad = Math.max((yHi - yLo) * 0.12, yHi * 0.05, 0.5)
  const yDomain: [number, number] = [Math.max(0, yLo - yPad), yHi + yPad]

  const r = pearsonR(data)
  const corr = r !== null ? rLabel(r) : null
  const trendLine = useMemo(() => buildTrendLine(data), [data])

  if (data.length === 0) return <div style={{ height }} className="flex items-center justify-center text-slate-400 text-[12px]">Sin datos</div>

  return (
    <div className="relative" ref={containerRef}>
      {corr && (
        <div style={{ position: 'absolute', top: 6, right: 20, zIndex: 10, pointerEvents: 'none' }}
          className="flex flex-col items-end gap-0.5">
          <span style={{ fontSize: 11, fontWeight: 700, color: corr.color, background: 'rgba(255,255,255,0.9)', padding: '1px 5px', borderRadius: 4, border: `1px solid ${corr.color}33` }}>
            r = {r!.toFixed(3)}
          </span>
          <span style={{ fontSize: 9, color: corr.color, background: 'rgba(255,255,255,0.85)', padding: '0 4px', borderRadius: 3 }}>
            {corr.text}
          </span>
        </div>
      )}
      {hovered && (
        <div style={{ position: 'absolute', left: hovered.relX + 10, top: hovered.relY + 10, pointerEvents: 'none', zIndex: 50 }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-[12px] min-w-[150px]">
          <p className="font-bold text-slate-700 mb-1">{hovered.point.assetCode} — {hovered.point.assetName}</p>
          <p className="text-slate-400 text-[10px] mb-1.5">{hovered.point.clientName}</p>
          <div className="flex justify-between gap-4"><span className="text-slate-500">{xLabel}</span><span className="font-bold text-slate-700">{hovered.point.x.toFixed(2)} {xUnit}</span></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">{yLabel}</span><span className="font-bold" style={{ color: getPointColor(hovered.point.y, yLimit) }}>{hovered.point.y.toFixed(2)} {yUnit}</span></div>
          <p className="text-[10px] text-slate-300 mt-1">{new Date(hovered.point.sampleDate).toLocaleDateString('es-CO')}</p>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart margin={{ top: 8, right: 16, bottom: 12, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="x" type="number" domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={v => `${v.toFixed(0)}`} tick={{ fontSize: 9 }} height={30}
            label={{ value: `${xLabel} (${xUnit})`, position: 'insideBottom', offset: -6, style: { fontSize: 9, fill: '#94a3b8' } }}
          />
          <YAxis type="number" domain={yDomain} allowDataOverflow tick={{ fontSize: 9 }} width={42}
            label={{ value: yUnit, angle: -90, position: 'insideLeft', offset: 12, style: { fontSize: 9, fill: '#94a3b8' } }}
          />
          <Scatter data={data} dataKey="y" isAnimationActive={false}
            shape={(props: any) => {
              const { cx, cy, payload } = props
              if (!isFinite(cx) || !isFinite(cy)) return <g />
              const color = getPointColor(payload.y, yLimit)
              return (
                <circle cx={cx} cy={cy} r={4} fill={color} fillOpacity={0.75} stroke={color} strokeWidth={0.5}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => { const r = containerRef.current?.getBoundingClientRect(); if (r) setHovered({ point: payload, relX: e.clientX - r.left, relY: e.clientY - r.top }) }}
                  onMouseMove={(e) => { const r = containerRef.current?.getBoundingClientRect(); if (r) setHovered({ point: payload, relX: e.clientX - r.left, relY: e.clientY - r.top }) }}
                  onMouseLeave={() => setHovered(null)}
                />
              )
            }}
          />
          {trendLine.length === 2 && (
            <Line
              data={trendLine}
              dataKey="trendY"
              stroke="#f97316"
              strokeWidth={3}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              legendType="none"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {/* CSS limit lines for Y axis */}
      {yLimit && (() => {
        const topM = 8, bottomM = 12 + 30, yAxisW = 42, rightM = 16
        const plotH = height - topM - bottomM
        const [lo, hi] = yDomain
        const pct = (v: number) => `${((1 - (v - lo) / (hi - lo)) * 100).toFixed(2)}%`
        const lineDefs = [
          { v: yLimit.normalMax, color: '#059669', label: `${yLimit.normalMax}` },
          { v: yLimit.cautionMax, color: '#ca8a04', label: `${yLimit.cautionMax}` },
          { v: yLimit.criticalMax < 999 ? yLimit.criticalMax : null, color: '#dc2626', label: `${yLimit.criticalMax}` },
        ].filter(l => l.v != null && (l.v as number) >= lo && (l.v as number) <= hi) as { v: number; color: string; label: string }[]
        return (
          <div style={{ position: 'absolute', top: topM, left: yAxisW, right: rightM, height: plotH, pointerEvents: 'none' }}>
            {lineDefs.map(l => (
              <div key={l.v} style={{ position: 'absolute', top: pct(l.v), left: 0, right: 0 }}>
                <div style={{ borderTop: `1.5px dashed ${l.color}`, width: '100%' }} />
                <span style={{ position: 'absolute', right: 2, top: -11, fontSize: 8, color: l.color, fontWeight: 700, background: 'rgba(255,255,255,0.85)', padding: '0 2px' }}>{l.label}</span>
              </div>
            ))}
          </div>
        )
      })()}
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
  const router = useRouter()
  const [selectedClientId, setSelectedClientId] = useState<string>('all')
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectedComponentType, setSelectedComponentType] = useState('motor')
  const [selectedVariable, setSelectedVariable] = useState('ironFe')

  const handlePointDoubleClick = (assetId: string) => {
    router.push(`/lube-analyst/${assetId}?component=${selectedComponentType}`)
  }

  const varsMeta = VARS_BY_COMPONENT[selectedComponentType] ?? VARS_BY_COMPONENT.motor
  const currentVarMeta = varsMeta.find(v => v.key === selectedVariable) ?? varsMeta[0]

  // Filter assets for selector
  const filteredAssets = useMemo(() =>
    assets.filter(a => selectedClientId === 'all' || a.clientId === selectedClientId),
    [assets, selectedClientId]
  )

  // Points filtered by scope (client + asset + component) — variable filter applied per chart
  const scopedPoints = useMemo(() => {
    return points.filter(p => {
      if (p.componentType !== selectedComponentType) return false
      if (selectedClientId !== 'all' && p.clientId !== selectedClientId) return false
      if (selectedAssetId && p.assetId !== selectedAssetId) return false
      return true
    })
  }, [points, selectedComponentType, selectedClientId, selectedAssetId])

  // Main chart data for selected variable
  const scatterData = useMemo(() =>
    buildChartData(scopedPoints, selectedVariable),
    [scopedPoints, selectedVariable]
  )

  const trendLine = useMemo(() => buildTrendLine(scatterData), [scatterData])

  const stats = useMemo(() =>
    computeStats(scatterData.map(p => p.y)),
    [scatterData]
  )

  const findLimit = (varKey: string) =>
    limits.find(l => l.componentType === selectedComponentType && l.variable === varKey) ?? null

  const currentLimits = useMemo(() =>
    findLimit(selectedVariable),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limits, selectedComponentType, selectedVariable]
  )

  // Color-zone counts — 4 zones based on all limit thresholds
  const severityCounts = useMemo(() => {
    const counts = { normal: 0, caution: 0, critical: 0, condemned: 0 }
    scatterData.forEach(p => {
      const c = getPointColor(p.y, currentLimits)
      if      (c === '#10b981') counts.normal++
      else if (c === '#eab308') counts.caution++
      else if (c === '#ef4444') counts.critical++
      else if (c === '#7c3aed') counts.condemned++
    })
    return counts
  }, [scatterData, currentLimits])


  function handleComponentChange(ct: string) {
    setSelectedComponentType(ct)
    setSelectedVariable(VARS_BY_COMPONENT[ct]?.[0]?.key ?? 'ironFe')
  }

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
              onChange={e => { setSelectedClientId(e.target.value); setSelectedAssetId(null) }}
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
                onChange={e => setSelectedAssetId(e.target.value || null)}
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
              onClick={() => setSelectedAssetId(null)}
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
                {currentVarMeta?.label} vs Vida del Aceite — {COMPONENT_LABELS[selectedComponentType]}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cada punto = una muestra de un equipo · línea de tendencia · límites de alarma
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Normal ({severityCounts.normal})</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400" />Precaución ({severityCounts.caution})</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Crítico ({severityCounts.critical})</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-600" />Condenado ({severityCounts.condemned})</span>
            </div>
          </div>

          <VariableScatterChart
            data={scatterData}
            limit={currentLimits}
            allLimits={limits}
            unit={currentVarMeta?.unit ?? ''}
            height={340}
            yVarKey={selectedVariable}
            onPointDoubleClick={handlePointDoubleClick}
          />

          {/* Trend legend */}
          {trendLine.length === 2 && stats && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-6 rounded border-b-2 border-dashed border-orange-500" />
                Tendencia lineal
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
              <span>
                {trendLine[1].trendY > trendLine[0].trendY
                  ? `↑ Incremento de ${(trendLine[1].trendY - trendLine[0].trendY).toFixed(1)} ${currentVarMeta?.unit} a lo largo de la vida del aceite`
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
                  { label: 'Normal',    count: severityCounts.normal,    color: '#10b981' },
                  { label: 'Precaución',count: severityCounts.caution,   color: '#eab308' },
                  { label: 'Crítico',   count: severityCounts.critical,  color: '#ef4444' },
                  { label: 'Condenado', count: severityCounts.condemned, color: '#7c3aed' },
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
                    {[
                      { label: 'Normal',       color: '#10b981', max: currentLimits.normalMax,    min: currentLimits.normalMin    },
                      { label: 'Precaución',   color: '#f59e0b', max: currentLimits.cautionMax,   min: currentLimits.cautionMin   },
                      { label: 'Crítico',      color: '#ef4444', max: currentLimits.criticalMax,  min: currentLimits.criticalMin  },
                      { label: 'Condenatorio', color: '#7c3aed', max: currentLimits.condemnedMax, min: currentLimits.condemnedMin },
                    ].filter(r => (r.max != null && r.max < 999) || r.min != null).map(r => (
                      <div key={r.label} className="flex justify-between items-center">
                        <span style={{ color: r.color }} className="font-semibold">{r.label}</span>
                        <span className="font-bold text-slate-600">
                          {r.min != null && r.max != null && r.max < 999 ? `${r.min}–${r.max}`
                            : r.min != null ? `≥ ${r.min}`
                            : `≤ ${r.max}`}
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

{/* ── Grid: one scatter chart per variable (Excel-style small multiples) ── */}
      <div className="chart-card p-5">
        <div className="mb-4">
          <p className="text-[14px] font-bold text-slate-700">
            Consolidado por Variable — {COMPONENT_LABELS[selectedComponentType]}
            <span className="text-[11px] font-normal text-slate-400 ml-2">({scopeLabel})</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Todas las muestras de la flota por variable · límites de alarma · tendencia
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {varsMeta.map(v => {
            const data = buildChartData(scopedPoints, v.key)
            if (data.length === 0) return null
            const lim = findLimit(v.key)
            const isActive = selectedVariable === v.key
            return (
              <div
                key={v.key}
                className={`rounded-xl border p-3 transition-all cursor-pointer ${
                  isActive ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/30' : 'border-slate-100 hover:border-slate-300'
                }`}
                onClick={() => setSelectedVariable(v.key)}
              >
                <div className="flex items-center justify-between mb-1 px-1">
                  <p className="text-[12px] font-bold text-slate-700">{v.label} <span className="text-slate-400 font-normal">({v.unit})</span></p>
                  <span className="text-[10px] text-slate-400">{data.length} muestras</span>
                </div>
                <VariableScatterChart
                  data={data}
                  limit={lim}
                  allLimits={limits}
                  unit={v.unit}
                  height={200}
                  compact
                  yVarKey={v.key}
                  onPointDoubleClick={handlePointDoubleClick}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Cross-variable analysis ── */}
      <div className="chart-card p-5">
        <div className="mb-4">
          <p className="text-[14px] font-bold text-slate-700">
            Análisis Cruzado de Variables — {COMPONENT_LABELS[selectedComponentType]}
            <span className="text-[11px] font-normal text-slate-400 ml-2">({scopeLabel})</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Correlación entre variables · cada punto = una muestra
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[
            { xKey: 'siliconSi', yKey: 'ironFe',   xLabel: 'Silicio (Si)',  xUnit: 'ppm', yLabel: 'Hierro (Fe)',  yUnit: 'ppm', yLimitKey: 'ironFe'  },
            { xKey: 'siliconSi', yKey: 'copperCu',  xLabel: 'Silicio (Si)',  xUnit: 'ppm', yLabel: 'Cobre (Cu)',   yUnit: 'ppm', yLimitKey: 'copperCu' },
            { xKey: 'siliconSi', yKey: 'tinSn',     xLabel: 'Silicio (Si)',  xUnit: 'ppm', yLabel: 'Estaño (Sn)',  yUnit: 'ppm', yLimitKey: 'tinSn'   },
            { xKey: 'siliconSi', yKey: 'leadPb',    xLabel: 'Silicio (Si)',  xUnit: 'ppm', yLabel: 'Plomo (Pb)',   yUnit: 'ppm', yLimitKey: 'leadPb'  },
            { xKey: 'siliconSi', yKey: 'chromeCr',  xLabel: 'Silicio (Si)',  xUnit: 'ppm', yLabel: 'Cromo (Cr)',   yUnit: 'ppm', yLimitKey: 'chromeCr'},
            { xKey: 'oxidation', yKey: 'tbn',       xLabel: 'Oxidación',     xUnit: 'abs/cm', yLabel: 'TBN',       yUnit: 'mgKOH/g', yLimitKey: 'tbn'},
          ].map(pair => {
            const data = buildCrossData(scopedPoints, pair.xKey, pair.yKey)
            const yLim = limits.find(l => l.componentType === selectedComponentType && l.variable === pair.yLimitKey) ?? null
            return (
              <div key={`${pair.xKey}-${pair.yKey}`} className="rounded-xl border border-slate-100 p-3">
                <p className="text-[12px] font-bold text-slate-700 mb-1 px-1">
                  {pair.yLabel} <span className="text-slate-400 font-normal text-[10px]">vs</span> {pair.xLabel}
                  <span className="text-[10px] text-slate-400 font-normal ml-2">{data.length} pts</span>
                </p>
                <CrossVarChart
                  data={data}
                  xLabel={pair.xLabel} xUnit={pair.xUnit}
                  yLabel={pair.yLabel} yUnit={pair.yUnit}
                  yLimit={yLim}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
