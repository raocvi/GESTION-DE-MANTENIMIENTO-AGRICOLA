import { notFound } from 'next/navigation'
import { Droplets, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { getAssetLubeDetail } from '@/modules/M12_lube_analyst/actions'
import { AssetLubeView } from './_components/AssetLubeView'

export const dynamic = 'force-dynamic'

export default async function AssetLubePage({
  params,
  searchParams
}: {
  params: Promise<{ assetId: string }>
  searchParams: Promise<{ component?: string }>
}) {
  const { assetId } = await params
  const { component } = await searchParams
  const detail = await getAssetLubeDetail(assetId)
  if (!detail) notFound()

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/lube-analyst" className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
          LubeAnalyst
        </Link>
        <span className="text-slate-200">/</span>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-600" />
          <span className="text-[14px] font-bold text-slate-700">{detail.assetCode} — {detail.assetName}</span>
          <span className="text-[12px] text-slate-400">· {detail.clientName}</span>
        </div>
      </div>
      <AssetLubeView detail={detail} expandedComponentType={component} />
    </div>
  )
}
