/**
 * @file M04_work_orders/actions.ts
 * @module M04_WorkOrders
 * @description Server Actions del módulo central de Órdenes de Trabajo.
 *
 * Este módulo gestiona:
 * - Órdenes de Trabajo (CRUD + cambio de estado)
 * - Proyectos de reparación mayor (OTs correctivas con tareas Gantt)
 * - Actividades del Gantt (WorkOrderTask)
 * - Subtareas / checklist de actividades (WorkOrderSubtask)
 *
 * Todas las funciones son Server Actions (ejecutadas en el servidor).
 * Las mutaciones invalidan la caché de Next.js con revalidatePath().
 *
 * Formato de número de OT: OT-{YYMMDD}-{4 dígitos aleatorios}
 * Ejemplo: OT-260607-4823
 */

'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── CONSULTAS ───────────────────────────────────────────────────────────────

/**
 * Retorna todas las órdenes de trabajo activas, con activo, cliente y técnico asignado.
 * Opcionalmente filtra por número o título (búsqueda simple).
 *
 * @param search - Texto a buscar en number o title (opcional)
 */
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

/**
 * Retorna el detalle completo de una orden de trabajo por su ID.
 * Incluye activo, cliente, técnico asignado, tareas con subtareas,
 * repuestos usados y partes relacionadas.
 *
 * Usado por: página de detalle de OT, página de detalle de proyecto (Gantt).
 *
 * @param id - ID único de la orden de trabajo
 */
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
          subtasks: { orderBy: { order: 'asc' } }
        }
      },
      partsUsed: true,
    },
  })
}

/**
 * Retorna activos, clientes y técnicos activos para usar en dropdowns
 * al crear o editar una orden de trabajo.
 *
 * Ejecuta las 3 consultas en paralelo con Promise.all.
 */
export async function getAssetsClientsTechnicians() {
  const [assets, clients, technicians] = await Promise.all([
    db.asset.findMany({ where: { isActive: true }, select: { id: true, internalCode: true, name: true } }),
    db.client.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    db.user.findMany({ where: { isActive: true }, select: { id: true, name: true } })
  ])
  return { assets, clients, technicians }
}

// ─── CREACIÓN DE ÓRDENES ─────────────────────────────────────────────────────

/**
 * Crea una nueva Orden de Trabajo desde un FormData (enviado por formulario HTML).
 * Genera automáticamente el número con formato OT-{YYMMDD}-{RAND4}.
 * Redirige a la página de detalle de la OT creada.
 *
 * Campos del FormData:
 * - title (requerido): título descriptivo
 * - type: tipo de OT (preventive|corrective|inspection|...) — default: 'corrective'
 * - priority: prioridad (low|medium|high|critical|...) — default: 'medium'
 * - clientId: ID del cliente (opcional)
 * - assetId: ID del activo/equipo (opcional)
 * - technicianId: ID del usuario técnico asignado (opcional)
 * - description: descripción del problema (opcional)
 */
export async function createWorkOrder(formData: FormData) {
  const org = await db.organization.findFirst()
  if (!org) throw new Error('No hay organización')

  const user = await db.user.findFirst()
  if (!user) throw new Error('No hay usuarios creados')

  const clientId    = formData.get('clientId') as string || undefined
  const assetId     = formData.get('assetId') as string || undefined
  const technicianId = formData.get('technicianId') as string || undefined

  // Generar número único de OT
  const date = new Date()
  const yy   = date.getFullYear().toString().slice(-2)
  const mm   = String(date.getMonth() + 1).padStart(2, '0')
  const dd   = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  const number = `OT-${yy}${mm}${dd}-${rand}`

  const wo = await db.workOrder.create({
    data: {
      organizationId: org.id,
      number,
      title:       formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      type:        formData.get('type') as string || 'corrective',
      priority:    formData.get('priority') as string || 'medium',
      status:      'new',
      clientId,
      assetId,
      createdById:  user.id,
      assignedToId: technicianId,
    },
  })
  revalidatePath('/ordenes')
  redirect(`/ordenes/${wo.id}`)
}

/**
 * Cambia el estado de una Orden de Trabajo.
 * No valida las transiciones de estado — solo actualiza el campo.
 *
 * Estados válidos: new|requested|approved|scheduled|assigned|en_route|
 *   in_progress|paused|pending_parts|pending_approval|pending_client|
 *   completed_by_tech|in_review|closed|cancelled|reopened
 *
 * @param id     - ID de la orden de trabajo
 * @param status - Nuevo estado
 */
