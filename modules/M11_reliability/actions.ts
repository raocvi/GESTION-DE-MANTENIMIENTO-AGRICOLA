/**
 * @file M11_reliability/actions.ts
 * @module M11_Reliability
 * @description Motor de indicadores de confiabilidad y análisis de fallas.
 *
 * Indicadores calculados:
 * - MTBF (Mean Time Between Failures): horas operadas / nº de fallas
 * - MTTR (Mean Time To Repair): suma horas de reparación / nº de reparaciones
 * - Disponibilidad: MTBF / (MTBF + MTTR)
 * - Frecuencia de falla por máquina, sistema y repuesto
 * - Estándares de reparación (horas y costo promedio) por marca, empresa y tipo
 * - Comparativos entre empresas
 *
 * Convención: una OT se considera FALLA si type='corrective'|'emergency'
 * o isFailure=true. Las horas de reparación provienen de actualHours;
 * el tiempo de parada de downtimeHours (fallback: actualHours).
 */

'use server'
import { db } from '@core/lib/db'

// ─── Tipos de salida ─────────────────────────────────────────────────────────

export interface ReliabilityKpis {
  mtbf: number          // horas
  mttr: number          // horas
  availability: number  // 0-100 %
  totalFailures: number
  totalDowntime: number // horas
  totalOperatingHours: number
  failureRate: number   // fallas por 1000 h operadas
}

export interface MachineFailureRanking {
  assetId: string
  assetName: string
  internalCode: string | null
  clientName: string
  city: string | null
  modelName: string | null
  operativeStatus: string
  currentHours: number
  failures: number
  downtime: number
  mtbf: number
  mttr: number
  totalCost: number
}

export interface SystemFailureRanking {
  system: string
  failures: number
  downtime: number
  avgRepairHours: number
  totalCost: number
}

export interface PartFailureRanking {
  partName: string
  timesUsed: number
  totalQuantity: number
  totalCost: number
  workOrders: number
}

export interface CompanyComparison {
  clientId: string
  clientName: string
  assetCount: number
  totalOrders: number
  failures: number
  mtbf: number
  mttr: number
  availability: number
  totalCost: number
  avgCostPerOrder: number
  onTimeRate: number // % OTs cerradas sin retraso
}

export interface RepairStandard {
  group: string        // marca | tipo | empresa
  orders: number
  avgRepairHours: number
  avgCost: number
  p50RepairHours: number
  p90RepairHours: number
}

// ─── Helpers internos ────────────────────────────────────────────────────────

const FAILURE_TYPES = ['corrective', 'emergency']

function isFailureOrder(o: { type: string; isFailure: boolean }) {
  return o.isFailure || FAILURE_TYPES.includes(o.type)
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  return sorted[idx]
}

function round1(n: number) { return Math.round(n * 10) / 10 }

// ─── Datos crudos compartidos ────────────────────────────────────────────────

/**
 * Carga el dataset base para todos los cálculos: OTs cerradas con activo,
 * cliente, modelo, marca y repuestos. Filtro opcional por cliente (multi-empresa).
 */
async function loadClosedOrders(clientId?: string) {
  return db.workOrder.findMany({
    where: {
      status: 'closed',
      ...(clientId ? { clientId } : {}),
    },
    select: {
      id: true, type: true, isFailure: true, status: true,
      actualHours: true, downtimeHours: true, totalCost: true,
      componentAffected: true, failureMode: true, partCausingFailure: true,
      scheduledDate: true, dueDate: true, closedAt: true, createdAt: true,
      clientId: true, assetId: true,
      client: { select: { id: true, name: true } },
      asset: {
        select: {
          id: true, name: true, internalCode: true, currentHours: true,
          operativeStatus: true,
          client: { select: { name: true, city: true } },
          model: { select: { name: true, brand: { select: { name: true } }, category: { select: { name: true } } } },
        },
      },
      partsUsed: { select: { partName: true, quantity: true, totalCost: true } },
      tasks: { select: { system: true } },
    },
  })
}

