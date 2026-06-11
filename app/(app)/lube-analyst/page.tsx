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
} from '@/modules/M12_lube_analyst/actions'
import { LubeDashboard } from './_components/LubeDashboard'

export const metadata = { title: 'LubeAnalyst — Análisis de Aceite' }
export const dynamic = 'force-dynamic'

export default async function LubeAnalystPage() {
  const [kpis, topRisk, clientHealth, systemBreakdown, criticalSummary, assets, analysisData] = await Promise.all([
    getLubeKpis(),
    getTopRiskComponents(12),
    getClientHealthComparison(),
    getSystemBreakdown(),
    getCriticalDiagnosesSummary(),
    getAssetsWithLubeStatus(),
    getFleetAnalysisData(),
  ])

  return (
    <div className="animate-fade-in">
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
      />
    </div>
  )
}
