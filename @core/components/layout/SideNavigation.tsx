"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Tractor, CalendarDays, Package, LineChart, Plus, HelpCircle, LifeBuoy } from 'lucide-react'

export function SideNavigation() {
  const pathname = usePathname() || ''

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard' || pathname.startsWith('/dashboard/'),
    },
    {
      label: 'Assets',
      href: '/activos',
      icon: Tractor,
      isActive: pathname.startsWith('/activos'),
    },
    {
      label: 'Schedule',
      href: '/ordenes',
      icon: CalendarDays,
      isActive: pathname.startsWith('/ordenes') && !pathname.endsWith('/nueva'),
    },
    {
      label: 'Inventory',
      href: '/tecnicos',
      icon: Package,
      isActive: pathname.startsWith('/tecnicos'),
    },
    {
      label: 'Analytics',
      href: '/clientes',
      icon: LineChart,
      isActive: pathname.startsWith('/clientes') || pathname.startsWith('/proyectos'),
    },
  ]

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-[#f8fafc] h-[calc(100vh-4rem)]">
      <div className="flex flex-col py-6 px-4">
        {/* Company Info */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0052cc] text-white font-black text-lg shadow-md shadow-blue-600/10">
            I
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 leading-tight">IMECOL S.A.S.</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">FLEET MANAGEMENT</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all border ${
                  item.isActive
                    ? 'bg-blue-50 border-blue-100/40 text-[#0052cc]'
                    : 'border-transparent text-slate-600 hover:border-dashed hover:border-blue-400/80 hover:bg-blue-50/20 hover:text-[#0052cc]'
                }`}
              >
                <Icon className={`h-5 w-5 ${item.isActive ? 'text-[#0052cc]' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* New Work Order Button */}
        <div className="mt-8 px-1">
          <Link
            href="/ordenes/nueva"
            id="btn-sidebar-new-order"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0052cc] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/15 hover:bg-blue-700 transition-all hover:scale-[1.01]"
          >
            <Plus className="h-5 w-5" />
            New Work Order
          </Link>
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex flex-col gap-1 p-4 border-t border-slate-200/50 bg-[#f8fafc]/50">
        <Link 
          href="/help" 
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <HelpCircle className="h-4 w-4 text-slate-400" />
          Help Center
        </Link>
        <Link 
          href="/support" 
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <LifeBuoy className="h-4 w-4 text-slate-400" />
          Support
        </Link>
      </div>
    </aside>
  )
}
