import type { Metadata } from 'next'
import Link from 'next/link'
import { createTechnician } from '@modules/M07_technicians/actions'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Nuevo Técnico — AgroMaint Pro' }

export default function NewTechnicianPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link href="/tecnicos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Técnicos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nuevo Técnico</h1>
      </div>
      <form action={createTechnician} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
          <input name="name" required placeholder="Carlos Gómez" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cédula / Documento</label>
            <input name="document" placeholder="1234567890" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nivel</label>
            <select name="level" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="junior">Junior</option>
              <option value="mid">Intermedio</option>
              <option value="senior">Senior</option>
              <option value="specialist">Especialista</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Posición</label>
          <input name="position" placeholder="Técnico de Campo CASE IH" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input name="phone" type="tel" placeholder="+57 310 000 0000" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input name="email" type="email" placeholder="tecnico@imecol.co" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Formación</label>
            <select name="educationLevel" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">Seleccionar...</option>
              <option value="Técnico">Técnico</option>
              <option value="Tecnólogo">Tecnólogo</option>
              <option value="Profesional">Profesional</option>
              <option value="Especialización">Especialización</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Especialidad(es) - JSON</label>
            <input name="specialty" defaultValue="[]" placeholder='["Mecánica", "Sistemas Hidráulicos"]' className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cursos Realizados (Formato JSON array)</label>
          <textarea name="courses" defaultValue="[]" placeholder='["Curso Avanzado Case IH", "Mantenimiento Hidráulico 101"]' className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Certificaciones Obtenidas (Formato JSON array)</label>
          <textarea name="certifications" defaultValue="[]" placeholder='["Certificación ISO 9001", "Certificado de Trabajo en Alturas"]' className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" rows={3} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">Guardar Técnico</button>
          <Link href="/tecnicos" className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
