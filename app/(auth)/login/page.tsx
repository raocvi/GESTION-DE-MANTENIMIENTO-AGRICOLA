import React from 'react'
import type { Metadata } from 'next'
import { LoginForm } from '@modules/M01_auth/components/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar Sesión — AgroMaint Pro',
  description: 'Accede a tu cuenta de gestión de mantenimiento de maquinaria agrícola.',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
              <span className="text-2xl font-black text-white">A</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">AgroMaint Pro</h1>
              <p className="text-sm text-slate-500">Gestión de Mantenimiento Agrícola</p>
            </div>
          </div>

          <LoginForm />

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400">
            IMECOL S.A.S. · Distribuidores CASE IH en Colombia
          </p>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
          <p className="text-xs font-medium text-white/80">Demo:</p>
          <p className="text-xs text-white/60">admin@imecol.com.co</p>
          <p className="text-xs text-white/60">AgroMaint2024!</p>
        </div>
      </div>
    </div>
  )
}
