/**
 * Cliente para la API del laboratorio de análisis de aceite.
 * Base URL + credenciales vienen de variables de entorno LAB_*.
 * Documentación: https://documenter.getpostman.com/view/3331849/2sA358emB7
 */

const BASE_URL = process.env.LAB_API_URL ?? 'https://1xl9bz3b44.execute-api.us-west-2.amazonaws.com/stg/api/v1'
const API_KEY  = process.env.LAB_API_KEY ?? ''
const TOKEN    = process.env.LAB_ACCESS_TOKEN ?? ''

// ─── API Types ────────────────────────────────────────────────────────────────

export interface LabResultRecord {
  NOMBRE_CLIENTE: string
  NOMBRE_OPERACION: string
  N_MUESTRA: string
  CORRELATIVO: string
  FECHA_MUESTREO: string
  FECHA_INGRESO: string
  FECHA_INFORME: string
  EDAD_COMPONENTE: string
  UNIDAD_EDAD_COMPONENTE: string
  EDAD_PRODUCTO: string
  UNIDAD_EDAD_PRODUCTO: string
  CANTIDAD_ADICIONADA: string
  PRODUCTO: string
  TIPO_PRODUCTO: string
  EQUIPO: string
  TIPO_EQUIPO: string
  MARCA_EQUIPO: string
  MODELO_EQUIPO: string
  COMPONENTE: string
  MARCA_COMPONENTE: string
  MODELO_COMPONENTE: string
  DESCRIPTOR_COMPONENTE: string
  ESTADO: string
  [key: string]: string  // 300+ parámetros analíticos dinámicos
}

export interface LabEquipmentRecord {
  ID_EQUIPO: string
  ID_CLIENTE: string
  NOMBRE_CLIENTE: string
  ID_OPERACION: string
  NOMBRE_OPERACION: string
  DESCRIPTOR: string
  MARCA: string
  MODELO: string
  ID_TIPO_EQUIPO: string
  NOMBRE_TIPO_EQUIPO: string
  COMPONENTES: string[]
  ESTADO: string
  IDENTIFICADOR: string
}

export interface LabComponentRecord {
  ID_COMPONENTE: string
  ID_CLIENTE: string
  NOMBRE_CLIENTE: string
  ID_OPERACION: string
  ID_EQUIPO: string
  DESCRIPTOR: string
  MARCA: string
  MODELO: string
  ID_TIPO_COMPONENTE: string
  NOMBRE_TIPO_COMPONENTE: string
  CLASE_COMPONENTE: string
  ID_PRODUCTO: string
  NOMBRE_PRODUCTO: string
  ESTADO: string
}

export interface LabApiResponse<T> {
  status: number
  message: string
  data: {
    records: T[]
    page_key: string | null
  }
}

