"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Settings, Search, User } from 'lucide-react'

export function TopNavigation() {
  const pathname = usePathname() || ''

  const links = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/'),
    },
    {
      label: 'Maintenance',
      href: '/ordenes',
      isActive: pathname.startsWith('/ordenes'),
    },
    {
      label: 'Fleet',
      href: '/activos',
      isActive: pathname.startsWith('/activos'),
      isDashedBorder: true, // matching the dotted focus/hover ring in MODELO.png
    },
    {
      label: 'Reports',
      href: '/planes',
      isActive: pathname.startsWith('/planes'),
    },
    {
      label: 'Projects',
      href: '/proyectos',
      isActive: pathname.startsWith('/proyectos'),
    },
  ]

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white px-6 shrink-0 z-30 shadow-sm shadow-slate-100/50">
      <Link href="/dashboard" className="flex items-center gap-2 text-[#0052cc] font-black text-xl tracking-tight">
        AgroMaint Pro
      </Link>
      
      <nav className="hidden md:flex gap-6 h-full items-center ml-auto mr-8">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`flex h-full items-center border-b-2 px-1 text-sm font-bold transition-all relative top-[1px] ${
              link.isActive
                ? 'border-[#0052cc] text-[#0052cc]'
                : link.isDashedBorder
                  ? 'border-transparent text-slate-500 hover:border-dashed hover:border-slate-300 hover:text-slate-800'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {/* Pill Search Input */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search fleet..."
            className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:border-[#0052cc]/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        
        {/* Controls */}
        <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        
        {/* User profile avatar circle */}
        <div className="ml-2 h-9 w-9 overflow-hidden rounded-full bg-[#1e293b] text-white flex items-center justify-center shadow-md shadow-slate-300/20 cursor-pointer hover:opacity-90 transition-opacity">
          <User className="h-5 w-5 text-slate-200" />
        </div>
      </div>
    </header>
  )
}
