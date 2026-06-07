import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@core/lib/db'
import { Building2, Users, Tag, Database, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Configuración — AgroMaint Pro' }

export default async function ConfigPage() {
  const [org, usersCount, assetsCount, clientsCount] = await Promise.all([
    db.organization.findFirst(),
    db.user.count({ where: { isActive: true } }),
    db.asset.count({ where: { isActive: true } }),
    db.client.count({ where: { isActive: true } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500">Administración del sistema AgroMaint Pro</p>
      </div>

      {/* Org info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Organización</h2>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          {[['Nombre', org?.name ?? '—'],['Email', org?.email ?? '—'],['Teléfono', org?.phone ?? '—'],['Ciudad', org?.city ?? '—'],['País', org?.country ?? '—'],['Plan', org?.plan ?? '—']].map(([l, v]) => (
            <div key={l}><dt className="text-slate-500">{l}</dt><dd className="font-medium text-slate-900 mt-0.5">{v}</dd></div>
          ))}
        </dl>
      </div>

      {/* Estadísticas BD */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: <Users className="h-5 w-5 text-blue-500" />, label: 'Usuarios', value: usersCount, href: '/configuracion/usuarios' },
          { icon: <Database className="h-5 w-5 text-emerald-500" />, label: 'Equipos', value: assetsCount, href: '/activos' },
          { icon: <Building2 className="h-5 w-5 text-violet-500" />, label: 'Clientes', value: clientsCount, href: '/clientes' },
          { icon: <Shield className="h-5 w-5 text-amber-500" />, label: 'Auth', value: 'Activo', href: '/configuracion' },
        ].map(item => (
          <Link key={item.label} href={item.href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center">
            <div className="flex justify-center mb-2">{item.icon}</div>
            <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Sección de acción */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Autenticación</h3>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <strong>⚠️ Modo Demo:</strong> La autenticación está desactivada temporalmente. Para reactivarla, restaura el middleware de autenticación.
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-slate-600">📧 admin@imecol.com.co</p>
          <p className="text-slate-600">📧 supervisor@imecol.com.co</p>
          <p className="text-slate-600">📧 tecnico1@imecol.com.co</p>
          <p className="font-mono text-xs text-slate-400">🔑 Contraseña: AgroMaint2024!</p>
        </div>
      </div>
    </div>
  )
}
