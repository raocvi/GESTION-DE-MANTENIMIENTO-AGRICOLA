import React, { useMemo } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core/components/ui/card'
import { differenceInDays } from 'date-fns'

// Color Palettes
const PIE_COLORS = ['#0052cc', '#b91c1c', '#10b981'] // Brand Blue (Preventive), Red (Corrective), Green (Inspection)
const BAR_COLORS = ['#b91c1c', '#854d0e', '#a16207', '#0052cc', '#1e3a8a'] // Red, Gold, Bronze, Blue, Navy
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#e11d48', // Red
  high: '#f97316',     // Orange
  medium: '#eab308',   // Yellow
  low: '#3b82f6'       // Blue
}

interface DashboardChartsProps {
  orders: any[]
  selectedType: string | null
  onSelectType: (type: string | null) => void
  selectedTech: string | null
  onSelectTech: (techName: string | null) => void
}

const TYPE_LABELS: Record<string, string> = {
  preventive: 'Preventivo',
  corrective: 'Correctivo',
  inspection: 'Inspección',
  predictive: 'Predictivo',
  warranty: 'Garantía',
  emergency: 'Emergencia',
  campaign: 'Campaña',
  predelivery: 'Alistamiento',
  seasonal_pre: 'Rev. Pretemporada',
  seasonal_post: 'Rev. Posttemporada',
  daily_operator: 'Rev. Diaria'
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
}