export interface ResultQueryParams {
  clientId: string
  operationIds: string[]
  dateFrom: string   // YYYY-MM-DD
  dateTo: string     // YYYY-MM-DD
  dateType?: 'muestreo' | 'informe' | 'ingreso'
  components?: string[]
  statuses?: string[]
  pageKey?: string
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function labPost<T>(path: string, body: object): Promise<LabApiResponse<T>> {
  if (!API_KEY || !TOKEN) {
    throw new Error('LAB_API_KEY y LAB_ACCESS_TOKEN no configurados en .env.local')
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Lab API ${res.status}: ${text}`)
  }

  return res.json() as Promise<LabApiResponse<T>>
}

// ─── Fetch results (paginated) ────────────────────────────────────────────────

export async function fetchLabResults(params: ResultQueryParams): Promise<LabResultRecord[]> {
  const all: LabResultRecord[] = []
  let pageKey: string | null = params.pageKey ?? ''

  do {
    const body = {
      fecha: {
        tipo: params.dateType ?? 'muestreo',
        inicio: params.dateFrom,
        fin: params.dateTo,
      },
      cliente: params.clientId,
      operaciones: params.operationIds,
      componentes: params.components ?? [],
      estados: params.statuses ?? [],
      page_key: pageKey ?? '',
    }

    const res = await labPost<LabResultRecord>('/muestras/resultados', body)
    all.push(...res.data.records)
    pageKey = res.data.page_key
  } while (pageKey)

  return all
}

// ─── Fetch equipment list ─────────────────────────────────────────────────────

export async function fetchLabEquipment(clientId: string, operationIds: string[]): Promise<LabEquipmentRecord[]> {
  const all: LabEquipmentRecord[] = []
  let pageKey: string | null = ''

  do {
    const body = { entidad: 'equipo', cliente: clientId, operaciones: operationIds, page_key: pageKey ?? '' }
    const res = await labPost<LabEquipmentRecord>('/equipos_componentes', body)
    all.push(...res.data.records)
    pageKey = res.data.page_key
  } while (pageKey)

  return all
}

export async function fetchLabComponents(clientId: string, operationIds: string[]): Promise<LabComponentRecord[]> {
  const all: LabComponentRecord[] = []
  let pageKey: string | null = ''

  do {
    const body = { entidad: 'componente', cliente: clientId, operaciones: operationIds, page_key: pageKey ?? '' }
    const res = await labPost<LabComponentRecord>('/equipos_componentes', body)
    all.push(...res.data.records)
    pageKey = res.data.page_key
  } while (pageKey)

  return all
}

// ─── Test connection ──────────────────────────────────────────────────────────

export async function testLabConnection(clientId: string, operationIds: string[]): Promise<{
  ok: boolean
  message: string
  equipmentCount?: number
  sampleCount?: number
}> {
  try {
    const now = new Date()
    const from = new Date(now); from.setMonth(from.getMonth() - 1)
    const results = await fetchLabResults({
      clientId,
      operationIds,
      dateFrom: from.toISOString().slice(0, 10),
      dateTo: now.toISOString().slice(0, 10),
    })
    return { ok: true, message: 'Conexión exitosa', sampleCount: results.length }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) }
  }
}

// ─── Field mapping: API keys → OilSample DB fields ───────────────────────────

// Mapeo de parámetros analíticos. La clave es el prefijo del nombre en la API
// (antes del " - NNN"). La API tiene duplicados con distintos números; se toma
// el primero que tenga valor.
export const FIELD_MAP: Record<string, string> = {
  'HIERRO (ICP)':             'ironFe',
  'COBRE (ICP)':              'copperCu',
  'ALUMINIO (ICP)':           'aluminumAl',
  'CROMO (ICP)':              'chromeCr',
  'PLOMO (ICP)':              'leadPb',
  'ESTAÑO (ICP)':             'tinSn',
  'NIQUEL (ICP)':             'nickelNi',
  'SILICIO (ICP)':            'siliconSi',
  'SODIO (ICP)':              'sodiumNa',
  'POTASIO (ICP)':            'potassiumK',
  'BORO (ICP)':               'boronB',
  'MOLIBDENO (ICP)':          'molybdenumMo',
  'ZINC (ICP)':               'zincZn',
  'FOSFORO (ICP)':            'phosphorusP',
  'CALCIO (ICP)':             'calciumCa',
  'MAGNESIO (ICP)':           'magnesiumMg',
  'BARIO (ICP)':              'bariumBa',
  'ÍNDICE DE PQ (PQI)':       'pqIndex',
  'NÚMERO BÁSICO (TBN)':      'tbn',
  'NÚMERO ÁCIDO (TAN)':       'tan',
  'VISCOSIDAD A 40 °C':       'viscosity40',
  'VISCOSIDAD A 100 °C':      'viscosity100',
  'VISCOSIDAD 40 °C':         'viscosity40',
  'OXIDACIÓN 2412':           'oxidation',
  'NITRACIÓN 2412':           'nitration',
  'HOLLÍN':                   'soot',
  'HOLLÍN 2412':              'soot',
  'AGUA (IR)':                'waterPct',
  'AGUA 2412':                'waterPct',
  'DILUCION POR COMBUSTIBLE DIESEL':    'fuelPct',
  'DILUCION POR COMBUSTIBLE GASOLINA':  'fuelPct',
  'CONTENIDO DE GLICOL %':    'glycolPpm',
  'PUNTO DE CHISPA':          'flashPointC',
  'PH INICIAL (IPH)':         'coolantPh',
  'NITRITOS':                 'coolantNitritesPpm',
}

export function mapLabRecordToSample(rec: LabResultRecord): Record<string, number | null> {
  const result: Record<string, number | null> = {}

  // Track which DB fields already have a value to avoid overwriting with empty
  const filled = new Set<string>()

  for (const [apiKey, rawVal] of Object.entries(rec)) {
    if (!rawVal || rawVal === '') continue

    // API key format: "PARAMETER NAME - 123"
    const dashIdx = apiKey.lastIndexOf(' - ')
    if (dashIdx === -1) continue
    const paramName = apiKey.slice(0, dashIdx).trim()

    const dbField = FIELD_MAP[paramName]
    if (!dbField || filled.has(dbField)) continue

    const num = parseFloat(rawVal)
    if (!isNaN(num)) {
      result[dbField] = num
      filled.add(dbField)
    }
  }

  return result
}

// ─── Component type mapping ───────────────────────────────────────────────────

export function mapComponentType(tipoNombre: string): string {
  const t = tipoNombre.toUpperCase()
  if (t.includes('MOTOR')) return 'motor'
  if (t.includes('TRANSMIS') || t.includes('CAJA CAMBIO') || t.includes('CAJA DE VEL')) return 'transmission'
  if (t.includes('HIDRÁULICO') || t.includes('HIDRAULICO') || t.includes('CENTRAL HIDRÁULICA')) return 'hydraulic'
  if (t.includes('DIFERENCIAL')) return 'differential'
  if (t.includes('MANDO FINAL') || t.includes('PLANETARIO') || t.includes('REDUCTO')) return 'final_drive'
  if (t.includes('FRENO') || t.includes('BRAKE')) return 'brake_wet'
  if (t.includes('REFRIGERANTE') || t.includes('COOLANT')) return 'coolant'
  if (t.includes('COMBUSTIBLE') || t.includes('JET') || t.includes('DIESEL')) return 'fuel'
  return 'other'
}

// ─── Status mapping ───────────────────────────────────────────────────────────

export function mapLabStatus(estado: string): string {
  const s = estado.toLowerCase().trim()
  if (s === 'normal') return 'normal'
  if (s === 'alerta' || s === 'precaucion' || s === 'precaución') return 'caution'
  if (s === 'critico' || s === 'crítico' || s === 'critical') return 'critical'
  if (s === 'condenado' || s === 'condemned') return 'condemned'
  return 'normal'
}
