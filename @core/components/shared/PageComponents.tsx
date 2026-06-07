"use client"

import React from 'react'

export function StatsCard({ title, value, icon, description, colorClass = "text-primary" }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/60 soft-shadow hover-lift relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className={`p-2.5 rounded-lg bg-slate-50/80 backdrop-blur-sm shadow-sm border border-slate-100 ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10 text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
      {description && <p className="relative z-10 text-xs text-slate-500 mt-2 font-medium">{description}</p>}
    </div>
  )
}

export function PageHeader({ title, description, actions }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200/60">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-slate-500 mt-1.5 font-medium">{description}</p>}
      </div>
      {actions && <div className="mt-4 md:mt-0 flex items-center gap-3">{actions}</div>}
    </div>
  )
}