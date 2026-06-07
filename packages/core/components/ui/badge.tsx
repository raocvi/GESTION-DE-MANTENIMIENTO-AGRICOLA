import * as React from 'react'
import { cn } from '@core/lib/utils'

const badgeVariants = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-blue-100 text-blue-700 border-blue-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  purple: 'bg-violet-100 text-violet-700 border-violet-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants
  dot?: boolean
  size?: 'sm' | 'md'
}

export function Badge({
  className,
  variant = 'default',
  dot = false,
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full bg-current')} />
      )}
      {children}
    </span>
  )
}

// Status badge with auto-color by status value
const STATUS_COLORS: Record<string, keyof typeof badgeVariants> = {
  // WorkOrder
  new: 'default', requested: 'primary', approved: 'cyan', scheduled: 'purple',
  assigned: 'purple', en_route: 'purple', in_progress: 'warning', paused: 'orange',
  pending_parts: 'orange', pending_approval: 'warning', pending_client: 'warning',
  completed_by_tech: 'success', in_review: 'primary', closed: 'success',
  cancelled: 'danger', reopened: 'orange',
  // Asset
  operative: 'success', maintenance: 'warning', out_of_service: 'danger',
  warranty: 'primary', diagnosis: 'purple', retired: 'default',
  // Priority
  low: 'default', medium: 'primary', high: 'warning', critical: 'danger',
  stopped: 'danger', safety: 'danger',
  // Stock
  active: 'success', inactive: 'default', discontinued: 'danger',
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const variant = STATUS_COLORS[status] ?? 'default'
  return (
    <Badge variant={variant} dot>
      {label ?? status}
    </Badge>
  )
}
