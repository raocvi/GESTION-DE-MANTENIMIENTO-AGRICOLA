import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
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
  robots: 'noindex, nofollow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F1F4F9] text-slate-900">{children}</body>
    </html>
  )
}
