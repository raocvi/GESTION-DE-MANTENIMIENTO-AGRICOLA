'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getTechnicians() {
  return db.technician.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      tasks: {
        include: { workOrder: { include: { asset: true, client: true } } }
      }
    }
  })
}

export async function getTechnicianById(id: string) {
  const tech = await db.technician.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { workOrder: { include: { asset: true, client: true } } }
      }
    }
  })
  if (!tech) return null
  return tech
}

function parseTextListToJSON(val: string | null | undefined): string {
  if (!val) return '[]'
  const trimmed = val.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      JSON.parse(trimmed)
      return trimmed
    } catch {
      // If it fails to parse, treat it as normal text split by comma
    }
  }
  const list = trimmed.split(',').map(s => s.trim()).filter(Boolean)
  return JSON.stringify(list)
}

export async function createTechnician(formData: FormData) {
  const org = await db.organization.findFirst()
  if (!org) throw new Error('No hay organización')
  
  const yearsVal = parseInt(formData.get('yearsOfExperience') as string) || 0

  const tech = await db.technician.create({
    data: {
      organizationId: org.id,
      name: formData.get('name') as string,
      internalCode: formData.get('internalCode') as string || undefined,
      yearsOfExperience: yearsVal,
      document: formData.get('document') as string || undefined,
      position: formData.get('position') as string || undefined,
      level: formData.get('level') as string || 'junior',
      educationLevel: formData.get('educationLevel') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      email: formData.get('email') as string || undefined,
      specialty: parseTextListToJSON(formData.get('specialty') as string),
      courses: parseTextListToJSON(formData.get('courses') as string),
      certifications: parseTextListToJSON(formData.get('certifications') as string),
    },
  })
  revalidatePath('/tecnicos')
  redirect(`/tecnicos/${tech.id}`)
}

export async function updateTechnician(id: string, formData: FormData) {
  const yearsVal = parseInt(formData.get('yearsOfExperience') as string) || 0

  await db.technician.update({
    where: { id },
    data: {
      name: formData.get('name') as string,
      internalCode: formData.get('internalCode') as string || undefined,
      yearsOfExperience: yearsVal,
      document: formData.get('document') as string || undefined,
      position: formData.get('position') as string || undefined,
      level: formData.get('level') as string || 'junior',
      educationLevel: formData.get('educationLevel') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      email: formData.get('email') as string || undefined,
      specialty: parseTextListToJSON(formData.get('specialty') as string),
      courses: parseTextListToJSON(formData.get('courses') as string),
      certifications: parseTextListToJSON(formData.get('certifications') as string),
    },
  })
  revalidatePath(`/tecnicos/${id}`)
  revalidatePath('/tecnicos')
}
