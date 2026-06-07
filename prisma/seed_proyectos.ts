import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const SYSTEMS = [
  { name: 'Sistema Motor', components: ['Motor Diésel', 'Sistema de Inyección', 'Sistema de Refrigeración', 'Admisión/Escape'] },
  { name: 'Sistema Hidráulico', components: ['Bombas Hidráulicas', 'Motores Hidráulicos', 'Bloques de Válvulas', 'Cilindros', 'Tanque', 'Filtros y Mangueras'] },
  { name: 'Sistema de Transmisión / Rodaje', components: ['Orugas / Llantas', 'Mandos Finales', 'Motores de Traslación', 'Cajas de Engranajes'] },
  { name: 'Sistema Eléctrico / Electrónico', components: ['Baterías', 'Alternador', 'Mazo de Cables', 'Sensores', 'Módulos Electrónicos', 'Iluminación'] },
  { name: 'Sistema de Corte Base', components: ['Discos de Corte Base', 'Motores de Corte', 'Caja de Transmisión del Corte Base'] },
  { name: 'Sistema de Alimentación', components: ['Rolos Alimentadores', 'Motores de Alimentación'] },
  { name: 'Sistema de Troceado', components: ['Tambores Troceadores (Chopper)', 'Cuchillas', 'Volante', 'Motores del Troceador'] },
  { name: 'Sistema de Extracción', components: ['Extractor Primario', 'Extractor Secundario', 'Ventiladores', 'Motores de Extracción'] },
  { name: 'Sistema de Elevación', components: ['Cadena del Elevador', 'Tablillas/Paletas', 'Motor del Elevador'] },
  { name: 'Cabina y Estructura', components: ['Controles', 'Aire Acondicionado', 'Chasis', 'Paneles'] }
]

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('Iniciando carga de datos de proyectos demo...')

  const org = await prisma.organization.findFirst()
  if (!org) throw new Error('No hay organización')

  const user = await prisma.user.findFirst()
  if (!user) throw new Error('No hay usuarios creados')

  const clients = await prisma.client.findMany()
  const assets = await prisma.asset.findMany()
  const technicians = await prisma.technician.findMany()

  if (clients.length === 0 || assets.length === 0 || technicians.length === 0) {
    console.log('Asegúrate de tener clientes, activos y técnicos en la BD antes de correr este script.')
    return
  }

  // Generar 15 proyectos
  for (let i = 1; i <= 15; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)]
    const asset = assets[Math.floor(Math.random() * assets.length)]
    const tech = technicians[Math.floor(Math.random() * technicians.length)]
    
    const now = new Date()
    const scheduledDate = new Date()
    scheduledDate.setDate(now.getDate() - Math.floor(Math.random() * 30))
    const dueDate = new Date(scheduledDate)
    dueDate.setDate(dueDate.getDate() + 15 + Math.floor(Math.random() * 30))

    const isCompleted = Math.random() > 0.7

    const project = await prisma.workOrder.create({
      data: {
        organizationId: org.id,
        number: `PRJ-2026-${String(i).padStart(3, '0')}`,
        title: `Mantenimiento Mayor o Reparación A9900 #${i}`,
        description: `Proyecto de reparación y overhauling generado automáticamente.`,
        type: 'corrective',
        priority: Math.random() > 0.5 ? 'high' : 'medium',
        status: isCompleted ? 'completed' : 'in_progress',
        clientId: client.id,
        assetId: asset.id,
        createdById: user.id,
        assignedToId: tech.userId, // use userId because assignedTo references User, not Technician
        scheduledDate,
        dueDate,
      }
    })

    // Generar de 5 a 15 actividades por proyecto
    const numActivities = Math.floor(Math.random() * 11) + 5
    for (let j = 0; j < numActivities; j++) {
      const sys = SYSTEMS[Math.floor(Math.random() * SYSTEMS.length)]
      const comp = sys.components[Math.floor(Math.random() * sys.components.length)]
      const activityTech = technicians[Math.floor(Math.random() * technicians.length)]

      const actStart = getRandomDate(scheduledDate, new Date(scheduledDate.getTime() + (dueDate.getTime() - scheduledDate.getTime()) / 2))
      const actEnd = getRandomDate(actStart, dueDate)

      const progress = isCompleted ? 100 : Math.floor(Math.random() * 100)
      const estimatedHours = Math.floor(Math.random() * 20) + 4
      const actualHours = progress > 0 ? (estimatedHours * (progress / 100)) + (Math.random() * 5) : 0

      const task = await prisma.workOrderTask.create({
        data: {
          workOrderId: project.id,
          name: `Revisión/Reparación de ${comp}`,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending',
          order: j,
          technicianId: activityTech.id,
          startDate: actStart,
          endDate: actEnd,
          estimatedHours,
          actualHours: parseFloat(actualHours.toFixed(1)),
          progress,
          system: sys.name,
          component: comp,
        }
      })

      // Generar sub-tareas
      const numSubtasks = Math.floor(Math.random() * 4) + 2
      for (let k = 0; k < numSubtasks; k++) {
        await prisma.workOrderSubtask.create({
          data: {
            taskId: task.id,
            name: `Sub-tarea ${k + 1} para ${comp}`,
            isCompleted: progress === 100 || Math.random() > 0.5,
            order: k
          }
        })
      }
    }
  }

  console.log('✅ Datos de proyectos demo generados exitosamente.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
