'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X, Cog, RotateCw, Droplets, Gauge, Zap, Wrench,
  CheckCircle, XCircle, AlertTriangle, Clock, ClipboardList,
  Droplet, Thermometer, Activity, Plus,
} from 'lucide-react'
import { getComponentServiceHistory, getComponentFullDetail } from '@modules/M03_assets/actions'

type LubeComp = {
  id: string; componentType: string; name: string; status: string
  recommendedOil: string | null; changeIntervalHours: number | null
  lastChangeHours: number | null; lastSampleDate: Date | string | null
  oilCapacityL: number | null
}

type WorkOrder = Awaited<ReturnType<typeof getComponentServiceHistory>>[number]
type CompDetail = Awaited<ReturnType<typeof getComponentFullDetail>>

interface Props {
  component: LubeComp
  assetId: string
  assetName: string
  onClose: () => void
}

function CompIcon({ type, cls = 'h-6 w-6' }: { type: string; cls?: string }) {
  if (type === 'motor')        return <Cog className={cls} />
  if (type === 'transmission') return <RotateCw className={cls} />
  if (type === 'hydraulic')    return <Droplets className={cls} />
  if (type === 'differential') return <Zap className={cls} />
  if (type === 'final_drive')  return <Gauge className={cls} />
  return <Wrench className={cls} />
}

const COMP_LABEL: Record<string, string> = {
  motor: 'Motor', transmission: 'Transmisión', hydraulic: 'Hidráulico',
  differential: 'Diferencial', final_drive: 'Mandos Finales',
  brake_wet: 'Frenos Húmedos', reducer: 'Reductor',
}

const COMP_IMAGES: Record<string, string> = {
  a9900_motor: '/equipment-images/a9900_motor.png',
}

const STATUS_STYLE: Record<string, string> = {
  normal:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  caution:   'bg-amber-50 text-amber-700 border-amber-200',
  critical:  'bg-rose-50 text-rose-700 border-rose-200',
  condemned: 'bg-violet-50 text-violet-700 border-violet-200',
}
const STATUS_LABEL: Record<string, string> = {
  normal: 'Normal', caution: 'Precaución', critical: 'Crítico', condemned: 'Condenado',
}
const WO_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:     { label: 'Pendiente',    cls: 'bg-slate-100 text-slate-600' },
  assigned:    { label: 'Asignado',     cls: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En Progreso',  cls: 'bg-amber-100 text-amber-700' },
  completed:   { label: 'Completado',   cls: 'bg-emerald-100 text-emerald-700' },
  cancelled:   { label: 'Cancelado',    cls: 'bg-slate-100 text-slate-400' },
}

function StatusIcon({ s }: { s: string }) {
  if (s === 'normal') return <CheckCircle className="h-4 w-4 text-emerald-500" />
  if (s === 'condemned') return <XCircle className="h-4 w-4 text-violet-500" />
  if (s === 'critical') return <XCircle className="h-4 w-4 text-rose-500" />
  return <AlertTriangle className="h-4 w-4 text-amber-500" />
}