type ClosedOrder = Awaited<ReturnType<typeof loadClosedOrders>>[number]

function repairHours(o: ClosedOrder) { return o.actualHours || 0 }
function downHours(o: ClosedOrder) { return o.downtimeHours ?? o.actualHours ?? 0 }

// ─── KPIs globales ───────────────────────────────────────────────────────────

/**
 * KPIs de confiabilidad de toda la operación (o de un cliente).
 * MTBF usa la suma de horómetros actuales de los activos involucrados
 * como aproximación de horas operadas.
 */
export async function getReliabilityKpis(clientId?: string): Promise<ReliabilityKpis> {
  const orders = await loadClosedOrders(clientId)
  const failures = orders.filter(isFailureOrder)

  const assets = await db.asset.findMany({
    where: { isActive: true, ...(clientId ? { clientId } : {}) },
    select: { currentHours: true },
  })
  const totalOperatingHours = assets.reduce((s, a) => s + a.currentHours, 0)
  const totalDowntime = failures.reduce((s, o) => s + downHours(o), 0)
  const totalRepairHours = failures.reduce((s, o) => s + repairHours(o), 0)

  const mtbf = failures.length ? totalOperatingHours / failures.length : totalOperatingHours
  const mttr = failures.length ? totalRepairHours / failures.length : 0
  const availability = mtbf + mttr > 0 ? (mtbf / (mtbf + mttr)) * 100 : 100

  return {
    mtbf: round1(mtbf),
    mttr: round1(mttr),
    availability: round1(availability),
    totalFailures: failures.length,
    totalDowntime: round1(totalDowntime),
    totalOperatingHours: round1(totalOperatingHours),
    failureRate: totalOperatingHours ? round1((failures.length / totalOperatingHours) * 1000) : 0,
  }
}

// ─── Ranking de máquinas que más fallan ──────────────────────────────────────

export async function getMachineFailureRanking(limit = 15, clientId?: string): Promise<MachineFailureRanking[]> {
  const orders = await loadClosedOrders(clientId)
  const byAsset = new Map<string, ClosedOrder[]>()

  for (const o of orders) {
    if (!o.assetId || !o.asset) continue
    if (!byAsset.has(o.assetId)) byAsset.set(o.assetId, [])
    byAsset.get(o.assetId)!.push(o)
  }

  const ranking: MachineFailureRanking[] = []
  for (const [assetId, list] of byAsset) {
    const failures = list.filter(isFailureOrder)
    if (!failures.length) continue
    const a = list[0].asset!
    const totalRepair = failures.reduce((s, o) => s + repairHours(o), 0)
    ranking.push({
      assetId,
      assetName: a.name,
      internalCode: a.internalCode,
      clientName: a.client?.name || '—',
      city: a.client?.city || null,
      modelName: a.model?.name || null,
      operativeStatus: a.operativeStatus,
      currentHours: a.currentHours,
      failures: failures.length,
      downtime: round1(failures.reduce((s, o) => s + downHours(o), 0)),
      mtbf: round1(failures.length ? a.currentHours / failures.length : a.currentHours),
      mttr: round1(failures.length ? totalRepair / failures.length : 0),
      totalCost: Math.round(failures.reduce((s, o) => s + (o.totalCost || 0), 0)),
    })
  }

  return ranking.sort((x, y) => y.failures - x.failures).slice(0, limit)
}

// ─── Sistemas/componentes que más fallan ─────────────────────────────────────

