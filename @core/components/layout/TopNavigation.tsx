import React from 'react'
import Link from 'next/link'
import { Bell, Settings, Search, User } from 'lucide-react'

export function TopNavigation() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-brand-600 font-bold text-xl tracking-tight">
          AgroMaint Pro
        </Link>
        
        <nav className="hidden md:flex gap-6 h-full">
          {/* Active state for Dashboard */}
          <Link href="/dashboard" className="flex h-16 items-center border-b-2 border-brand-600 px-1 text-sm font-semibold text-brand-600">
            Dashboard
          </Link>
          <Link href="/ordenes" className="flex h-16 items-center border-b-2 border-transparent px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            Maintenance
          </Link>
          <Link href="/activos" className="flex h-16 items-center border-b-2 border-transparent px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 border-dashed border-gray-300">
            Fleet
          </Link>
          <Link href="/planes" className="flex h-16 items-center border-b-2 border-transparent px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            Reports
          </Link>
          {/* Including Projects link since the user wanted functional modules re-integrated */}
          <Link href="/proyectos" className="flex h-16 items-center border-b-2 border-transparent px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
            Projects
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search fleet..."
            className="h-9 w-64 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <Settings className="h-5 w-5" />
        </button>
        <div className="ml-2 h-8 w-8 overflow-hidden rounded-full bg-slate-800 text-white flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  )
}
