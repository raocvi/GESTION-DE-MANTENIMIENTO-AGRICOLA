/**
 * Seed ejecutable con node directamente (sin ts-node)
 * Ejecutar: node prisma/seed.js
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const path = require('path')
process.env.DATABASE_URL = 'file:' + path.join(__dirname, 'dev.db')

const db = new PrismaClient()

async function main() {
  console.log('\n🌱 Iniciando seed de AgroMaint Pro...\n')

  const org = await db.organization.upsert({
    where: { slug: 'imecol' },
    update: {},
    create: {
      name: 'IMECOL S.A.S.',
      slug: 'imecol',
      email: 'soporte@imecol.com.co',
      phone: '+57 (4) 444-5555',
      address: 'Cra 43A # 1-50, Medellín',
      city: 'Medellín',
      country: 'Colombia',
      currency: 'COP',
      timezone: 'America/Bogota',
      plan: 'enterprise',
    },
  })
  console.log(`✅ Organización: ${org.name}`)

  const adminRole = await db.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', displayName: 'Administrador', description: 'Acceso total', isSystem: true, permissions: '["*"]' },
  })
  const supervisorRole = await db.role.upsert({
    where: { name: 'supervisor' },
    update: {},
    create: { name: 'supervisor', displayName: 'Supervisor', description: 'Gestión de OT', isSystem: true, permissions: '["work_orders.*"]' },
  })
  const techRole = await db.role.upsert({
    where: { name: 'technician' },
    update: {},
    create: { name: 'technician', displayName: 'Técnico', description: 'Ejecución OT', isSystem: true, permissions: '["work_orders.update"]' },
  })
  console.log('✅ Roles creados')

  const passwordHash = await bcrypt.hash('AgroMaint2024!', 12)

  const admin = await db.user.upsert({
    where: { email: 'admin@imecol.com.co' },
    update: {},
    create: { organizationId: org.id, email: 'admin@imecol.com.co', password: passwordHash, name: 'Administrador IMECOL', isActive: true },
  })
  await db.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } }, update: {}, create: { userId: admin.id, roleId: adminRole.id } })

  const supervisor = await db.user.upsert({
    where: { email: 'supervisor@imecol.com.co' },
    update: {},
    create: { organizationId: org.id, email: 'supervisor@imecol.com.co', password: passwordHash, name: 'Carlos Supervisor', isActive: true },
  })
  await db.userRole.upsert({ where: { userId_roleId: { userId: supervisor.id, roleId: supervisorRole.id } }, update: {}, create: { userId: supervisor.id, roleId: supervisorRole.id } })

  const tech1 = await db.user.upsert({
    where: { email: 'tecnico1@imecol.com.co' },
    update: {},
    create: { organizationId: org.id, email: 'tecnico1@imecol.com.co', password: passwordHash, name: 'Andrés Técnico', isActive: true },
  })
  await db.userRole.upsert({ where: { userId_roleId: { userId: tech1.id, roleId: techRole.id } }, update: {}, create: { userId: tech1.id, roleId: techRole.id } })

  console.log('✅ Usuarios creados')

  const cliente1 = await db.client.upsert({
    where: { id: 'client-001' },
    update: {},
    create: { id: 'client-001', organizationId: org.id, code: 'CLI-001', name: 'Agropecuaria La Esperanza', contactName: 'Jorge Hernández', city: 'Montería', department: 'Córdoba' },
  })
  const cliente2 = await db.client.upsert({
    where: { id: 'client-002' },
    update: {},
    create: { id: 'client-002', organizationId: org.id, code: 'CLI-002', name: 'Hacienda Los Llanos', contactName: 'María Ruiz', city: 'Villavicencio', department: 'Meta' },
  })
  const cliente3 = await db.client.upsert({
    where: { id: 'client-003' },
    update: {},
    create: { id: 'client-003', organizationId: org.id, code: 'CLI-003', name: 'Hacienda Santa Rosa', contactName: 'Pedro Castro', city: 'Sincelejo', department: 'Sucre' },
  })
  console.log('✅ Clientes creados')

  const caseIH = await db.brand.upsert({ where: { name: 'CASE IH' }, update: {}, create: { name: 'CASE IH', code: 'CASEIH', country: 'US' } })
  const cat = await db.assetCategory.upsert({ where: { code: 'COSE' }, update: {}, create: { code: 'COSE', name: 'Cosechadora' } })
  const modelo = await db.assetModel.upsert({
    where: { id: 'model-a9900' },
    update: {},
    create: { id: 'model-a9900', brandId: caseIH.id, categoryId: cat.id, name: 'A9900', code: 'A9900', engine: 'FPT Cursor 13 — 625 HP' },
  })
  console.log('✅ Marca / Modelo A9900 creado')

  await db.asset.upsert({ where: { id: 'asset-001' }, update: { currentHours: 1248 }, create: { id: 'asset-001', organizationId: org.id, clientId: cliente1.id, brandId: caseIH.id, modelId: modelo.id, categoryId: cat.id, internalCode: 'A9900-001', serialNumber: 'HAJ196810', name: 'Cosechadora CASE IH A9900', year: 2022, operativeStatus: 'operative', criticality: 'critical', currentHours: 1248 } })
  await db.asset.upsert({ where: { id: 'asset-002' }, update: { currentHours: 2105 }, create: { id: 'asset-002', organizationId: org.id, clientId: cliente2.id, brandId: caseIH.id, modelId: modelo.id, categoryId: cat.id, internalCode: 'A9900-002', serialNumber: 'HAJ196811', name: 'Cosechadora CASE IH A9900', year: 2021, operativeStatus: 'maintenance', criticality: 'critical', currentHours: 2105 } })
  await db.asset.upsert({ where: { id: 'asset-003' }, update: { currentHours: 845 }, create: { id: 'asset-003', organizationId: org.id, clientId: cliente3.id, brandId: caseIH.id, modelId: modelo.id, categoryId: cat.id, internalCode: 'A9900-003', serialNumber: 'HAJ196812', name: 'Cosechadora CASE IH A9900', year: 2023, operativeStatus: 'operative', criticality: 'critical', currentHours: 845 } })
  console.log('✅ 3 Activos A9900 creados')

  await db.workOrder.upsert({
    where: { number: 'OT-260601-0001' },
    update: {},
    create: { organizationId: org.id, number: 'OT-260601-0001', title: 'Mantenimiento preventivo 1000h — A9900-001', type: 'preventive', status: 'in_progress', priority: 'high', assetId: 'asset-001', clientId: cliente1.id, assignedToId: tech1.id, createdById: supervisor.id, scheduledDate: new Date('2026-06-06'), dueDate: new Date('2026-06-08'), estimatedHours: 8 },
  })
  console.log('✅ Orden de trabajo demo creada\n')

  console.log('═══════════════════════════════════════')
  console.log('  🎉 SEED OK — CREDENCIALES DE ACCESO:')
  console.log('═══════════════════════════════════════')
  console.log('  📧 admin@imecol.com.co')
  console.log('  🔑 AgroMaint2024!')
  console.log('───────────────────────────────────────')
  console.log('  📧 supervisor@imecol.com.co')
  console.log('  🔑 AgroMaint2024!')
  console.log('───────────────────────────────────────')
  console.log('  📧 tecnico1@imecol.com.co')
  console.log('  🔑 AgroMaint2024!')
  console.log('═══════════════════════════════════════\n')
}

main().catch(e => { console.error('❌', e); process.exit(1) }).finally(() => db.$disconnect())
