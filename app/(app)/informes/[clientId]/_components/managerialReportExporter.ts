import type { ReliabilityKpis, MachineFailureRanking, SystemFailureRanking } from '@/modules/M11_reliability/actions'

interface ProjectTask {
  id: string; name: string; progress: number; status: string
  startDate: string | null; endDate: string | null
}
interface Project {
  id: string; number: string; title: string; status: string
  scheduledDate: string | null; dueDate: string | null
  asset: { name: string; internalCode: string | null } | null
  tasks: ProjectTask[]
}

interface ExportProps {
  client: { id: string; name: string; city: string | null; department: string | null; contactName: string | null; phone: string | null }
  kpis: ReliabilityKpis
  machines: MachineFailureRanking[]
  systems: SystemFailureRanking[]
  upcoming: Array<{
    id: string; title: string; system: string | null; intervalLabel: string | null
    dueHours: number | null; status: string; hoursRemaining: number
    assetName: string; internalCode: string | null; currentHours: number
  }>
  assets: Array<{
    id: string; name: string; internalCode: string | null; currentHours: number
    operativeStatus: string; criticality: string; model: { name: string } | null
  }>
  projects: Project[]
  generatedAt: string
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  operative:      { label: 'Operativo',        color: '#10b981' },
  maintenance:    { label: 'En Mantenimiento',  color: '#f59e0b' },
  out_of_service: { label: 'Fuera de Servicio', color: '#f43f5e' },
  warranty:       { label: 'En Garantía',       color: '#3b82f6' },
  diagnosis:      { label: 'En Diagnóstico',    color: '#8b5cf6' },
  pending_parts:  { label: 'Espera Repuestos',  color: '#f97316' },
  retired:        { label: 'Dado de Baja',      color: '#94a3b8' },
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtNum(n: number) {
  return n.toLocaleString('es-CO')
}

export function generateManagerialReportHTML(props: ExportProps): string {
  const { client, kpis, machines, systems, upcoming, assets, projects, generatedAt } = props
  const operative = assets.filter(a => a.operativeStatus === 'operative').length
  const fleetAvailability = assets.length ? Math.round((operative / assets.length) * 100) : 100
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.tasks.length ? p.tasks.reduce((x, t) => x + t.progress, 0) / p.tasks.length : 0), 0) / projects.length)
    : 0
  const overdueCount = upcoming.filter(u => u.status === 'overdue').length

  // ─── Fleet status bar chart data ──────────────────────────────────────────
  const statusCounts: Record<string, number> = {}
  for (const a of assets) statusCounts[a.operativeStatus] = (statusCounts[a.operativeStatus] ?? 0) + 1
  const statusEntries = Object.entries(statusCounts)

  // ─── Gantt rows HTML ───────────────────────────────────────────────────────
  function ganttBlock(p: Project): string {
    const prog = p.tasks.length ? Math.round(p.tasks.reduce((s, t) => s + t.progress, 0) / p.tasks.length) : 0
    const dated = p.tasks.filter(t => t.startDate && t.endDate)
    const today = Date.now()

    let tasksHtml = ''
    if (dated.length) {
      const min = Math.min(...dated.map(t => new Date(t.startDate!).getTime()))
      const max = Math.max(...dated.map(t => new Date(t.endDate!).getTime()))
      const span = Math.max(max - min, 1)
      const todayPct = today >= min && today <= max ? ((today - min) / span) * 100 : -1

      tasksHtml = `<div class="gantt-wrap" style="position:relative">
        ${todayPct >= 0 ? `<div class="today-line" style="left:calc(176px + (100% - 176px - 36px) * ${todayPct / 100})"></div>` : ''}
        ${dated.slice(0, 8).map(t => {
          const s = new Date(t.startDate!).getTime()
          const e = new Date(t.endDate!).getTime()
          const left = ((s - min) / span) * 100
          const width = Math.max(((e - s) / span) * 100, 3)
          const isLate = t.progress < 100 && e < today
          const barColor = t.progress === 100 ? '#10b981' : isLate ? '#f43f5e' : t.progress > 0 ? '#3b82f6' : '#cbd5e1'
          return `<div class="gantt-row">
            <span class="gantt-label">${t.name}</span>
            <div class="gantt-track">
              <div class="gantt-bar" style="left:${left}%;width:${width}%;background:${barColor}">
                <div class="gantt-dark" style="width:${100 - t.progress}%;margin-left:${t.progress}%"></div>
              </div>
            </div>
            <span class="gantt-pct">${t.progress}%</span>
          </div>`
        }).join('')}
      </div>`
    } else {
      tasksHtml = p.tasks.slice(0, 6).map(t => {
        const c = t.progress === 100 ? '#10b981' : t.progress > 0 ? '#3b82f6' : '#cbd5e1'
        return `<div class="gantt-row">
          <span class="gantt-label">${t.name}</span>
          <div class="gantt-track"><div class="gantt-bar" style="width:${Math.max(t.progress,2)}%;background:${c}"></div></div>
          <span class="gantt-pct">${t.progress}%</span>
        </div>`
      }).join('')
    }

    return `<div class="project-card">
      <div class="project-header">
        <div>
          <div class="project-title">${p.title}</div>
          <div class="project-meta">${p.number} · ${p.asset?.internalCode ?? p.asset?.name ?? '—'} · Entrega: ${fmtDate(p.dueDate)}</div>
        </div>
        <div class="project-prog-wrap">
          <div class="project-prog-track"><div class="project-prog-fill" style="width:${prog}%;background:${prog===100?'#10b981':'#3b82f6'}"></div></div>
          <span class="project-pct">${prog}%</span>
        </div>
      </div>
      ${tasksHtml}
    </div>`
  }

  // ─── Fleet rows ────────────────────────────────────────────────────────────
  const fleetRows = assets.slice(0, 15).map(a => {
    const st = STATUS_LABEL[a.operativeStatus] ?? { label: a.operativeStatus, color: '#94a3b8' }
    return `<tr>
      <td><strong>${a.internalCode ?? a.name}</strong></td>
      <td>${a.model?.name ?? '—'}</td>
      <td class="num">${fmtNum(a.currentHours)} h</td>
      <td><span class="badge" style="background:${st.color}22;color:${st.color}">${st.label}</span></td>
    </tr>`
  }).join('')

  // ─── Upcoming maintenance rows ─────────────────────────────────────────────
  const upcomingRows = upcoming.map(u => {
    const statusColor = u.status === 'overdue' ? '#f43f5e' : u.status === 'due_soon' ? '#f59e0b' : '#64748b'
    const statusLabel = u.status === 'overdue' ? 'Vencido' : u.status === 'due_soon' ? 'Próximo' : 'Programado'
    const remColor = u.hoursRemaining < 0 ? '#f43f5e' : '#334155'
    const remText = u.hoursRemaining < 0 ? `Vencido ${Math.abs(u.hoursRemaining)} h` : `${fmtNum(u.hoursRemaining)} h`
    return `<tr>
      <td><span class="badge" style="background:${statusColor}22;color:${statusColor}">${statusLabel}</span></td>
      <td><strong>${u.internalCode ?? u.assetName}</strong></td>
      <td class="small">${u.title.length > 40 ? u.title.slice(0,40)+'…' : u.title}</td>
      <td class="small">${u.intervalLabel ?? '—'}</td>
      <td class="num">${u.dueHours != null ? fmtNum(u.dueHours)+' h' : '—'}</td>
      <td class="num" style="color:${remColor};font-weight:700">${remText}</td>
    </tr>`
  }).join('')

  // ─── Chart data JSON ───────────────────────────────────────────────────────
  const chartData = JSON.stringify({
    systemLabels:  systems.map(s => s.system.length > 22 ? s.system.slice(0,22)+'…' : s.system),
    systemValues:  systems.map(s => s.failures),
    machineLabels: machines.slice(0,6).map(m => m.internalCode ?? m.assetName),
    machineValues: machines.slice(0,6).map(m => m.failures),
    machineMttr:   machines.slice(0,6).map(m => m.mttr),
    statusLabels:  statusEntries.map(([k]) => STATUS_LABEL[k]?.label ?? k),
    statusValues:  statusEntries.map(([,v]) => v),
    statusColors:  statusEntries.map(([k]) => STATUS_LABEL[k]?.color ?? '#94a3b8'),
    fleetAvail: fleetAvailability,
    mtbf: kpis.mtbf,
    mttr: kpis.mttr,
    totalFailures: kpis.totalFailures,
    totalDowntime: kpis.totalDowntime,
  })

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Informe Gerencial — ${client.name}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
  :root{--blue:#2563eb;--navy:#0f1c2e;--emerald:#10b981;--rose:#f43f5e;--amber:#f59e0b;--violet:#8b5cf6;--s900:#0f172a;--s700:#334155;--s500:#64748b;--s200:#e2e8f0;--s100:#f1f5f9;--s50:#f8fafc}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--s50);color:var(--s700);-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:13px}
  a{color:inherit;text-decoration:none}
  .page{max-width:1100px;margin:0 auto;padding:32px 20px}

  /* ── Header ─────────────────────────────────────────────────────── */
  .header{background:linear-gradient(135deg,#0f1c2e 0%,#1a3a6e 100%);color:white;border-radius:16px;overflow:hidden;margin-bottom:24px;box-shadow:0 4px 24px rgba(15,28,46,.35)}
  .header-inner{padding:32px 36px}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
  .header-badge{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.2em;color:#93c5fd;margin-bottom:8px}
  .header h1{font-size:28px;font-weight:800;letter-spacing:-.5px}
  .header-sub{font-size:12px;color:#bfdbfe;margin-top:4px}
  .header-brand{text-align:right}
  .header-brand .brand-name{font-size:16px;font-weight:800;display:flex;align-items:center;gap:6px;justify-content:flex-end}
  .header-brand .brand-sub{font-size:10px;color:#93c5fd;margin-top:2px}
  .header-brand .brand-date{font-size:10px;color:#93c5fd}
  .exec-summary{background:white;border-top:0;padding:20px 36px;font-size:13px;color:var(--s500);line-height:1.7;border-top:1px solid rgba(255,255,255,.1)}
  .exec-summary strong{color:var(--s900)}

  /* ── Cards / Grid ────────────────────────────────────────────────── */
  .card{background:white;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.07);border:1px solid var(--s200);margin-bottom:20px}
  .card-title{font-size:14px;font-weight:700;color:var(--s900);margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .card-title .icon{width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  @media(max-width:700px){.grid2,.grid4{grid-template-columns:1fr 1fr}.grid4{grid-template-columns:1fr 1fr}}
  @media(max-width:440px){.grid2{grid-template-columns:1fr}}

  /* ── KPI Cards ───────────────────────────────────────────────────── */
  .kpi{background:white;border-radius:12px;padding:20px 18px;box-shadow:0 1px 4px rgba(0,0,0,.07);border:1px solid var(--s200)}
  .kpi-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--s500);margin-bottom:10px}
  .kpi-val{font-size:26px;font-weight:800;letter-spacing:-.5px;font-variant-numeric:tabular-nums}
  .kpi-hint{font-size:10px;color:#94a3b8;margin-top:4px}

  /* ── Charts ──────────────────────────────────────────────────────── */
  .chart-wrap{position:relative;height:220px}
  .chart-wrap-sm{position:relative;height:180px}

  /* ── Tables ──────────────────────────────────────────────────────── */
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:var(--s100);color:var(--s500);font-size:9px;text-transform:uppercase;letter-spacing:.06em;padding:7px 10px;text-align:left;font-weight:700}
  td{padding:9px 10px;border-bottom:1px solid var(--s100);color:var(--s700);vertical-align:middle}
  td.num{text-align:right;font-variant-numeric:tabular-nums}
  td.small{font-size:11px}
  tr:hover td{background:var(--s50)}
  .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600}

  /* ── Gantt ───────────────────────────────────────────────────────── */
  .project-card{border:1px solid var(--s200);border-radius:10px;padding:16px;margin-bottom:12px}
  .project-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px}
  .project-title{font-size:13px;font-weight:700;color:var(--s900)}
  .project-meta{font-size:11px;color:var(--s500);margin-top:2px}
  .project-prog-wrap{display:flex;align-items:center;gap:8px}
  .project-prog-track{width:100px;height:6px;background:var(--s100);border-radius:99px;overflow:hidden}
  .project-prog-fill{height:100%;border-radius:99px}
  .project-pct{font-size:13px;font-weight:800;color:var(--s700);min-width:36px;text-align:right}
  .gantt-wrap{position:relative;display:flex;flex-direction:column;gap:5px}
  .today-line{position:absolute;top:0;bottom:0;width:2px;background:#3b82f6;z-index:2;opacity:.7;pointer-events:none}
  .gantt-row{display:flex;align-items:center;gap:6px}
  .gantt-label{width:168px;flex-shrink:0;font-size:10px;font-weight:500;color:var(--s500);text-align:right;padding-right:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .gantt-track{flex:1;height:12px;background:var(--s100);border-radius:99px;position:relative;overflow:hidden}
  .gantt-bar{position:absolute;top:0;height:100%;border-radius:99px}
  .gantt-dark{height:100%;border-radius:99px;background:rgba(0,0,0,.15)}
  .gantt-pct{width:32px;flex-shrink:0;font-size:10px;font-weight:700;text-align:right;color:var(--s500)}

  /* ── Footer ──────────────────────────────────────────────────────── */
  .footer{text-align:center;padding:20px;font-size:10px;color:#94a3b8;margin-top:8px}

  /* ── Utility ─────────────────────────────────────────────────────── */
  .alert-bar{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;font-size:12px;color:#b91c1c;margin-bottom:16px;display:flex;align-items:center;gap:8px}

  @media print{
    body{background:white}
    .page{padding:8px}
    .header{border-radius:0;box-shadow:none}
    .card,.kpi,.project-card{box-shadow:none;border-color:#ccc}
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-inner">
      <div class="header-top">
        <div>
          <div class="header-badge">Informe Gerencial de Mantenimiento</div>
          <h1>${client.name}</h1>
          <div class="header-sub">
            ${[client.city, client.department].filter(Boolean).join(', ')}${client.contactName ? ` · Contacto: ${client.contactName}` : ''}
          </div>
        </div>
        <div class="header-brand">
          <div class="brand-name">🚜 IMECOL S.A.S.</div>
          <div class="brand-sub">Distribuidor oficial CASE IH · AgroMaint Pro</div>
          <div class="brand-date">Generado: ${fmtDate(generatedAt)}</div>
        </div>
      </div>
    </div>
    <div class="exec-summary">
      <strong>Resumen ejecutivo:</strong>
      Su flota de <strong>${assets.length} equipos</strong> presenta una disponibilidad del
      <strong style="color:${fleetAvailability >= 90 ? '#059669' : '#d97706'}">${fleetAvailability}%</strong>
      (${operative} operativos). Se registran <strong>${fmtNum(kpis.totalFailures)} eventos de falla</strong>
      con MTBF de <strong>${fmtNum(kpis.mtbf)} h</strong> y MTTR de <strong>${kpis.mttr} h</strong>.
      ${projects.length > 0 ? `Los <strong>${projects.length} proyectos de reparación</strong> en curso tienen un avance promedio del <strong>${avgProgress}%</strong>.` : ''}
      ${overdueCount > 0 ? `<strong style="color:#b91c1c"> ⚠ ${overdueCount} mantenimiento${overdueCount > 1 ? 's' : ''} vencido${overdueCount > 1 ? 's' : ''} requieren programación inmediata.</strong>` : ''}
    </div>
  </div>

  ${overdueCount > 0 ? `<div class="alert-bar">⚠ <strong>${overdueCount} mantenimiento${overdueCount>1?'s':''} vencido${overdueCount>1?'s':''}</strong> — requieren atención inmediata</div>` : ''}

  <!-- KPIs -->
  <div class="grid4">
    <div class="kpi">
      <div class="kpi-label">Disponibilidad de Flota</div>
      <div class="kpi-val" style="color:${fleetAvailability>=90?'#059669':'#d97706'}">${fleetAvailability}%</div>
      <div class="kpi-hint">${operative} de ${assets.length} equipos operativos</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">MTBF</div>
      <div class="kpi-val" style="color:#2563eb">${fmtNum(kpis.mtbf)} h</div>
      <div class="kpi-hint">Horas medias entre fallas</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">MTTR</div>
      <div class="kpi-val" style="color:#d97706">${kpis.mttr} h</div>
      <div class="kpi-hint">Tiempo medio de reparación</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Eventos de Falla</div>
      <div class="kpi-val" style="color:#f43f5e">${fmtNum(kpis.totalFailures)}</div>
      <div class="kpi-hint">${fmtNum(kpis.totalDowntime)} h de parada total</div>
    </div>
  </div>

  <!-- Charts row 1: System failures + Fleet status -->
  <div class="grid2">
    <div class="card" style="margin:0">
      <div class="card-title"><span class="icon" style="background:#ede9fe;color:#7c3aed">🔧</span> Sistemas con Más Fallas</div>
      ${systems.length > 0 ? `<div class="chart-wrap"><canvas id="chartSystems"></canvas></div>` : `<p style="text-align:center;color:#94a3b8;padding:40px 0;font-size:12px">Sin eventos de falla registrados</p>`}
    </div>
    <div class="card" style="margin:0">
      <div class="card-title"><span class="icon" style="background:#dcfce7;color:#16a34a">🚜</span> Estado de la Flota</div>
      <div class="chart-wrap-sm"><canvas id="chartFleet"></canvas></div>
      <div id="fleetLegend" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center"></div>
    </div>
  </div>

  <!-- Charts row 2: Machine ranking + Availability gauge -->
  ${machines.length > 0 ? `
  <div class="card">
    <div class="card-title"><span class="icon" style="background:#fef3c7;color:#d97706">⚠</span> Equipos con Mayor Número de Fallas</div>
    <div class="chart-wrap"><canvas id="chartMachines"></canvas></div>
  </div>` : ''}

  <!-- Projects Gantt -->
  ${projects.length > 0 ? `
  <div class="card">
    <div class="card-title"><span class="icon" style="background:#dbeafe;color:#1d4ed8">📊</span> Avance de Proyectos de Reparación
      <small style="font-weight:400;color:#94a3b8;font-size:10px;margin-left:4px">— línea azul = hoy</small>
    </div>
    ${projects.map(ganttBlock).join('')}
  </div>` : ''}

  <!-- Fleet table + Upcoming maintenance -->
  <div class="grid2">
    <div class="card" style="margin:0">
      <div class="card-title"><span class="icon" style="background:#dcfce7;color:#16a34a">🚜</span> Estado de la Flota</div>
      <div style="overflow-x:auto">
        <table>
          <thead><tr><th>Equipo</th><th>Modelo</th><th>Horóm.</th><th>Estado</th></tr></thead>
          <tbody>${fleetRows}</tbody>
        </table>
        ${assets.length > 15 ? `<p style="font-size:10px;color:#94a3b8;margin-top:6px">+ ${assets.length-15} equipos adicionales</p>` : ''}
      </div>
    </div>
    <div class="card" style="margin:0">
      <div class="card-title"><span class="icon" style="background:#fef9c3;color:#ca8a04">📅</span> Próximos Mantenimientos</div>
      <div style="overflow-x:auto">
        <table>
          <thead><tr><th>Estado</th><th>Equipo</th><th>Actividad</th><th>Intervalo</th><th>Próximo</th><th>Restante</th></tr></thead>
          <tbody>${upcomingRows}</tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    IMECOL S.A.S. — Distribuidor oficial CASE IH en Colombia · Informe generado por AgroMaint Pro<br>
    Este informe es confidencial y para uso exclusivo de ${client.name}
  </div>

</div>

<script>
const D = ${chartData};

Chart.defaults.font.family = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#64748b';

// Systems failures
if (D.systemLabels.length && document.getElementById('chartSystems')) {
  new Chart(document.getElementById('chartSystems'), {
    type: 'bar',
    data: {
      labels: D.systemLabels,
      datasets: [{ label:'Fallas', data: D.systemValues, backgroundColor:'#8b5cf6', borderRadius:4,
        barPercentage:.6 }]
    },
    options: {
      indexAxis: 'y', responsive:true, maintainAspectRatio:false,
      plugins: { legend:{display:false} },
      scales: { x:{grid:{color:'#f1f5f9'},ticks:{stepSize:1}}, y:{grid:{display:false}} }
    }
  });
}

// Fleet status doughnut
if (document.getElementById('chartFleet')) {
  new Chart(document.getElementById('chartFleet'), {
    type: 'doughnut',
    data: { labels: D.statusLabels, datasets:[{ data: D.statusValues, backgroundColor: D.statusColors, borderWidth:2, borderColor:'#fff' }] },
    options: { responsive:true, maintainAspectRatio:false, cutout:'65%',
      plugins: { legend:{display:false},
        tooltip:{ callbacks:{ label: ctx => ' '+ctx.label+': '+ctx.raw+' equipo'+(ctx.raw!==1?'s':'') } }
      }
    }
  });
  // Manual legend
  const leg = document.getElementById('fleetLegend');
  D.statusLabels.forEach((lbl,i)=>{
    leg.innerHTML += '<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#64748b">'
      +'<span style="width:8px;height:8px;border-radius:50%;background:'+D.statusColors[i]+';display:inline-block"></span>'
      +lbl+' ('+D.statusValues[i]+')</div>';
  });
}

// Machine ranking grouped bar
if (D.machineLabels.length && document.getElementById('chartMachines')) {
  new Chart(document.getElementById('chartMachines'), {
    type: 'bar',
    data: {
      labels: D.machineLabels,
      datasets: [
        { label:'Fallas', data: D.machineValues, backgroundColor:'#f43f5e', borderRadius:4, barPercentage:.4 },
        { label:'MTTR (h)', data: D.machineMttr, backgroundColor:'#f59e0b', borderRadius:4, barPercentage:.4 },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: { legend:{position:'bottom',labels:{boxWidth:10,padding:10}} },
      scales: { x:{grid:{display:false}}, y:{grid:{color:'#f1f5f9'}} }
    }
  });
}
</script>
</body>
</html>`
}
