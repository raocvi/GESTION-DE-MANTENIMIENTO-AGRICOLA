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

const BAR_COLORS = ['#b91c1c', '#d97706', '#059669', '#2563eb', '#7c3aed']
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#94a3b8']

export function TechDashboardCharts({ orders }: { orders: any[] }) {
  
  const now = useMemo(() => new Date(), [])

  // 1. MTTR (Mean Time To Resolution) by Technician
  const mttrData = useMemo(() => {
    const techTimes: Record<string, { totalDays: number; count: number }> = {}

    orders.filter(o => o.status === 'closed' && o.closedAt).forEach(o => {
      const name = o.assignedTo?.name
      if (!name) return

      const start = o.startedAt ? new Date(o.startedAt) : new Date(o.createdAt)
      const end = new Date(o.closedAt)
      const duration = Math.max(1, differenceInDays(end, start))

      if (!techTimes[name]) {
        techTimes[name] = { totalDays: 0, count: 0 }
      }
      techTimes[name].totalDays += duration
      techTimes[name].count++
    })

    return Object.entries(techTimes)
      .map(([name, data]) => ({
        name: name.split(' ').slice(0, 2).join(' '),
        dias: parseFloat((data.totalDays / data.count).toFixed(1))
      }))
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 5)
  }, [orders])

  // 2. Active Workload (Pending/In Progress OTs) per Technician
  const workloadData = useMemo(() => {
    const techCounts: Record<string, number> = {}

    orders.filter(o => o.status !== 'closed' && o.status !== 'completed').forEach(o => {
      const name = o.assignedTo?.name
      if (name) {
        techCounts[name] = (techCounts[name] || 0) + 1
      }
    })

    const total = Object.values(techCounts).reduce((a, b) => a + b, 0) || 1
    return Object.entries(techCounts)
      .map(([name, count]) => ({
        name: name.split(' ').slice(0, 2).join(' '),
        value: count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [orders])

  // 3. Productivity: Total Closed OTs vs Delayed OTs
  const productivityData = useMemo(() => {
    const stats: Record<string, { completadas: number; retrasadas: number }> = {}

    orders.forEach(o => {
      const name = o.assignedTo?.name
      if (!name) return

      if (!stats[name]) {
        stats[name] = { completadas: 0, retrasadas: 0 }
      }

      if (o.status === 'closed' || o.status === 'completed') {
        stats[name].completadas++
      }

      // Check if it suffered delay
      if (o.dueDate) {
        const dueDate = new Date(o.dueDate)
        let isDelayed = false
        if (o.status === 'closed' || o.status === 'completed') {
          const closedDate = o.closedAt ? new Date(o.closedAt) : new Date(o.createdAt)
          isDelayed = differenceInDays(closedDate, dueDate) > 0
        } else {
          isDelayed = differenceInDays(now, dueDate) > 0
        }
        if (isDelayed) {
          stats[name].retrasadas++
        }
      }
    })

    return Object.entries(stats)
      .map(([name, data]) => ({
        name: name.split(' ').slice(0, 2).join(' '),
        Completadas: data.completadas,
        Retrasadas: data.retrasadas
      }))
      .sort((a, b) => b.Completadas - a.Completadas)
      .slice(0, 5)
  }, [orders, now])

  // 4. Total Hours worked per Technician (labor hours)
  const hoursData = useMemo(() => {
    const techHours: Record<string, number> = {}

    orders.forEach(o => {
      const name = o.assignedTo?.name
      if (name && o.actualHours) {
        techHours[name] = (techHours[name] || 0) + o.actualHours
      }
    })

    return Object.entries(techHours)
      .map(([name, hours]) => ({
        name: name.split(' ').slice(0, 2).join(' '),
        horas: parseFloat(hours.toFixed(1))
      }))
      .sort((a, b) => b.horas - a.horas)
      .slice(0, 5)
  }, [orders])

  return (
    <div className="space-y-4">
      {/* Grid 1: MTTR & Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MTTR by Technician */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tiempo de Cierre (MTTR) por Técnico</CardTitle>
            <CardDescription className="text-[9px] text-slate-400 font-medium">Promedio de días de resolución de órdenes cerradas</CardDescription>
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
                      fill="#d97706" 
                      radius={[3, 3, 0, 0]}
                      barSize={20}
                      label={{ position: 'top', fill: '#b45309', fontSize: 9, fontWeight: 700, dy: -5, formatter: (v: any) => `${v} d` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No hay datos de resolución.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Workload share */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Distribución de Carga Activa</CardTitle>
            <CardDescription className="text-[9px] text-slate-400 font-medium">Participación porcentual de órdenes de trabajo activas</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="flex h-[170px] items-center">
              <div className="flex-1 h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workloadData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {workloadData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', padding: '6px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400">CARGA</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 px-2 select-none min-w-[150px]">
                {workloadData.map((item, index) => (
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

      {/* Grid 2: Productivity & Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Productivity ratio */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Productividad del Personal</CardTitle>
            <CardDescription className="text-[9px] text-slate-400 font-medium">Órdenes completadas vs Órdenes con retraso</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="h-[170px] w-full">
              {productivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
                    />
                    <YAxis hide={true} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', padding: '6px' }} />
                    <Legend 
                      verticalAlign="top" 
                      height={20} 
                      iconSize={6}
                      wrapperStyle={{ fontSize: '9px', fontWeight: 600, marginTop: '-5px' }}
                    />
                    <Bar dataKey="Completadas" fill="#10b981" radius={[3, 3, 0, 0]} barSize={10} />
                    <Bar dataKey="Retrasadas" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No hay datos de productividad.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Hours Worked */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Horas Laboradas Acumuladas</CardTitle>
            <CardDescription className="text-[9px] text-slate-400 font-medium">Total de horas reales registradas por técnico</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="h-[170px] w-full">
              {hoursData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hoursData} layout="vertical" margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
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
                      dataKey="horas" 
                      fill="#8b5cf6" 
                      radius={[0, 3, 3, 0]}
                      barSize={14}
                      label={{ position: 'right', fill: '#6d28d9', fontSize: 9, fontWeight: 700, dx: 5, formatter: (v: any) => `${v}h` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No hay horas registradas.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
