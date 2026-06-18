import type { Metadata } from 'next'
import { CalendarDays } from 'lucide-react'
import { getWorkshopCapacity, getTechnicianSchedule } from '@modules/M04_work_orders/actions'
import { WorkshopCapacityView } from './_components/WorkshopCapacityView'

export const metadata: Metadata = { title: 'Agenda del Taller — AgroMaint Pro' }

export default async function TallerPage() {
  const [{ technicians, unassigned, shopMetrics }, { scheduled, noDate }] = await Promise.all([
    getWorkshopCapacity(),
    getTechnicianSchedule(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda del Taller</h1>
        </div>
        <p className="text-sm text-slate-500 ml-13">
          Disponibilidad en tiempo real · {technicians.length} técnicos · Capacidad {shopMetrics.totalCapacityHours}h/semana
        </p>
      </div>

      <WorkshopCapacityView
        technicians={technicians}
        unassigned={unassigned}
        shopMetrics={shopMetrics}
        calendarScheduled={scheduled}
        calendarNoDate={noDate}
      />
    </div>
  )
}
