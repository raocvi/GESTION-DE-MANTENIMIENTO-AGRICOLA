"use client"

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

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

const colorTokens = {
  blue:    { icon: 'bg-blue-50 text-blue-600',    bar: 'bg-blue-500',    text: 'text-blue-600'    },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-600' },
  amber:   { icon: 'bg-amber-50 text-amber-600',   bar: 'bg-amber-500',   text: 'text-amber-600'   },
  rose:    { icon: 'bg-rose-50 text-rose-600',     bar: 'bg-rose-500',    text: 'text-rose-600'    },
  violet:  { icon: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500',  text: 'text-violet-600'  },
  indigo:  { icon: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500',  text: 'text-indigo-600'  },
}

export function StatsCard({ title, value, icon, description, trend, color = 'blue', onClick, active }: StatsCardProps) {
  const c = colorTokens[color]
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null

  return (
    <div
      onClick={onClick}
      className={`kpi-card ${onClick ? 'interactive' : ''} ${active ? 'active' : ''}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${active ? c.bar : 'bg-transparent'}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 truncate">{title}</p>
          <div className={`text-3xl font-black tracking-tight ${c.text}`}>{value}</div>
          {description && <p className="text-xs text-slate-400 font-medium mt-1">{description}</p>}
          {trend && TrendIcon && (
            <div className={`flex items-center gap-1 mt-2 text-[11px] font-bold ${trend.value > 0 ? 'text-emerald-600' : trend.value < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              <TrendIcon className="h-3 w-3" />
              {Math.abs(trend.value)}% {trend.label || (trend.value > 0 ? 'vs anterior' : 'vs anterior')}
            </div>
          )}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ml-3 ${c.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

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
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-md shrink-0">
            {icon}
          </div>
        )}
        <div>
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1 mb-0.5 text-[11px] font-medium text-slate-400">
              {breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span>/</span>}
                  <span>{b.label}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}

export function SearchBar({ placeholder = 'Buscar...', name = 'search', defaultValue }: {
  placeholder?: string; name?: string; defaultValue?: string
}) {
  return (
    <div className="relative w-full max-w-sm">
      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
      />
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
        {icon}
      </div>
      <p className="font-bold text-slate-600 text-base">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PrimaryButton({ href, children, ...props }: any) {
  const Tag = href ? 'a' : 'button'
  return (
    <Tag
      href={href}
      {...props}
      className={`inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98] ${props.className || ''}`}
    >
      {children}
    </Tag>
  )
}

export function SecondaryButton({ href, children, ...props }: any) {
  const Tag = href ? 'a' : 'button'
  return (
    <Tag
      href={href}
      {...props}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-800 ${props.className || ''}`}
    >
      {children}
    </Tag>
  )
}
