// Generates a fully self-contained HTML report with Chart.js CDN

const TYPE_LABEL: Record<string, string> = {
  preventive: 'Preventivo', corrective: 'Correctivo', inspection: 'Inspección',
  predictive: 'Predictivo', lubrication: 'Lubricación', other: 'Otro',
}
const TYPE_COLORS: Record<string, string> = {
  preventive: '#10b981', corrective: '#f43f5e', inspection: '#3b82f6',
  predictive: '#8b5cf6', lubrication: '#f59e0b', other: '#64748b',
}

type ReportData = Parameters<typeof generateClientReportHTML>[0]

export function generateClientReportHTML(data: {
  client: { id: string; name: string; sector?: string | null; cropType?: string | null }
  generatedAt: string
  period: { from: string; to: string }
  kpis: {
    totalAssets: number; operativeAssets: number
    totalWOs: number; closedWOs: number
    preventiveCount: number; correctiveCount: number
    preventiveRatio: number; avgAvailability: number
    totalDowntimeHours: number; totalCost: number
    totalLaborCost: number; totalPartsCost: number
  }
  monthlyTrend: { month: string; preventive: number; corrective: number; inspection: number; other: number; cost: number }[]
  byType: Record<string, number>
  topComponents: { comp: string; count: number }[]
  byFailureMode: Record<string, number>
  assetMetrics: {
    id: string; code: string; name: string; category: string; model: string
    currentHours: number; operativeStatus: string
    woCount: number; correctiveCount: number; failureCount: number
    totalDowntime: number; totalCost: number; availPct: number
    mtbf: number | null; mttr: number | null
  }[]
  ganttWOs: {
    id: string; number: string; title: string; type: string; status: string; priority: string
    assetCode: string; techName: string
    startDate: string | Date; endDate: string | Date
    progress: number; estimatedHours: number | null; actualHours: number | null
  }[]
}): string {
  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
  const { kpis, monthlyTrend, byType, topComponents, assetMetrics, ganttWOs, client } = data
  const periodFrom = new Date(data.period.from).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  const periodTo = new Date(data.period.to).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  const genDate = new Date(data.generatedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })

  // ─── Gantt data preparation ─────────────────────────────────────────────────
  const ganttFiltered = ganttWOs.filter(w => w.startDate && w.endDate).slice(0, 20)
  const today = new Date(); today.setHours(0,0,0,0)
  let minTs = today.getTime(), maxTs = today.getTime()
  for (const w of ganttFiltered) {
    const s = new Date(w.startDate).getTime()
    const e = new Date(w.endDate).getTime()
    if (s < minTs) minTs = s
    if (e > maxTs) maxTs = e
  }
  const minDate = new Date(minTs - 86400000)
  const maxDate = new Date(maxTs + 86400000 * 2)
  const totalMs = maxDate.getTime() - minDate.getTime()
  const todayPct = Math.round(((today.getTime() - minDate.getTime()) / totalMs) * 100)

  const ganttRows = ganttFiltered.map(w => {
    const s = new Date(w.startDate); s.setHours(0,0,0,0)
    const e = new Date(w.endDate); e.setHours(0,0,0,0)
    const leftPct = Math.max(0, Math.round(((s.getTime() - minDate.getTime()) / totalMs) * 100))
    const widthPct = Math.max(1, Math.round(((e.getTime() - s.getTime()) / totalMs) * 100))
    const color = TYPE_COLORS[w.type] ?? '#64748b'
    const delayed = w.status !== 'closed' && e < today
    return `
      <div class="gantt-row">
        <div class="gantt-label">
          <strong>${w.assetCode}</strong>: ${w.title.length > 28 ? w.title.slice(0,28)+'…' : w.title}
          <span class="tech">${w.techName}</span>
        </div>
        <div class="gantt-track">
          <div class="today-line" style="left:${todayPct}%"></div>
          <div class="gantt-bar ${delayed ? 'delayed' : ''}" style="left:${leftPct}%;width:${widthPct}%;border-color:${delayed?'#f43f5e':color}">
            <div class="gantt-progress" style="width:${w.progress}%;background:${delayed?'#f43f5e':color}"></div>
            <span class="gantt-bar-text">${w.progress}% · ${w.number}</span>
          </div>
        </div>
      </div>`
  }).join('')

  // ─── Asset metrics table rows ────────────────────────────────────────────────
  const assetRows = assetMetrics.map(a => {
    const availColor = a.availPct >= 90 ? '#10b981' : a.availPct >= 75 ? '#f59e0b' : '#f43f5e'
    return `<tr>
      <td><strong>${a.code}</strong><br><small>${a.name}</small></td>
      <td>${a.model}</td>
      <td class="num">${a.currentHours.toFixed(0)}h</td>
      <td class="num">${a.woCount}</td>
      <td class="num" style="color:${a.totalDowntime > 0 ? '#f43f5e' : '#94a3b8'}">${a.totalDowntime}h</td>
      <td class="num">
        <span style="color:${availColor};font-weight:700">${a.availPct}%</span>
        <div class="avail-bar"><div class="avail-fill" style="width:${a.availPct}%;background:${availColor}"></div></div>
      </td>
      <td class="num">${a.mtbf != null ? a.mtbf+'h' : '—'}</td>
      <td class="num">${a.mttr != null ? a.mttr+'h' : '—'}</td>
      <td class="num">${a.totalCost > 0 ? fmt(a.totalCost) : '—'}</td>
    </tr>`
  }).join('')

  // ─── Serialize chart data ────────────────────────────────────────────────────
  const chartData = JSON.stringify({
    monthlyLabels: monthlyTrend.map(m => m.month),
    preventive: monthlyTrend.map(m => m.preventive),
    corrective: monthlyTrend.map(m => m.corrective),
    inspection: monthlyTrend.map(m => m.inspection),
    cost: monthlyTrend.map(m => m.cost),
    pieLabels: Object.keys(byType).map(t => TYPE_LABEL[t] ?? t),
    pieValues: Object.values(byType),
    pieColors: Object.keys(byType).map(t => TYPE_COLORS[t] ?? '#64748b'),
    compLabels: topComponents.map(c => c.comp.length > 20 ? c.comp.slice(0,20)+'…' : c.comp),
    compValues: topComponents.map(c => c.count),
    availLabels: assetMetrics.map(a => a.code),
    availValues: assetMetrics.map(a => a.availPct),
    availColors: assetMetrics.map(a => a.availPct >= 90 ? '#10b981' : a.availPct >= 75 ? '#f59e0b' : '#f43f5e'),
  })

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reporte de Mantenimiento — ${client.name}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
  :root{--blue:#3b82f6;--emerald:#10b981;--rose:#f43f5e;--amber:#f59e0b;--violet:#8b5cf6;--slate-900:#0f172a;--slate-700:#334155;--slate-500:#64748b;--slate-200:#e2e8f0;--slate-100:#f1f5f9}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:1200px;margin:0 auto;padding:32px 24px}
  /* Header */
  .header{background:linear-gradient(135deg,#0f1c2e 0%,#1e3a5f 100%);color:white;border-radius:16px;padding:32px;margin-bottom:24px}
  .header h1{font-size:28px;font-weight:800;margin-bottom:4px}
  .header .sub{opacity:0.7;font-size:14px}
  .header .period{background:rgba(255,255,255,.15);border-radius:8px;padding:8px 14px;display:inline-block;margin-top:12px;font-size:13px}
  .logo-row{display:flex;justify-content:space-between;align-items:flex-start}
  .logo-text{font-size:11px;opacity:0.6;text-align:right}
  /* KPI grid */
  .kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
  .kpi{background:white;border-radius:12px;padding:20px 16px;box-shadow:0 1px 3px rgba(0,0,0,.08);border:1px solid var(--slate-200)}
  .kpi .val{font-size:26px;font-weight:800;color:var(--slate-900)}
  .kpi .lbl{font-size:11px;color:var(--slate-500);margin-top:2px;font-weight:500;text-transform:uppercase;letter-spacing:.4px}
  .kpi .sub{font-size:10px;color:#94a3b8;margin-top:4px}
  .kpi-emerald .val{color:var(--emerald)} .kpi-rose .val{color:var(--rose)} .kpi-amber .val{color:var(--amber)} .kpi-blue .val{color:var(--blue)} .kpi-violet .val{color:var(--violet)}
  /* Cards */
  .card{background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.08);border:1px solid var(--slate-200);margin-bottom:24px}
  .card h2{font-size:15px;font-weight:700;color:var(--slate-900);margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .row2{display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:24px}
  .row2-equal{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
  @media(max-width:768px){.row2,.row2-equal{grid-template-columns:1fr}}
  /* Charts */
  .chart-wrap{position:relative;height:220px}
  /* Availability bars */
  .avail-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .avail-label{width:100px;font-size:12px;color:var(--slate-700);text-align:right;flex-shrink:0}
  .avail-track{flex:1;height:18px;background:var(--slate-100);border-radius:99px;overflow:hidden;position:relative}
  .avail-fill-line{height:100%;border-radius:99px;transition:width .6s}
  .avail-val{width:44px;font-size:12px;font-weight:700;text-align:right;flex-shrink:0}
  /* Table */
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:var(--slate-100);color:var(--slate-500);font-size:10px;text-transform:uppercase;letter-spacing:.5px;padding:8px 10px;text-align:left}
  td{padding:9px 10px;border-bottom:1px solid var(--slate-100);color:var(--slate-700)}
  td small{color:#94a3b8;font-size:10px;display:block}
  td.num{text-align:right}
  .avail-bar{height:3px;background:var(--slate-200);border-radius:2px;margin-top:3px;overflow:hidden}
  .avail-fill{height:100%;border-radius:2px}
  /* Gantt */
  .gantt-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .gantt-label{width:200px;flex-shrink:0;font-size:10px;color:var(--slate-700);text-align:right;padding-right:8px;line-height:1.3}
  .gantt-label .tech{display:block;color:#94a3b8;font-size:9px}
  .gantt-track{flex:1;height:22px;background:var(--slate-100);border-radius:99px;position:relative;overflow:hidden}
  .today-line{position:absolute;top:0;bottom:0;width:2px;background:var(--blue);z-index:2;opacity:.7}
  .gantt-bar{position:absolute;top:2px;bottom:2px;border-radius:99px;border:1.5px solid;overflow:hidden;display:flex;align-items:center;padding:0 6px;min-width:4px}
  .gantt-bar.delayed{border-color:var(--rose)!important}
  .gantt-progress{position:absolute;inset-y:0;left:0;border-radius:99px;opacity:.7}
  .gantt-bar-text{position:relative;z-index:1;font-size:8px;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden}
  /* Legend */
  .legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
  .legend-item{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--slate-500)}
  .legend-dot{width:8px;height:8px;border-radius:50%}
  /* Footer */
  .footer{text-align:center;padding:24px;font-size:11px;color:#94a3b8;margin-top:8px}
  @media print{.page{padding:12px}.header{border-radius:8px}}
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo-row">
      <div>
        <div style="font-size:11px;opacity:.5;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Informe de Gestión de Mantenimiento</div>
        <h1>${client.name}</h1>
        <p class="sub">${client.sector ?? client.cropType ?? 'Agroindustria'} · IMECOL S.A.S. — Distribuidor Oficial CASE IH</p>
        <div class="period">Período: ${periodFrom} — ${periodTo}</div>
      </div>
      <div class="logo-text">
        <div style="font-size:16px;font-weight:800">AgroMaint Pro</div>
        <div>Generado: ${genDate}</div>
      </div>
    </div>
  </div>

  <!-- KPIs -->
  <div class="kpi-grid">
    <div class="kpi kpi-blue">
      <div class="val">${kpis.operativeAssets}/${kpis.totalAssets}</div>
      <div class="lbl">Equipos Operativos</div>
      <div class="sub">del total de flota</div>
    </div>
    <div class="kpi kpi-violet">
      <div class="val">${kpis.totalWOs}</div>
      <div class="lbl">OTs (12 meses)</div>
      <div class="sub">${kpis.closedWOs} cerradas</div>
    </div>
    <div class="kpi ${kpis.preventiveRatio >= 60 ? 'kpi-emerald' : 'kpi-amber'}">
      <div class="val">${kpis.preventiveRatio}%</div>
      <div class="lbl">Ratio Preventivo</div>
      <div class="sub">${kpis.preventiveCount} prev · ${kpis.correctiveCount} corr</div>
    </div>
    <div class="kpi ${kpis.avgAvailability >= 85 ? 'kpi-emerald' : kpis.avgAvailability >= 70 ? 'kpi-amber' : 'kpi-rose'}">
      <div class="val">${kpis.avgAvailability}%</div>
      <div class="lbl">Disponibilidad Prom.</div>
      <div class="sub">promedio flota</div>
    </div>
    <div class="kpi kpi-rose">
      <div class="val">${kpis.totalDowntimeHours}h</div>
      <div class="lbl">Horas de Parada</div>
      <div class="sub">acumulado período</div>
    </div>
    <div class="kpi kpi-amber">
      <div class="val" style="font-size:18px">${fmt(kpis.totalCost)}</div>
      <div class="lbl">Costo Mantenimiento</div>
      <div class="sub">M.O: ${fmt(kpis.totalLaborCost)} · Repuestos: ${fmt(kpis.totalPartsCost)}</div>
    </div>
  </div>

  <!-- Charts row 1: Monthly trend + Type pie -->
  <div class="row2">
    <div class="card" style="margin:0">
      <h2>📊 Tendencia Mensual de OTs</h2>
      <div class="chart-wrap"><canvas id="chartMonthly"></canvas></div>
    </div>
    <div class="card" style="margin:0">
      <h2>🔵 Distribución por Tipo</h2>
      <div class="chart-wrap"><canvas id="chartPie"></canvas></div>
    </div>
  </div>

  <!-- Availability per asset -->
  <div class="card">
    <h2>✅ Disponibilidad por Equipo</h2>
    <div id="availBars"></div>
    <div class="legend" style="margin-top:16px">
      <div class="legend-item"><div class="legend-dot" style="background:#10b981"></div> ≥ 90% (Óptimo)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div> 75–89% (Aceptable)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#f43f5e"></div> &lt; 75% (Crítico)</div>
    </div>
  </div>

  <!-- Charts row 2: Cost + Components -->
  <div class="row2-equal">
    <div class="card" style="margin:0">
      <h2>💰 Costo Mensual</h2>
      <div class="chart-wrap"><canvas id="chartCost"></canvas></div>
    </div>
    <div class="card" style="margin:0">
      <h2>🔧 Top Componentes</h2>
      <div class="chart-wrap"><canvas id="chartComp"></canvas></div>
    </div>
  </div>

  <!-- Asset metrics table -->
  <div class="card">
    <h2>📋 Indicadores por Equipo</h2>
    <div style="overflow-x:auto">
      <table>
        <thead><tr>
          <th>Equipo</th><th>Modelo</th><th>Horómetro</th><th>OTs</th>
          <th>H. Parada</th><th>Disponibilidad</th><th>MTBF</th><th>MTTR</th><th>Costo</th>
        </tr></thead>
        <tbody>${assetRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Gantt -->
  ${ganttFiltered.length > 0 ? `
  <div class="card">
    <h2>📅 Cronograma de Actividades</h2>
    <p style="font-size:11px;color:#94a3b8;margin-bottom:12px">Línea azul = hoy · Barra roja = actividad retrasada</p>
    ${ganttRows}
    <div class="legend" style="margin-top:16px">
      ${Object.entries(TYPE_COLORS).map(([t,c]) => `<div class="legend-item"><div class="legend-dot" style="background:${c}"></div>${TYPE_LABEL[t]??t}</div>`).join('')}
    </div>
  </div>` : ''}

  <div class="footer">
    Reporte generado por AgroMaint Pro · IMECOL S.A.S. · ${genDate}<br>
    Información confidencial — uso exclusivo del cliente
  </div>

</div>

<script>
const D = ${chartData};
const defaults = Chart.defaults;
defaults.font.family = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
defaults.font.size = 11;
defaults.color = '#64748b';

// Monthly trend
new Chart(document.getElementById('chartMonthly'), {
  type: 'bar',
  data: {
    labels: D.monthlyLabels,
    datasets: [
      { label:'Preventivo', data: D.preventive, backgroundColor:'#10b981', stack:'a' },
      { label:'Correctivo', data: D.corrective, backgroundColor:'#f43f5e', stack:'a' },
      { label:'Inspección', data: D.inspection, backgroundColor:'#3b82f6', stack:'a', borderRadius:{topLeft:4,topRight:4} },
    ]
  },
  options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{position:'bottom',labels:{boxWidth:10,padding:8}} }, scales:{ x:{grid:{display:false}}, y:{grid:{color:'#f1f5f9'}} } }
});

// Pie
new Chart(document.getElementById('chartPie'), {
  type: 'doughnut',
  data: { labels: D.pieLabels, datasets: [{ data: D.pieValues, backgroundColor: D.pieColors, borderWidth:2, borderColor:'#fff' }] },
  options: { responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{position:'bottom',labels:{boxWidth:8,padding:6}} } }
});

// Cost line
new Chart(document.getElementById('chartCost'), {
  type: 'line',
  data: { labels: D.monthlyLabels, datasets: [{ label:'Costo', data: D.cost, borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,.15)', fill:true, tension:.4, pointRadius:3 }] },
  options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false} }, scales:{ x:{grid:{display:false}}, y:{grid:{color:'#f1f5f9'}, ticks:{ callback: v => v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'k':v } } } }
});

// Top components
new Chart(document.getElementById('chartComp'), {
  type: 'bar',
  data: { labels: D.compLabels, datasets: [{ label:'Intervenciones', data: D.compValues, backgroundColor:'#8b5cf6', borderRadius:4 }] },
  options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false} }, scales:{ x:{grid:{color:'#f1f5f9'}}, y:{grid:{display:false}} } }
});

// Availability bars (HTML, not Chart.js)
const availDiv = document.getElementById('availBars');
D.availLabels.forEach((lbl, i) => {
  const pct = D.availValues[i], color = D.availColors[i];
  availDiv.innerHTML += \`
    <div class="avail-row">
      <div class="avail-label">\${lbl}</div>
      <div class="avail-track">
        <div class="avail-fill-line" style="width:\${pct}%;background:\${color}"></div>
      </div>
      <div class="avail-val" style="color:\${color}">\${pct}%</div>
    </div>\`;
});
</script>
</body>
</html>`
}
