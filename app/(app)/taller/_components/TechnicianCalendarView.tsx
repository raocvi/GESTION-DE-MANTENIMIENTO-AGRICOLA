'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, CalendarDays,
  User, AlertCircle, Clock,
} from 'lucide-react'

type WOEvent = {
  id: string; number: string; title: string; status: string; priority: string
  type: string; componentAffected: string | null; estimatedHours: number | null
  scheduledDate: string | Date | null; dueDate: string | Date | null
  assignedTo: { id: string; name: string } | null
  asset: { internalCode: string | null; name: string } | null
  client: { name: string } | null
}

interface Props {
  scheduled: WOEvent[]
  noDate: WOEvent[]
}

// ─── Style maps ───────────────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  preventive:  { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  corrective:  { bg: 'bg-rose-50',    border: 'border-rose-300',    text: 'text-rose-800',    dot: 'bg-rose-500'    },
  inspection:  { bg: 'bg-blue-50',    border: 'border-blue-300',    text: 'text-blue-800',    dot: 'bg-blue-500'    },
  predictive:  { bg: 'bg-violet-50',  border: 'border-violet-300',  text: 'text-violet-800',  dot: 'bg-violet-500'  },
  lubrication: { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-800',   dot: 'bg-amber-500'   },
  emergency:   { bg: 'bg-red-50',     border: 'border-red-400',     text: 'text-red-900',     dot: 'bg-red-600'     },
}
const DEFAULT_TYPE_COLOR = { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700', dot: 'bg-slate-400' }

const PRIORITY_BADGE: Record<string, string> = {
  stopped:  'bg-red-600 text-white',
  critical: 'bg-rose-200 text-rose-800',
  high:     'bg-amber-100 text-amber-800',
  medium:   'bg-blue-100 text-blue-700',
  low:      'bg-slate-100 text-slate-500',
}
const TYPE_LABEL: Record<string, string> = {
  preventive: 'Prev', corrective: 'Corr', inspection: 'Insp',
  predictive: 'Pred', lubrication: 'Lub',
}
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toDateKey(d: string | Date): string {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

// Expand multi-day events: generate a key for each day from scheduledDate to dueDate
function expandEvents(events: WOEvent[]): Map<string, WOEvent[]> {
  const map = new Map<string, WOEvent[]>()
  for (const ev of events) {
    if (!ev.scheduledDate) continue
    const start = new Date(ev.scheduledDate)
    start.setHours(0, 0, 0, 0)
    const end = ev.dueDate ? new Date(ev.dueDate) : new Date(start)
    end.setHours(0, 0, 0, 0)

    const cur = new Date(start)
    while (cur <= end) {
      const key = toDateKey(cur)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
      cur.setDate(cur.getDate() + 1)
    }
  }
  return map
}

// ─── Event chip ───────────────────────────────────────────────────────────────
function EventChip({ ev, isMultiDay }: { ev: WOEvent; isMultiDay: boolean }) {
  const c = TYPE_COLOR[ev.type] ?? DEFAULT_TYPE_COLOR
  return (
    <Link
      href={`/ordenes/${ev.id}`}
      title={`${ev.number}: ${ev.title}${ev.client ? ` — ${ev.client.name}` : ''}${ev.asset ? ` | ${ev.asset.internalCode ?? ev.asset.name}` : ''}`}
      className={`group flex items-center gap-1 rounded px-1 py-0.5 border text-[9px] leading-tight font-medium truncate transition-all hover:brightness-95 hover:shadow-sm ${c.bg} ${c.border} ${c.text} ${isMultiDay ? 'rounded-none border-x-0 first:rounded-l first:border-l last:rounded-r last:border-r' : ''}`}
    >
      <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${c.dot} ${ev.priority === 'stopped' || ev.priority === 'critical' ? 'animate-pulse' : ''}`} />
      <span className="truncate">{ev.number.slice(-4)} {ev.title}</span>
      {ev.client && <span className="shrink-0 opacity-60 hidden group-hover:inline">· {ev.client.name}</span>}
    </Link>
  )
}

// ─── Month grid ───────────────────────────────────────────────────────────────
function MonthGrid({ year, month, eventsByDay, techId }: {
  year: number; month: number
  eventsByDay: Map<string, WOEvent[]>
  techId: string | 'all'
}) {
  const today = new Date()
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build grid cells: leading empty + day cells
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAY_NAMES.map(d => (
          <div key={d} className={`py-2 text-center text-[10px] font-bold uppercase tracking-wider ${d === 'Dom' ? 'text-rose-400' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="min-h-[90px] bg-slate-50/50" />

          const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const allEvents = (eventsByDay.get(dateKey) ?? [])
          const events = techId === 'all' ? allEvents : allEvents.filter(e => e.assignedTo?.id === techId)

          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
          const isSunday = (i % 7 === 0)
          const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

          return (
            <div key={i} className={`min-h-[90px] p-1 flex flex-col gap-0.5 ${isToday ? 'bg-blue-50' : isPast ? 'bg-slate-50/40' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-0.5">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                  isToday ? 'bg-blue-600 text-white' :
                  isSunday ? 'text-rose-400' :
                  isPast ? 'text-slate-300' : 'text-slate-600'
                }`}>{day}</span>
                {events.length > 0 && (
                  <span className="text-[9px] text-slate-400">{events.length} OT{events.length > 1 ? 's' : ''}</span>
                )}
              </div>
              {/* Show up to 3 events, rest collapsed */}
              {events.slice(0, 3).map(ev => (
                <EventChip
                  key={ev.id + dateKey}
                  ev={ev}
                  isMultiDay={!!(ev.dueDate && toDateKey(ev.scheduledDate!) !== toDateKey(ev.dueDate))}
                />
              ))}
              {events.length > 3 && (
                <span className="text-[9px] text-slate-400 text-center">+{events.length - 3} más</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Unscheduled sidebar ──────────────────────────────────────────────────────
function UnscheduledSidebar({ events, techId }: { events: WOEvent[]; techId: string | 'all' }) {
  const filtered = techId === 'all' ? events : events.filter(e => e.assignedTo?.id === techId)
  if (filtered.length === 0) return null
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
        <h3 className="text-sm font-semibold text-amber-900">Sin fecha programada ({filtered.length})</h3>
      </div>
      <div className="space-y-2">
        {filtered.map(ev => {
          const c = TYPE_COLOR[ev.type] ?? DEFAULT_TYPE_COLOR
          return (
            <Link key={ev.id} href={`/ordenes/${ev.id}`}
              className={`flex items-start gap-2 rounded-lg border p-2 ${c.bg} ${c.border} hover:brightness-95`}>
              <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${c.dot}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium leading-tight truncate ${c.text}`}>{ev.number} · {ev.title}</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {ev.client && <span className="text-[10px] text-slate-500">{ev.client.name}</span>}
                  {ev.asset && <span className="text-[10px] text-slate-400">{ev.asset.internalCode ?? ev.asset.name}</span>}
                  {ev.estimatedHours && (
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                      <Clock className="h-2.5 w-2.5" />{ev.estimatedHours}h
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_BADGE[ev.priority] ?? PRIORITY_BADGE.medium}`}>
                {ev.priority === 'stopped' ? 'AOG' : ev.priority}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(TYPE_LABEL).map(([type, label]) => {
        const c = TYPE_COLOR[type] ?? DEFAULT_TYPE_COLOR
        return (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${c.dot}`} />
            <span className="text-[10px] text-slate-500">{label === 'Prev' ? 'Preventivo' : label === 'Corr' ? 'Correctivo' : label === 'Insp' ? 'Inspección' : label === 'Pred' ? 'Predictivo' : 'Lubricación'}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TechnicianCalendarView({ scheduled, noDate }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [techId, setTechId] = useState<string | 'all'>('all')

  // Build tech list from events
  const technicians = useMemo(() => {
    const map = new Map<string, string>()
    for (const ev of [...scheduled, ...noDate]) {
      if (ev.assignedTo) map.set(ev.assignedTo.id, ev.assignedTo.name)
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [scheduled, noDate])

  const eventsByDay = useMemo(() => expandEvents(scheduled), [scheduled])

  // Filtered stats for current month + tech
  const monthEvents = useMemo(() => {
    const prefix = `${year}-${String(month+1).padStart(2,'0')}-`
    const days = Array.from(eventsByDay.entries()).filter(([k]) => k.startsWith(prefix))
    const flat = days.flatMap(([, evs]) => evs)
    const filtered = techId === 'all' ? flat : flat.filter(e => e.assignedTo?.id === techId)
    const unique = [...new Map(filtered.map(e => [e.id, e])).values()]
    return unique
  }, [eventsByDay, year, month, techId])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }
  function goToday() { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  const selectedTech = technicians.find(t => t.id === techId)

  return (
    <div className="flex flex-col gap-5">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Month nav */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button onClick={prevMonth}
            className="p-1.5 rounded hover:bg-slate-100 transition-colors">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <span className="px-3 text-sm font-semibold text-slate-900 min-w-[140px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth}
            className="p-1.5 rounded hover:bg-slate-100 transition-colors">
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        <button onClick={goToday}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <CalendarDays className="h-4 w-4" /> Hoy
        </button>

        {/* Technician filter */}
        <div className="flex items-center gap-2 ml-auto">
          <User className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={techId}
            onChange={e => setTechId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-w-[180px]"
          >
            <option value="all">Todos los técnicos</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Month stats */}
        {monthEvents.length > 0 && (
          <div className="flex gap-2">
            {(['preventive','corrective','inspection','predictive'] as const).map(type => {
              const count = monthEvents.filter(e => e.type === type).length
              if (!count) return null
              const c = TYPE_COLOR[type]
              return (
                <span key={type} className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                  {TYPE_LABEL[type]}: {count}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Technician header when filtered */}
      {selectedTech && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 text-blue-800 font-bold text-sm shrink-0">
            {selectedTech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-semibold text-blue-900">{selectedTech.name}</p>
            <p className="text-xs text-blue-600">
              {monthEvents.length} OT{monthEvents.length !== 1 ? 's' : ''} en {MONTH_NAMES[month]}
              {monthEvents.reduce((s, e) => s + (e.estimatedHours ?? 0), 0) > 0 && (
                <> · {monthEvents.reduce((s, e) => s + (e.estimatedHours ?? 0), 0)}h estimadas</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main layout: calendar + unscheduled */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3">
          <MonthGrid year={year} month={month} eventsByDay={eventsByDay} techId={techId} />
        </div>
        <div className="space-y-4">
          <UnscheduledSidebar events={noDate} techId={techId} />
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Referencia de colores</h4>
            <Legend />
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] text-slate-500">Punto pulsante = AOG / Crítico</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[8px] text-white font-bold">1</span>
                <span className="text-[10px] text-slate-500">Círculo azul = hoy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