export async function updateWorkOrderStatus(id: string, status: string) {
  await db.workOrder.update({
    where: { id },
    data: { status }
  })
  revalidatePath(`/ordenes/${id}`)
  revalidatePath('/ordenes')
}

// ─── ACTIVIDADES DEL GANTT (WorkOrderTask) ───────────────────────────────────

/**
 * Crea una nueva actividad (tarea) para un proyecto/OT correctivo.
 * Las actividades son las barras visibles en el diagrama de Gantt.
 *
 * Se inicia con progress=0 y status='pending'.
 * Invalida la caché de la página del proyecto.
 *
 * @param data.workOrderId  - ID de la orden de trabajo padre
 * @param data.name         - Nombre de la actividad
 * @param data.system       - Sistema de la máquina (ej: "Sistema Motor")
 * @param data.component    - Componente específico (ej: "Bomba hidráulica")
 * @param data.startDate    - Fecha de inicio planeada (opcional)
 * @param data.endDate      - Fecha de fin planeada (opcional)
 * @param data.technicianId - ID del técnico responsable (opcional)
 */
export async function createProjectActivity(data: {
  workOrderId: string
  name: string
  system?: string
  component?: string
  startDate?: Date
  endDate?: Date
  technicianId?: string
}) {
  const t = await db.workOrderTask.create({
    data: { ...data, status: 'pending', progress: 0 }
  })
  revalidatePath(`/proyectos/${data.workOrderId}`)
  return t
}

/**
 * Actualiza el progreso de una actividad del Gantt (0-100).
 * Si progress === 100, cambia el status a 'completed' automáticamente.
 * Acepta opcionalmente nuevas fechas de inicio y fin.
 *
 * @param taskId    - ID de la tarea (WorkOrderTask)
 * @param progress  - Porcentaje de avance (0-100)
 * @param startDate - Nueva fecha de inicio (opcional)
 * @param endDate   - Nueva fecha de fin (opcional)
 */
export async function updateTaskProgress(
  taskId: string,
  progress: number,
  startDate?: Date,
  endDate?: Date
) {
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

/**
 * Actualiza todos los campos editables de una actividad del Gantt.
 * Llamado desde el modal de edición del InteractiveGantt.
 *
 * Si progress === 100 fuerza status='completed'.
 * Invalida la caché del proyecto, la lista de proyectos y la lista de órdenes.
 *
 * @param taskId - ID de la tarea a actualizar
 * @param data   - Campos a actualizar (todos opcionales)
 */
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
      name:           data.name,
      progress:       data.progress,
      startDate:      data.startDate,
      endDate:        data.endDate,
      technicianId:   data.technicianId,
      status:         data.status,
      estimatedHours: data.estimatedHours,
      notes:          data.notes,
      // Si progress llega a 100, marcar como completado independientemente del status enviado
      ...(data.progress === 100 ? { status: 'completed' } : {})
    }
  })
  revalidatePath(`/proyectos/${task.workOrderId}`)
  revalidatePath('/proyectos')
  revalidatePath('/ordenes')
  return task
}

// ─── SUBTAREAS DEL GANTT (WorkOrderSubtask) ──────────────────────────────────

/**
 * Crea una nueva subtarea dentro de una actividad del Gantt.
 * Las subtareas son los ítems de checklist expandibles en el panel izquierdo.
 *
 * Si todas las subtareas de una tarea se completan, el componente cliente
 * actualiza el progreso de la tarea automáticamente (sin llamar al servidor).
 *
 * @param data.taskId - ID de la tarea padre (WorkOrderTask)
 * @param data.name   - Nombre de la subtarea
 */
export async function createProjectSubtask(data: { taskId: string; name: string }) {
  const task = await db.workOrderTask.findUnique({ where: { id: data.taskId } })
  if (!task) throw new Error('Task not found')
  const t = await db.workOrderSubtask.create({ data })
  revalidatePath(`/proyectos/${task.workOrderId}`)
  return t
}

/**
 * Alterna el estado completado de una subtarea.
 * Luego del toggle, el componente cliente recalcula el progreso de la tarea padre.
 *
 * @param id          - ID de la subtarea
 * @param isCompleted - Nuevo estado (true = completada)
 */
export async function toggleProjectSubtask(id: string, isCompleted: boolean) {
  const subtask = await db.workOrderSubtask.update({
    where: { id },
    data: { isCompleted },
    include: { task: true }
  })
  revalidatePath(`/proyectos/${subtask.task.workOrderId}`)
  return subtask
}
