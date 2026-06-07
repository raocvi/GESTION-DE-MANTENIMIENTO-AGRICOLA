import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando corrección y enriquecimiento de fechas demo en la base de datos...")
  
  const orders = await prisma.workOrder.findMany()
  console.log(`Se encontraron ${orders.length} órdenes de trabajo.`);

  let updatedCount = 0
  for (const o of orders) {
    const updateData: any = {}
    
    // Si no tiene scheduledDate, asignarle la fecha de creación
    if (!o.scheduledDate) {
      updateData.scheduledDate = o.createdAt
    }

    // Si no tiene dueDate, asignarle 2 días después de la fecha programada
    if (!o.dueDate) {
      const baseDate = o.scheduledDate || o.createdAt
      const due = new Date(baseDate)
      due.setDate(due.getDate() + 2)
      updateData.dueDate = due
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.workOrder.update({
        where: { id: o.id },
        data: updateData
      })
      updatedCount++
    }
  }
  
  console.log(`Se completó la primera fase. ${updatedCount} órdenes actualizadas con fechas básicas.`);

  // Segunda fase: Enriquecer órdenes históricas (status: closed) para simular retrasos
  const closedOrders = await prisma.workOrder.findMany({
    where: { status: 'closed' }
  })
  
  let delayedCount = 0
  for (let i = 0; i < closedOrders.length; i++) {
    const o = closedOrders[i]
    if (o.dueDate && o.closedAt) {
      // 40% de probabilidad de simular un retraso en órdenes cerradas
      if (Math.random() < 0.4) {
        const closedDate = new Date(o.closedAt)
        const newDue = new Date(closedDate)
        // La fecha límite fue de 1 a 5 días antes de cerrarse
        newDue.setDate(closedDate.getDate() - (Math.floor(Math.random() * 5) + 1))
        
        await prisma.workOrder.update({
          where: { id: o.id },
          data: { dueDate: newDue }
        })
        delayedCount++
      }
    }
  }

  // Tercera fase: Asignar prioridades de forma variada y añadir estados "critical"
  const activeOrders = await prisma.workOrder.findMany({
    where: { 
      status: { notIn: ['closed', 'completed'] } 
    }
  })

  let activeUpdated = 0
  for (const o of activeOrders) {
    // 15% de probabilidad de tener prioridad crítica
    if (Math.random() < 0.15) {
      await prisma.workOrder.update({
        where: { id: o.id },
        data: { priority: 'critical' }
      })
      activeUpdated++
    }
  }

  console.log(`Fase dos completada: ${delayedCount} órdenes cerradas ahora simulan retrasos operativos.`);
  console.log(`Fase tres completada: ${activeUpdated} órdenes activas configuradas con prioridad CRÍTICA.`);
  console.log("¡Enriquecimiento de datos demo completado exitosamente! 🚀");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar el script:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
