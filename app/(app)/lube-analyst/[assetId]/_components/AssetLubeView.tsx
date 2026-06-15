'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import {
  AlertTriangle, CheckCircle, XCircle, Droplets, ChevronDown, ChevronUp, Wrench,
  Cog, RotateCw, Zap, Gauge, CircleStop,
} from 'lucide-react'
import type { AssetLubeDetail } from '@/modules/M12_lube_analyst/actions'
import { ExpertReportPanel } from './ExpertReportPanel'

interface Props {
  detail: AssetLubeDetail
  expandedComponentType?: string
}

const STATUS_COLOR: Record<string, string> = {
  normal: '#10b981', caution: '#f59e0b', critical: '#ef4444', condemned: '#7c3aed',
}
function getComponentIcon(type: string, className: string = '') {
  const iconProps = { className: `h-5 w-5 ${className}` }
  const iconMap: Record<string, React.ReactNode> = {
    motor: <Cog {...iconProps} />,
    transmission: <RotateCw {...iconProps} />,
    hydraulic: <Droplets {...iconProps} />,
    differential: <Zap {...iconProps} />,
    final_drive: <Gauge {...iconProps} />,
    brake_wet: <CircleStop {...iconProps} />,
    reducer: <RotateCw {...iconProps} />,
  }
  return iconMap[type] || <Wrench {...iconProps} />
}
const COMPONENT_LABEL: Record<string, string> = {
  motor: 'Motor', transmission: 'Transmisión', hydraulic: 'Hidráulico',
  differential: 'Diferencial', final_drive: 'Mandos Finales', brake_wet: 'Frenos Húmedos', reducer: 'Reductor',
}
const VAR_LABEL: Record<string, string> = {
  ironFe: 'Hierro (Fe)', copperCu: 'Cobre (Cu)', siliconSi: 'Silicio (Si)',
  pqIndex: 'PQ Index', tbn: 'TBN', waterPct: 'Agua (%)', viscosity40: 'Viscosidad 40°C',
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'normal') return <CheckCircle className="h-5 w-5 text-emerald-500" />
  if (status === 'caution') return <AlertTriangle className="h-5 w-5 text-amber-500" />
  return <XCircle className="h-5 w-5 text-rose-500" />
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    caution: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    condemned: 'bg-violet-50 text-violet-700 border-violet-200',
  }
  const label: Record<string, string> = { normal: 'Normal', caution: 'Precaución', critical: 'Crítico', condemned: 'Condenado' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[severity] || map.normal}`}>
      {label[severity] || severity}
    </span>
  )
}

export function AssetLubeView({ detail, expandedComponentType }: Props) {
  const initialExpandedId = useMemo(() => {
    if (expandedComponentType) {
      const comp = detail.components.find(c => c.componentType === expandedComponentType)
      return comp?.id ?? (detail.components[0]?.id ?? null)
    }
    return detail.components[0]?.id ?? null
  }, [detail.components, expandedComponentType])

  const [expanded, setExpanded] = useState<string | null>(initialExpandedId)
  const [trendVar, setTrendVar] = useState<string>('ironFe')

  const TREND_VARS = ['ironFe', 'copperCu', 'siliconSi', 'pqIndex', 'tbn', 'waterPct', 'viscosity40']

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {detail.components.map(c => (
          <button
            key={c.id}
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            className={`chart-card p-3 flex flex-col gap-1 text-left transition-all ${expanded === c.id ? 'ring-2 ring-blue-400' : ''}`}
          >
            <div className="flex items-center gap-2">
              {getComponentIcon(c.componentType)}
              <StatusIcon status={c.status} />
            </div>
            <p className="text-[11px] font-bold text-slate-700">{COMPONENT_LABEL[c.componentType] || c.componentType}</p>
            <p className="text-[10px] text-slate-400 truncate">{c.name}</p>
          </button>
        ))}
      </div>

      {/* Component detail panels */}
      {detail.components.map(comp => {
        const isOpen = expanded === comp.id
        return (
          <div key={comp.id} className="chart-card overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpanded(isOpen ? null : comp.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="text-slate-600">
                {getComponentIcon(comp.componentType, 'h-6 w-6')}
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-bold text-slate-700">{COMPONENT_LABEL[comp.componentType] || comp.componentType} — {comp.name}</p>
                <p className="text-[11px] text-slate-400">
                  {comp.recommendedOil} · Cambio c/{comp.changeIntervalHours}h
                  {comp.oilCapacityL && ` · ${comp.oilCapacityL}L`}
                </p>
              </div>
              <SeverityBadge severity={comp.status} />
              {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-5 space-y-5 border-t border-slate-100">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pt-4">
                  {/* Latest results */}
                  <div>
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">Última Muestra</p>
                    {comp.latestSample ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <SeverityBadge severity={comp.latestSample.status} />
                          <span className="text-[11px] text-slate-400">
                            {new Date(comp.latestSample.sampleDate).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-600 mb-3">{comp.latestSample.overallDiagnosis}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Fe (ppm)', value: comp.latestSample.ironFe },
                            { label: 'Cu (ppm)', value: comp.latestSample.copperCu },
                            { label: 'Si (ppm)', value: comp.latestSample.siliconSi },
                            { label: 'PQ Index', value: comp.latestSample.pqIndex },
                            { label: 'TBN', value: comp.latestSample.tbn },
                            { label: 'Agua (%)', value: comp.latestSample.waterPct },
                            { label: 'Vis. 40°C', value: comp.latestSample.viscosity40 },
                          ].filter(v => v.value !== null).map(v => (
                            <div key={v.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50">
                              <span className="text-[11px] text-slate-500">{v.label}</span>
                              <span className="text-[12px] font-bold text-slate-700 num">{v.value?.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                        <ExpertReportPanel
                          sampleId={comp.latestSample!.id}
                          sampleDate={comp.latestSample!.sampleDate}
                        />
                      </div>
                    ) : (
                      <p className="text-[12px] text-slate-400">Sin muestras registradas</p>
                    )}
                  </div>

                  {/* Diagnoses */}
                  <div>
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">Diagnósticos Activos</p>
                    {comp.diagnoses.length === 0 ? (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-[12px] text-emerald-700 font-medium">Todos los parámetros dentro de límites normales</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {comp.diagnoses.map((d, i) => (
                          <div key={i} className={`p-3 rounded-xl border-l-4 ${
                            d.severity === 'critical' || d.severity === 'condemned' ? 'bg-rose-50 border-rose-400' : 'bg-amber-50 border-amber-400'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <SeverityBadge severity={d.severity} />
                              <span className="text-[11px] font-bold text-slate-600">{VAR_LABEL[d.variable] || d.variable}</span>
                              {d.requiresStop && (
                                <span className="ml-auto text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold">PARADA</span>
                              )}
                              {d.requiresOilChange && !d.requiresStop && (
                                <span className="ml-auto text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded font-bold">CAMBIO ACEITE</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mb-0.5">{d.possibleCause}</p>
                            <p className="text-[11px] text-slate-500">{d.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trend chart */}
                {comp.trend.length >= 2 && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tendencia</p>
                      <div className="flex gap-1 flex-wrap">
                        {TREND_VARS.filter(v => comp.trend.some(t => (t as any)[v] !== null)).map(v => (
                          <button
                            key={v}
                            onClick={() => setTrendVar(v)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                              trendVar === v ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500'
                            }`}
                          >
                            {VAR_LABEL[v] || v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={comp.trend} margin={{ left: 0, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="equipmentHours"
                          tick={{ fontSize: 10 }}
                          tickFormatter={v => `${Math.round(v)}h`}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          cursor={false}
                          formatter={(v: number) => [v?.toFixed(2), VAR_LABEL[trendVar] || trendVar]}
                          labelFormatter={l => `${Math.round(Number(l))}h`}
                        />
                        <Line
                          type="monotone"
                          dataKey={trendVar}
                          stroke="#0369a1"
                          strokeWidth={2}
                          dot={{ fill: '#0369a1', r: 3 }}
                          activeDot={{ r: 5 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
