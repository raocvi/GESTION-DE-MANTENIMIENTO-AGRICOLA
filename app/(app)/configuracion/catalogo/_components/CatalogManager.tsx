'use client'

import { useState, useTransition } from 'react'
import {
  ChevronDown, ChevronUp, Plus, Pencil, Trash2, Eye, EyeOff,
  CheckCircle, Clock, Wrench, Save, X,
} from 'lucide-react'
import {
  createServiceType, updateServiceType,
  toggleServiceType, deleteServiceType,
  toggleServiceComponent, updateServiceComponent,
  createServiceComponent,
} from '@modules/M05_catalog/actions'

type ServiceTypeRow = {
  id: string; value: string; label: string
  estimatedHours: number; type: string; isActive: boolean; order: number
}
type ComponentRow = {
  id: string; value: string; label: string; isActive: boolean; order: number
  serviceTypes: ServiceTypeRow[]
}

interface Props { catalog: ComponentRow[] }

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
const ALL_TYPES = ['preventive', 'corrective', 'inspection', 'predictive', 'lubrication']

function EditServiceTypeRow({ svc, onDone }: { svc: ServiceTypeRow; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  return (
    <form
      action={async (fd) => { startTransition(async () => { await updateServiceType(svc.id, fd); onDone() }) }}
      className="flex gap-2 items-end flex-wrap bg-blue-50 rounded-lg p-2"
    >
      <div className="flex-1 min-w-40">
        <label className="text-[10px] text-slate-500 block mb-0.5">Descripción</label>
        <input name="label" defaultValue={svc.label} required
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
      </div>
      <div className="w-20">
        <label className="text-[10px] text-slate-500 block mb-0.5">Horas est.</label>
        <input name="estimatedHours" type="number" step="0.5" min="0.5" defaultValue={svc.estimatedHours}
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
      </div>
      <div className="w-32">
        <label className="text-[10px] text-slate-500 block mb-0.5">Tipo</label>
        <select name="type" defaultValue={svc.type}
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:border-blue-400">
          {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
      </div>
      <div className="flex gap-1">
        <button type="submit" disabled={pending}
          className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-[10px] text-white hover:bg-blue-700">
          <Save className="h-3 w-3" /> {pending ? '...' : 'Guardar'}
        </button>
        <button type="button" onClick={onDone}
          className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-300">
          <X className="h-3 w-3" />
        </button>
      </div>
    </form>
  )
}

function AddServiceTypeRow({ componentId, onDone }: { componentId: string; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  return (
    <form
      action={async (fd) => { startTransition(async () => { await createServiceType(componentId, fd); onDone() }) }}
      className="flex gap-2 items-end flex-wrap bg-emerald-50 rounded-lg p-2 border border-emerald-200"
    >
      <div className="flex-1 min-w-40">
        <label className="text-[10px] text-slate-500 block mb-0.5">Nueva descripción *</label>
        <input name="label" required placeholder="Ej: Cambio de retenes de turbo"
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
      </div>
      <div className="w-20">
        <label className="text-[10px] text-slate-500 block mb-0.5">Horas est.</label>
        <input name="estimatedHours" type="number" step="0.5" min="0.5" defaultValue={2}
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
      </div>
      <div className="w-32">
        <label className="text-[10px] text-slate-500 block mb-0.5">Tipo</label>
        <select name="type" defaultValue="corrective"
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:border-blue-400">
          {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
      </div>
      <div className="flex gap-1">
        <button type="submit" disabled={pending}
          className="flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[10px] text-white hover:bg-emerald-700">
          <Plus className="h-3 w-3" /> {pending ? '...' : 'Agregar'}
        </button>
        <button type="button" onClick={onDone}
          className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-[10px] text-slate-700 hover:bg-slate-300">
          <X className="h-3 w-3" />
        </button>
      </div>
    </form>
  )
}

function ComponentCard({ comp }: { comp: ComponentRow }) {
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [editingLabel, setEditingLabel] = useState(false)
  const [pending, startTransition] = useTransition()

  const active = comp.serviceTypes.filter(s => s.isActive)
  const inactive = comp.serviceTypes.filter(s => !s.isActive)

  return (
    <div className={`rounded-xl border overflow-hidden ${comp.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
        <button type="button" onClick={() => setExpanded(e => !e)} className="flex-1 flex items-center gap-3 text-left">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs shrink-0">
            {comp.label.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{comp.label}</p>
            <p className="text-[10px] text-slate-400">{active.length} servicio{active.length !== 1 ? 's' : ''} activo{active.length !== 1 ? 's' : ''}{inactive.length > 0 ? ` · ${inactive.length} inactivo${inactive.length !== 1 ? 's' : ''}` : ''}</p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-slate-400 ml-auto" /> : <ChevronDown className="h-4 w-4 text-slate-400 ml-auto" />}
        </button>
        <button
          onClick={() => startTransition(async () => { await toggleServiceComponent(comp.id, !comp.isActive) })}
          disabled={pending}
          title={comp.isActive ? 'Desactivar componente' : 'Activar componente'}
          className="p-1.5 rounded hover:bg-slate-200 transition-colors"
        >
          {comp.isActive ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
        </button>
      </div>

      {/* Service types list */}
      {expanded && (
        <div className="divide-y divide-slate-100">
          {comp.serviceTypes.map(svc => (
            <div key={svc.id}>
              {editingId === svc.id ? (
                <div className="px-4 py-2">
                  <EditServiceTypeRow svc={svc} onDone={() => setEditingId(null)} />
                </div>
              ) : (
                <div className={`flex items-center gap-2 px-4 py-2 ${!svc.isActive ? 'opacity-40' : 'hover:bg-slate-50'}`}>
                  <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${svc.isActive ? 'text-emerald-400' : 'text-slate-300'}`} />
                  <span className="flex-1 text-xs text-slate-700 min-w-0 truncate">{svc.label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLOR[svc.type] ?? 'bg-slate-100 text-slate-500'}`}>
                    {TYPE_LABEL[svc.type] ?? svc.type}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400 shrink-0">
                    <Clock className="h-3 w-3" />{svc.estimatedHours}h
                  </span>
                  <div className="flex gap-0.5 shrink-0">
                    <button onClick={() => setEditingId(svc.id)} title="Editar"
                      className="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => startTransition(async () => { await toggleServiceType(svc.id, !svc.isActive) })}
                      title={svc.isActive ? 'Desactivar' : 'Activar'}
                      className="p-1 rounded hover:bg-amber-100 text-slate-400 hover:text-amber-600">
                      {svc.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button onClick={() => { if (confirm('¿Eliminar este servicio?')) startTransition(async () => { await deleteServiceType(svc.id) }) }}
                      title="Eliminar"
                      className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add new service */}
          <div className="px-4 py-3">
            {addingNew ? (
              <AddServiceTypeRow componentId={comp.id} onDone={() => setAddingNew(false)} />
            ) : (
              <button onClick={() => setAddingNew(true)}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                <Plus className="h-3.5 w-3.5" /> Agregar servicio
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AddComponentForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  return (
    <form
      action={async (fd) => { startTransition(async () => { await createServiceComponent(fd); onDone() }) }}
      className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3 items-end flex-wrap"
    >
      <div className="flex-1 min-w-48">
        <label className="text-xs font-medium text-slate-600 block mb-1">Nombre del componente *</label>
        <input name="label" required placeholder="Ej: Sistema de Escape"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
      </div>
      <div className="w-48">
        <label className="text-xs font-medium text-slate-600 block mb-1">Código interno *</label>
        <input name="value" required placeholder="Ej: exhaust_system"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Save className="h-4 w-4" /> {pending ? 'Guardando...' : 'Crear componente'}
        </button>
        <button type="button" onClick={onDone}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function CatalogManager({ catalog }: Props) {
  const [addingComponent, setAddingComponent] = useState(false)

  const active   = catalog.filter(c => c.isActive)
  const inactive = catalog.filter(c => !c.isActive)
  const totalSvcs = catalog.reduce((s, c) => s + c.serviceTypes.filter(t => t.isActive).length, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="flex flex-wrap gap-4">
        <div className="kpi-card flex-1 min-w-40">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-slate-500">Componentes activos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{active.length}</p>
        </div>
        <div className="kpi-card flex-1 min-w-40">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-500">Tipos de servicio activos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalSvcs}</p>
        </div>
      </div>

      {/* Add component */}
      {addingComponent ? (
        <AddComponentForm onDone={() => setAddingComponent(false)} />
      ) : (
        <button onClick={() => setAddingComponent(true)}
          className="flex items-center gap-2 self-start rounded-lg border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
          <Plus className="h-4 w-4" /> Nuevo componente
        </button>
      )}

      {/* Active components */}
      <div className="space-y-3">
        {active.map(comp => <ComponentCard key={comp.id} comp={comp} />)}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <details className="rounded-xl border border-slate-200">
          <summary className="cursor-pointer px-4 py-3 text-sm text-slate-500 font-medium">
            {inactive.length} componente{inactive.length !== 1 ? 's' : ''} inactivo{inactive.length !== 1 ? 's' : ''}
          </summary>
          <div className="px-4 pb-4 space-y-2">
            {inactive.map(comp => <ComponentCard key={comp.id} comp={comp} />)}
          </div>
        </details>
      )}
    </div>
  )
}
