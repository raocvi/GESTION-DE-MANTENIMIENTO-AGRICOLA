/**
 * LubriCheck Pro v2.0 — Motor de análisis tribológico experto
 * Basado en: Cat S·O·S, Komatsu KOWA, ALS Global, WearCheck, Noria Corporation,
 * Polaris Labs, Allison SIL 17-TR-96, ASTM D6595, ISO 4406
 */

// ─── Types ───

export interface SampleInput {
  ironFe?: number | null
  copperCu?: number | null
  aluminumAl?: number | null
  chromeCr?: number | null
  leadPb?: number | null
  tinSn?: number | null
  siliconSi?: number | null
  sodiumNa?: number | null
  potassiumK?: number | null
  boronB?: number | null
  molybdenumMo?: number | null
  zincZn?: number | null
  pqIndex?: number | null
  tbn?: number | null
  tan?: number | null
  viscosity40?: number | null
  viscosity100?: number | null
  oxidation?: number | null
  nitration?: number | null
  sulfation?: number | null
  soot?: number | null
  waterPct?: number | null
  glycolPpm?: number | null
  fuelPct?: number | null
  oilHours?: number | null
  equipmentHours?: number | null
}

export interface LimitEntry {
  normalMax: number
  cautionMax: number
  criticalMax: number
  condemnedMax?: number | null
  normalMin?: number | null
  cautionMin?: number | null
  criticalMin?: number | null
  condemnedMin?: number | null
  unit: string
}

export type LimitsMap = Record<string, LimitEntry>

export interface ParamStatus {
  param: string
  label: string
  value: number
  unit: string
  cautionLimit: number | null
  criticalLimit: number | null
  status: 'caution' | 'critical' | 'condemned'
  isLow: boolean
}

export interface RootCause {
  code: string
  description: string
  mechanism: string
  probability: 'ALTA' | 'MEDIA' | 'POSIBLE' | 'BAJA'
}

export interface ExpertReport {
  generalStatus: 'CRITICAL' | 'CAUTION' | 'NORMAL'
  patternsDetected: string[]
  paramsOutOfLimit: ParamStatus[]
  multivariableAnalysis: string
  rootCauses: RootCause[]
  affectedComponents: { component: string; riskLevel: 'EN RIESGO' | 'POSIBLEMENTE AFECTADO' | 'MONITOREAR' }[]
  immediateActions: string
  shortTermActions: string
  mediumTermActions: string
  longTermActions: string
  trendAnalysis: string | null
  isFleetAlert: boolean
  fleetAlertText: string | null
  nextIntervalHours: number
  nextCriticalParams: string[]
  additionalTests: string[]
}

// ─── Metadata ───

export const VAR_META: Record<string, { label: string; unit: string }> = {
  ironFe:      { label: 'Hierro (Fe)',          unit: 'ppm' },
  copperCu:    { label: 'Cobre (Cu)',            unit: 'ppm' },
  aluminumAl:  { label: 'Aluminio (Al)',         unit: 'ppm' },
  chromeCr:    { label: 'Cromo (Cr)',            unit: 'ppm' },
  leadPb:      { label: 'Plomo (Pb)',            unit: 'ppm' },
  tinSn:       { label: 'Estaño (Sn)',           unit: 'ppm' },
  siliconSi:   { label: 'Silicio (Si)',          unit: 'ppm' },
  sodiumNa:    { label: 'Sodio (Na)',            unit: 'ppm' },
  potassiumK:  { label: 'Potasio (K)',           unit: 'ppm' },
  boronB:      { label: 'Boro (B)',              unit: 'ppm' },
  molybdenumMo:{ label: 'Molibdeno (Mo)',        unit: 'ppm' },
  zincZn:      { label: 'Zinc (Zn)',             unit: 'ppm' },
  pqIndex:     { label: 'PQ Index',             unit: 'PQI' },
  tbn:         { label: 'TBN',                  unit: 'mgKOH/g' },
  tan:         { label: 'TAN',                  unit: 'mgKOH/g' },
  viscosity40: { label: 'Viscosidad 100°C',     unit: 'cSt' },
  viscosity100:{ label: 'Viscosidad 100°C',     unit: 'cSt' },
  oxidation:   { label: 'Oxidación FTIR',       unit: 'abs/cm' },
  nitration:   { label: 'Nitración FTIR',       unit: 'abs/cm' },
  sulfation:   { label: 'Sulfatación FTIR',     unit: 'abs/cm' },
  soot:        { label: 'Hollín',               unit: '%' },
  waterPct:    { label: 'Agua',                 unit: '%' },
  glycolPpm:   { label: 'Glicol',               unit: 'ppm' },
  fuelPct:     { label: 'Dilución Combustible', unit: '%' },
}

// ─── Helpers ───

function n(val: number | null | undefined): number | null {
  return val == null ? null : val
}

