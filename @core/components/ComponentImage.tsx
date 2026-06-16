'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff } from 'lucide-react'

interface ComponentImageProps {
  componentName: string
  componentType?: string
  equipmentType?: string
  className?: string
}

export function ComponentImage({
  componentName,
  componentType,
  equipmentType,
  className = ''
}: ComponentImageProps) {
  const [imageError, setImageError] = useState(false)

  // Mapping de tipos de componentes a rutas
  const componentTypeMap: Record<string, string> = {
    'motor': 'motor',
    'transmission': 'transmission',
    'transmision': 'transmission',
    'hydraulic': 'hydraulic',
    'hidraulico': 'hydraulic',
    'electrical': 'electrical',
    'electrico': 'electrical',
    'cutting': 'cutting',
    'corte': 'cutting',
    'final_drive': 'final_drive',
    'diferencial': 'final_drive',
  }

  // Construir ruta de imagen
  const imageFileName = `${equipmentType?.toLowerCase() || 'a9900'}_${componentTypeMap[componentType?.toLowerCase() || 'motor']}.png`
  const imagePath = `/equipment-images/${imageFileName}`

  if (imageError) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 ${className}`}>
        <ImageOff className="h-8 w-8 text-slate-300" />
        <p className="text-xs text-slate-500 text-center">{componentName}</p>
      </div>
    )
  }

  return (
    <div className={`relative rounded-lg overflow-hidden bg-slate-100 ${className}`}>
      <Image
        src={imagePath}
        alt={componentName}
        fill
        className="object-contain p-2"
        onError={() => setImageError(true)}
      />
    </div>
  )
}
