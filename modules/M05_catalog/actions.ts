'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function getServiceCatalog() {
  return db.serviceComponent.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      serviceTypes: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  })
}

// ─── COMPONENT CRUD ──────────────────────────────────────────────────────────

export async function createServiceComponent(formData: FormData) {
  const maxOrder = await db.serviceComponent.aggregate({ _max: { order: true } })
  await db.serviceComponent.create({
    data: {
      value:  (formData.get('value') as string).toLowerCase().replace(/\s+/g, '_'),
      label:  formData.get('label') as string,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  })
  revalidatePath('/configuracion/catalogo')
}

export async function updateServiceComponent(id: string, formData: FormData) {
  await db.serviceComponent.update({
    where: { id },
    data: {
      label: formData.get('label') as string,
    },
  })
  revalidatePath('/configuracion/catalogo')
}

export async function toggleServiceComponent(id: string, isActive: boolean) {
  await db.serviceComponent.update({ where: { id }, data: { isActive } })
  revalidatePath('/configuracion/catalogo')
}

// ─── SERVICE TYPE CRUD ────────────────────────────────────────────────────────

export async function createServiceType(componentId: string, formData: FormData) {
  const label  = formData.get('label') as string
  const value  = label.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').slice(0, 40)
  const maxOrder = await db.serviceType.aggregate({
    where: { componentId },
    _max: { order: true },
  })
  await db.serviceType.create({
    data: {
      componentId,
      value,
      label,
      estimatedHours: parseFloat(formData.get('estimatedHours') as string) || 2,
      type: formData.get('type') as string || 'corrective',
      order: (maxOrder._max.order ?? 0) + 1,
    },
  })
  revalidatePath('/configuracion/catalogo')
}

export async function updateServiceType(id: string, formData: FormData) {
  await db.serviceType.update({
    where: { id },
    data: {
      label:          formData.get('label') as string,
      estimatedHours: parseFloat(formData.get('estimatedHours') as string) || 2,
      type:           formData.get('type') as string || 'corrective',
    },
  })
  revalidatePath('/configuracion/catalogo')
}

export async function toggleServiceType(id: string, isActive: boolean) {
  await db.serviceType.update({ where: { id }, data: { isActive } })
  revalidatePath('/configuracion/catalogo')
}

export async function deleteServiceType(id: string) {
  await db.serviceType.delete({ where: { id } })
  revalidatePath('/configuracion/catalogo')
}
