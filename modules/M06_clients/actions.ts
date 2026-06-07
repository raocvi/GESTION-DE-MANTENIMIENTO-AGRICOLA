'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getClients(search?: string) {
  return db.client.findMany({
    where: {
      isActive: true,
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
          { city: { contains: search } },
          { contactName: { contains: search } },
        ]
      } : {}),
    },
    include: {
      assets: { where: { isActive: true }, select: { id: true, operativeStatus: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getClientById(id: string) {
  return db.client.findUnique({
    where: { id },
    include: {
      assets: {
        where: { isActive: true },
        include: { brand: { select: { name: true } }, model: { select: { name: true } } },
        orderBy: { internalCode: 'asc' },
      },
      workOrders: { where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 5, include: { asset: { select: { internalCode: true } } } },
    },
  })
}

export async function createClient(formData: FormData) {
  const org = await db.organization.findFirst()
  if (!org) throw new Error('No hay organización')
  const client = await db.client.create({
    data: {
      organizationId: org.id,
      code: `CLI-${Date.now().toString().slice(-4)}`,
      name: formData.get('name') as string,
      nit: formData.get('nit') as string || undefined,
      contactName: formData.get('contactName') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      address: formData.get('address') as string || undefined,
      city: formData.get('city') as string || undefined,
      department: formData.get('department') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    },
  })
  revalidatePath('/clientes')
  redirect(`/clientes/${client.id}`)
}

export async function updateClient(id: string, formData: FormData) {
  await db.client.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
      nit: formData.get('nit') as string || undefined,
      contactName: formData.get('contactName') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      address: formData.get('address') as string || undefined,
      city: formData.get('city') as string || undefined,
      department: formData.get('department') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    },
  })
  revalidatePath(`/clientes/${id}`)
  revalidatePath('/clientes')
  redirect(`/clientes/${id}`)
}
