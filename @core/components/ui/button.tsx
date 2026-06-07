import * as React from 'react'
import { cn } from '@core/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95',
  outline:   'border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95',
  ghost:     'text-slate-600 hover:bg-slate-100 active:scale-95',
  danger:    'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95 shadow-md shadow-destructive/20',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20',
  link:      'text-primary hover:text-primary/80 underline-offset-4 hover:underline p-0 h-auto',
}

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  xs:   'h-7 px-2.5 text-xs',
  sm:   'h-8 px-3 text-sm',
  md:   'h-9 px-4 text-sm',
  lg:   'h-10 px-6 text-base',
  icon: 'h-9 w-9',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