function fmt(date: Date | string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ComponentDetailModal({ component, assetId, assetName, onClose }: Props) {
  const [history, setHistory] = useState<WorkOrder[]>([])
  const [detail, setDetail] = useState<CompDetail>(null)
  const [loading, setLoading] = useState(true)

  const aName = assetName.toUpperCase()
  const assetKey = aName.includes('A9900') || aName.includes('COSECHADORA') ? 'a9900'
    : aName.includes('PUMA') ? 'puma' : null
  const imgSrc = assetKey ? (COMP_IMAGES[`${assetKey}_${component.componentType}`] ?? null) : null

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getComponentServiceHistory(assetId, component.componentType),
      getComponentFullDetail(assetId, component.id),
    ]).then(([h, d]) => {
      setHistory(h)
      setDetail(d)
      setLoading(false)
    })
  }, [assetId, component.id, component.componentType])

  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const activeOTs = history.filter(wo => ['assigned', 'in_progress'].includes(wo.status))
  const pastOTs   = history.filter(wo => !['assigned', 'in_progress'].includes(wo.status))

  const samples = (detail as any)?.samples ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CompIcon type={component.componentType} cls="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">
              {COMP_LABEL[component.componentType] ?? component.componentType}
            </h2>
            <p className="text-sm text-slate-500">{component.name}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[component.status] ?? STATUS_STYLE.normal}`}>
            <StatusIcon s={component.status} />
          </span>
          <button onClick={onClose} className="ml-2 rounded-lg p-2 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Photo + Ficha Técnica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Photo */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fotografía</p>
              {imgSrc ? (
                <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200" style={{ aspectRatio: '4/3' }}>
                  <Image src={imgSrc} alt={component.name} fill className="object-contain p-4" />
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 py-10">
                  <div className="text-slate-300"><CompIcon type={component.componentType} cls="h-10 w-10" /></div>
                  <p className="text-xs text-slate-400">Sin fotografía disponible</p>
                </div>
              )}
            </div>

            {/* Ficha Técnica */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ficha Técnica</p>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500 font-medium w-1/2">Componente</td>
                      <td className="px-4 py-2.5 text-slate-900 font-semibold">{component.name}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5"><Droplet className="h-3.5 w-3.5" /> Aceite</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-900">{component.recommendedOil ?? '—'}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500 font-medium">Capacidad</td>
                      <td className="px-4 py-2.5 text-slate-900">{component.oilCapacityL ? `${component.oilCapacityL} L` : '—'}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Intervalo cambio</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-900">{component.changeIntervalHours ? `${component.changeIntervalHours} h` : '—'}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500 font-medium">Último cambio</td>
                      <td className="px-4 py-2.5 text-slate-900">{component.lastChangeHours ? `${component.lastChangeHours} h` : '—'}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500 font-medium">Última muestra</td>
                      <td className="px-4 py-2.5 text-slate-900">{fmt(component.lastSampleDate)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-500 font-medium">Estado aceite</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[component.status] ?? STATUS_STYLE.normal}`}>
                          <StatusIcon s={component.status} />
                          {STATUS_LABEL[component.status] ?? component.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Last oil sample */}
          {samples.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" /> Última Muestra de Aceite
              </p>
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[samples[0].status] ?? STATUS_STYLE.normal}`}>
                    {STATUS_LABEL[samples[0].status] ?? samples[0].status}
                  </span>
                  <span className="text-xs text-slate-500">{fmt(samples[0].sampleDate)}</span>
                  {samples[0].equipmentHours && <span className="text-xs text-slate-400">{Math.round(samples[0].equipmentHours)} h equipo</span>}
                </div>
                {samples[0].overallDiagnosis && (
                  <p className="text-sm text-slate-600 mb-3">{samples[0].overallDiagnosis}</p>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Fe (ppm)', v: samples[0].ironFe },
                    { label: 'Cu (ppm)', v: samples[0].copperCu },
                    { label: 'Si (ppm)', v: samples[0].siliconSi },
                    { label: 'PQ Index', v: samples[0].pqIndex },
                    { label: 'TBN',      v: samples[0].tbn },
                    { label: 'Agua (%)', v: samples[0].waterPct },
                    { label: 'Vis. 40°', v: samples[0].viscosity40 },
                  ].filter(x => x.v !== null && x.v !== undefined).map(x => (
                    <div key={x.label} className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-center">
                      <p className="text-[10px] text-slate-500">{x.label}</p>
                      <p className="text-sm font-bold text-slate-800">{Number(x.v).toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active service */}
          {!loading && activeOTs.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" /> Servicio en Curso
              </p>
              <div className="space-y-2">
                {activeOTs.map(wo => (
                  <div key={wo.id} className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{wo.number}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{wo.title}</p>
                        {wo.assignedTo && <p className="text-xs text-slate-500 mt-1">Técnico: {wo.assignedTo.name}</p>}
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${WO_STATUS_LABEL[wo.status]?.cls ?? ''}`}>
                        {WO_STATUS_LABEL[wo.status]?.label ?? wo.status}
                      </span>
                    </div>
                    {wo.tasks.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {wo.tasks.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            {t.status === 'completed'
                              ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                              : <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                            <span>{t.name}</span>
                            {t.actualHours && <span className="text-slate-400 ml-auto">{t.actualHours}h</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/ordenes/${wo.id}`}
                      className="inline-block mt-3 text-xs text-blue-600 hover:underline"
                    >
                      Ver OT completa →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service history */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Historial de Servicios
              </p>
              <Link
                href={`/ordenes/nueva?assetId=${assetId}&component=${component.componentType}`}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
              >
                <Plus className="h-3.5 w-3.5" /> Registrar servicio
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-sm text-slate-400">Cargando historial...</div>
            ) : pastOTs.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400 rounded-xl border-2 border-dashed border-slate-200">
                Sin historial de servicios registrado para este componente
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {pastOTs.map(wo => {
                  const ws = WO_STATUS_LABEL[wo.status] ?? { label: wo.status, cls: 'bg-slate-100 text-slate-600' }
                  return (
                    <Link
                      key={wo.id}
                      href={`/ordenes/${wo.id}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {wo.status === 'completed'
                          ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                          : <Clock className="h-4 w-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">{wo.number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ws.cls}`}>{ws.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{wo.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {wo.assignedTo && <span className="text-[10px] text-slate-400">{wo.assignedTo.name}</span>}
                          {(wo as any).closedAt && (
                            <span className="text-[10px] text-slate-400">{fmt((wo as any).closedAt)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
