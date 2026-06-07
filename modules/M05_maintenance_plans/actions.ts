'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getMaintenancePlans() {
  return db.maintenancePlan.findMany({
    where: { isActive: true },
    include: {
      tasks: { orderBy: { frequencyValue: 'asc' } },
      assets: { include: { asset: { select: { internalCode: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPlanById(id: string) {
  return db.maintenancePlan.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { frequencyValue: 'asc' } },
      assets: { include: { asset: { include: { client: { select: { name: true } } } } } },
    },
  })
}

export async function createMaintenancePlan(formData: FormData) {
  const org = await db.organization.findFirst()
  if (!org) throw new Error('No hay organización')
  const plan = await db.maintenancePlan.create({
    data: {
      organizationId: org.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      type: formData.get('category') as string || 'preventive',
    },
  })
  revalidatePath('/planes')
  redirect(`/planes/${plan.id}`)
}
