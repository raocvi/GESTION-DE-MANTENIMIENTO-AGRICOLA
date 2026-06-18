'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff, Maximize2 } from 'lucide-react'

interface EquipmentImageProps {
  assetName: string
  modelName?: string
  equipmentType?: 'A9900' | 'PUMA' | string
  className?: string
}

function resolveImagePath(assetName: string, modelName: string | undefined, equipmentType: string | undefined): string {
  if (equipmentType) return `/equipment-images/${equipmentType.toLowerCase()}_main.png`
  const name = (assetName + (modelName ?? '')).toUpperCase()
  if (name.includes('A9900')) return '/equipment-images/a9900_main.png'
  if (name.includes('PUMA')) return '/equipment-images/puma_main.png'
  return '/equipment-images/unknown_main.png'
}

export function EquipmentImage({
  assetName,
  modelName,
  equipmentType,
  className = ''
}: EquipmentImageProps) {
  const [imageError, setImageError] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const imagePath = resolveImagePath(assetName, modelName, equipmentType)

  if (imageError) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 ${className}`}>
        <ImageOff className="h-12 w-12 text-slate-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">Foto del equipo no disponible</p>
          <p className="text-xs text-slate-500">{assetName}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`relative group rounded-lg overflow-hidden bg-slate-100 ${className}`}>
        <Image
          src={imagePath}
          alt={assetName}
          fill
          className="object-contain p-4"
          onError={() => setImageError(true)}
          priority
        />
        <button
          onClick={() => setShowModal(true)}
          className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity"
          title="Ampliar imagen"
        >
          <Maximize2 className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative w-full max-w-3xl" style={{ aspectRatio: '16/9' }}>
            <Image
              src={imagePath}
              alt={assetName}
              fill
              className="object-contain"
            />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 p-2 bg-white rounded-lg text-slate-600 hover:text-slate-900 shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
