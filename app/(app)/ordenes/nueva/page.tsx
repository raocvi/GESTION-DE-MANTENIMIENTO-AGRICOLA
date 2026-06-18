import type { Metadata } from 'next'
import { getAssetsClientsTechnicians } from '@modules/M04_work_orders/actions'
import { getServiceCatalog } from '@modules/M05_catalog/actions'
import { NewWorkOrderForm } from './_components/NewWorkOrderForm'

export const metadata: Metadata = { title: 'Nueva Orden de Trabajo — AgroMaint Pro' }

export default async function NewWorkOrderPage({ searchParams }: { searchParams: Promise<{ type?: string; title?: string; assetId?: string }> }) {
  const [{ assets, clients, technicians }, catalog, { type, title, assetId }] = await Promise.all([
    getAssetsClientsTechnicians(),
    getServiceCatalog(),
    searchParams,
  ])

  return (
    <NewWorkOrderForm
      assets={assets}
      clients={clients}
      technicians={technicians}
      catalog={catalog}
      defaultAssetId={assetId}
      defaultType={type}
      defaultTitle={title}
    />
  )
}
