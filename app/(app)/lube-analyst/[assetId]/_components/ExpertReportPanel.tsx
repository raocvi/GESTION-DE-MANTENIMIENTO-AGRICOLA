'use client'

import { useState, useTransition } from 'react'
import { generateExpertReport, type StoredExpertReport } from '@/modules/M12_lube_analyst/actions'
import { PATTERN_LABELS } from '@/modules/M12_lube_analyst/expert-engine'
import {
  FlaskConical, AlertTriangle, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, Zap, Shield, TrendingUp, Target, X,
} from 'lucide-react'

interface Props {
  sampleId: string
  sampleDate: string
  existingReport?: StoredExpertReport | null
}

const STATUS_CONFIG = {
  CRITICAL: { label: 'CRÍTICO', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle, dot: 'bg-red-500' },
  CAUTION:  { label: 'PRECAUCIÓN', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle, dot: 'bg-amber-500' },
  NORMAL:   { label: 'NORMAL', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle, dot: 'bg-emerald-500' },
}

const PARAM_STATUS_COLORS = {
  caution:  { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', label: 'PRECAUCIÓN' },
  critical: { bg: 'bg-red-50',   text: 'text-red-700',   badge: 'bg-red-100 text-red-800',     label: 'CRÍTICO' },
  condemned: { bg: 'bg-violet-50', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-800', label: 'CONDENADO' },
}

const PROB_COLORS = {
  ALTA: 'bg-red-100 text-red-800',
  MEDIA: 'bg-amber-100 text-amber-800',
  POSIBLE: 'bg-blue-100 text-blue-800',
  BAJA: 'bg-slate-100 text-slate-600',
}

const RISK_COLORS = {
  'EN RIESGO': 'bg-red-100 text-red-700',
  'POSIBLEMENTE AFECTADO': 'bg-amber-100 text-amber-700',
  'MONITOREAR': 'bg-blue-100 text-blue-700',
}

export function ExpertReportPanel({ sampleId, sampleDate, existingReport }: Props) {
  const [open, setOpen] = useState(false)
  const [report, setReport] = useState<StoredExpertReport | null>(existingReport ?? null)
  const [isPending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }))

  function handleAnalyze() {
    startTransition(async () => {
      try {
        const r = await generateExpertReport(sampleId)
        setReport(r)
        setOpen(true)
      } catch (e) {
        console.error(e)
      }
    })
  }

  const cfg = report ? STATUS_CONFIG[report.generalStatus] : null
  const Icon = cfg?.icon ?? FlaskConical

  return (
    <div className="mt-2">
      <button
        onClick={() => report ? setOpen(true) : handleAnalyze()}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-60"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        {isPending ? 'Analizando...' : report ? '🔬 Ver Diagnóstico LubriCheck' : '🔬 Analizar con LubriCheck Pro'}
      </button>

      {/* Modal */}
      {open && report && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className={`rounded-t-2xl border-b ${cfg!.border} ${cfg!.bg} p-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${cfg!.dot}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">LubriCheck Pro v2.0</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${cfg!.text}`} />
                    <span className={`text-lg font-bold ${cfg!.text}`}>
                      {cfg!.label}
                    </span>
                    {report.patternsDetected.length > 0 && (
                      <div className="flex gap-1">
                        {report.patternsDetected.map(p => (
                          <span key={p} className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                            {PATTERN_LABELS[p]?.label ?? `Patrón ${p}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Muestra: {new Date(sampleDate).toLocaleDateString('es-CO')} · Generado: {new Date(report.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/60">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-4 space-y-3">

              {/* Params out of limit */}
              {report.paramsOutOfLimit.length > 0 && (
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Parámetros fuera de límite
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-[11px]">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-600">Parámetro</th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-600">Valor</th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-600">Lím. Precaución</th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-600">Lím. Crítico</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-600">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.paramsOutOfLimit.map(p => {
                          const sc = PARAM_STATUS_COLORS[p.status]
                          return (
                            <tr key={p.param} className={sc.bg}>
                              <td className="px-3 py-1.5 font-medium text-slate-700">{p.label}</td>
                              <td className={`px-3 py-1.5 text-right font-bold ${sc.text}`}>
                                {p.value.toFixed(1)} {p.unit}
                                {p.isLow ? ' ↓' : ' ↑'}
                              </td>
                              <td className="px-3 py-1.5 text-right text-slate-500">
                                {p.isLow ? `≥ ${p.cautionLimit?.toFixed(1) ?? '—'}` : `≤ ${p.cautionLimit?.toFixed(1) ?? '—'}`} {p.unit}
                              </td>
                              <td className="px-3 py-1.5 text-right text-slate-500">
                                {p.isLow ? `≥ ${p.criticalLimit?.toFixed(1) ?? '—'}` : `≤ ${p.criticalLimit?.toFixed(1) ?? '—'}`} {p.unit}
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sc.badge}`}>
                                  {sc.label}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Multivariable analysis */}
              <section className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  <Target className="h-3.5 w-3.5" />
                  Análisis multivariable
                </h3>
                <p className="text-[12px] leading-relaxed text-slate-700">{report.multivariableAnalysis}</p>
              </section>

              {/* Root causes */}
              {report.rootCauses.length > 0 && (
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Zap className="h-3.5 w-3.5 text-violet-500" />
                    Causas raíz identificadas
                  </h3>
                  <div className="space-y-2">
                    {report.rootCauses.map((rc, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                        <button
                          onClick={() => toggle(`rc-${i}`)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">{rc.code}</span>
                            <span className="text-[12px] font-semibold text-slate-700">{rc.description}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PROB_COLORS[rc.probability]}`}>
                              {rc.probability}
                            </span>
                            {expanded[`rc-${i}`] ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                          </div>
                        </button>
                        {expanded[`rc-${i}`] && (
                          <div className="border-t border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] leading-relaxed text-slate-600">{rc.mechanism}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Affected components */}
              {report.affectedComponents.length > 0 && (
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Shield className="h-3.5 w-3.5 text-rose-500" />
                    Componentes físicos afectados
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {report.affectedComponents.map((ac, i) => (
                      <div key={i} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                        <span className="text-[11px] font-medium text-slate-700">{ac.component}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${RISK_COLORS[ac.riskLevel]}`}>{ac.riskLevel}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Maintenance strategy */}
              <section>
                <button
                  onClick={() => toggle('strategy')}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
                >
                  <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    Estrategia de mantenimiento
                  </h3>
                  {expanded.strategy ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                </button>
                {expanded.strategy && (
                  <div className="mt-1 rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
                    <div className="px-3 py-2">
                      <p className="text-[10px] font-bold uppercase text-red-600 mb-1">Inmediato</p>
                      <p className="text-[11px] leading-relaxed text-slate-700">{report.immediateActions}</p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[10px] font-bold uppercase text-amber-600 mb-1">Corto plazo (0-30 días)</p>
                      <p className="text-[11px] leading-relaxed text-slate-700">{report.shortTermActions}</p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">Mediano plazo (1-3 meses)</p>
                      <p className="text-[11px] leading-relaxed text-slate-700">{report.mediumTermActions}</p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[10px] font-bold uppercase text-slate-600 mb-1">Largo plazo (&gt;3 meses)</p>
                      <p className="text-[11px] leading-relaxed text-slate-700">{report.longTermActions}</p>
                    </div>
                  </div>
                )}
              </section>

              {/* Trend */}
              {report.trendAnalysis && (
                <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                    Análisis de tendencia
                  </h3>
                  <p className="text-[11px] leading-relaxed text-slate-700">{report.trendAnalysis}</p>
                </section>
              )}

              {/* Fleet alert */}
              {report.isFleetAlert && report.fleetAlertText && (
                <section className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    ⚡ Alerta de flota
                  </h3>
                  <p className="text-[11px] leading-relaxed text-orange-900">{report.fleetAlertText}</p>
                </section>
              )}

              {/* Next analysis */}
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Próximo análisis</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">Intervalo recomendado</p>
                    <p className="text-[13px] font-bold text-slate-800">{report.nextIntervalHours}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Parámetros a vigilar</p>
                    <div className="flex flex-wrap gap-1">
                      {report.nextCriticalParams.map((p, i) => (
                        <span key={i} className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">{p}</span>
                      ))}
                    </div>
                  </div>
                  {report.additionalTests.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-500 font-medium mb-1">Pruebas adicionales sugeridas</p>
                      <div className="flex flex-wrap gap-1">
                        {report.additionalTests.map((t, i) => (
                          <span key={i} className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

            </div>

            <div className="rounded-b-2xl border-t border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between">
              <p className="text-[10px] text-slate-400">LubriCheck Pro v2.0 · Motor rule-based · Basado en Cat S·O·S, ALS Global, WearCheck, Noria</p>
              <button onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
