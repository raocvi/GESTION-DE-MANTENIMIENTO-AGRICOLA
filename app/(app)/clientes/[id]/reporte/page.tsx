import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { getClientReport } from '@modules/M06_clients/reportActions'
import { ClientReportDashboard } from './_components/ClientReportDashboard'

export const metadata: Metadata = { title: 'Reporte de Cliente — AgroMaint Pro' }

export default async function ClientReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getClientReport(id)
  if (!data) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/clientes/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al cliente
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reporte de Gestión</h1>
            <p className="text-sm text-slate-500">{data.client.name}</p>
          </div>
        </div>
      </div>

      <ClientReportDashboard data={data} />
    </div>
  )
}
