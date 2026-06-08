"use client"

import React from 'react'
import Link from 'next/link'
import { Bell, Settings, Search, ChevronDown, Tractor } from 'lucide-react'

export function TopNavigation() {
  return (
    <header
      className="flex h-14 w-full items-center justify-between px-5 shrink-0 z-40 bg-white"
      style={{ boxShadow: 'var(--shadow-topbar, 0 1px 0 rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.04))' }}
    >
      {/* Left: Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 font-black text-lg tracking-tight text-gradient-brand shrink-0"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand shadow-md">
          <Tractor className="h-4 w-4 text-white" />
        </div>
        AgroMaint Pro
      </Link>

      {/* Center: search */}
      <div className="flex-1 flex items-center justify-center px-8 max-w-2xl mx-auto">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar equipos, órdenes, clientes..."
            className="h-8 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Notifications */}
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="h-4.5 w-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
          <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Settings */}
        <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Settings className="h-4.5 w-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-slate-200" />

        {/* User */}
        <button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-slate-100 transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-brand text-white text-xs font-black shadow-sm">
            A
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-700 leading-tight">Admin</span>
            <span className="text-[10px] text-slate-400 leading-tight">IMECOL S.A.S.</span>
          </div>
          <ChevronDown className="hidden sm:block h-3 w-3 text-slate-400" />
        </button>
      </div>
    </header>
  )
}
