'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getServiceRequests() {
  return db.serviceRequest.findMany({
    include: {
      client: { select: { name: true } },
      asset: { select: { internalCode: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createServiceRequest(formData: FormData) {
  const org = await db.organization.findFirst()
  if (!org) throw new Error('No hay organización')
  await db.serviceRequest.create({
    data: {
      organizationId: org.id,
      clientId: formData.get('clientId') as string || undefined,
      assetId: formData.get('assetId') as string || undefined,
      number: `SR-${Date.now().toString().slice(-6)}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      urgency: formData.get('priority') as string || 'medium',
    },
  })
  revalidatePath('/solicitudes')
  redirect('/solicitudes')
}

export async function getClientsAndAssets() {
  const [clients, assets] = await Promise.all([
    db.client.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    db.asset.findMany({ where: { isActive: true }, select: { id: true, internalCode: true, name: true } }),
  ])
  return { clients, assets }
}
