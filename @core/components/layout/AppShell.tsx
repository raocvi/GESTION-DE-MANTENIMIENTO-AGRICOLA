"use client"

import React from 'react'
import { SideNavigation } from './SideNavigation'
import { TopNavigation } from './TopNavigation'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden font-sans" style={{ background: 'hsl(var(--background))' }}>
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <SideNavigation />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
