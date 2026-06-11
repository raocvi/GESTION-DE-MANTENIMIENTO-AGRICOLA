'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { FaultFrequencyData } from '@/modules/M12_lube_analyst/actions'

const COMPONENT_LABELS: Record<string, string> = {
  motor: 'Motor',
  transmission: 'Transmisión',
  hydraulic: 'Hidráulico',
  differential: 'Diferencial',
  final_drive: 'Mandos Finales',
}

const PIE_COLORS = [
  '#16a34a', '#dc2626', '#ca8a04', '#2563eb', '#0891b2',
  '#7c3aed', '#ea580c', '#db2777', '#65a30d', '#0284c7',
]

interface Props {
  data: Record<string, FaultFrequencyData>
}

export function FaultFrequencyChart({ data }: Props) {
  const [selectedComponent, setSelectedComponent] = useState('motor')
  const fd = data[selectedComponent]

  const pieData = fd?.rows.map((r, i) => ({
    name: r.label,
    value: r.count,
    color: PIE_COLORS[i % PIE_COLORS.length],
  })) ?? []

  return (
    <div className="chart-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-[14px] font-bold text-slate-700">
            Recurrencia de Fallas — {COMPONENT_LABELS[selectedComponent]}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Variables que superan límites · diagnósticos activos
          </p>
        </div>
        {/* Component selector */}
        <div className="flex gap-1">
          {Object.entries(COMPONENT_LABELS).map(([ct, label]) => (
            <button
              key={ct}
              onClick={() => setSelectedComponent(ct)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                selectedComponent === ct
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!fd || fd.total === 0 ? (
        <p className="text-[13px] text-slate-400 text-center py-10">Sin fallas registradas para este sistema.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Pie chart */}
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (percent < 0.04) return null
                    const RADIAN = Math.PI / 180
                    const r = innerRadius + (outerRadius - innerRadius) * 0.55
                    const x = cx + r * Math.cos(-midAngle * RADIAN)
                    const y = cy + r * Math.sin(-midAngle * RADIAN)
                    return (
                      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
                        style={{ fontSize: 11, fontWeight: 700 }}>
                        {`${Math.round(percent * 100)}%`}
                      </text>
                    )
                  }}
                  activeShape={undefined}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  formatter={(v: number, name: string) => [v, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Frequency table */}
          <div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-3 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Falla</th>
                  <th className="text-right py-2 px-2 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Límite</th>
                  <th className="text-right py-2 px-2 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Frec.</th>
                  <th className="text-right py-2 px-2 font-bold text-slate-500 uppercase tracking-wide text-[10px]">%</th>
                  <th className="text-right py-2 pl-2 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Acum.</th>
                </tr>
              </thead>
              <tbody>
                {fd.rows.map((r, i) => (
                  <tr key={r.variable} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="py-1.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="font-semibold text-slate-700">{r.label}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-right text-slate-500 num">
                      {r.limitValue != null ? `${r.limitValue} ${r.unit}` : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-right font-bold text-slate-800 num">{r.count}</td>
                    <td className="py-1.5 px-2 text-right">
                      <span className="font-semibold text-slate-700">{r.pct}%</span>
                    </td>
                    <td className="py-1.5 pl-2 text-right text-slate-400 num">{r.cumulPct}%</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300">
                  <td className="py-2 pr-3 font-bold text-slate-700">Total</td>
                  <td />
                  <td className="py-2 px-2 text-right font-extrabold text-slate-800 num">{fd.total}</td>
                  <td className="py-2 px-2 text-right font-bold text-slate-700">100%</td>
                  <td />
                </tr>
              </tbody>
            </table>

            {/* Mini bar showing pct distribution */}
            <div className="mt-4 flex h-2 rounded-full overflow-hidden gap-0.5">
              {fd.rows.map((r, i) => (
                <div
                  key={r.variable}
                  style={{ width: `${r.pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                  title={`${r.label}: ${r.pct}%`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