export async function getSystemFailureRanking(clientId?: string): Promise<SystemFailureRanking[]> {
  const orders = await loadClosedOrders(clientId)
  const failures = orders.filter(isFailureOrder)
  const bySystem = new Map<string, { failures: number; downtime: number; repair: number; cost: number }>()

  for (const o of failures) {
    // Sistema: componentAffected > primer system de tareas > 'Sin clasificar'
    const sys = o.componentAffected || o.tasks.find(t => t.system)?.system || 'Sin clasificar'
    const e = bySystem.get(sys) || { failures: 0, downtime: 0, repair: 0, cost: 0 }
    e.failures++
    e.downtime += downHours(o)
    e.repair += repairHours(o)
    e.cost += o.totalCost || 0
    bySystem.set(sys, e)
  }

  return [...bySystem.entries()]
    .map(([system, e]) => ({
      system,
      failures: e.failures,
      downtime: round1(e.downtime),
      avgRepairHours: round1(e.failures ? e.repair / e.failures : 0),
      totalCost: Math.round(e.cost),
    }))
    .sort((a, b) => b.failures - a.failures)
}

// ─── Repuestos que más fallan / se consumen ──────────────────────────────────

export async function getPartFailureRanking(limit = 15, clientId?: string): Promise<PartFailureRanking[]> {
  const orders = await loadClosedOrders(clientId)
  const failures = orders.filter(isFailureOrder)
  const byPart = new Map<string, { times: number; qty: number; cost: number; orders: Set<string> }>()

  for (const o of failures) {
    for (const p of o.partsUsed) {
      const e = byPart.get(p.partName) || { times: 0, qty: 0, cost: 0, orders: new Set<string>() }
      e.times++
      e.qty += p.quantity
      e.cost += p.totalCost || 0
      e.orders.add(o.id)
      byPart.set(p.partName, e)
    }
    // Repuesto causante de la falla cuenta también
    if (o.partCausingFailure) {
      const e = byPart.get(o.partCausingFailure) || { times: 0, qty: 0, cost: 0, orders: new Set<string>() }
      e.times++
      e.orders.add(o.id)
      byPart.set(o.partCausingFailure, e)
    }
  }

  return [...byPart.entries()]
    .map(([partName, e]) => ({
      partName,
      timesUsed: e.times,
      totalQuantity: round1(e.qty),
      totalCost: Math.round(e.cost),
      workOrders: e.orders.size,
    }))
    .sort((a, b) => b.timesUsed - a.timesUsed)
    .slice(0, limit)
}

// ─── Comparativo entre empresas ──────────────────────────────────────────────

export async function getCompanyComparison(): Promise<CompanyComparison[]> {
  const orders = await loadClosedOrders()
  const assets = await db.asset.findMany({
    where: { isActive: true },
    select: { clientId: true, currentHours: true },
  })

  const assetsByClient = new Map<string, { count: number; hours: number }>()
  for (const a of assets) {
    const e = assetsByClient.get(a.clientId) || { count: 0, hours: 0 }
    e.count++; e.hours += a.currentHours
    assetsByClient.set(a.clientId, e)
  }

  const byClient = new Map<string, { name: string; orders: ClosedOrder[] }>()
  for (const o of orders) {
    if (!o.clientId || !o.client) continue
    if (!byClient.has(o.clientId)) byClient.set(o.clientId, { name: o.client.name, orders: [] })
    byClient.get(o.clientId)!.orders.push(o)
  }

  const result: CompanyComparison[] = []
  for (const [clientId, { name, orders: list }] of byClient) {
    const failures = list.filter(isFailureOrder)
    const aInfo = assetsByClient.get(clientId) || { count: 0, hours: 0 }
    const totalRepair = failures.reduce((s, o) => s + repairHours(o), 0)
    const mtbf = failures.length ? aInfo.hours / failures.length : aInfo.hours
    const mttr = failures.length ? totalRepair / failures.length : 0
    const onTime = list.filter(o => !o.dueDate || !o.closedAt || o.closedAt <= o.dueDate).length

    result.push({
      clientId, clientName: name,
      assetCount: aInfo.count,
      totalOrders: list.length,
      failures: failures.length,
      mtbf: round1(mtbf),
      mttr: round1(mttr),
      availability: round1(mtbf + mttr > 0 ? (mtbf / (mtbf + mttr)) * 100 : 100),
      totalCost: Math.round(list.reduce((s, o) => s + (o.totalCost || 0), 0)),
      avgCostPerOrder: Math.round(list.length ? list.reduce((s, o) => s + (o.totalCost || 0), 0) / list.length : 0),
      onTimeRate: round1(list.length ? (onTime / list.length) * 100 : 100),
    })
  }

  return result.sort((a, b) => b.totalOrders - a.totalOrders)
}

