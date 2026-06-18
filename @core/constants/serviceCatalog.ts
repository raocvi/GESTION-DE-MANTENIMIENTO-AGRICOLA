// Agricultural machinery service catalog — CASE IH A9900 combines + PUMA tractors
// Based on manufacturer service manuals and field workshop best practices

export interface ServiceOption {
  value: string
  label: string
  estimatedHours: number
  type: 'preventive' | 'corrective' | 'inspection' | 'predictive'
}

export interface ComponentEntry {
  value: string
  label: string
  services: ServiceOption[]
}

export const SERVICE_CATALOG: ComponentEntry[] = [
  {
    value: 'motor',
    label: 'Motor',
    services: [
      { value: 'oil_filter',         label: 'Cambio de aceite y filtro de aceite',               estimatedHours: 2,   type: 'preventive'  },
      { value: 'fuel_filters',       label: 'Cambio de filtros de combustible (primario/secundario)', estimatedHours: 1.5, type: 'preventive'  },
      { value: 'air_filter',         label: 'Cambio de filtro de aire (primario y secundario)',    estimatedHours: 1,   type: 'preventive'  },
      { value: 'coolant_flush',      label: 'Cambio de refrigerante y purga del sistema',         estimatedHours: 3,   type: 'preventive'  },
      { value: 'radiator_clean',     label: 'Limpieza de radiador, intercooler y rejillas',        estimatedHours: 2,   type: 'preventive'  },
      { value: 'belt_tensioner',     label: 'Cambio de correas y tensores accesorios',            estimatedHours: 2,   type: 'preventive'  },
      { value: 'timing_chain',       label: 'Cambio de cadena de distribución y guías',           estimatedHours: 8,   type: 'preventive'  },
      { value: 'valve_adjustment',   label: 'Ajuste y calibración de válvulas',                   estimatedHours: 5,   type: 'preventive'  },
      { value: 'glow_plugs',         label: 'Cambio de bujías de precalentamiento',               estimatedHours: 2,   type: 'preventive'  },
      { value: 'crankshaft_damper',  label: 'Cambio de amortiguador de vibración (damper)',       estimatedHours: 3,   type: 'preventive'  },
      { value: 'water_pump',         label: 'Cambio de bomba de agua',                            estimatedHours: 4,   type: 'corrective'  },
      { value: 'oil_pump',           label: 'Cambio de bomba de aceite',                          estimatedHours: 5,   type: 'corrective'  },
      { value: 'turbo_inspection',   label: 'Inspección y limpieza de turbocompresor',            estimatedHours: 2,   type: 'inspection'  },
      { value: 'turbo_replace',      label: 'Cambio de turbocompresor',                           estimatedHours: 6,   type: 'corrective'  },
      { value: 'injector_service',   label: 'Desmontaje, prueba y calibración de inyectores',    estimatedHours: 5,   type: 'predictive'  },
      { value: 'injector_replace',   label: 'Cambio de inyectores',                              estimatedHours: 4,   type: 'corrective'  },
      { value: 'fuel_bleed',         label: 'Purgado del sistema de combustible',                 estimatedHours: 1,   type: 'corrective'  },
      { value: 'gasket_kit',         label: 'Cambio de kit de empaquetaduras (culata)',           estimatedHours: 12,  type: 'corrective'  },
      { value: 'compression_test',   label: 'Prueba de compresión de cilindros',                  estimatedHours: 2,   type: 'inspection'  },
      { value: 'ecu_diagnostic',     label: 'Diagnóstico electrónico / escáner ECU Motor',        estimatedHours: 2,   type: 'predictive'  },
      { value: 'engine_overhaul',    label: 'Reparación mayor (Overhaul completo) de motor',     estimatedHours: 48,  type: 'corrective'  },
    ],
  },
  {
    value: 'transmission',
    label: 'Transmisión',
    services: [
      { value: 'trans_oil',          label: 'Cambio de aceite de transmisión',                   estimatedHours: 2,   type: 'preventive'  },
      { value: 'trans_filter',       label: 'Cambio de filtro interno de transmisión',            estimatedHours: 3,   type: 'preventive'  },
      { value: 'trans_calibration',  label: 'Calibración electrónica Powershift / CVT',          estimatedHours: 2,   type: 'predictive'  },
      { value: 'trans_diagnostic',   label: 'Diagnóstico de fallas electrónicas de transmisión', estimatedHours: 2,   type: 'predictive'  },
      { value: 'trans_clutch',       label: 'Inspección y ajuste de embrague',                   estimatedHours: 6,   type: 'inspection'  },
      { value: 'trans_clutch_replace', label: 'Cambio de disco y plato de embrague',             estimatedHours: 8,   type: 'corrective'  },
      { value: 'trans_brake_discs',  label: 'Inspección de frenos de discos húmedos',            estimatedHours: 4,   type: 'inspection'  },
      { value: 'torque_converter',   label: 'Inspección y limpieza de convertidor de torque',    estimatedHours: 6,   type: 'inspection'  },
      { value: 'torque_replace',     label: 'Cambio de convertidor de torque',                   estimatedHours: 8,   type: 'corrective'  },
      { value: 'trans_seals',        label: 'Cambio de sellos y retenes de transmisión',         estimatedHours: 5,   type: 'corrective'  },
      { value: 'pto_oil',            label: 'Cambio de aceite de toma de fuerza (PTO)',           estimatedHours: 1,   type: 'preventive'  },
      { value: 'pto_inspection',     label: 'Inspección y ajuste del sistema PTO',               estimatedHours: 3,   type: 'inspection'  },
      { value: 'trans_overhaul',     label: 'Reparación mayor (Overhaul) de transmisión',        estimatedHours: 36,  type: 'corrective'  },
    ],
  },
  {
    value: 'hydraulic',
    label: 'Sistema Hidráulico',
    services: [
      { value: 'hyd_oil',            label: 'Cambio de aceite hidráulico',                       estimatedHours: 2,   type: 'preventive'  },
      { value: 'hyd_filters',        label: 'Cambio de filtros hidráulicos (retorno, presión, carga)', estimatedHours: 2, type: 'preventive' },
      { value: 'hyd_tank_clean',     label: 'Limpieza de tanque hidráulico y coladores',         estimatedHours: 3,   type: 'preventive'  },
      { value: 'hyd_pump_inspect',   label: 'Prueba y diagnóstico de bomba hidráulica',          estimatedHours: 2,   type: 'inspection'  },
      { value: 'hyd_pump_replace',   label: 'Cambio de bomba hidráulica',                        estimatedHours: 6,   type: 'corrective'  },
      { value: 'hyd_hoses',          label: 'Cambio de mangueras y conexiones hidráulicas',      estimatedHours: 3,   type: 'corrective'  },
      { value: 'hyd_valves',         label: 'Revisión, ajuste y calibración de válvulas de control', estimatedHours: 3, type: 'inspection' },
      { value: 'hyd_cylinder',       label: 'Reparación de cilindros hidráulicos',               estimatedHours: 6,   type: 'corrective'  },
      { value: 'hyd_steering',       label: 'Revisión sistema de dirección hidrostática',        estimatedHours: 3,   type: 'inspection'  },
      { value: 'hyd_sensors',        label: 'Calibración de sensores de presión hidráulica',     estimatedHours: 2,   type: 'predictive'  },
      { value: 'hyd_lift',           label: 'Calibración sistema de elevación hidráulico (Tractor)', estimatedHours: 2, type: 'preventive' },
      { value: 'hyd_accum',          label: 'Revisión y carga de acumuladores hidráulicos',      estimatedHours: 2,   type: 'inspection'  },
    ],
  },
  {
    value: 'final_drive',
    label: 'Mandos Finales',
    services: [
      { value: 'fd_oil',             label: 'Cambio de aceite de mandos finales',                estimatedHours: 1.5, type: 'preventive'  },
      { value: 'fd_inspection',      label: 'Inspección de engranajes planetarios y rueda motriz', estimatedHours: 3, type: 'inspection'  },
      { value: 'fd_seals',           label: 'Cambio de retenes y sellos de mandos finales',      estimatedHours: 4,   type: 'corrective'  },
      { value: 'fd_brake_discs',     label: 'Inspección y cambio de frenos de disco (mando final)', estimatedHours: 5, type: 'corrective' },
      { value: 'fd_bearing',         label: 'Cambio de rodamientos de mando final',              estimatedHours: 6,   type: 'corrective'  },
      { value: 'fd_overhaul',        label: 'Reparación mayor de mandos finales',                estimatedHours: 16,  type: 'corrective'  },
    ],
  },
  {
    value: 'differential',
    label: 'Diferencial / Ejes',
    services: [
      { value: 'diff_oil',           label: 'Cambio de aceite de diferencial',                   estimatedHours: 1.5, type: 'preventive'  },
      { value: 'diff_inspection',    label: 'Inspección de engranajes y corona del diferencial', estimatedHours: 4,   type: 'inspection'  },
      { value: 'diff_seals',         label: 'Cambio de retenes de diferencial y semiejes',       estimatedHours: 4,   type: 'corrective'  },
      { value: 'diff_lock',          label: 'Revisión y ajuste del bloqueo diferencial',         estimatedHours: 2,   type: 'corrective'  },
      { value: 'diff_overhaul',      label: 'Reparación mayor del diferencial',                  estimatedHours: 14,  type: 'corrective'  },
      { value: 'axle_replace',       label: 'Cambio de semieje o eje completo',                  estimatedHours: 6,   type: 'corrective'  },
    ],
  },
  {
    value: 'electrical',
    label: 'Sistema Eléctrico / Electrónico',
    services: [
      { value: 'elec_diagnostic',    label: 'Diagnóstico electrónico general (escáner AFS/ISOBUS)', estimatedHours: 2, type: 'predictive' },
      { value: 'battery',            label: 'Revisión y/o cambio de batería',                    estimatedHours: 1,   type: 'corrective'  },
      { value: 'alternator',         label: 'Revisión, prueba y/o cambio de alternador',         estimatedHours: 3,   type: 'corrective'  },
      { value: 'starter_motor',      label: 'Revisión y/o cambio de motor de arranque',          estimatedHours: 3,   type: 'corrective'  },
      { value: 'wiring_repair',      label: 'Reparación de arnés eléctrico y conectores',        estimatedHours: 4,   type: 'corrective'  },
      { value: 'sensor_calibration', label: 'Calibración y reemplazo de sensores y actuadores',  estimatedHours: 3,   type: 'predictive'  },
      { value: 'ecu_update',         label: 'Actualización de software ECU / AFS Pro 700',       estimatedHours: 2,   type: 'preventive'  },
      { value: 'lighting',           label: 'Revisión y reparación del sistema de iluminación',  estimatedHours: 2,   type: 'corrective'  },
      { value: 'fuse_relay',         label: 'Revisión y cambio de fusibles y relés',             estimatedHours: 1,   type: 'corrective'  },
      { value: 'connector_clean',    label: 'Limpieza, sellado y protección de conectores',      estimatedHours: 2,   type: 'preventive'  },
      { value: 'screen_cabin',       label: 'Reparación de pantalla y comandos de cabina',       estimatedHours: 2,   type: 'corrective'  },
    ],
  },
  {
    value: 'cutting_system',
    label: 'Sistema de Corte / Cabezal',
    services: [
      { value: 'blade_sharpen',      label: 'Afilado de cuchillas de corte',                     estimatedHours: 4,   type: 'preventive'  },
      { value: 'blade_replace',      label: 'Cambio de cuchillas de corte',                      estimatedHours: 3,   type: 'corrective'  },
      { value: 'header_adjust',      label: 'Ajuste de holguras y calibración de cabezal',       estimatedHours: 3,   type: 'preventive'  },
      { value: 'chain_tension',      label: 'Lubricación y tensado de cadenas de corte',         estimatedHours: 2,   type: 'preventive'  },
      { value: 'feed_rolls',         label: 'Inspección y cambio de rodillos alimentadores',     estimatedHours: 5,   type: 'corrective'  },
      { value: 'header_seals',       label: 'Cambio de desgastes (wear plates) de plataforma',  estimatedHours: 4,   type: 'corrective'  },
      { value: 'header_gearbox_oil', label: 'Cambio de aceite de caja del cabezal',              estimatedHours: 1,   type: 'preventive'  },
      { value: 'elevator_inspect',   label: 'Revisión del elevador de caña / maíz',              estimatedHours: 2,   type: 'inspection'  },
    ],
  },
  {
    value: 'threshing_system',
    label: 'Sistema de Trilla (Rotor / Cóncavos)',
    services: [
      { value: 'rotor_inspect',      label: 'Inspección del rotor axial y barras de trilla',     estimatedHours: 3,   type: 'inspection'  },
      { value: 'concave_adjust',     label: 'Ajuste y calibración de cóncavos',                  estimatedHours: 2,   type: 'preventive'  },
      { value: 'concave_replace',    label: 'Cambio de cóncavos',                                estimatedHours: 6,   type: 'corrective'  },
      { value: 'rotor_bars',         label: 'Cambio de barras y dientes del rotor',              estimatedHours: 8,   type: 'corrective'  },
      { value: 'cleaning_sieves',    label: 'Limpieza, inspección y ajuste de zarandas',         estimatedHours: 3,   type: 'preventive'  },
      { value: 'fan_adjust',         label: 'Ajuste y calibración del ventilador de limpieza',   estimatedHours: 2,   type: 'preventive'  },
      { value: 'thresher_bearings',  label: 'Cambio de rodamientos del sistema de trilla',       estimatedHours: 6,   type: 'corrective'  },
    ],
  },
  {
    value: 'track_system',
    label: 'Sistema de Rodado (Orugas)',
    services: [
      { value: 'track_tension',      label: 'Ajuste de tensión de cadena de rodado',             estimatedHours: 2,   type: 'preventive'  },
      { value: 'track_lubrication',  label: 'Lubricación del sistema de rodado y tensores',      estimatedHours: 1,   type: 'preventive'  },
      { value: 'track_replace',      label: 'Cambio de cadena de rodado (un lado)',              estimatedHours: 8,   type: 'corrective'  },
      { value: 'track_both',         label: 'Cambio de cadenas de rodado (ambos lados)',         estimatedHours: 14,  type: 'corrective'  },
      { value: 'idler_wheel',        label: 'Cambio de rueda guía (idler)',                      estimatedHours: 4,   type: 'corrective'  },
      { value: 'roller_replace',     label: 'Cambio de rodillos de apoyo (por unidad)',          estimatedHours: 2,   type: 'corrective'  },
      { value: 'drive_sprocket',     label: 'Inspección y cambio de rueda motriz (sprocket)',    estimatedHours: 5,   type: 'corrective'  },
    ],
  },
  {
    value: 'tires',
    label: 'Neumáticos / Ruedas',
    services: [
      { value: 'tire_pressure',      label: 'Revisión y ajuste de presión de neumáticos',        estimatedHours: 0.5, type: 'preventive'  },
      { value: 'tire_rotation',      label: 'Rotación de neumáticos',                            estimatedHours: 2,   type: 'preventive'  },
      { value: 'tire_replace_one',   label: 'Cambio de un neumático',                            estimatedHours: 2,   type: 'corrective'  },
      { value: 'tire_replace_all',   label: 'Cambio de juego completo de neumáticos',            estimatedHours: 6,   type: 'corrective'  },
      { value: 'wheel_alignment',    label: 'Alineación y convergencia de eje delantero',        estimatedHours: 2,   type: 'preventive'  },
      { value: 'ballast',            label: 'Ajuste de lastres (agua o ballast sólido)',          estimatedHours: 2,   type: 'preventive'  },
      { value: 'rim_inspect',        label: 'Inspección y reparación de rines',                  estimatedHours: 2,   type: 'inspection'  },
    ],
  },
  {
    value: 'air_conditioning',
    label: 'Aire Acondicionado / Cabina',
    services: [
      { value: 'ac_filters',         label: 'Cambio de filtros de cabina (recirculación + presurización)', estimatedHours: 1, type: 'preventive' },
      { value: 'ac_recharge',        label: 'Recarga de gas refrigerante R134a',                 estimatedHours: 2,   type: 'corrective'  },
      { value: 'ac_leak_test',       label: 'Prueba de hermeticidad y detección de fugas',       estimatedHours: 2,   type: 'inspection'  },
      { value: 'ac_compressor',      label: 'Revisión y/o cambio de compresor A/C',              estimatedHours: 4,   type: 'corrective'  },
      { value: 'ac_condenser',       label: 'Limpieza y revisión del condensador A/C',           estimatedHours: 2,   type: 'preventive'  },
      { value: 'ac_evaporator',      label: 'Limpieza del evaporador y carcasa de cabina',       estimatedHours: 3,   type: 'preventive'  },
      { value: 'cabin_seal',         label: 'Revisión de presurización y sellos de cabina',      estimatedHours: 2,   type: 'inspection'  },
    ],
  },
  {
    value: 'brakes',
    label: 'Sistema de Frenos',
    services: [
      { value: 'brake_inspect',      label: 'Inspección y medición del sistema de frenos',       estimatedHours: 2,   type: 'inspection'  },
      { value: 'brake_adjust',       label: 'Ajuste y nivelación de frenos (delantero/trasero)',  estimatedHours: 2,   type: 'preventive'  },
      { value: 'brake_fluid',        label: 'Cambio de fluido de frenos (DOT)',                  estimatedHours: 1.5, type: 'preventive'  },
      { value: 'brake_bleed',        label: 'Purga del sistema de frenos',                       estimatedHours: 1.5, type: 'corrective'  },
      { value: 'brake_discs',        label: 'Cambio de discos y pastillas de freno',             estimatedHours: 5,   type: 'corrective'  },
      { value: 'park_brake',         label: 'Ajuste y reparación del freno de parqueo',          estimatedHours: 2,   type: 'corrective'  },
    ],
  },
  {
    value: 'preventive_pm',
    label: 'Mantenimiento Preventivo General',
    services: [
      { value: 'pm_250h',            label: 'Mantenimiento preventivo 250 horas',                estimatedHours: 5,   type: 'preventive'  },
      { value: 'pm_500h',            label: 'Mantenimiento preventivo 500 horas',                estimatedHours: 8,   type: 'preventive'  },
      { value: 'pm_1000h',           label: 'Mantenimiento preventivo 1000 horas',               estimatedHours: 12,  type: 'preventive'  },
      { value: 'pm_2000h',           label: 'Mantenimiento preventivo 2000 horas (Overhaul general)', estimatedHours: 32, type: 'preventive' },
      { value: 'pre_season',         label: 'Revisión y alistamiento pre-cosecha / pre-temporada', estimatedHours: 10, type: 'preventive'  },
      { value: 'post_season',        label: 'Revisión post-cosecha / post-temporada y almacenamiento', estimatedHours: 8, type: 'preventive' },
      { value: 'operator_daily',     label: 'Inspección diaria del operador (ronda de turno)',   estimatedHours: 0.5, type: 'inspection'  },
      { value: 'warranty_service',   label: 'Servicio bajo garantía CASE IH',                   estimatedHours: 4,   type: 'preventive'  },
      { value: 'recall_campaign',    label: 'Campaña de fábrica (Recall / TSB)',                 estimatedHours: 3,   type: 'preventive'  },
      { value: 'predelivery',        label: 'Inspección pre-entrega (PDI)',                      estimatedHours: 6,   type: 'inspection'  },
    ],
  },
  {
    value: 'structural',
    label: 'Estructura / Chasis',
    services: [
      { value: 'visual_inspect',     label: 'Inspección visual estructural y de puntos de anclaje', estimatedHours: 2, type: 'inspection'  },
      { value: 'welding_repair',     label: 'Reparación y soldadura de estructura',              estimatedHours: 6,   type: 'corrective'  },
      { value: 'anticorrosion',      label: 'Tratamiento anticorrosivo y pintura',               estimatedHours: 4,   type: 'preventive'  },
      { value: 'hardware',           label: 'Apriete y cambio de pernos de anclaje (torque)',    estimatedHours: 2,   type: 'preventive'  },
    ],
  },
  {
    value: 'otros',
    label: 'Otros / No clasificado',
    services: [
      { value: 'other_general',      label: 'Servicio general no clasificado',                   estimatedHours: 2,   type: 'corrective'  },
      { value: 'other_inspection',   label: 'Inspección especial por solicitud del cliente',     estimatedHours: 2,   type: 'inspection'  },
      { value: 'other_adjustment',   label: 'Ajuste y regulación general',                       estimatedHours: 2,   type: 'preventive'  },
      { value: 'other_cleaning',     label: 'Limpieza general del equipo',                       estimatedHours: 3,   type: 'preventive'  },
      { value: 'other_diagnosis',    label: 'Diagnóstico de falla no identificada',              estimatedHours: 3,   type: 'inspection'  },
    ],
  },
]

export const COMPONENT_MAP = Object.fromEntries(SERVICE_CATALOG.map(c => [c.value, c]))
