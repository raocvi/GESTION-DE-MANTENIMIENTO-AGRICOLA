'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Maps component type keys to search terms used in work order fields
const COMP_SEARCH_TERMS: Record<string, string[]> = {
  motor:        ['motor', 'Motor', 'engine', 'FPT'],
  transmission: ['transmision', 'transmisión', 'Transmisión', 'Transmision', 'powershift'],
  hydraulic:    ['hidraulico', 'hidráulico', 'Hidráulico', 'Hidraulico', 'hydraulic'],
  differential: ['diferencial', 'Diferencial'],
  final_drive:  ['mando', 'mando final', 'Mandos Finales', 'final drive'],
  brake_wet:    ['freno', 'Frenos'],
  reducer:      ['reductor', 'Reductor'],
}

export async function getComponentServiceHistory(assetId: string, componentType: string) {
  const terms = COMP_SEARCH_TERMS[componentType] ?? [componentType]

  const orClauses = terms.flatMap(term => [
    { componentAffected: { contains: term } },
    { title: { contains: term } },
  ])

  return db.workOrder.findMany({
    where: {
      assetId,
      OR: orClauses,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      assignedTo: { select: { name: true } },
      createdBy:  { select: { name: true } },
      tasks: {
        select: { name: true, status: true, actualHours: true },
        orderBy: { order: 'asc' },
        take: 5,
      },
    },
  })
}

export async function getComponentFullDetail(assetId: string, componentId: string) {
  const [component, lastSamples] = await Promise.all([
    db.lubeComponent.findUnique({
      where: { id: componentId },
      include: {
        samples: {
          orderBy: { sampleDate: 'desc' },
          take: 5,
          select: {
            id: true, sampleDate: true, status: true, equipmentHours: true,
            ironFe: true, copperCu: true, siliconSi: true, pqIndex: true,
            tbn: true, waterPct: true, viscosity40: true, overallDiagnosis: true,
          },
        },
      },
    }),
    Promise.resolve([]),
  ])
  return component
}

export async function getAssets(search?: string) {
  return db.asset.findMany({
    where: {
      isActive: true,
      ...(search ? {
        OR: [
          { internalCode: { contains: search } },
          { name: { contains: search } },
        ]
      } : {}),
    },
    include: {
      brand: { select: { name: true } },
      model: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { internalCode: 'asc' },
  })
}

export async function getAssetById(id: string) {
  return db.asset.findUnique({
    where: { id },
    include: {
      brand: true,
      model: true,
      category: true,
      client: true,
      workOrders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { assignedTo: { select: { name: true } } }
      },
      lubeComponents: {
        where: { isActive: true },
        orderBy: { componentType: 'asc' },
        select: {
          id: true, componentType: true, name: true,
          status: true, recommendedOil: true,
          changeIntervalHours: true, lastChangeHours: true,
          lastSampleDate: true, oilCapacityL: true,
        }
      }
    },
  })
}

export async function createAsset(formData: FormData) {
  const org = await db.organization.findFirst()
  if (!org) throw new Error('No hay organización')
  const asset = await db.asset.create({
    data: {
      organizationId: org.id,
      internalCode: formData.get('internalCode') as string,
      name: formData.get('name') as string,
      serialNumber: formData.get('serialNumber') as string || undefined,
      year: formData.get('year') ? parseInt(formData.get('year') as string) : undefined,
      operativeStatus: formData.get('operativeStatus') as string || 'operative',
      criticality: formData.get('criticality') as string || 'medium',
      currentHours: formData.get('currentHours') ? parseFloat(formData.get('currentHours') as string) : 0,
      clientId: formData.get('clientId') as string,
    },
  })
  revalidatePath('/activos')
  redirect(`/activos/${asset.id}`)
}
