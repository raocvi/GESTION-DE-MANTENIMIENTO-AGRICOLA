"use client"

import React from 'react'
import { Bell, Search, User } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex-1 flex items-center">
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar en plataforma..." 
            className="w-full bg-slate-100/50 border-none rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">Administrador</span>
            <span className="text-[10px] text-slate-400">admin@imecol.com.co</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white shadow-md">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  )
}