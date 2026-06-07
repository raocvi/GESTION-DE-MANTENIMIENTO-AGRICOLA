import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Tractor, CalendarDays, Package, LineChart, Plus, HelpCircle, LifeBuoy } from 'lucide-react'

export function SideNavigation() {
  return (
    <aside className="flex w-64 flex-col justify-between border-r border-gray-200 bg-[#f9fafb]">
      <div className="flex flex-col py-6 px-4">
        {/* Company Info */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brand-600 text-white font-bold">
            I
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800 leading-tight">IMECOL S.A.S.</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">FLEET MANAGEMENT</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-brand-700">
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </Link>
          <Link href="/activos" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-dashed border-gray-300">
            <Tractor className="h-5 w-5" />
            Assets
          </Link>
          <Link href="/ordenes" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <CalendarDays className="h-5 w-5" />
            Schedule
          </Link>
          <Link href="/tecnicos" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <Package className="h-5 w-5" />
            Inventory
          </Link>
          <Link href="/clientes" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-dashed border-gray-300">
            <LineChart className="h-5 w-5" />
            Analytics
          </Link>
        </nav>

        {/* New Work Order Button */}
        <div className="mt-8 px-2">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors">
            <Plus className="h-5 w-5" />
            New Work Order
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex flex-col gap-1 p-4">
        <Link href="/help" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <HelpCircle className="h-5 w-5" />
          Help Center
        </Link>
        <Link href="/support" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
          <LifeBuoy className="h-5 w-5" />
          Support
        </Link>
      </div>
    </aside>
  )
}
