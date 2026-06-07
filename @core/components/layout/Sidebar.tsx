"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wrench, Users, Briefcase, Settings, Menu, X, Tractor, ActivitySquare } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname() || ''
  const [isOpen, setIsOpen] = React.useState(false)

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ordenes', label: 'Órdenes de Trabajo', icon: Wrench },
    { href: '/proyectos', label: 'Proyectos', icon: Briefcase },
    { href: '/activos', label: 'Equipos / Flota', icon: Tractor },
    { href: '/tecnicos', label: 'Técnicos', icon: Users },
    { href: '/configuracion', label: 'Configuración', icon: Settings },
  ]

  return (
    <>
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 transform transition-all duration-300 ease-in-out shadow-2xl
        md:relative md:translate-x-0 border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <ActivitySquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">AgroMaint <span className="text-primary">Pro</span></h1>
        </div>
        
        <div className="px-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Menú Principal
        </div>
        
        <nav className="px-3 mt-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname.startsWith(link.href)
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white">IMECOL S.A.S</p>
              <p className="text-[10px] text-slate-400">V. 1.0.0 Enterprise</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          </div>
        </div>
      </div>
    </>
  )
}