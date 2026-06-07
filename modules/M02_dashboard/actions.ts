'use server'
import { db } from '@core/lib/db'

export async function getDashboardData() {
  const [
    totalAssets,
    operativeAssets,
    maintenanceAssets,
    activeOrders,
    pendingOrders,
    completedOrders
  ] = await Promise.all([
    db.asset.count({ where: { isActive: true } }),
    db.asset.count({ where: { isActive: true, operativeStatus: 'operative' } }),
    db.asset.count({ where: { isActive: true, operativeStatus: { in: ['maintenance', 'pending_parts', 'diagnosis'] } } }),
    db.workOrder.count({ where: { status: { in: ['in_progress', 'assigned', 'en_route'] } } }),
    db.workOrder.count({ where: { status: { in: ['new', 'requested', 'approved', 'scheduled'] } } }),
    db.workOrder.count({ where: { status: 'closed' } })
  ])

  const recentOrders = await db.workOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { asset: { select: { internalCode: true } } }
  })

  return {
    assets: { total: totalAssets, operative: operativeAssets, maintenance: maintenanceAssets },
    orders: { active: activeOrders, pending: pendingOrders, completed: completedOrders },
    recentOrders
  }
}
