'use server'

import { db } from '@core/lib/db'

// ─── Types ───

export interface LubeKpis {
  totalComponents: number
  totalSamples: number
  normalCount: number
  cautionCount: number
  criticalCount: number
  condemnedCount: number
  normalPct: number
  cautionPct: number
  criticalPct: number
  criticalActions: number   // diagnoses with requiresStop
  openRecommendations: number // diagnoses with requiresInspection
}

export interface ComponentRisk {
  componentId: string
  componentName: string
  componentType: string
  assetId: string
  assetName: string
  assetCode: string
  clientName: string
  latestStatus: string
  latestDate: string
  criticalVars: string[]
}

export interface ClientHealth {
  clientId: string
  clientName: string
  totalComponents: number
  normalCount: number
  cautionCount: number
  criticalCount: number
  healthScore: number // 0-100
  topIssue: string
}

export interface SystemBreakdown {
  componentType: string
  label: string
  normal: number
  caution: number
  critical: number
  total: number
}

export interface TrendPoint {
  sampleDate: string
  equipmentHours: number
  ironFe: number | null
  copperCu: number | null
  siliconSi: number | null
  pqIndex: number | null
  tbn: number | null
  waterPct: number | null
  viscosity40: number | null
  status: string
}

export interface AssetLubeDetail {
  assetId: string
  assetName: string
  assetCode: string
  clientName: string
  components: {
    id: string
    componentType: string
    name: string
    status: string
    lastSampleDate: string | null
    oilCapacityL: number | null
    recommendedOil: string | null
    changeIntervalHours: number | null
    latestSample: {
      status: string
      overallDiagnosis: string | null
      recommendation: string | null
      sampleDate: string
      ironFe: number | null
      copperCu: number | null
      siliconSi: number | null
      pqIndex: number | null
      tbn: number | null
      waterPct: number | null
      viscosity40: number | null
    } | null
    trend: TrendPoint[]
    diagnoses: {
      variable: string
      severity: string
      possibleCause: string
      recommendation: string
      requiresOilChange: boolean
      requiresStop: boolean
    }[]
  }[]
}

const COMPONENT_LABELS: Record<string, string> = {
  motor: 'Motor',
  transmission: 'Transmisión',
  hydraulic: 'Hidráulico',
  differential: 'Diferencial',
  final_drive: 'Mandos Finales',
  brake_wet: 'Frenos Húmedos',
  reducer: 'Reductor',
}

// ─── Executive KPIs ───

export async function getLubeKpis(clientId?: string): Promise<LubeKpis> {
  const orgId = await getOrgId()

  // Get component IDs filtered by client if needed
  let componentFilter: { id: { in: string[] } } | Record<string, never> = {}
  if (clientId) {
    const assets = await db.asset.findMany({ where: { clientId, organizationId: orgId }, select: { id: true } })
    const assetIds = assets.map(a => a.id)
    const comps = await db.lubeComponent.findMany({ where: { assetId: { in: assetIds } }, select: { id: true } })
    componentFilter = { id: { in: comps.map(c => c.id) } }
  }

  const components = await db.lubeComponent.findMany({
    where: { organizationId: orgId, ...componentFilter },
    select: { status: true },
  })

  const samples = await db.oilSample.findMany({
    where: {
      organizationId: orgId,
      ...(clientId ? { component: { asset: { clientId } } } : {}),
    },
    select: { status: true },
  })

  const diagnoses = await db.oilDiagnosis.findMany({
    where: { sample: { organizationId: orgId } },
    select: { requiresStop: true, requiresInspection: true },
  })

  const total = components.length
  const normalCount = components.filter(c => c.status === 'normal').length
  const cautionCount = components.filter(c => c.status === 'caution').length
  const criticalCount = components.filter(c => c.status === 'critical').length
  const condemnedCount = components.filter(c => c.status === 'condemned').length

  return {
    totalComponents: total,
    totalSamples: samples.length,
    normalCount, cautionCount, criticalCount, condemnedCount,
    normalPct: total > 0 ? Math.round(normalCount / total * 100) : 0,
    cautionPct: total > 0 ? Math.round(cautionCount / total * 100) : 0,
    criticalPct: total > 0 ? Math.round((criticalCount + condemnedCount) / total * 100) : 0,
    criticalActions: diagnoses.filter(d => d.requiresStop).length,
    openRecommendations: diagnoses.filter(d => d.requiresInspection).length,
  }
}

// ─── Top risk components ───

