import React from 'react'
import type { Metadata } from 'next'
import { db } from '@core/lib/db'
import { InteractiveDashboard } from './_components/InteractiveDashboard'
export const metadata: Metadata = {
  title: 'Dashboard — AgroMaint Pro',
  description: 'Panel de control interactivo de mantenimiento de maquinaria agrícola IMECOL.',
}

export default async function DashboardPage() {
  const [ordersQuery, totalAssetsCount, clients] = await Promise.all([
    db.workOrder.findMany({
      include: {
        assignedTo: { select: { id: true, name: true } },
        asset: { select: { id: true, name: true, internalCode: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.asset.count(),
    db.client.findMany({ select: { id: true, name: true } }),
  ])

  const serializedOrders: any[] = ordersQuery.map(o => ({
    id: o.id,
    number: o.number,
    title: o.title,
    type: o.type,
    status: o.status,
    priority: o.priority,
    createdAt: o.createdAt.toISOString(),
    dueDate: o.dueDate ? o.dueDate.toISOString() : null,
    closedAt: o.closedAt ? o.closedAt.toISOString() : null,
    startedAt: o.startedAt ? o.startedAt.toISOString() : null,
    actualHours: o.actualHours || 0,
    laborCost: o.laborCost || 0,
    partsCost: o.partsCost || 0,
    totalCost: o.totalCost || 0,
    asset: o.asset,
    client: o.client,
    assignedTo: o.assignedTo,
  }))

  return (
    <div className="flex flex-col gap-4">
      <InteractiveDashboard 
        orders={serializedOrders} 
        totalAssetsCount={totalAssetsCount} 
        clientsList={clients} 
      />
    </div>
  )
}
