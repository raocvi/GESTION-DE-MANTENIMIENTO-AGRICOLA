import { AppShell } from '@core/components/layout/AppShell'
import React from 'react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
