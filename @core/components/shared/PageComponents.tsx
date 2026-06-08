"use client"

import React from 'react'
import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react'
import Link from 'next/link'

// ─── Color tokens ─────────────────────────────────────────────────────────────

interface ColorToken {
  icon: string
  bar: string
  text: string
  ring: string
  glow: string
}

const colorTokens: Record<string, ColorToken> = {
  blue:    { icon: 'bg-blue-50 text-blue-600',    bar: 'bg-blue-500',    text: 'text-blue-700',    ring: 'ring-blue-200',    glow: 'rgba(3,105,161,0.12)' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-200', glow: 'rgba(5,150,105,0.12)' },
  amber:   { icon: 'bg-amber-50 text-amber-600',   bar: 'bg-amber-500',   text: 'text-amber-700',   ring: 'ring-amber-200',   glow: 'rgba(217,119,6,0.12)' },
  rose:    { icon: 'bg-rose-50 text-rose-600',     bar: 'bg-rose-500',    text: 'text-rose-700',    ring: 'ring-rose-200',    glow: 'rgba(244,63,94,0.12)' },
  violet:  { icon: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500',  text: 'text-violet-700',  ring: 'ring-violet-200',  glow: 'rgba(124,58,237,0.12)' },
  indigo:  { icon: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500',  text: 'text-indigo-700',  ring: 'ring-indigo-200',  glow: 'rgba(79,70,229,0.12)' },
}

// ─── StatsCard ────────────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string
  value: React.ReactNode
  icon?: React.ReactNode
  description?: string
  trend?: { value: number; label?: string }
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'indigo'
  onClick?: () => void
  active?: boolean
}

export function StatsCard({ title, value, icon, description, trend, color = 'blue', onClick, active }: StatsCardProps) {
  const c = colorTokens[color]
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      className={`kpi-card ${onClick ? 'interactive' : ''} ${active ? 'active' : ''}`}
      style={active ? { boxShadow: `0 0 0 2px rgba(3,105,161,0.25), 0 8px 20px ${c.glow}` } : undefined}
    >
      {/* Accent bar top */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl transition-opacity duration-200 ${c.bar} ${active ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Subtle background glow on active */}
      {active && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${c.glow}, transparent 70%)` }}
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400 mb-2.5 truncate">
            {title}
          </p>
          <div className={`text-[2rem] font-extrabold tracking-tight num leading-none ${c.text} animate-count-up`}>
            {value}
          </div>

          {description && (
            <p className="text-[11px] text-slate-400 font-medium mt-2 leading-snug">{description}</p>
          )}

          {trend && TrendIcon && (
            <div className={`inline-flex items-center gap-1 mt-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold
              ${trend.value > 0 ? 'bg-emerald-50 text-emerald-700' : trend.value < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'}`}
            >
              <TrendIcon className="h-2.5 w-2.5" />
              {Math.abs(trend.value)}% {trend.label || 'vs anterior'}
            </div>
          )}
        </div>

        {icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.icon} shadow-sm`}>
            {icon}
          </div>
        )}
      </div>

      {/* Interactive hint */}
      {onClick && (
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl ${c.bar} opacity-0 transition-opacity duration-200 group-hover:opacity-30`} />
      )}
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: Array<{ label: string; href?: string }>
  icon?: React.ReactNode
}

export function PageHeader({ title, description, actions, breadcrumb, icon }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="flex items-center gap-3.5">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shrink-0"
            style={{ boxShadow: '0 2px 8px rgba(3,105,161,0.30), 0 1px 2px rgba(0,0,0,0.12)' }}
          >
            {icon}
          </div>
        )}
        <div>
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 mb-0.5">
              {breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-300 text-[10px]">›</span>}
                  {b.href
                    ? <Link href={b.href} className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors">{b.label}</Link>
                    : <span className="text-[11px] font-medium text-slate-400">{b.label}</span>
                  }
                </React.Fragment>
              ))}
            </div>
          )}
          <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h1>
          {description && <p className="text-[13px] text-slate-400 font-medium mt-0.5 leading-snug">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}

// ─── SearchBar ────────────────────────────────────────────────────────────────

export function SearchBar({ placeholder = 'Buscar...', name = 'search', defaultValue }: {
  placeholder?: string
  name?: string
  defaultValue?: string
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-9 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-[13px] font-medium text-slate-700 placeholder:text-slate-400
          focus:border-[#0369a1]/40 focus:outline-none focus:ring-2 focus:ring-[#0369a1]/10 transition-all"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
      />
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 py-20 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4 shadow-sm">
        {icon}
      </div>
      <p className="font-bold text-slate-600 text-[15px] tracking-tight">{title}</p>
      {description && <p className="text-[13px] text-slate-400 font-medium mt-1.5 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────

export function PrimaryButton({ href, children, className = '', ...props }: any) {
  const cls = `inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-[13px] font-bold text-white
    transition-all duration-150 hover:opacity-90 active:scale-[0.97] active:opacity-80 ${className}`

  if (href) return (
    <Link href={href} className={cls} {...props}>{children}</Link>
  )
  return (
    <button className={cls} {...props}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.14), 0 3px 8px rgba(3,105,161,0.22)', ...props.style }}
    >
      {children}
    </button>
  )
}

// ─── SecondaryButton ──────────────────────────────────────────────────────────

export function SecondaryButton({ href, children, className = '', ...props }: any) {
  const cls = `inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-600
    transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.97] ${className}`

  if (href) return (
    <Link href={href} className={cls} {...props}>{children}</Link>
  )
  return (
    <button className={cls} {...props}
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', ...props.style }}
    >
      {children}
    </button>
  )
}
