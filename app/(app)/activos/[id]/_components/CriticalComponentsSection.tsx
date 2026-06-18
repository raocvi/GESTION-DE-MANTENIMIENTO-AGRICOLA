'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Cog, RotateCw, Droplets, Gauge, Zap, Wrench,
  CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react'
import { ComponentDetailModal } from './ComponentDetailModal'

type LubeComp = {
  id: string; componentType: string; name: string; status: string
  recommendedOil: string | null; changeIntervalHours: number | null
  lastChangeHours: number | null; lastSampleDate: Date | string | null
  oilCapacityL: number | null
}

interface Props {
  components: LubeComp[]
  assetId: string
  assetName: string
}

function CompIcon({ type, cls = 'h-5 w-5' }: { type: string; cls?: string }) {
  if (type === 'motor')        return <Cog className={cls} />
  if (type === 'transmission') return <RotateCw className={cls} />
  if (type === 'hydraulic')    return <Droplets className={cls} />
  if (type === 'differential') return <Zap className={cls} />
  if (type === 'final_drive')  return <Gauge className={cls} />
  return <Wrench className={cls} />
}

const COMP_LABEL: Record<string, string> = {
  motor: 'Motor', transmission: 'Transmisión', hydraulic: 'Hidráulico',
  differential: 'Diferencial', final_drive: 'Mandos Finales',
  brake_wet: 'Frenos Húmedos', reducer: 'Reductor',
}

const COMP_IMAGES: Record<string, string> = {
  a9900_motor: '/equipment-images/a9900_motor.png',
}

const STATUS_STYLE: Record<string, string> = {
  normal:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  caution:   'bg-amber-50 text-amber-700 border-amber-200',
  critical:  'bg-rose-50 text-rose-700 border-rose-200',
  condemned: 'bg-violet-50 text-violet-700 border-violet-200',
}
const STATUS_LABEL: Record<string, string> = {
  normal: 'Normal', caution: 'Precaución', critical: 'Crítico', condemned: 'Condenado',
}

function StatusIcon({ s }: { s: string }) {
  if (s === 'normal') return <CheckCircle className="h-4 w-4 text-emerald-500" />
  if (s === 'condemned') return <XCircle className="h-4 w-4 text-violet-500" />
  if (s === 'critical') return <XCircle className="h-4 w-4 text-rose-500" />
  return <AlertTriangle className="h-4 w-4 text-amber-500" />
}

export function CriticalComponentsSection({ components, assetId, assetName }: Props) {
  const [selected, setSelected] = useState<LubeComp | null>(null)

  const aName = assetName.toUpperCase()
  const assetKey = aName.includes('A9900') || aName.includes('COSECHADORA') ? 'a9900'
    : aName.includes('PUMA') ? 'puma' : null

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-slate-500" /> Componentes Críticos
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Doble-click para ficha técnica</span>
            <Link href={`/lube-analyst/${assetId}`} className="text-sm text-blue-600 hover:underline">
              Ver análisis de aceite
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {components.map(comp => {
            const cs = STATUS_STYLE[comp.status] ?? STATUS_STYLE.normal
            const imgSrc = assetKey ? (COMP_IMAGES[`${assetKey}_${comp.componentType}`] ?? null) : null
            return (
              <div
                key={comp.id}
                className="p-4 flex gap-3 cursor-pointer select-none hover:bg-slate-50 transition-colors rounded-xl"
                onDoubleClick={() => setSelected(comp)}
                title="Doble-click para ver ficha técnica completa"
              >
                {imgSrc ? (
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <Image src={imgSrc} alt={COMP_LABEL[comp.componentType] ?? comp.componentType} fill className="object-contain p-1" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                    <CompIcon type={comp.componentType} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusIcon s={comp.status} />
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {COMP_LABEL[comp.componentType] ?? comp.componentType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1">{comp.name}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${cs}`}>
                    {STATUS_LABEL[comp.status] ?? comp.status}
                  </span>
                  {comp.recommendedOil && (
                    <p className="text-[10px] text-slate-400 mt-1 truncate">{comp.recommendedOil}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <ComponentDetailModal
          component={selected}
          assetId={assetId}
          assetName={assetName}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