// ─── Estándares de reparación ────────────────────────────────────────────────

/**
 * Estándares de reparación: horas y costo promedio + percentiles P50/P90,
 * agrupados por 'brand' (marca), 'category' (tipo de equipo) o 'client' (empresa).
 */
export async function getRepairStandards(groupBy: 'brand' | 'category' | 'client'): Promise<RepairStandard[]> {
  const orders = await loadClosedOrders()
  const groups = new Map<string, { hours: number[]; costs: number[] }>()

  for (const o of orders) {
    if (!isFailureOrder(o) || !repairHours(o)) continue
    let key = 'Sin clasificar'
    if (groupBy === 'brand') key = o.asset?.model?.brand?.name || 'Sin marca'
    if (groupBy === 'category') key = o.asset?.model?.category?.name || 'Sin tipo'
    if (groupBy === 'client') key = o.client?.name || 'Sin cliente'

    const e = groups.get(key) || { hours: [], costs: [] }
    e.hours.push(repairHours(o))
    e.costs.push(o.totalCost || 0)
    groups.set(key, e)
  }

  return [...groups.entries()]
    .map(([group, e]) => {
      const sorted = [...e.hours].sort((a, b) => a - b)
      return {
        group,
        orders: e.hours.length,
        avgRepairHours: round1(e.hours.reduce((s, h) => s + h, 0) / e.hours.length),
        avgCost: Math.round(e.costs.reduce((s, c) => s + c, 0) / e.costs.length),
        p50RepairHours: round1(percentile(sorted, 50)),
        p90RepairHours: round1(percentile(sorted, 90)),
      }
    })
    .sort((a, b) => b.orders - a.orders)
}

// ─── Mantenimientos programados (próximos) ───────────────────────────────────

export async function getUpcomingMaintenance(limit = 30, clientId?: string) {
  // ScheduledMaintenance no tiene relación Prisma con Asset (solo assetId):
  // si hay filtro de cliente, resolver primero los IDs de sus activos.
  let assetFilter: string[] | undefined
  if (clientId) {
    const clientAssets = await db.asset.findMany({ where: { clientId }, select: { id: true } })
    assetFilter = clientAssets.map(a => a.id)
    if (!assetFilter.length) return []
  }

  const items = await db.scheduledMaintenance.findMany({
    where: {
      status: { in: ['pending', 'due_soon', 'overdue'] },
      ...(assetFilter ? { assetId: { in: assetFilter } } : {}),
    },
    orderBy: { dueHours: 'asc' },
    take: limit * 4, // margen para ordenar por proximidad real
  })

  // Enriquecer con activo y proximidad
  const assetIds = [...new Set(items.map(i => i.assetId))]
  const assets = await db.asset.findMany({
    where: { id: { in: assetIds } },
    select: { id: true, name: true, internalCode: true, currentHours: true, client: { select: { name: true } } },
  })
  const assetMap = new Map(assets.map(a => [a.id, a]))

  return items
    .map(i => {
      const a = assetMap.get(i.assetId)
      const hoursRemaining = (i.dueHours || 0) - (a?.currentHours || 0)
      return {
        id: i.id, title: i.title, system: i.system, intervalLabel: i.intervalLabel,
        dueHours: i.dueHours, status: hoursRemaining < 0 ? 'overdue' : hoursRemaining < 50 ? 'due_soon' : 'pending',
        hoursRemaining: round1(hoursRemaining),
        assetName: a?.name || '—', internalCode: a?.internalCode || null,
        clientName: a?.client?.name || '—', currentHours: a?.currentHours || 0,
      }
    })
    .sort((x, y) => x.hoursRemaining - y.hoursRemaining)
    .slice(0, limit)
}
