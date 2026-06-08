import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTechnicianById, updateTechnician } from '@modules/M07_technicians/actions'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Editar Técnico — AgroMaint Pro' }

export default async function EditTechnicianPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const tech = await getTechnicianById(resolvedParams.id)
  if (!tech) notFound()

  // Convert JSON arrays back to comma-separated text strings for editing
  let specialtyText = ''
  let coursesText = ''
  let certificationsText = ''

  try {
    specialtyText = JSON.parse(tech.specialty || '[]').join(', ')
  } catch {}
  try {
    coursesText = JSON.parse(tech.courses || '[]').join(', ')
  } catch {}
  try {
    certificationsText = JSON.parse(tech.certifications || '[]').join(', ')
  } catch {}

  const updateAction = updateTechnician.bind(null, tech.id)

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link href={`/tecnicos/${tech.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Cancelar
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Editar Técnico</h1>
        <p className="text-sm text-slate-500">Actualizar datos de {tech.name}</p>
      </div>

      <form action={updateAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo (Persona Real) *</label>
            <input name="name" required defaultValue={tech.name} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código de Técnico Interno</label>
            <input name="internalCode" defaultValue={tech.internalCode || ''} placeholder="TECH-045" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cédula / Documento</label>
            <input name="document" defaultValue={tech.document || ''} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nivel</label>
            <select name="level" defaultValue={tech.level || 'junior'} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="junior">Junior</option>
              <option value="mid">Intermedio</option>
              <option value="senior">Senior</option>
              <option value="specialist">Especialista</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Posición</label>
            <input name="position" defaultValue={tech.position || ''} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Años de Experiencia</label>
            <input name="yearsOfExperience" type="number" defaultValue={tech.yearsOfExperience || 0} min="0" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input name="phone" type="tel" defaultValue={tech.phone || ''} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input name="email" type="email" defaultValue={tech.email || ''} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Formación</label>
            <select name="educationLevel" defaultValue={tech.educationLevel || ''} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Seleccionar...</option>
              <option value="Técnico">Técnico</option>
              <option value="Tecnólogo">Tecnólogo</option>
              <option value="Profesional">Profesional</option>
              <option value="Especialización">Especialización</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Especialidad(es) (Separadas por comas)</label>
            <input name="specialty" defaultValue={specialtyText} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cursos Realizados (Separados por comas)</label>
          <textarea name="courses" defaultValue={coursesText} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" rows={2} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Certificaciones Obtenidas (Separadas por comas)</label>
          <textarea name="certifications" defaultValue={certificationsText} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" rows={2} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Guardar Cambios</button>
          <Link href={`/tecnicos/${tech.id}`} className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
