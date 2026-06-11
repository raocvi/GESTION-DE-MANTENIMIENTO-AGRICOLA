/**
 * SEED — LubeAnalyst
 * Genera componentes lubricados, muestras de aceite y diagnósticos
 * para todos los activos existentes. Usa límites de industria reales.
 *
 * Ejecución: npm run db:seed-lube
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ─── Límites de alarma (industria / OEM / ASTM / laboratorios acreditados) ───

interface Limit { normalMax: number; cautionMax: number; criticalMax: number; condemnedMax?: number; unit: string; source: string }

const LIMITS: Record<string, Record<string, Limit>> = {
  motor: {
    ironFe:      { normalMax: 75,   cautionMax: 150,  criticalMax: 250,  condemnedMax: 400,  unit: 'ppm',      source: 'ASTM D6595 / Bureau Veritas' },
    copperCu:    { normalMax: 30,   cautionMax: 75,   criticalMax: 150,  condemnedMax: 200,  unit: 'ppm',      source: 'ASTM D6595' },
    aluminumAl:  { normalMax: 15,   cautionMax: 30,   criticalMax: 60,   condemnedMax: 100,  unit: 'ppm',      source: 'Industry best practice' },
    chromeCr:    { normalMax: 5,    cautionMax: 15,   criticalMax: 30,   condemnedMax: 50,   unit: 'ppm',      source: 'ASTM D6595' },
    siliconSi:   { normalMax: 20,   cautionMax: 40,   criticalMax: 80,   condemnedMax: 150,  unit: 'ppm',      source: 'ASTM D6595 / Polaris Labs' },
    sodiumNa:    { normalMax: 20,   cautionMax: 50,   criticalMax: 100,  condemnedMax: 200,  unit: 'ppm',      source: 'Coolant contamination indicator' },
    pqIndex:     { normalMax: 50,   cautionMax: 100,  criticalMax: 200,  unit: 'PQI',        source: 'Predictive Maintenance Institute' },
    tbn:         { normalMax: 100,  cautionMax: 7,    criticalMax: 4,    unit: 'mgKOH/g',    source: 'SAE J313 — inverted: crítico si MENOR' },
    viscosity40: { normalMax: 115,  cautionMax: 125,  criticalMax: 145,  unit: 'cSt',        source: 'SAE 15W-40 ±20% band' },
    waterPct:    { normalMax: 0.1,  cautionMax: 0.3,  criticalMax: 0.5,  condemnedMax: 1.0,  unit: '%',        source: 'ASTM D6595' },
    fuelPct:     { normalMax: 0.5,  cautionMax: 2.0,  criticalMax: 4.0,  condemnedMax: 6.0,  unit: '%',        source: 'ASTM D3524' },
    oxidation:   { normalMax: 15,   cautionMax: 30,   criticalMax: 50,   unit: 'abs/cm',     source: 'FTIR ASTM E2412' },
    soot:        { normalMax: 1.0,  cautionMax: 2.5,  criticalMax: 4.0,  condemnedMax: 6.0,  unit: '%',        source: 'FTIR ASTM E2412' },
  },
  transmission: {
    ironFe:      { normalMax: 50,   cautionMax: 120,  criticalMax: 200,  condemnedMax: 350,  unit: 'ppm',      source: 'Case IH / ASTM D6595' },
    copperCu:    { normalMax: 50,   cautionMax: 100,  criticalMax: 200,  condemnedMax: 300,  unit: 'ppm',      source: 'ASTM D6595 — transmisiones' },
    aluminumAl:  { normalMax: 20,   cautionMax: 50,   criticalMax: 100,  unit: 'ppm',        source: 'Industry best practice' },
    siliconSi:   { normalMax: 15,   cautionMax: 30,   criticalMax: 60,   unit: 'ppm',        source: 'Contamination indicator' },
    pqIndex:     { normalMax: 75,   cautionMax: 150,  criticalMax: 300,  unit: 'PQI',        source: 'Predictive Maintenance Institute' },
    viscosity40: { normalMax: 95,   cautionMax: 110,  criticalMax: 130,  unit: 'cSt',        source: 'SAE 10W-30 Hy-Tran ±20%' },
    waterPct:    { normalMax: 0.1,  cautionMax: 0.3,  criticalMax: 0.5,  unit: '%',          source: 'ASTM D6595' },
  },
  hydraulic: {
    ironFe:      { normalMax: 25,   cautionMax: 60,   criticalMax: 120,  condemnedMax: 200,  unit: 'ppm',      source: 'ISO 4406 / Parker Hannifin' },
    copperCu:    { normalMax: 15,   cautionMax: 40,   criticalMax: 80,   unit: 'ppm',        source: 'Parker Hannifin / Bosch Rexroth' },
    siliconSi:   { normalMax: 10,   cautionMax: 20,   criticalMax: 50,   unit: 'ppm',        source: 'Contamination — ISO 4406' },
    pqIndex:     { normalMax: 30,   cautionMax: 75,   criticalMax: 150,  unit: 'PQI',        source: 'Predictive Maintenance Institute' },
    viscosity40: { normalMax: 70,   cautionMax: 80,   criticalMax: 95,   unit: 'cSt',        source: 'ISO VG 46/68 band' },
    waterPct:    { normalMax: 0.05, cautionMax: 0.1,  criticalMax: 0.3,  unit: '%',          source: 'Hydraulic contamination standard' },
    oxidation:   { normalMax: 10,   cautionMax: 20,   criticalMax: 35,   unit: 'abs/cm',     source: 'FTIR ASTM E2412' },
  },
  differential: {
    ironFe:      { normalMax: 100,  cautionMax: 250,  criticalMax: 500,  condemnedMax: 800,  unit: 'ppm',      source: 'ASTM D6595 — diferenciales' },
    copperCu:    { normalMax: 40,   cautionMax: 100,  criticalMax: 200,  unit: 'ppm',        source: 'Industry best practice' },
    pqIndex:     { normalMax: 100,  cautionMax: 200,  criticalMax: 400,  unit: 'PQI',        source: 'Predictive Maintenance Institute' },
    siliconSi:   { normalMax: 20,   cautionMax: 40,   criticalMax: 80,   unit: 'ppm',        source: 'Contamination indicator' },
    waterPct:    { normalMax: 0.1,  cautionMax: 0.3,  criticalMax: 0.5,  unit: '%',          source: 'ASTM D6595' },
  },
  final_drive: {
    ironFe:      { normalMax: 120,  cautionMax: 300,  criticalMax: 600,  condemnedMax: 1000, unit: 'ppm',      source: 'ASTM D6595 — mandos finales' },
    copperCu:    { normalMax: 50,   cautionMax: 120,  criticalMax: 250,  unit: 'ppm',        source: 'Industry best practice' },
    pqIndex:     { normalMax: 120,  cautionMax: 250,  criticalMax: 500,  unit: 'PQI',        source: 'Predictive Maintenance Institute' },
    leadPb:      { normalMax: 10,   cautionMax: 30,   criticalMax: 60,   unit: 'ppm',        source: 'Bearing wear indicator' },
    siliconSi:   { normalMax: 20,   cautionMax: 50,   criticalMax: 100,  unit: 'ppm',        source: 'Contamination indicator' },
    waterPct:    { normalMax: 0.1,  cautionMax: 0.3,  criticalMax: 0.5,  unit: '%',          source: 'ASTM D6595' },
  },
}

// ─── Configuración de componentes por tipo de equipo ───

interface ComponentConfig {
  componentType: string
  name: string
  recommendedOil: string
  recommendedViscosity: string
  oilCapacityL: number
  changeIntervalHours: number
  sampleIntervalHours: number
}

const HARVESTER_COMPONENTS: ComponentConfig[] = [
  { componentType: 'motor',        name: 'Motor FPT N67 T4B',         recommendedOil: 'AKCELA Engine Oil 15W-40',          recommendedViscosity: '15W-40',  oilCapacityL: 18,  changeIntervalHours: 250,  sampleIntervalHours: 250  },
  { componentType: 'transmission', name: 'Transmisión Hidrostática',   recommendedOil: 'AKCELA Hy-Tran Ultra',              recommendedViscosity: '10W-30',  oilCapacityL: 60,  changeIntervalHours: 500,  sampleIntervalHours: 250  },
  { componentType: 'hydraulic',    name: 'Sistema Hidráulico',         recommendedOil: 'AKCELA Hy-Tran Ultra',              recommendedViscosity: '10W-30',  oilCapacityL: 80,  changeIntervalHours: 1000, sampleIntervalHours: 500  },
  { componentType: 'differential', name: 'Diferencial Central',        recommendedOil: 'AKCELA Nexplore 75W-90',            recommendedViscosity: '75W-90',  oilCapacityL: 8,   changeIntervalHours: 1000, sampleIntervalHours: 500  },
  { componentType: 'final_drive',  name: 'Mandos Finales (2x)',        recommendedOil: 'AKCELA Nexplore 75W-90',            recommendedViscosity: '75W-90',  oilCapacityL: 12,  changeIntervalHours: 1000, sampleIntervalHours: 500  },
]

const TRACTOR_COMPONENTS: ComponentConfig[] = [
  { componentType: 'motor',        name: 'Motor FPT Cursor 9 T4B',    recommendedOil: 'AKCELA Engine Oil 15W-40',          recommendedViscosity: '15W-40',  oilCapacityL: 22,  changeIntervalHours: 300,  sampleIntervalHours: 250  },
  { componentType: 'transmission', name: 'Transmisión Powershift 19x6', recommendedOil: 'AKCELA Hy-Tran Ultra',             recommendedViscosity: '10W-30',  oilCapacityL: 55,  changeIntervalHours: 500,  sampleIntervalHours: 250  },
  { componentType: 'hydraulic',    name: 'Sistema Hidráulico Posterior', recommendedOil: 'AKCELA Hy-Tran Ultra',            recommendedViscosity: '10W-30',  oilCapacityL: 40,  changeIntervalHours: 1000, sampleIntervalHours: 500  },
  { componentType: 'differential', name: 'Diferencial Trasero',        recommendedOil: 'AKCELA Nexplore 75W-90',            recommendedViscosity: '75W-90',  oilCapacityL: 6,   changeIntervalHours: 1000, sampleIntervalHours: 500  },
  { componentType: 'final_drive',  name: 'Mandos Finales Traseros (2x)', recommendedOil: 'AKCELA Nexplore 75W-90',          recommendedViscosity: '75W-90',  oilCapacityL: 8,   changeIntervalHours: 1000, sampleIntervalHours: 500  },
]

// ─── Motor de diagnóstico ───

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

function getStatus(value: number, limit: Limit, inverted = false): string {
  if (inverted) {
    if (value <= limit.criticalMax) return 'critical'
    if (value <= limit.cautionMax) return 'caution'
    return 'normal'
  }
  if (limit.condemnedMax && value >= limit.condemnedMax) return 'condemned'
  if (value >= limit.criticalMax) return 'critical'
  if (value >= limit.cautionMax) return 'caution'
  return 'normal'
}

function diagnoseSample(
  componentType: string,
  values: SampleValues,
  history: SampleValues[]
): { status: string; diagnoses: Diagnosis[]; overallDiagnosis: string; recommendation: string } {
  const limits = LIMITS[componentType] || LIMITS.motor
  const diagnoses: Diagnosis[] = []

  // Helper: check trend (is this value increasing?)
  const isTrending = (field: keyof SampleValues, current: number): boolean => {
    if (history.length < 2) return false
    const prev = history[history.length - 1][field] as number | undefined
    const prev2 = history.length >= 2 ? history[history.length - 2][field] as number | undefined : undefined
    if (!prev || !prev2) return false
    return current > prev && prev > prev2
  }

  // Iron wear
  if (values.ironFe !== undefined && limits.ironFe) {
    const status = getStatus(values.ironFe, limits.ironFe)
    if (status !== 'normal') {
      const trending = isTrending('ironFe', values.ironFe)
      diagnoses.push({
        variable: 'ironFe', severity: status,
        possibleCause: componentType === 'final_drive'
          ? 'Desgaste de engranajes, piñones o rodamientos en mando final'
          : componentType === 'motor'
          ? 'Desgaste de cilindros, anillos o camisas del motor'
          : 'Desgaste de componentes ferrosos internos',
        recommendation: status === 'critical' || status === 'condemned'
          ? 'ACCIÓN INMEDIATA: Cambiar aceite, tomar muestra confirmatoria en 50h y programar inspección'
          : `Reducir intervalo de muestreo${trending ? '. Tendencia creciente detectada' : ''}. Verificar filtros`,
        priority: status === 'critical' ? 1 : 2,
        requiresOilChange: status === 'critical' || status === 'condemned',
        requiresInspection: status === 'critical',
        requiresStop: status === 'condemned',
        requiresResample: true,
        nextSampleHours: status === 'critical' ? 50 : 150,
      })
    }
  }

  // Silicon — contamination / air ingress
  if (values.siliconSi !== undefined && limits.siliconSi) {
    const status = getStatus(values.siliconSi, limits.siliconSi)
    if (status !== 'normal') {
      diagnoses.push({
        variable: 'siliconSi', severity: status,
        possibleCause: 'Ingreso de polvo por admisión o sellos deficientes (silicio = partículas de tierra/arena)',
        recommendation: 'Revisar filtro de aire, sellos de cigüeñal y puntos de ingreso de polvo. ' +
          'Verificar condiciones del prefiltro y filtro primario',
        priority: status === 'critical' ? 1 : 2,
        requiresOilChange: status === 'critical',
        requiresInspection: true,
        requiresStop: false,
        requiresResample: true,
        nextSampleHours: 100,
      })
    }
  }

  // Copper — bearing/bushing or cooler wear
  if (values.copperCu !== undefined && limits.copperCu) {
    const status = getStatus(values.copperCu, limits.copperCu)
    if (status !== 'normal') {
      diagnoses.push({
        variable: 'copperCu', severity: status,
        possibleCause: componentType === 'transmission'
          ? 'Desgaste de bujes de bronce, enfriador de aceite o embragues húmedos'
          : 'Desgaste de componentes de cobre/latón (bujes, enfriadores, válvulas)',
        recommendation: status === 'critical'
          ? 'Inspeccionar enfriador de aceite, bujes y embragues. Cambiar aceite y filtros'
          : 'Monitorear en próxima muestra (100h). Revisar temperatura de operación',
        priority: status === 'critical' ? 1 : 2,
        requiresOilChange: status === 'critical',
        requiresInspection: status === 'critical',
        requiresStop: false,
        requiresResample: true,
        nextSampleHours: status === 'critical' ? 50 : 100,
      })
    }
  }

  // PQ Index — ferrous particle density
  if (values.pqIndex !== undefined && limits.pqIndex) {
    const status = getStatus(values.pqIndex, limits.pqIndex)
    if (status !== 'normal') {
      const highFe = values.ironFe && limits.ironFe && values.ironFe > limits.ironFe.cautionMax
      diagnoses.push({
        variable: 'pqIndex', severity: status,
        possibleCause: highFe
          ? 'Desgaste severo de engranajes o rodamientos (Fe alto + PQI alto = partículas grandes)'
          : 'Alta concentración de partículas ferrosas de desgaste',
        recommendation: highFe
          ? 'ANÁLISIS FERROGRÁFICO urgente. Posible desgaste catastrófico en curso'
          : 'Análisis ferrográfico recomendado. Reducir intervalo de muestreo',
        priority: status === 'critical' ? 1 : 2,
        requiresOilChange: status === 'critical',
        requiresInspection: true,
        requiresStop: status === 'condemned',
        requiresResample: true,
        nextSampleHours: status === 'critical' ? 50 : 100,
      })
    }
  }

  // TBN — oil degradation (inverted: critical if LOW)
  if (values.tbn !== undefined && componentType === 'motor') {
    const tbnStatus = values.tbn <= 4 ? 'critical' : values.tbn <= 7 ? 'caution' : 'normal'
    if (tbnStatus !== 'normal') {
      diagnoses.push({
        variable: 'tbn', severity: tbnStatus,
        possibleCause: 'Agotamiento de aditivos alcalinos del aceite. El aceite ha perdido capacidad neutralizante',
        recommendation: tbnStatus === 'critical'
          ? 'Cambiar aceite inmediatamente. Riesgo de corrosión y barnizado en motor'
          : 'Programar cambio de aceite próximamente. Verificar intervalo actual',
        priority: tbnStatus === 'critical' ? 1 : 2,
        requiresOilChange: tbnStatus === 'critical',
        requiresInspection: false,
        requiresStop: false,
        requiresResample: false,
        nextSampleHours: 250,
      })
    }
  }

  // Water contamination
  if (values.waterPct !== undefined && limits.waterPct) {
    const status = getStatus(values.waterPct, limits.waterPct)
    if (status !== 'normal') {
      const hasGlycol = values.glycolPpm && values.glycolPpm > 50
      diagnoses.push({
        variable: 'waterPct', severity: status,
        possibleCause: hasGlycol
          ? 'Ingreso de refrigerante (agua + glicol detectados). Posible falla en junta de culata o enfriador'
          : 'Contaminación con agua. Posible condensación, ingreso externo o falla de sello',
        recommendation: hasGlycol
          ? 'PARADA INMEDIATA recomendada. Verificar junta de culata, enfriador de aceite y sistema de refrigeración'
          : status === 'critical'
          ? 'Cambiar aceite inmediatamente. Verificar origen del agua e inspeccionar sellos'
          : 'Monitorear en próxima muestra. Revisar puntos de ingreso de humedad',
        priority: 1,
        requiresOilChange: true,
        requiresInspection: true,
        requiresStop: hasGlycol || status === 'condemned',
        requiresResample: true,
        nextSampleHours: 50,
      })
    }
  }

  // Glycol contamination
  if (values.glycolPpm !== undefined && values.glycolPpm > 50) {
    diagnoses.push({
      variable: 'glycolPpm', severity: values.glycolPpm > 200 ? 'condemned' : 'critical',
      possibleCause: 'Ingreso de refrigerante/anticongelante. Junta de culata, enfriador de aceite o sellos comprometidos',
      recommendation: 'PARADA INMEDIATA. Cambio de aceite urgente + lavado del cárter + diagnóstico de sistema de refrigeración',
      priority: 1,
      requiresOilChange: true,
      requiresInspection: true,
      requiresStop: true,
      requiresResample: true,
      nextSampleHours: 50,
    })
  }

  // Fuel dilution
  if (values.fuelPct !== undefined && limits.fuelPct) {
    const status = getStatus(values.fuelPct, limits.fuelPct)
    if (status !== 'normal') {
      const lowVis = values.viscosity40 && values.viscosity40 < 80
      diagnoses.push({
        variable: 'fuelPct', severity: status,
        possibleCause: lowVis
          ? 'Dilución severa por combustible (viscosidad reducida). Posible falla en inyectores o retornos'
          : 'Dilución por combustible. Verificar inyectores, sellos y válvulas de retorno',
        recommendation: 'Revisar inyectores, presión de bomba de combustible y retornos. ' +
          (status === 'critical' ? 'Cambiar aceite urgente.' : 'Cambiar aceite en próximo mantenimiento.'),
        priority: status === 'critical' ? 1 : 2,
        requiresOilChange: status !== 'normal',
        requiresInspection: true,
        requiresStop: false,
        requiresResample: true,
        nextSampleHours: 100,
      })
    }
  }

  // Oxidation
  if (values.oxidation !== undefined && limits.oxidation) {
    const status = getStatus(values.oxidation, limits.oxidation)
    if (status !== 'normal') {
      diagnoses.push({
        variable: 'oxidation', severity: status,
        possibleCause: 'Degradación oxidativa del aceite. Exposición a altas temperaturas, ingreso de aire o agua',
        recommendation: 'Verificar temperatura de operación del motor/sistema. ' +
          (status === 'critical' ? 'Cambiar aceite inmediatamente.' : 'Evaluar reducción del intervalo de cambio.'),
        priority: status === 'critical' ? 1 : 3,
        requiresOilChange: status === 'critical',
        requiresInspection: false,
        requiresStop: false,
        requiresResample: false,
        nextSampleHours: 250,
      })
    }
  }

  // Determine overall status
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
    ? `${diagnoses.length} variable(s) en precaución: ${diagnoses.map(d => d.variable).join(', ')}`
    : 'Muestra dentro de límites normales. Continuar programa de monitoreo.'

  const requiresOilChange = diagnoses.some(d => d.requiresOilChange)
  const requiresStop = diagnoses.some(d => d.requiresStop)
  const recommendation = requiresStop
    ? 'PARADA PREVENTIVA RECOMENDADA. Ver diagnósticos específicos.'
    : requiresOilChange
    ? 'Cambio de aceite requerido. Ver diagnósticos específicos.'
    : diagnoses.length > 0
    ? 'Monitorear con intervalo reducido. Ver diagnósticos específicos.'
    : 'Mantener programa de mantenimiento preventivo normal.'

  return { status, diagnoses, overallDiagnosis, recommendation }
}

// ─── Generadores de valores realistas ───

function rand(min: number, max: number, decimals = 1): number {
  const v = Math.random() * (max - min) + min
  return Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function generateLabValues(
  componentType: string,
  scenario: 'normal' | 'caution' | 'critical' | 'coolant_contamination' | 'fuel_dilution' | 'dust_contamination' | 'severe_wear',
  oilHours: number
): SampleValues {
  const ageFactor = Math.min(oilHours / 250, 2.5)

  const base: Record<string, SampleValues> = {
    motor: {
      ironFe: rand(10 + ageFactor * 8, 35 + ageFactor * 10),
      copperCu: rand(5, 18 + ageFactor * 3),
      aluminumAl: rand(3, 10 + ageFactor * 2),
      chromeCr: rand(1, 4),
      siliconSi: rand(5, 15 + ageFactor * 3),
      sodiumNa: rand(3, 12),
      pqIndex: rand(10, 40 + ageFactor * 5),
      tbn: rand(9 - ageFactor * 0.8, 12),
      viscosity40: rand(102, 112),
      waterPct: rand(0.01, 0.06),
      fuelPct: rand(0.1, 0.4),
      oxidation: rand(4, 10 + ageFactor * 2),
      soot: rand(0.2, 0.8 + ageFactor * 0.3),
    },
    transmission: {
      ironFe: rand(15 + ageFactor * 5, 40 + ageFactor * 8),
      copperCu: rand(10, 30 + ageFactor * 5),
      aluminumAl: rand(5, 15 + ageFactor * 2),
      siliconSi: rand(3, 10 + ageFactor * 2),
      pqIndex: rand(20, 60 + ageFactor * 8),
      viscosity40: rand(82, 90),
      waterPct: rand(0.01, 0.05),
    },
    hydraulic: {
      ironFe: rand(5 + ageFactor * 3, 18 + ageFactor * 5),
      copperCu: rand(2, 10 + ageFactor * 2),
      siliconSi: rand(2, 8 + ageFactor * 2),
      pqIndex: rand(5, 25 + ageFactor * 4),
      viscosity40: rand(62, 68),
      waterPct: rand(0.005, 0.03),
      oxidation: rand(2, 8 + ageFactor * 1.5),
    },
    differential: {
      ironFe: rand(30 + ageFactor * 8, 70 + ageFactor * 12),
      copperCu: rand(8, 25 + ageFactor * 4),
      pqIndex: rand(30, 80 + ageFactor * 10),
      siliconSi: rand(5, 15 + ageFactor * 2),
      waterPct: rand(0.01, 0.05),
    },
    final_drive: {
      ironFe: rand(40 + ageFactor * 10, 90 + ageFactor * 15),
      copperCu: rand(10, 35 + ageFactor * 6),
      pqIndex: rand(40, 100 + ageFactor * 15),
      leadPb: rand(2, 8 + ageFactor * 1.5),
      siliconSi: rand(5, 18 + ageFactor * 3),
      waterPct: rand(0.01, 0.06),
    },
  }

  const vals = { ...(base[componentType] || base.motor) }

  // Apply scenario modifiers
  if (scenario === 'caution') {
    if (vals.ironFe) vals.ironFe = rand(80, 130)
    if (vals.siliconSi) vals.siliconSi = rand(22, 38)
    if (vals.pqIndex) vals.pqIndex = rand(60, 90)
    if (componentType === 'motor' && vals.tbn) vals.tbn = rand(5, 7)
  }
  if (scenario === 'critical') {
    if (vals.ironFe) vals.ironFe = rand(160, 280)
    if (vals.pqIndex) vals.pqIndex = rand(120, 200)
    if (vals.siliconSi) vals.siliconSi = rand(45, 80)
    if (componentType === 'motor' && vals.tbn) vals.tbn = rand(2.5, 4)
    if (vals.oxidation) vals.oxidation = rand(35, 55)
  }
  if (scenario === 'coolant_contamination') {
    vals.waterPct = rand(0.4, 0.9)
    vals.glycolPpm = rand(120, 400)
    vals.sodiumNa = rand(60, 150)
    vals.potassiumK = rand(30, 80)
  }
  if (scenario === 'fuel_dilution') {
    vals.fuelPct = rand(2.5, 5.5)
    vals.viscosity40 = rand(70, 88)
  }
  if (scenario === 'dust_contamination') {
    vals.siliconSi = rand(50, 120)
    vals.aluminumAl = rand(20, 60)
    if (vals.ironFe) vals.ironFe = rand(80, 180)
  }
  if (scenario === 'severe_wear') {
    if (vals.ironFe) vals.ironFe = rand(300, 600)
    if (vals.pqIndex) vals.pqIndex = rand(250, 500)
    if (vals.copperCu) vals.copperCu = rand(150, 350)
  }

  return vals
}

// ─── Main seed ───

async function main() {
  console.log('\n🛢️  Iniciando seed LubeAnalyst...\n')

  const org = await db.organization.findFirst({ where: { slug: 'imecol' } })
  if (!org) throw new Error('Organización IMECOL no encontrada — ejecutar seed.ts primero')

  // Insert global OilLimit defaults
  console.log('📏 Insertando límites de alarma...')
  for (const [componentType, vars] of Object.entries(LIMITS)) {
    for (const [variable, limit] of Object.entries(vars)) {
      await db.oilLimit.upsert({
        where: { componentType_variable_organizationId: { componentType, variable, organizationId: '' } },
        update: { normalMax: limit.normalMax, cautionMax: limit.cautionMax, criticalMax: limit.criticalMax, condemnedMax: limit.condemnedMax, unit: limit.unit, source: limit.source },
        create: {
          organizationId: '',
          componentType, variable,
          unit: limit.unit,
          normalMax: limit.normalMax,
          cautionMax: limit.cautionMax,
          criticalMax: limit.criticalMax,
          condemnedMax: limit.condemnedMax,
          source: limit.source,
        },
      })
    }
  }

  // Fetch all assets with model info
  const assets = await db.asset.findMany({
    where: { organizationId: org.id, isActive: true },
    include: { model: { include: { category: true } } },
    orderBy: { internalCode: 'asc' },
  })
  console.log(`📋 ${assets.length} activos encontrados`)

  // Delete existing lube data for clean re-run
  await db.oilDiagnosis.deleteMany({})
  await db.oilSample.deleteMany({})
  await db.lubeComponent.deleteMany({})

  let totalComponents = 0
  let totalSamples = 0
  let totalDiagnoses = 0

  for (const asset of assets) {
    const isHarvester = asset.model?.category?.name?.toLowerCase().includes('cosechadora') ||
      asset.name?.toLowerCase().includes('a9900') || asset.name?.toLowerCase().includes('austoft')
    const componentConfigs = isHarvester ? HARVESTER_COMPONENTS : TRACTOR_COMPONENTS

    const baseHours = asset.currentHours || rand(1500, 6000, 0)
    const sampleCount = 5

    for (const cfg of componentConfigs) {
      const lastChangeHours = baseHours - rand(150, 450, 0)
      const lastSampleDate = new Date(Date.now() - rand(5, 30, 0) * 24 * 60 * 60 * 1000)

      const component = await db.lubeComponent.create({
        data: {
          organizationId: org.id,
          assetId: asset.id,
          componentType: cfg.componentType,
          name: cfg.name,
          recommendedOil: cfg.recommendedOil,
          recommendedViscosity: cfg.recommendedViscosity,
          oilCapacityL: cfg.oilCapacityL,
          changeIntervalHours: cfg.changeIntervalHours,
          sampleIntervalHours: cfg.sampleIntervalHours,
          lastChangeHours,
          lastSampleDate,
          criticality: 'high',
          status: 'normal', // will update after samples
        },
      })
      totalComponents++

      // Assign scenarios — most normal, some caution/critical
      const roll = Math.random()
      const assetScenario: string = roll < 0.55 ? 'normal'
        : roll < 0.75 ? 'caution'
        : roll < 0.85 ? 'critical'
        : roll < 0.90 ? 'dust_contamination'
        : roll < 0.94 ? 'fuel_dilution'
        : roll < 0.97 ? 'coolant_contamination'
        : 'severe_wear'

      const historicalValues: SampleValues[] = []
      let worstStatus = 'normal'

      for (let s = 0; s < sampleCount; s++) {
        const isLatest = s === sampleCount - 1
        const sampleScenario = isLatest ? assetScenario as any : 'normal'
        const oilHours = rand(50, cfg.changeIntervalHours - 20, 0)
        const equipmentHours = baseHours - (sampleCount - 1 - s) * rand(200, 400, 0)
        const sampleDate = new Date(Date.now() - (sampleCount - s) * rand(45, 90, 0) * 24 * 60 * 60 * 1000)
        const analysisDate = new Date(sampleDate.getTime() + 5 * 24 * 60 * 60 * 1000)

        const labValues = generateLabValues(cfg.componentType, sampleScenario, oilHours)
        const result = diagnoseSample(cfg.componentType, labValues, historicalValues)
        historicalValues.push(labValues)

        if (['condemned', 'critical', 'caution'].indexOf(result.status) > ['condemned', 'critical', 'caution'].indexOf(worstStatus)) {
          worstStatus = result.status
        }

        const sample = await db.oilSample.create({
          data: {
            organizationId: org.id,
            assetId: asset.id,
            componentId: component.id,
            sampleDate,
            receivedDate: new Date(sampleDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            analysisDate,
            equipmentHours,
            oilHours,
            componentHours: equipmentHours,
            lab: 'Laboratorio POLARIS / IMECOL',
            externalReportNo: `LA-${asset.internalCode?.replace(/[^A-Z0-9]/gi, '')}-${Date.now()}-${s}`,
            status: result.status,
            overallDiagnosis: result.overallDiagnosis,
            recommendation: result.recommendation,
            ironFe: labValues.ironFe,
            copperCu: labValues.copperCu,
            aluminumAl: labValues.aluminumAl,
            chromeCr: labValues.chromeCr,
            leadPb: labValues.leadPb,
            siliconSi: labValues.siliconSi,
            sodiumNa: labValues.sodiumNa,
            potassiumK: labValues.potassiumK,
            pqIndex: labValues.pqIndex,
            tbn: labValues.tbn,
            viscosity40: labValues.viscosity40,
            waterPct: labValues.waterPct,
            fuelPct: labValues.fuelPct,
            oxidation: labValues.oxidation,
            soot: labValues.soot,
            glycolPpm: labValues.glycolPpm,
            zincZn: rand(800, 1200),
            phosphorusP: rand(700, 1100),
            calciumCa: rand(2000, 3000),
            magnesiumMg: rand(400, 700),
            molybdenumMo: rand(20, 80),
            isoParticleCode: cfg.componentType === 'hydraulic'
              ? `${rand(16, 20, 0)}/${rand(14, 18, 0)}/${rand(11, 15, 0)}`
              : undefined,
          },
        })
        totalSamples++

        // Create diagnoses
        for (const d of result.diagnoses) {
          await db.oilDiagnosis.create({
            data: {
              sampleId: sample.id,
              variable: d.variable,
              severity: d.severity,
              possibleCause: d.possibleCause,
              recommendation: d.recommendation,
              priority: d.priority,
              requiresOilChange: d.requiresOilChange,
              requiresInspection: d.requiresInspection,
              requiresStop: d.requiresStop,
              requiresResample: d.requiresResample,
              nextSampleHours: d.nextSampleHours,
            },
          })
          totalDiagnoses++
        }
      }

      // Update component status based on latest sample
      await db.lubeComponent.update({
        where: { id: component.id },
        data: { status: worstStatus },
      })
    }
  }

  console.log(`\n✅ LubeAnalyst seed completado:`)
  console.log(`   🔧 ${totalComponents} componentes lubricados`)
  console.log(`   🧪 ${totalSamples} muestras de aceite`)
  console.log(`   ⚠️  ${totalDiagnoses} diagnósticos generados`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
