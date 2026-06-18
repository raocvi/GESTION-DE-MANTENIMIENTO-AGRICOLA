'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronDown, Settings, Clock, Wrench, Info } from 'lucide-react'
import { createWorkOrder } from '@modules/M04_work_orders/actions'

// Types matching DB output
type ServiceTypeDB = {
  id: string; value: string; label: string
  estimatedHours: number; type: string
}
type ComponentDB = {
  id: string; value: string; label: string
  serviceTypes: ServiceTypeDB[]
}
type Asset = {
  id: string; internalCode: string | null; name: string
  category: { name: string } | null
}
type Client = { id: string; name: string }
type Technician = { id: string; name: string }

interface Props {
  assets: Asset[]
  clients: Client[]
  technicians: Technician[]
  catalog: ComponentDB[]
  defaultAssetId?: string
  defaultType?: string
  defaultTitle?: string
}

// Components allowed per equipment category (lowercase match)
const HARVESTER_ONLY = ['cutting_system', 'threshing_system', 'track_system']
const TRACTOR_ONLY   = ['tires']

function detectEquipmentType(categoryName: string | null | undefined): 'harvester' | 'tractor' | 'all' {
  if (!categoryName) return 'all'
  const n = categoryName.toLowerCase()
  if (n.includes('cosechadora') || n.includes('harvester') || n.includes('combine')) return 'harvester'
  if (n.includes('tractor')) return 'tractor'
  return 'all'
}

function filterComponents(catalog: ComponentDB[], equipType: 'harvester' | 'tractor' | 'all'): ComponentDB[] {
  if (equipType === 'all') return catalog
  if (equipType === 'harvester') return catalog.filter(c => !TRACTOR_ONLY.includes(c.value))
  if (equipType === 'tractor')   return catalog.filter(c => !HARVESTER_ONLY.includes(c.value))
  return catalog
}

const TYPE_COLOR: Record<string, string> = {
  preventive:  'bg-emerald-100 text-emerald-700',
  corrective:  'bg-rose-100 text-rose-700',
  inspection:  'bg-blue-100 text-blue-700',
  predictive:  'bg-violet-100 text-violet-700',
  lubrication: 'bg-amber-100 text-amber-700',
}
const TYPE_LABEL: Record<string, string> = {
  preventive: 'Preventivo', corrective: 'Correctivo',
  inspection: 'Inspección', predictive: 'Predictivo', lubrication: 'Lubricación',
}

