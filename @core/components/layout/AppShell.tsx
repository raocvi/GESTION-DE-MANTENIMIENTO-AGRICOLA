"use client"

import React from 'react'
import { SideNavigation } from './SideNavigation'
import { TopNavigation } from './TopNavigation'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-[#f4f7fa] overflow-hidden font-sans">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <SideNavigation />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