export function DashboardCharts({ 
  orders, 
  selectedType, 
  onSelectType,
  selectedTech,
  onSelectTech
}: DashboardChartsProps) {
  
  // 1. Donut Chart Data: Type Distribution
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach(o => {
      counts[o.type] = (counts[o.type] || 0) + 1
    })
    
    const total = orders.length || 1
    return Object.entries(counts).map(([type, value]) => ({
      type,
      name: TYPE_LABELS[type] || type,
      value,
      percentage: Math.round((value / total) * 100)
    })).sort((a, b) => b.value - a.value)
  }, [orders])

  // 2. Bar Chart Data (Delay Days per Technician)
  const barData = useMemo(() => {
    const techDelays: Record<string, { totalDays: number; count: number }> = {}
    const now = new Date()

    orders.forEach(o => {
      if (o.assignedTo?.name && o.dueDate) {
        const dueDate = new Date(o.dueDate)
        let delay = 0
        
        if (o.status === 'closed' || o.status === 'completed') {
          const closedDate = o.closedAt ? new Date(o.closedAt) : new Date(o.createdAt)
          delay = differenceInDays(closedDate, dueDate)
        } else {
          delay = differenceInDays(now, dueDate)
        }

        if (delay > 0) {
          if (!techDelays[o.assignedTo.name]) {
            techDelays[o.assignedTo.name] = { totalDays: 0, count: 0 }
          }
          techDelays[o.assignedTo.name].totalDays += delay
          techDelays[o.assignedTo.name].count += 1
        }
      }
    })

    return Object.entries(techDelays)
      .map(([name, data]) => ({
        name: name.split(' ').slice(0, 2).join(' '), // Short name
        fullName: name,
        days: parseFloat(data.totalDays.toFixed(1))
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 5) // Top 5
  }, [orders])

  // 3. New Donut Chart: Priority Distribution
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    orders.forEach(o => {
      const p = o.priority ? o.priority.toLowerCase() : 'medium'
      counts[p] = (counts[p] || 0) + 1
    })

    const total = orders.length || 1
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([priority, value]) => ({
        priority,
        name: PRIORITY_LABELS[priority] || priority,
        value,
        percentage: Math.round((value / total) * 100)
      }))
  }, [orders])

  // 4. New Horizontal Bar Chart: Top 5 Failing/Corrective Assets
  const assetData = useMemo(() => {
    const assetCounts: Record<string, number> = {}
    
    // Count corrective work orders per asset
    orders.filter(o => o.type === 'corrective').forEach(o => {
      const code = o.asset?.internalCode || 'Sin Código'
      assetCounts[code] = (assetCounts[code] || 0) + 1
    })

    return Object.entries(assetCounts)
      .map(([code, count]) => ({
        code,
        Correctivas: count
      }))
      .sort((a, b) => b.Correctivas - a.Correctivas)
      .slice(0, 5)
  }, [orders])

  // 5. Bottom Trend Chart (Last 6 Months)
  const trendData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const last6: { year: number; monthIndex: number; name: string; Abiertas: number; Cerradas: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      last6.push({
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        name: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        Abiertas: 0,
        Cerradas: 0
      })
    }

    orders.forEach(o => {
      const createdDate = new Date(o.createdAt)
      const closedDate = o.closedAt ? new Date(o.closedAt) : null

      last6.forEach(m => {
        if (createdDate.getFullYear() === m.year && createdDate.getMonth() === m.monthIndex) {
          m.Abiertas++
        }
        if (closedDate && closedDate.getFullYear() === m.year && closedDate.getMonth() === m.monthIndex) {
          m.Cerradas++
        }
      })
    })

    return last6
  }, [orders])

  return (
    <div className="space-y-5">
      {/* ROW 1: 3 Column Grid for Compact Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Chart 1: Donut (Servicios por Tipo) */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Órdenes por Tipo</CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-medium">Distribución por tipo de mantenimiento</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="flex flex-col h-[200px]">
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => {
                        const isSelected = selectedType === entry.type
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PIE_COLORS[index % PIE_COLORS.length]} 
                            onClick={() => onSelectType(selectedType === entry.type ? null : entry.type)}
                            className={`hover:opacity-85 transition-all cursor-pointer outline-none ${
                              selectedType && !isSelected ? 'opacity-30' : 'opacity-100'
                            }`} 
                          />
                        )
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} (${props.payload.percentage}%)`, 
                        name
                      ]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', padding: '6px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-800 tracking-tighter">100%</span>
                  <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">TOTAL</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-x-3 flex-wrap text-[10px] font-semibold mt-2">
                {pieData.map((item, index) => (
                  <div key={item.type} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-slate-600">{item.name} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Bars (Retraso por Técnico) */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Retrasos por Responsable</CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-medium">Días acumulados de retraso</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="h-[200px] w-full">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                    />
                    <YAxis hide={true} />
                    <Tooltip 
                      formatter={(value) => [`${value} días`, 'Retraso']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', padding: '6px' }}
                    />
                    <Bar 
                      dataKey="days" 
                      radius={[3, 3, 0, 0]} 
                      barSize={24}
                      label={{ 
                        position: 'top', 
                        fill: '#b91c1c', 
                        fontSize: 10, 
                        fontWeight: 700, 
                        formatter: (v: any) => `${v} d`,
                        dy: -5 
                      }}
                    >
                      {barData.map((entry, index) => {
                        const isSelected = selectedTech === entry.fullName
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={BAR_COLORS[index % BAR_COLORS.length]} 
                            onClick={() => onSelectTech(selectedTech === entry.fullName ? null : entry.fullName)}
                            className={`hover:opacity-85 cursor-pointer transition-all ${
                              selectedTech && !isSelected ? 'opacity-30' : 'opacity-100'
                            }`}
                          />
                        )
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] text-slate-400">
                  No hay órdenes retrasadas.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Donut (Distribución por Prioridad) - NEW */}
        <Card className="hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Órdenes por Prioridad</CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-medium">Clasificación por severidad operativa</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="flex flex-col h-[200px]">
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell 
                          key={`cell-p-${index}`} 
                          fill={PRIORITY_COLORS[entry.priority] || '#94a3b8'} 
                          className="hover:opacity-85 outline-none" 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} (${props.payload.percentage}%)`, 
                        name
                      ]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', padding: '6px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-slate-400 tracking-wider">PRIORIDAD</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-x-3 flex-wrap text-[10px] font-semibold mt-2">
                {priorityData.map((item) => (
                  <div key={item.priority} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[item.priority] }} />
                    <span className="text-slate-600">{item.name} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: 2 Column Grid (Wide Trend & Top Failing Assets) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Chart 4: Wide Trend Line/Area (8 cols) */}
        <Card className="md:col-span-8 hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tendencia de Servicios (Últimos 6 Meses)</CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-medium">Comparativa de volumen de órdenes abiertas vs cerradas</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAbiertas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCerradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', padding: '6px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={25} 
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 600, color: '#334155', marginTop: '-10px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Abiertas" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAbiertas)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Cerradas" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCerradas)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 5: Horizontal Bar Chart of Assets Failures (4 cols) - NEW */}
        <Card className="md:col-span-4 hover-lift soft-shadow border-slate-200/60 overflow-hidden bg-white">
          <CardHeader className="py-2.5 px-4">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Equipos con Más Correctivos</CardTitle>
            <CardDescription className="text-[10px] text-slate-400 font-medium">Top 5 equipos por frecuencia de falla</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="h-[210px] w-full">
              {assetData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={assetData} 
                    layout="vertical"
                    margin={{ top: 10, right: 25, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide={true} />
                    <YAxis 
                      dataKey="code" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} correctivas`, 'Servicios Correctivos']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', padding: '6px' }}
                    />
                    <Bar 
                      dataKey="Correctivas" 
                      fill="#8b5cf6" // Violet bar
                      radius={[0, 3, 3, 0]} 
                      barSize={18}
                      label={{ 
                        position: 'right', 
                        fill: '#6d28d9', 
                        fontSize: 10, 
                        fontWeight: 700,
                        dx: 5
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] text-slate-400">
                  No hay fallas registradas.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
