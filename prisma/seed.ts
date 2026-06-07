/**
 * SEED — AgroMaint Pro
 * Datos iniciales para IMECOL S.A.S. con soporte a Proyectos/Actividades
 * Ejecución: npm run db:seed
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('\n🌱 Iniciando seed de AgroMaint Pro...\n')

  // 1. Organización
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

  // 2. Roles
  const adminRole = await db.role.upsert({
    where: { name: 'admin' }, update: {},
    create: { name: 'admin', displayName: 'Administrador', description: 'Acceso total', isSystem: true, permissions: '["*"]' },
  })
  const supervisorRole = await db.role.upsert({
    where: { name: 'supervisor' }, update: {},
    create: { name: 'supervisor', displayName: 'Supervisor', description: 'Gestión', isSystem: true, permissions: '["*"]' },
  })
  const techRole = await db.role.upsert({
    where: { name: 'technician' }, update: {},
    create: { name: 'technician', displayName: 'Técnico', description: 'Ejecución', isSystem: true, permissions: '["*"]' },
  })

  // 3. Usuarios y Técnicos
  const passwordHash = await bcrypt.hash('AgroMaint2024!', 12)

  const admin = await db.user.upsert({
    where: { email: 'admin@imecol.com.co' }, update: {},
    create: { organizationId: org.id, email: 'admin@imecol.com.co', password: passwordHash, name: 'Administrador', isActive: true },
  })
  const supervisor = await db.user.upsert({
    where: { email: 'supervisor@imecol.com.co' }, update: {},
    create: { organizationId: org.id, email: 'supervisor@imecol.com.co', password: passwordHash, name: 'Carlos Supervisor', isActive: true },
  })

  const techUsers = []
  const techs = []
  for (let i = 1; i <= 20; i++) {
    const techUser = await db.user.upsert({
      where: { email: `tecnico${i}@imecol.com.co` }, update: {},
      create: { organizationId: org.id, email: `tecnico${i}@imecol.com.co`, password: passwordHash, name: `Técnico ${i}`, isActive: true },
    })
    techUsers.push(techUser)
    
    // Create actual Technician record
        let techRecord = await db.technician.findFirst({ where: { userId: techUser.id } })
    if (!techRecord) {
      const isSpecialist = i % 3 === 0
      techRecord = await db.technician.create({
        data: {
          organizationId: org.id,
          userId: techUser.id,
          name: `Técnico ${i}`,
          level: isSpecialist ? 'senior' : (i % 2 === 0 ? 'mid' : 'junior'),
          position: isSpecialist ? 'Técnico Especialista' : 'Técnico de Campo',
          educationLevel: isSpecialist ? 'Profesional' : 'Tecnólogo',
          phone: `+57 300 000 ${i.toString().padStart(4, '0')}`,
          email: `tecnico${i}@imecol.com.co`,
          specialty: JSON.stringify(isSpecialist ? ['Hidráulica Avanzada', 'Electrónica'] : ['Mecánica General']),
          courses: JSON.stringify(['Inducción AgroMaint', isSpecialist ? 'Certificación CASE IH Expert' : 'Básico JOHN DEERE']),
          certifications: JSON.stringify(['Trabajo en Alturas', 'ISO 9001']),
        }
      })
    }
    techs.push(techRecord)
  }

  // 4. Clientes (50+)
  const clients = []
  for (let i = 1; i <= 50; i++) {
    const client = await db.client.upsert({
      where: { id: `client-${i.toString().padStart(3, '0')}` },
      update: {},
      create: {
        id: `client-${i.toString().padStart(3, '0')}`,
        organizationId: org.id,
        code: `CLI-${i.toString().padStart(3, '0')}`,
        name: `Agropecuaria Cliente ${i}`,
        contactName: `Contacto ${i}`,
        city: ['Medellín', 'Bogotá', 'Cali', 'Montería', 'Villavicencio'][i % 5],
      },
    })
    clients.push(client)
  }

  // 5. Categorías, Marcas, Modelos
  const caseIH = await db.brand.upsert({ where: { name: 'CASE IH' }, update: {}, create: { name: 'CASE IH', code: 'CASEIH' } })
  const johnDeere = await db.brand.upsert({ where: { name: 'JOHN DEERE' }, update: {}, create: { name: 'JOHN DEERE', code: 'JDEERE' } })
  
  const catCosechadora = await db.assetCategory.upsert({ where: { code: 'COSE' }, update: {}, create: { code: 'COSE', name: 'Cosechadora' } })
  const catTractor = await db.assetCategory.upsert({ where: { code: 'TRAC' }, update: {}, create: { code: 'TRAC', name: 'Tractor' } })

  const modelA9900 = await db.assetModel.upsert({
    where: { id: 'model-a9900' }, update: {},
    create: { id: 'model-a9900', brandId: caseIH.id, categoryId: catCosechadora.id, name: 'A9900', code: 'A9900' }
  })
  const model8R = await db.assetModel.upsert({
    where: { id: 'model-8r' }, update: {},
    create: { id: 'model-8r', brandId: johnDeere.id, categoryId: catTractor.id, name: '8R 370', code: '8R' }
  })

  // 6. Activos (100+)
  const assets = []
  for (let i = 1; i <= 100; i++) {
    const isTractor = i % 2 === 0
    const asset = await db.asset.upsert({
      where: { id: `asset-${i.toString().padStart(3, '0')}` },
      update: {},
      create: {
        id: `asset-${i.toString().padStart(3, '0')}`,
        organizationId: org.id,
        clientId: clients[i % 50].id,
        brandId: isTractor ? johnDeere.id : caseIH.id,
        modelId: isTractor ? model8R.id : modelA9900.id,
        categoryId: isTractor ? catTractor.id : catCosechadora.id,
        internalCode: `EQ-${i.toString().padStart(3, '0')}`,
        serialNumber: `SN${i}XYZ`,
        name: `${isTractor ? 'Tractor' : 'Cosechadora'} ${i}`,
        operativeStatus: 'operative',
        currentHours: 500 + i * 10,
      },
    })
    assets.push(asset)
  }

  // 7. Proyectos (Órdenes Correctivas)
  // Generaremos 10 Proyectos Grandes con múltiples tareas para el Gantt
  for (let i = 1; i <= 10; i++) {
    const prjNumber = `PRJ-CORR-${i.toString().padStart(3, '0')}`
    const existing = await db.workOrder.findUnique({ where: { number: prjNumber } })
    if (existing) continue;

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (Math.random() * 20))
    const dueDate = new Date(startDate)
    dueDate.setDate(dueDate.getDate() + 30)

    const workOrder = await db.workOrder.create({
      data: {
        organizationId: org.id,
        number: prjNumber,
        title: `Reparación Mayor de Motor y Transmisión - Proyecto ${i}`,
        type: 'corrective',
        status: i % 2 === 0 ? 'in_progress' : 'assigned',
        priority: 'high',
        assetId: assets[i].id,
        clientId: clients[i].id,
        createdById: admin.id,
        scheduledDate: startDate,
        dueDate: dueDate,
      }
    })

    // Crear 5 a 8 actividades por proyecto
    const totalTasks = 5 + Math.floor(Math.random() * 3)
    let currentTaskStart = new Date(startDate)

    for (let j = 1; j <= totalTasks; j++) {
      const taskEnd = new Date(currentTaskStart)
      taskEnd.setDate(taskEnd.getDate() + (1 + Math.floor(Math.random() * 4)))
      
      const techAssigned = techs[Math.floor(Math.random() * techs.length)]
      
      const progress = i % 2 === 0 ? (j < totalTasks / 2 ? 100 : (j === Math.floor(totalTasks / 2) ? 50 : 0)) : 0
      const status = progress === 100 ? 'completed' : (progress > 0 ? 'in_progress' : 'pending')

      const task = await db.workOrderTask.create({
        data: {
          workOrderId: workOrder.id,
          name: `Fase ${j}: ${['Desarme', 'Inspección', 'Rectificación', 'Armado', 'Pruebas', 'Pintura', 'Entrega'][j-1] || 'Actividad general'}`,
          status,
          order: j,
          technicianId: techAssigned.id,
          startDate: currentTaskStart,
          endDate: taskEnd,
          estimatedHours: 16 + Math.random() * 24,
          actualHours: progress > 0 ? 8 + Math.random() * 16 : 0,
          progress,
        }
      })

      // Agregar repuestos a algunas tareas
      if (j % 2 === 0) {
        await db.workOrderPart.create({
          data: {
            workOrderId: workOrder.id,
            taskId: task.id,
            partName: `Repuesto para Fase ${j}`,
            quantity: 2,
            unitCost: 150000,
            totalCost: 300000,
          }
        })
      }

      currentTaskStart = new Date(taskEnd)
    }
  }

  // 8. Órdenes Preventivas normales (30+)
  for (let i = 1; i <= 30; i++) {
    const otNumber = `OT-PREV-${i.toString().padStart(3, '0')}`
    const existing = await db.workOrder.findUnique({ where: { number: otNumber } })
    if (existing) continue;

    await db.workOrder.create({
      data: {
        organizationId: org.id,
        number: otNumber,
        title: `Mantenimiento Preventivo 1000H - ${i}`,
        type: 'preventive',
        status: 'pending',
        priority: 'medium',
        assetId: assets[30 + i].id,
        clientId: clients[20 + (i % 20)].id,
        createdById: supervisor.id,
        assignedToId: techUsers[i % 20].id,
      }
    })
  }

  // 9. Órdenes Históricas Cerradas (Para Dashboard MTBF, MTTR, Costos)
  for (let i = 1; i <= 150; i++) {
    const otNumber = `OT-HIST-${i.toString().padStart(4, '0')}`
    const existing = await db.workOrder.findUnique({ where: { number: otNumber } })
    if (existing) continue;

    // Generar fechas en el pasado (últimos 6 meses)
    const closedDate = new Date()
    closedDate.setDate(closedDate.getDate() - Math.floor(Math.random() * 180))
    const startDate = new Date(closedDate)
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 5) - 1) // 1 a 5 días de duración
    const scheduledDate = new Date(startDate)
    scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 3))

    const isCorrective = Math.random() > 0.5
    const actualHours = Math.floor(Math.random() * 20) + 2
    const laborCost = actualHours * 50000
    const partsCost = isCorrective ? Math.floor(Math.random() * 2000000) : Math.floor(Math.random() * 500000)

    await db.workOrder.create({
      data: {
        organizationId: org.id,
        number: otNumber,
        title: `${isCorrective ? 'Reparación de Falla' : 'Mantenimiento Programado'} - Histórico ${i}`,
        type: isCorrective ? 'corrective' : 'preventive',
        status: 'closed',
        priority: isCorrective ? 'high' : 'medium',
        assetId: assets[i % 100].id,
        clientId: clients[i % 50].id,
        createdById: admin.id,
        assignedToId: techUsers[i % 20].id,
        scheduledDate: scheduledDate,
        startedAt: startDate,
        closedAt: closedDate,
        actualHours,
        laborCost,
        partsCost,
        totalCost: laborCost + partsCost,
      }
    })
  }

  console.log('✅ Seed completado con éxito (50 Clientes, 100 Activos, 20 Técnicos, 10 Proyectos con Gantt, 30 Preventivas).')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
