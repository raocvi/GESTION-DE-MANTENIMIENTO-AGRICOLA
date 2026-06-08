"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Tractor, ClipboardList, Package,
  Users, Building2, BarChart3, Settings, Plus,
  HelpCircle, Wrench, ChevronRight
} from 'lucide-react'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard',       href: '/dashboard', icon: LayoutDashboard, match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard/') },
      { label: 'Órdenes de Trabajo', href: '/ordenes', icon: ClipboardList,  match: (p: string) => p.startsWith('/ordenes') },
      { label: 'Activos / Flota', href: '/activos',  icon: Tractor,         match: (p: string) => p.startsWith('/activos') },
    ]
  },
  {
    label: 'Gestión',
    items: [
      { label: 'Clientes',        href: '/clientes',  icon: Building2,  match: (p: string) => p.startsWith('/clientes') },
      { label: 'Técnicos',        href: '/tecnicos',  icon: Users,      match: (p: string) => p.startsWith('/tecnicos') },
      { label: 'Planes Preventivos', href: '/planes', icon: Wrench,     match: (p: string) => p.startsWith('/planes') },
      { label: 'Repuestos',       href: '/solicitudes', icon: Package,   match: (p: string) => p.startsWith('/solicitudes') },
    ]
  },
  {
    label: 'Análisis',
    items: [
      { label: 'Reportes',        href: '/proyectos', icon: BarChart3,  match: (p: string) => p.startsWith('/proyectos') },
      { label: 'Configuración',   href: '/configuracion', icon: Settings, match: (p: string) => p.startsWith('/configuracion') },
    ]
  },
]

export function SideNavigation() {
  const pathname = usePathname() || ''

  return (
    <aside
      className="flex w-64 shrink-0 flex-col justify-between h-[calc(100vh-3.5rem)] overflow-y-auto"
      style={{ background: 'var(--sidebar-bg)', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}
    >
      {/* Company brand */}
      <div className="flex flex-col flex-1 py-5 px-3">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand text-white font-black text-base shadow-lg">
            AM
          </div>
          <div>
            <span className="text-sm font-bold text-white leading-tight block">IMECOL S.A.S.</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--sidebar-text)' }}>
              AgroMaint Pro
            </span>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex flex-col gap-5 flex-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4b6280' }}>
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = item.match(pathname)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon className={`nav-icon h-4 w-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="flex-1 text-[13px]">{item.label}</span>
                      {isActive && <ChevronRight className="h-3 w-3 text-blue-400 shrink-0" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="mt-6 px-1">
          <Link
            href="/ordenes/nueva"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] gradient-brand shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Nueva OT
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <Link
          href="/help"
          className="nav-item text-xs"
        >
          <HelpCircle className="h-4 w-4 text-slate-500" />
          Centro de ayuda
        </Link>
      </div>
    </aside>
  )
}
