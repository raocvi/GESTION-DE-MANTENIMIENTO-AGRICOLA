import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { getServiceCatalog } from '@modules/M05_catalog/actions'
import { CatalogManager } from './_components/CatalogManager'

export const metadata: Metadata = { title: 'Catálogo de Servicios — AgroMaint Pro' }

export default async function CatalogoPage() {
  const catalog = await getServiceCatalog()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/configuracion" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Configuración
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Catálogo de Servicios</h1>
            <p className="text-sm text-slate-500">Gestiona los componentes y tipos de servicio disponibles al crear órdenes de trabajo</p>
          </div>
        </div>
      </div>

      <CatalogManager catalog={catalog} />
    </div>
  )
}
