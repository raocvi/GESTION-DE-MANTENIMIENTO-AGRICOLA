"use client"

import React from 'react'
import Link from 'next/link'
import { Bell, Settings, Search, ChevronDown, Tractor } from 'lucide-react'

export function TopNavigation() {
  return (
    <header
      className="flex h-14 w-full items-center justify-between px-5 shrink-0 z-40"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: 'var(--shadow-topbar)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Left: Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 shrink-0 group"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand shadow-md ring-2 ring-[#0369a1]/20 transition-shadow group-hover:shadow-lg">
          <Tractor className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[15px] font-extrabold tracking-tight text-gradient-brand">
          AgroMaint Pro
        </span>
      </Link>

      {/* Center: Search */}
      <div className="flex-1 flex items-center justify-center px-8 max-w-xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar equipos, órdenes, clientes..."
            className="h-8 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-14 text-[12px] font-medium text-slate-700 placeholder:text-slate-400 transition-all
              focus:border-[#0369a1]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0369a1]/10"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 shadow-sm">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-0.5 shrink-0">

        {/* Notifications */}
        <button
          className="relative rounded-xl p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-[7px] w-[7px] rounded-full bg-rose-500 ring-[1.5px] ring-white" />
        </button>

        {/* Settings */}
        <button
          className="rounded-xl p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label="Configuración"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="mx-2 h-5 w-px bg-slate-200" />

        {/* User */}
        <button className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all hover:bg-slate-100 active:scale-[0.98]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white text-[11px] font-black shadow-sm ring-2 ring-[#0369a1]/20">
            A
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[12px] font-bold text-slate-800 leading-tight">Admin</span>
            <span className="text-[10px] font-medium text-slate-400 leading-tight">IMECOL S.A.S.</span>
          </div>
          <ChevronDown className="hidden sm:block h-3 w-3 text-slate-400" />
        </button>
      </div>
    </header>
  )
}
