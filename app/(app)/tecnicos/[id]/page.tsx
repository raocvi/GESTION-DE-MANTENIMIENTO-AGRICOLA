import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTechnicianById } from '@modules/M07_technicians/actions'
import { TechnicianDetailClient } from './_components/TechnicianDetailClient'

export const metadata: Metadata = { title: 'Detalle de Técnico — AgroMaint Pro' }

export default async function TechnicianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const tech = await getTechnicianById(resolvedParams.id)
  
  if (!tech) {
    notFound()
  }

  // Serialize all date fields to prevent Next.js Client Component serialization warnings
  const serializedTech = {
    id: tech.id,
    organizationId: tech.organizationId,
    userId: tech.userId,
    name: tech.name,
    internalCode: tech.internalCode || null,
    yearsOfExperience: tech.yearsOfExperience || 0,
    document: tech.document || null,
    position: tech.position || null,
    specialty: tech.specialty || '[]',
    level: tech.level || 'junior',
    educationLevel: tech.educationLevel || null,
    phone: tech.phone || null,
    email: tech.email || null,
    warehouseId: tech.warehouseId || null,
    vehicleId: tech.vehicleId || null,
    zones: tech.zones || '[]',
    availableHours: tech.availableHours || null,
    tools: tech.tools || '[]',
    certifications: tech.certifications || '[]',
    courses: tech.courses || '[]',
    isActive: tech.isActive,
    createdAt: tech.createdAt.toISOString(),
    updatedAt: tech.updatedAt.toISOString(),
    deletedAt: tech.deletedAt ? tech.deletedAt.toISOString() : null,
    
    tasks: (tech.tasks || []).map((task: any) => ({
      id: task.id,
      workOrderId: task.workOrderId,
      name: task.name,
      description: task.description || null,
      status: task.status,
      order: task.order,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      completedBy: task.completedBy || null,
      notes: task.notes || null,
      technicianId: task.technicianId || null,
      startDate: task.startDate ? task.startDate.toISOString() : null,
      endDate: task.endDate ? task.endDate.toISOString() : null,
      estimatedHours: task.estimatedHours || null,
      actualHours: task.actualHours || null,
      progress: task.progress || 0,
      system: task.system || null,
      component: task.component || null,
      createdAt: task.createdAt.toISOString(),
      
      workOrder: task.workOrder ? {
        id: task.workOrder.id,
        organizationId: task.workOrder.organizationId,
        number: task.workOrder.number,
        type: task.workOrder.type,
        priority: task.workOrder.priority,
        status: task.workOrder.status,
        assetId: task.workOrder.assetId || null,
        clientId: task.workOrder.clientId || null,
        title: task.workOrder.title,
        description: task.workOrder.description || null,
        scheduledDate: task.workOrder.scheduledDate ? task.workOrder.scheduledDate.toISOString() : null,
        dueDate: task.workOrder.dueDate ? task.workOrder.dueDate.toISOString() : null,
        startedAt: task.workOrder.startedAt ? task.workOrder.startedAt.toISOString() : null,
        closedAt: task.workOrder.closedAt ? task.workOrder.closedAt.toISOString() : null,
        createdAt: task.workOrder.createdAt.toISOString(),
        
        asset: task.workOrder.asset ? {
          id: task.workOrder.asset.id,
          internalCode: task.workOrder.asset.internalCode || null,
          name: task.workOrder.asset.name,
        } : null,
        
        client: task.workOrder.client ? {
          id: task.workOrder.client.id,
          name: task.workOrder.client.name,
        } : null,
      } : null
    }))
  }

  return (
    <TechnicianDetailClient tech={serializedTech} />
  )
}
