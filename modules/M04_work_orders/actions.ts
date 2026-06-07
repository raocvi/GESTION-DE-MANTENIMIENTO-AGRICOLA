'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getWorkOrders(search?: string) {
  return db.workOrder.findMany({
    where: {
      ...(search ? {
        OR: [
          { number: { contains: search } },
          { title: { contains: search } },
        ]
      } : {}),
    },
    include: {
      asset: { select: { internalCode: true, name: true } },
      client: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getWorkOrderById(id: string) {
  return db.workOrder.findUnique({
    where: { id },
    include: {
      asset: true,
      client: true,
      assignedTo: true,
      tasks: {
        orderBy: { order: 'asc' },
        include: {
          technician: true,
          parts: true,
          subtasks: {
            orderBy: { order: 'asc' }
          }
        }
      },
      partsUsed: true,
    },
  })
}

export async function createProjectActivity(data: {
  workOrderId: string,
  name: string,
  system?: string,
  component?: string,
  startDate?: Date,
  endDate?: Date,
  technicianId?: string
}) {
  const t = await db.workOrderTask.create({
    data: {
      ...data,
      status: 'pending',
      progress: 0,
    }
  })
  revalidatePath(`/proyectos/${data.workOrderId}`)
  return t
}

export async function createProjectSubtask(data: { taskId: string, name: string }) {
  const task = await db.workOrderTask.findUnique({ where: { id: data.taskId } })
  if (!task) throw new Error('Task not found')
  const t = await db.workOrderSubtask.create({
    data
  })
  revalidatePath(`/proyectos/${task.workOrderId}`)
  return t
}

export async function toggleProjectSubtask(id: string, isCompleted: boolean) {
  const subtask = await db.workOrderSubtask.update({
    where: { id },
    data: { isCompleted },
    include: { task: true }
  })
  revalidatePath(`/proyectos/${subtask.task.workOrderId}`)
  return subtask
}

export async function updateTaskProgress(taskId: string, progress: number, startDate?: Date, endDate?: Date) {
  await db.workOrderTask.update({
    where: { id: taskId },
    data: {
      progress,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(progress === 100 && { status: 'completed' })
    }
  })
  revalidatePath('/proyectos')
  revalidatePath('/ordenes')
}

export async function updateTaskDetails(taskId: string, data: {
  name?: string
  progress?: number
  startDate?: Date | null
  endDate?: Date | null
  technicianId?: string | null
  status?: string
  estimatedHours?: number | null
  notes?: string | null
}) {
  const task = await db.workOrderTask.update({
    where: { id: taskId },
    data: {
      name: data.name,
      progress: data.progress,
      startDate: data.startDate,
      endDate: data.endDate,
      technicianId: data.technicianId,
      status: data.status,
      estimatedHours: data.estimatedHours,
      notes: data.notes,
      ...(data.progress === 100 ? { status: 'completed' } : {})
    }
  })
  revalidatePath(`/proyectos/${task.workOrderId}`)
  revalidatePath('/proyectos')
  revalidatePath('/ordenes')
  return task
}

export async function createWorkOrder(formData: FormData) {
  const org = await db.organization.findFirst()
  if (!org) throw new Error('No hay organización')

  const user = await db.user.findFirst()
  if (!user) throw new Error('No hay usuarios creados')

  const clientId = formData.get('clientId') as string || undefined
  const assetId = formData.get('assetId') as string || undefined
  const technicianId = formData.get('technicianId') as string || undefined

  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  const number = `OT-${yy}${mm}${dd}-${rand}`

  const wo = await db.workOrder.create({
    data: {
      organizationId: org.id,
      number,
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      type: formData.get('type') as string || 'corrective',
      priority: formData.get('priority') as string || 'medium',
      status: 'new',
      clientId,
      assetId,
      createdById: user.id,
      assignedToId: technicianId,
    },
  })
  revalidatePath('/ordenes')
  redirect(`/ordenes/${wo.id}`)
}

export async function updateWorkOrderStatus(id: string, status: string) {
  await db.workOrder.update({
    where: { id },
    data: { status }
  })
  revalidatePath(`/ordenes/${id}`)
  revalidatePath('/ordenes')
}

export async function getAssetsClientsTechnicians() {
  const [assets, clients, technicians] = await Promise.all([
    db.asset.findMany({ where: { isActive: true }, select: { id: true, internalCode: true, name: true } }),
    db.client.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    db.user.findMany({ where: { isActive: true }, select: { id: true, name: true } })
  ])
  return { assets, clients, technicians }
}
