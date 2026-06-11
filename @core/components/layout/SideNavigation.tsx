"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Tractor, ClipboardList, Package,
  Users, Building2, BarChart3, Settings, Plus,
  HelpCircle, Wrench, Activity, FileBarChart, Droplets
} from 'lucide-react'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard',          href: '/dashboard',      icon: LayoutDashboard, match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard/') },
      { label: 'Órdenes de Trabajo', href: '/ordenes',        icon: ClipboardList,   match: (p: string) => p.startsWith('/ordenes') },
      { label: 'Activos / Flota',    href: '/activos',        icon: Tractor,         match: (p: string) => p.startsWith('/activos') },
    ]
  },
  {
    label: 'Gestión',
    items: [
      { label: 'Clientes',           href: '/clientes',       icon: Building2,       match: (p: string) => p.startsWith('/clientes') },
      { label: 'Técnicos',           href: '/tecnicos',       icon: Users,           match: (p: string) => p.startsWith('/tecnicos') },
      { label: 'Planes Preventivos', href: '/planes',         icon: Wrench,          match: (p: string) => p.startsWith('/planes') },
      { label: 'Repuestos',          href: '/solicitudes',    icon: Package,         match: (p: string) => p.startsWith('/solicitudes') },
    ]
  },
  {
    label: 'Análisis',
    items: [
      { label: 'Proyectos',          href: '/proyectos',      icon: BarChart3,       match: (p: string) => p.startsWith('/proyectos') },
      { label: 'Confiabilidad',      href: '/confiabilidad',  icon: Activity,        match: (p: string) => p.startsWith('/confiabilidad') },
      { label: 'LubeAnalyst',        href: '/lube-analyst',   icon: Droplets,        match: (p: string) => p.startsWith('/lube-analyst') },
      { label: 'Informe Gerencial',  href: '/informes',       icon: FileBarChart,    match: (p: string) => p.startsWith('/informes') },
      { label: 'Configuración',      href: '/configuracion',  icon: Settings,        match: (p: string) => p.startsWith('/configuracion') },
    ]
  },
]

export function SideNavigation() {
  const pathname = usePathname() || ''

  return (
    <aside
      className="flex w-[15.5rem] shrink-0 flex-col h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden"
      style={{
        background: 'var(--sidebar-bg)',
        boxShadow: 'var(--shadow-sidebar)',
      }}
    >
      <div className="flex flex-col flex-1 py-5 px-3">

        {/* Brand */}
        <div className="flex items-center gap-3 px-2 mb-7">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-brand text-white font-black text-xs shadow-lg ring-2 ring-white/10">
            AM
          </div>
          <div className="min-w-0">
            <span className="text-[13px] font-bold text-white leading-tight block truncate">IMECOL S.A.S.</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] truncate block" style={{ color: 'var(--sidebar-text)' }}>
              AgroMaint Pro
            </span>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex flex-col gap-6 flex-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p
                className="px-3 mb-2 text-[9px] font-extrabold uppercase tracking-[0.16em]"
                style={{ color: '#4a6580' }}
              >
                {group.label}
              </p>
              <div className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const isActive = item.match(pathname)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon
                        className="nav-icon h-[15px] w-[15px] shrink-0 transition-colors"
                        style={{ color: isActive ? 'var(--sidebar-accent)' : 'var(--sidebar-text)' }}
                      />
                      <span className="flex-1 tracking-[-0.01em]">{item.label}</span>
                      {isActive && (
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: 'var(--sidebar-accent)' }}
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* CTA */}
        <div className="mt-6 px-1">
          <Link
            href="/ordenes/nueva"
            className="group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white gradient-brand shadow-lg transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            Nueva OT
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#3a5570' }}>
            v1.0
          </span>
          <span className="flex items-center gap-1 text-[9px]" style={{ color: '#3a5570' }}>
            <span className="live-dot" style={{ height: '5px', width: '5px', animation: 'none', background: '#10b981' }} />
            En línea
          </span>
        </div>
        <Link href="/help" className="nav-item text-xs">
          <HelpCircle className="h-[15px] w-[15px]" style={{ color: 'var(--sidebar-text)' }} />
          Centro de ayuda
        </Link>
      </div>
    </aside>
  )
}
