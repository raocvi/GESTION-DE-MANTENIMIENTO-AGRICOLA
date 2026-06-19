import type { Metadata } from 'next'
import { FlaskConical } from 'lucide-react'
import { getLabSyncStatus } from '@modules/M12_lube_analyst/labSyncActions'
import { LabConfigView } from './_components/LabConfigView'

export const metadata: Metadata = { title: 'Laboratorio de Aceite — AgroMaint Pro' }
export const dynamic = 'force-dynamic'

export default async function LabConfigPage() {
  const status = await getLabSyncStatus()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <FlaskConical className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Integración Laboratorio</h1>
        </div>
        <p className="text-sm text-slate-500 ml-13">
          Sincronización de resultados de análisis de aceite desde API externa
        </p>
      </div>

      <LabConfigView status={status} />
    </div>
  )
}
