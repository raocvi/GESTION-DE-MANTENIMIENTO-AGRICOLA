import { Droplets } from 'lucide-react'
import { PageHeader } from '@core/components/shared/PageComponents'
import {
  getLubeKpis,
  getTopRiskComponents,
  getClientHealthComparison,
  getSystemBreakdown,
  getCriticalDiagnosesSummary,
  getAssetsWithLubeStatus,
  getFleetAnalysisData,
  getFaultFrequency,
} from '@/modules/M12_lube_analyst/actions'
import { db } from '@core/lib/db'
import { LubeDashboard } from './_components/LubeDashboard'
import { FleetConsolidationView } from './_components/FleetConsolidationView'

export const metadata = { title: 'LubeAnalyst — Análisis de Aceite' }
export const dynamic = 'force-dynamic'

export default async function LubeAnalystPage() {
  const org = await db.organization.findFirst({ where: { slug: 'imecol' } })
  const orgId = org?.id ?? ''

  const [kpis, topRisk, clientHealth, systemBreakdown, criticalSummary, assets, analysisData,
    faultMotor, faultTransmission, faultHydraulic, faultDiff, faultFinalDrive, clients,
  ] = await Promise.all([
    getLubeKpis(),
    getTopRiskComponents(12),
    getClientHealthComparison(),
    getSystemBreakdown(),
    getCriticalDiagnosesSummary(),
    getAssetsWithLubeStatus(),
    getFleetAnalysisData(),
    getFaultFrequency('motor'),
    getFaultFrequency('transmission'),
    getFaultFrequency('hydraulic'),
    getFaultFrequency('differential'),
    getFaultFrequency('final_drive'),
    db.client.findMany({ where: { organizationId: orgId, isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])
  const faultFrequency = { motor: faultMotor, transmission: faultTransmission, hydraulic: faultHydraulic, differential: faultDiff, final_drive: faultFinalDrive }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        icon={<Droplets className="h-5 w-5" />}
        title="LubeAnalyst"
        description="Análisis predictivo de aceite · Monitoreo de desgaste y contaminación · Diagnóstico de flota"
        breadcrumb={[{ label: 'Análisis' }, { label: 'LubeAnalyst' }]}
      />
      <LubeDashboard
        kpis={kpis}
        topRisk={topRisk}
        clientHealth={clientHealth}
        systemBreakdown={systemBreakdown}
        criticalSummary={criticalSummary}
        assets={assets}
        analysisData={analysisData}
        faultFrequency={faultFrequency}
      />

      {/* Fleet Consolidation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-[15px] font-bold text-slate-800">Consolidado de Flota — LubriCheck Pro</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">Análisis estadístico por variable para toda la flota o empresa seleccionada. Scatter con límites condenatorios y línea de tendencia.</p>
        </div>
        <FleetConsolidationView clients={clients} />
      </div>
    </div>
  )
}
