/**
 * SEED — LubeAnalyst
 * Genera componentes lubricados, muestras de aceite y diagnósticos.
 * Cada activo tiene un healthFactor aleatorio que garantiza spread real
 * en los scatter plots. Incluye límites superiores E inferiores (rangos).
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ─── Límites con rangos (normalMin/Max, cautionMin/Max, etc.) ───

interface Limit {
  normalMax: number; cautionMax: number; criticalMax: number; condemnedMax?: number
  normalMin?: number; cautionMin?: number; criticalMin?: number; condemnedMin?: number
  unit: string; source: string
}

const LIMITS: Record<string, Record<string, Limit>> = {
  motor: {
    ironFe:      { normalMax: 75,  cautionMax: 150, criticalMax: 250, condemnedMax: 400,  unit: 'ppm',     source: 'ASTM D6595 / Bureau Veritas' },
    copperCu:    { normalMax: 30,  cautionMax: 75,  criticalMax: 150, condemnedMax: 200,  unit: 'ppm',     source: 'ASTM D6595' },
    aluminumAl:  { normalMax: 15,  cautionMax: 30,  criticalMax: 60,  condemnedMax: 100,  unit: 'ppm',     source: 'Industry' },
    chromeCr:    { normalMax: 5,   cautionMax: 15,  criticalMax: 30,  condemnedMax: 50,   unit: 'ppm',     source: 'ASTM D6595' },
    siliconSi:   { normalMax: 20,  cautionMax: 40,  criticalMax: 80,  condemnedMax: 150,  unit: 'ppm',     source: 'Polaris Labs' },
    sodiumNa:    { normalMax: 20,  cautionMax: 50,  criticalMax: 100, condemnedMax: 200,  unit: 'ppm',     source: 'Coolant indicator' },
    pqIndex:     { normalMax: 50,  cautionMax: 100, criticalMax: 200,                     unit: 'PQI',     source: 'PMI' },
    // TBN: INVERTED — too low = bad. normalMin=8, condemnedMin=2
    tbn:         { normalMax: 999, cautionMax: 999, criticalMax: 999, // upper never triggers
                   normalMin: 8,   cautionMin: 5,   criticalMin: 3.5, condemnedMin: 2,
                   unit: 'mgKOH/g', source: 'SAE J313' },
    // Viscosity 40°C for 15W-40: valid range 95-115. Outside = problem
    viscosity40: { normalMax: 115, cautionMax: 130, criticalMax: 148, condemnedMax: 170,
                   normalMin: 95,  cautionMin: 82,  criticalMin: 70,  condemnedMin: 55,
                   unit: 'cSt',   source: 'SAE J300 / ISO 3104' },
    waterPct:    { normalMax: 0.1, cautionMax: 0.3, criticalMax: 0.5, condemnedMax: 1.0, unit: '%',       source: 'ASTM D6595' },
    fuelPct:     { normalMax: 0.5, cautionMax: 2.0, criticalMax: 4.0, condemnedMax: 6.0, unit: '%',       source: 'ASTM D3524' },
    oxidation:   { normalMax: 15,  cautionMax: 30,  criticalMax: 50,                     unit: 'abs/cm',  source: 'FTIR E2412' },
    soot:        { normalMax: 1.0, cautionMax: 2.5, criticalMax: 4.0, condemnedMax: 6.0, unit: '%',       source: 'FTIR E2412' },
  },
  transmission: {
    ironFe:      { normalMax: 50,  cautionMax: 120, criticalMax: 200, condemnedMax: 350,  unit: 'ppm',     source: 'Case IH / ASTM D6595' },
    copperCu:    { normalMax: 50,  cautionMax: 100, criticalMax: 200, condemnedMax: 300,  unit: 'ppm',     source: 'ASTM D6595' },
    aluminumAl:  { normalMax: 20,  cautionMax: 50,  criticalMax: 100,                     unit: 'ppm',     source: 'Industry' },
    siliconSi:   { normalMax: 15,  cautionMax: 30,  criticalMax: 60,                      unit: 'ppm',     source: 'Contamination' },
    pqIndex:     { normalMax: 75,  cautionMax: 150, criticalMax: 300,                     unit: 'PQI',     source: 'PMI' },
    viscosity40: { normalMax: 95,  cautionMax: 110, criticalMax: 130,
                   normalMin: 72,  cautionMin: 62,  criticalMin: 50,
                   unit: 'cSt',   source: 'SAE 10W-30 Hy-Tran' },
    waterPct:    { normalMax: 0.1, cautionMax: 0.3, criticalMax: 0.5,                     unit: '%',       source: 'ASTM D6595' },
  },
  hydraulic: {
    ironFe:      { normalMax: 25,  cautionMax: 60,  criticalMax: 120, condemnedMax: 200,  unit: 'ppm',     source: 'Parker Hannifin' },
    copperCu:    { normalMax: 15,  cautionMax: 40,  criticalMax: 80,                      unit: 'ppm',     source: 'Parker / Bosch' },
    siliconSi:   { normalMax: 10,  cautionMax: 20,  criticalMax: 50,                      unit: 'ppm',     source: 'ISO 4406' },
    pqIndex:     { normalMax: 30,  cautionMax: 75,  criticalMax: 150,                     unit: 'PQI',     source: 'PMI' },
    viscosity40: { normalMax: 70,  cautionMax: 80,  criticalMax: 95,
                   normalMin: 60,  cautionMin: 50,  criticalMin: 38,
                   unit: 'cSt',   source: 'ISO VG 46/68' },
    waterPct:    { normalMax: 0.05,cautionMax: 0.1, criticalMax: 0.3,                     unit: '%',       source: 'Hydraulic std' },
    oxidation:   { normalMax: 10,  cautionMax: 20,  criticalMax: 35,                      unit: 'abs/cm',  source: 'FTIR E2412' },
  },
  differential: {
    ironFe:      { normalMax: 100, cautionMax: 250, criticalMax: 500, condemnedMax: 800,  unit: 'ppm',     source: 'ASTM D6595' },
    copperCu:    { normalMax: 40,  cautionMax: 100, criticalMax: 200,                     unit: 'ppm',     source: 'Industry' },
    pqIndex:     { normalMax: 100, cautionMax: 200, criticalMax: 400,                     unit: 'PQI',     source: 'PMI' },
    siliconSi:   { normalMax: 20,  cautionMax: 40,  criticalMax: 80,                      unit: 'ppm',     source: 'Contamination' },
    waterPct:    { normalMax: 0.1, cautionMax: 0.3, criticalMax: 0.5,                     unit: '%',       source: 'ASTM D6595' },
  },
  final_drive: {
    ironFe:      { normalMax: 120, cautionMax: 300, criticalMax: 600, condemnedMax: 1000, unit: 'ppm',     source: 'ASTM D6595' },
    copperCu:    { normalMax: 50,  cautionMax: 120, criticalMax: 250,                     unit: 'ppm',     source: 'Industry' },
    pqIndex:     { normalMax: 120, cautionMax: 250, criticalMax: 500,                     unit: 'PQI',     source: 'PMI' },
    leadPb:      { normalMax: 10,  cautionMax: 30,  criticalMax: 60,                      unit: 'ppm',     source: 'Bearing wear' },
    siliconSi:   { normalMax: 20,  cautionMax: 50,  criticalMax: 100,                     unit: 'ppm',     source: 'Contamination' },
    waterPct:    { normalMax: 0.1, cautionMax: 0.3, criticalMax: 0.5,                     unit: '%',       source: 'ASTM D6595' },
  },
}

interface ComponentConfig {
  componentType: string; name: string; recommendedOil: string
  recommendedViscosity: string; oilCapacityL: number
  changeIntervalHours: number; sampleIntervalHours: number
}

const HARVESTER_COMPONENTS: ComponentConfig[] = [
  { componentType: 'motor',        name: 'Motor FPT N67 T4B',           recommendedOil: 'AKCELA Engine Oil 15W-40', recommendedViscosity: '15W-40', oilCapacityL: 18, changeIntervalHours: 250,  sampleIntervalHours: 250 },
  { componentType: 'transmission', name: 'Transmisión Hidrostática',     recommendedOil: 'AKCELA Hy-Tran Ultra',    recommendedViscosity: '10W-30', oilCapacityL: 60, changeIntervalHours: 500,  sampleIntervalHours: 250 },
  { componentType: 'hydraulic',    name: 'Sistema Hidráulico',           recommendedOil: 'AKCELA Hy-Tran Ultra',    recommendedViscosity: '10W-30', oilCapacityL: 80, changeIntervalHours: 1000, sampleIntervalHours: 500 },
  { componentType: 'differential', name: 'Diferencial Central',          recommendedOil: 'AKCELA Nexplore 75W-90', recommendedViscosity: '75W-90', oilCapacityL: 8,  changeIntervalHours: 1000, sampleIntervalHours: 500 },
  { componentType: 'final_drive',  name: 'Mandos Finales (2x)',          recommendedOil: 'AKCELA Nexplore 75W-90', recommendedViscosity: '75W-90', oilCapacityL: 12, changeIntervalHours: 1000, sampleIntervalHours: 500 },
]

const TRACTOR_COMPONENTS: ComponentConfig[] = [
  { componentType: 'motor',        name: 'Motor FPT Cursor 9 T4B',       recommendedOil: 'AKCELA Engine Oil 15W-40', recommendedViscosity: '15W-40', oilCapacityL: 22, changeIntervalHours: 300,  sampleIntervalHours: 250 },
  { componentType: 'transmission', name: 'Transmisión Powershift 19x6',  recommendedOil: 'AKCELA Hy-Tran Ultra',    recommendedViscosity: '10W-30', oilCapacityL: 55, changeIntervalHours: 500,  sampleIntervalHours: 250 },
  { componentType: 'hydraulic',    name: 'Sistema Hidráulico Posterior',  recommendedOil: 'AKCELA Hy-Tran Ultra',    recommendedViscosity: '10W-30', oilCapacityL: 40, changeIntervalHours: 1000, sampleIntervalHours: 500 },
  { componentType: 'differential', name: 'Diferencial Trasero',           recommendedOil: 'AKCELA Nexplore 75W-90', recommendedViscosity: '75W-90', oilCapacityL: 6,  changeIntervalHours: 1000, sampleIntervalHours: 500 },
  { componentType: 'final_drive',  name: 'Mandos Finales Traseros (2x)', recommendedOil: 'AKCELA Nexplore 75W-90', recommendedViscosity: '75W-90', oilCapacityL: 8,  changeIntervalHours: 1000, sampleIntervalHours: 500 },
]

// ─── Diagnosis engine ───

interface SampleValues {
  ironFe?: number; copperCu?: number; aluminumAl?: number; chromeCr?: number
  leadPb?: number; siliconSi?: number; sodiumNa?: number; potassiumK?: number
  pqIndex?: number; tbn?: number; viscosity40?: number; waterPct?: number
  fuelPct?: number; oxidation?: number; soot?: number; glycolPpm?: number
}

interface Diagnosis {
  variable: string; severity: string; possibleCause: string; recommendation: string
  priority: number; requiresOilChange: boolean; requiresInspection: boolean
  requiresStop: boolean; requiresResample: boolean; nextSampleHours?: number
}

function getSeverity(variable: string, value: number, limit: Limit): string {
  // TBN and viscosity: check lower bounds
  if (limit.condemnedMin !== undefined && value <= limit.condemnedMin) return 'condemned'
  if (limit.criticalMin !== undefined && value <= limit.criticalMin) return 'critical'
  if (limit.cautionMin !== undefined && value <= limit.cautionMin) return 'caution'
  if (limit.normalMin !== undefined && value < limit.normalMin) return 'caution'
  // Upper bounds
  if (limit.condemnedMax && value >= limit.condemnedMax) return 'condemned'
  if (value >= limit.criticalMax) return 'critical'
  if (value >= limit.cautionMax) return 'caution'
  return 'normal'
}

function diagnoseSample(componentType: string, values: SampleValues): {
  status: string; diagnoses: Diagnosis[]; overallDiagnosis: string; recommendation: string
} {
  const limits = LIMITS[componentType] || LIMITS.motor
  const diagnoses: Diagnosis[] = []

  const check = (varKey: keyof SampleValues, severity: string, cause: string, rec: string, requiresOilChange = false, requiresStop = false) => {
    if (severity !== 'normal') {
      diagnoses.push({
        variable: varKey as string, severity, possibleCause: cause, recommendation: rec,
        priority: severity === 'critical' || severity === 'condemned' ? 1 : 2,
        requiresOilChange, requiresInspection: severity !== 'normal',
        requiresStop, requiresResample: true,
        nextSampleHours: severity === 'critical' ? 50 : 150,
      })
    }
  }

  if (values.ironFe !== undefined && limits.ironFe) {
    const sev = getSeverity('ironFe', values.ironFe, limits.ironFe)
    const highPQ = values.pqIndex && limits.pqIndex && values.pqIndex > limits.pqIndex.cautionMax
    check('ironFe', sev,
      componentType === 'final_drive' ? 'Desgaste de engranajes/rodamientos en mando final' : 'Desgaste de componentes ferrosos internos',
      highPQ ? 'ANÁLISIS FERROGRÁFICO urgente. Partículas grandes de desgaste.' : 'Reducir intervalo de muestreo. Verificar filtros.',
      sev === 'critical' || sev === 'condemned', sev === 'condemned')
  }
  if (values.siliconSi !== undefined && limits.siliconSi) {
    const sev = getSeverity('siliconSi', values.siliconSi, limits.siliconSi)
    check('siliconSi', sev, 'Ingreso de polvo por admisión o sellos deficientes', 'Revisar filtro de aire, sellos y prefiltro.', sev === 'critical', false)
  }
  if (values.copperCu !== undefined && limits.copperCu) {
    const sev = getSeverity('copperCu', values.copperCu, limits.copperCu)
    check('copperCu', sev, componentType === 'transmission' ? 'Desgaste de bujes de bronce o embragues húmedos' : 'Desgaste de componentes cobre/latón', 'Inspeccionar enfriador de aceite y bujes.', sev === 'critical', false)
  }
  if (values.pqIndex !== undefined && limits.pqIndex) {
    const sev = getSeverity('pqIndex', values.pqIndex, limits.pqIndex)
    check('pqIndex', sev, 'Alta concentración de partículas ferrosas', 'Análisis ferrográfico recomendado.', sev === 'critical', sev === 'condemned')
  }
  if (values.tbn !== undefined && limits.tbn) {
    const sev = getSeverity('tbn', values.tbn, limits.tbn)
    check('tbn', sev, 'Agotamiento de aditivos alcalinos del aceite', 'Cambiar aceite. Riesgo de corrosión interna.', sev !== 'normal', false)
  }
  if (values.viscosity40 !== undefined && limits.viscosity40) {
    const sev = getSeverity('viscosity40', values.viscosity40, limits.viscosity40)
    const tooLow = limits.viscosity40.normalMin && values.viscosity40 < limits.viscosity40.normalMin
    check('viscosity40', sev,
      tooLow ? 'Dilución por combustible o mezcla de aceites (viscosidad baja)' : 'Oxidación o contaminación (viscosidad alta)',
      'Revisar inyectores y retornos de combustible. Cambiar aceite.', sev !== 'normal', sev === 'condemned')
  }
  if (values.waterPct !== undefined && limits.waterPct) {
    const sev = getSeverity('waterPct', values.waterPct, limits.waterPct)
    const hasGlycol = values.glycolPpm && values.glycolPpm > 50
    check('waterPct', sev,
      hasGlycol ? 'Ingreso de refrigerante (agua + glicol). Posible falla en junta de culata.' : 'Contaminación con agua. Revisar sellos.',
      hasGlycol ? 'PARADA INMEDIATA. Verificar junta de culata y enfriador de aceite.' : 'Cambiar aceite. Verificar ingreso de humedad.',
      true, !!hasGlycol)
  }
  if (values.glycolPpm !== undefined && values.glycolPpm > 50) {
    check('glycolPpm', values.glycolPpm > 200 ? 'condemned' : 'critical',
      'Ingreso de refrigerante/anticongelante', 'PARADA INMEDIATA. Cambio de aceite + lavado de cárter.', true, true)
  }
  if (values.fuelPct !== undefined && limits.fuelPct) {
    const sev = getSeverity('fuelPct', values.fuelPct, limits.fuelPct)
    check('fuelPct', sev, 'Dilución por combustible — inyectores o retornos deficientes', 'Revisar inyectores y bomba. Cambiar aceite.', sev !== 'normal', false)
  }
  if (values.oxidation !== undefined && limits.oxidation) {
    const sev = getSeverity('oxidation', values.oxidation, limits.oxidation)
    check('oxidation', sev, 'Degradación oxidativa del aceite por altas temperaturas', 'Verificar temperatura de operación. Evaluar reducción de intervalo.', sev === 'critical', false)
  }

  let status = 'normal'
  for (const d of diagnoses) {
    if (d.severity === 'condemned') { status = 'condemned'; break }
    if (d.severity === 'critical') status = 'critical'
    else if (d.severity === 'caution' && status === 'normal') status = 'caution'
  }

  const critical = diagnoses.filter(d => d.severity === 'critical' || d.severity === 'condemned')
  const overallDiagnosis = critical.length > 0
    ? `${critical.length} variable(s) crítica(s): ${critical.map(d => d.variable).join(', ')}`
    : diagnoses.length > 0
    ? `${diagnoses.length} variable(s) en precaución`
    : 'Muestra dentro de límites normales.'

  const requiresStop = diagnoses.some(d => d.requiresStop)
  const requiresOilChange = diagnoses.some(d => d.requiresOilChange)
  const recommendation = requiresStop ? 'PARADA PREVENTIVA RECOMENDADA.'
    : requiresOilChange ? 'Cambio de aceite requerido.'
    : diagnoses.length > 0 ? 'Monitorear con intervalo reducido.'
    : 'Continuar programa de mantenimiento normal.'

  return { status, diagnoses, overallDiagnosis, recommendation }
}

// ─── Lab value generator with per-asset healthFactor ───

type Scenario = 'normal' | 'caution' | 'critical' | 'coolant_contamination' | 'fuel_dilution' | 'dust_contamination' | 'severe_wear'

function rand(min: number, max: number, decimals = 1): number {
  const v = Math.random() * (max - min) + min
  return Math.round(v * 10 ** decimals) / 10 ** decimals
}

function noise(pct = 0.12): number {
  return 1 + (Math.random() * 2 - 1) * pct
}

function generateLabValues(
  componentType: string,
  scenario: Scenario,
  oilHours: number,
  healthFactor: number  // 0.2 (very clean) → 3.5 (very degraded)
): SampleValues {
  const age = Math.min(oilHours / 250, 2.5)         // 0–2.5 age multiplier
  const deg = age * healthFactor                      // combined degradation

  // Base values scale with both age AND health factor for wide spread
  const V = {
    motor: (): SampleValues => ({
      ironFe:      rand(6,  15) + deg * rand(18, 28) * noise(0.25),
      copperCu:    rand(3,  10) + deg * rand(6,  12) * noise(0.20),
      aluminumAl:  rand(2,  8)  + deg * rand(3,  7)  * noise(0.20),
      chromeCr:    rand(0.5,3)  + deg * rand(0.5,2)  * noise(0.15),
      siliconSi:   rand(4,  12) + deg * rand(4,  8)  * noise(0.30),
      sodiumNa:    rand(2,  10) + deg * rand(1,  4)  * noise(0.20),
      pqIndex:     rand(5,  18) + deg * rand(8,  18) * noise(0.25),
      // TBN starts high and DECREASES with degradation
      tbn:         Math.max(1.5, rand(10, 13) - deg * rand(1.2, 2.2) * noise(0.20)),
      // Viscosity: normal center 102–108, spreads with health factor
      viscosity40: 105 + (healthFactor - 1) * rand(8, 14) * noise(0.15) + deg * rand(1, 3),
      waterPct:    rand(0.01, 0.05) + deg * rand(0.01, 0.04) * noise(0.30),
      fuelPct:     rand(0.05, 0.3)  + deg * rand(0.05, 0.15) * noise(0.30),
      oxidation:   rand(2,   6)     + deg * rand(2,   5)     * noise(0.20),
      soot:        rand(0.1, 0.5)   + deg * rand(0.1, 0.4)   * noise(0.25),
    }),
    transmission: (): SampleValues => ({
      ironFe:      rand(8,  20) + deg * rand(10, 20) * noise(0.25),
      copperCu:    rand(8,  22) + deg * rand(8,  18) * noise(0.20),
      aluminumAl:  rand(3,  10) + deg * rand(4,  10) * noise(0.20),
      siliconSi:   rand(2,  8)  + deg * rand(2,  6)  * noise(0.25),
      pqIndex:     rand(10, 30) + deg * rand(10, 25) * noise(0.25),
      viscosity40: 82 + (healthFactor - 1) * rand(6, 10) * noise(0.15) + deg * rand(0.5, 2),
      waterPct:    rand(0.01, 0.04) + deg * rand(0.01, 0.03) * noise(0.30),
    }),
    hydraulic: (): SampleValues => ({
      ironFe:      rand(3,  10) + deg * rand(5,  12) * noise(0.25),
      copperCu:    rand(2,  7)  + deg * rand(3,  7)  * noise(0.20),
      siliconSi:   rand(1,  5)  + deg * rand(2,  5)  * noise(0.30),
      pqIndex:     rand(4,  14) + deg * rand(4,  12) * noise(0.25),
      viscosity40: 64 + (healthFactor - 1) * rand(4, 8) * noise(0.15) + deg * rand(0.5, 1.5),
      waterPct:    rand(0.005,0.02) + deg * rand(0.005,0.015) * noise(0.30),
      oxidation:   rand(1,   5)     + deg * rand(2,   5)      * noise(0.20),
    }),
    differential: (): SampleValues => ({
      ironFe:      rand(20, 50) + deg * rand(15, 35) * noise(0.30),
      copperCu:    rand(8,  20) + deg * rand(6,  16) * noise(0.25),
      pqIndex:     rand(20, 55) + deg * rand(15, 35) * noise(0.25),
      siliconSi:   rand(3,  10) + deg * rand(2,  6)  * noise(0.25),
      waterPct:    rand(0.01,0.04) + deg * rand(0.01,0.03) * noise(0.25),
    }),
    final_drive: (): SampleValues => ({
      ironFe:      rand(30, 70) + deg * rand(20, 50) * noise(0.30),
      copperCu:    rand(10, 28) + deg * rand(8,  20) * noise(0.25),
      pqIndex:     rand(30, 70) + deg * rand(20, 45) * noise(0.25),
      leadPb:      rand(1,  5)  + deg * rand(1,  3)  * noise(0.20),
      siliconSi:   rand(4,  12) + deg * rand(3,  8)  * noise(0.25),
      waterPct:    rand(0.01,0.04) + deg * rand(0.01,0.03) * noise(0.25),
    }),
  }

  const vals = (V[componentType as keyof typeof V] ?? V.motor)()

  // Scenario overrides — applied on top of base values
  switch (scenario) {
    case 'caution':
      if (vals.ironFe)     vals.ironFe     = rand(80,  135) * noise(0.10)
      if (vals.siliconSi)  vals.siliconSi  = rand(22,  42)  * noise(0.10)
      if (vals.pqIndex)    vals.pqIndex    = rand(55,  95)  * noise(0.10)
      if (componentType === 'motor' && vals.tbn) vals.tbn = rand(5, 7.5) * noise(0.08)
      break
    case 'critical':
      if (vals.ironFe)     vals.ironFe     = rand(155, 290) * noise(0.12)
      if (vals.pqIndex)    vals.pqIndex    = rand(110, 210) * noise(0.12)
      if (vals.siliconSi)  vals.siliconSi  = rand(45,  85)  * noise(0.10)
      if (componentType === 'motor' && vals.tbn) vals.tbn = rand(2, 4) * noise(0.08)
      if (vals.oxidation)  vals.oxidation  = rand(35,  55)  * noise(0.10)
      break
    case 'coolant_contamination':
      vals.waterPct  = rand(0.4,  0.95) * noise(0.10)
      vals.glycolPpm = rand(100,  420)  * noise(0.12)
      vals.sodiumNa  = rand(55,   160)  * noise(0.10)
      vals.potassiumK= rand(25,   85)   * noise(0.10)
      break
    case 'fuel_dilution':
      vals.fuelPct   = rand(2.4,  5.8)  * noise(0.10)
      if (vals.viscosity40) vals.viscosity40 = rand(62, 84) * noise(0.08)
      break
    case 'dust_contamination':
      if (vals.siliconSi)  vals.siliconSi  = rand(48, 125) * noise(0.12)
      if (vals.aluminumAl) vals.aluminumAl = rand(18, 65)  * noise(0.10)
      if (vals.ironFe)     vals.ironFe     = rand(75, 190) * noise(0.12)
      break
    case 'severe_wear':
      if (vals.ironFe)  vals.ironFe  = rand(280, 620) * noise(0.15)
      if (vals.pqIndex) vals.pqIndex = rand(230, 520) * noise(0.15)
      if (vals.copperCu)vals.copperCu= rand(140, 360) * noise(0.12)
      break
  }

  return vals
}

// ─── Main ───

async function main() {
  console.log('\n🛢️  Iniciando seed LubeAnalyst (varianza mejorada)...\n')

  const org = await db.organization.findFirst({ where: { slug: 'imecol' } })
  if (!org) throw new Error('IMECOL no encontrada — ejecutar seed.ts primero')

  // Upsert OilLimits (now with min bounds)
  console.log('📏 Actualizando límites de alarma (rangos completos)...')
  for (const [componentType, vars] of Object.entries(LIMITS)) {
    for (const [variable, lim] of Object.entries(vars)) {
      await db.oilLimit.upsert({
        where: { componentType_variable_organizationId: { componentType, variable, organizationId: '' } },
        update: {
          normalMax: lim.normalMax, cautionMax: lim.cautionMax, criticalMax: lim.criticalMax, condemnedMax: lim.condemnedMax,
          normalMin: lim.normalMin, cautionMin: lim.cautionMin, criticalMin: lim.criticalMin, condemnedMin: lim.condemnedMin,
          unit: lim.unit, source: lim.source,
        },
        create: {
          organizationId: '', componentType, variable,
          unit: lim.unit,
          normalMax: lim.normalMax, cautionMax: lim.cautionMax, criticalMax: lim.criticalMax, condemnedMax: lim.condemnedMax,
          normalMin: lim.normalMin, cautionMin: lim.cautionMin, criticalMin: lim.criticalMin, condemnedMin: lim.condemnedMin,
          source: lim.source,
        },
      })
    }
  }

  const assets = await db.asset.findMany({
    where: { organizationId: org.id, isActive: true },
    include: { model: { include: { category: true } } },
    orderBy: { internalCode: 'asc' },
  })
  console.log(`📋 ${assets.length} activos`)

  await db.oilDiagnosis.deleteMany({})
  await db.oilSample.deleteMany({})
  await db.lubeComponent.deleteMany({})

  // Scenario distribution per component for realistic fleet
  const scenarios: Scenario[] = [
    'normal','normal','normal','normal','normal','normal',  // 40%
    'caution','caution','caution',                          // 20%
    'critical','critical',                                  // 13%
    'dust_contamination','dust_contamination',              // 13%
    'fuel_dilution',                                        // 7%
    'coolant_contamination',                                // 4%
    'severe_wear',                                          // 4%
    'normal',                                               // ~5% extra normal
  ]

  let totalComponents = 0, totalSamples = 0, totalDiagnoses = 0

  for (const asset of assets) {
    const isHarvester = asset.model?.category?.name?.toLowerCase().includes('cosechadora') ||
      asset.name?.toLowerCase().includes('a9900') || asset.name?.toLowerCase().includes('austoft')
    const cfgs = isHarvester ? HARVESTER_COMPONENTS : TRACTOR_COMPONENTS
    const baseHours = asset.currentHours || rand(1500, 7000, 0)

    for (const cfg of cfgs) {
      // Per-asset health factor: wide spread guarantees scatter variety
      // healthFactor 0.2 = very clean machine, 3.5 = heavily degraded
      const healthFactor = parseFloat((0.2 + Math.random() * 3.3).toFixed(2))
      const assetScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
      const sampleCount = 5
      const lastChangeHours = baseHours - rand(100, 400, 0)

      const component = await db.lubeComponent.create({
        data: {
          organizationId: org.id, assetId: asset.id,
          componentType: cfg.componentType, name: cfg.name,
          recommendedOil: cfg.recommendedOil, recommendedViscosity: cfg.recommendedViscosity,
          oilCapacityL: cfg.oilCapacityL, changeIntervalHours: cfg.changeIntervalHours,
          sampleIntervalHours: cfg.sampleIntervalHours, lastChangeHours,
          lastSampleDate: new Date(Date.now() - rand(5, 35, 0) * 86400000),
          criticality: 'high', status: 'normal',
        },
      })
      totalComponents++

      let worstStatus = 'normal'

      for (let s = 0; s < sampleCount; s++) {
        // Progressive degradation: early samples normal, later samples show scenario
        const progress = s / (sampleCount - 1)   // 0 → 1
        let sampleScenario: Scenario
        if (progress < 0.4) {
          sampleScenario = 'normal'
        } else if (progress < 0.7) {
          // mild version of the scenario
          sampleScenario = assetScenario === 'severe_wear' ? 'critical'
            : assetScenario === 'critical' ? 'caution'
            : assetScenario === 'coolant_contamination' ? 'caution'
            : 'normal'
        } else {
          sampleScenario = assetScenario
        }

        // oilHours increases progressively (older samples = fresher oil)
        const oilHours = rand(30 + s * 40, 80 + s * 55, 0)
        const equipmentHours = baseHours - (sampleCount - 1 - s) * rand(180, 350, 0)
        const sampleDate = new Date(Date.now() - (sampleCount - s) * rand(50, 95, 0) * 86400000)

        const labValues = generateLabValues(cfg.componentType, sampleScenario, oilHours, healthFactor)
        const result = diagnoseSample(cfg.componentType, labValues)

        const statusRank = ['condemned','critical','caution','normal']
        if (statusRank.indexOf(result.status) < statusRank.indexOf(worstStatus)) {
          worstStatus = result.status
        }

        const sample = await db.oilSample.create({
          data: {
            organizationId: org.id, assetId: asset.id, componentId: component.id,
            sampleDate,
            receivedDate: new Date(sampleDate.getTime() + 2 * 86400000),
            analysisDate: new Date(sampleDate.getTime() + 5 * 86400000),
            equipmentHours, oilHours, componentHours: equipmentHours,
            lab: 'Laboratorio POLARIS / IMECOL',
            externalReportNo: `LA-${asset.internalCode?.replace(/[^A-Z0-9]/gi,'')}-${s}`,
            status: result.status,
            overallDiagnosis: result.overallDiagnosis,
            recommendation: result.recommendation,
            ironFe: labValues.ironFe,     copperCu:   labValues.copperCu,
            aluminumAl: labValues.aluminumAl, chromeCr: labValues.chromeCr,
            leadPb: labValues.leadPb,     siliconSi:  labValues.siliconSi,
            sodiumNa: labValues.sodiumNa, potassiumK: labValues.potassiumK,
            pqIndex: labValues.pqIndex,   tbn:        labValues.tbn,
            viscosity40: labValues.viscosity40, waterPct: labValues.waterPct,
            fuelPct: labValues.fuelPct,   oxidation:  labValues.oxidation,
            soot: labValues.soot,         glycolPpm:  labValues.glycolPpm,
            // Additive metals (consistent per fleet)
            zincZn:     rand(750, 1300) * noise(0.08),
            phosphorusP: rand(650, 1150) * noise(0.08),
            calciumCa:  rand(1800, 3200) * noise(0.08),
            magnesiumMg: rand(350, 750)  * noise(0.08),
            molybdenumMo: rand(15, 90)   * noise(0.10),
            isoParticleCode: cfg.componentType === 'hydraulic'
              ? `${rand(14+Math.round(healthFactor*2), 20, 0)}/${rand(12+Math.round(healthFactor*2), 18, 0)}/${rand(9, 15, 0)}`
              : undefined,
          },
        })
        totalSamples++

        for (const d of result.diagnoses) {
          await db.oilDiagnosis.create({
            data: {
              sampleId: sample.id, variable: d.variable, severity: d.severity,
              possibleCause: d.possibleCause, recommendation: d.recommendation,
              priority: d.priority, requiresOilChange: d.requiresOilChange,
              requiresInspection: d.requiresInspection, requiresStop: d.requiresStop,
              requiresResample: d.requiresResample, nextSampleHours: d.nextSampleHours,
            },
          })
          totalDiagnoses++
        }
      }

      await db.lubeComponent.update({ where: { id: component.id }, data: { status: worstStatus } })
    }
  }

  console.log(`\n✅ Seed completado:`)
  console.log(`   🔧 ${totalComponents} componentes`)
  console.log(`   🧪 ${totalSamples} muestras (spread realista con healthFactor por activo)`)
  console.log(`   ⚠️  ${totalDiagnoses} diagnósticos`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
