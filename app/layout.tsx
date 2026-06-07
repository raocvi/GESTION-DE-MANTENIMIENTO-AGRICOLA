import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AgroMaint Pro — Gestión de Mantenimiento Agrícola',
    template: '%s — AgroMaint Pro',
  },
  description:
    'Plataforma profesional de gestión de mantenimiento de maquinaria agrícola CASE IH. Órdenes de trabajo, planes de mantenimiento, inventario y reportes.',
  keywords: ['CMMS', 'mantenimiento agrícola', 'CASE IH', 'IMECOL', 'cosechadoras'],
  authors: [{ name: 'IMECOL S.A.S.' }],
  robots: 'noindex, nofollow', // Aplicación interna
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  )
}
