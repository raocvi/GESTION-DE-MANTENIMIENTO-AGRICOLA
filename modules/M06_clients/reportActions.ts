'use server'
import { db } from '@core/lib/db'

// Standard monthly hours assumption per category
const MONTHLY_HOURS: Record<string, number> = {
  cosechadora: 480, // 16h/day × 30 days during harvest
  tractor:     208, // 8h/day × 26 working days
  default:     208,
}

function categoryHours(categoryName: string | null): number {
  if (!categoryName) return MONTHLY_HOURS.default
  const n = categoryName.toLowerCase()
  if (n.includes('cosechadora') || n.includes('harvester')) return MONTHLY_HOURS.cosechadora
  if (n.includes('tractor')) return MONTHLY_HOURS.tractor
  return MONTHLY_HOURS.default
}

export async function getClientReport(clientId: string) {
  const now = new Date()
  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  twelveMonthsAgo.setDate(1)

  const [client, assets, workOrders] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      include: { sites: true },
    }),
    db.asset.findMany({
      where: { clientId, isActive: true },
      include: {
        model: { select: { name: true } },
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { internalCode: 'asc' },
    }),
    db.workOrder.findMany({
      where: {
        clientId,
        createdAt: { gte: twelveMonthsAgo },
      },
      include: {
        asset: { select: { id: true, internalCode: true, name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!client) return null

  // ─── Monthly trend (last 12 months) ────────────────────────────────────────
  const monthlyTrend: { month: string; preventive: number; corrective: number; inspection: number; other: number; cost: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const y = d.getFullYear(); const m = d.getMonth()
    const label = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
    const monthWOs = workOrders.filter(wo => {
      const dt = new Date(wo.createdAt)
      return dt.getFullYear() === y && dt.getMonth() === m
    })
    monthlyTrend.push({
      month: label,
      preventive:  monthWOs.filter(w => w.type === 'preventive').length,
      corrective:  monthWOs.filter(w => w.type === 'corrective').length,
      inspection:  monthWOs.filter(w => w.type === 'inspection').length,
      other:       monthWOs.filter(w => !['preventive','corrective','inspection'].includes(w.type)).length,
      cost: monthWOs.reduce((s, w) => s + (w.totalCost ?? 0), 0),
    })
  }

  // ─── By type ────────────────────────────────────────────────────────────────
  const byType: Record<string, number> = {}
  for (const wo of workOrders) {
    byType[wo.type] = (byType[wo.type] ?? 0) + 1
  }

  // ─── By component ───────────────────────────────────────────────────────────
  const byComponent: Record<string, number> = {}
  for (const wo of workOrders) {
    const comp = wo.componentAffected || 'No especificado'
    byComponent[comp] = (byComponent[comp] ?? 0) + 1
  }
  const topComponents = Object.entries(byComponent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([comp, count]) => ({ comp, count }))

  // ─── Failure modes ──────────────────────────────────────────────────────────
  const byFailureMode: Record<string, number> = {}
  for (const wo of workOrders.filter(w => w.isFailure && w.failureMode)) {
    const fm = wo.failureMode!
    byFailureMode[fm] = (byFailureMode[fm] ?? 0) + 1
  }

  // ─── Per-asset metrics ──────────────────────────────────────────────────────
  const assetMetrics = assets.map(asset => {
    const assetWOs = workOrders.filter(wo => wo.asset?.id === asset.id)
    const corrective = assetWOs.filter(w => w.type === 'corrective' || w.isFailure)
    const failures = assetWOs.filter(w => w.isFailure)
    const totalDowntime = assetWOs.reduce((s, w) => s + (w.downtimeHours ?? 0), 0)
    const totalCost = assetWOs.reduce((s, w) => s + (w.totalCost ?? 0), 0)
    const monthlyH = categoryHours(asset.category?.name ?? null)
    const totalScheduledH = monthlyH * 12 // 12 months
    const availPct = totalScheduledH > 0
      ? Math.max(0, Math.round(((totalScheduledH - totalDowntime) / totalScheduledH) * 1000) / 10)
      : 100
    const mtbf = failures.length > 1
      ? Math.round((totalScheduledH - totalDowntime) / failures.length)
      : failures.length === 1 ? totalScheduledH - totalDowntime : null
    const mttr = corrective.length > 0
      ? Math.round((totalDowntime / corrective.length) * 10) / 10
      : null

    return {
      id: asset.id,
      code: asset.internalCode ?? asset.id,
      name: asset.name,
      category: asset.category?.name ?? '—',
      model: asset.model?.name ?? '—',
      currentHours: asset.currentHours ?? 0,
      operativeStatus: asset.operativeStatus,
      woCount: assetWOs.length,
      correctiveCount: corrective.length,
      failureCount: failures.length,
      totalDowntime: Math.round(totalDowntime * 10) / 10,
      totalCost: Math.round(totalCost),
      availPct,
      mtbf,
      mttr,
    }
  })

  // ─── Global KPIs ────────────────────────────────────────────────────────────
  const totalWOs = workOrders.length
  const closedWOs = workOrders.filter(w => ['closed','completed_by_tech','in_review'].includes(w.status)).length
  const preventiveCount = workOrders.filter(w => w.type === 'preventive').length
  const correctiveCount = workOrders.filter(w => w.type === 'corrective').length
  const totalDowntimeAll = workOrders.reduce((s, w) => s + (w.downtimeHours ?? 0), 0)
  const totalCostAll = workOrders.reduce((s, w) => s + (w.totalCost ?? 0), 0)
  const preventiveRatio = totalWOs > 0 ? Math.round((preventiveCount / totalWOs) * 100) : 0
  const avgAvailability = assetMetrics.length > 0
    ? Math.round(assetMetrics.reduce((s, a) => s + a.availPct, 0) / assetMetrics.length * 10) / 10
    : 100
  const totalLaborCost = workOrders.reduce((s, w) => s + (w.laborCost ?? 0), 0)
  const totalPartsCost = workOrders.reduce((s, w) => s + (w.partsCost ?? 0), 0)

  // ─── Recent WOs for Gantt (last 30 with dates) ──────────────────────────────
  const ganttWOs = workOrders
    .filter(w => w.scheduledDate || w.startedAt)
    .slice(0, 40)
    .map(w => ({
      id: w.id,
      number: w.number,
      title: w.title,
      type: w.type,
      status: w.status,
      priority: w.priority,
      assetCode: w.asset?.internalCode ?? '—',
      techName: w.assignedTo?.name ?? 'Sin asignar',
      startDate: (w.startedAt ?? w.scheduledDate)!,
      endDate: w.closedAt ?? w.dueDate ?? new Date(),
      progress: w.status === 'closed' ? 100 : w.status === 'in_progress' ? 50 : 0,
      estimatedHours: w.estimatedHours,
      actualHours: w.actualHours,
    }))

  return {
    client,
    assets,
    workOrders: workOrders.slice(0, 100),
    generatedAt: now.toISOString(),
    period: { from: twelveMonthsAgo.toISOString(), to: now.toISOString() },
    kpis: {
      totalAssets: assets.length,
      operativeAssets: assets.filter(a => a.operativeStatus === 'operative').length,
      totalWOs,
      closedWOs,
      preventiveCount,
      correctiveCount,
      preventiveRatio,
      avgAvailability,
      totalDowntimeHours: Math.round(totalDowntimeAll * 10) / 10,
      totalCost: Math.round(totalCostAll),
      totalLaborCost: Math.round(totalLaborCost),
      totalPartsCost: Math.round(totalPartsCost),
    },
    monthlyTrend,
    byType,
    topComponents,
    byFailureMode,
    assetMetrics,
    ganttWOs,
  }
}
