import React from 'react'
import type { Metadata } from 'next'
import { db } from '@core/lib/db'
import { InteractiveDashboard } from './_components/InteractiveDashboard'
export const metadata: Metadata = {
  title: 'Dashboard — AgroMaint Pro',
  description: 'Panel de control interactivo de mantenimiento de maquinaria agrícola IMECOL.',
}

export default async function DashboardPage() {
  // 1. Obtener todas las órdenes con las relaciones necesarias para filtrar en el cliente
  const ordersQuery: any[] = await db.workOrder.findMany({
    include: { 
      assignedTo: { select: { id: true, name: true } }, 
      asset: { select: { id: true, name: true, internalCode: true } },
      client: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Serializar las fechas a strings para pasarlas al Client Component sin problemas
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
    laborCost: o.laborCost || 0,
    partsCost: o.partsCost || 0,
    totalCost: o.totalCost || 0,
    asset: o.asset,
    client: o.client, // include client if available
    assignedTo: o.assignedTo,
  }))

  // Fetch all assets count and clients
  const totalAssetsCount = await db.asset.count()
  const clients = await db.client.findMany({ select: { id: true, name: true } })

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
