'use client'

import { useState, useTransition } from 'react'
import {
  FlaskConical, CheckCircle2, XCircle, RefreshCw, Loader2,
  AlertTriangle, Download, Calendar,
} from 'lucide-react'
import { testLabConnectionAction, syncLabResults } from '@modules/M12_lube_analyst/labSyncActions'

interface SyncStatus {
  configured: boolean
  totalSamples: number
  labSamples: number
  lastImportAt: string | null
  lastImportLab: string | null
}

export function LabConfigView({ status }: { status: SyncStatus }) {
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; sampleCount?: number } | null>(null)
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string; created: number; updated: number; skipped: number; errors: string[] } | null>(null)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [forceResync, setForceResync] = useState(false)

  const [testPending, startTest] = useTransition()
  const [syncPending, startSync] = useTransition()

  function handleTest() {
    startTest(async () => {
      setTestResult(null)
      const r = await testLabConnectionAction()
      setTestResult(r)
    })
  }

  function handleSync() {
    startSync(async () => {
      setSyncResult(null)
      const r = await syncLabResults({ dateFrom, dateTo, forceResync })
      setSyncResult(r)
    })
  }

  const fmtDate = (iso: string | null) => iso
    ? new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* Status card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-blue-500" /> Estado de Integración
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'API Configurada', value: status.configured ? 'Sí' : 'No', ok: status.configured },
            { label: 'Total Muestras DB', value: status.totalSamples.toString(), ok: true },
            { label: 'Importadas del Lab', value: status.labSamples.toString(), ok: true },
            { label: 'Última Importación', value: fmtDate(status.lastImportAt), ok: !!status.lastImportAt },
          ].map(k => (
            <div key={k.label} className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
              <p className={`mt-1 text-lg font-bold ${k.ok ? 'text-slate-900' : 'text-rose-600'}`}>{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Env vars instructions */}
      {!status.configured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 mb-2">Credenciales no configuradas</p>
              <p className="text-sm text-amber-700 mb-3">Agrega las siguientes variables a tu archivo <code className="bg-amber-100 px-1 rounded">.env.local</code>:</p>
              <pre className="bg-amber-900/10 rounded-lg p-3 text-xs text-amber-900 overflow-x-auto">{`# Laboratorio de Análisis de Aceite
LAB_API_URL=https://1nbfrrw2yl.execute-api.us-west-2.amazonaws.com/dev/api/v1
LAB_API_KEY=<tu_api_key>
LAB_ACCESS_TOKEN=<tu_access_token>
LAB_CLIENT_ID=<tu_id_cliente_en_el_lab>
LAB_OPERATION_IDS=<id_operacion_1>,<id_operacion_2>`}</pre>
              <p className="text-xs text-amber-600 mt-2">Después reinicia el servidor de desarrollo (<code>npm run dev</code>).</p>
            </div>
          </div>
        </div>
      )}

      {/* Test connection */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Probar Conexión
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Verifica que las credenciales funcionan y que hay datos disponibles para tu cliente.
        </p>
        <button onClick={handleTest} disabled={testPending || !status.configured}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {testPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
          {testPending ? 'Probando...' : 'Probar Conexión'}
        </button>
        {testResult && (
          <div className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-sm ${
            testResult.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {testResult.ok
              ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            <span>
              {testResult.message}
              {testResult.sampleCount !== undefined && ` — ${testResult.sampleCount} muestras en el rango de prueba`}
            </span>
          </div>
        )}
      </div>

      {/* Sync panel */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-500" /> Sincronizar Resultados
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Importa los resultados de análisis del laboratorio al módulo LubeAnalyst.
          Los datos existentes con el mismo número de muestra se omiten (usa "Forzar" para actualizarlos).
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Fecha desde</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Fecha hasta</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={forceResync} onChange={e => setForceResync(e.target.checked)}
            className="rounded border-slate-300 text-blue-600" />
          <span className="text-sm text-slate-600">Forzar re-sincronización (sobreescribe muestras ya importadas)</span>
        </label>

        <button onClick={handleSync} disabled={syncPending || !status.configured}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {syncPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {syncPending ? 'Sincronizando...' : 'Importar desde Laboratorio'}
        </button>

        {syncPending && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            Consultando API y procesando resultados...
          </div>
        )}

        {syncResult && (
          <div className={`mt-4 rounded-lg p-4 text-sm ${syncResult.ok ? 'bg-blue-50' : 'bg-rose-50'}`}>
            <p className={`font-semibold mb-2 ${syncResult.ok ? 'text-blue-800' : 'text-rose-800'}`}>
              {syncResult.message}
            </p>
            {syncResult.ok && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: 'Nuevas', value: syncResult.created, color: 'text-emerald-700' },
                  { label: 'Actualizadas', value: syncResult.updated, color: 'text-blue-700' },
                  { label: 'Omitidas', value: syncResult.skipped, color: 'text-slate-500' },
                ].map(k => (
                  <div key={k.label} className="text-center bg-white rounded-lg p-2">
                    <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{k.label}</p>
                  </div>
                ))}
              </div>
            )}
            {syncResult.errors.length > 0 && (
              <div className="mt-2 bg-rose-100 rounded p-2">
                <p className="text-xs font-semibold text-rose-700 mb-1">Errores ({syncResult.errors.length}):</p>
                {syncResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-rose-600 font-mono">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* API info */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-500">
        <p className="font-semibold text-slate-700 mb-2">Endpoints configurados</p>
        <p>🔬 Resultados: <code>POST /muestras/resultados</code></p>
        <p>🚜 Equipos: <code>POST /equipos_componentes</code></p>
        <p className="mt-2">Base URL: <code>https://1xl9bz3b44.execute-api.us-west-2.amazonaws.com/stg/api/v1</code></p>
      </div>

    </div>
  )
}
