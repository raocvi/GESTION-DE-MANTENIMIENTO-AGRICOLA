import { PrismaClient } from '@prisma/client'
import { SERVICE_CATALOG } from '../@core/constants/serviceCatalog'

const db = new PrismaClient()

export async function seedServiceCatalog() {
  console.log('🔧 Seeding service catalog...')

  for (let ci = 0; ci < SERVICE_CATALOG.length; ci++) {
    const comp = SERVICE_CATALOG[ci]
    const component = await db.serviceComponent.upsert({
      where: { value: comp.value },
      update: { label: comp.label, order: ci },
      create: { value: comp.value, label: comp.label, order: ci },
    })

    for (let si = 0; si < comp.services.length; si++) {
      const svc = comp.services[si]
      await db.serviceType.upsert({
        where: { componentId_value: { componentId: component.id, value: svc.value } },
        update: { label: svc.label, estimatedHours: svc.estimatedHours, type: svc.type, order: si },
        create: {
          componentId: component.id,
          value: svc.value,
          label: svc.label,
          estimatedHours: svc.estimatedHours,
          type: svc.type,
          order: si,
        },
      })
    }
  }

  const total = SERVICE_CATALOG.reduce((s, c) => s + c.services.length, 0)
  console.log(`✅ Service catalog: ${SERVICE_CATALOG.length} components, ${total} service types`)
}
