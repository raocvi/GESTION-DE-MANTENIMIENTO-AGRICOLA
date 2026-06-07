'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
