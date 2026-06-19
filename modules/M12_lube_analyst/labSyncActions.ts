'use server'

import { db } from '@core/lib/db'
import {
  fetchLabResults, fetchLabEquipment, testLabConnection,
  mapLabRecordToSample, mapComponentType, mapLabStatus,
  type LabResultRecord,
} from './labApiClient'

function getLabConfig() {
  return {
    clientId:     process.env.LAB_CLIENT_ID ?? '',
    operationIds: (process.env.LAB_OPERATION_IDS ?? '').split(',').map(s => s.trim()).filter(Boolean),
    apiKey:       process.env.LAB_API_KEY ?? '',
    token:        process.env.LAB_ACCESS_TOKEN ?? '',
  }
}

export function isLabConfigured(): boolean {
  const c = getLabConfig()
  return !!(c.apiKey && c.token && c.clientId && c.operationIds.length > 0)
}

// ─── Test connection ──────────────────────────────────────────────────────────

export async function testLabConnectionAction() {
  const { clientId, operationIds } = getLabConfig()
  if (!isLabConfigured()) {
    return { ok: false, message: 'Credenciales de laboratorio no configuradas en .env.local' }
  }
  return testLabConnection(clientId, operationIds)
}

// ─── Sync results from lab API → local DB ────────────────────────────────────

export interface SyncResult {
  ok: boolean
  message: string
  created: number
  updated: number
  skipped: number
  errors: string[]
}

