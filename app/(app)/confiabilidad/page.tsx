import { Activity } from 'lucide-react'
import { PageHeader } from '@core/components/shared/PageComponents'
import {
  getReliabilityKpis,
  getMachineFailureRanking,
  getSystemFailureRanking,
  getPartFailureRanking,
  getCompanyComparison,
  getRepairStandards,
  getUpcomingMaintenance,
} from '@/modules/M11_reliability/actions'
import { ReliabilityDashboard } from './_components/ReliabilityDashboard'

export const metadata = { title: 'Confiabilidad' }
export const dynamic = 'force-dynamic'

/**
 * Página de Confiabilidad y Análisis de Fallas.
 * Calcula todos los indicadores en el servidor (RSC) y los pasa
 * serializados al dashboard interactivo del cliente.
 */
export default async function ConfiabilidadPage() {
  const [kpis, machines, systems, parts, companies, stdBrand, stdCategory, upcoming] =
    await Promise.all([
      getReliabilityKpis(),
      getMachineFailureRanking(15),
      getSystemFailureRanking(),
      getPartFailureRanking(12),
      getCompanyComparison(),
      getRepairStandards('brand'),
      getRepairStandards('category'),
      getUpcomingMaintenance(20),
    ])

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={<Activity className="h-5 w-5" />}
        title="Confiabilidad y Análisis de Fallas"
        description="MTBF · MTTR · Disponibilidad · Frecuencia de falla · Estándares de reparación · Comparativos entre empresas"
        breadcrumb={[{ label: 'Análisis' }, { label: 'Confiabilidad' }]}
      />
      <ReliabilityDashboard
        kpis={kpis}
        machines={machines}
        systems={systems}
        parts={parts}
        companies={companies}
        stdBrand={stdBrand}
        stdCategory={stdCategory}
        upcoming={upcoming}
      />
    </div>
  )
}