const PRIORITY_OPTS = [
  { value: 'low', label: 'Baja' }, { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' }, { value: 'critical', label: 'Crítica' },
  { value: 'stopped', label: 'Equipo Detenido (AOG)' },
]
const OT_TYPE_OPTS = [
  { value: 'preventive', label: 'Preventivo' }, { value: 'corrective', label: 'Correctivo' },
  { value: 'predictive', label: 'Predictivo' }, { value: 'inspection', label: 'Inspección' },
  { value: 'lubrication', label: 'Lubricación' },
]

export function NewWorkOrderForm({ assets, clients, technicians, catalog, defaultAssetId, defaultType, defaultTitle }: Props) {
  const [assetId, setAssetId] = useState(defaultAssetId ?? '')
  const [component, setComponent] = useState('')
  const [serviceValue, setServiceValue] = useState('')
  const [title, setTitle] = useState(defaultTitle ?? '')
  const [otType, setOtType] = useState(defaultType ?? 'corrective')
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('')

  const lastAutoTitle = useRef('')

  const selectedAsset = assets.find(a => a.id === assetId)
  const equipType = detectEquipmentType(selectedAsset?.category?.name)
  const availableComponents = filterComponents(catalog, equipType)

  const componentEntry = availableComponents.find(c => c.value === component)
  const serviceEntry = componentEntry?.serviceTypes.find(s => s.value === serviceValue)

  // Reset component when asset changes (if current component not in filtered list)
  useEffect(() => {
    if (component && !availableComponents.find(c => c.value === component)) {
      setComponent('')
      setServiceValue('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId])

  // Auto-fill title, type, hours when service changes
  useEffect(() => {
    if (!serviceEntry || !componentEntry) return
    const generated = `${serviceEntry.label} — ${componentEntry.label}`
    if (!title || title === lastAutoTitle.current) {
      setTitle(generated)
    }
    lastAutoTitle.current = generated
    setOtType(serviceEntry.type === 'preventive' ? 'preventive'
      : serviceEntry.type === 'inspection' ? 'inspection'
      : serviceEntry.type === 'predictive' ? 'predictive'
      : serviceEntry.type === 'lubrication' ? 'lubrication'
      : 'corrective')
    setEstimatedHours(serviceEntry.estimatedHours)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceValue])

  function handleComponentChange(v: string) {
    setComponent(v)
    setServiceValue('')
  }

  const equipBadge = equipType === 'harvester' ? { label: 'Cosechadora', cls: 'bg-amber-100 text-amber-700' }
    : equipType === 'tractor' ? { label: 'Tractor', cls: 'bg-emerald-100 text-emerald-700' }
    : null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/ordenes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Órdenes de Trabajo
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nueva Orden de Trabajo</h1>
      </div>

      <form action={createWorkOrder} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="componentAffected" value={component} />
        <input type="hidden" name="estimatedHours" value={estimatedHours} />

        {/* Equipo + Cliente */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Equipo (Activo)</label>
            <select
              name="assetId"
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Seleccionar Equipo...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.internalCode ?? a.id} — {a.name}
                </option>
              ))}
            </select>
            {equipBadge && (
              <span className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${equipBadge.cls}`}>
                {equipBadge.label} · {availableComponents.length} componentes disponibles
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente / Finca</label>
            <select name="clientId" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Interno (Sin Cliente)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Componente + Tipo de Servicio */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Componente y Tipo de Servicio</span>
            {!assetId && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-500">
                <Info className="h-3 w-3" /> Seleccione un equipo para ver sus componentes
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Component selector */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Componente afectado</label>
              <div className="relative">
                <select
                  value={component}
                  onChange={e => handleComponentChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Seleccionar componente...</option>
                  {availableComponents.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Service type selector — grouped by type */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de servicio</label>
              <div className="relative">
                <select
                  value={serviceValue}
                  onChange={e => setServiceValue(e.target.value)}
                  disabled={!component}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">{component ? 'Seleccionar servicio...' : 'Primero seleccione componente'}</option>
                  {componentEntry && (() => {
                    const grouped: Record<string, ServiceTypeDB[]> = {}
                    for (const s of componentEntry.serviceTypes) {
                      if (!grouped[s.type]) grouped[s.type] = []
                      grouped[s.type].push(s)
                    }
                    return Object.entries(grouped).map(([type, svcs]) => (
                      <optgroup key={type} label={`— ${TYPE_LABEL[type] ?? type} —`}>
                        {svcs.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </optgroup>
                    ))
                  })()}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Service summary pill */}
          {serviceEntry && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white border border-blue-200 px-3 py-2">
              <Clock className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-xs text-slate-600">Tiempo estimado referencial:</span>
              <span className="text-xs font-bold text-blue-700">{serviceEntry.estimatedHours} h</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_COLOR[serviceEntry.type] ?? 'bg-slate-100 text-slate-600'}`}>
                {TYPE_LABEL[serviceEntry.type] ?? serviceEntry.type}
              </span>
            </div>
          )}
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Título de la OT *
            {serviceEntry && <span className="ml-2 text-xs text-slate-400 font-normal">(auto-generado — puede editar)</span>}
          </label>
          <input
            name="title"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Mantenimiento 500h CASE IH A9900"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Tipo OT + Prioridad */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de OT</label>
            <select name="type" value={otType} onChange={e => setOtType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              {OT_TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
            <select name="priority" defaultValue="medium"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              {PRIORITY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Técnico */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Técnico Asignado</label>
          <select name="technicianId"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">Sin Asignar</option>
            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Programada</label>
            <input name="scheduledDate" type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Límite</label>
            <input name="dueDate" type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Notas Iniciales</label>
          <textarea name="description" rows={3}
            placeholder="Detalles de la falla, síntomas reportados o tareas a ejecutar..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Wrench className="h-4 w-4" /> Generar OT
          </button>
          <Link href="/ordenes"
            className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
