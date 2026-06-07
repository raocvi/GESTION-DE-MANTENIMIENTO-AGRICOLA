import React from 'react'
import { AppShell } from '@core/components/layout/AppShell'

// ⚠️ AUTENTICACIÓN DESACTIVADA TEMPORALMENTE — acceso directo sin login
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