export async function syncLabResults(options?: {
  dateFrom?: string
  dateTo?: string
  forceResync?: boolean
}): Promise<SyncResult> {
  if (!isLabConfigured()) {
    return { ok: false, message: 'Credenciales no configuradas', created: 0, updated: 0, skipped: 0, errors: [] }
  }

  const { clientId, operationIds } = getLabConfig()

  // Default: last 12 months
  const now = new Date()
  const from = options?.dateFrom ?? (() => {
    const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10)
  })()
  const to = options?.dateTo ?? now.toISOString().slice(0, 10)

  const org = await db.organization.findFirst({ where: { slug: 'imecol' } })
  const orgId = org?.id ?? ''

  let records: LabResultRecord[]
  try {
    records = await fetchLabResults({ clientId, operationIds, dateFrom: from, dateTo: to })
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e), created: 0, updated: 0, skipped: 0, errors: [] }
  }

  let created = 0, updated = 0, skipped = 0
  const errors: string[] = []

  for (const rec of records) {
    try {
      // ── 1. Find or create asset by equipment code ──────────────────────────
      const equipCode = rec.EQUIPO?.trim()
      if (!equipCode) { skipped++; continue }

      let asset = await db.asset.findFirst({
        where: { organizationId: orgId, internalCode: equipCode },
      })

      if (!asset) {
        // Auto-create asset from lab data if not found
        const client = await db.client.findFirst({ where: { organizationId: orgId } })
        if (!client) { skipped++; continue }

        asset = await db.asset.create({
          data: {
            organizationId: orgId,
            clientId: client.id,
            internalCode: equipCode,
            name: rec.TIPO_EQUIPO
              ? `${rec.MARCA_EQUIPO || ''} ${rec.MODELO_EQUIPO || ''} (${rec.TIPO_EQUIPO})`.trim()
              : equipCode,
            operativeStatus: 'operative',
            isActive: true,
          },
        })
      }

      // ── 2. Find or create LubeComponent ───────────────────────────────────
      const compCode = rec.COMPONENTE?.trim()
      const compType = mapComponentType(rec.DESCRIPTOR_COMPONENTE || rec.TIPO_EQUIPO || '')
      const compName = rec.DESCRIPTOR_COMPONENTE || rec.MODELO_COMPONENTE || compCode || 'Componente'

      let comp = await db.lubeComponent.findFirst({
        where: { assetId: asset.id, name: { contains: compCode } },
      })

      if (!comp) {
        comp = await db.lubeComponent.create({
          data: {
            organizationId: orgId,
            assetId: asset.id,
            componentType: compType,
            name: compName,
            recommendedOil: rec.PRODUCTO || null,
            status: 'normal',
          },
        })
      }

      // ── 3. Map analysis values ─────────────────────────────────────────────
      const vals = mapLabRecordToSample(rec)
      const status = mapLabStatus(rec.ESTADO)
      const sampleDate = new Date(rec.FECHA_MUESTREO)
      const analysisDate = rec.FECHA_INFORME ? new Date(rec.FECHA_INFORME) : null
      const receivedDate = rec.FECHA_INGRESO ? new Date(rec.FECHA_INGRESO) : null
      const equipHours = rec.EDAD_COMPONENTE ? parseFloat(rec.EDAD_COMPONENTE) : null
      const oilHours   = rec.EDAD_PRODUCTO   ? parseFloat(rec.EDAD_PRODUCTO)   : null

      // ── 4. Upsert OilSample (keyed by N_MUESTRA) ──────────────────────────
      const existing = await db.oilSample.findFirst({
        where: { externalReportNo: rec.N_MUESTRA },
      })

      const sampleData = {
        organizationId: orgId,
        assetId: asset.id,
        componentId: comp.id,
        externalReportNo: rec.N_MUESTRA,
        lab: rec.NOMBRE_CLIENTE || 'Laboratorio externo',
        sampleDate,
        receivedDate,
        analysisDate,
        status,
        equipmentHours: isNaN(equipHours!) ? null : equipHours,
        oilHours: isNaN(oilHours!) ? null : oilHours,
        // Analytical values
        ironFe:       vals.ironFe       ?? null,
        copperCu:     vals.copperCu     ?? null,
        aluminumAl:   vals.aluminumAl   ?? null,
        chromeCr:     vals.chromeCr     ?? null,
        leadPb:       vals.leadPb       ?? null,
        tinSn:        vals.tinSn        ?? null,
        nickelNi:     vals.nickelNi     ?? null,
        siliconSi:    vals.siliconSi    ?? null,
        sodiumNa:     vals.sodiumNa     ?? null,
        potassiumK:   vals.potassiumK   ?? null,
        boronB:       vals.boronB       ?? null,
        molybdenumMo: vals.molybdenumMo ?? null,
        zincZn:       vals.zincZn       ?? null,
        phosphorusP:  vals.phosphorusP  ?? null,
        calciumCa:    vals.calciumCa    ?? null,
        magnesiumMg:  vals.magnesiumMg  ?? null,
        bariumBa:     vals.bariumBa     ?? null,
        pqIndex:      vals.pqIndex      ?? null,
        tbn:          vals.tbn          ?? null,
        tan:          vals.tan          ?? null,
        viscosity40:  vals.viscosity40  ?? null,
        viscosity100: vals.viscosity100 ?? null,
        oxidation:    vals.oxidation    ?? null,
        nitration:    vals.nitration    ?? null,
        soot:         vals.soot         ?? null,
        waterPct:     vals.waterPct     ?? null,
        glycolPpm:    vals.glycolPpm    ?? null,
        fuelPct:      vals.fuelPct      ?? null,
      }

      if (existing && !options?.forceResync) {
        // Already imported; skip unless forced
        skipped++
        continue
      }

      if (existing) {
        await db.oilSample.update({ where: { id: existing.id }, data: sampleData })
        updated++
      } else {
        await db.oilSample.create({ data: sampleData })
        created++
      }

      // ── 5. Update component's lastSampleDate and status ───────────────────
      await db.lubeComponent.update({
        where: { id: comp.id },
        data: { lastSampleDate: sampleDate, status, updatedAt: new Date() },
      })

    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`[${rec.N_MUESTRA}] ${msg}`)
      if (errors.length > 20) break  // safety cap
    }
  }

  return {
    ok: true,
    message: `Sincronización completa: ${created} nuevas, ${updated} actualizadas, ${skipped} omitidas`,
    created, updated, skipped, errors,
  }
}

// ─── Get last sync info ───────────────────────────────────────────────────────

export async function getLabSyncStatus() {
  const org = await db.organization.findFirst({ where: { slug: 'imecol' } })
  const orgId = org?.id ?? ''

  const [totalSamples, lastSample, fromLab] = await Promise.all([
    db.oilSample.count({ where: { organizationId: orgId } }),
    db.oilSample.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, lab: true },
    }),
    db.oilSample.count({
      where: { organizationId: orgId, lab: { not: 'Laboratorio IMECOL' } },
    }),
  ])

  return {
    configured: isLabConfigured(),
    totalSamples,
    labSamples: fromLab,
    lastImportAt: lastSample?.createdAt?.toISOString() ?? null,
    lastImportLab: lastSample?.lab ?? null,
  }
}