function checkParam(param: string, value: number | null | undefined, limits: LimitsMap): ParamStatus | null {
  if (value == null) return null
  const lim = limits[param]
  if (!lim) return null
  const meta = VAR_META[param]
  const unit = meta?.unit ?? lim.unit ?? 'ppm'
  const label = meta?.label ?? param

  if (lim.condemnedMax != null && value > lim.condemnedMax)
    return { param, label, value, unit, cautionLimit: lim.cautionMax, criticalLimit: lim.criticalMax, status: 'condemned', isLow: false }
  if (value > lim.criticalMax)
    return { param, label, value, unit, cautionLimit: lim.cautionMax, criticalLimit: lim.criticalMax, status: 'critical', isLow: false }
  if (value > lim.cautionMax)
    return { param, label, value, unit, cautionLimit: lim.cautionMax, criticalLimit: lim.criticalMax, status: 'caution', isLow: false }

  if (lim.condemnedMin != null && value <= lim.condemnedMin)
    return { param, label, value, unit, cautionLimit: lim.cautionMin ?? null, criticalLimit: lim.criticalMin ?? null, status: 'condemned', isLow: true }
  if (lim.criticalMin != null && value <= lim.criticalMin)
    return { param, label, value, unit, cautionLimit: lim.cautionMin ?? null, criticalLimit: lim.criticalMin ?? null, status: 'critical', isLow: true }
  if (lim.cautionMin != null && value <= lim.cautionMin)
    return { param, label, value, unit, cautionLimit: lim.cautionMin ?? null, criticalLimit: lim.criticalMin ?? null, status: 'caution', isLow: true }

  return null
}

// ─── Main analysis function ───

