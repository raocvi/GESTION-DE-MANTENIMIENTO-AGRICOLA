import React from 'react'
import { cn } from '@core/lib/utils'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'slate'
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  color = 'blue',
  className,
}: StatsCardProps) {
  const colors = {
    blue:    { bg: 'bg-blue-50',    icon: 'bg-blue-100 text-blue-600',    text: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700' },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',   text: 'text-amber-700' },
    red:     { bg: 'bg-red-50',     icon: 'bg-red-100 text-red-600',       text: 'text-red-700' },
    purple:  { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700' },
    slate:   { bg: 'bg-slate-50',   icon: 'bg-slate-100 text-slate-600',   text: 'text-slate-700' },
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        {icon && (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors[color].icon)}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-semibold',
              trend.positive !== false && trend.value > 0 ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
