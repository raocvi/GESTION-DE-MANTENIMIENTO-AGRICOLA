'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users, Clock, AlertTriangle, Zap,
  CalendarDays, Plus, ChevronDown, ChevronUp,
  Wrench, Battery, Calendar,
} from 'lucide-react'
import { TechnicianCalendarView } from './TechnicianCalendarView'

type WorkOrderSlim = {
  id: string; number: string; title: string; status: string; priority: string
  type: string; componentAffected: string | null
  estimatedHours: number | null; actualHours?: number | null
  scheduledDate: string | Date | null; dueDate: string | Date | null
  asset: { internalCode: string | null; name: string } | null
  client: { name: string } | null
}

type TechData = {
  id: string; name: string
  orders: WorkOrderSlim[]
  committedHours: number; availableHours: number; utilizationPct: number
}

type ShopMetrics = {
  totalCapacityHours: number; committedHours: number; availableHours: number
  utilizationPct: number; activeOrders: number; techsOverloaded: number
  hoursPerWeek: number
}

type CalendarEvent = {
  id: string; number: string; title: string; status: string; priority: string
  type: string; componentAffected: string | null; estimatedHours: number | null
  scheduledDate: string | Date | null; dueDate: string | Date | null
  assignedTo: { id: string; name: string } | null
  asset: { internalCode: string | null; name: string } | null
  client: { name: string } | null
}

interface Props {
  technicians: TechData[]
  unassigned: WorkOrderSlim[]
  shopMetrics: ShopMetrics
  calendarScheduled: CalendarEvent[]
  calendarNoDate: CalendarEvent[]
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Nueva', requested: 'Solicitada', approved: 'Aprobada',
  scheduled: 'Programada', assigned: 'Asignada', in_progress: 'En Progreso',
  paused: 'Pausada', pending_parts: 'Esp. Repuestos', pending_approval: 'Esp. Aprobación',
  pending_client: 'Esp. Cliente', reopened: 'Reabierta',
}

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-slate-100 text-slate-600',
  requested: 'bg-slate-100 text-slate-600',
  approved: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  pending_parts: 'bg-orange-100 text-orange-700',
  pending_approval: 'bg-violet-100 text-violet-700',
  pending_client: 'bg-pink-100 text-pink-700',
  reopened: 'bg-rose-100 text-rose-700',
}

const PRIORITY_COLOR: Record<string, string> = {
  low: 'bg-slate-100 text-slate-500',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-rose-100 text-rose-700',
  stopped: 'bg-red-600 text-white',
}

const PRIORITY_LABEL: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica', stopped: 'AOG',
}

function UtilBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function OTCard({ o }: { o: WorkOrderSlim }) {
  const progress = o.estimatedHours && o.actualHours
    ? Math.min(100, Math.round((o.actualHours / o.estimatedHours) * 100))
    : 0
  return (
    <Link href={`/ordenes/${o.id}`} className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs font-mono text-slate-500">{o.number}</span>
        <div className="flex gap-1 shrink-0">
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_COLOR[o.priority] ?? 'bg-slate-100 text-slate-500'}`}>
            {PRIORITY_LABEL[o.priority] ?? o.priority}
          </span>
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${STATUS_COLOR[o.status] ?? 'bg-slate-100 text-slate-500'}`}>
            {STATUS_LABEL[o.status] ?? o.status}
          </span>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2 mb-1">{o.title}</p>
      {o.asset && <p className="text-[10px] text-slate-400">{o.asset.internalCode ?? ''}{o.asset.internalCode ? ' — ' : ''}{o.asset.name}</p>}
      <div className="flex items-center gap-2 mt-1.5">
        <Clock className="h-3 w-3 text-slate-400 shrink-0" />
        <span className="text-[10px] text-slate-500">{o.estimatedHours ?? '—'} h est.</span>
        {o.estimatedHours ? (
          <>
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">{progress}%</span>
          </>
        ) : null}
      </div>
      {o.scheduledDate && (
        <div className="flex items-center gap-1 mt-1">
          <CalendarDays className="h-3 w-3 text-slate-300 shrink-0" />
          <span className="text-[10px] text-slate-400">
            {new Date(o.scheduledDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
          </span>
          {o.dueDate && (
            <span className="text-[10px] text-slate-400">
              → {new Date(o.dueDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

function TechCard({ tech }: { tech: TechData }) {
  const [expanded, setExpanded] = useState(true)
  const utilColor = tech.utilizationPct >= 90 ? 'text-rose-600' : tech.utilizationPct >= 70 ? 'text-amber-600' : 'text-emerald-600'

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
          {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-slate-900 truncate">{tech.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <UtilBar pct={tech.utilizationPct} />
            <span className={`text-xs font-bold ${utilColor} shrink-0`}>{tech.utilizationPct}%</span>
          </div>
        </div>
        <div className="text-right shrink-0 mr-1">
          <p className="text-xs text-slate-500">{tech.orders.length} OT{tech.orders.length !== 1 ? 's' : ''}</p>
          <p className="text-[10px] text-slate-400">{tech.committedHours}h / {tech.committedHours + tech.availableHours}h</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>

      {/* Capacity pills */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5">
          <Clock className="h-3 w-3 text-rose-500" />
          <span className="text-[10px] text-slate-600">{tech.committedHours}h comprometidas</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5">
          <Battery className="h-3 w-3 text-emerald-500" />
          <span className="text-[10px] text-slate-600">{tech.availableHours}h disponibles</span>
        </div>
      </div>

      {/* OT list */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {tech.orders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 italic">Sin órdenes asignadas — disponible</p>
          ) : (
            tech.orders.map(o => <OTCard key={o.id} o={o} />)
          )}
          <Link
            href={`/ordenes/nueva?technicianId=${tech.id}`}
            className="flex items-center justify-center gap-1.5 w-full mt-1 rounded-lg border border-dashed border-slate-300 py-2 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Asignar nueva OT
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── SCHEDULE TIMELINE ────────────────────────────────────────────────────────

function ScheduleTimeline({ technicians }: { technicians: TechData[] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build 14-day window
  const days: Date[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push(d)
  }

  const isSameDay = (a: Date | string, b: Date) => {
    const da = new Date(a)
    return da.getFullYear() === b.getFullYear() && da.getMonth() === b.getMonth() && da.getDate() === b.getDate()
  }

  const DAY_NAMES = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs text-slate-500 font-medium p-2 w-36 border-b border-slate-200">Técnico</th>
            {days.map((d, i) => (
              <th
                key={i}
                className={`text-center p-1 border-b border-slate-200 font-medium ${
                  d.getDay() === 0 ? 'text-rose-400' :
                  isSameDay(d, today) ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                <div className={`rounded-full w-6 h-6 mx-auto flex items-center justify-center text-[10px] ${isSameDay(d, today) ? 'bg-blue-600 text-white' : ''}`}>
                  {d.getDate()}
                </div>
                <div className="text-[9px] mt-0.5">{DAY_NAMES[d.getDay()]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {technicians.map(tech => (
            <tr key={tech.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-2 pr-3">
                <div className="font-medium text-slate-700 truncate max-w-[130px]">{tech.name.split(' ').slice(0, 2).join(' ')}</div>
                <div className={`text-[9px] font-bold ${tech.utilizationPct >= 90 ? 'text-rose-500' : tech.utilizationPct >= 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
                  {tech.utilizationPct}% ocupado
                </div>
              </td>
              {days.map((d, i) => {
                const dayOrders = tech.orders.filter(o =>
                  o.scheduledDate && isSameDay(o.scheduledDate, d)
                )
                return (
                  <td key={i} className={`p-0.5 align-top min-w-[44px] ${isSameDay(d, today) ? 'bg-blue-50' : ''}`}>
                    <div className="flex flex-col gap-0.5">
                      {dayOrders.map(o => (
                        <Link
                          key={o.id}
                          href={`/ordenes/${o.id}`}
                          title={`${o.number}: ${o.title}`}
                          className={`block rounded px-1 py-0.5 text-[9px] font-bold truncate ${
                            o.priority === 'stopped' ? 'bg-red-600 text-white' :
                            o.priority === 'critical' ? 'bg-rose-200 text-rose-800' :
                            o.priority === 'high' ? 'bg-amber-200 text-amber-800' :
                            o.status === 'in_progress' ? 'bg-emerald-200 text-emerald-800' :
                            'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {o.number.slice(-4)}
                        </Link>
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function WorkshopCapacityView({ technicians, unassigned, shopMetrics, calendarScheduled, calendarNoDate }: Props) {
  const [activeTab, setActiveTab] = useState<'cards' | 'timeline' | 'calendar'>('cards')

  const canAcceptWork = shopMetrics.availableHours > 0
  const metricColor = shopMetrics.utilizationPct >= 90 ? 'text-rose-600' : shopMetrics.utilizationPct >= 70 ? 'text-amber-600' : 'text-emerald-600'

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-slate-500">Capacidad Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{shopMetrics.totalCapacityHours}<span className="text-sm font-normal text-slate-500 ml-1">h/sem</span></p>
          <p className="text-xs text-slate-400 mt-0.5">{technicians.length} técnicos × {shopMetrics.hoursPerWeek}h</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-4 w-4 text-rose-500" />
            <span className="text-xs text-slate-500">Horas Comprometidas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{shopMetrics.committedHours}<span className="text-sm font-normal text-slate-500 ml-1">h</span></p>
          <p className="text-xs text-slate-400 mt-0.5">{shopMetrics.activeOrders} OTs activas</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-1">
            <Battery className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-500">Horas Disponibles</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{shopMetrics.availableHours}<span className="text-sm font-normal text-slate-500 ml-1">h</span></p>
          <p className={`text-xs font-medium mt-0.5 ${canAcceptWork ? 'text-emerald-600' : 'text-rose-600'}`}>
            {canAcceptWork ? '✓ Puede asumir trabajo nuevo' : '✗ Sin capacidad disponible'}
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-violet-500" />
            <span className="text-xs text-slate-500">Ocupación del Taller</span>
          </div>
          <p className={`text-2xl font-bold ${metricColor}`}>{shopMetrics.utilizationPct}<span className="text-sm font-normal text-slate-500 ml-0.5">%</span></p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${shopMetrics.utilizationPct >= 90 ? 'bg-rose-500' : shopMetrics.utilizationPct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${shopMetrics.utilizationPct}%` }}
            />
          </div>
          {shopMetrics.techsOverloaded > 0 && (
            <p className="text-[10px] text-rose-500 mt-0.5">{shopMetrics.techsOverloaded} técnico{shopMetrics.techsOverloaded > 1 ? 's' : ''} sobrecargado{shopMetrics.techsOverloaded > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Unassigned OTs banner */}
      {unassigned.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <h3 className="text-sm font-semibold text-amber-900">
              {unassigned.length} OT{unassigned.length > 1 ? 's' : ''} sin técnico asignado
            </h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unassigned.map(o => <OTCard key={o.id} o={o} />)}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 w-fit">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'cards' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users className="h-3.5 w-3.5" /> Por Técnico
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'timeline' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <CalendarDays className="h-3.5 w-3.5" /> 14 Días
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'calendar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Calendar className="h-3.5 w-3.5" /> Calendario Mensual
        </button>
      </div>

      {/* Content */}
      {activeTab === 'cards' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {technicians.map(tech => <TechCard key={tech.id} tech={tech} />)}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" /> Cronograma de los próximos 14 días
            </h3>
            <p className="text-xs text-slate-400">OTs sin fecha programada no aparecen aquí</p>
          </div>
          <ScheduleTimeline technicians={technicians} />
        </div>
      )}

      {activeTab === 'calendar' && (
        <TechnicianCalendarView scheduled={calendarScheduled} noDate={calendarNoDate} />
      )}

      {/* Footer action */}
      <div className="flex justify-end">
        <Link
          href="/ordenes/nueva"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nueva Orden de Trabajo
        </Link>
      </div>
    </div>
  )
}