export function analyzeOilSample(
  sample: SampleInput,
  componentType: string,
  limits: LimitsMap,
  history: SampleInput[] = [],
): ExpertReport {

  // ─── 1. Check all params ───
  const paramList: [string, number | null | undefined][] = [
    ['ironFe', sample.ironFe], ['copperCu', sample.copperCu], ['aluminumAl', sample.aluminumAl],
    ['chromeCr', sample.chromeCr], ['leadPb', sample.leadPb], ['tinSn', sample.tinSn],
    ['siliconSi', sample.siliconSi], ['sodiumNa', sample.sodiumNa], ['potassiumK', sample.potassiumK],
    ['boronB', sample.boronB], ['molybdenumMo', sample.molybdenumMo], ['zincZn', sample.zincZn],
    ['pqIndex', sample.pqIndex], ['tbn', sample.tbn], ['tan', sample.tan],
    ['viscosity40', sample.viscosity40], ['oxidation', sample.oxidation], ['nitration', sample.nitration],
    ['sulfation', sample.sulfation], ['soot', sample.soot], ['waterPct', sample.waterPct],
    ['glycolPpm', sample.glycolPpm], ['fuelPct', sample.fuelPct],
  ]

  const paramsOut: ParamStatus[] = []
  for (const [param, value] of paramList) {
    const result = checkParam(param, value, limits)
    if (result) paramsOut.push(result)
  }

  // ─── 2. General status ───
  let generalStatus: 'CRITICAL' | 'CAUTION' | 'NORMAL' = 'NORMAL'
  if (paramsOut.some(p => p.status === 'condemned' || p.status === 'critical')) generalStatus = 'CRITICAL'
  else if (paramsOut.some(p => p.status === 'caution')) generalStatus = 'CAUTION'

  // ─── 3. Extract values ───
  const si = n(sample.siliconSi), fe = n(sample.ironFe), al = n(sample.aluminumAl)
  const na = n(sample.sodiumNa), k = n(sample.potassiumK), b = n(sample.boronB)
  const cu = n(sample.copperCu), pb = n(sample.leadPb), sn = n(sample.tinSn), cr = n(sample.chromeCr)
  const tbn = n(sample.tbn), ox = n(sample.oxidation), nit = n(sample.nitration)
  const visc = n(sample.viscosity40), water = n(sample.waterPct), fuel = n(sample.fuelPct)
  const glycol = n(sample.glycolPpm), soot = n(sample.soot)

  const lSi = limits['siliconSi'], lFe = limits['ironFe'], lAl = limits['aluminumAl']
  const lNa = limits['sodiumNa'], lK = limits['potassiumK'], lCu = limits['copperCu']
  const lPb = limits['leadPb'], lCr = limits['chromeCr'], lTbn = limits['tbn']
  const lOx = limits['oxidation'], lVisc = limits['viscosity40'], lWater = limits['waterPct']
  const lFuel = limits['fuelPct'], lSoot = limits['soot']

  // ─── 4. Pattern detection ───
  const patterns: string[] = []

  // A: Dust/abrasive contamination  Si↑ + (Fe↑ OR Al↑)
  if (si != null && lSi && si > lSi.cautionMax &&
      ((fe != null && lFe && fe > lFe.cautionMax) || (al != null && lAl && al > lAl.cautionMax)))
    patterns.push('A')

  // B: Coolant   Na↑ + K↑  OR glycol > 50
  if ((na != null && lNa && na > lNa.cautionMax && k != null && lK && k > lK.cautionMax * 0.5) ||
      (glycol != null && glycol > 50))
    patterns.push('B')

  // C: Fuel dilution   fuelPct↑  OR  (visc↓ AND soot↑)
  if ((fuel != null && lFuel && fuel > lFuel.cautionMax) ||
      (visc != null && lVisc?.cautionMin != null && visc < lVisc.cautionMin &&
       soot != null && lSoot && soot > lSoot.cautionMax))
    patterns.push('C')

  // D: Bearing wear   Pb↑ + Cu↑
  if (pb != null && lPb && pb > lPb.cautionMax && cu != null && lCu && cu > lCu.cautionMax)
    patterns.push('D')

  // E: Cylinder/piston wear   Fe↑ + Al↑  WITHOUT Si being high
  if (fe != null && lFe && fe > lFe.cautionMax &&
      al != null && lAl && al > lAl.cautionMax &&
      (si == null || !lSi || si <= lSi.cautionMax))
    patterns.push('E')

  // F: Oil degradation   TBN↓  OR  oxidation↑
  if ((tbn != null && lTbn?.cautionMin != null && tbn < lTbn.cautionMin) ||
      (ox != null && lOx && ox > lOx.cautionMax))
    patterns.push('F')

  // K: Agricultural K↑ without Na  (fertilizer dust not coolant)
  if (k != null && lK && k > lK.cautionMax && (na == null || !lNa || na <= lNa.cautionMax * 0.6))
    patterns.push('K')

  // B_water: Water without glycol
  const hasWaterNoGlycol = water != null && lWater && water > lWater.cautionMax &&
                           (glycol == null || glycol <= 30) && !patterns.includes('B')
  if (hasWaterNoGlycol) patterns.push('B_water')

  // ─── 5. Root causes ───
  const rootCauses: RootCause[] = []

  if (patterns.includes('A')) {
    rootCauses.push({
      code: 'R-01',
      description: 'Contaminación abrasiva externa — polvo/tierra ingresó al lubricante',
      mechanism: `Silicio abrasivo ${si?.toFixed(0) ?? '?'} ppm + Fe ${fe?.toFixed(0) ?? '?'} ppm${al != null ? ` + Al ${al.toFixed(0)} ppm` : ''} confirman desgaste de tres cuerpos. Partículas de sílice <10 micras son las más destructivas: desgastan camisas de cilindro (Fe↑), pistones (Al↑) y anillos cromados (Cr↑). ESTE NO ES DESGASTE NORMAL POR HORAS — es desgaste acelerado por ingreso de tierra. Sin corregir la fuente, el desgaste se acelera exponencialmente. Inspeccionar: filtro de aire (saturación/perforación), ductos de admisión (grietas, abrazaderas flojas), respiradero del cárter, junta de tapa de válvulas.`,
      probability: si != null && lSi && si > lSi.criticalMax ? 'ALTA' : 'ALTA',
    })
  }

  if (patterns.includes('B')) {
    rootCauses.push({
      code: 'R-02',
      description: 'Contaminación por refrigerante — etilenglicol detectado',
      mechanism: `Na ${na?.toFixed(0) ?? '?'} ppm + K ${k?.toFixed(0) ?? '?'} ppm${b != null && b > 10 ? ` + B ${b.toFixed(0)} ppm` : ''}${glycol != null && glycol > 50 ? ` + Glicol ${glycol.toFixed(0)} ppm` : ''} = firma química inequívoca del anticongelante. URGENCIA MÁXIMA: el etilenglicol (1) destruye la película lubricante formando jabones metálicos, (2) precipita aditivos dispersantes, (3) ataca directamente cojinetes de biela y bancada. Causa falla catastrófica en 10-50 horas. Posible fuente: junta de culata (head gasket), enfriador de aceite perforado (oil cooler — muy frecuente en cosechadoras), fisura en bloque o cabezote.`,
      probability: 'ALTA',
    })
  }

  if (patterns.includes('B_water')) {
    rootCauses.push({
      code: 'R-08',
      description: 'Entrada de agua sin glicol — condensación o sello defectuoso',
      mechanism: `Agua ${water?.toFixed(2) ?? '?'}% sin potasio elevado descarta refrigerante. Causas: condensación por ciclos térmicos (máquina parada en noches frías del Valle del Cauca), sello de cigüeñal delantero o trasero defectuoso, tapa del cárter mal sellada, respiradero bloqueado que genera vacío y succiona humedad. El agua emulsifica el aceite, corroe metales internamente y favorece el crecimiento bacteriano en sistemas hidráulicos.`,
      probability: 'ALTA',
    })
  }

  if (patterns.includes('C')) {
    rootCauses.push({
      code: 'R-03',
      description: 'Dilución por combustible diésel — viscosidad comprometida',
      mechanism: `${fuel != null ? `Dilución ${fuel.toFixed(1)}%` : `Viscosidad ${visc?.toFixed(1) ?? '?'} cSt (bajo mínimo normal)`}${soot != null ? ` + Hollín ${soot.toFixed(1)}%` : ''} confirman contaminación por diésel. El combustible lava la película protectora de camisas y pistones, reduce la carga portante de la película, y diluye aditivos antidesgaste (ZDDP). El hollín elevado indica combustión incompleta — misma causa raíz. Inspeccionar inyectores (prueba de caudal y retorno), temperatura de operación (¿alcanza >70°C antes de operar a carga plena?), tiempo en ralentí frío.`,
      probability: fuel != null && lFuel && fuel > lFuel.criticalMax ? 'ALTA' : 'MEDIA',
    })
  }

  if (patterns.includes('D')) {
    const criticalBearing = pb != null && lPb && pb > lPb.criticalMax
    rootCauses.push({
      code: 'R-04',
      description: criticalBearing
        ? 'DESGASTE CRÍTICO DE COJINETES — RIESGO DE FALLA CATASTRÓFICA'
        : 'Desgaste avanzado de cojinetes de biela y/o bancada',
      mechanism: `Pb ${pb?.toFixed(0) ?? '?'} ppm + Cu ${cu?.toFixed(0) ?? '?'} ppm${sn != null ? ` + Sn ${sn.toFixed(0)} ppm` : ''} = desgaste del substrato de bronce (Cu) de los cojinetes trimetal. Los cojinetes tienen capas: Pb-Sn (overlay superficial) → Cu-bronce (substrato) → acero de apoyo (Fe). La presencia de Cu indica que el overlay ya se agotó y el desgaste llegó al bronce. ${criticalBearing ? 'Cu > límite crítico: el desgaste puede haber llegado al acero — FALLA INMINENTE. Verificar presión de aceite (manómetro externo) AHORA. Si < 30 psi en caliente/ralentí: PARAR EQUIPO.' : 'Inspeccionar filtro de aceite (partículas brillantes plateadas = señal de avance).'}`,
      probability: criticalBearing ? 'ALTA' : 'MEDIA',
    })
  }

  if (patterns.includes('E') && !patterns.includes('A')) {
    rootCauses.push({
      code: 'R-05',
      description: 'Desgaste interno de camisas/pistones — origen en condición del lubricante',
      mechanism: `Fe ${fe?.toFixed(0) ?? '?'} ppm + Al ${al?.toFixed(0) ?? '?'} ppm sin Si elevado (Si=${si?.toFixed(0) ?? '<lím'} ppm) = desgaste adhesivo o abrasivo INTERNO, no por contaminación exterior. Causas probables: (1) viscosidad incorrecta para la temperatura de operación en clima tropical, (2) aceite con aditivos ZDDP agotados — verificar Zn y P residuales (si Zn < 600 ppm en 15W-40 CK-4: aditivos anti-desgaste depletados), (3) bomba de aceite con desgaste (presión baja), (4) operación con nivel bajo de aceite o sobrecargas crónicas, (5) turbocompresor con sello defectuoso.`,
      probability: 'MEDIA',
    })
  }

  if (patterns.includes('F')) {
    const isOverheat = ox != null && lOx && ox > lOx.cautionMax && nit != null && nit > 20
    rootCauses.push({
      code: isOverheat ? 'R-07' : 'R-06',
      description: isOverheat
        ? 'Degradación térmica — aceite operando sobre temperatura máxima'
        : 'Aceite agotado — intervalo de cambio excedido o aceite incorrecto',
      mechanism: isOverheat
        ? `Oxidación ${ox?.toFixed(2) ?? '?'} abs/cm + Nitración ${nit?.toFixed(1) ?? '?'} abs/cm = aceite sometido a temperaturas excesivas (>115-120°C temperatura de aceite). La oxidación destruye aditivos anti-desgaste (ZDDP) y espesantes; la nitración indica quema de aditivos. Revisar: nivel de refrigerante, tapa del radiador (presión de trabajo), bomba de agua, termostato, aletas del radiador (polvo en cosechadoras bloquea el 40% del flujo de aire). En Colombia (alta temperatura ambiente + humedad) reducir intervalo de cambio 20% respecto al manual OEM.`
        : `TBN ${tbn?.toFixed(1) ?? '?'} mgKOH/g${tbn != null && lTbn?.cautionMin != null ? ` (límite precaución: ${lTbn.cautionMin} mgKOH/g)` : ''} indica reserva alcalina insuficiente para neutralizar los ácidos de la combustión. Los ácidos corrosivos atacan internamente los metales del motor aunque no haya contaminación externa visible. ${tbn != null && lTbn?.criticalMin != null && tbn < lTbn.criticalMin ? 'TBN bajo nivel crítico: ACEITE EN ACIDEZ NETA — cambio inmediato.' : 'Programar cambio de aceite antes del próximo servicio.'}`,
      probability: 'ALTA',
    })
  }

  if (patterns.includes('K')) {
    rootCauses.push({
      code: 'R-01K',
      description: 'Contaminación por polvo de fertilizante (específico entorno agrícola)',
      mechanism: `Potasio K=${k?.toFixed(0) ?? '?'} ppm elevado SIN Na↑ (Na=${na?.toFixed(0) ?? '?'} ppm) descarta refrigerante. En cosechadoras operando en campos con aplicación reciente de sulfato de potasio (KCl, K₂SO₄) o potasio-magnésico, el polvo del fertilizante puede ingresar por el filtro de aire. Este patrón es específico del entorno cañero/palmicultor colombiano. Confirmar: ¿hubo aplicación de fertilizante potásico en los últimos 30 días en el campo?`,
      probability: 'MEDIA',
    })
  }

  if (rootCauses.length === 0 && paramsOut.length > 0) {
    rootCauses.push({
      code: 'R-XX',
      description: 'Parámetros fuera de rango — causa raíz requiere investigación adicional',
      mechanism: 'Parámetros anormales sin patrón multivariable definitivo. Solicitar ferrografía analítica (morfología de partículas de desgaste) y conteo de partículas ISO 4406 para identificar tamaño y forma del desgaste y orientar el diagnóstico.',
      probability: 'POSIBLE',
    })
  }

  // ─── 6. Affected components ───
  type RiskLevel = 'EN RIESGO' | 'POSIBLEMENTE AFECTADO' | 'MONITOREAR'
  const affected: { component: string; riskLevel: RiskLevel }[] = []

  if (patterns.includes('A') || patterns.includes('E')) {
    const isCritFe = fe != null && lFe && fe > lFe.criticalMax
    const isCritAl = al != null && lAl && al > lAl.criticalMax
    affected.push({ component: 'Camisas de cilindro', riskLevel: isCritFe ? 'EN RIESGO' : 'POSIBLEMENTE AFECTADO' })
    affected.push({ component: 'Pistones y anillos de compresión', riskLevel: isCritAl ? 'EN RIESGO' : 'POSIBLEMENTE AFECTADO' })
    if (cr != null && lCr && cr > lCr.cautionMax) affected.push({ component: 'Anillos cromados', riskLevel: 'EN RIESGO' })
    affected.push({ component: 'Turbocompresor (cojinetes de empuje)', riskLevel: 'MONITOREAR' })
  }
  if (patterns.includes('D')) {
    const isCritPb = pb != null && lPb && pb > lPb.criticalMax
    affected.push({ component: 'Cojinetes de biela', riskLevel: isCritPb ? 'EN RIESGO' : 'POSIBLEMENTE AFECTADO' })
    affected.push({ component: 'Cojinetes de bancada (muñequillas cigüeñal)', riskLevel: isCritPb ? 'EN RIESGO' : 'POSIBLEMENTE AFECTADO' })
  }
  if (patterns.includes('B') || patterns.includes('B_water')) {
    affected.push({ component: 'Junta de culata / enfriador de aceite', riskLevel: 'EN RIESGO' })
    affected.push({ component: 'Cojinetes (ataque por glicol/agua)', riskLevel: patterns.includes('B') ? 'EN RIESGO' : 'POSIBLEMENTE AFECTADO' })
  }
  if (patterns.includes('C')) {
    affected.push({ component: 'Camisas de cilindro (lavado de película)', riskLevel: 'POSIBLEMENTE AFECTADO' })
    affected.push({ component: 'Inyectores / bomba de inyección', riskLevel: 'MONITOREAR' })
  }
  if (patterns.includes('F')) {
    affected.push({ component: 'Aditivos anti-desgaste (ZDDP)', riskLevel: 'EN RIESGO' })
    affected.push({ component: 'Sistema de enfriamiento de aceite', riskLevel: 'MONITOREAR' })
  }
  if (affected.length === 0 && paramsOut.length > 0) {
    affected.push({ component: 'Componente completo — monitoreo requerido', riskLevel: 'MONITOREAR' })
  }

  // ─── 7. Narrative ───
  let analysisText = ''
  if (patterns.length === 0 && paramsOut.length === 0) {
    analysisText = 'Todos los parámetros analizados se encuentran dentro de los rangos normales para este tipo de componente y horas de servicio reportadas. El aceite mantiene sus propiedades fisicoquímicas (viscosidad, TBN, oxidación) y los metales de desgaste están en niveles esperados. El programa de análisis preventivo está funcionando correctamente.'
  } else if (patterns.includes('B')) {
    analysisText = `⚠️ CONTAMINACIÓN POR REFRIGERANTE CONFIRMADA: El patrón Na=${na?.toFixed(0) ?? '?'} ppm + K=${k?.toFixed(0) ?? '?'} ppm${b != null ? ` + B=${b.toFixed(0)} ppm` : ''}${glycol != null && glycol > 50 ? ` + Glicol=${glycol.toFixed(0)} ppm` : ''} es la firma química inequívoca del etilenglicol. Esta es la falla más destructiva en motores: el glicol forma lodos abrasivos, precipita aditivos y ataca directamente los cojinetes. Sin intervención en ≤48h puede causar falla catastrófica. Variables normales: ${paramsOut.length === 0 || paramsOut.every(p => patterns.includes('B')) ? 'Hierro y metales de desgaste estructural aún no muestran daño severo — se detectó a tiempo' : 'Verificar estado de cojinetes por los metales elevados.'}`
  } else if (patterns.includes('A') && patterns.includes('D')) {
    analysisText = `PATRÓN COMPLEJO — CONTAMINACIÓN ABRASIVA + DESGASTE DE COJINETES: Si=${si?.toFixed(0) ?? '?'} ppm (polvo) está desgastando camisas y pistones SIMULTÁNEAMENTE con Pb=${pb?.toFixed(0) ?? '?'} ppm + Cu=${cu?.toFixed(0) ?? '?'} ppm que señalan desgaste de los cojinetes de biela. La combinación sugiere lubricación deficiente acelerada por el abrasivo: las partículas de sílice contaminan el aceite, destruyen la película en los cojinetes y aceleran el desgaste multi-componente. Requiere acción inmediata en ambos frentes.`
  } else if (patterns.includes('A')) {
    analysisText = `CONTAMINACIÓN ABRASIVA POR POLVO: El patrón Si=${si?.toFixed(0) ?? '?'} ppm + Fe=${fe?.toFixed(0) ?? '?'} ppm${al != null ? ` + Al=${al.toFixed(0)} ppm` : ''} confirma ingreso de tierra al sistema. Las partículas abrasivas <10 micras (las más dañinas, según WearCheck) generan desgaste de tres cuerpos en camisas (Fe↑), pistones (Al↑) y anillos (Cr↑). IMPORTANTE: Sin corregir la fuente de ingreso, cada hora de operación empeora el desgaste exponencialmente. Variables en rango normal: ${paramsOut.filter(p => !['siliconSi','ironFe','aluminumAl','chromeCr'].includes(p.param)).length === 0 ? 'el daño está localizado en cilindros y pistones aún' : 'verificar tendencia global'}.`
  } else if (patterns.includes('D')) {
    const sev = pb != null && lPb && pb > lPb.criticalMax ? '🔴 CRÍTICO — FALLA INMINENTE' : '🟡 PRECAUCIÓN'
    analysisText = `DESGASTE DE COJINETES (${sev}): Pb=${pb?.toFixed(0) ?? '?'} ppm + Cu=${cu?.toFixed(0) ?? '?'} ppm${sn != null ? ` + Sn=${sn.toFixed(0)} ppm` : ''}. Los cojinetes trimetal tienen tres capas: (1) Pb-Sn overlay superficial, (2) Cu-bronce substrato, (3) acero de apoyo. La presencia de Cu confirma que el desgaste penetró el overlay y llegó al bronce. Fuente ALS Global Tribology: "solo Pb↑ = overlay normal; Pb+Cu = substrato expuesto; Pb+Cu+Fe = acero → falla catastrófica inminente." ${fe != null && lFe && fe > lFe.criticalMax ? 'Fe también elevado — el desgaste puede haber llegado al acero.' : 'Fe aún en rango — no ha llegado al acero aún.'}`
  } else if (patterns.includes('C')) {
    analysisText = `DILUCIÓN POR COMBUSTIBLE: ${fuel != null ? `Dilución=${fuel.toFixed(1)}%` : `Viscosidad=${visc?.toFixed(1) ?? '?'} cSt`}${soot != null ? ` + Hollín=${soot.toFixed(1)}%` : ''} — el diésel diluye el aceite, reduciendo su capacidad de carga. La película lubricante en camisas y pistones se debilita. Hollín elevado confirma combustión incompleta (misma causa raíz en inyectores). La viscosidad baja aumenta el desgaste adhesivo en todo el sistema.`
  } else if (patterns.includes('E')) {
    analysisText = `DESGASTE INTERNO SIN CONTAMINACIÓN EXTERIOR: Fe=${fe?.toFixed(0) ?? '?'} ppm + Al=${al?.toFixed(0) ?? '?'} ppm pero Si=${si?.toFixed(0) ?? '<10'} ppm (bajo). El desgaste no viene de tierra/polvo externo — tiene origen interno: aceite con viscosidad incorrecta para las temperaturas operativas, aditivos ZDDP agotados, bomba de aceite débil o sobrecargas crónicas. Investigar historial de presión de aceite y especificación exacta del lubricante en uso.`
  } else if (patterns.includes('F')) {
    analysisText = `DEGRADACIÓN DEL LUBRICANTE: TBN=${tbn?.toFixed(1) ?? '?'} mgKOH/g${ox != null ? ` + Oxidación=${ox.toFixed(2)} abs/cm` : ''}. La reserva alcalina del aceite está agotada — ya no puede neutralizar los ácidos de combustión. ${tbn != null && lTbn?.criticalMin != null && tbn < lTbn.criticalMin ? 'ACEITE EN ACIDEZ NETA: los ácidos corroen internamente los metales aunque no haya contaminación visible.' : 'El aceite aún tiene algo de capacidad neutralizante — pero se acaba pronto.'}`
  } else if (paramsOut.length > 0) {
    const names = paramsOut.map(p => `${p.label} (${p.value.toFixed(1)} ${p.unit})`).join(', ')
    analysisText = `Parámetros fuera de rango: ${names}. Sin patrón multivariable definitivo en este análisis individual — se recomienda correlacionar con histórico y solicitar ferrografía analítica para identificar morfología del desgaste.`
  }

  // ─── 8. Actions ───
  let immediateActions: string, shortTermActions: string, mediumTermActions: string, longTermActions: string

  if (generalStatus === 'CRITICAL') {
    if (patterns.includes('B')) {
      immediateActions = '1. PARAR EQUIPO — No operar. 2. Test colorimétrico de glicol en aceite (resultado en <1h). 3. Cambio completo de aceite y filtro HOY. 4. Presurizar sistema de refrigeración para localizar fuga. 5. No reiniciar hasta reparar fuente de glicol.'
      shortTermActions = 'Desmontar culata para inspección de junta. Revisar enfriador de aceite (invertir flujo con agua). Limpiar cárter y galerías de aceite. Muestra de seguimiento a las 50h de operación posterior a reparación.'
      mediumTermActions = 'Monitoreo semanal del nivel de refrigerante. Análisis de aceite del refrigerante (inhibidores). Termografía del sistema de enfriamiento.'
      longTermActions = 'Reducir intervalo de muestreo a 150h durante 3 ciclos posteriores. Revisar historial del enfriador de aceite (reemplazar si >3.000h o tiene historial de fugas).'
    } else if (patterns.includes('D') && pb != null && lPb && pb > lPb.criticalMax) {
      immediateActions = '1. Verificar presión de aceite con manómetro externo (caliente, ralentí). 2. Si presión < 2 bar (29 psi): PARAR EQUIPO INMEDIATAMENTE. 3. Inspeccionar el filtro de aceite (partículas plateadas brillantes = señal de alarma). 4. Enviar muestra de aceite del filtro a ferrografía.'
      shortTermActions = 'Ferrografía analítica urgente. Planificar apertura del motor para medición de holguras de cojinetes (plastigauge). Reemplazar cojinetes si holgura > especificación OEM.'
      mediumTermActions = 'Revisión completa del sistema de lubricación (bomba, galería, filtros). Cambio de aceite y filtro con producto de mayor calidad.'
      longTermActions = 'Monitoreo de presión de aceite con sensor permanente. Muestreo cada 100h durante 6 meses. Revisar causas: ¿viscosidad correcta?, ¿intervalos respetados?'
    } else if (patterns.includes('A')) {
      immediateActions = '1. Inspeccionar filtro de aire AHORA (apertura visual, revisión del sello externo). 2. Revisar ductos de admisión (grietas, abrazaderas flojas). 3. Verificar respiradero del cárter. 4. Cambio de aceite y filtro si > 50% del intervalo. 5. Muestra de seguimiento a las 100h.'
      shortTermActions = 'Reemplazar filtro de aire (no limpiar, reemplazar completamente). Sellar todos los puntos de posible ingreso de polvo. Limpiar ductos de admisión.'
      mediumTermActions = 'Reducir intervalo de cambio de filtro de aire 25-30%. Instalar indicador de restricción de filtro de aire. Evaluar prefiltros ciclónicos para alta concentración de polvo en cosecha.'
      longTermActions = 'Programa de inspección de sellos y respiraderos cada 500h. Aumentar frecuencia de muestreo en temporada de cosecha (ambiente con más polvo).'
    } else {
      immediateActions = `Parámetros críticos: ${paramsOut.filter(p => p.status !== 'caution').map(p => p.label).join(', ')}. Reducir carga operativa inmediatamente. Muestrear en 50h. Programar inspección física del componente.`
      shortTermActions = 'Cambio de aceite y filtro. Ferrografía analítica. Inspección visual del componente.'
      mediumTermActions = 'Revisar especificación del lubricante. Verificar intervalos de cambio.'
      longTermActions = 'Ajustar programa de muestreo a 100h hasta estabilizar tendencia.'
    }
  } else if (generalStatus === 'CAUTION') {
    const paramsNames = paramsOut.map(p => p.label).join(', ')
    immediateActions = `Parámetros en precaución: ${paramsNames}. ${patterns.includes('A') ? 'Revisar filtro de aire en próximo mantenimiento. ' : ''}${patterns.includes('F') ? 'Programar cambio de aceite antes del siguiente intervalo. ' : ''}Acortar próxima muestra a 150h.`
    shortTermActions = 'Inspección visual del componente. Verificar nivel y color del aceite. Cambio de filtro preventivo si supera 50% del intervalo.'
    mediumTermActions = 'Analizar especificación del lubricante. Verificar que se respetan intervalos OEM. Correlacionar con análisis previos.'
    longTermActions = 'Ajustar programa de muestreo a 150h por 3 ciclos. Establecer baseline individual de este componente con el promedio histórico.'
  } else {
    immediateActions = 'Continuar programa de mantenimiento establecido. Sin acción urgente requerida.'
    shortTermActions = 'Próximo cambio de aceite según intervalo OEM. Verificar nivel de aceite en check diario.'
    mediumTermActions = 'Próxima muestra según cronograma preventivo establecido.'
    longTermActions = 'Con 3+ muestras normales, calcular baseline individual del componente (promedio ± 1σ = límite de precaución personalizado más preciso que los genéricos de industria).'
  }

  // ─── 9. Trend analysis ───
  let trendText: string | null = null
  if (history.length >= 2 && sample.equipmentHours != null) {
    const sorted = [...history, sample].sort((a, b) => (a.equipmentHours ?? 0) - (b.equipmentHours ?? 0))
    const feRates: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1], curr = sorted[i]
      const dt = (curr.equipmentHours ?? 0) - (prev.equipmentHours ?? 0)
      if (dt > 0 && curr.ironFe != null && prev.ironFe != null)
        feRates.push((curr.ironFe - prev.ironFe) / dt)
    }
    if (feRates.length > 0) {
      const lastRate = feRates[feRates.length - 1]
      const avgRate = feRates.reduce((s, r) => s + r, 0) / feRates.length
      const cls = lastRate > 1.5 ? 'EXPONENCIAL — ACCIÓN INMEDIATA' : lastRate > 0.8 ? 'ACELERADA — vigilar' : lastRate > 0.3 ? 'LINEAL CRECIENTE — monitorear' : 'LINEAL ESTABLE — normal'
      const critMax = lFe?.criticalMax ?? 150
      const hoursToLimit = lastRate > 0 && fe != null ? Math.round((critMax - fe) / lastRate) : null
      trendText = `Tasa desgaste Fe: ${lastRate.toFixed(3)} ppm/hora (promedio ${history.length} intervalos: ${avgRate.toFixed(3)} ppm/hora) → ${cls}.${hoursToLimit != null && hoursToLimit > 0 && hoursToLimit < 3000 ? ` Proyección: Fe llegará a nivel crítico (${critMax} ppm) en ~${hoursToLimit}h a tasa actual.` : ''}`
    }
  } else if (history.length === 0) {
    trendText = `Primera muestra disponible. Establecer baseline con 2-3 muestras adicionales cada ${componentType === 'motor' ? '250' : '500'}h para calibrar límites personalizados de este componente (más precisos que los genéricos de industria).`
  } else {
    trendText = `${history.length} muestra(s) previa(s) disponible(s) — histórico insuficiente para análisis de tendencia estadística. Con ≥3 muestras se podrá calcular tasa de desgaste y proyección.`
  }

  // ─── 10. Fleet alert ───
  const isFleetAlert = patterns.includes('A') || patterns.includes('B') || (generalStatus === 'CRITICAL' && patterns.includes('F'))
  let fleetAlertText: string | null = null
  if (patterns.includes('A')) {
    fleetAlertText = 'ALERTA DE FLOTA — Contaminación por polvo: Problema ambiental que usualmente afecta a múltiples unidades en la misma zona operativa. Verificar TODAS las unidades de esta empresa operando en el mismo campo. Probabilidad de afectación: 60-80% de la flota en misma área. Acción global: revisión simultánea de filtros de aire en toda la flota. Indicador de mejora: Si < límite de precaución en próximas 2 muestras tras corrección.'
  } else if (patterns.includes('B')) {
    fleetAlertText = 'ALERTA DE FLOTA — Refrigerante: Verificar unidades del mismo modelo/año — defectos de junta o enfriador en serie son posibles. Probabilidad afectación sistémica: 20-30%. Revisar si el mismo proveedor de servicio hizo el último cambio de refrigerante en múltiples unidades. Indicador: Na y K < límite normal en próxima muestra post-reparación.'
  } else if (generalStatus === 'CRITICAL' && patterns.includes('F')) {
    fleetAlertText = 'ALERTA DE FLOTA — TBN bajo crítico: En condiciones tropicales colombianas (alta temperatura, humedad, ciclos de cosecha intensivos), los intervalos OEM pueden ser excesivos. Si múltiples unidades muestran TBN bajo, reducir intervalo de cambio de aceite 20-25% para toda la flota. Indicador: TBN > límite precaución en próxima muestra con intervalo ajustado.'
  }

  // ─── 11. Next analysis ───
  const nextIntervalHours = generalStatus === 'CRITICAL' ? 100 : generalStatus === 'CAUTION' ? 150
    : componentType === 'motor' ? 250 : 500
  const nextCriticalParams = paramsOut.length > 0
    ? paramsOut.slice(0, 5).map(p => p.label)
    : ['Hierro (Fe)', 'Silicio (Si)', 'TBN', 'Viscosidad 100°C']
  const additionalTests: string[] = []
  if (patterns.includes('D') || (fe != null && lFe && fe > lFe.criticalMax)) additionalTests.push('Ferrografía analítica (morfología partículas desgaste)')
  if (patterns.includes('B')) { additionalTests.push('Test colorimétrico de glicol'); additionalTests.push('Presión del sistema de refrigeración') }
  if (generalStatus !== 'NORMAL') additionalTests.push('Conteo de partículas ISO 4406')
  if (patterns.includes('C')) additionalTests.push('Flash point / punto de inflamación')

  return {
    generalStatus,
    patternsDetected: patterns.filter(p => p !== 'B_water'),
    paramsOutOfLimit: paramsOut,
    multivariableAnalysis: analysisText,
    rootCauses,
    affectedComponents: affected,
    immediateActions,
    shortTermActions,
    mediumTermActions,
    longTermActions,
    trendAnalysis: trendText,
    isFleetAlert,
    fleetAlertText,
    nextIntervalHours,
    nextCriticalParams,
    additionalTests,
  }
}

// ─── Pattern labels ───
export const PATTERN_LABELS: Record<string, { label: string; color: string }> = {
  A: { label: 'Patrón A: Polvo/Tierra', color: 'amber' },
  B: { label: 'Patrón B: Refrigerante', color: 'red' },
  B_water: { label: 'Patrón B: Agua sin glicol', color: 'blue' },
  C: { label: 'Patrón C: Combustible', color: 'orange' },
  D: { label: 'Patrón D: Cojinetes', color: 'red' },
  E: { label: 'Patrón E: Cilindros/Pistones', color: 'orange' },
  F: { label: 'Patrón F: Aceite agotado', color: 'yellow' },
  K: { label: 'Patrón K: Fertilizante', color: 'green' },
}
