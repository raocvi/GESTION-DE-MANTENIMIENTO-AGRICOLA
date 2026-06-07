import React, { useMemo } from 'react'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card'
import { differenceInDays } from 'date-fns'

const BAR_COLORS = ['#3f51b5', '#009688', '#ff9800', '#e91e63', '#9c27b0']
const PIE_COLORS = ['#0f172a', '#0284c7', '#10b981', '#f59e0b', '#ef4444']

export function ClientDashboardCharts({ orders }: { orders: any[] }) {
  
  // 1. Top Clients by Work Order Volume
  const volumeData = useMemo(() => {
    const clientCounts: Record<string, number> = {}
    orders.forEach(o => {
      const name = o.client?.name || 'Interno / Genérico'
      clientCounts[name] = (clientCounts[name] || 0) + 1
    })

    return Object.entries(clientCounts)
      .map(([name, count]) => ({
        name: name.replace('Agropecuaria ', ''), // Shorten names
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [orders])

  // 2. Costs by Client
  const costData = useMemo(() => {
    const clientCosts: Record<string, number> = {}
    orders.forEach(o => {
      const name = o.client?.name || 'Interno / Genérico'
      clientCosts[name] = (clientCosts[name] || 0) + (o.totalCost || 0)
    })

    const total = Object.values(clientCosts).reduce((a, b) => a + b, 0) || 1
    return Object.entries(clientCosts)
      .map(([name, cost]) => ({
        name: name.replace('Agropecuaria ', ''),
        value: Math.round(cost),
        percentage: Math.round((cost / total) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [orders])

  // 3. Average Resolution Time (MTTR) by Client (Closed Orders)
  const mttrData = useMemo(() => {
    const clientTimes: Record<string, { totalDays: number; count: number }> = {}
    
    orders.filter(o => o.status === 'closed' && o.closedAt).forEach(o => {
      const name = o.client?.name || 'Interno / Genérico'
      const start = o.startedAt ? new Date(o.startedAt) : new Date(o.createdAt)
      const end = new Date(o.closedAt)
      const duration = Math.max(1, differenceInDays(end, start))

      if (!clientTimes[name]) {
        clientTimes[name] = { totalDays: 0, count: 0 }
      }
      clientTimes[name].totalDays += duration
      clientTimes[name].count++
    })

    return Object.entries(clientTimes)
      .map(([name, data]) => ({
        name: name.replace('Agropecuaria ', ''),
        dias: parseFloat((data.totalDays / data.count).toFixed(1))
      }))
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 5)
  }, [orders])

  // 4. Active Assets by Client
  const assetsData = useMemo(() => {
    const clientAssets: Record<string, Set<string>> = {}
    
    orders.forEach(o => {
      const name = o.client?.name || 'Interno / Genérico'
      const assetId = o.asset?.id
      if (assetId) {
        if (!clientAssets[name]) {
          clientAssets[name] = new Set()
        }
        clientAssets[name].add(assetId)
      }
    })

    return Object.entries(clientAssets)
      .map(([name, set]) => ({
        name: name.replace('Agropecuaria ', ''),
        equipos: set.size
      }))
      .sort((a, b) => b.equipos - a.equipos)
      .slice(0, 5)
  }, [orders])

  return (
    <div className="space-y-4">
      {/* Grid 1: Volume & Costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Clients by Volume */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top 5 Clientes por Volumen</CardTitle>
            <CardDescription className="text-[9px] text-slate-400 font-medium">Clientes con más órdenes registradas</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="h-[170px] w-full">
              {volumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} layout="vertical" margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide={true} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', padding: '6px' }} />
                    <Bar 
                      dataKey="value" 
                      fill="#6366f1" 
                      radius={[0, 3, 3, 0]}
                      barSize={14}
                      label={{ position: 'right', fill: '#4f46e5', fontSize: 9, fontWeight: 700, dx: 5 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No hay información de clientes.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Costs share by Client */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Costo de Mantenimiento por Cliente</CardTitle>
            <CardDescription className="text-[9px] text-slate-400 font-medium">Distribución porcentual de costos totales (COP)</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="flex h-[170px] items-center">
              <div className="flex-1 h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`$${val.toLocaleString()} COP`, 'Inversión']}
                      contentStyle={{ borderRadius: '8px', fontSize: '11px', padding: '6px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400">INVERSIÓN</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 px-2 select-none min-w-[150px]">
                {costData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-[9px] font-semibold">
                    <div className="flex items-center gap-1.5 truncate max-w-[100px]">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="text-slate-900 shrink-0">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid 2: MTTR & Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MTTR by Client */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tiempo de Cierre (MTTR) por Cliente</CardTitle>
            <CardDescription className="text-[9px] text-slate-400 font-medium">Promedio de días de resolución de servicios cerrados</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="h-[170px] w-full">
              {mttrData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mttrData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
                    />
                    <YAxis hide={true} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', padding: '6px' }} />
                    <Bar 
                      dataKey="dias" 
                      fill="#eab308" 
                      radius={[3, 3, 0, 0]}
                      barSize={20}
                      label={{ position: 'top', fill: '#ca8a04', fontSize: 9, fontWeight: 700, dy: -5, formatter: (v: any) => `${v} d` }}
                    >
                      {mttrData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No hay datos de cierre disponibles.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active machinery by Client */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Equipos en Operación</CardTitle>
            <CardDescription className="text-[9px] text-slate-400 font-medium">Cantidad de maquinaria con orden de trabajo activa</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="h-[170px] w-full">
              {assetsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assetsData} layout="vertical" margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide={true} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', padding: '6px' }} />
                    <Bar 
                      dataKey="equipos" 
                      fill="#10b981" 
                      radius={[0, 3, 3, 0]}
                      barSize={14}
                      label={{ position: 'right', fill: '#059669', fontSize: 9, fontWeight: 700, dx: 5 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No hay equipos activos registrados.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
