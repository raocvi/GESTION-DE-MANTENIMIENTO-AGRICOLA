import { notFound } from 'next/navigation'
import { db } from '@core/lib/db'
import {
  getReliabilityKpis, getMachineFailureRanking, getSystemFailureRanking, getUpcomingMaintenance,
} from '@/modules/M11_reliability/actions'
import { ManagerialReport } from './_components/ManagerialReport'

export const metadata = { title: 'Informe Gerencial' }
export const dynamic = 'force-dynamic'

/**
 * Informe Gerencial por empresa — listo para imprimir/enviar al cliente.
 * Incluye: resumen ejecutivo, KPIs de confiabilidad, estado de flota,
 * proyectos con Gantt de avance, fallas por sistema y próximos mantenimientos.
 */
export default async function InformeClientePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, city: true, department: true, contactName: true, phone: true },
  })
  if (!client) notFound()

  const [kpis, machines, systems, upcoming, assets, projects] = await Promise.all([
    getReliabilityKpis(clientId),
    getMachineFailureRanking(8, clientId),
    getSystemFailureRanking(clientId),
    getUpcomingMaintenance(12, clientId),
    db.asset.findMany({
      where: { clientId, isActive: true },
      select: {
        id: true, name: true, internalCode: true, currentHours: true,
        operativeStatus: true, criticality: true,
        model: { select: { name: true } },
      },
      orderBy: { internalCode: 'asc' },
    }),
    db.workOrder.findMany({
      where: {
        clientId, type: 'corrective', isActive: true,
        status: { notIn: ['cancelled'] },
        tasks: { some: {} },
      },
      select: {
        id: true, number: true, title: true, status: true,
        scheduledDate: true, dueDate: true,
        asset: { select: { name: true, internalCode: true } },
        tasks: {
          select: { id: true, name: true, progress: true, status: true, startDate: true, endDate: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  // Serializar fechas para el cliente
  const serializedProjects = projects.map(p => ({
    ...p,
    scheduledDate: p.scheduledDate?.toISOString() ?? null,
    dueDate: p.dueDate?.toISOString() ?? null,
    tasks: p.tasks.map(t => ({
      ...t,
      startDate: t.startDate?.toISOString() ?? null,
      endDate: t.endDate?.toISOString() ?? null,
    })),
  }))

  return (
    <ManagerialReport
      client={client}
      kpis={kpis}
      machines={machines}
      systems={systems.slice(0, 6)}
      upcoming={upcoming}
      assets={assets}
      projects={serializedProjects}
      generatedAt={new Date().toISOString()}
    />
  )
}