export async function getTopRiskComponents(limit = 10): Promise<ComponentRisk[]> {
  const orgId = await getOrgId()

  const components = await db.lubeComponent.findMany({
    where: { organizationId: orgId, status: { in: ['critical', 'condemned', 'caution'] } },
    include: {
      asset: { include: { client: true } },
      samples: {
        orderBy: { sampleDate: 'desc' },
        take: 1,
        include: { diagnoses: { where: { severity: { in: ['critical', 'condemned'] } }, select: { variable: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  })

  return components.map(c => ({
    componentId: c.id,
    componentName: c.name,
    componentType: c.componentType,
    assetId: c.assetId,
    assetName: c.asset.name,
    assetCode: c.asset.internalCode || '—',
    clientName: c.asset.client.name,
    latestStatus: c.status,
    latestDate: c.samples[0]?.sampleDate.toISOString() ?? '',
    criticalVars: c.samples[0]?.diagnoses.map(d => d.variable) ?? [],
  }))
}

// ─── Client health comparison ───

export async function getClientHealthComparison(): Promise<ClientHealth[]> {
  const orgId = await getOrgId()

  const clients = await db.client.findMany({
    where: { organizationId: orgId, isActive: true },
    select: {
      id: true, name: true,
      assets: {
        select: {
          lubeComponents: {
            select: { status: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return clients
    .map(client => {
      const components = client.assets.flatMap(a => a.lubeComponents)
      if (components.length === 0) return null
      const total = components.length
      const normal = components.filter(c => c.status === 'normal').length
      const caution = components.filter(c => c.status === 'caution').length
      const critical = components.filter(c => c.status === 'critical' || c.status === 'condemned').length
      const healthScore = Math.round((normal * 100 + caution * 60) / total)

      const topIssue = critical > 0 ? `${critical} componente(s) crítico(s)`
        : caution > 0 ? `${caution} componente(s) en precaución`
        : 'Flota en buen estado'

      return { clientId: client.id, clientName: client.name, totalComponents: total, normalCount: normal, cautionCount: caution, criticalCount: critical, healthScore, topIssue }
    })
    .filter(Boolean) as ClientHealth[]
}

// ─── System breakdown ───

export async function getSystemBreakdown(): Promise<SystemBreakdown[]> {
  const orgId = await getOrgId()

  const components = await db.lubeComponent.findMany({
    where: { organizationId: orgId },
    select: { componentType: true, status: true },
  })

  const map: Record<string, SystemBreakdown> = {}
  for (const c of components) {
    if (!map[c.componentType]) {
      map[c.componentType] = { componentType: c.componentType, label: COMPONENT_LABELS[c.componentType] || c.componentType, normal: 0, caution: 0, critical: 0, total: 0 }
    }
    map[c.componentType].total++
    if (c.status === 'normal') map[c.componentType].normal++
    else if (c.status === 'caution') map[c.componentType].caution++
    else map[c.componentType].critical++
  }

  return Object.values(map).sort((a, b) => (b.critical + b.caution) - (a.critical + a.caution))
}

// ─── Critical diagnoses summary ───

export async function getCriticalDiagnosesSummary() {
  const orgId = await getOrgId()

  const diagnoses = await db.oilDiagnosis.findMany({
    where: { severity: { in: ['critical', 'condemned'] }, sample: { organizationId: orgId } },
    include: {
      sample: {
        select: {
          assetId: true,
          component: { select: { componentType: true, name: true } },
        },
      },
    },
  })

  const byVariable: Record<string, number> = {}
  for (const d of diagnoses) {
    byVariable[d.variable] = (byVariable[d.variable] || 0) + 1
  }

  return {
    total: diagnoses.length,
    requiresStop: diagnoses.filter(d => d.requiresStop).length,
    requiresOilChange: diagnoses.filter(d => d.requiresOilChange).length,
    byVariable: Object.entries(byVariable)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([variable, count]) => ({ variable, count })),
  }
}

// ─── Asset lube detail ───

export async function getAssetLubeDetail(assetId: string): Promise<AssetLubeDetail | null> {
  const asset = await db.asset.findUnique({
    where: { id: assetId },
    include: {
      client: { select: { name: true } },
      lubeComponents: {
        include: {
          samples: {
            orderBy: { sampleDate: 'asc' },
            include: {
              diagnoses: { orderBy: { priority: 'asc' } },
            },
          },
        },
        orderBy: { componentType: 'asc' },
      },
    },
  })
  if (!asset) return null

  return {
    assetId: asset.id,
    assetName: asset.name,
    assetCode: asset.internalCode || '—',
    clientName: asset.client.name,
    components: asset.lubeComponents.map(comp => {
      const latestSample = comp.samples[comp.samples.length - 1] ?? null
      const latestDiagnoses = latestSample?.diagnoses ?? []

      return {
        id: comp.id,
        componentType: comp.componentType,
        name: comp.name,
        status: comp.status,
        lastSampleDate: comp.lastSampleDate?.toISOString() ?? null,
        oilCapacityL: comp.oilCapacityL,
        recommendedOil: comp.recommendedOil,
        changeIntervalHours: comp.changeIntervalHours,
        latestSample: latestSample ? {
          status: latestSample.status,
          overallDiagnosis: latestSample.overallDiagnosis,
          recommendation: latestSample.recommendation,
          sampleDate: latestSample.sampleDate.toISOString(),
          ironFe: latestSample.ironFe,
          copperCu: latestSample.copperCu,
          siliconSi: latestSample.siliconSi,
          pqIndex: latestSample.pqIndex,
          tbn: latestSample.tbn,
          waterPct: latestSample.waterPct,
          viscosity40: latestSample.viscosity40,
        } : null,
        trend: comp.samples.map(s => ({
          sampleDate: s.sampleDate.toISOString(),
          equipmentHours: s.equipmentHours ?? 0,
          ironFe: s.ironFe,
          copperCu: s.copperCu,
          siliconSi: s.siliconSi,
          pqIndex: s.pqIndex,
          tbn: s.tbn,
          waterPct: s.waterPct,
          viscosity40: s.viscosity40,
          status: s.status,
        })),
        diagnoses: latestDiagnoses.map(d => ({
          variable: d.variable,
          severity: d.severity,
          possibleCause: d.possibleCause,
          recommendation: d.recommendation,
          requiresOilChange: d.requiresOilChange,
          requiresStop: d.requiresStop,
        })),
      }
    }),
  }
}

// ─── List assets with lube status ───

export async function getAssetsWithLubeStatus(clientId?: string) {
  const orgId = await getOrgId()

  const assets = await db.asset.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
      ...(clientId ? { clientId } : {}),
    },
    select: {
      id: true,
      name: true,
      internalCode: true,
      currentHours: true,
      client: { select: { id: true, name: true } },
      model: { select: { name: true, category: { select: { name: true } } } },
      lubeComponents: { select: { status: true, componentType: true } },
    },
    orderBy: { internalCode: 'asc' },
  })

  return assets.map(a => {
    const comps = a.lubeComponents
    const worstStatus = comps.some(c => c.status === 'condemned') ? 'condemned'
      : comps.some(c => c.status === 'critical') ? 'critical'
      : comps.some(c => c.status === 'caution') ? 'caution'
      : 'normal'

    return {
      id: a.id,
      name: a.name,
      code: a.internalCode || '—',
      currentHours: a.currentHours,
      clientId: a.client.id,
      clientName: a.client.name,
      modelName: a.model?.name ?? '—',
      categoryName: a.model?.category?.name ?? '—',
      totalComponents: comps.length,
      criticalComponents: comps.filter(c => c.status === 'critical' || c.status === 'condemned').length,
      cautionComponents: comps.filter(c => c.status === 'caution').length,
      worstStatus,
    }
  })
}

// ─── Fleet scatter analysis data ───

export interface ScatterPoint {
  assetId: string
  assetCode: string
  assetName: string
  clientId: string
  clientName: string
  componentType: string
  sampleDate: string
  equipmentHours: number
  oilHours: number
  ironFe: number | null
  copperCu: number | null
  aluminumAl: number | null
  siliconSi: number | null
  leadPb: number | null
  pqIndex: number | null
  tbn: number | null
  waterPct: number | null
  viscosity40: number | null
  oxidation: number | null
  fuelPct: number | null
  soot: number | null
  glycolPpm: number | null
  status: string
}

export interface LimitData {
  componentType: string
  variable: string
  unit: string
  normalMax: number
  cautionMax: number
  criticalMax: number
  condemnedMax: number | null
  normalMin: number | null
  cautionMin: number | null
  criticalMin: number | null
  condemnedMin: number | null
}

export interface FleetAnalysisData {
  points: ScatterPoint[]
  limits: LimitData[]
  clients: { id: string; name: string }[]
  assets: { id: string; code: string; name: string; clientId: string }[]
}

export async function getFleetAnalysisData(): Promise<FleetAnalysisData> {
  const orgId = await getOrgId()

  const [samples, limits, clients, assets] = await Promise.all([
    db.oilSample.findMany({
      where: { organizationId: orgId },
      select: {
        assetId: true,
        sampleDate: true,
        equipmentHours: true,
        oilHours: true,
        status: true,
        ironFe: true, copperCu: true, aluminumAl: true, siliconSi: true,
        leadPb: true, pqIndex: true, tbn: true, waterPct: true,
        viscosity40: true, oxidation: true, fuelPct: true, soot: true, glycolPpm: true,
        component: {
          select: {
            componentType: true,
            asset: {
              select: {
                internalCode: true, name: true,
                client: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { equipmentHours: 'asc' },
    }),
    db.oilLimit.findMany({
      where: { organizationId: '' },
      select: { componentType: true, variable: true, unit: true, normalMax: true, cautionMax: true, criticalMax: true, condemnedMax: true, normalMin: true, cautionMin: true, criticalMin: true, condemnedMin: true },
    }),
    db.client.findMany({
      where: { organizationId: orgId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    db.asset.findMany({
      where: { organizationId: orgId, isActive: true },
      select: { id: true, internalCode: true, name: true, clientId: true },
      orderBy: { internalCode: 'asc' },
    }),
  ])

  const points: ScatterPoint[] = samples
    .filter(s => s.equipmentHours !== null && s.equipmentHours > 0)
    .map(s => ({
      assetId: s.assetId,
      assetCode: s.component.asset.internalCode ?? '—',
      assetName: s.component.asset.name,
      clientId: s.component.asset.client.id,
      clientName: s.component.asset.client.name,
      componentType: s.component.componentType,
      sampleDate: s.sampleDate.toISOString(),
      equipmentHours: s.equipmentHours ?? 0,
      oilHours: s.oilHours ?? 0,
      ironFe: s.ironFe, copperCu: s.copperCu, aluminumAl: s.aluminumAl,
      siliconSi: s.siliconSi, leadPb: s.leadPb, pqIndex: s.pqIndex,
      tbn: s.tbn, waterPct: s.waterPct, viscosity40: s.viscosity40,
      oxidation: s.oxidation, fuelPct: s.fuelPct, soot: s.soot, glycolPpm: s.glycolPpm,
      status: s.status,
    }))

  return {
    points,
    limits: limits as LimitData[],
    clients: clients.map(c => ({ id: c.id, name: c.name })),
    assets: assets.map(a => ({ id: a.id, code: a.internalCode ?? '—', name: a.name, clientId: a.clientId })),
  }
}

// ─── Fault Frequency ───

export interface FaultFrequencyRow {
  variable: string
  label: string
  limitValue: number | null
  unit: string
  count: number
  pct: number
  cumulPct: number
}

export interface FaultFrequencyData {
  componentType: string
  total: number
  rows: FaultFrequencyRow[]
}

const VAR_LABELS: Record<string, string> = {
  ironFe: 'Hierro', copperCu: 'Cobre', aluminumAl: 'Aluminio',
  chromeCr: 'Cromo', siliconSi: 'Silicio', sodiumNa: 'Sodio',
  pqIndex: 'PQ Index', tbn: 'TBN', viscosity40: 'Alta Viscosidad',
  waterPct: 'Agua', fuelPct: 'Combustible', oxidation: 'Oxidación',
  soot: 'Hollín', glycolPpm: 'Glicol', leadPb: 'Plomo',
}

export async function getFaultFrequency(componentType = 'motor'): Promise<FaultFrequencyData> {
  const orgId = await getOrgId()

  const [diagnoses, limits] = await Promise.all([
    db.oilDiagnosis.findMany({
      where: {
        severity: { in: ['caution', 'critical', 'condemned'] },
        sample: {
          organizationId: orgId,
          component: { componentType },
        },
      },
      select: { variable: true },
    }),
    db.oilLimit.findMany({
      where: { organizationId: '', componentType },
      select: { variable: true, cautionMax: true, unit: true },
    }),
  ])

  const limitMap = Object.fromEntries(limits.map(l => [l.variable, { value: l.cautionMax, unit: l.unit }]))

  const freq: Record<string, number> = {}
  for (const d of diagnoses) {
    freq[d.variable] = (freq[d.variable] ?? 0) + 1
  }

  const total = Object.values(freq).reduce((s, v) => s + v, 0)
  if (total === 0) return { componentType, total: 0, rows: [] }

  let cumul = 0
  const rows: FaultFrequencyRow[] = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([variable, count]) => {
      const pct = Math.round((count / total) * 100)
      cumul += pct
      return {
        variable,
        label: VAR_LABELS[variable] ?? variable,
        limitValue: limitMap[variable]?.value ?? null,
        unit: limitMap[variable]?.unit ?? '',
        count,
        pct,
        cumulPct: Math.min(cumul, 100),
      }
    })

  return { componentType, total, rows }
}

// ─── Helpers ───

async function getOrgId(): Promise<string> {
  const org = await db.organization.findFirst({ where: { slug: 'imecol' } })
  return org?.id ?? ''
}
